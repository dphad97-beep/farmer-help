export type TelephonyLanguage = 'mr' | 'hi' | 'en';

export type CallState =
  | 'WELCOME_LANG'
  | 'MAIN_MENU'
  | 'AI_ADVICE_PROMPT'
  | 'AI_ADVICE_ANSWER'
  | 'DISEASE_REPORT'
  | 'MANDI_PRICE_SELECT'
  | 'CROP_REG_NAME'
  | 'CROP_REG_CROP'
  | 'CROP_REG_QTY'
  | 'CROP_REG_PRICE'
  | 'CROP_REG_LOCATION'
  | 'CROP_REG_CONFIRM'
  | 'EXPERT_CALLBACK_LOGGED'
  | 'CALL_ENDED';

export interface PhoneCallSession {
  callId: string;
  callerNumber: string;
  language: TelephonyLanguage;
  currentState: CallState;
  previousState?: CallState;
  collectedData: {
    farmerName?: string;
    cropName?: string;
    quantity?: number;
    unit?: 'kg' | 'quintal' | 'ton';
    expectedPrice?: number;
    location?: string;
    aiQuestion?: string;
    aiAnswer?: string;
    ticketId?: string;
  };
  history: Array<{
    speaker: 'ivr' | 'caller';
    text: string;
    timestamp: string;
  }>;
  createdAt: string;
  isSimulated: boolean;
}

export interface SupportTicket {
  id: string;
  callId?: string;
  farmerName: string;
  farmerPhone: string;
  location: string;
  issueSummary: string;
  cropMentioned?: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  assignedExpert?: string;
  createdAt: string;
}

export const IVR_PROMPTS: Record<TelephonyLanguage, Record<string, string>> = {
  mr: {
    welcome:
      'कृषी कनेक्ट किसान हेल्पलाइन मध्ये आपले स्वागत आहे. मराठीसाठी १ दाबा. हिंदी के लिए २ दबाएं. For English press 3.',
    mainMenu:
      'मुख्य मेनू: कृषी मित्र AI सल्ल्यासाठी १ दाबा. पीक रोग किंवा कीड समस्येसाठी २ दाबा. आजचे बाजारभाव जाणून घेण्यासाठी ३ दाबा. पीक विक्रीसाठी फोनवर नोंदणी करण्यासाठी ४ दाबा. कृषी तज्ज्ञांशी कॉलबॅकसाठी ५ दाबा. मेनू पुन्हा ऐकण्यासाठी स्टार (*) दाबा.',
    aiPrompt: 'आपल्या पिकाबद्दल किंवा समस्येबद्दल बोला. बोलून झाल्यावर हॅश (#) दाबा किंवा थांबा.',
    cropRegStart:
      'पीक विक्री नोंदणी: आपण आपल्या साध्या फोनवरून पीक नोंदवू शकता. आपले नाव बोला किंवा टाईप करा.',
    cropRegCropPrompt: 'आपल्या पिकाचे नाव सांगा, जसे की कांदा, टोमॅटो, गहू, किंवा सोयाबीन.',
    cropRegQtyPrompt: 'आपल्याकडे किती माल उपलब्ध आहे? अंदाजे क्विंटल किंवा किलो मध्ये सांगा.',
    cropRegPricePrompt: 'आपल्याला प्रति क्विंटल किंवा प्रति किलो किती अपेक्षित भाव हवा आहे?',
    cropRegLocationPrompt: 'आपले गाव आणि जिल्हा सांगा, जसे की लासलगाव नाशिक किंवा जुन्नर पुणे.',
    cropRegConfirm:
      'नोंदणी तपशील: पीक {crop}, प्रमाण {qty} {unit}, अपेक्षित भाव ₹{price}, ठिकाण {location}. नोंदणी निश्चित करण्यासाठी १ दाबा, बदल करण्यासाठी २ दाबा.',
    cropRegSuccess:
      'अभिनंदन! आपले पीक कृषी कनेक्ट बाजारपेठेत यशस्वीरित्या नोंदवले गेले आहे. खरेदीदार व्यापारी आपल्याला थेट फोन करतील.',
    expertPrompt:
      'आपली विनंती कृषी विज्ञान केंद्र (KVK) तज्ज्ञांकडे नोंदवली आहे. आपला संदर्भ क्रमांक {ticketId} आहे. तज्ज्ञ लवकरच आपल्याला फोन करतील.',
    invalidOption: 'अवैध पर्याय. कृपया योग्य बटण दाबा.',
    goodbye: 'कृषी कनेक्ट हेल्पलाइनशी संपर्क केल्याबद्दल धन्यवाद. आपला दिवस शुभ जावो!',
  },
  hi: {
    welcome:
      'कृषि कनेक्ट किसान हेल्पलाइन में आपका स्वागत है। मराठीसाठी १ दाबा। हिंदी के लिए २ दबाएं। For English press 3.',
    mainMenu:
      'मुख्य मेनू: कृषि मित्र AI सलाह के लिए १ दबाएं। फसल रोग या कीट समस्या के लिए २ दबाएं। आज के मंडी भाव जानने के लिए ३ दबाएं। फसल बिक्री हेतु फोन पर दर्ज करने के लिए ४ दबाएं। कृषि विशेषज्ञ से बातचीत के लिए ५ दबाएं। मेनू दोबारा सुनने के लिए स्टार (*) दबाएं।',
    aiPrompt: 'अपनी फसल या समस्या के बारे में बोलें। बोलने के बाद हैश (#) दबाएं।',
    cropRegStart:
      'फसल बिक्री पंजीकरण: आप साधारण फोन से अपनी उपज दर्ज कर सकते हैं। अपना नाम बोलें या दर्ज करें।',
    cropRegCropPrompt: 'अपनी फसल का नाम बताएं, जैसे प्याज, टमाटर, गेहूं, या सोयाबीन।',
    cropRegQtyPrompt: 'आपके पास कितनी मात्रा उपलब्ध है? क्विंटल या किलो में बताएं।',
    cropRegPricePrompt: 'आपको प्रति क्विंटल या प्रति किलो क्या भाव चाहिए?',
    cropRegLocationPrompt: 'अपना गांव और जिला बताएं, जैसे इंदौर मध्य प्रदेश या नासिक महाराष्ट्र।',
    cropRegConfirm:
      'विवरण: फसल {crop}, मात्रा {qty} {unit}, अपेक्षित भाव ₹{price}, स्थान {location}। पुष्टि करने हेतु १ दबाएं, बदलाव के लिए २ दबाएं।',
    cropRegSuccess:
      'बधाई! आपकी फसल कृषि कनेक्ट मंडी में सफलतापूर्वक दर्ज हो गई है। व्यापारी आपसे सीधे फोन पर संपर्क करेंगे।',
    expertPrompt:
      'आपका अनुरोध कृषि विशेषज्ञ (KVK) को भेजा गया है। आपका टोकन नंबर {ticketId} है। विशेषज्ञ जल्द आपको कॉल करेंगे।',
    invalidOption: 'अमान्य विकल्प। कृपया सही बटन दबाएं।',
    goodbye: 'कृषि कनेक्ट हेल्पलाइन से जुड़ने के लिए धन्यवाद। आपका दिन शुभ हो!',
  },
  en: {
    welcome:
      'Welcome to KrishiConnect Kisan Helpline. Press 1 for Marathi. Press 2 for Hindi. Press 3 for English.',
    mainMenu:
      'Main Menu: Press 1 for AI Farming Advisory. Press 2 to report crop disease. Press 3 for Mandi market prices. Press 4 to register crops for sale by phone. Press 5 to request a callback from a human agricultural expert. Press star (*) to repeat.',
    aiPrompt: 'Please speak your farming question clearly. Press hash (#) or pause when finished.',
    cropRegStart:
      'Crop Registration: You can register produce using any basic keypad phone. Please state your name.',
    cropRegCropPrompt: 'Please state your crop name, such as Onion, Wheat, Tomato, or Soybean.',
    cropRegQtyPrompt: 'How much quantity do you have? State in quintals or kilograms.',
    cropRegPricePrompt: 'What expected price do you want per quintal or per kilogram?',
    cropRegLocationPrompt: 'State your village and district, such as Lasalgaon, Nashik or Khanna, Punjab.',
    cropRegConfirm:
      'Summary: Crop {crop}, Quantity {qty} {unit}, Expected Price ₹{price}, Location {location}. Press 1 to confirm and publish, or press 2 to edit.',
    cropRegSuccess:
      'Congratulations! Your produce is now live on the KrishiConnect marketplace. Verified traders can now call you directly.',
    expertPrompt:
      'Your agricultural support ticket has been created with reference number {ticketId}. A certified agronomist will call you shortly.',
    invalidOption: 'Invalid option selected. Please press a valid key.',
    goodbye: 'Thank you for calling KrishiConnect Helpline. Have a prosperous harvest!',
  },
};

/**
 * Pure function: handles DTMF keypad or voice intent in call state machine
 */
export function handleIvrInput(
  session: PhoneCallSession,
  input: string,
  inputType: 'dtmf' | 'speech'
): { nextSession: PhoneCallSession; responsePrompt: string; hangup?: boolean } {
  const currentLang = session.language;
  const prompts = IVR_PROMPTS[currentLang];
  const cleaned = input.trim();

  const nextSession: PhoneCallSession = JSON.parse(JSON.stringify(session));

  // Log caller input
  nextSession.history.push({
    speaker: 'caller',
    text: inputType === 'dtmf' ? `[Keypad: ${cleaned}]` : `"${cleaned}"`,
    timestamp: new Date().toISOString(),
  });

  // Global repeat command
  if (cleaned === '*') {
    const repeatPrompt =
      nextSession.currentState === 'WELCOME_LANG'
        ? IVR_PROMPTS.mr.welcome
        : prompts.mainMenu;
    nextSession.history.push({
      speaker: 'ivr',
      text: repeatPrompt,
      timestamp: new Date().toISOString(),
    });
    return { nextSession, responsePrompt: repeatPrompt };
  }

  switch (nextSession.currentState) {
    case 'WELCOME_LANG': {
      if (cleaned === '1') {
        nextSession.language = 'mr';
        nextSession.currentState = 'MAIN_MENU';
        const p = IVR_PROMPTS.mr.mainMenu;
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      } else if (cleaned === '2') {
        nextSession.language = 'hi';
        nextSession.currentState = 'MAIN_MENU';
        const p = IVR_PROMPTS.hi.mainMenu;
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      } else if (cleaned === '3') {
        nextSession.language = 'en';
        nextSession.currentState = 'MAIN_MENU';
        const p = IVR_PROMPTS.en.mainMenu;
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      }
      return { nextSession, responsePrompt: prompts.welcome };
    }

    case 'MAIN_MENU': {
      if (cleaned === '1' || cleaned.toLowerCase().includes('advice') || cleaned.includes('सल्ला')) {
        nextSession.currentState = 'AI_ADVICE_PROMPT';
        const p = prompts.aiPrompt;
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      }

      if (cleaned === '2' || cleaned.toLowerCase().includes('disease') || cleaned.includes('रोग')) {
        nextSession.currentState = 'AI_ADVICE_PROMPT';
        const p = prompts.aiPrompt;
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      }

      if (cleaned === '3' || cleaned.toLowerCase().includes('mandi') || cleaned.includes('भाव')) {
        nextSession.currentState = 'MAIN_MENU';
        const p =
          currentLang === 'mr'
            ? 'आजचे प्रमुख बाजारभाव: लासलगाव कांदा ₹२२५० प्रति क्विंटल, नारायणगाव टोमॅटो ₹१७००, खन्ना गहू ₹२७५०, इंदूर सोयाबीन ₹४५००. मुख्य मेनूसाठी १ दाबा किंवा पुन्हा ऐकण्यासाठी स्टार दाबा.'
            : currentLang === 'hi'
            ? 'आज के प्रमुख मंडी भाव: लासलगांव प्याज ₹२२५० प्रति क्विंटल, नारायणगांव टमाटर ₹१७००, खन्ना गेहूं ₹२७५०, इंदौर सोयाबीन ₹४५००। मुख्य मेनू के लिए १ दबाएं।'
            : 'Today benchmark prices: Lasalgaon Onion ₹2250/Qtl, Narayangaon Tomato ₹1700, Khanna Wheat ₹2750, Indore Soybean ₹4500. Press * to repeat or 0 for main menu.';
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      }

      if (cleaned === '4' || cleaned.toLowerCase().includes('register') || cleaned.includes('नोंदणी')) {
        nextSession.currentState = 'CROP_REG_NAME';
        const p = prompts.cropRegStart;
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      }

      if (cleaned === '5' || cleaned.toLowerCase().includes('expert') || cleaned.includes('तज्ज्ञ')) {
        nextSession.currentState = 'EXPERT_CALLBACK_LOGGED';
        const ticketId = `KVK-${Math.floor(10000 + Math.random() * 90000)}`;
        nextSession.collectedData.ticketId = ticketId;
        const p = prompts.expertPrompt.replace('{ticketId}', ticketId);
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      }

      if (cleaned === '6') {
        const p =
          currentLang === 'mr'
            ? 'आपला कॉल कृषी सहाय्यता कक्षाशी जोडला जात आहे. कृपया प्रतीक्षा करा...'
            : currentLang === 'hi'
            ? 'आपका कॉल किसान सेवा केंद्र से जोड़ा जा रहा है। कृपया प्रतीक्षा करें...'
            : 'Connecting your call to Kisan Customer Care. Please hold...';
        nextSession.currentState = 'CALL_ENDED';
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      }

      return { nextSession, responsePrompt: prompts.invalidOption + ' ' + prompts.mainMenu };
    }

    case 'CROP_REG_NAME': {
      nextSession.collectedData.farmerName = cleaned || 'Kisan Caller';
      nextSession.currentState = 'CROP_REG_CROP';
      const p = prompts.cropRegCropPrompt;
      nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
      return { nextSession, responsePrompt: p };
    }

    case 'CROP_REG_CROP': {
      nextSession.collectedData.cropName = cleaned || 'Onion';
      nextSession.currentState = 'CROP_REG_QTY';
      const p = prompts.cropRegQtyPrompt;
      nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
      return { nextSession, responsePrompt: p };
    }

    case 'CROP_REG_QTY': {
      const match = cleaned.match(/(\d+(?:\.\d+)?)/);
      nextSession.collectedData.quantity = match ? parseFloat(match[1]) : 50;
      nextSession.collectedData.unit = cleaned.toLowerCase().includes('kilo') || cleaned.toLowerCase().includes('kg') ? 'kg' : 'quintal';
      nextSession.currentState = 'CROP_REG_PRICE';
      const p = prompts.cropRegPricePrompt;
      nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
      return { nextSession, responsePrompt: p };
    }

    case 'CROP_REG_PRICE': {
      const match = cleaned.match(/(\d+(?:\.\d+)?)/);
      nextSession.collectedData.expectedPrice = match ? parseFloat(match[1]) : 2200;
      nextSession.currentState = 'CROP_REG_LOCATION';
      const p = prompts.cropRegLocationPrompt;
      nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
      return { nextSession, responsePrompt: p };
    }

    case 'CROP_REG_LOCATION': {
      nextSession.collectedData.location = cleaned || 'Lasalgaon, Nashik';
      nextSession.currentState = 'CROP_REG_CONFIRM';
      const p = prompts.cropRegConfirm
        .replace('{crop}', nextSession.collectedData.cropName || 'Onion')
        .replace('{qty}', String(nextSession.collectedData.quantity || 50))
        .replace('{unit}', nextSession.collectedData.unit || 'quintal')
        .replace('{price}', String(nextSession.collectedData.expectedPrice || 2200))
        .replace('{location}', nextSession.collectedData.location || 'Nashik');
      nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
      return { nextSession, responsePrompt: p };
    }

    case 'CROP_REG_CONFIRM': {
      if (cleaned === '1' || cleaned.toLowerCase().includes('yes') || cleaned.includes('होय')) {
        nextSession.currentState = 'CALL_ENDED';
        const p = prompts.cropRegSuccess + ' ' + prompts.goodbye;
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p, hangup: true };
      } else {
        nextSession.currentState = 'CROP_REG_CROP';
        const p = prompts.cropRegCropPrompt;
        nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
        return { nextSession, responsePrompt: p };
      }
    }

    case 'AI_ADVICE_PROMPT': {
      nextSession.collectedData.aiQuestion = cleaned;
      nextSession.currentState = 'AI_ADVICE_ANSWER';
      const answer =
        currentLang === 'mr'
          ? 'कृषी मित्र सल्ला: कांद्यावरील करपा आणि थ्रिप्स नियंत्रणासाठी ५% निंबोळी अर्क २ मिली प्रति लिटर फवारा. अधिक माहितीसाठी १ दाबा किंवा मुख्य मेनूसाठी ० दाबा.'
          : currentLang === 'hi'
          ? 'कृषि मित्र सलाह: प्याज में बैंगनी धब्बे और थ्रिप्स हेतु नीम तेल ५% या मैंकोजेब २.५ ग्राम प्रति लीटर का छिड़काव करें। मुख्य मेनू हेतु ० दबाएं।'
          : 'Krishi Mitra Advice: For foliar fungal control, spray Neem oil 10,000 ppm at 2ml/L or consult local KVK for Mancozeb dosage. Press 0 for Main Menu.';
      nextSession.collectedData.aiAnswer = answer;
      nextSession.history.push({ speaker: 'ivr', text: answer, timestamp: new Date().toISOString() });
      return { nextSession, responsePrompt: answer };
    }

    case 'AI_ADVICE_ANSWER': {
      nextSession.currentState = 'MAIN_MENU';
      const p = prompts.mainMenu;
      nextSession.history.push({ speaker: 'ivr', text: p, timestamp: new Date().toISOString() });
      return { nextSession, responsePrompt: p };
    }

    default: {
      return { nextSession, responsePrompt: prompts.goodbye, hangup: true };
    }
  }
}
