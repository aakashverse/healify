import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ScannerProvider } from './context/ScannerContext';
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
import { Bot } from 'lucide-react';

function MainApp() {
  const { lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900 antialiased">
      
      {/* 1. Emergency Top Ribbon */}
      <EmergencyBanner />

      {/* 2. Top Header & Tab Navigation Bar with 1-Click Language Switcher, User Profile & Mobile Bottom Nav */}
      <Navbar />

      {/* 3. Main Dedicated Route Views */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/chat" element={<ChatView />} />
          <Route path="/scanner" element={<PrescriptionScanner />} />
          <Route path="/records" element={<HealthRecordsView />} />
          <Route path="/hospitals" element={<FacilitiesExplorer />} />
          <Route path="/firstaid" element={<FirstAidGuide />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 4. Global Auth Modal (Login / Sign Up) */}
      <AuthModal />

      {/* 5. Footer */}
      <Footer />

      {/* 6. Floating "Ask Cura AI" Launcher (Compact & Elegant) */}
      {location.pathname !== '/chat' && (
        <div className="hidden lg:block fixed bottom-5 right-5 z-40">
          <button
            onClick={() => {
              navigate('/chat');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ScannerProvider>
            <MainApp />
          </ScannerProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
