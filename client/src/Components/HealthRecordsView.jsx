import React, { useState, useEffect } from 'react';
import { 
  FolderHeart, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Pill, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Droplet, 
  ArrowRight,
  ShieldCheck,
  X,
  FileScan
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  fetchHealthRecords, 
  createHealthRecord, 
  deleteHealthRecord 
} from '../services/records.api';

export default function HealthRecordsView({ onSelectTab }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { t, lang } = useLanguage();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State for adding new record
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('prescription');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDoctor, setNewDoctor] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  
  // Dynamic medicines list inside modal
  const [medicinesList, setMedicinesList] = useState([]);
  const [medName, setMedName] = useState('');
  const [medMorning, setMedMorning] = useState(false);
  const [medAfternoon, setMedAfternoon] = useState(false);
  const [medNight, setMedNight] = useState(false);
  const [medTiming, setMedTiming] = useState('after_food');

  // Vitals inputs
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');

  const [savingRecord, setSavingRecord] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadRecords();
    }
  }, [isAuthenticated, filterType]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await fetchHealthRecords({ 
        type: filterType, 
        search: searchTerm 
      });
      setRecords(data || []);
    } catch (err) {
      console.error('Failed to load health records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    if (!medName.trim()) return;
    setMedicinesList((prev) => [
      ...prev,
      {
        name: medName.trim(),
        schedule: {
          morning: medMorning,
          afternoon: medAfternoon,
          night: medNight
        },
        meal_timing: medTiming
      }
    ]);
    setMedName('');
    setMedMorning(false);
    setMedAfternoon(false);
    setMedNight(false);
  };

  const handleRemoveMedicine = (index) => {
    setMedicinesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert(lang === 'hi' ? 'कृपया रिकॉर्ड का शीर्षक लिखें' : 'Please provide a title for the record');
      return;
    }

    setSavingRecord(true);
    try {
      const vitalStats = {};
      if (bp.trim()) vitalStats.blood_pressure = bp.trim();
      if (pulse.trim()) vitalStats.pulse = pulse.trim();
      if (temperature.trim()) vitalStats.temperature = temperature.trim();
      if (weight.trim()) vitalStats.weight = weight.trim();

      const created = await createHealthRecord({
        title: newTitle.trim(),
        record_type: newType,
        date: newDate,
        doctor_name: newDoctor.trim(),
        facility_name: newFacility.trim(),
        diagnosis: newDiagnosis.trim(),
        medicines: medicinesList,
        vital_stats: vitalStats
      });

      setRecords((prev) => [created, ...prev]);
      setAddModalOpen(false);

      // Reset form
      setNewTitle('');
      setNewDoctor('');
      setNewFacility('');
      setNewDiagnosis('');
      setMedicinesList([]);
      setBp('');
      setPulse('');
      setTemperature('');
      setWeight('');
    } catch (err) {
      alert(err.message || 'Failed to save health record');
    } finally {
      setSavingRecord(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    const confirmDelete = window.confirm(
      lang === 'hi' 
        ? 'क्या आप वाकई इस स्वास्थ्य रिकॉर्ड को हटाना चाहते हैं?' 
        : 'Are you sure you want to delete this health record?'
    );
    if (!confirmDelete) return;

    try {
      await deleteHealthRecord(recordId);
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const handlePrintRecord = (record) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const medicinesHtml = record.medicines && record.medicines.length > 0
      ? record.medicines.map((m, i) => {
          const timingLabel = m.timing || (m.meal_timing === 'after_food' ? 'After Food (भोजन के बाद)' : m.meal_timing === 'before_food' ? 'Before Food (खाली पेट)' : 'As directed');
          const scheduleM = m.dosage ? m.dosage.split('-')[0] || '-' : (m.schedule?.morning ? '1' : '-');
          const scheduleA = m.dosage ? m.dosage.split('-')[1] || '-' : (m.schedule?.afternoon ? '1' : '-');
          const scheduleN = m.dosage ? m.dosage.split('-')[2] || '-' : (m.schedule?.night ? '1' : '-');
          return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${i + 1}. <b>${m.name}</b></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${scheduleM}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${scheduleA}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${scheduleN}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${timingLabel}</td>
          </tr>
        `;
        }).join('')
      : '<tr><td colspan="5" style="padding: 8px; color: #888;">No medications listed</td></tr>';

    const vitalsHtml = record.vital_stats && Object.keys(record.vital_stats).length > 0
      ? Object.entries(record.vital_stats).map(([k, v]) => `<b>${k.replace('_', ' ').toUpperCase()}:</b> ${v}`).join(' &bull; ')
      : 'None recorded';

    printWindow.document.write(`
      <html>
        <head>
          <title>${record.title} - Heal-U</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; font-size: 13px; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; background: #ecfdf5; color: #047857; font-weight: bold; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { background: #f8fafc; padding: 6px 8px; text-align: left; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0 0 6px 0;">Heal-U Patient Health Record</h2>
            <p style="margin: 0; color: #64748b;">Patient: <b>${user?.name || 'Patient'}</b> | Blood Group: <b>${user?.blood_group || 'N/A'}</b> | Date: <b>${record.date}</b></p>
          </div>
          <h3>${record.title} <span class="badge">${(record.record_type || 'Prescription').toUpperCase()}</span></h3>
          <p><b>Doctor / Clinic:</b> ${record.doctor_name || 'Not specified'} ${record.facility_name ? '(' + record.facility_name + ')' : ''}</p>
          <p><b>Diagnosis:</b><br/>${record.diagnosis || 'None'}</p>
          <p><b>Vitals:</b> ${vitalsHtml}</p>
          <h4>Medications:</h4>
          <table>
            <thead>
              <tr><th>Medicine</th><th>M</th><th>A</th><th>N</th><th>Timing</th></tr>
            </thead>
            <tbody>${medicinesHtml}</tbody>
          </table>
          <p style="margin-top: 24px; font-size: 10px; color: #94a3b8;">Printed from Heal-U Community Health Portal</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  // -------------------------------------------------------------
  // GUEST STATE (NOT LOGGED IN)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="animate-view-fade max-w-4xl mx-auto px-4 py-8 space-y-5">
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="max-w-lg space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.recordsGateTitle}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'hi' 
                ? 'अपनी दवा की पर्चियां और जांच रिपोर्ट सुरक्षित रखें' 
                : 'Keep all your prescriptions and health tests safely organized'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {t.recordsGateDesc}
            </p>

            <div className="pt-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t.recordsGateLoginBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileScan className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              {lang === 'hi' ? '1-क्लिक पर्ची सेव' : '1-Click Rx Storage'}
            </h4>
            <p className="text-xs text-slate-500 leading-normal">
              {lang === 'hi' 
                ? 'स्कैनर से जांची गई दवाइयों को सीधे अपने रिकॉर्ड में सुरक्षित करें।' 
                : 'Directly save analyzed medicines and timing schedules from our scanner.'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              {lang === 'hi' ? 'ब्लड ग्रुप व प्रोफाइल' : 'Emergency Profile'}
            </h4>
            <p className="text-xs text-slate-500 leading-normal">
              {lang === 'hi' 
                ? 'आपातकाल में डॉक्टर को तुरंत अपना ब्लड ग्रुप और दवाई एलर्जी बताएं।' 
                : 'Instant access to blood group and drug allergies in clinical emergencies.'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              {lang === 'hi' ? 'प्रिंट व डाउनलोड' : 'Printable Record'}
            </h4>
            <p className="text-xs text-slate-500 leading-normal">
              {lang === 'hi' 
                ? 'अस्पताल या PHC जाते समय अपने रिकॉर्ड का साफ प्रिंट निकालें।' 
                : 'Print clean summaries of past visits when visiting a new clinic or PHC.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED STATE
  // -------------------------------------------------------------
  const rxCount = records.filter(r => r.record_type === 'prescription').length;
  const consultCount = records.filter(r => r.record_type === 'consultation').length;
  const labCount = records.filter(r => r.record_type === 'lab_report').length;

  return (
    <div className="animate-view-fade max-w-5xl mx-auto px-4 py-5 sm:py-6 space-y-4 pb-20 lg:pb-12">
      
      {/* 1. Patient Profile Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {user?.name}
              </h2>
              {user?.blood_group && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  <Droplet className="w-3 h-3 text-rose-600" />
                  {user.blood_group}
                </span>
              )}
              {user?.age && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                  {user.age} {lang === 'hi' ? 'वर्ष' : 'yrs'}
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 font-normal mt-0.5 flex items-center gap-2">
              <span>{user?.email}</span>
              {user?.phone && <span>&bull; {user.phone}</span>}
            </p>

            {user?.allergies && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium mt-1">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{user.allergies}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.recordsAddBtn}</span>
          </button>
        </div>
      </div>

      {/* 2. Metric Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">{lang === 'hi' ? 'कुल रिकॉर्ड' : 'Total Records'}</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{records.length}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">{t.recordsFilterRx}</p>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">{rxCount}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">{t.recordsFilterConsult}</p>
          <p className="text-xl font-bold text-slate-800 mt-0.5">{consultCount}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">{t.recordsFilterLab}</p>
          <p className="text-xl font-bold text-slate-800 mt-0.5">{labCount}</p>
        </div>
      </div>

      {/* 3. Filter Bar & Search Box */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: t.recordsFilterAll },
            { id: 'prescription', label: t.recordsFilterRx },
            { id: 'consultation', label: t.recordsFilterConsult },
            { id: 'lab_report', label: t.recordsFilterLab }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadRecords()}
            placeholder={t.recordsSearchPlaceholder}
            className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 4. Records List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 font-medium space-y-2">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 text-center space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <FolderHeart className="w-5 h-5" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {t.recordsEmptyTitle}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
            {t.recordsEmptyDesc}
          </p>
          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-2xs"
            >
              {t.recordsAddBtn}
            </button>
            <button
              onClick={() => onSelectTab && onSelectTab('scanner')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs cursor-pointer"
            >
              {lang === 'hi' ? 'पर्ची स्कैन करें' : 'Scan Prescription'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {records.map((rec) => {
            const isRx = rec.record_type === 'prescription';
            const isConsult = rec.record_type === 'consultation';
            const isLab = rec.record_type === 'lab_report';

            return (
              <div
                key={rec.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-400 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isRx 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isConsult
                        ? 'bg-slate-100 text-slate-800 border-slate-200'
                        : isLab
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {(rec.record_type || 'Prescription').toUpperCase()}
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {rec.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {rec.title}
                  </h3>

                  {(rec.doctor_name || rec.facility_name) && (
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                      {rec.doctor_name && <span>{rec.doctor_name}</span>}
                      {rec.facility_name && <span className="text-slate-400">&bull; {rec.facility_name}</span>}
                    </p>
                  )}

                  {rec.diagnosis && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {rec.diagnosis}
                    </p>
                  )}

                  {rec.medicines && rec.medicines.length > 0 && (
                    <div className="space-y-1 pt-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {lang === 'hi' ? 'दवाइयां:' : 'Medicines:'}
                      </p>
                      <div className="space-y-1">
                        {rec.medicines.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                            <span className="font-semibold text-emerald-950 truncate">{m.name}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 shrink-0">
                              <span className="font-medium">
                                {m.dosage ? m.dosage : `${m.schedule?.morning ? 'M' : '-'}/${m.schedule?.afternoon ? 'A' : '-'}/${m.schedule?.night ? 'N' : '-'}`}
                              </span>
                              {(m.timing || m.meal_timing) && (
                                <span className="px-1 py-0.2 rounded bg-emerald-100 font-semibold">
                                  {m.timing || (m.meal_timing === 'after_food' ? (lang === 'hi' ? 'खाने के बाद' : 'After') : (lang === 'hi' ? 'खाली पेट' : 'Before'))}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.vital_stats && Object.keys(rec.vital_stats).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {Object.entries(rec.vital_stats).map(([k, v]) => (
                        <span key={k} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {k.replace('_', ' ').toUpperCase()}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePrintRecord(rec)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>{lang === 'hi' ? 'प्रिंट' : 'Print'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{lang === 'hi' ? 'हटाएं' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. ADD HEALTH RECORD MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{t.recordsAddBtn}</h3>
                <p className="text-[11px] text-slate-300">{lang === 'hi' ? 'नया मेडिकल रिकॉर्ड जोड़ें' : 'Save doctor slip or report'}</p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-4 overflow-y-auto space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'hi' ? 'रिकॉर्ड का शीर्षक *' : 'Record Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={lang === 'hi' ? 'उदा. बुखार की पर्ची, ब्लड टेस्ट' : 'e.g. Fever Prescription, Blood Test'}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'प्रकार' : 'Type'}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="prescription">{t.recordsFilterRx}</option>
                    <option value="consultation">{t.recordsFilterConsult}</option>
                    <option value="lab_report">{t.recordsFilterLab}</option>
                    <option value="other">{lang === 'hi' ? 'अन्य' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'तारीख' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'डॉक्टर का नाम' : 'Doctor Name'}
                  </label>
                  <input
                    type="text"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    placeholder="Dr. Aakash"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'अस्पताल / PHC' : 'Hospital / PHC'}
                  </label>
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    placeholder="Prayagraj PHC"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'hi' ? 'बीमारी या मुख्य सलाह' : 'Diagnosis & Summary'}
                </label>
                <textarea
                  rows="2"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder={lang === 'hi' ? 'लक्षण या डॉक्टर की सलाह...' : 'Notes or doctor advice...'}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Medicines Adder */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  {lang === 'hi' ? 'दवाइयां जोड़ें:' : 'Add Medicines:'}
                </label>
                
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="Medicine (e.g. Paracetamol 500mg)"
                    className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {medicinesList.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {medicinesList.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 text-xs">
                        <span className="font-semibold">{m.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">BP</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">Pulse</label>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    placeholder="72 bpm"
                    className="w-full px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRecord}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingRecord ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
