export type UserRole = 'farmer' | 'trader';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  location: string;
  avatar: string;
  rating: number;
  dealsCount: number;
  verified: boolean;
  businessName?: string;
  language: 'en' | 'hi' | 'mr';
}

export type QualityGrade = 'Grade A+' | 'Grade A' | 'Grade B' | 'Standard';
export type ListingStatus = 'active' | 'under_negotiation' | 'sold';

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  cropName: string;
  category: 'Vegetables' | 'Grains' | 'Cash Crops' | 'Pulses' | 'Fruits' | 'Spices';
  quantity: number;
  unit: 'kg' | 'quintal' | 'ton';
  qualityGrade: QualityGrade;
  harvestDate: string;
  expectedPrice: number;
  priceUnit: 'kg' | 'quintal';
  photos: string[];
  notes?: string;
  status: ListingStatus;
  createdAt: string;
  benchmarkPricePerKg: number;
  activeOffersCount?: number;
  registeredVia?: 'web' | 'phone_ivr';
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered';

export interface TraderOffer {
  id: string;
  listingId: string;
  cropName: string;
  traderId: string;
  traderName: string;
  traderPhone: string;
  traderCompany: string;
  traderRating: number;
  offeredPrice: number;
  offeredPriceUnit: 'kg' | 'quintal';
  quantity: number;
  quantityUnit: 'kg' | 'quintal' | 'ton';
  totalAmount: number;
  status: OfferStatus;
  counterPrice?: number;
  expiryDate: string;
  deliveryTerms: string;
  createdAt: string;
}

export interface MandiPriceRecord {
  id: string;
  state: string;
  district: string;
  market: string;
  crop: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceUnit: 'quintal';
  dailyChangePercent: number;
  source: string;
  isDemo: boolean;
}

export interface ChatMessage {
  id: string;
  listingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface AiDiagnosisResult {
  detectedIssue: string;
  confidence: number;
  cropType: string;
  symptoms: string[];
  causes: string[];
  organicRemedy: string[];
  chemicalRemedy: string[];
  safetyAdvisory: string;
  clarifyingQuestions?: string[];
}
