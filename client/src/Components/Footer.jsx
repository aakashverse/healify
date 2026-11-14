import React from 'react';
import { HeartPulse, PhoneCall, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onSelectTab }) {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 py-8 pb-20 lg:pb-8 border-t border-slate-800 mt-auto text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Heal<span className="text-emerald-400">-U</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm">
              {t.brandTagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">
              {lang === 'hi' ? 'सेवाएं' : 'Navigation'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
              <li>
                <button onClick={() => onSelectTab('home')} className="hover:text-emerald-400 cursor-pointer">
                  {t.navHome}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('chat')} className="hover:text-emerald-400 text-emerald-400 font-semibold cursor-pointer">
                  {t.navChat}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('scanner')} className="hover:text-emerald-400 cursor-pointer">
                  {t.navScanner}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('records')} className="hover:text-emerald-400 cursor-pointer">
                  {t.navRecords}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('hospitals')} className="hover:text-emerald-400 cursor-pointer">
                  {t.navHospitals}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('firstaid')} className="hover:text-rose-400 text-rose-400 cursor-pointer">
                  {t.navFirstAid}
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'hi' ? 'आपातकालीन नंबर' : 'National Helplines'}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">108</span>
                <p className="text-xs font-bold text-rose-400">{t.helpline108Name}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">102</span>
                <p className="text-xs font-bold text-amber-400">{t.helpline102Name}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p className="text-center md:text-left max-w-xl">
            {t.footerDisclaimer}
          </p>

          <p className="flex items-center gap-1 shrink-0 text-slate-400">
            <span>{t.footerCredits}</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>

      </div>
    </footer>
  );
}
