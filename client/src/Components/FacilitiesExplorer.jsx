import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  PhoneCall, 
  Clock, 
  ShieldCheck, 
  Search, 
  Ambulance, 
  Droplet, 
  RefreshCw,
  ArrowLeft,
  Hospital
} from 'lucide-react';

import { fetchFacilities } from '../services/facilities.api';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_FACILITIES = [
  {
    id: 'dh-sultanpur',
    name: 'District Hospital Sultanpur (जिला अस्पताल सुल्तानपुर)',
    type: 'District Hospital',
    distance: '3.5 km',
    address: 'Civil Lines, Sultanpur, Uttar Pradesh',
    phone: '+91-5362-240100',
    emergency_24x7: true,
    anti_venom_available: true,
    blood_bank: true,
    ambulance: '108'
  },
  {
    id: 'chc-dubeypur',
    name: 'Community Health Centre (CHC) Dubeypur (सामुदायिक स्वास्थ्य केंद्र)',
    type: 'CHC',
    distance: '6.2 km',
    address: 'Dubeypur Block, Sultanpur, Uttar Pradesh',
    phone: '+91-9450000001',
    emergency_24x7: true,
    anti_venom_available: true,
    blood_bank: false,
    ambulance: '108'
  },
  {
    id: 'chc-kurebhar',
    name: 'Community Health Centre (CHC) Kurebhar (सामुदायिक स्वास्थ्य केंद्र)',
    type: 'CHC',
    distance: '12.0 km',
    address: 'Ayodhya-Prayagraj Highway, Kurebhar, Sultanpur',
    phone: '+91-9450000002',
    emergency_24x7: true,
    anti_venom_available: true,
    blood_bank: false,
    ambulance: '108'
  },
  {
    id: 'phc-dhanpatganj',
    name: 'Primary Health Centre (PHC) Dhanpatganj (प्राथमिक स्वास्थ्य केंद्र)',
    type: 'PHC',
    distance: '14.8 km',
    address: 'Dhanpatganj, Sultanpur, Uttar Pradesh',
    phone: '+91-9450000003',
    emergency_24x7: false,
    anti_venom_available: true,
    blood_bank: false,
    ambulance: '108'
  }
];

export default function FacilitiesExplorer({ onBack }) {
  const { lang, t } = useLanguage();
  const [facilities, setFacilities] = useState(DEFAULT_FACILITIES);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadFacilitiesData = async () => {
    setLoading(true);
    try {
      const data = await fetchFacilities();
      if (data && data.facilities && data.facilities.length > 0) {
        setFacilities(data.facilities);
      }
    } catch (err) {
      console.warn('Using fallback facility data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilitiesData();
  }, []);

  const filteredFacilities = facilities.filter((fac) => {
    const matchesFilter = filterType === 'ALL' || fac.type === filterType;
    const matchesSearch = 
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterTabs = [
    { id: 'ALL', label: t.facFilterAll },
    { id: 'District Hospital', label: t.facFilterDH },
    { id: 'CHC', label: t.facFilterCHC },
    { id: 'PHC', label: t.facFilterPHC },
  ];

  return (
    <div className="animate-view-fade max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 lg:pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.facTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t.facSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={loadFacilitiesData}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-700 hover:bg-slate-100 shadow-2xs transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          <span>{t.facRefresh}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.facSearchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredFacilities.map((fac) => (
          <div
            key={fac.id}
            className="rounded-3xl bg-white border-2 border-slate-200 hover:border-emerald-500 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Type + Distance */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-800 uppercase tracking-wide">
                  {fac.type}
                </span>

                <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-black text-xs border border-emerald-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {fac.distance}
                </span>
              </div>

              {/* Hospital Name */}
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 mb-1.5 leading-snug">
                {fac.name}
              </h3>

              <p className="text-xs text-slate-500 font-medium mb-4">
                {fac.address}
              </p>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black ${
                  fac.emergency_24x7 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  {fac.emergency_24x7 ? t.fac24x7 : t.facDayOnly}
                </span>

                {fac.anti_venom_available && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-amber-50 text-amber-900 border border-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    {t.facAsv}
                  </span>
                )}

                {fac.blood_bank && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-rose-50 text-rose-800 border border-rose-200">
                    <Droplet className="w-3.5 h-3.5 text-rose-600" />
                    {t.facBloodBank}
                  </span>
                )}
              </div>
            </div>

            {/* Direct Call Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <a
                href={`tel:${fac.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t.facCallNow}</span>
              </a>

              <a
                href="tel:108"
                className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs border border-red-200 transition-colors"
                title="Direct 108 Dispatch"
              >
                <Ambulance className="w-4 h-4 text-red-600" />
                <span>108</span>
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
