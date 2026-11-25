import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileScan, 
  CheckCircle, 
  AlertTriangle, 
  Volume2, 
  Sun, 
  Moon, 
  Sunrise, 
  Pill, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Info, 
  Camera, 
  FolderPlus, 
  CheckCircle2, 
  ExternalLink,
  Activity,
  ShieldAlert,
  Apple,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

import { uploadPrescription } from '../services/upload.api';
import { explainPrescriptionBase64 } from '../services/explain.api';
import { createHealthRecord } from '../services/records.api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useScanner } from '../context/ScannerContext';

export default function PrescriptionScanner() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    fileName,
    fileType,
    previewUrl,
    resultData,
    saveSuccess,
    setSelectedScanFile,
    setScanResult,
    markScanSaved,
    clearScan
  } = useScanner();

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSpeech, setActiveSpeech] = useState(null);

  const [savingRecord, setSavingRecord] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSaveError(null);

      // Convert to persistent DataURL so preview remains intact across navigation
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedScanFile({
          fileName: file.name,
          fileType: file.type || 'image/jpeg',
          previewUrl: typeof reader.result === 'string' ? reader.result : null
        });
      };
      reader.onerror = () => {
        setSelectedScanFile({
          fileName: file.name,
          fileType: file.type || 'image/jpeg',
          previewUrl: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile && !previewUrl) return;

    setLoading(true);
    setError(null);
    markScanSaved(false);
    setSaveError(null);

    try {
      if (selectedFile) {
        const resp = await uploadPrescription(selectedFile);
        if (resp && resp.data) {
          setScanResult(resp.data);
          return;
        }
      }
      throw new Error('No dosage information returned');
    } catch (err) {
      console.warn('Direct upload error, attempting base64 vision fallback:', err);
      try {
        let base64Data = '';
        if (previewUrl && previewUrl.startsWith('data:')) {
          base64Data = previewUrl.split(',')[1] || '';
        } else if (selectedFile) {
          base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result || '').toString().split(',')[1] || '');
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
        }

        const fallbackResp = await explainPrescriptionBase64(
          base64Data,
          selectedFile?.type || fileType || 'image/jpeg',
          selectedFile?.name || fileName || 'prescription.jpg'
        );
        if (fallbackResp && fallbackResp.data) {
          setScanResult(fallbackResp.data);
        } else {
          setError(err.message || 'Failed to process prescription image.');
        }
      } catch (fallbackErr) {
        setError(fallbackErr.message || 'Unable to analyze prescription. Please ensure the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    window.speechSynthesis?.cancel();
    setActiveSpeech(null);
    setSelectedFile(null);
    setError(null);
    setSaveError(null);
    clearScan();
  };

  const handleSaveToRecords = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!resultData || !resultData.medicines) return;

    setSavingRecord(true);
    setSaveError(null);

    try {
      const formattedMeds = (resultData.medicines || []).map((m) => {
        const parts = [];
        if (m.schedule?.morning) parts.push(lang === 'hi' ? 'सुबह' : 'M');
        if (m.schedule?.afternoon) parts.push(lang === 'hi' ? 'दोपहर' : 'A');
        if (m.schedule?.night) parts.push(lang === 'hi' ? 'रात' : 'N');
        const dosageStr = parts.length > 0 ? parts.join('-') : '1 dose';
        const timingStr = m.meal_timing === 'after_food'
          ? (lang === 'hi' ? 'भोजन के बाद' : 'After Food')
          : m.meal_timing === 'before_food'
          ? (lang === 'hi' ? 'खाली पेट' : 'Before Food')
          : m.meal_timing === 'with_food'
          ? (lang === 'hi' ? 'भोजन के साथ' : 'With Meals')
          : (lang === 'hi' ? 'निर्देशानुसार' : 'As needed');

        return {
          name: m.name,
          dosage: dosageStr,
          timing: timingStr,
          duration: m.duration || '5 Days',
          instructions: (lang === 'hi' ? m.audio_hi || m.audio_en : m.audio_en || m.audio_hi) || m.warning || ''
        };
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const conditionName = resultData.disease_info?.condition_name_en || resultData.disease_info?.condition_name_hi;
      const activeFileName = selectedFile?.name || fileName;
      const prescriptionTitle = conditionName
        ? `${lang === 'hi' ? 'पर्ची' : 'Rx'}: ${conditionName}`
        : activeFileName
        ? `${lang === 'hi' ? 'पर्ची' : 'Prescription'}: ${activeFileName.replace(/\.[^/.]+$/, '')}`
        : `${lang === 'hi' ? 'दवा पर्ची' : 'Rx Prescription'} (${todayStr})`;

      const payload = {
        title: prescriptionTitle,
        record_type: 'prescription',
        date: todayStr,
        doctor_name: 'Dr. (Rx Scanner)',
        facility_name: 'Heal-U Digital Clinic',
        diagnosis: (lang === 'hi' ? resultData.disease_info?.overview_hi || resultData.general_advice_hi : resultData.disease_info?.overview_en || resultData.general_advice_en) || 'Prescription medication schedule',
        medicines: formattedMeds,
        tags: ['Prescription', 'AI-Scanned', conditionName || 'General Health']
      };

      await createHealthRecord(payload);
      markScanSaved(true);
    } catch (err) {
      if (err.status === 401) {
        setSaveError(lang === 'hi' ? 'सत्र समाप्त हो गया है, कृपया पुनः लॉगिन करें।' : 'Session expired. Please log in again to save records.');
      } else {
        setSaveError(err.message || 'Failed to save health record. Please try again.');
      }
    } finally {
      setSavingRecord(false);
    }
  };

  const speakAudio = (text, idx) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (activeSpeech === idx) {
      setActiveSpeech(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const hasHindi = /[\u0900-\u097F]/.test(text) || lang === 'hi';
    utterance.lang = hasHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setActiveSpeech(null);
    utterance.onerror = () => setActiveSpeech(null);

    setActiveSpeech(idx);
    window.speechSynthesis.speak(utterance);
  };

  const disease = resultData?.disease_info;
  const extraCare = resultData?.extra_care_and_warnings;
  const hasActiveFile = Boolean(selectedFile || fileName || previewUrl);

  return (
    <div className="animate-view-fade max-w-5xl mx-auto px-4 py-5 sm:py-6 space-y-5 pb-20 lg:pb-12">
      
      {/* Header Card (Clean & Modern, No clunky Back button) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileScan className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {t.rxTitle}
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              {t.rxSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(hasActiveFile || resultData) && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              title={lang === 'hi' ? 'नई पर्ची स्कैन करें' : 'Start a new scan'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'नया स्कैन' : 'New Scan'}</span>
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'hi' ? 'निःशुल्क AI विजन' : 'Free Vision AI'}</span>
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Upload Box */}
        <div className={`${resultData ? 'lg:col-span-5' : 'lg:col-span-12 max-w-xl mx-auto w-full'} space-y-4`}>
          <div className="bg-white border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 sm:p-6 text-center transition-all shadow-2xs">
            <input
              type="file"
              id="rx-upload-input"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <label 
              htmlFor="rx-upload-input" 
              className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {selectedFile?.name || fileName || t.rxUploadTitle}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.rxUploadSub}
                </p>
              </div>
              <span className="inline-flex px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer">
                {t.rxSelectBtn}
              </span>
            </label>

            {previewUrl && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="max-h-48 mx-auto rounded-lg object-contain border border-slate-200 shadow-2xs"
                />
              </div>
            )}

            {(selectedFile || previewUrl) && (
              <button
                onClick={handleUploadSubmit}
                disabled={loading}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.rxAnalyzing}</span>
                  </>
                ) : (
                  <>
                    <FileScan className="w-4 h-4" />
                    <span>{resultData ? (lang === 'hi' ? 'पुनः विश्लेषण करें' : 'Re-Analyze Prescription') : t.rxAnalyzeBtn}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Results Column */}
        {(resultData || loading || error) && (
          <div className="lg:col-span-7 space-y-4">
            {loading && (
              <div className="rounded-2xl border border-slate-200 p-8 text-center bg-white shadow-2xs flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{t.rxAnalyzing}</h4>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Error: </strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {resultData && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                
                {/* 1. Analyzed Disease / Condition Card */}
                {disease && (
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50/90 to-slate-50 border border-emerald-200 p-4 sm:p-5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Activity className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                          {lang === 'hi' ? 'संभावित बीमारी / रोग का विश्लेषण' : 'Analyzed Health Condition'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                        {lang === 'hi' ? 'डॉक्टर पर्ची आधार' : 'Clinical Rx Grounded'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                        {lang === 'hi' ? disease.condition_name_hi || disease.condition_name_en : disease.condition_name_en || disease.condition_name_hi}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed mt-1 font-medium">
                        {lang === 'hi' ? disease.overview_hi || disease.overview_en : disease.overview_en || disease.overview_hi}
                      </p>
                    </div>

                    {(disease.primary_cause_en || disease.primary_cause_hi) && (
                      <div className="pt-1.5 border-t border-emerald-100/70 text-[11px] text-slate-600 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <strong>{lang === 'hi' ? 'संभावित कारण:' : 'Likely Cause:'}</strong> {lang === 'hi' ? disease.primary_cause_hi || disease.primary_cause_en : disease.primary_cause_en || disease.primary_cause_hi}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Result Action Bar & Medicines Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200 bg-white p-3.5 rounded-2xl border shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {lang === 'hi' ? 'निर्धारित दवाइयां' : 'Prescribed Medicines'} ({resultData.medicines?.length || 0})
                    </h3>
                  </div>

                  {!saveSuccess ? (
                    <button
                      onClick={handleSaveToRecords}
                      disabled={savingRecord}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      {savingRecord ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{t.rxSavingToRecords}</span>
                        </>
                      ) : (
                        <>
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>{t.rxSaveToRecords}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.rxSavedSuccess}</span>
                      <button
                        onClick={() => navigate('/records')}
                        className="ml-1 underline font-bold hover:text-emerald-900 cursor-pointer inline-flex items-center gap-0.5"
                      >
                        {t.rxViewRecords}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {saveError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* 3. Medicine Cards with Exact Consumption Timing */}
                {resultData.medicines && resultData.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Pill className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{med.name}</span>
                        </h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {lang === 'hi' ? med.purpose_hi || med.purpose_en : med.purpose_en || med.purpose_hi}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
                          {med.meal_timing === 'after_food'
                            ? t.rxMealAfter
                            : med.meal_timing === 'before_food'
                            ? t.rxMealBefore
                            : med.meal_timing === 'with_food'
                            ? (lang === 'hi' ? 'भोजन के साथ' : 'With Food')
                            : t.rxMealAny}
                        </span>
                        {med.duration && (
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">
                            {lang === 'hi' ? 'अवधि' : 'Duration'}: {med.duration}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Clean Dosage Badges (Morning, Afternoon, Night) */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Morning */}
                      <div className={`p-2.5 rounded-xl flex items-center gap-2 border text-left ${
                        med.schedule?.morning 
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 font-normal'
                      }`}>
                        <Sunrise className={`w-4 h-4 shrink-0 ${med.schedule?.morning ? 'text-amber-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-[10px] font-bold uppercase">{t.rxMorning}</p>
                          <p className="text-xs">{med.schedule?.morning ? t.rxTakeDose : t.rxNoDose}</p>
                        </div>
                      </div>

                      {/* Afternoon */}
                      <div className={`p-2.5 rounded-xl flex items-center gap-2 border text-left ${
                        med.schedule?.afternoon 
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 font-normal'
                      }`}>
                        <Sun className={`w-4 h-4 shrink-0 ${med.schedule?.afternoon ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-[10px] font-bold uppercase">{t.rxAfternoon}</p>
                          <p className="text-xs">{med.schedule?.afternoon ? t.rxTakeDose : t.rxNoDose}</p>
                        </div>
                      </div>

                      {/* Night */}
                      <div className={`p-2.5 rounded-xl flex items-center gap-2 border text-left ${
                        med.schedule?.night 
                          ? 'bg-slate-100 border-slate-300 text-slate-900 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 font-normal'
                      }`}>
                        <Moon className={`w-4 h-4 shrink-0 ${med.schedule?.night ? 'text-slate-700' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-[10px] font-bold uppercase">{t.rxNight}</p>
                          <p className="text-xs">{med.schedule?.night ? t.rxTakeDose : t.rxNoDose}</p>
                        </div>
                      </div>
                    </div>

                    {/* Audio Instruction Bar */}
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-slate-700">
                          {lang === 'hi' ? 'दवा सेवन का सही समय व तरीका:' : 'Direction & Consuming Timing:'}
                        </p>
                        <p className="text-xs text-slate-800 font-medium">
                          {lang === 'hi' ? med.audio_hi || med.audio_en : med.audio_en || med.audio_hi}
                        </p>
                      </div>

                      <button
                        onClick={() => speakAudio(lang === 'hi' ? med.audio_hi || med.audio_en : med.audio_en || med.audio_hi, idx)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                          activeSpeech === idx 
                            ? 'bg-emerald-700 text-white border-emerald-800' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{activeSpeech === idx ? 'Playing' : t.rxAudioListen}</span>
                      </button>
                    </div>

                    {med.warning && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>{t.rxWarning}:</strong> {med.warning}</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* 4. Extra Care, Diet, & Warning Guidelines */}
                {extraCare && (
                  <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {lang === 'hi' ? 'इलाज के दौरान जरूरी सावधानियां व देखरेख' : 'Extra Essential Precautions & Care'}
                      </h4>
                    </div>

                    {/* Precautions list */}
                    {((lang === 'hi' ? extraCare.key_precautions_hi : extraCare.key_precautions_en) || []).length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          {lang === 'hi' ? 'महत्वपूर्ण बातें:' : 'Key Precautions:'}
                        </p>
                        <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc font-medium">
                          {(lang === 'hi' ? extraCare.key_precautions_hi : extraCare.key_precautions_en).map((item, pIdx) => (
                            <li key={pIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Diet & Lifestyle */}
                    {(extraCare.diet_and_lifestyle_en || extraCare.diet_and_lifestyle_hi) && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Apple className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lang === 'hi' ? 'खान-पान व दिनचर्या:' : 'Diet & Lifestyle Advice:'}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-medium">
                          {lang === 'hi' ? extraCare.diet_and_lifestyle_hi || extraCare.diet_and_lifestyle_en : extraCare.diet_and_lifestyle_en || extraCare.diet_and_lifestyle_hi}
                        </p>
                      </div>
                    )}

                    {/* Red Flags / Emergency Warnings */}
                    {(extraCare.red_flags_when_to_see_doctor_en || extraCare.red_flags_when_to_see_doctor_hi) && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{lang === 'hi' ? 'तुरंत डॉक्टर के पास कब जाएं (खतरे के लक्षण):' : 'When to Seek Immediate Medical Help:'}</span>
                        </div>
                        <p className="text-rose-800 leading-relaxed font-medium">
                          {lang === 'hi' ? extraCare.red_flags_when_to_see_doctor_hi || extraCare.red_flags_when_to_see_doctor_en : extraCare.red_flags_when_to_see_doctor_en || extraCare.red_flags_when_to_see_doctor_hi}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* General Advice Banner */}
                {(resultData.general_advice_hi || resultData.general_advice_en) && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs flex items-start gap-2.5 shadow-sm">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-300 mb-0.5">
                        {t.rxGeneralAdvice}:
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        {lang === 'hi' ? resultData.general_advice_hi : resultData.general_advice_en || resultData.general_advice_hi}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
