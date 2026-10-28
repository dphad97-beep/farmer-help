import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FarmerDashboard } from './components/FarmerDashboard';
import { TraderMarketplace } from './components/TraderMarketplace';
import { MandiPricesView } from './components/MandiPricesView';
import { CropListingModal } from './components/CropListingModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ChatModal } from './components/ChatModal';
import { PhoneSimulatorModal } from './components/PhoneSimulatorModal';
import { TelephonyAdminDrawer } from './components/TelephonyAdminDrawer';
import { User, UserRole, CropListing, TraderOffer } from './types';
import { Language, TRANSLATIONS } from './utils/translations';
import { SAMPLE_USERS, INITIAL_CROPS, INITIAL_OFFERS } from './data/mockData';
import { Sprout, PhoneCall, Sparkles, ExternalLink, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [allUsers, setAllUsers] = useState<User[]>(SAMPLE_USERS);
  const [currentUser, setCurrentUser] = useState<User>(SAMPLE_USERS[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<string>('farmer-hub');

  const [crops, setCrops] = useState<CropListing[]>(INITIAL_CROPS);
  const [offers, setOffers] = useState<TraderOffer[]>(INITIAL_OFFERS);

  // Modals
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isPhoneSimulatorOpen, setIsPhoneSimulatorOpen] = useState(false);
  const [isTelephonyDrawerOpen, setIsTelephonyDrawerOpen] = useState(false);
  const [chatModal, setChatModal] = useState<{
    isOpen: boolean;
    listingId: string;
    recipientName: string;
  }>({
    isOpen: false,
    listingId: '',
    recipientName: '',
  });

  const t = TRANSLATIONS[language];

  // Refresh data from backend
  const refreshData = async () => {
    try {
      const [cropsRes, offersRes, usersRes] = await Promise.all([
        fetch('/api/crops'),
        fetch('/api/offers'),
        fetch('/api/users'),
      ]);

      if (cropsRes.ok) {
        const cropsData = await cropsRes.json();
        if (cropsData.crops) setCrops(cropsData.crops);
      }

      if (offersRes.ok) {
        const offersData = await offersRes.json();
        if (offersData.offers) setOffers(offersData.offers);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.users) setAllUsers(usersData.users);
      }
    } catch (err) {
      console.warn('API sync warning (using in-memory fallback):', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenChat = (listingId: string, recipientName: string) => {
    setChatModal({
      isOpen: true,
      listingId,
      recipientName,
    });
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans antialiased flex flex-col selection:bg-emerald-200">
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        currentRole={currentRole}
        language={language}
        onSelectRole={(role) => setCurrentRole(role)}
        onSelectUser={(u) => {
          setCurrentUser(u);
          setCurrentRole(u.role);
        }}
        onSelectLanguage={(lang) => setLanguage(lang)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenPhoneSimulator={() => setIsPhoneSimulatorOpen(true)}
        onOpenTelephonyDrawer={() => setIsTelephonyDrawerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {activeTab === 'farmer-hub' && (
          <FarmerDashboard
            currentUser={currentUser}
            crops={crops}
            offers={offers}
            language={language}
            onOpenListingModal={() => setIsListingModalOpen(true)}
            onRefreshData={refreshData}
            onOpenChat={handleOpenChat}
          />
        )}

        {activeTab === 'marketplace' && (
          <TraderMarketplace
            currentUser={currentUser}
            crops={crops}
            offers={offers}
            language={language}
            onRefreshData={refreshData}
            onOpenChat={handleOpenChat}
          />
        )}

        {activeTab === 'mandi-prices' && (
          <MandiPricesView language={language} />
        )}
      </main>

      {/* Floating Krishi AI Assistant Button (Always reachable) */}
      <aside aria-label="Quick Actions" className="fixed bottom-18 md:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
          title="Open Krishi Mitra AI Doctor"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight">Krishi Mitra AI</p>
            <p className="text-[10px] text-emerald-200">Voice &amp; Disease Doctor</p>
          </div>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
        </button>
      </aside>

      {/* Modals */}
      <CropListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        currentUser={currentUser}
        language={language}
        onListingCreated={refreshData}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        language={language}
      />

      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={() => setChatModal({ ...chatModal, isOpen: false })}
        listingId={chatModal.listingId}
        recipientName={chatModal.recipientName}
        currentUser={currentUser}
      />

      <PhoneSimulatorModal
        isOpen={isPhoneSimulatorOpen}
        onClose={() => setIsPhoneSimulatorOpen(false)}
        onListingCreated={refreshData}
      />

      <TelephonyAdminDrawer
        isOpen={isTelephonyDrawerOpen}
        onClose={() => setIsTelephonyDrawerOpen(false)}
        onLaunchSimulator={() => setIsPhoneSimulatorOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 text-xs py-8 px-4 sm:px-6 lg:px-8 border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                KrishiConnect AI <span className="text-emerald-400 font-normal">| कृषि कनेक्ट</span>
              </p>
              <p className="text-stone-400 text-[11px]">
                Empowering Indian Farmers &amp; APMC Traders with Gemini AI &amp; Fair Market Intelligence
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-stone-400 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Direct APMC &amp; Farm Trade
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              Multilingual (EN / हिन्दी / मराठी)
            </span>
            <span>•</span>
            <span className="text-stone-500">
              National Kisan Call Center: <a href="tel:18001801551" className="text-emerald-400 font-bold hover:underline">1800-180-1551</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
