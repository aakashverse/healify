import React from 'react';
import { AlertTriangle, PhoneCall, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function EmergencyBanner({ onSelectFirstAid }) {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="p-1 rounded-full bg-white/20 animate-pulse inline-flex shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
          </span>
          <p className="font-semibold text-rose-50 leading-tight text-[11px] sm:text-xs">
            <strong className="text-white uppercase tracking-wider mr-1.5 font-black">
              {t.sosBarTitle}:
            </strong>
            {t.sosBarText}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-red-700 font-black hover:bg-red-50 transition-colors shadow-xs text-xs"
          >
            <PhoneCall className="w-3 h-3 text-red-600 animate-bounce" />
            <span>108</span>
          </a>
          <button
            onClick={onSelectFirstAid}
            className="inline-flex items-center gap-1 font-bold text-white/90 hover:text-white underline underline-offset-4 cursor-pointer text-xs"
          >
            <span>{t.sosFirstAidBtn}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
}
