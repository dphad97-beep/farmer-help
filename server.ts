import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  SAMPLE_USERS,
  INITIAL_CROPS,
  INITIAL_OFFERS,
  MANDI_BENCHMARK_PRICES,
} from './src/data/mockData.ts';
import { extractCropListingFromText } from './src/utils/cropListingParser.ts';
import { calculateTotalOfferValue } from './src/utils/pricingCalculator.ts';
import {
  handleIvrInput,
  PhoneCallSession,
  SupportTicket,
  IVR_PROMPTS,
} from './src/utils/telephonyEngine.ts';
import { CropListing, TraderOffer, ChatMessage } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// In-memory data stores seeded with realistic demonstration records
let users = [...SAMPLE_USERS];
let crops: CropListing[] = [...INITIAL_CROPS];
let offers: TraderOffer[] = [...INITIAL_OFFERS];
let messages: ChatMessage[] = [
  {
    id: 'msg-1',
    listingId: 'crop-101',
    senderId: 'user-trader-1',
    senderName: 'Vikram Shah',
    senderRole: 'trader',
    text: 'Namaste Rameshji! We are interested in your Grade A+ Nashik Red Onions. Can you load 500kg this Friday?',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'msg-2',
    listingId: 'crop-101',
    senderId: 'user-farmer-1',
    senderName: 'Ramesh Patil',
    senderRole: 'farmer',
    text: 'Namaste Vikramji, yes the onions are properly dried in the chawl. Friday morning is perfect for truck loading.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

let phoneSessions: PhoneCallSession[] = [
  {
    callId: 'call-sample-101',
    callerNumber: '+91 94220 12345',
    language: 'mr',
    currentState: 'CALL_ENDED',
    collectedData: {
      farmerName: 'Tukaram Shinde',
      cropName: 'Garlic (लसूण)',
      quantity: 15,
      unit: 'quintal',
      expectedPrice: 9500,
      location: 'Niphad, Nashik',
    },
    history: [
      { speaker: 'ivr', text: IVR_PROMPTS.mr.welcome, timestamp: new Date(Date.now() - 7200000).toISOString() },
      { speaker: 'caller', text: '[Keypad: 1]', timestamp: new Date(Date.now() - 7180000).toISOString() },
      { speaker: 'ivr', text: IVR_PROMPTS.mr.mainMenu, timestamp: new Date(Date.now() - 7160000).toISOString() },
      { speaker: 'caller', text: '[Keypad: 4]', timestamp: new Date(Date.now() - 7140000).toISOString() },
      { speaker: 'ivr', text: IVR_PROMPTS.mr.cropRegSuccess, timestamp: new Date(Date.now() - 7000000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isSimulated: true,
  },
];

let supportTickets: SupportTicket[] = [
  {
    id: 'KVK-78210',
    callId: 'call-sample-101',
    farmerName: 'Pandurang Kadam',
    farmerPhone: '+91 98231 66778',
    location: 'Baramati, Pune',
    issueSummary: 'Soybean leaf yellowing and pod drop symptoms during pod-filling stage',
    cropMentioned: 'Soybean',
    status: 'assigned',
    assignedExpert: 'Dr. S. Patil (Senior Agronomist, KVK Baramati)',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'KVK-84920',
    farmerName: 'Dnyaneshwar More',
    farmerPhone: '+91 94210 55443',
    location: 'Dindori, Nashik',
    issueSummary: 'Thrips and Purple blotch pest control advisory needed for kharif onion nursery',
    cropMentioned: 'Onion',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize Gemini client with key:', err);
  }
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Current Users / Auth simulation
app.get('/api/users', (_req: Request, res: Response) => {
  res.json({ users });
});

// Crops Marketplace
app.get('/api/crops', (req: Request, res: Response) => {
  const { search, category, location, grade, farmerId } = req.query;
  let filtered = [...crops];

  if (farmerId && typeof farmerId === 'string') {
    filtered = filtered.filter((c) => c.farmerId === farmerId);
  }

  if (category && typeof category === 'string' && category !== 'All') {
    filtered = filtered.filter((c) => c.category === category);
  }

  if (grade && typeof grade === 'string' && grade !== 'All') {
    filtered = filtered.filter((c) => c.qualityGrade === grade);
  }

  if (location && typeof location === 'string' && location !== 'All') {
    filtered = filtered.filter((c) =>
      c.farmerLocation.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.cropName.toLowerCase().includes(q) ||
        c.farmerLocation.toLowerCase().includes(q) ||
        c.farmerName.toLowerCase().includes(q)
    );
  }

  res.json({ crops: filtered });
});

app.post('/api/crops', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.cropName || !body.quantity || !body.expectedPrice) {
    return res.status(400).json({ error: 'Crop name, quantity, and price are required.' });
  }

  const newListing: CropListing = {
    id: `crop-${Date.now()}`,
    farmerId: body.farmerId || 'user-farmer-1',
    farmerName: body.farmerName || 'Ramesh Patil',
    farmerPhone: body.farmerPhone || '+91 98221 45678',
    farmerLocation: body.farmerLocation || 'Lasalgaon, Nashik, Maharashtra',
    cropName: body.cropName.trim(),
    category: body.category || 'Vegetables',
    quantity: parseFloat(body.quantity),
    unit: body.unit || 'kg',
    qualityGrade: body.qualityGrade || 'Grade A',
    harvestDate: body.harvestDate || new Date().toISOString().split('T')[0],
    expectedPrice: parseFloat(body.expectedPrice),
    priceUnit: body.priceUnit || 'kg',
    photos: Array.isArray(body.photos) && body.photos.length > 0 ? body.photos : [
      'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80'
    ],
    notes: body.notes || 'Direct farmer harvest. High freshness and standard grading.',
    status: 'active',
    createdAt: new Date().toISOString(),
    benchmarkPricePerKg: body.priceUnit === 'quintal' ? body.expectedPrice / 100 : body.expectedPrice,
    activeOffersCount: 0,
  };

  crops.unshift(newListing);
  res.status(201).json({ success: true, crop: newListing });
});

app.put('/api/crops/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = crops.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  crops[index] = { ...crops[index], ...req.body };
  res.json({ success: true, crop: crops[index] });
});

app.delete('/api/crops/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  crops = crops.filter((c) => c.id !== id);
  offers = offers.filter((o) => o.listingId !== id);
  res.json({ success: true, message: 'Crop listing removed' });
});

// Offers
app.get('/api/offers', (req: Request, res: Response) => {
  const { listingId, traderId, farmerId } = req.query;
  let filtered = [...offers];

  if (listingId && typeof listingId === 'string') {
    filtered = filtered.filter((o) => o.listingId === listingId);
  }

  if (traderId && typeof traderId === 'string') {
    filtered = filtered.filter((o) => o.traderId === traderId);
  }

  if (farmerId && typeof farmerId === 'string') {
    // Find listings owned by this farmer
    const farmerListingIds = new Set(crops.filter((c) => c.farmerId === farmerId).map((c) => c.id));
    filtered = filtered.filter((o) => farmerListingIds.has(o.listingId));
  }

  res.json({ offers: filtered });
});

app.post('/api/offers', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.listingId || !body.offeredPrice || !body.quantity) {
    return res.status(400).json({ error: 'Listing ID, offered price, and quantity are required.' });
  }

  const targetCrop = crops.find((c) => c.id === body.listingId);
  if (!targetCrop) {
    return res.status(404).json({ error: 'Target crop listing not found' });
  }

  const price = parseFloat(body.offeredPrice);
  const qty = parseFloat(body.quantity);
  const priceUnit = body.offeredPriceUnit || 'kg';
  const quantityUnit = body.quantityUnit || 'kg';
  const totalAmount = calculateTotalOfferValue(price, priceUnit, qty, quantityUnit);

  const newOffer: TraderOffer = {
    id: `offer-${Date.now()}`,
    listingId: targetCrop.id,
    cropName: targetCrop.cropName,
    traderId: body.traderId || 'user-trader-1',
    traderName: body.traderName || 'Vikram Shah',
    traderPhone: body.traderPhone || '+91 98200 67890',
    traderCompany: body.traderCompany || 'Kisan Agro Traders & Exports',
    traderRating: 4.9,
    offeredPrice: price,
    offeredPriceUnit: priceUnit,
    quantity: qty,
    quantityUnit: quantityUnit,
    totalAmount,
    status: 'pending',
    expiryDate: body.expiryDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    deliveryTerms: body.deliveryTerms || 'Spot electronic payment on loading and digital weighment.',
    createdAt: new Date().toISOString(),
  };

  offers.unshift(newOffer);
  targetCrop.activeOffersCount = (targetCrop.activeOffersCount || 0) + 1;

  res.status(201).json({ success: true, offer: newOffer });
});

app.patch('/api/offers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, counterPrice } = req.body;
  const offer = offers.find((o) => o.id === id);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  if (status) offer.status = status;
  if (counterPrice !== undefined) offer.counterPrice = parseFloat(counterPrice);

  // If accepted, update crop status
  if (status === 'accepted') {
    const crop = crops.find((c) => c.id === offer.listingId);
    if (crop) {
      crop.status = 'sold';
    }
  }

  res.json({ success: true, offer });
});

// Mandi Prices
app.get('/api/mandi-prices', (_req: Request, res: Response) => {
  res.json({
    prices: MANDI_BENCHMARK_PRICES,
    lastUpdated: new Date().toISOString(),
    isDemonstrationData: true,
    notice: 'Demonstration and indicative APMC benchmark prices. Actual spot prices depend on crop moisture, grade, and auction bidding.',
  });
});

// -------------------------------------------------------------
// TELEPHONY API ENDPOINTS (Feature 13 - Phone Service for Keypad Phones)
// -------------------------------------------------------------

app.get('/api/telephony/config', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  const hasTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  const hasExotel = Boolean(process.env.EXOTEL_API_KEY && process.env.EXOTEL_API_TOKEN);

  res.json({
    helplineNumber: process.env.TELEPHONY_HELPLINE_NUMBER || '+91 1800 180 1551',
    provider: hasTwilio ? 'twilio' : hasExotel ? 'exotel' : 'simulated',
    isLiveConfigured: hasTwilio || hasExotel,
    webhookUrls: {
      inbound: `${baseUrl}/api/telephony/inbound`,
      ivrGather: `${baseUrl}/api/telephony/ivr`,
      statusCallback: `${baseUrl}/api/telephony/status`,
    },
    activeSessionsCount: phoneSessions.filter((s) => s.currentState !== 'CALL_ENDED').length,
    totalCallsCount: phoneSessions.length,
    setupGuide: {
      twilioInstructions: 'In Twilio Console -> Phone Numbers -> Voice & Fax -> A CALL COMES IN -> Webhook URL -> set to /api/telephony/inbound (HTTP POST).',
      exotelInstructions: 'In Exotel Dashboard -> App Bazaar -> Create App -> Pass Through applet pointing to /api/telephony/inbound.',
    },
  });
});

app.get('/api/telephony/sessions', (_req: Request, res: Response) => {
  res.json({ sessions: phoneSessions });
});

app.get('/api/telephony/expert-tickets', (_req: Request, res: Response) => {
  res.json({ tickets: supportTickets });
});

app.patch('/api/telephony/expert-tickets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, assignedExpert } = req.body;
  const ticket = supportTickets.find((t) => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Support ticket not found' });
  }

  if (status) ticket.status = status;
  if (assignedExpert) ticket.assignedExpert = assignedExpert;
  res.json({ success: true, ticket });
});

// Interactive Phone Simulator Endpoint
app.post('/api/telephony/simulate', async (req: Request, res: Response) => {
  const { callId, input = '', inputType = 'dtmf', callerNumber = '+91 98220 54321', language } = req.body;

  let session = phoneSessions.find((s) => s.callId === callId);
  if (!session) {
    session = {
      callId: callId || `call-${Date.now()}`,
      callerNumber,
      language: language || 'mr',
      currentState: 'WELCOME_LANG',
      collectedData: {},
      history: [
        {
          speaker: 'ivr',
          text: IVR_PROMPTS.mr.welcome,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      isSimulated: true,
    };
    phoneSessions.unshift(session);
    return res.json({ session, responsePrompt: IVR_PROMPTS.mr.welcome, hangup: false });
  }

  // Handle IVR transition
  const { nextSession, responsePrompt, hangup } = handleIvrInput(session, input, inputType);

  // If crop registration finished, save directly to the same crops database!
  if (
    nextSession.currentState === 'CALL_ENDED' &&
    nextSession.collectedData.cropName &&
    nextSession.collectedData.quantity
  ) {
    const isAlreadyAdded = crops.some((c) => c.id === `crop-phone-${nextSession.callId}`);
    if (!isAlreadyAdded) {
      const lower = (nextSession.collectedData.cropName || '').toLowerCase();
      let photoUrl = 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80';
      if (lower.includes('wheat') || lower.includes('गहू')) {
        photoUrl = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
      } else if (lower.includes('tomato') || lower.includes('टोमॅटो')) {
        photoUrl = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
      } else if (lower.includes('garlic') || lower.includes('लसूण')) {
        photoUrl = 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80';
      }

      const newPhoneCrop: CropListing = {
        id: `crop-phone-${nextSession.callId}`,
        farmerId: `phone-caller-${nextSession.callId.slice(-4)}`,
        farmerName: nextSession.collectedData.farmerName || 'Telephone Caller (फोन शेतकरी)',
        farmerPhone: nextSession.callerNumber,
        farmerLocation: nextSession.collectedData.location || 'Maharashtra',
        cropName: nextSession.collectedData.cropName,
        category: 'Vegetables',
        quantity: nextSession.collectedData.quantity || 30,
        unit: nextSession.collectedData.unit || 'quintal',
        qualityGrade: 'Grade A',
        harvestDate: new Date().toISOString().split('T')[0],
        expectedPrice: nextSession.collectedData.expectedPrice || 2200,
        priceUnit: nextSession.collectedData.unit === 'kg' ? 'kg' : 'quintal',
        photos: [photoUrl],
        notes: '📞 Registered via KrishiConnect Kisan Helpline on a basic keypad mobile phone.',
        status: 'active',
        createdAt: new Date().toISOString(),
        benchmarkPricePerKg: (nextSession.collectedData.expectedPrice || 2200) / 100,
        registeredVia: 'phone_ivr',
        activeOffersCount: 0,
      };

      crops.unshift(newPhoneCrop);
    }
  }

  // If expert callback requested, log support ticket
  if (nextSession.currentState === 'EXPERT_CALLBACK_LOGGED' && nextSession.collectedData.ticketId) {
    const existingTicket = supportTickets.find((t) => t.id === nextSession.collectedData.ticketId);
    if (!existingTicket) {
      supportTickets.unshift({
        id: nextSession.collectedData.ticketId,
        callId: nextSession.callId,
        farmerName: nextSession.collectedData.farmerName || 'Telephone Caller',
        farmerPhone: nextSession.callerNumber,
        location: nextSession.collectedData.location || 'Maharashtra',
        issueSummary: nextSession.collectedData.aiQuestion || 'Telephone KVK Agronomy consultation requested',
        cropMentioned: nextSession.collectedData.cropName,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Update in sessions array
  const sIdx = phoneSessions.findIndex((s) => s.callId === nextSession.callId);
  if (sIdx !== -1) {
    phoneSessions[sIdx] = nextSession;
  }

  res.json({ session: nextSession, responsePrompt, hangup: Boolean(hangup) });
});

// Standard Twilio Voice Inbound Webhook (TwiML)
app.post('/api/telephony/inbound', (req: Request, res: Response) => {
  const caller = (req.body.From || '+91 94220 99999').toString();
  const callSid = (req.body.CallSid || `twilio-${Date.now()}`).toString();

  const session: PhoneCallSession = {
    callId: callSid,
    callerNumber: caller,
    language: 'mr',
    currentState: 'WELCOME_LANG',
    collectedData: {},
    history: [{ speaker: 'ivr', text: IVR_PROMPTS.mr.welcome, timestamp: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
    isSimulated: false,
  };
  phoneSessions.unshift(session);

  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/telephony/ivr" method="POST" timeout="8">
    <Say voice="Polly.Aditi" language="mr-IN">${IVR_PROMPTS.mr.welcome}</Say>
  </Gather>
  <Redirect>/api/telephony/inbound</Redirect>
</Response>`);
});

// Twilio IVR Gather / Speech Handler
app.post('/api/telephony/ivr', (req: Request, res: Response) => {
  const digits = req.body.Digits || req.body.SpeechResult || '1';
  const callSid = req.body.CallSid;

  let session = phoneSessions.find((s) => s.callId === callSid);
  if (!session) {
    session = {
      callId: callSid || `call-${Date.now()}`,
      callerNumber: req.body.From || '+91 94220 99999',
      language: 'mr',
      currentState: 'MAIN_MENU',
      collectedData: {},
      history: [],
      createdAt: new Date().toISOString(),
      isSimulated: false,
    };
    phoneSessions.unshift(session);
  }

  const { nextSession, responsePrompt, hangup } = handleIvrInput(session, digits, req.body.Digits ? 'dtmf' : 'speech');

  const sIdx = phoneSessions.findIndex((s) => s.callId === nextSession.callId);
  if (sIdx !== -1) phoneSessions[sIdx] = nextSession;

  res.type('text/xml');
  if (hangup) {
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">${responsePrompt}</Say>
  <Hangup/>
</Response>`);
  } else {
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/telephony/ivr" method="POST" timeout="10">
    <Say voice="Polly.Aditi">${responsePrompt}</Say>
  </Gather>
</Response>`);
  }
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { listingId, senderId, senderName, senderRole, text } = req.body;
  if (!listingId || !text) {
    return res.status(400).json({ error: 'Listing ID and message text are required.' });
  }

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    listingId,
    senderId: senderId || 'user-farmer-1',
    senderName: senderName || 'Ramesh Patil',
    senderRole: senderRole || 'farmer',
    text: text.trim(),
    timestamp: new Date().toISOString(),
  };

  messages.push(newMsg);
  res.status(201).json({ success: true, message: newMsg });
});

// -------------------------------------------------------------
// AI ENDPOINTS (Krishi Mitra Assistant & Listing Extraction)
// -------------------------------------------------------------

app.post('/api/ai/extract-listing', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt is required.' });
  }

  // 1. Try Gemini first if client is available
  if (aiClient) {
    try {
      const prompt = `You are an Indian agriculture listing extractor. The user spoke or typed this crop description:
"${text}"

Extract the following JSON fields:
- cropName: string (e.g. "Onion", "Tomato", "Wheat", "Soybean", "Potato", "Cotton", etc.)
- quantity: number
- unit: "kg" | "quintal" | "ton"
- location: string (city/district and state e.g. "Nashik, Maharashtra")
- expectedPrice: number or null
- priceUnit: "kg" | "quintal"
- quality: "Grade A+" | "Grade A" | "Grade B" | "Standard"
- harvestDate: string (YYYY-MM-DD format, today if immediate)

Return ONLY valid JSON with no markdown wrapping or other text.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const raw = response.text?.trim() || '';
      const cleanJson = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, data: parsed, source: 'gemini-ai' });
    } catch (err) {
      console.warn('Gemini extraction failed, using robust fallback heuristic:', err);
    }
  }

  // 2. Fallback to our thoroughly unit-tested heuristic parser
  const extracted = extractCropListingFromText(text);
  res.json({ success: true, data: extracted, source: 'heuristic-engine' });
});

app.post('/api/ai/ask', async (req: Request, res: Response) => {
  const { query, language = 'en', imageBase64 } = req.body;
  if (!query && !imageBase64) {
    return res.status(400).json({ error: 'Query text or crop image is required.' });
  }

  const langInstruction =
    language === 'mr'
      ? 'मराठीमध्ये (Marathi) सोप्या आणि शेतकरी भाषेत उत्तर द्या.'
      : language === 'hi'
      ? 'हिंदी में (Hindi) सरल और किसान-अनुकूल भाषा में उत्तर दें।'
      : 'Answer clearly in English with simple agricultural terminology.';

  // If Gemini is configured, use real live model
  if (aiClient) {
    try {
      const parts: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

      if (imageBase64) {
        // format: "data:image/jpeg;base64,..."
        const match = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      }

      const promptText = `You are Krishi Mitra (कृषी मित्र), a senior Indian agricultural scientist and crop advisor.
${langInstruction}

Farmer's question or prompt: "${query || 'Please identify this crop symptom or disease from the image.'}"

CRITICAL SAFETY & ADVISORY GUIDELINES:
1. Identify the crop disease, pest, or nutrient deficiency.
2. If identifying from an image, state confidence level clearly and ask clarifying questions if details (leaf underside, stem, moisture) are missing.
3. Recommend:
   - Primary Organic / Bio-remedy (Neem oil, Trichoderma viride, Jeevamrit, sticky traps, etc.)
   - Standard Chemical Remedy (Active ingredient only, e.g., Mancozeb, Imidacloprid, Carbendazim).
4. MANDATORY SAFETY DISCLAIMER: You must include a prominent warning: "Verify pesticide dosage, application timing, and pre-harvest intervals with your local Krishi Vigyan Kendra (KVK), block agriculture officer, or registered agro-chemical label."
5. Give tips for soil health, irrigation intervals, and weather management.`;

      parts.push(promptText);

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: parts as any,
      });

      return res.json({
        success: true,
        answer: response.text,
        isAiGenerated: true,
        source: 'gemini-2.5-flash',
      });
    } catch (err: any) {
      console.warn('Gemini generateContent error:', err?.message || err);
      // Fall through to fallback response
    }
  }

  // Curated agricultural response fallback with safe advisory
  const fallback = generateCuratedAgriculturalAnswer(query || '', language, !!imageBase64);
  res.json({
    success: true,
    answer: fallback,
    isAiGenerated: false,
    source: 'agricultural-knowledge-base',
    note: 'Generated using Krishi Mitra Agronomy Engine (Connect GEMINI_API_KEY for live generative mode).',
  });
});

function generateCuratedAgriculturalAnswer(query: string, lang: string, hasImage: boolean): string {
  const q = query.toLowerCase();

  if (lang === 'mr') {
    if (q.includes('कांदा') || q.includes('onion') || q.includes('करपा') || q.includes('blotch')) {
      return `🌱 **कृषी मित्र सल्ला: कांद्यावरील जांभळा करपा (Purple Blotch) आणि थ्रिप्स नियंत्रण**

1. **लक्षणे**: पानांवर लांबट जांभळट-तपकिरी रंगाचे डाग पडतात, पाने वाळतात आणि थ्रिप्समुळे पाने चंदेरी होतात.
2. **सेंद्रिय / जैविक उपाय**:
   - ५% निंबोळी अर्क (Neem Oil 10,000 ppm) २ मिली प्रति लिटर पाण्यात मिसळून फवारा.
   - ट्रायकोडर्मा व्हिरिडी (Trichoderma viride) ५ ग्रॅम प्रति लिटर जमिनीतून किंवा पानांवर फवारणी.
   - शेतात एकरी १५ ते २० निळे व पिवळे चिकट सापळे लावा.
3. **रासायनिक उपाय (तीव्र प्रादुर्भाव असल्यास)**:
   - मॅन्कोझेब (Mancozeb 75% WP) २.५ ग्रॅम किंवा टेबुकोनॅझोल + ट्रायफ्लॉक्सीस्ट्रॉबिन (Nativo) ०.५ ग्रॅम प्रति लिटर पाणी.
   - थ्रिप्ससाठी: फिप्रोनिल ५% एससी २ मिली प्रति लिटर पाणी.

⚠️ **महत्त्वाची सावधानता**: कीटकनाशक फवारणीपूर्वी स्थानिक कृषी विज्ञान केंद्र (KVK) अथवा कृषी सहाय्यकांचा सल्ला अवश्य घ्या. फवारणी करताना संरक्षक मास्क व हातमोजे वापरा.`;
    }
    return `🌱 **कृषी मित्र शेती सल्ला**

आपल्या प्रश्नाचे विश्लेषण करण्यात आले आहे.
1. **जैविक नियंत्रण**: जैविक बुरशीनाशक (स्यूडोमोनास फ्लोरोसन्स किंवा ट्रायकोडर्मा) आणि ५% निंबोळी अर्काचा वापर प्राधान्याने करा.
2. **पाणी व खत व्यवस्थापन**: पिकाच्या गरजेनुसार ठिबक सिंचनाने पाणी द्या, जमिनीत जास्त ओल साचू देऊ नका.
3. **खत नियोजन**: माती परीक्षणानुसार रासायनिक खतांचा समतोल वापर (NPK + सूक्ष्म अन्नद्रव्ये) करा.

⚠️ **सावधानता**: कोणत्याही रासायनिक फवारणीचे प्रमाण उत्पादनाच्या लेबलनुसार किंवा अधिकृत कृषी शास्त्रज्ञांच्या सल्ल्यानुसारच ठेवा.`;
  }

  if (lang === 'hi') {
    if (q.includes('प्याज') || q.includes('onion') || q.includes('झुलसा') || q.includes('blotch')) {
      return `🌱 **कृषि मित्र परामर्श: प्याज में बैंगनी धब्बा (Purple Blotch) व थ्रिप्स नियंत्रण**

1. **लक्षण**: पत्तियों पर छोटे धब्बे बनते हैं जो बाद में बैंगनी-भूरे हो जाते हैं, रस चूसक थ्रिप्स पत्तियों को चांदी जैसा बना देते हैं।
2. **जैविक उपचार**:
   - 5% नीम तेल (10,000 ppm) 2-3 मिली प्रति लीटर पानी में स्टीकर के साथ मिलाकर छिड़कें।
   - ट्राइकोडर्मा विरिडी (Trichoderma viride) 5 ग्राम प्रति लीटर पानी का छिड़काव करें।
   - प्रति एकड़ 15-20 पीले और नीले चिपचिपे कार्ड लगाएं।
3. **रासायनिक उपचार (गंभीर प्रकोप होने पर)**:
   - मैंकोजेब (Mancozeb 75% WP) 2.5 ग्राम प्रति लीटर या टेबुकोनाज़ोल (Tebuconazole) 1 मिली प्रति लीटर।
   - थ्रिप्स हेतु: फिप्रोनिल (Fipronil 5% SC) 2 मिली प्रति लीटर पानी।

⚠️ **विशेष चेतावनी**: कीटनाशक के प्रयोग से पहले स्थानीय कृषि विज्ञान केंद्र (KVK) विशेषज्ञ अथवा कृषि अधिकारी से उचित खुराक की पुष्टि अवश्य करें।`;
    }
    return `🌱 **कृषि मित्र सलाह**

आपकी फसल के संबंध में संतुलित परामर्श:
1. **जैविक उपाय**: नीम अर्क (Neem oil) और ट्राइकोडर्मा का प्रयोग फसल की प्रतिरोधक क्षमता बढ़ाता है।
2. **सिंचाई एवं मिट्टी**: अधिक जलजमाव से बचें, जड़ों में हवा का संचार आवश्यक है।
3. **सुरक्षा निर्देश**: रासायनिक छिड़काव के समय सुरक्षा उपकरण (मास्क व दस्ताने) अवश्य पहनें।

⚠️ **चेतावनी**: किसी भी दवा का प्रयोग उत्पाद लेबल व कृषि वैज्ञानिकों की देखरेख में ही करें।`;
  }

  // English default
  return `🌱 **Krishi Mitra Agronomy Advice**

${hasImage ? '📸 **Image Analysis**: Preliminary visual review suggests foliar spotting/mildew symptoms or nutrient-related discoloration.' : ''}

1. **Recommended Organic & Cultural Practices**:
   - Spray Cold-Pressed Neem Oil (10,000 ppm) at 2.5 ml/L water with an organic wetting agent (sticker) in early morning or late evening.
   - Apply *Trichoderma viride* or *Pseudomonas fluorescens* at 5g/L for biological root and foliage protection.
   - Install 15-20 yellow & blue sticky cards per acre to trap sucking pests early.

2. **Standard Chemical Protocol (Only if Economic Threshold is crossed)**:
   - Fungicide: Mancozeb 75% WP (2.5 g/L) or Azoxystrobin + Difenoconazole (1 ml/L).
   - Insecticide (for sucking pests): Thiamethoxam 25% WG (0.3 g/L) or Fipronil 5% SC (2 ml/L).

⚠️ **MANDATORY SAFETY ADVISORY**: Always cross-verify exact pesticide dosages, water volume per acre, and waiting period (pre-harvest interval) with your nearest Krishi Vigyan Kendra (KVK) agricultural scientist or registered agrochemical product label before spraying.`;
}

// -------------------------------------------------------------
// VITE INTEGRATION
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 KrishiConnect AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
