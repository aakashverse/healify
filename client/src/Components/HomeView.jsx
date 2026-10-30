import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  Sparkles, 
  FileScan, 
  MapPin, 
  ShieldAlert, 
  ArrowRight, 
  PhoneCall, 
  HeartPulse, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Ambulance,
  Baby,
  Building2,
  Stethoscope,
  Pill,
  Hospital,
  Activity,
  CheckCircle2
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
      gradient: 'from-teal-600 via-cyan-600 to-blue-600',
      badge: lang === 'hi' ? 'ICMR व WHO दिशानिर्देश' : 'ICMR & WHO Protocol',
      borderHover: 'hover:border-teal-500',
      tagColor: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      id: 'scanner',
      title: t.card2Title,
      desc: t.card2Desc,
      btnText: t.card2Btn,
      icon: FileScan,
      gradient: 'from-blue-600 via-indigo-600 to-cyan-600',
      badge: lang === 'hi' ? 'विज़न AI स्कैनर' : 'Vision AI Scanner',
      borderHover: 'hover:border-blue-500',
      tagColor: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      id: 'hospitals',
      title: t.card3Title,
      desc: t.card3Desc,
      btnText: t.card3Btn,
      icon: Hospital,
      gradient: 'from-emerald-600 to-teal-700',
      badge: lang === 'hi' ? 'एंटी-वेनम व 24x7 इमरजेंसी' : 'Anti-Venom & 24x7',
      borderHover: 'hover:border-emerald-500',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'firstaid',
      title: t.card4Title,
      desc: t.card4Desc,
      btnText: t.card4Btn,
      icon: ShieldAlert,
      gradient: 'from-rose-600 via-red-600 to-amber-600',
      badge: lang === 'hi' ? 'गोल्डन ऑवर SOPs' : 'Life-Saving SOPs',
      borderHover: 'hover:border-rose-500',
      tagColor: 'bg-rose-50 text-rose-800 border-rose-200'
    },
  ];

  const helplines = [
    { number: '108', title: t.helpline108Name, desc: t.helpline108Sub, icon: Ambulance, color: 'text-rose-700 bg-rose-50/70 border-rose-200 hover:border-rose-400' },
    { number: '102', title: t.helpline102Name, desc: t.helpline102Sub, icon: Baby, color: 'text-amber-700 bg-amber-50/70 border-amber-200 hover:border-amber-400' },
    { number: '112', title: t.helpline112Name, desc: t.helpline112Sub, icon: ShieldAlert, color: 'text-sky-700 bg-sky-50/70 border-sky-200 hover:border-sky-400' },
    { number: '1075', title: t.helpline1075Name, desc: t.helpline1075Sub, icon: Stethoscope, color: 'text-teal-700 bg-teal-50/70 border-teal-200 hover:border-teal-400' },
  ];

  return (
    <div className="animate-view-fade py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-24 lg:pb-14">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-black tracking-wide shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>{lang === 'hi' ? 'ग्रामीण एवं शहरी स्वास्थ्य पोर्टल' : 'Rural & Urban Community Health Portal'}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-snug">
          {t.heroGreeting}
        </h1>

        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          {t.heroSubtitle}
        </p>

        {/* Big Clean Search Box */}
        <div className="pt-2 max-w-2xl mx-auto">
          <form 
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border-2 border-slate-300 hover:border-teal-500 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100 shadow-md transition-all gap-2"
          >
            <div className="flex items-center flex-1 px-2 py-1">
              <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
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
              className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white font-black text-xs sm:text-sm hover:from-teal-700 hover:to-blue-700 shadow-sm cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{t.searchBtn}</span>
            </button>
          </form>

          {/* Quick Clickable Symptom Chips */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-bold text-slate-400 mr-1">
              {t.popularInquiries}
            </span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => onSearchQuery(chip.query)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  chip.isSos
                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-800 shadow-2xs'
                }`}
              >
                {chip.isSos && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2. THE 4 PRIMARY SERVICE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2">
        {primaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => onSelectTab(card.id)}
              className={`group relative rounded-3xl bg-white border-2 border-slate-200/90 ${card.borderHover} p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between`}
            >
              <div>
                
                {/* Header: Icon + Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${card.gradient} text-white flex items-center justify-center shadow-md shadow-slate-300/40 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${card.tagColor}`}>
                    {card.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                  {card.desc}
                </p>

              </div>

              {/* Action Button Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                  <span>{card.btnText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* 3. Direct Emergency Helplines 4-Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 space-y-5 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-red-600" />
              <span>{t.helplinesTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {lang === 'hi' ? 'किसी भी मोबाइल या लैंडलाइन से बिना बैलेंस के तुरंत कॉल करें' : 'Toll-free emergency numbers accessible 24/7 with zero balance'}
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
            24x7 Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {helplines.map((line, idx) => {
            const LineIcon = line.icon;

            return (
              <a
                key={idx}
                href={`tel:${line.number}`}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between group cursor-pointer ${line.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl sm:text-2xl font-black">{line.number}</span>
                    <LineIcon className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900">{line.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">{line.desc}</p>
                </div>
                
                <span className="mt-3 text-[11px] font-black underline underline-offset-2 flex items-center gap-1">
                  <span>{lang === 'hi' ? 'कॉल लगाएं' : 'Call Now'}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </a>
            );
          })}
        </div>

      </div>

    </div>
  );
}
