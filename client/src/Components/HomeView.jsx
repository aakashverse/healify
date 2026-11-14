import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  Sparkles, 
  FileScan, 
  ShieldAlert, 
  ArrowRight, 
  PhoneCall, 
  AlertCircle,
  Ambulance,
  Baby,
  Stethoscope,
  Hospital
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HomeView({ onSelectTab, onSearchQuery }) {
  const { lang, t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');

  const quickChips = [
    { label: t.chipFever, query: lang === 'hi' ? '2 दिन से तेज बुखार और कंपकंपी है' : 'I have high fever and chills for 2 days' },
    { label: t.chipLooseMotion, query: lang === 'hi' ? 'बच्चे को उल्टी और दस्त हो रहे हैं, ओआरएस कैसे दें?' : 'Child has diarrhea and vomiting, how to give ORS?' },
    { label: t.chipChestPain, query: lang === 'hi' ? 'सीने में तेज दर्द और पसीना आ रहा है' : 'Severe chest pain radiating to left arm', isSos: true },
    { label: t.chipCough, query: lang === 'hi' ? 'सूखी खांसी और गले में दर्द की दवा' : 'Dry cough and sore throat guidance' },
    { label: t.chipPregnancy, query: lang === 'hi' ? 'गर्भावस्था में नियमित जांच और पोषण' : 'Pregnancy antenatal checkup schedule' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchQuery(searchInput.trim());
    } else {
      onSelectTab('chat');
    }
  };

  const primaryCards = [
    {
      id: 'chat',
      title: t.card1Title,
      desc: t.card1Desc,
      btnText: t.card1Btn,
      icon: Bot,
      iconColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: lang === 'hi' ? 'AI परामर्श' : 'AI Triage',
      borderHover: 'hover:border-emerald-500',
      badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'scanner',
      title: t.card2Title,
      desc: t.card2Desc,
      btnText: t.card2Btn,
      icon: FileScan,
      iconColor: 'bg-slate-100 text-slate-800 border-slate-200',
      badge: lang === 'hi' ? 'विज़न AI' : 'Vision AI',
      borderHover: 'hover:border-slate-500',
      badgeStyle: 'bg-slate-100 text-slate-800 border-slate-200'
    },
    {
      id: 'hospitals',
      title: t.card3Title,
      desc: t.card3Desc,
      btnText: t.card3Btn,
      icon: Hospital,
      iconColor: 'bg-teal-50 text-teal-800 border-teal-200',
      badge: lang === 'hi' ? '24x7 केंद्र' : '24x7 Centres',
      borderHover: 'hover:border-teal-500',
      badgeStyle: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      id: 'firstaid',
      title: t.card4Title,
      desc: t.card4Desc,
      btnText: t.card4Btn,
      icon: ShieldAlert,
      iconColor: 'bg-rose-50 text-rose-700 border-rose-200',
      badge: lang === 'hi' ? 'प्राथमिक उपचार' : 'Emergency SOP',
      borderHover: 'hover:border-rose-500',
      badgeStyle: 'bg-rose-50 text-rose-800 border-rose-200'
    },
  ];

  const helplines = [
    { number: '108', title: t.helpline108Name, desc: t.helpline108Sub, icon: Ambulance, color: 'text-rose-700 bg-rose-50/50 border-rose-200 hover:border-rose-400' },
    { number: '102', title: t.helpline102Name, desc: t.helpline102Sub, icon: Baby, color: 'text-amber-700 bg-amber-50/50 border-amber-200 hover:border-amber-400' },
    { number: '112', title: t.helpline112Name, desc: t.helpline112Sub, icon: ShieldAlert, color: 'text-slate-800 bg-slate-50 border-slate-200 hover:border-slate-400' },
    { number: '1075', title: t.helpline1075Name, desc: t.helpline1075Sub, icon: Stethoscope, color: 'text-emerald-700 bg-emerald-50/50 border-emerald-200 hover:border-emerald-400' },
  ];

  return (
    <div className="animate-view-fade py-6 sm:py-8 max-w-6xl mx-auto px-4 sm:px-6 space-y-8 pb-20 lg:pb-12">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t.heroGreeting}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
          {t.heroSubtitle}
        </p>

        {/* Clean, Compact Search Box */}
        <div className="pt-1 max-w-xl mx-auto">
          <form 
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white p-1 rounded-xl border border-slate-300 hover:border-emerald-500 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 shadow-2xs transition-all gap-1.5"
          >
            <div className="flex items-center flex-1 px-2.5 py-1">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none bg-transparent font-medium"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-2xs cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>{t.searchBtn}</span>
            </button>
          </form>

          {/* Clickable Symptom Chips */}
          <div className="pt-2.5 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">
              {t.popularInquiries}
            </span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => onSearchQuery(chip.query)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                  chip.isSos
                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-800 shadow-2xs'
                }`}
              >
                {chip.isSos && <AlertCircle className="w-3 h-3 text-rose-600" />}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2. PRIMARY SERVICE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {primaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => onSelectTab(card.id)}
              className={`group rounded-2xl bg-white border border-slate-200 ${card.borderHover} p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between`}
            >
              <div>
                {/* Header: Icon + Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.iconColor} transition-transform group-hover:scale-105`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${card.badgeStyle}`}>
                    {card.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed font-normal mb-4">
                  {card.desc}
                </p>
              </div>

              {/* Action Button Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-emerald-700 group-hover:text-emerald-800 transition-colors flex items-center gap-1">
                  <span>{card.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Emergency Helplines Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {t.helplinesTitle}
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
            24x7 Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {helplines.map((line, idx) => {
            const LineIcon = line.icon;

            return (
              <a
                key={idx}
                href={`tel:${line.number}`}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between group cursor-pointer ${line.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-extrabold">{line.number}</span>
                    <LineIcon className="w-4 h-4 opacity-80" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">{line.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">{line.desc}</p>
                </div>
                
                <span className="mt-2 text-[10px] font-bold flex items-center gap-0.5 text-slate-700 group-hover:text-slate-900">
                  <span>{lang === 'hi' ? 'कॉल करें' : 'Call'}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </a>
            );
          })}
        </div>
      </div>

    </div>
  );
}
