import React from 'react';
import { HeartPulse, PhoneCall, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onSelectTab }) {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 lg:pb-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Heal<span className="text-teal-400">-U</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm font-medium">
              {t.brandTagline}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>WHO & ICMR Guidelines</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {lang === 'hi' ? 'सेवाएं' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
              <li>
                <button onClick={() => onSelectTab('home')} className="hover:text-teal-400 cursor-pointer">
                  {t.navHome}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('chat')} className="hover:text-teal-400 text-teal-400 font-bold cursor-pointer">
                  {t.navChat}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('scanner')} className="hover:text-teal-400 cursor-pointer">
                  {t.navScanner}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('hospitals')} className="hover:text-teal-400 cursor-pointer">
                  {t.navHospitals}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('firstaid')} className="hover:text-teal-400 text-rose-400 cursor-pointer">
                  {t.navFirstAid}
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div className="lg:col-span-4 space-y-2.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-red-400" />
              <span>{lang === 'hi' ? 'आपातकालीन नंबर' : 'National Helplines'}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-black">108</span>
                <p className="text-xs sm:text-sm font-black text-rose-400">{t.helpline108Name}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-black">102</span>
                <p className="text-xs sm:text-sm font-black text-amber-400">{t.helpline102Name}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="text-center md:text-left max-w-2xl leading-relaxed">
            {t.footerDisclaimer}
          </p>

          <p className="flex items-center gap-1 shrink-0 text-slate-400 font-medium">
            <span>{t.footerCredits}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>

      </div>
    </footer>
  );
}
