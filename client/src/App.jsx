import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './Components/Navbar';
import EmergencyBanner from './Components/EmergencyBanner';
import HomeView from './Components/HomeView';
import ChatView from './Components/ChatView';
import PrescriptionScanner from './Components/PrescriptionScanner';
import FacilitiesExplorer from './Components/FacilitiesExplorer';
import FirstAidGuide from './Components/FirstAidGuide';
import Footer from './Components/Footer';
import { Bot, Sparkles } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'chat' | 'scanner' | 'hospitals' | 'firstaid'
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

      {/* 2. Top Header & Tab Navigation Bar with 1-Click Language Switcher + Mobile Bottom Nav */}
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
            onBack={() => handleSelectTab('home')}
          />
        )}

        {activeTab === 'scanner' && (
          <PrescriptionScanner 
            onBack={() => handleSelectTab('home')} 
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

      {/* 4. Footer */}
      <Footer onSelectTab={handleSelectTab} />

      {/* 5. Floating "Ask Cura AI" Launcher (Visible on Desktop when not on chat tab) */}
      {activeTab !== 'chat' && (
        <div className="hidden lg:block fixed bottom-6 right-6 z-40">
          <button
            onClick={() => handleSelectTab('chat')}
            className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white font-black text-sm shadow-xl shadow-teal-600/30 hover:shadow-2xl hover:shadow-teal-600/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Open Cura AI Assistant"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>

            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="tracking-wide">
                {lang === 'hi' ? 'डॉक्टर AI से पूछें' : 'Ask Cura AI'}
              </span>
            </div>

            <Sparkles className="w-4 h-4 text-amber-200" />
          </button>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
