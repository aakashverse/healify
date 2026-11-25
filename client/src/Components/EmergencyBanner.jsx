import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, PhoneCall, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function EmergencyBanner({ onSelectFirstAid }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleFirstAidClick = () => {
    if (onSelectFirstAid) {
      onSelectFirstAid();
    } else {
      navigate('/firstaid');
    }
  };

  return (
    <div className="bg-rose-950 text-rose-100 px-3 sm:px-4 py-1 text-[11px] sm:text-xs border-b border-rose-900/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
        
        <div className="flex items-center gap-1.5 text-center sm:text-left">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <p className="font-medium text-rose-200">
            <span className="font-bold text-white uppercase mr-1">{t.sosBarTitle}:</span>
            {t.sosBarText}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:108"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors text-[11px]"
          >
            <PhoneCall className="w-2.5 h-2.5" />
            <span>108</span>
          </a>
          <button
            onClick={handleFirstAidClick}
            className="inline-flex items-center gap-1 font-semibold text-rose-300 hover:text-white cursor-pointer text-[11px]"
          >
            <span>{t.sosFirstAidBtn}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
}
