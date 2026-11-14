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
  FolderHeart,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Droplet
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, onSelectTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { lang, toggleLang, t } = useLanguage();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'chat', label: t.navChat, icon: Bot, isAi: true },
    { id: 'scanner', label: t.navScanner, icon: FileScan },
    { id: 'records', label: t.navRecords, icon: FolderHeart },
    { id: 'hospitals', label: t.navHospitals, icon: MapPin },
    { id: 'firstaid', label: t.navFirstAid, icon: ShieldAlert, isSos: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-15">
            
            {/* Brand Logo */}
            <button 
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Heal<span className="text-emerald-600">-U</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Health
                </span>
              </div>
            </button>

            {/* Desktop Navigation Segmented Pill Bar */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? item.isAi
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : item.isSos
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${
                      isActive 
                        ? 'text-white' 
                        : item.isAi 
                        ? 'text-emerald-600' 
                        : item.isSos 
                        ? 'text-rose-600' 
                        : 'text-slate-500'
                    }`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2">
              
              {/* Single-Click Language Toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-slate-700 transition-all cursor-pointer text-xs font-semibold shadow-2xs"
                title="Switch Language (English / हिन्दी)"
                aria-label="Change language"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {/* User Profile / Login */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900 transition-all cursor-pointer shadow-2xs"
                    aria-label="User account menu"
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold max-w-[85px] sm:max-w-[120px] truncate">
                      {user?.name ? user.name.split(' ')[0] : 'User'}
                    </span>
                    {(user?.blood_group || user?.bloodGroup) && (
                      <span className="hidden sm:inline text-[10px] text-rose-700 font-bold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 shrink-0">
                        {user.blood_group || user.bloodGroup}
                      </span>
                    )}
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>

                  {profileDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setProfileDropdownOpen(false)} 
                      />
                      <div 
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 text-xs"
                      >
                        <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
                          <p className="font-bold text-slate-900 truncate text-xs sm:text-sm">{user?.name || 'User'}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                          {(user?.blood_group || user?.bloodGroup) && (
                            <p className="text-[10px] text-rose-700 font-bold mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
                              <Droplet className="w-3 h-3 text-rose-600" />
                              <span>{lang === 'hi' ? 'रक्त समूह' : 'Blood'}: {user?.blood_group || user?.bloodGroup}</span>
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            onSelectTab('records');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <FolderHeart className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.navRecords}</span>
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full px-3.5 py-2 text-left font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t.authLogout}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t.navLogin}</span>
                </button>
              )}

              {/* Direct 108 Emergency Call */}
              <a 
                href="tel:108" 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all text-xs font-bold shadow-2xs"
                title="Call 108 Emergency Ambulance"
              >
                <PhoneCall className="w-3 h-3" />
                <span>108</span>
              </a>

              {/* Mobile Drawer Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 animate-in slide-in-from-top-2 shadow-lg">
            {isAuthenticated ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 mb-2 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    {(user?.blood_group || user?.bloodGroup) && (
                      <span className="text-[10px] text-rose-700 font-bold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 inline-block mt-0.5">
                        {user.blood_group || user.bloodGroup}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 shrink-0 cursor-pointer"
                >
                  {t.authLogout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 mb-2 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.navLogin}</span>
              </button>
            )}

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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? item.isAi
                        ? 'bg-emerald-600 text-white font-bold'
                        : item.isSos
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all ${
                isActive
                  ? item.isAi
                    ? 'text-emerald-700 font-bold'
                    : item.isSos
                    ? 'text-rose-600 font-bold'
                    : 'text-slate-900 font-bold'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isActive 
                  ? item.isAi 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : item.isSos 
                    ? 'bg-rose-50 text-rose-700' 
                    : 'bg-slate-100 text-slate-900'
                  : 'text-slate-500'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] mt-0.5 leading-tight truncate max-w-[50px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
