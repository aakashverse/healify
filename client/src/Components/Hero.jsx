import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  FileScan, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Hero({ onOpenAssistant, onOpenQuery }) {
  const [searchInput, setSearchInput] = useState('');

  const sampleSymptoms = [
    { label: 'Fever & Chills (बुखार)', query: 'Mujhe 2 din se tez bukhar aur thand lag rahi hai' },
    { label: 'Diarrhea & Vomiting (दस्त)', query: 'Child has severe loose motions and vomiting since morning' },
    { label: 'Chest Pressure (सीने में दर्द)', query: 'Severe chest pain radiating to left arm', isSos: true },
    { label: 'Cough & Throat (खांसी)', query: 'Dry irritating cough and throat soreness for 4 days' },
    { label: 'Antenatal Checkup (गर्भावस्था)', query: 'Pregnancy nutrition and immunization schedule' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onOpenQuery(searchInput.trim());
    } else {
      onOpenAssistant();
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50/50 pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-slate-100">
      
      {/* Subtle Background Glow Rings */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-sky-200/50 blur-3xl"></div>
        <div className="absolute top-20 right-10 w-80 h-80 rounded-full bg-teal-200/40 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Value Prop, Search */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Verified Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 shadow-xs text-sky-800 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ICMR & WHO Clinical Guidelines Grounded</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              <span className="text-teal-700">English + हिन्दी</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Compassionate, Instant <br />
              <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Medical Guidance
              </span>{' '}
              For Every Village & Home.
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Describe symptoms in your own mother tongue, scan handwritten prescription slips with Vision AI, or instantly locate emergency-equipped Primary Health Centres.
            </p>

            {/* Interactive Symptom Input Box */}
            <div className="bg-white p-2.5 rounded-2xl shadow-xl shadow-sky-900/5 border border-slate-200/80 max-w-xl mx-auto lg:mx-0">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Describe symptoms, e.g. 'बुखार और कमजोरी' or 'child cough'..."
                    className="w-full pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Ask Cura AI</span>
                </button>
              </form>
            </div>

            {/* Quick Symptom Chips */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Popular Quick Inquiries:
              </div>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {sampleSymptoms.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => onOpenQuery(s.query)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      s.isSos
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50/50 shadow-2xs'
                    }`}
                  >
                    {s.isSos && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Points */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0">
              <div className="text-left">
                <p className="text-2xl font-black text-slate-900">24 / 7</p>
                <p className="text-xs text-slate-500 font-medium">Free Clinical Triage</p>
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-teal-600">100%</p>
                <p className="text-xs text-slate-500 font-medium">WHO Protocols</p>
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-sky-600">&lt; 3 sec</p>
                <p className="text-xs text-slate-500 font-medium">Emergency Response</p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Clinical Snapshot Preview Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Assistant Floating Showcase Card */}
            <div className="relative mx-auto max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-sky-900/10 border border-slate-100">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      Cura AI Assistant
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </h2>
                    <p className="text-xs text-slate-500">Medical AI Companion & Triage</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                  Online
                </span>
              </div>

              {/* Sample Chat Bubble Dialogue */}
              <div className="py-4 space-y-3.5">
                
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-sky-600 text-white text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] shadow-xs">
                    "2 din se tez bukhar hai aur badan me dard hai, kya karein?"
                  </div>
                </div>

                {/* AI Response Card */}
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 text-slate-800 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-xs space-y-2">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>ICMR Guideline Recommendation</span>
                    </div>
                    <p className="leading-relaxed text-slate-700">
                      1. मरीज को हवादार जगह पर रखें और माथे व बदन पर सादे पानी की पट्टी रखें।<br />
                      2. खूब पानी, दाल का पानी या ओआरएस पिलाएं।<br />
                      3. बुखार 48 घंटे से अधिक रहे तो तुरंत नजदीकी PHC जाकर खून जांच कराएं।
                    </p>
                    <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60">
                      <span>Source: National Health Mission Protocol</span>
                      <span className="text-teal-600 font-semibold">Triage Safe</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Action Prompt */}
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileScan className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-semibold text-teal-900">
                      Have a paper prescription?
                    </span>
                  </div>
                  <button
                    onClick={onOpenAssistant}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 underline underline-offset-2 cursor-pointer"
                  >
                    Scan with Vision
                  </button>
                </div>

              </div>

              {/* Card Footer CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Ready to assist you</span>
                <button
                  onClick={onOpenAssistant}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <span>Open Full Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Small Floating Pill: 108 Emergency ready */}
            <div className="absolute -bottom-4 -left-2 sm:left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-xs font-bold text-slate-800">
                108 Emergency Ambulance Integrated
              </span>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
