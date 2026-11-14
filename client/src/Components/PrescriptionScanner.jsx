import React, { useState } from 'react';
import { 
  FileScan, 
  Upload, 
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
  ArrowLeft,
  Camera,
  FolderPlus,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

import { uploadPrescription } from '../services/upload.api';
import { explainPrescriptionBase64 } from '../services/explain.api';
import { createHealthRecord } from '../services/records.api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function PrescriptionScanner({ onBack, onViewRecords }) {
  const { lang, t } = useLanguage();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [activeSpeech, setActiveSpeech] = useState(null);

  const [savingRecord, setSavingRecord] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResultData(null);
      setSaveSuccess(false);
      setSaveError(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const resp = await uploadPrescription(selectedFile);
      if (resp && resp.data) {
        setResultData(resp.data);
      } else {
        throw new Error('No dosage information returned');
      }
    } catch (err) {
      console.warn('Direct upload error, testing fallback engine:', err);
      try {
        const fallbackResp = await explainPrescriptionBase64('', 'image/jpeg', selectedFile.name);
        if (fallbackResp && fallbackResp.data) {
          setResultData(fallbackResp.data);
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
          : (lang === 'hi' ? 'निर्देशानुसार' : 'As needed');

        return {
          name: m.name,
          dosage: dosageStr,
          timing: timingStr,
          duration: '5 Days',
          instructions: (lang === 'hi' ? m.audio_hi || m.audio_en : m.audio_en || m.audio_hi) || m.warning || ''
        };
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const prescriptionTitle = selectedFile?.name
        ? `${lang === 'hi' ? 'पर्ची' : 'Prescription'}: ${selectedFile.name.replace(/\.[^/.]+$/, '')}`
        : `${lang === 'hi' ? 'दवा पर्ची' : 'Rx Prescription'} (${todayStr})`;

      const payload = {
        title: prescriptionTitle,
        record_type: 'prescription',
        date: todayStr,
        doctor_name: 'Dr. (Rx Scanner)',
        facility_name: 'Heal-U Digital Health',
        diagnosis: (lang === 'hi' ? resultData.general_advice_hi : resultData.general_advice_en) || 'Prescription medication schedule',
        medicines: formattedMeds,
        tags: ['Prescription', 'AI-Scanned']
      };

      await createHealthRecord(payload);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err.message || 'Failed to save health record. Please try again.');
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

    utterance.onend = () => setActiveSpeech(null);
    utterance.onerror = () => setActiveSpeech(null);

    setActiveSpeech(idx);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="animate-view-fade max-w-5xl mx-auto px-4 py-5 sm:py-6 space-y-5 pb-20 lg:pb-12">
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileScan className="w-4 h-4" />
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
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : t.rxUploadTitle}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.rxUploadSub}
                </p>
              </div>
              <span className="inline-flex px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all">
                {t.rxSelectBtn}
              </span>
            </label>

            {previewUrl && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="max-h-40 mx-auto rounded-lg object-contain border border-slate-200"
                />
              </div>
            )}

            {selectedFile && (
              <button
                onClick={handleUploadSubmit}
                disabled={loading}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.rxAnalyzing}</span>
                  </>
                ) : (
                  <>
                    <FileScan className="w-4 h-4" />
                    <span>{t.rxAnalyzeBtn}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Results Column */}
        {resultData && (
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

            {resultData && resultData.medicines && (
              <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                
                {/* Result Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200 bg-white p-3.5 rounded-2xl border shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {t.rxDosageReady} ({resultData.medicines.length})
                    </h3>
                  </div>

                  {!saveSuccess ? (
                    <button
                      onClick={handleSaveToRecords}
                      disabled={savingRecord}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
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
                      {onViewRecords && (
                        <button
                          onClick={onViewRecords}
                          className="ml-1 underline font-bold hover:text-emerald-900 cursor-pointer inline-flex items-center gap-0.5"
                        >
                          {t.rxViewRecords}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {saveError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Medicine Cards */}
                {resultData.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Pill className="w-4 h-4 text-emerald-700" />
                          <span>{med.name}</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {lang === 'hi' ? med.purpose_hi || med.purpose_en : med.purpose_en || med.purpose_hi}
                        </p>
                      </div>

                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {med.meal_timing === 'after_food'
                          ? t.rxMealAfter
                          : med.meal_timing === 'before_food'
                          ? t.rxMealBefore
                          : t.rxMealAny}
                      </span>
                    </div>

                    {/* Clean Dosage Badges (No Sky Blue!) */}
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

                      {/* Afternoon (Refined Emerald, No Sky Blue) */}
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
                          {lang === 'hi' ? 'दवा निर्देश:' : 'Dosage Direction:'}
                        </p>
                        <p className="text-xs text-slate-800">
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
