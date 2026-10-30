import React, { useState } from 'react';
import { 
  HeartPulse, 
  Bot, 
  PhoneCall, 
  Menu, 
  X, 
  Languages, 
  MapPin, 
  FileScan,
  Home,
  ShieldAlert,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ activeTab, onSelectTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'chat', label: t.navChat, icon: Bot, isAi: true },
    { id: 'scanner', label: t.navScanner, icon: FileScan },
    { id: 'hospitals', label: t.navHospitals, icon: MapPin },
    { id: 'firstaid', label: t.navFirstAid, icon: ShieldAlert, isSos: true },
  ];

  return (
    <>
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            
            {/* Brand Logo */}
            <button 
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-all">
                <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    Heal<span className="text-teal-600">-U</span>
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {lang === 'hi' ? 'स्वास्थ्य सेवा' : 'Care'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  {t.brandTagline}
                </p>
              </div>
            </button>

            {/* Desktop Navigation Segmented Pill Bar */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? item.isAi
                          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm'
                          : item.isSos
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${
                      isActive 
                        ? 'text-white' 
                        : item.isAi 
                        ? 'text-teal-600' 
                        : item.isSos 
                        ? 'text-rose-600' 
                        : 'text-slate-500'
                    }`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar: Single-Click Language Switcher & SOS */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* SINGLE-CLICK LANGUAGE TOGGLE BUTTON */}
              <button
                onClick={toggleLang}
                className="group flex items-center gap-1.5 p-1 sm:px-3 sm:py-2 rounded-xl border-2 border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/50 text-slate-800 transition-all cursor-pointer shadow-2xs"
                title="Single-click to switch language (English / हिन्दी)"
                aria-label="Change language"
              >
                <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  <Languages className="w-4 h-4 text-teal-700" />
                </div>
                <div className="flex items-center text-xs font-black px-1">
                  <span className={`${lang === 'en' ? 'text-teal-700 font-black' : 'text-slate-400'}`}>
                    EN
                  </span>
                  <span className="mx-1 text-slate-300">/</span>
                  <span className={`${lang === 'hi' ? 'text-teal-700 font-black' : 'text-slate-400'}`}>
                    हिन्दी
                  </span>
                </div>
              </button>

              {/* Direct 108 Emergency Call */}
              <a 
                href="tel:108" 
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-600/20 transition-all text-xs font-black"
                title="Call 108 National Emergency Ambulance"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <PhoneCall className="w-3.5 h-3.5" />
                <span>108</span>
              </a>

              {/* Mobile Drawer Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 shadow-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                    isActive
                      ? item.isAi
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                        : item.isSos
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  toggleLang();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-2xl border-2 border-teal-300 bg-teal-50 text-teal-800 font-black text-sm flex items-center justify-center gap-2"
              >
                <Languages className="w-4 h-4" />
                <span>{t.langToggleBtn}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly for rural & urban smartphone users) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? item.isAi
                    ? 'text-teal-600 scale-105 font-black'
                    : item.isSos
                    ? 'text-rose-600 scale-105 font-black'
                    : 'text-slate-900 scale-105 font-black'
                  : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${
                isActive 
                  ? item.isAi 
                    ? 'bg-teal-50 text-teal-700' 
                    : item.isSos 
                    ? 'bg-rose-50 text-rose-700' 
                    : 'bg-slate-100 text-slate-900'
                  : 'text-slate-500'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 leading-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
