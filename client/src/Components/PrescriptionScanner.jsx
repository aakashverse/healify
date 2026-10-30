import React, { useState } from 'react';
import { 
  FileScan, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Volume2, 
  Clock, 
  Sun, 
  Moon, 
  Sunrise, 
  Pill, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Info, 
  ArrowLeft,
  Camera
} from 'lucide-react';

import { uploadPrescription } from '../services/upload.api';
import { explainPrescriptionBase64 } from '../services/explain.api';
import { useLanguage } from '../context/LanguageContext';

export default function PrescriptionScanner({ onBack }) {
  const { lang, t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [activeSpeech, setActiveSpeech] = useState(null);

  const samplePrescriptions = [
    {
      name: t.rxSample1,
      filename: 'amoxicillin_antibiotic.jpg',
      desc: lang === 'hi' ? 'बैक्टीरियल इन्फेक्शन के लिए पूरा कोर्स' : 'Typical bacterial infection dosage'
    },
    {
      name: t.rxSample2,
      filename: 'cough_relief_syrup.jpg',
      desc: lang === 'hi' ? 'खांसी और गले की खराश के लिए सिरप' : 'Bronchial syrup with 3x daily schedule'
    },
    {
      name: t.rxSample3,
      filename: 'cetirizine_allergy.jpg',
      desc: lang === 'hi' ? 'रात को सोने से पहले 1 गोली' : 'Nighttime antihistamine regimen'
    },
    {
      name: t.rxSample4,
      filename: 'paracetamol_ors_fever.jpg',
      desc: lang === 'hi' ? 'बुखार और कमजोरी दूर करने के लिए' : 'Standard hydration and antipyretic protocol'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResultData(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

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

  const handleSampleSelect = async (sample) => {
    setLoading(true);
    setSelectedFile({ name: sample.filename });
    setPreviewUrl(null);
    setError(null);

    try {
      const resp = await explainPrescriptionBase64('', 'image/jpeg', sample.filename);
      if (resp && resp.data) {
        setResultData(resp.data);
      }
    } catch (err) {
      setError('Could not fetch sample prescription data.');
    } finally {
      setLoading(false);
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
    <div className="animate-view-fade max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 lg:pb-12">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <FileScan className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.rxTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t.rxSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Upload Box + Sample Slips */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-6 sm:p-8 text-center transition-all shadow-xs">
            <input
              type="file"
              id="rx-upload-input"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <label 
              htmlFor="rx-upload-input" 
              className="cursor-pointer flex flex-col items-center justify-center space-y-3 sm:space-y-4"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-xs">
                <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-slate-800">
                  {selectedFile ? selectedFile.name : t.rxUploadTitle}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {t.rxUploadSub}
                </p>
              </div>
              <span className="inline-flex px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black shadow-xs hover:bg-slate-800 transition-all">
                {t.rxSelectBtn}
              </span>
            </label>

            {previewUrl && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-600 mb-2">
                  {lang === 'hi' ? 'पर्ची का फोटो:' : 'Prescription Preview:'}
                </p>
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="max-h-48 mx-auto rounded-xl object-contain shadow-xs border border-slate-200"
                />
              </div>
            )}

            {selectedFile && (
              <button
                onClick={handleUploadSubmit}
                disabled={loading}
                className="mt-5 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.rxAnalyzing}</span>
                  </>
                ) : (
                  <>
                    <FileScan className="w-5 h-5" />
                    <span>{t.rxAnalyzeBtn}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Preset Samples */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
              {t.rxSampleTitle}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {samplePrescriptions.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleSelect(sample)}
                  disabled={loading}
                  className="text-left p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <p className="text-xs font-black text-slate-900 group-hover:text-blue-700">
                    {sample.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">
                    {sample.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Visual Dosage Output Cards */}
        <div className="lg:col-span-7">
          
          {loading && (
            <div className="rounded-3xl border border-slate-200 p-8 sm:p-12 text-center bg-white shadow-xs flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800">{t.rxAnalyzing}</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 font-medium">
                  {lang === 'hi' ? 'AI दवा का नाम, खाने का समय और सावधानी जांच रहा है।' : 'AI is reading handwritten details and dosage schedule.'}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Error: </strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {!loading && !resultData && !error && (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center bg-white shadow-2xs flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Pill className="w-7 h-7" />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-700">{t.rxNoData}</h4>
            </div>
          )}

          {resultData && resultData.medicines && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span>{t.rxDosageReady} ({resultData.medicines.length})</span>
                </h3>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                  {lang === 'hi' ? 'जांच पूर्ण' : 'Analyzed'}
                </span>
              </div>

              {resultData.medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border-2 border-slate-200 p-4 sm:p-5 shadow-xs space-y-4"
                >
                  {/* Medicine Name and Purpose */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-blue-600" />
                        <span>{med.name}</span>
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {lang === 'hi' ? med.purpose_hi || med.purpose_en : med.purpose_en || med.purpose_hi}
                      </p>
                    </div>

                    <span className="self-start sm:self-auto text-[11px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {med.meal_timing === 'after_food'
                        ? t.rxMealAfter
                        : med.meal_timing === 'before_food'
                        ? t.rxMealBefore
                        : t.rxMealAny}
                    </span>
                  </div>

                  {/* Visual Morning, Afternoon, Night Pills */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {/* Morning */}
                    <div className={`p-3 rounded-2xl flex flex-col sm:flex-row items-center sm:items-center gap-2 border-2 text-center sm:text-left ${
                      med.schedule?.morning 
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-black' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 font-medium'
                    }`}>
                      <Sunrise className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${med.schedule?.morning ? 'text-amber-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-black uppercase">{t.rxMorning}</p>
                        <p className="text-[11px] sm:text-xs">{med.schedule?.morning ? t.rxTakeDose : t.rxNoDose}</p>
                      </div>
                    </div>

                    {/* Afternoon */}
                    <div className={`p-3 rounded-2xl flex flex-col sm:flex-row items-center sm:items-center gap-2 border-2 text-center sm:text-left ${
                      med.schedule?.afternoon 
                        ? 'bg-sky-50 border-sky-300 text-sky-950 font-black' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 font-medium'
                    }`}>
                      <Sun className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${med.schedule?.afternoon ? 'text-sky-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-black uppercase">{t.rxAfternoon}</p>
                        <p className="text-[11px] sm:text-xs">{med.schedule?.afternoon ? t.rxTakeDose : t.rxNoDose}</p>
                      </div>
                    </div>

                    {/* Night */}
                    <div className={`p-3 rounded-2xl flex flex-col sm:flex-row items-center sm:items-center gap-2 border-2 text-center sm:text-left ${
                      med.schedule?.night 
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-black' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 font-medium'
                    }`}>
                      <Moon className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${med.schedule?.night ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-black uppercase">{t.rxNight}</p>
                        <p className="text-[11px] sm:text-xs">{med.schedule?.night ? t.rxTakeDose : t.rxNoDose}</p>
                      </div>
                    </div>
                  </div>

                  {/* Audio Instruction Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-blue-950">
                        {lang === 'hi' ? 'दवा लेने का निर्देश:' : 'Dosage Direction:'}
                      </p>
                      <p className="text-xs text-blue-900 font-semibold">
                        {lang === 'hi' ? med.audio_hi || med.audio_en : med.audio_en || med.audio_hi}
                      </p>
                    </div>

                    <button
                      onClick={() => speakAudio(lang === 'hi' ? med.audio_hi || med.audio_en : med.audio_en || med.audio_hi, idx)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 shadow-xs ${
                        activeSpeech === idx 
                          ? 'bg-blue-700 text-white animate-pulse' 
                          : 'bg-white text-blue-800 border border-blue-300 hover:bg-blue-100'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{activeSpeech === idx ? 'Playing...' : t.rxAudioListen}</span>
                    </button>
                  </div>

                  {med.warning && (
                    <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 font-medium">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>{t.rxWarning}:</strong> {med.warning}</span>
                    </div>
                  )}

                </div>
              ))}

              {(resultData.general_advice_hi || resultData.general_advice_en) && (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white text-xs sm:text-sm flex items-start gap-3 shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-amber-200 mb-1">
                      {t.rxGeneralAdvice}:
                    </p>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {lang === 'hi' ? resultData.general_advice_hi : resultData.general_advice_en || resultData.general_advice_hi}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
