import React from 'react';
import {
  Sprout,
  Users,
  MessageSquare,
  TrendingUp,
  LayoutDashboard,
  Store,
  Phone,
  Globe,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  currentRole: UserRole;
  language: Language;
  onSelectRole: (role: UserRole) => void;
  onSelectUser: (user: User) => void;
  onSelectLanguage: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAiAssistant: () => void;
  onOpenPhoneSimulator: () => void;
  onOpenTelephonyDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  currentRole,
  language,
  onSelectRole,
  onSelectUser,
  onSelectLanguage,
  activeTab,
  setActiveTab,
  onOpenAiAssistant,
  onOpenPhoneSimulator,
  onOpenTelephonyDrawer,
}) => {
  const t = TRANSLATIONS[language];
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      {/* Top Banner Notice for Demo / Hackathon */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{t.demoModeNotice}</span>
        <span className="hidden sm:inline text-emerald-300">|</span>
        <span className="hidden sm:inline text-emerald-200">
          Role-Based Access: {currentUser.name} ({currentUser.role === 'farmer' ? 'Farmer' : 'Trader'})
        </span>
        <span className="text-emerald-400">|</span>
        <button
          onClick={onOpenTelephonyDrawer}
          className="underline hover:text-white font-bold cursor-pointer text-amber-300 flex items-center gap-1"
        >
          <Phone className="w-3 h-3" />
          <span>Telephony &amp; IVR Ops</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(currentRole === 'farmer' ? 'farmer-hub' : 'marketplace')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900">
                  Krishi<span className="text-emerald-700">Connect</span>
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block leading-none mt-0.5">
                {t.appTagline}
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {currentRole === 'farmer' ? (
              <button
                onClick={() => setActiveTab('farmer-hub')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'farmer-hub'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t.navFarmerDashboard}
              </button>
            ) : null}

            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'marketplace'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Store className="w-4 h-4" />
              {t.navTraderMarket}
            </button>

            <button
              onClick={() => setActiveTab('mandi-prices')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'mandi-prices'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              {t.navMandiPrices}
            </button>

            <button
              onClick={onOpenPhoneSimulator}
              className="ml-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 flex items-center gap-1.5 transition-colors"
              title="Feature 13: Dial Inbound Helpline from Keypad Phone"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Helpline 1800-180-1551</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1 rounded">Keypad</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="ml-1 px-3.5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t.navAiAssistant}</span>
            </button>
          </nav>

          {/* Right Action Bar: Language + Role Switcher + User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-xs font-medium">
              <button
                onClick={() => onSelectLanguage('en')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onSelectLanguage('hi')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'hi'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onSelectLanguage('mr')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'mr'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Quick Role Switcher Pill */}
            <button
              onClick={() => {
                const nextRole: UserRole = currentRole === 'farmer' ? 'trader' : 'farmer';
                onSelectRole(nextRole);
                const nextDefaultUser = allUsers.find((u) => u.role === nextRole) || allUsers[0];
                onSelectUser(nextDefaultUser);
                setActiveTab(nextRole === 'farmer' ? 'farmer-hub' : 'marketplace');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold transition-colors"
              title={t.switchRole}
            >
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">{currentRole === 'farmer' ? t.roleFarmer : t.roleTrader}</span>
              <span className="sm:hidden">{currentRole === 'farmer' ? 'Farmer' : 'Trader'}</span>
              <span className="text-[10px] bg-amber-200 px-1 py-0.2 rounded font-bold">⇄</span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-600"
                />
                <span className="text-xs font-medium text-stone-800 hidden lg:inline max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-500">{currentUser.phone}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">{currentUser.location}</p>
                  </div>

                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Switch Demo Profile
                  </div>

                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        onSelectRole(user.role);
                        setShowUserDropdown(false);
                        setActiveTab(user.role === 'farmer' ? 'farmer-hub' : 'marketplace');
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-stone-50 text-xs transition-colors ${
                        user.id === currentUser.id ? 'bg-emerald-50/60 font-semibold text-emerald-900' : 'text-stone-700'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex-1 truncate">
                        <div className="truncate">{user.name}</div>
                        <div className="text-[10px] text-stone-500">
                          {user.role === 'farmer' ? '🌾 Farmer' : '💼 Trader'} • {user.location.split(',')[0]}
                        </div>
                      </div>
                      {user.id === currentUser.id && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40 px-2 py-1 flex items-center justify-around shadow-lg">
        {currentRole === 'farmer' && (
          <button
            onClick={() => setActiveTab('farmer-hub')}
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
              activeTab === 'farmer-hub' ? 'text-emerald-700' : 'text-stone-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Hub</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
            activeTab === 'marketplace' ? 'text-emerald-700' : 'text-stone-500'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Market</span>
        </button>

        <button
          onClick={onOpenAiAssistant}
          className="flex flex-col items-center py-1 px-3 text-xs font-bold text-emerald-800"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center -mt-4 shadow-md">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <span className="mt-0.5">Krishi AI</span>
        </button>

        <button
          onClick={() => setActiveTab('mandi-prices')}
          className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
            activeTab === 'mandi-prices' ? 'text-emerald-700' : 'text-stone-500'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Mandi</span>
        </button>
      </div>
    </header>
  );
};
