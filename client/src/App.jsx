import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './Components/Navbar';
import EmergencyBanner from './Components/EmergencyBanner';
import HomeView from './Components/HomeView';
import ChatView from './Components/ChatView';
import PrescriptionScanner from './Components/PrescriptionScanner';
import FacilitiesExplorer from './Components/FacilitiesExplorer';
import FirstAidGuide from './Components/FirstAidGuide';
import HealthRecordsView from './Components/HealthRecordsView';
import AuthModal from './Components/AuthModal';
import Footer from './Components/Footer';
import { Bot, Sparkles } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'chat' | 'scanner' | 'records' | 'hospitals' | 'firstaid'
  const [chatInitialQuery, setChatInitialQuery] = useState('');
  const { lang, t } = useLanguage();

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchQuery = (query) => {
    setChatInitialQuery(query);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900 antialiased">
      
      {/* 1. Emergency Top Ribbon */}
      <EmergencyBanner onSelectFirstAid={() => handleSelectTab('firstaid')} />

      {/* 2. Top Header & Tab Navigation Bar with 1-Click Language Switcher, User Profile & Mobile Bottom Nav */}
      <Navbar 
        activeTab={activeTab} 
        onSelectTab={handleSelectTab} 
      />

      {/* 3. Main Dedicated View Display */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView 
            onSelectTab={handleSelectTab} 
            onSearchQuery={handleSearchQuery} 
          />
        )}

        {activeTab === 'chat' && (
          <ChatView 
            initialQuery={chatInitialQuery}
            onClearInitialQuery={() => setChatInitialQuery('')}
            onBack={() => handleSelectTab('home')}
          />
        )}

        {activeTab === 'scanner' && (
          <PrescriptionScanner 
            onBack={() => handleSelectTab('home')} 
            onViewRecords={() => handleSelectTab('records')}
          />
        )}

        {activeTab === 'records' && (
          <HealthRecordsView 
            onSelectTab={handleSelectTab} 
          />
        )}

        {activeTab === 'hospitals' && (
          <FacilitiesExplorer 
            onBack={() => handleSelectTab('home')} 
          />
        )}

        {activeTab === 'firstaid' && (
          <FirstAidGuide 
            onBack={() => handleSelectTab('home')} 
          />
        )}
      </main>

      {/* 4. Global Auth Modal (Login / Sign Up) */}
      <AuthModal />

      {/* 5. Footer */}
      <Footer onSelectTab={handleSelectTab} />

      {/* 6. Floating "Ask Cura AI" Launcher (Compact & Elegant) */}
      {activeTab !== 'chat' && (
        <div className="hidden lg:block fixed bottom-5 right-5 z-40">
          <button
            onClick={() => handleSelectTab('chat')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
            aria-label="Open Cura AI Assistant"
          >
            <Bot className="w-4 h-4" />
            <span>{lang === 'hi' ? 'डॉक्टर AI' : 'Ask Cura AI'}</span>
          </button>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
