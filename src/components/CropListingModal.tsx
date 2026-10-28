import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  Calendar,
  MapPin,
  Tag,
  Scale,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { User, QualityGrade } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { extractCropListingFromText } from '../utils/cropListingParser';

interface CropListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  language: Language;
  onListingCreated: () => void;
}

export const CropListingModal: React.FC<CropListingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  onListingCreated,
}) => {
  const t = TRANSLATIONS[language];
  const [activeMode, setActiveMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [cropName, setCropName] = useState('Nashik Red Onion (लाल कांदा)');
  const [category, setCategory] = useState<'Vegetables' | 'Grains' | 'Cash Crops' | 'Pulses' | 'Fruits' | 'Spices'>('Vegetables');
  const [quantity, setQuantity] = useState('500');
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'ton'>('kg');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A+');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationMandi, setLocationMandi] = useState(currentUser.location || 'Lasalgaon, Nashik, Maharashtra');
  const [expectedPrice, setExpectedPrice] = useState('24');
  const [priceUnit, setPriceUnit] = useState<'kg' | 'quintal'>('kg');
  const [notes, setNotes] = useState('Fresh sun-cured harvest, uniform bulb size, dry outer skin.');
  const [selectedPhoto, setSelectedPhoto] = useState('https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80');

  // Speech Recognition instance
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      recog.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setAiPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recog.onerror = (e: any) => {
        console.warn('Speech error:', e.error);
        setIsListening(false);
        if (e.error !== 'no-speech') {
          setSpeechError(`Microphone issue: ${e.error}. You can still type below.`);
        }
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }
  }, [language]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!speechSupported) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your details.');
      return;
    }
    setSpeechError('');

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
        setIsListening(false);
      }
    }
  };

  const handleAiExtract = async () => {
    if (!aiPrompt.trim()) return;
    setIsExtracting(true);

    try {
      const res = await fetch('/api/ai/extract-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiPrompt, language }),
      });
      const data = await res.json();
      if (data.data) {
        const d = data.data;
        if (d.cropName) setCropName(d.cropName);
        if (d.quantity) setQuantity(String(d.quantity));
        if (d.unit) setUnit(d.unit);
        if (d.location) setLocationMandi(d.location);
        if (d.expectedPrice) setExpectedPrice(String(d.expectedPrice));
        if (d.priceUnit) setPriceUnit(d.priceUnit);
        if (d.quality) setQualityGrade(d.quality);
        if (d.harvestDate) setHarvestDate(d.harvestDate);

        // Auto-assign sample photo based on crop name
        const lower = (d.cropName || '').toLowerCase();
        if (lower.includes('onion') || lower.includes('कांदा')) {
          setSelectedPhoto('https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80');
          setCategory('Vegetables');
        } else if (lower.includes('wheat') || lower.includes('गहू')) {
          setSelectedPhoto('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80');
          setCategory('Grains');
        } else if (lower.includes('tomato') || lower.includes('टोमॅटो')) {
          setSelectedPhoto('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80');
          setCategory('Vegetables');
        } else if (lower.includes('soybean') || lower.includes('सोयाबीन')) {
          setSelectedPhoto('https://images.unsplash.com/photo-1599421498111-ad700aecd94b?auto=format&fit=crop&w=800&q=80');
          setCategory('Cash Crops');
        } else if (lower.includes('potato') || lower.includes('बटाटा')) {
          setSelectedPhoto('https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80');
          setCategory('Vegetables');
        }
      }
      setShowReview(true);
    } catch (err) {
      console.error('Extract error:', err);
      // Fallback local extraction
      const local = extractCropListingFromText(aiPrompt);
      setCropName(local.cropName);
      setQuantity(String(local.quantity));
      setUnit(local.unit);
      setLocationMandi(local.location);
      if (local.expectedPrice) setExpectedPrice(String(local.expectedPrice));
      setShowReview(true);
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: currentUser.id,
          farmerName: currentUser.name,
          farmerPhone: currentUser.phone,
          farmerLocation: locationMandi,
          cropName,
          category,
          quantity: parseFloat(quantity),
          unit,
          qualityGrade,
          harvestDate,
          expectedPrice: parseFloat(expectedPrice),
          priceUnit,
          photos: [selectedPhoto],
          notes,
        }),
      });

      if (res.ok) {
        onListingCreated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to post crop:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const SAMPLE_VOICE_PROMPTS = [
    'I have 500 kilograms of onions in Nashik, ready for sale at ₹24 per kg.',
    'माझ्याकडे लासलगाव येथे 25 क्विंटल कांदा आहे, भाव ₹2200 प्रति क्विंटल हवा आहे.',
    'मेरे पास इंदौर में 40 क्विंटल सोयाबीन तैयार है, अपेक्षित भाव ₹4500 प्रति क्विंटल।',
    'Have 80 quintals of table potatoes in Pune, Grade A quality at ₹19 per kg.',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-green-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">{t.listNewCrop}</h2>
              <p className="text-xs text-emerald-100">{t.appTagline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: AI Smart Voice vs Manual Entry */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => {
              setActiveMode('ai');
              setShowReview(false);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeMode === 'ai'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-600" />
            <span>AI Voice &amp; Fast Listing</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Recommended</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('manual');
              setShowReview(true);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeMode === 'manual'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <Layers className="w-4 h-4 text-stone-500" />
            <span>Standard Form</span>
          </button>
        </div>

        {/* AI Voice & Natural Language Step */}
        {activeMode === 'ai' && !showReview && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-emerald-950">Speak or describe in everyday language</p>
                <p className="mt-0.5 text-emerald-800">
                  Speak in English, Hindi, or Marathi. KrishiConnect AI extracts crop variety, quantity, APMC market location, and your target price into a ready listing.
                </p>
              </div>
            </div>

            {/* Voice Input Section */}
            <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
              <button
                type="button"
                onClick={toggleListening}
                className={`w-18 h-18 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100'
                }`}
                title={isListening ? t.stopListening : t.speakProduce}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <p className="mt-3 text-xs font-bold text-stone-700">
                {isListening ? t.listening : 'Click microphone to speak produce details'}
              </p>
              <p className="text-[11px] text-stone-500">Supports Marathi, Hindi, &amp; English speech</p>

              {speechError && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-md">
                  {speechError}
                </p>
              )}
            </div>

            {/* Text prompt box */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Voice Transcript / Typed Description:
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder='e.g. "I have 500 kilograms of onions in Nashik, ready for sale at ₹24 per kg."'
                rows={3}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
            </div>

            {/* Sample Chips */}
            <div>
              <p className="text-[11px] font-semibold text-stone-500 mb-1.5">Try sample descriptions:</p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_VOICE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAiPrompt(prompt)}
                    className="text-[11px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 text-left transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!aiPrompt.trim() || isExtracting}
                onClick={handleAiExtract}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                {isExtracting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Extracting Produce Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Extract &amp; Review Listing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Review / Manual Form Screen */}
        {(activeMode === 'manual' || showReview) && (
          <form onSubmit={handlePublish} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {showReview && activeMode === 'ai' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{t.reviewExtractedDetails}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReview(false)}
                  className="text-xs text-emerald-700 hover:underline font-bold"
                >
                  Edit Voice Prompt
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Crop Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.cropName} *
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Nashik Red Onion / टोमॅटो / Wheat"
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs sm:text-sm p-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Vegetables">Vegetables (भाजीपाला)</option>
                  <option value="Grains">Grains &amp; Cereals (धान्य)</option>
                  <option value="Cash Crops">Cash Crops (सोयाबीन, कापूस)</option>
                  <option value="Pulses">Pulses &amp; Chana (डाळी / कडधान्य)</option>
                  <option value="Fruits">Fruits (फळे)</option>
                  <option value="Spices">Spices (हळद, आले, मिरची)</option>
                </select>
              </div>

              {/* Quantity & Unit */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.quantity} *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Scale className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="text-xs sm:text-sm px-2 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="kg">kg (किलो)</option>
                    <option value="quintal">Quintal (क्विंटल)</option>
                    <option value="ton">Tons (टन)</option>
                  </select>
                </div>
              </div>

              {/* Expected Price & Unit */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.expectedPrice} *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value as any)}
                    className="text-xs sm:text-sm px-2 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="kg">/ kg (प्रति किलो)</option>
                    <option value="quintal">/ Quintal (प्रति क्विंटल)</option>
                  </select>
                </div>
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.qualityGrade}
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as any)}
                  className="w-full text-xs sm:text-sm p-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Grade A+">Grade A+ (Premium / Export Quality)</option>
                  <option value="Grade A">Grade A (Standard Market Quality)</option>
                  <option value="Grade B">Grade B (Medium Average)</option>
                  <option value="Standard">Standard / Fair</option>
                </select>
              </div>

              {/* Harvest / Ready Date */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.harvestDate}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Farm / Mandi Location */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.locationMandi} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={locationMandi}
                    onChange={(e) => setLocationMandi(e.target.value)}
                    placeholder="Village / Tehsil, APMC Mandi, District, State"
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Crop Photo Selection */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Crop Quality Photo Preview
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPhoto}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-stone-300 shadow-xs"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-stone-600 mb-1.5 font-medium">
                      Select or switch demo crop photo:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Red Onion', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Wheat', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Potatoes', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Soybean', url: 'https://images.unsplash.com/photo-1599421498111-ad700aecd94b?auto=format&fit=crop&w=400&q=80' },
                      ].map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPhoto(p.url)}
                          className={`text-[11px] px-2 py-1 rounded-md border font-medium transition-all ${
                            selectedPhoto === p.url
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                              : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Produce Notes / Packaging Details
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Moisture below 10%, stored in shaded godown, packed in 50kg bags."
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (activeMode === 'ai' && showReview) {
                    setShowReview(false);
                  } else {
                    onClose();
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>{t.confirmAndPublish}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
