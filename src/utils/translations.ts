export type Language = 'en' | 'hi' | 'mr';

export interface TranslationDict {
  appName: string;
  appTagline: string;
  roleFarmer: string;
  roleTrader: string;
  switchRole: string;
  demoModeNotice: string;
  navFarmerDashboard: string;
  navTraderMarket: string;
  navAiAssistant: string;
  navMandiPrices: string;
  navTransactions: string;
  
  // Farmer dashboard
  activeListings: string;
  offersReceived: string;
  completedDeals: string;
  estMarketValue: string;
  listNewCrop: string;
  listWithAiVoice: string;
  myListedCrops: string;
  offersComparison: string;
  noListingsYet: string;
  acceptOffer: string;
  rejectOffer: string;
  counterOffer: string;
  callTrader: string;
  chatTrader: string;
  
  // Listing Form
  cropName: string;
  quantity: string;
  unit: string;
  qualityGrade: string;
  harvestDate: string;
  locationMandi: string;
  expectedPrice: string;
  cropPhoto: string;
  publishListing: string;
  aiDescriptionPrompt: string;
  listening: string;
  speakProduce: string;
  reviewExtractedDetails: string;
  confirmAndPublish: string;

  // Trader Market
  searchCrops: string;
  filterByCrop: string;
  filterByLocation: string;
  filterByGrade: string;
  sortByPrice: string;
  makeOffer: string;
  offeredPrice: string;
  offerExpiry: string;
  deliveryNotes: string;
  submitOffer: string;
  verifiedFarmer: string;
  contactFarmer: string;
  trackOffers: string;

  // AI Assistant
  aiAssistantTitle: string;
  aiAssistantSubtitle: string;
  askPlaceholder: string;
  speakQuestion: string;
  stopListening: string;
  uploadCropPhoto: string;
  diseaseDiagnosis: string;
  organicRemedy: string;
  chemicalRemedy: string;
  safetyWarning: string;
  speakAnswer: string;
  stopSpeaking: string;
  suggestedQuestions: string[];

  // Mandi prices
  mandiTitle: string;
  mandiSubtitle: string;
  mandiBenchmarkNotice: string;
  state: string;
  marketMandi: string;
  modalPrice: string;
  priceRange: string;
  dailyChange: string;
  source: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    appName: 'KrishiConnect AI',
    appTagline: 'Empowering Farmers & Traders with AI',
    roleFarmer: 'Farmer (किसान / शेतकरी)',
    roleTrader: 'Trader (व्यापारी)',
    switchRole: 'Switch Role',
    demoModeNotice: 'Hackathon Demo Mode with Live AI & Seed Data',
    navFarmerDashboard: 'Farmer Hub',
    navTraderMarket: 'Mandi Marketplace',
    navAiAssistant: 'Krishi Mitra AI',
    navMandiPrices: 'Live Mandi Bhav',
    navTransactions: 'Trade History',

    activeListings: 'Active Crop Listings',
    offersReceived: 'Trader Offers Received',
    completedDeals: 'Deals Finalized',
    estMarketValue: 'Estimated Crop Value',
    listNewCrop: 'List Produce for Sale',
    listWithAiVoice: 'AI Voice/Text Listing',
    myListedCrops: 'My Harvest Listings',
    offersComparison: 'Received Trader Offers',
    noListingsYet: 'No crops listed yet. Click "+ List Produce" to start!',
    acceptOffer: 'Accept Deal',
    rejectOffer: 'Decline',
    counterOffer: 'Counter Price',
    callTrader: 'Call Buyer',
    chatTrader: 'Chat Buyer',

    cropName: 'Crop Name',
    quantity: 'Quantity Available',
    unit: 'Unit (kg / Quintal / Ton)',
    qualityGrade: 'Quality Grade',
    harvestDate: 'Ready / Harvest Date',
    locationMandi: 'Farm / Mandi Location',
    expectedPrice: 'Expected Price (₹)',
    cropPhoto: 'Crop Photos / Quality Preview',
    publishListing: 'Post Crop Listing',
    aiDescriptionPrompt: 'Speak or type your produce details (e.g. "I have 500 kg onions in Nashik at ₹24 per kg ready for harvest")',
    listening: 'Listening to your voice... Speak now',
    speakProduce: 'Record Voice Listing',
    reviewExtractedDetails: 'Review AI Extracted Produce Details',
    confirmAndPublish: 'Confirm & Publish Listing',

    searchCrops: 'Search crops by name, mandi or farmer...',
    filterByCrop: 'All Crops',
    filterByLocation: 'All Mandis / Districts',
    filterByGrade: 'All Grades',
    sortByPrice: 'Sort By',
    makeOffer: 'Submit Purchase Offer',
    offeredPrice: 'Offered Price (₹)',
    offerExpiry: 'Offer Valid Until',
    deliveryNotes: 'Pickup / Payment Terms',
    submitOffer: 'Send Offer to Farmer',
    verifiedFarmer: 'Verified Farmer',
    contactFarmer: 'Call Farmer',
    trackOffers: 'My Submitted Offers',

    aiAssistantTitle: 'Krishi Mitra AI Doctor & Advisory',
    aiAssistantSubtitle: 'Ask anything about crop diseases, pest remedies, mandi trends, soil health, and weather advice.',
    askPlaceholder: 'Ask a farming question or describe pest symptoms...',
    speakQuestion: 'Speak Question',
    stopListening: 'Stop Listening',
    uploadCropPhoto: 'Upload Leaf / Crop Photo',
    diseaseDiagnosis: 'Pest & Disease Diagnosis',
    organicRemedy: 'Recommended Organic / Bio Remedy',
    chemicalRemedy: 'Chemical Remedy (If severe)',
    safetyWarning: 'CAUTION: Always verify pesticide dosages, pre-harvest intervals, and chemical compatibility with local Krishi Vigyan Kendra (KVK) or qualified agricultural extension officer.',
    speakAnswer: 'Read Aloud (TTS)',
    stopSpeaking: 'Stop Audio',
    suggestedQuestions: [
      'How to control purple blotch in Nashik red onion?',
      'Best organic pesticide for tomato leaf curl virus?',
      'Recommended fertilizer schedule for Sharbati wheat?',
      'When should I irrigate soybean during pod development?'
    ],

    mandiTitle: 'APMC Mandi Bhav (Market Benchmarks)',
    mandiSubtitle: 'Real-time indicative spot prices across major agricultural markets in India.',
    mandiBenchmarkNotice: 'Indicative benchmark data sourced from APMC market records. Local quality grading and moisture level may vary spot prices.',
    state: 'State',
    marketMandi: 'Mandi / Yard',
    modalPrice: 'Modal Price (₹/Qtl)',
    priceRange: 'Min - Max Range',
    dailyChange: 'Daily Trend',
    source: 'Data Source',
  },
  hi: {
    appName: 'कृषि कनेक्ट AI',
    appTagline: 'भारतीय किसानों और व्यापारियों का विश्वसनीय मंच',
    roleFarmer: 'किसान (Farmer)',
    roleTrader: 'व्यापारी (Trader)',
    switchRole: 'भूमिका बदलें',
    demoModeNotice: 'डेमो मोड - एआई और मंडी डेटा सक्रिय',
    navFarmerDashboard: 'किसान डैशबोर्ड',
    navTraderMarket: 'मंडी बाज़ार',
    navAiAssistant: 'कृषि मित्र AI',
    navMandiPrices: 'लाइव मंडी भाव',
    navTransactions: 'व्यापार इतिहास',

    activeListings: 'सक्रिय फसल लिस्टिंग',
    offersReceived: 'प्राप्त व्यापारी ऑफर',
    completedDeals: 'सफल सौदे',
    estMarketValue: 'अनुमानित फसल मूल्य',
    listNewCrop: 'नई फसल बेचें',
    listWithAiVoice: 'AI बोलकर फसल लिस्ट करें',
    myListedCrops: 'मेरी दर्ज फसलें',
    offersComparison: 'व्यापारियों के ऑफर की तुलना',
    noListingsYet: 'कोई फसल दर्ज नहीं है। "+ नई फसल बेचें" पर क्लिक करें!',
    acceptOffer: 'सौदा स्वीकार करें',
    rejectOffer: 'अस्वीकार करें',
    counterOffer: 'नया भाव बताएं',
    callTrader: 'व्यापारी को कॉल करें',
    chatTrader: 'संदेश भेजें',

    cropName: 'फसल का नाम',
    quantity: 'मात्रा',
    unit: 'इकाई (किलो / क्विंटल / टन)',
    qualityGrade: 'गुणवत्ता ग्रेड',
    harvestDate: 'तैयारी / कटाई तिथि',
    locationMandi: 'खेत / मंडी का स्थान',
    expectedPrice: 'अपेक्षित भाव (₹)',
    cropPhoto: 'फसल की फोटो',
    publishListing: 'फसल लिस्टिंग प्रकाशित करें',
    aiDescriptionPrompt: 'अपनी फसल के बारे में बोलें या लिखें (उदा. "मेरे पास नासिक में 500 किलो प्याज है, 24 रुपये किलो भाव चाहिए")',
    listening: 'सुन रहा है... बोलिए',
    speakProduce: 'आवाज़ रिकॉर्ड करें',
    reviewExtractedDetails: 'AI द्वारा निकाली गई फसल जानकारी जांचें',
    confirmAndPublish: 'पुष्टि करें और लिस्ट करें',

    searchCrops: 'फसल, मंडी या किसान के नाम से खोजें...',
    filterByCrop: 'सभी फसलें',
    filterByLocation: 'सभी मंडियां / जिले',
    filterByGrade: 'सभी ग्रेड',
    sortByPrice: 'क्रमबद्ध करें',
    makeOffer: 'खरीद ऑफर भेजें',
    offeredPrice: 'प्रस्तावित भाव (₹)',
    offerExpiry: 'ऑफर समाप्ति समय',
    deliveryNotes: 'भुगतान व डिलीवरी शर्तें',
    submitOffer: 'किसान को ऑफर भेजें',
    verifiedFarmer: 'सत्यापित किसान',
    contactFarmer: 'किसान को कॉल करें',
    trackOffers: 'मेरे भेजे गए ऑफर',

    aiAssistantTitle: 'कृषि मित्र AI डॉक्टर व परामर्श',
    aiAssistantSubtitle: 'फसल रोग, कीट प्रबंधन, खाद, सिंचाई और मौसम से जुड़ी कोई भी जानकारी पूछें।',
    askPlaceholder: 'फसल या रोग के बारे में सवाल पूछें...',
    speakQuestion: 'बोलकर पूछें',
    stopListening: 'रोकें',
    uploadCropPhoto: 'पत्ती / फसल की फोटो अपलोड करें',
    diseaseDiagnosis: 'रोग व कीट की पहचान',
    organicRemedy: 'जैविक उपाय (Organic)',
    chemicalRemedy: 'रासायनिक उपचार (आवश्यकता पड़ने पर)',
    safetyWarning: 'सावधानी: किसी भी कीटनाशक की मात्रा और छिड़काव से पहले कृषि विज्ञान केंद्र (KVK) विशेषज्ञ या उत्पाद लेबल की जांच अवश्य करें।',
    speakAnswer: 'उत्तर सुनें (Audio)',
    stopSpeaking: 'आवाज़ बंद करें',
    suggestedQuestions: [
      'नासिक लाल प्याज में फफूंद और थ्रिप्स का नियंत्रण कैसे करें?',
      'टमाटर में पत्ती मुड़ने वाले रोग का जैविक उपचार क्या है?',
      'शरबती गेहूं की बेहतर पैदावार के लिए खाद का सही समय क्या है?',
      'सोयाबीन में फलियां भरते समय सिंचाई कब करनी चाहिए?'
    ],

    mandiTitle: 'कृषि उपज मंडी भाव (APMC दरें)',
    mandiSubtitle: 'प्रमुख भारतीय मंडियों के ताजा बेंचमार्क भाव।',
    mandiBenchmarkNotice: 'APMC मंडी रजिस्टरों से प्राप्त सूचक भाव। गुणवत्ता और नमी के अनुसार भाव भिन्न हो सकते हैं।',
    state: 'राज्य',
    marketMandi: 'मंडी / बाज़ार',
    modalPrice: 'मॉडल भाव (₹/क्विंटल)',
    priceRange: 'न्यूनतम - अधिकतम',
    dailyChange: 'दैनिक बदलाव',
    source: 'स्रोत',
  },
  mr: {
    appName: 'कृषी कनेक्ट AI',
    appTagline: 'शेतकरी आणि व्यापाऱ्यांसाठी आधुनिक शेती प्लॅटफॉर्म',
    roleFarmer: 'शेतकरी (Farmer)',
    roleTrader: 'व्यापारी (Trader)',
    switchRole: 'भूमिका बदला',
    demoModeNotice: 'डेमो मोड - थेट AI आणि बाजारभाव सक्रिय',
    navFarmerDashboard: 'शेतकरी केंद्र',
    navTraderMarket: 'मंडी बाजारपेठ',
    navAiAssistant: 'कृषी मित्र AI',
    navMandiPrices: 'थेट बाजारभाव',
    navTransactions: 'व्यापार व्यवहार',

    activeListings: 'सक्रिय पीक विक्री यादी',
    offersReceived: 'व्यापाऱ्यांकडून मिळालेले ऑफर्स',
    completedDeals: 'पूर्ण झालेले सौदे',
    estMarketValue: 'अंदाजे पीक मूल्य',
    listNewCrop: 'नवीन पीक विक्रीस नोंदवा',
    listWithAiVoice: 'AI आवाजाने पीक नोंदवा',
    myListedCrops: 'माझी नोंदवलेली पिके',
    offersComparison: 'व्यापाऱ्यांच्या ऑफर्सची तुलना',
    noListingsYet: 'अद्याप कोणतेही पीक नोंदवलेले नाही. "+ पीक विक्रीस नोंदवा" दाबा!',
    acceptOffer: 'सौदा मान्य करा',
    rejectOffer: 'नाकारा',
    counterOffer: 'नवा भाव सांगा',
    callTrader: 'व्यापाऱ्याला कॉल करा',
    chatTrader: 'मेसेज करा',

    cropName: 'पिकाचे नाव',
    quantity: 'उपलब्ध प्रमाण',
    unit: 'एकक (किलो / क्विंटल / टन)',
    qualityGrade: 'दर्जा (Quality Grade)',
    harvestDate: 'काढणी / उपलब्ध तारीख',
    locationMandi: 'शेत / बाजार समिती ठिकाण',
    expectedPrice: 'अपेक्षित भाव (₹)',
    cropPhoto: 'पिकाचा फोटो',
    publishListing: 'पीक विक्रीस प्रसिद्ध करा',
    aiDescriptionPrompt: 'तुमच्या पिकाविषयी बोला किंवा लिहा (उदा. "माझ्याकडे लासलगाव येथे 25 क्विंटल कांदा आहे, 2200 रुपये क्विंटल भाव हवा")',
    listening: 'ऐकत आहे... बोला',
    speakProduce: 'आवाजात पीक नोंदवा',
    reviewExtractedDetails: 'AI ने निवडलेली माहिती तपासा',
    confirmAndPublish: 'खात्री करा आणि नोंदवा',

    searchCrops: 'पिकाचे नाव, मंडी किंवा शेतकऱ्याच्या नावाने शोधा...',
    filterByCrop: 'सर्व पिके',
    filterByLocation: 'सर्व बाजार समित्या / जिल्हे',
    filterByGrade: 'सर्व ग्रेड',
    sortByPrice: 'क्रमवारी',
    makeOffer: 'खरेदी ऑफर द्या',
    offeredPrice: 'प्रस्तावित भाव (₹)',
    offerExpiry: 'ऑफर मुदत',
    deliveryNotes: 'उचल व पेमेंट अटी',
    submitOffer: 'शेतकऱ्याला ऑफर पाठवा',
    verifiedFarmer: 'प्रमाणित शेतकरी',
    contactFarmer: 'शेतकऱ्याला कॉल करा',
    trackOffers: 'मी दिलेले ऑफर्स',

    aiAssistantTitle: 'कृषी मित्र AI डॉक्टर व सल्लागार',
    aiAssistantSubtitle: 'पीक रोग, कीड नियंत्रण, सेंद्रिय उपाय, बाजारभाव आणि हवामानविषयक मार्गदर्शन मिळवा.',
    askPlaceholder: 'पिकाबद्दल किंवा रोगाबद्दल प्रश्न विचारा...',
    speakQuestion: 'बोलून विचारा',
    stopListening: 'थांबवा',
    uploadCropPhoto: 'पानाचा किंवा पिकाचा फोटो अपलोड करा',
    diseaseDiagnosis: 'रोग व कीड निदान',
    organicRemedy: 'सेंद्रिय व जैविक उपाय',
    chemicalRemedy: 'रासायनिक फवारणी (आवश्यक असल्यास)',
    safetyWarning: 'सावधानता: कीटकनाशक फवारणीपूर्वी कृषी विज्ञान केंद्र (KVK) अथवा कृषी अधिकाऱ्यांचा सल्ला अवश्य घ्या आणि लेबलवरील सूचनांचे पालन करा.',
    speakAnswer: 'उत्तर ऐका (Audio)',
    stopSpeaking: 'आवाज थांबवा',
    suggestedQuestions: [
      'लासलगाव लाल कांद्यावरील करपा आणि थ्रिप्स कसे रोखावे?',
      'टोमॅटोवरील पर्णगुच्छ रोगावर (Leaf Curl) सेंद्रिय उपाय काय?',
      'शरबती गव्हाच्या भरघोस उत्पादनासाठी खतांचे योग्य नियोजन कसे करावे?',
      'सोयाबीन भरण्याच्या काळात पाणी आणि बुरशीनाशक व्यवस्थापन कसे करावे?'
    ],

    mandiTitle: 'महाराष्ट्र व भारत बाजार समिती दर (APMC भाव)',
    mandiSubtitle: 'प्रमुख कृषी उत्पन्न बाजार समित्यांचे आजचे दर.',
    mandiBenchmarkNotice: 'APMC अधिकृत नोंदींवर आधारित सूचक भाव. प्रतवारीनुसार प्रत्यक्ष लिलावात भाव बदलू शकतात.',
    state: 'राज्य',
    marketMandi: 'बाजार समिती',
    modalPrice: 'सरासरी भाव (₹/क्विंटल)',
    priceRange: 'कमीतकमी - जास्तीत जास्त',
    dailyChange: 'दैनिक बदल',
    source: 'माहिती स्रोत',
  },
};
