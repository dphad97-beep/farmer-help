export interface ParsedCropListing {
  cropName: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'ton';
  location: string;
  expectedPrice: number | null;
  priceUnit: 'kg' | 'quintal';
  quality: 'Grade A+' | 'Grade A' | 'Grade B' | 'Standard';
  harvestDate: string;
  confidence: number;
}

const CROP_SYNONYMS: Record<string, string> = {
  // English
  onion: 'Onion',
  onions: 'Onion',
  potato: 'Potato',
  potatoes: 'Potato',
  tomato: 'Tomato',
  tomatoes: 'Tomato',
  wheat: 'Wheat',
  soybean: 'Soybean',
  soya: 'Soybean',
  cotton: 'Cotton',
  rice: 'Paddy / Rice',
  paddy: 'Paddy / Rice',
  chana: 'Gram / Chana',
  gram: 'Gram / Chana',
  chickpea: 'Gram / Chana',
  maize: 'Maize / Corn',
  corn: 'Maize / Corn',
  turmeric: 'Turmeric',
  ginger: 'Ginger',
  garlic: 'Garlic',
  pomegranate: 'Pomegranate',
  grapes: 'Grapes',
  sugarcane: 'Sugarcane',
  // Hindi / Marathi transliterated & Devanagari
  kanda: 'Onion',
  pyaaz: 'Onion',
  pyaz: 'Onion',
  कांदा: 'Onion',
  प्याज़: 'Onion',
  प्याज: 'Onion',
  aloo: 'Potato',
  batata: 'Potato',
  बटाटा: 'Potato',
  आलू: 'Potato',
  tamatar: 'Tomato',
  टोमॅटो: 'Tomato',
  टमाटर: 'Tomato',
  gehun: 'Wheat',
  gehu: 'Wheat',
  gahu: 'Wheat',
  गहू: 'Wheat',
  गेहूं: 'Wheat',
  kapas: 'Cotton',
  kaapus: 'Cotton',
  कापूस: 'Cotton',
  कपास: 'Cotton',
  soyabin: 'Soybean',
  सोयाबीन: 'Soybean',
  chawal: 'Paddy / Rice',
  तांदूळ: 'Paddy / Rice',
  चावल: 'Paddy / Rice',
  haldi: 'Turmeric',
  हळद: 'Turmeric',
  हल्दी: 'Turmeric',
  adrak: 'Ginger',
  aale: 'Ginger',
  अदरक: 'Ginger',
  आले: 'Ginger',
};

const LOCATION_MAPPINGS: Record<string, string> = {
  // English
  nashik: 'Nashik, Maharashtra',
  lasalgaon: 'Lasalgaon, Maharashtra',
  pune: 'Pune, Maharashtra',
  niphad: 'Niphad, Maharashtra',
  indore: 'Indore, Madhya Pradesh',
  nagpur: 'Nagpur, Maharashtra',
  kolhapur: 'Kolhapur, Maharashtra',
  solapur: 'Solapur, Maharashtra',
  ahmednagar: 'Ahmednagar, Maharashtra',
  baramati: 'Baramati, Maharashtra',
  satara: 'Satara, Maharashtra',
  sangli: 'Sangli, Maharashtra',
  amravati: 'Amravati, Maharashtra',
  akola: 'Akola, Maharashtra',
  latur: 'Latur, Maharashtra',
  jalgaon: 'Jalgaon, Maharashtra',
  dhule: 'Dhule, Maharashtra',
  bhopal: 'Bhopal, Madhya Pradesh',
  khanna: 'Khanna, Punjab',
  karnal: 'Karnal, Haryana',
  guntur: 'Guntur, Andhra Pradesh',
  azadpur: 'Azadpur, Delhi',
  // Devanagari Hindi / Marathi
  'नाशिक': 'Nashik, Maharashtra',
  'नासिक': 'Nashik, Maharashtra',
  'लासलगाव': 'Lasalgaon, Maharashtra',
  'पुणे': 'Pune, Maharashtra',
  'निफाड': 'Niphad, Maharashtra',
  'इंदूर': 'Indore, Madhya Pradesh',
  'इंदौर': 'Indore, Madhya Pradesh',
  'नागपूर': 'Nagpur, Maharashtra',
  'नागपुर': 'Nagpur, Maharashtra',
  'कोल्हापूर': 'Kolhapur, Maharashtra',
  'सोलापूर': 'Solapur, Maharashtra',
  'अहमदनगर': 'Ahmednagar, Maharashtra',
  'बारामती': 'Baramati, Maharashtra',
  'सातारा': 'Satara, Maharashtra',
  'सांगली': 'Sangli, Maharashtra',
  'लातूर': 'Latur, Maharashtra',
  'जळगाव': 'Jalgaon, Maharashtra',
  'धुळे': 'Dhule, Maharashtra',
  'भोपाल': 'Bhopal, Madhya Pradesh',
};

export function extractCropListingFromText(text: string): ParsedCropListing {
  const normalized = text.toLowerCase();
  
  // 1. Identify Crop Name
  let detectedCrop = 'Onion';
  for (const [key, val] of Object.entries(CROP_SYNONYMS)) {
    const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9\u0900-\u097F])${key}($|\\s|[^a-zA-Z0-9\u0900-\u097F])`, 'i');
    if (regex.test(normalized) || normalized.includes(key)) {
      detectedCrop = val;
      break;
    }
  }

  // 2. Quantity & Unit
  let quantity = 100;
  let unit: 'kg' | 'quintal' | 'ton' = 'kg';

  const qtyMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|kilo|kilos|किलो|quintal|quintals|qtl|क्विंटल|ton|tons|tonne|tonnes|टन)/i);
  if (qtyMatch) {
    quantity = parseFloat(qtyMatch[1]);
    const unitStr = qtyMatch[2].toLowerCase();
    if (unitStr.includes('quintal') || unitStr.includes('qtl') || unitStr.includes('क्विंटल')) {
      unit = 'quintal';
    } else if (unitStr.includes('ton') || unitStr.includes('टन')) {
      unit = 'ton';
    } else {
      unit = 'kg';
    }
  } else {
    const nakedNum = normalized.match(/(\d+(?:\.\d+)?)/);
    if (nakedNum) {
      quantity = parseFloat(nakedNum[1]);
    }
  }

  // 3. Location
  let detectedLocation = 'Nashik, Maharashtra';
  for (const [key, fullLoc] of Object.entries(LOCATION_MAPPINGS)) {
    if (normalized.includes(key.toLowerCase()) || text.includes(key)) {
      detectedLocation = fullLoc;
      break;
    }
  }

  // 4. Price extraction
  let expectedPrice: number | null = null;
  let priceUnit: 'kg' | 'quintal' = unit === 'quintal' ? 'quintal' : 'kg';

  const priceSpecificMatch = normalized.match(/(?:at|for|price|rate|@)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:rs|rupees|\/-)?\s*(?:per|\/)?\s*(kg|kilo|quintal|qtl)?/i);

  if (priceSpecificMatch) {
    expectedPrice = parseFloat(priceSpecificMatch[1].replace(/,/g, ''));
    if (priceSpecificMatch[2] && (priceSpecificMatch[2].includes('quintal') || priceSpecificMatch[2].includes('qtl'))) {
      priceUnit = 'quintal';
    }
  } else {
    const priceMatch = normalized.match(/(?:rs\.?|inr|₹)\s*(\d{1,5}(?:,\d{3})*(?:\.\d+)?)/i);
    if (priceMatch) {
      const candidate = parseFloat(priceMatch[1].replace(/,/g, ''));
      if (candidate > 0 && candidate !== quantity) {
        expectedPrice = candidate;
      }
    }
  }

  // 5. Quality grade
  let quality: 'Grade A+' | 'Grade A' | 'Grade B' | 'Standard' = 'Grade A';
  if (/best|top quality|export|a\+|grade a\+|उत्कृष्ट|सुपर/i.test(normalized)) {
    quality = 'Grade A+';
  } else if (/medium|average|grade b|साधारण/i.test(normalized)) {
    quality = 'Grade B';
  }

  const today = new Date().toISOString().split('T')[0];

  return {
    cropName: detectedCrop,
    quantity,
    unit,
    location: detectedLocation,
    expectedPrice,
    priceUnit,
    quality,
    harvestDate: today,
    confidence: 0.92,
  };
}
