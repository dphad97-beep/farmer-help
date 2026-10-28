import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Info,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { MandiPriceRecord } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { MANDI_BENCHMARK_PRICES } from '../data/mockData';

interface MandiPricesViewProps {
  language: Language;
}

export const MandiPricesView: React.FC<MandiPricesViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [prices, setPrices] = useState<MandiPriceRecord[]>(MANDI_BENCHMARK_PRICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    fetch('/api/mandi-prices')
      .then((res) => res.json())
      .then((data) => {
        if (data.prices) setPrices(data.prices);
      })
      .catch((err) => console.warn('Mandi fetch error:', err));
  }, []);

  const filteredPrices = prices.filter((p) => {
    if (selectedState !== 'All' && p.state !== selectedState) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        p.crop.toLowerCase().includes(q) ||
        p.market.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const states = Array.from(new Set(prices.map((p) => p.state)));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-950 rounded-2xl p-5 sm:p-7 text-white shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-400 text-amber-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
            📈 Agmarknet &amp; APMC
          </span>
          <span className="text-emerald-200 text-xs">• Daily Benchmark Rates</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
          {t.mandiTitle}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
          {t.mandiSubtitle}
        </p>
      </div>

      {/* Mandatory Benchmark / Demonstration Data Notice Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900">
            Official Notice: Demonstration &amp; Indicative APMC Benchmark Prices
          </p>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            {t.mandiBenchmarkNotice} Spot prices inside agricultural market yards depend on physical grading, moisture content, bulb size, and live open auction bidding.
          </p>
        </div>
      </div>

      {/* Search and State Filters */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crop or mandi (e.g. Onion, Lasalgaon)..."
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> {t.state}:
          </span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs p-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-800 font-medium w-full sm:w-auto"
          >
            <option value="All">All States (सर्व राज्ये)</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticker / Benchmark Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
              <tr>
                <th className="py-3 px-4">{t.cropName}</th>
                <th className="py-3 px-4">{t.marketMandi}</th>
                <th className="py-3 px-4">{t.state}</th>
                <th className="py-3 px-4 text-right">{t.modalPrice}</th>
                <th className="py-3 px-4 text-right">{t.priceRange}</th>
                <th className="py-3 px-4 text-center">{t.dailyChange}</th>
                <th className="py-3 px-4">{t.source}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPrices.map((record) => (
                <tr key={record.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-stone-900">
                    <div>{record.crop}</div>
                    <span className="text-[11px] text-stone-400 font-normal">
                      {record.variety}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-700 font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{record.market}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {record.district}, {record.state}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-stone-900 text-sm sm:text-base">
                    ₹{record.modalPrice.toLocaleString('en-IN')}
                    <span className="text-[10px] text-stone-400 font-normal block">
                      (₹{(record.modalPrice / 100).toFixed(1)}/kg)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-stone-600">
                    ₹{record.minPrice} - ₹{record.maxPrice}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs ${
                        record.dailyChangePercent >= 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.dailyChangePercent >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {record.dailyChangePercent >= 0 ? '+' : ''}
                        {record.dailyChangePercent}%
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-stone-500">
                    <div>{record.source}</div>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                      Demo Benchmark
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
