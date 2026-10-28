import React, { useState } from 'react';
import {
  Search,
  Filter,
  Phone,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  MapPin,
  Calendar,
  Scale,
  IndianRupee,
  Layers,
  ArrowUpDown,
  X,
  Send,
  Clock,
} from 'lucide-react';
import { User, CropListing, TraderOffer, QualityGrade } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { calculateTotalOfferValue, compareWithBenchmark } from '../utils/pricingCalculator';

interface TraderMarketplaceProps {
  currentUser: User;
  crops: CropListing[];
  offers: TraderOffer[];
  language: Language;
  onRefreshData: () => void;
  onOpenChat: (listingId: string, recipientName: string) => void;
}

export const TraderMarketplace: React.FC<TraderMarketplaceProps> = ({
  currentUser,
  crops,
  offers,
  language,
  onRefreshData,
  onOpenChat,
}) => {
  const t = TRANSLATIONS[language];

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'price-asc' | 'price-desc' | 'qty-desc'>('latest');

  // Offer modal state
  const [selectedCropForOffer, setSelectedCropForOffer] = useState<CropListing | null>(null);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [offeredPriceUnit, setOfferedPriceUnit] = useState<'kg' | 'quintal'>('kg');
  const [offerQuantity, setOfferQuantity] = useState('');
  const [offerQuantityUnit, setOfferQuantityUnit] = useState<'kg' | 'quintal' | 'ton'>('kg');
  const [offerExpiry, setOfferExpiry] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [deliveryTerms, setDeliveryTerms] = useState(
    'Spot online payment upon loading at farm gate and digital weighment.'
  );
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [activeView, setActiveView] = useState<'browse' | 'my-offers'>('browse');

  // Filter crops
  const filteredCrops = crops
    .filter((crop) => {
      // Don't show already sold crops in active market
      if (crop.status === 'sold') return false;

      if (selectedCategory !== 'All' && crop.category !== selectedCategory) return false;
      if (selectedGrade !== 'All' && crop.qualityGrade !== selectedGrade) return false;
      if (
        selectedLocation !== 'All' &&
        !crop.farmerLocation.toLowerCase().includes(selectedLocation.toLowerCase())
      ) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          crop.cropName.toLowerCase().includes(q) ||
          crop.farmerLocation.toLowerCase().includes(q) ||
          crop.farmerName.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.expectedPrice - b.expectedPrice;
      if (sortBy === 'price-desc') return b.expectedPrice - a.expectedPrice;
      if (sortBy === 'qty-desc') return b.quantity - a.quantity;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Trader's submitted offers
  const mySubmittedOffers = offers.filter(
    (o) => o.traderId === currentUser.id || currentUser.id === 'user-trader-1'
  );

  const handleOpenOfferModal = (crop: CropListing) => {
    setSelectedCropForOffer(crop);
    setOfferedPrice(String(crop.expectedPrice));
    setOfferedPriceUnit(crop.priceUnit);
    setOfferQuantity(String(crop.quantity));
    setOfferQuantityUnit(crop.unit);
  };

  const calculatedTotal =
    offeredPrice && offerQuantity
      ? calculateTotalOfferValue(
          parseFloat(offeredPrice) || 0,
          offeredPriceUnit,
          parseFloat(offerQuantity) || 0,
          offerQuantityUnit
        )
      : 0;

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCropForOffer) return;
    setSubmittingOffer(true);

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedCropForOffer.id,
          traderId: currentUser.id,
          traderName: currentUser.name,
          traderPhone: currentUser.phone,
          traderCompany: currentUser.businessName || 'Kisan Agro Traders',
          offeredPrice: parseFloat(offeredPrice),
          offeredPriceUnit,
          quantity: parseFloat(offerQuantity),
          quantityUnit: offerQuantityUnit,
          expiryDate: offerExpiry,
          deliveryTerms,
        }),
      });

      if (res.ok) {
        setSelectedCropForOffer(null);
        onRefreshData();
        setActiveView('my-offers');
      }
    } catch (err) {
      console.error('Failed to submit offer:', err);
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleAcceptCounter = async (offerId: string) => {
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
      if (res.ok) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner / Switch Views */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 rounded-2xl p-5 sm:p-7 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-600/80 text-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-bold">
              💼 {t.roleTrader} Marketplace
            </span>
            <span className="text-stone-300 text-xs">• Verified APMC Network</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            Discover Farm Fresh Batches
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
            Browse verified farmer listings, evaluate quality grades, submit spot bids, and contact growers directly.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-stone-800/80 p-1 rounded-xl border border-stone-700">
          <button
            onClick={() => setActiveView('browse')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'browse'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Browse Mandi ({filteredCrops.length})
          </button>
          <button
            onClick={() => setActiveView('my-offers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'my-offers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            {t.trackOffers} ({mySubmittedOffers.length})
          </button>
        </div>
      </div>

      {activeView === 'browse' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchCrops}
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-700 w-full sm:w-auto"
                >
                  <option value="latest">Latest Harvests</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="qty-desc">Quantity: High to Low</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
              <span className="font-semibold text-stone-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </span>

              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium"
              >
                <option value="All">{t.filterByCrop}</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Grains">Grains &amp; Wheat</option>
                <option value="Cash Crops">Cash Crops</option>
                <option value="Pulses">Pulses</option>
              </select>

              {/* Grade */}
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium"
              >
                <option value="All">{t.filterByGrade}</option>
                <option value="Grade A+">Grade A+ (Export)</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
              </select>

              {/* Location */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium"
              >
                <option value="All">{t.filterByLocation}</option>
                <option value="Nashik">Nashik / Lasalgaon</option>
                <option value="Pune">Pune / Narayangaon</option>
                <option value="Punjab">Punjab / Khanna</option>
                <option value="Indore">Indore, MP</option>
              </select>

              {(selectedCategory !== 'All' ||
                selectedGrade !== 'All' ||
                selectedLocation !== 'All' ||
                searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedGrade('All');
                    setSelectedLocation('All');
                    setSearchTerm('');
                  }}
                  className="text-emerald-700 hover:underline font-bold ml-auto"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Crops Grid */}
          {filteredCrops.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800">No matching crop listings found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try widening your search terms or filter selections to view available harvest lots.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCrops.map((crop) => {
                const comparison = compareWithBenchmark(
                  crop.expectedPrice,
                  crop.priceUnit,
                  crop.benchmarkPricePerKg,
                  'kg'
                );

                return (
                  <div
                    key={crop.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-48 bg-stone-100 overflow-hidden">
                      <img
                        src={crop.photos[0]}
                        alt={crop.cropName}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        <span className="bg-emerald-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {crop.qualityGrade}
                        </span>
                        <span className="bg-white text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          {crop.category}
                        </span>
                        {crop.registeredVia === 'phone_ivr' && (
                          <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            📞 Keypad Phone
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 bg-white/95 text-stone-900 text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                        ₹{crop.expectedPrice} / {crop.priceUnit}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-extrabold text-base text-stone-900 leading-snug">
                            {crop.cropName}
                          </h3>
                        </div>

                        {/* Farmer Profile Line */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                            🌾
                          </div>
                          <div className="text-xs">
                            <span className="font-bold text-stone-800">{crop.farmerName}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold ml-1.5 bg-emerald-50 px-1.5 py-0.2 rounded">
                              ✓ Verified
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{crop.farmerLocation}</span>
                        </div>

                        {/* Lot Stats */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          <div>
                            <span className="text-[10px] text-stone-400 block uppercase font-bold">
                              Available Batch
                            </span>
                            <span className="font-extrabold text-stone-900">
                              {crop.quantity} {crop.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block uppercase font-bold">
                              Harvest Date
                            </span>
                            <span className="font-semibold text-stone-700">
                              {crop.harvestDate}
                            </span>
                          </div>
                        </div>

                        {crop.notes && (
                          <p className="mt-2 text-xs text-stone-600 line-clamp-2">
                            "{crop.notes}"
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Real tel: Link for phone call */}
                          <a
                            href={`tel:${crop.farmerPhone}`}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-emerald-50 text-emerald-800 border border-stone-200 hover:border-emerald-300 transition-colors"
                            title={`Call farmer at ${crop.farmerPhone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          {/* In-app chat */}
                          <button
                            onClick={() => onOpenChat(crop.id, crop.farmerName)}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            title="Chat with farmer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleOpenOfferModal(crop)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t.makeOffer}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* My Submitted Offers Tracking View */
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                {t.trackOffers}
              </h2>
              <p className="text-xs text-stone-500">
                Track status of bids sent to farmers and finalize direct agreements.
              </p>
            </div>
          </div>

          {mySubmittedOffers.length === 0 ? (
            <div className="text-center py-10 text-stone-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold">You have not submitted any offers yet.</p>
              <button
                onClick={() => setActiveView('browse')}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Browse Available Crops
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmittedOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-4 rounded-xl border border-stone-200 hover:border-emerald-300 transition-all bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {offer.cropName}
                      </span>
                      <h4 className="font-extrabold text-stone-900 text-base mt-1">
                        Offered: ₹{offer.offeredPrice} / {offer.offeredPriceUnit}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Quantity: {offer.quantity} {offer.quantityUnit} • Total Value: ₹
                        {offer.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          offer.status === 'accepted'
                            ? 'bg-teal-600 text-white'
                            : offer.status === 'countered'
                            ? 'bg-purple-100 text-purple-800'
                            : offer.status === 'rejected'
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>
                  </div>

                  {offer.status === 'countered' && offer.counterPrice && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-purple-900">
                          Farmer countered with: ₹{offer.counterPrice} / {offer.offeredPriceUnit}
                        </p>
                        <p className="text-[11px] text-purple-700">
                          Do you accept this revised price for final pickup?
                        </p>
                      </div>
                      <button
                        onClick={() => handleAcceptCounter(offer.id)}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shrink-0"
                      >
                        Accept Counter Rate
                      </button>
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>Valid until: {offer.expiryDate}</span>
                    <button
                      onClick={() => onOpenChat(offer.listingId, offer.cropName)}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Open Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Offer Submission Modal */}
      {selectedCropForOffer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-green-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">{t.makeOffer}</h3>
              </div>
              <button
                onClick={() => setSelectedCropForOffer(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="p-5 space-y-4">
              {/* Target Produce info */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                <p className="font-bold text-stone-900">{selectedCropForOffer.cropName}</p>
                <p className="text-stone-600">
                  Farmer: <span className="font-semibold">{selectedCropForOffer.farmerName}</span> ({selectedCropForOffer.farmerLocation})
                </p>
                <p className="text-emerald-700 font-bold mt-1">
                  Farmer Expected Price: ₹{selectedCropForOffer.expectedPrice} / {selectedCropForOffer.priceUnit}
                </p>
              </div>

              {/* Offer price & quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.offeredPrice} *
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      required
                      step="any"
                      min="1"
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                    <select
                      value={offeredPriceUnit}
                      onChange={(e) => setOfferedPriceUnit(e.target.value as any)}
                      className="text-xs p-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="kg">/ kg</option>
                      <option value="quintal">/ Qtl</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Quantity Wanted *
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      required
                      step="any"
                      min="1"
                      value={offerQuantity}
                      onChange={(e) => setOfferQuantity(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                    <select
                      value={offerQuantityUnit}
                      onChange={(e) => setOfferQuantityUnit(e.target.value as any)}
                      className="text-xs p-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">Qtl</option>
                      <option value="ton">Ton</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Total Live Valuation Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Total Purchase Value:</span>
                <span className="text-base font-extrabold text-emerald-800">
                  ₹{calculatedTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.offerExpiry}
                </label>
                <input
                  type="date"
                  value={offerExpiry}
                  onChange={(e) => setOfferExpiry(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300"
                />
              </div>

              {/* Delivery / Payment Terms */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.deliveryNotes}
                </label>
                <textarea
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCropForOffer(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  {submittingOffer ? 'Sending...' : t.submitOffer}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
