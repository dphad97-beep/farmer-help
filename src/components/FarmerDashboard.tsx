import React, { useState } from 'react';
import {
  Plus,
  Mic,
  TrendingUp,
  Package,
  CheckCircle,
  Phone,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  ArrowUpRight,
  Check,
  X as CloseIcon,
  IndianRupee,
} from 'lucide-react';
import { User, CropListing, TraderOffer } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { compareWithBenchmark } from '../utils/pricingCalculator';

interface FarmerDashboardProps {
  currentUser: User;
  crops: CropListing[];
  offers: TraderOffer[];
  language: Language;
  onOpenListingModal: () => void;
  onRefreshData: () => void;
  onOpenChat: (listingId: string, traderName: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  currentUser,
  crops,
  offers,
  language,
  onOpenListingModal,
  onRefreshData,
  onOpenChat,
}) => {
  const t = TRANSLATIONS[language];
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted'>('all');

  // Filter crops owned by current farmer (or show all in demo if matches or default)
  const myCrops = crops.filter(
    (c) => c.farmerId === currentUser.id || currentUser.id === 'user-farmer-1'
  );

  // Filter offers received for farmer's crops
  const myCropIds = new Set(myCrops.map((c) => c.id));
  const myOffers = offers.filter((o) => myCropIds.has(o.listingId));

  // Compute portfolio metrics
  const activeCount = myCrops.filter((c) => c.status !== 'sold').length;
  const totalOffersCount = myOffers.filter((o) => o.status === 'pending').length;
  const completedDealsCount = myOffers.filter((o) => o.status === 'accepted').length;

  const totalEstimatedValue = myCrops.reduce((acc, c) => {
    const totalKg = c.unit === 'quintal' ? c.quantity * 100 : c.unit === 'ton' ? c.quantity * 1000 : c.quantity;
    const priceKg = c.priceUnit === 'quintal' ? c.expectedPrice / 100 : c.expectedPrice;
    return acc + totalKg * priceKg;
  }, 0);

  const handleUpdateOfferStatus = async (offerId: string, status: 'accepted' | 'rejected' | 'countered', counter?: number) => {
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, counterPrice: counter }),
      });
      if (res.ok) {
        setCounteringOfferId(null);
        setCounterPrice('');
        onRefreshData();
      }
    } catch (err) {
      console.error('Failed to update offer status:', err);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (!window.confirm('Are you sure you want to remove this crop listing?')) return;
    try {
      await fetch(`/api/crops/${cropId}`, { method: 'DELETE' });
      onRefreshData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredOffers = myOffers.filter((o) => {
    if (activeFilter === 'pending') return o.status === 'pending';
    if (activeFilter === 'accepted') return o.status === 'accepted';
    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-600/60 text-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-bold">
                🌾 {t.roleFarmer}
              </span>
              <span className="text-emerald-200 text-xs">• {currentUser.location}</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Namaste, {currentUser.name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Manage your harvest listings, review live bids from verified APMC traders, and negotiate best spot prices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenListingModal}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>{t.listNewCrop}</span>
            </button>
            <button
              onClick={onOpenListingModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/50 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span>{t.listWithAiVoice}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.activeListings}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {activeCount}
            </span>
            <span className="text-xs text-stone-400">batches</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Available in mandi pool</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.offersReceived}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-800">
              {totalOffersCount}
            </span>
            <span className="text-xs text-stone-400">active bids</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Awaiting your response</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.completedDeals}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-900">
              {completedDealsCount}
            </span>
            <span className="text-xs text-stone-400">finalized</span>
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">Direct trader pickups</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.estMarketValue}
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-stone-900 truncate">
              ₹{totalEstimatedValue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">At expected farmer rates</p>
        </div>
      </div>

      {/* Main Content Grid: Offers Comparison & Listed Crops */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trader Offers & Price Comparison */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span>{t.offersComparison}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                    {myOffers.length}
                  </span>
                </h2>
                <p className="text-xs text-stone-500">
                  Compare offered bids against local APMC benchmarks and accept or counter-bid.
                </p>
              </div>

              {/* Offer Filters */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2 py-1 rounded-md ${
                    activeFilter === 'all' ? 'bg-white shadow-xs font-bold text-stone-900' : 'text-stone-600'
                  }`}
                >
                  All ({myOffers.length})
                </button>
                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`px-2 py-1 rounded-md ${
                    activeFilter === 'pending' ? 'bg-white shadow-xs font-bold text-stone-900' : 'text-stone-600'
                  }`}
                >
                  Pending ({myOffers.filter((o) => o.status === 'pending').length})
                </button>
                <button
                  onClick={() => setActiveFilter('accepted')}
                  className={`px-2 py-1 rounded-md ${
                    activeFilter === 'accepted' ? 'bg-white shadow-xs font-bold text-stone-900' : 'text-stone-600'
                  }`}
                >
                  Deals ({myOffers.filter((o) => o.status === 'accepted').length})
                </button>
              </div>
            </div>

            {filteredOffers.length === 0 ? (
              <div className="text-center py-8 text-stone-500 space-y-2">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">No offers in this filter yet.</p>
                <p className="text-[11px] text-stone-400">
                  Switch to Trader mode to simulate submitting fresh bids on your crops!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOffers.map((offer) => {
                  const targetCrop = crops.find((c) => c.id === offer.listingId);
                  const benchmarkPrice = targetCrop?.benchmarkPricePerKg || 22;
                  const comparison = compareWithBenchmark(
                    offer.offeredPrice,
                    offer.offeredPriceUnit,
                    benchmarkPrice,
                    'kg'
                  );

                  return (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-xl border transition-all ${
                        offer.status === 'accepted'
                          ? 'border-teal-300 bg-teal-50/40'
                          : offer.status === 'rejected'
                          ? 'border-stone-200 bg-stone-50/80 opacity-70'
                          : 'border-stone-200 bg-white hover:border-emerald-300 shadow-xs'
                      }`}
                    >
                      {/* Top Row: Crop Name & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {offer.cropName}
                          </span>
                          <h3 className="font-extrabold text-sm sm:text-base text-stone-900 mt-1">
                            ₹{offer.offeredPrice} / {offer.offeredPriceUnit}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              comparison.badgeColor === 'emerald'
                                ? 'bg-emerald-100 text-emerald-800'
                                : comparison.badgeColor === 'amber'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {comparison.badgeText}
                          </span>

                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              offer.status === 'accepted'
                                ? 'bg-teal-600 text-white'
                                : offer.status === 'rejected'
                                ? 'bg-stone-300 text-stone-700'
                                : offer.status === 'countered'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {offer.status}
                          </span>
                        </div>
                      </div>

                      {/* Trader Info & Deal Details */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <div>
                          <p className="font-bold text-stone-900">{offer.traderName}</p>
                          <p className="text-[11px] text-stone-500">{offer.traderCompany}</p>
                          <p className="text-[11px] text-amber-700 font-semibold">
                            ★ {offer.traderRating} rating
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px]">
                            Quantity: <span className="font-bold text-stone-800">{offer.quantity} {offer.quantityUnit}</span>
                          </p>
                          <p className="text-[11px]">
                            Total Valuation: <span className="font-bold text-emerald-700">₹{offer.totalAmount.toLocaleString('en-IN')}</span>
                          </p>
                          <p className="text-[10px] text-stone-400">
                            Valid until: {offer.expiryDate}
                          </p>
                        </div>
                      </div>

                      {offer.deliveryTerms && (
                        <p className="mt-2 text-[11px] text-stone-600 italic">
                          "{offer.deliveryTerms}"
                        </p>
                      )}

                      {/* Counter-offer inline form */}
                      {counteringOfferId === offer.id && (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                          <label className="block text-xs font-bold text-purple-900">
                            Specify your counter price (₹ / {offer.offeredPriceUnit}):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="any"
                              value={counterPrice}
                              onChange={(e) => setCounterPrice(e.target.value)}
                              placeholder={`e.g. ${offer.offeredPrice + 1.5}`}
                              className="text-xs p-2 rounded-lg border border-purple-300 bg-white flex-1"
                            />
                            <button
                              onClick={() =>
                                handleUpdateOfferStatus(
                                  offer.id,
                                  'countered',
                                  parseFloat(counterPrice) || offer.offeredPrice
                                )
                              }
                              className="px-3 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-bold"
                            >
                              Send Counter
                            </button>
                            <button
                              onClick={() => setCounteringOfferId(null)}
                              className="px-2 py-1.5 bg-stone-200 text-stone-700 rounded-lg text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                        {/* Direct Call & Chat Links */}
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${offer.traderPhone}`}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                            title={`Call ${offer.traderName} at ${offer.traderPhone}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{t.callTrader}</span>
                          </a>

                          <button
                            onClick={() => onOpenChat(offer.listingId, offer.traderName)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                            <span>{t.chatTrader}</span>
                          </button>
                        </div>

                        {/* Acceptance / Rejection / Counter */}
                        {offer.status === 'pending' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setCounteringOfferId(offer.id);
                                setCounterPrice(String(offer.offeredPrice + 1));
                              }}
                              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
                            >
                              {t.counterOffer}
                            </button>
                            <button
                              onClick={() => handleUpdateOfferStatus(offer.id, 'rejected')}
                              className="px-2.5 py-1.5 bg-stone-100 hover:bg-red-50 text-red-700 rounded-lg text-xs font-semibold"
                            >
                              {t.rejectOffer}
                            </button>
                            <button
                              onClick={() => handleUpdateOfferStatus(offer.id, 'accepted')}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{t.acceptOffer}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: My Harvest Listings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  {t.myListedCrops}
                </h2>
                <p className="text-xs text-stone-500">
                  {myCrops.length} batches registered under your farm
                </p>
              </div>

              <button
                onClick={onOpenListingModal}
                className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center justify-center font-bold"
                title="Add new crop"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {myCrops.length === 0 ? (
              <div className="text-center py-8 text-stone-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-xs">{t.noListingsYet}</p>
                <button
                  onClick={onOpenListingModal}
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {t.listNewCrop}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myCrops.map((crop) => (
                  <div
                    key={crop.id}
                    className="p-3 rounded-xl border border-stone-200 hover:border-emerald-300 transition-all bg-white flex gap-3"
                  >
                    <img
                      src={crop.photos[0]}
                      alt={crop.cropName}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 truncate">
                          {crop.cropName}
                        </h4>
                        <button
                          onClick={() => handleDeleteCrop(crop.id)}
                          className="text-stone-400 hover:text-red-600 p-1 rounded-md"
                          title="Remove crop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-600">
                        <span className="font-semibold text-stone-800">
                          {crop.quantity} {crop.unit}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700">
                          ₹{crop.expectedPrice} / {crop.priceUnit}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                            {crop.qualityGrade}
                          </span>
                          {crop.registeredVia === 'phone_ivr' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                              📞 Phone IVR
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            crop.status === 'sold'
                              ? 'bg-teal-100 text-teal-800'
                              : crop.status === 'under_negotiation'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {crop.status === 'sold'
                            ? 'Sold'
                            : crop.status === 'under_negotiation'
                            ? 'Negotiation'
                            : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
