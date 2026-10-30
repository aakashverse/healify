import React, { useState } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PROTOCOLS = [
  {
    id: 'snakebite',
    title_en: 'Snakebite Emergency',
    title_hi: 'सांप का काटना (सर्पदंश)',
    category_en: 'Toxicology & Trauma',
    category_hi: 'आपातकालीन विष विज्ञान',
    summary_hi: 'मरीज को बिल्कुल शांत रखें, घाव पर चीरा या चीरा न लगाएं और तुरंत 108 बुलाकर नजदीकी एंटी-वेनम अस्पताल ले जाएं।',
    summary_en: 'Keep the victim completely calm and still. Do NOT cut the wound or suck venom. Rush immediately to nearest ASV facility.',
    dos_hi: [
      'मरीज को शांत और स्थिर रखें, हिलने-डुलने न दें (Immobilize the limb)।',
      'घाव के पास की अंगूठी, घड़ी, ताबीज या तंग कपड़े तुरंत उतार लें।',
      'तुरंत 108 पर कॉल करें और नजदीकी अस्पताल ले जाएं जहां एंटी-स्नेक वेनम उपलब्ध हो।'
    ],
    dos_en: [
      'Keep the person completely calm and still; immobilize the bitten limb below heart level.',
      'Remove tight jewelry, watches, rings, or constricting clothing immediately.',
      'Call 108 ambulance urgently and transport to a hospital stocked with Anti-Snake Venom (ASV).'
    ],
    donts_hi: [
      'घाव पर चीरा या कट न लगाएं (Do NOT cut the bite site)।',
      'मुंह से जहर चूसने की कोशिश कभी न करें (Never suck venom)।',
      'टूर्निकेट (कसा हुआ कपड़ा/रस्सी) न बांधें जिससे रक्त संचार बंद हो जाए।'
    ],
    donts_en: [
      'Do NOT cut the wound or attempt to drain blood.',
      'NEVER attempt to suck venom by mouth or apply ice.',
      'Do NOT tie a tight tourniquet that cuts off blood circulation.'
    ]
  },
  {
    id: 'cardiac',
    title_en: 'Cardiac & Chest Pain',
    title_hi: 'सीने में दर्द / दिल का दौरा (Heart Attack)',
    category_en: 'Cardiovascular SOS',
    category_hi: 'हृदय आपातकाल',
    summary_hi: 'मरीज को आरामदायक स्थिति में बैठाएं, कपड़े ढीले करें और बिना देरी किए 108 एम्बुलेंस बुलाएं।',
    summary_en: 'Have the person sit down and rest immediately. Loosen tight collar. Call 108 ambulance urgently.',
    dos_hi: [
      'मरीज को तुरंत आरामदायक पोजीशन में बैठा दें (अर्ध-लेटी हुई स्थिति)।',
      'गले और सीने के कपड़े ढीले करें और खुली ताजी हवा में रखें।',
      'यदि डॉक्टर द्वारा पहले से सोर्बिट्रेट/एस्पिरिन सुझाई गई हो तो तुरंत दें।'
    ],
    dos_en: [
      'Have the patient sit down in a comfortable semi-reclined resting position.',
      'Loosen tight clothing around the neck, chest, and waist; ensure fresh ventilation.',
      'Give prescribed emergency medication (e.g. Aspirin/Sorbitrate) if previously advised by physician.'
    ],
    donts_hi: [
      'मरीज को चलने-फिरने या सीढ़ियां चढ़ने न दें।',
      'मरीज को अकेले कभी न छोड़ें।',
      'सीने में दर्द को साधारण गैस समझकर नजरअंदाज न करें।'
    ],
    donts_en: [
      'Do NOT allow the person to walk, exert themselves, or climb stairs.',
      'Never leave the patient unattended.',
      'Do NOT dismiss severe chest discomfort as harmless acidity or indigestion.'
    ]
  },
  {
    id: 'breathing',
    title_en: 'Severe Breathing Distress',
    title_hi: 'सांस लेने में अत्यधिक कठिनाई',
    category_en: 'Respiratory Emergency',
    category_hi: 'श्वसन आपातकाल',
    summary_hi: 'मरीज को खुली हवादार जगह पर सीधा बैठाएं। गले व छाती के कपड़े ढीले करें।',
    summary_en: 'Sit person upright in airy room. Loosen chest clothing. Call 108 ambulance immediately.',
    dos_hi: [
      'व्यक्ति को सीधा (upright) बैठाएं, लेटने न दें।',
      'खिड़कियां खोलें ताकि ताजी हवा आ सके।',
      'यदि उनके पास प्रिस्क्राइब किया गया इनहेलर है तो तुरंत 2 पफ दें।'
    ],
    dos_en: [
      'Help the person sit upright leaning slightly forward; do not force them to lie flat.',
      'Open windows and clear crowded bystanders to ensure fresh airflow.',
      'Help administer their prescribed inhaler (2 puffs) if available.'
    ],
    donts_hi: [
      'मरीज को पीठ के बल सीधा लेटने के लिए मजबूर न करें।',
      'मरीज के आसपास भीड़ न लगाएं।',
      'बेहोशी की हालत में मुंह में पानी या कोई पेय न डालें।'
    ],
    donts_en: [
      'Do NOT force the patient to lie flat on their back.',
      'Do NOT crowd around the patient.',
      'Do NOT pour water or liquids into the mouth if person is drowsy or unconscious.'
    ]
  },
  {
    id: 'bleeding',
    title_en: 'Severe Traumatic Bleeding',
    title_hi: 'गंभीर रक्तस्राव (भारी खून बहना)',
    category_en: 'Trauma & Hemorrhage',
    category_hi: 'चोट व रक्तस्राव',
    summary_hi: 'साफ कपड़े या पट्टी से घाव को लगातार दबाए रखें। भीगने पर ऊपर और कपड़ा लगाएं।',
    summary_en: 'Apply direct firm pressure with clean cloth. Do not lift soaked cloth, layer more on top.',
    dos_hi: [
      'साफ सूती कपड़े या गॉज से घाव पर लगातार 10-15 मिनट तक सीधा दबाव बनाएं।',
      'यदि संभव हो तो चोट वाले अंग को दिल की ऊंचाई से ऊपर उठाएं।',
      'रक्तस्राव वाले व्यक्ति को कंबल से ढककर गर्म रखें।'
    ],
    dos_en: [
      'Apply direct, uninterrupted firm pressure to the bleeding wound using a clean cloth.',
      'If practical and no bone fracture is suspected, elevate the wounded limb above heart level.',
      'Keep the patient warm and lying down with legs slightly elevated to prevent shock.'
    ],
    donts_hi: [
      'घाव में घुसी हुई किसी नुकीली वस्तु (कांच, कील) को खुद बाहर न निकालें।',
      'खून से भीगे कपड़े को हटाएं नहीं, बल्कि उसके ऊपर दूसरा साफ कपड़ा रखें।',
      'घाव पर मिर्च, हल्दी या कोई अनजान लेप न लगाएं।'
    ],
    donts_en: [
      'Do NOT remove deeply impaled objects (glass, nails) as they may be plugging blood vessels.',
      'Do NOT lift soaked gauze; apply additional layers directly on top.',
      'Do NOT apply chili powder, mud, or unsterile powders to open wounds.'
    ]
  },
  {
    id: 'maternal',
    title_en: 'Maternal Delivery Emergency',
    title_hi: 'गर्भावस्था आपातकाल (प्रसव पीड़ा)',
    category_en: 'Maternal & Obstetric Care',
    category_hi: 'मातृ एवं प्रसूति देखभाल',
    summary_hi: 'गर्भवती को बाईं करवट लिटाएं, तुरंत 102/108 जननी एम्बुलेंस को कॉल करें।',
    summary_en: 'Lay woman on left side with knees bent. Call 102 Janani Express or 108 urgently.',
    dos_hi: [
      'महिला को बाईं करवट (left lateral position) लिटाएं ताकि बच्चे को पर्याप्त ऑक्सीजन मिले।',
      'तुरंत 102 (जननी सुरक्षा एम्बुलेंस) या 108 पर कॉल करें।',
      'शांत माहौल रखें और नजदीकी CHC में संपर्क करें।'
    ],
    dos_en: [
      'Place the expectant mother on her left side with knees slightly bent to maintain fetal blood flow.',
      'Call 102 (Janani Express) or 108 immediately for maternal ambulance transit.',
      'Keep the mother calm and prepare maternity medical records for hospital arrival.'
    ],
    donts_hi: [
      'महिला को भारी भोजन या ठोस खाना न दें।',
      'बिना प्रशिक्षित डॉक्टर/ANM के जबरन प्रसव कराने का प्रयास न करें।'
    ],
    donts_en: [
      'Do NOT give solid food or heavy meals during active labor.',
      'Do NOT attempt unassisted forceful delivery without certified healthcare personnel.'
    ]
  }
];

export default function FirstAidGuide({ onBack }) {
  const { lang, t } = useLanguage();
  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const text = lang === 'hi' ? selectedProtocol.summary_hi : selectedProtocol.summary_en;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

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
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.faTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t.faSubtitle}
            </p>
          </div>
        </div>

        <a
          href="tel:108"
          className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/20"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>{t.faCall108Banner}</span>
        </a>
      </div>

      {/* Main Grid: Selector on Left, Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Selector Buttons (Horizontal scrollable on mobile) */}
        <div className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          <span className="hidden lg:block text-xs font-black uppercase tracking-wider text-slate-500 px-1 mb-1">
            {t.faSelectPrompt}
          </span>
          {PROTOCOLS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedProtocol(item);
                if (isPlayingAudio) {
                  window.speechSynthesis.cancel();
                  setIsPlayingAudio(false);
                }
              }}
              className={`shrink-0 lg:shrink text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between min-w-[200px] lg:min-w-0 ${
                selectedProtocol.id === item.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-black tracking-wider opacity-70">
                  {lang === 'hi' ? item.category_hi : item.category_en}
                </p>
                <h4 className="text-xs sm:text-sm font-black mt-0.5 leading-snug">
                  {lang === 'hi' ? item.title_hi : item.title_en}
                </h4>
              </div>
              {selectedProtocol.id === item.id && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0 ml-2"></span>
              )}
            </button>
          ))}
        </div>

        {/* Right Column: Detailed Card */}
        <div className="lg:col-span-8 bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                {lang === 'hi' ? selectedProtocol.category_hi : selectedProtocol.category_en}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {lang === 'hi' ? selectedProtocol.title_hi : selectedProtocol.title_en}
              </h3>
            </div>

            <button
              onClick={toggleAudio}
              className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? t.faStopAudio : t.faAudioBtn}</span>
            </button>
          </div>

          {/* Golden Rule Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wide text-slate-400">
              {t.faPrincipal}:
            </span>
            <p className="text-sm font-black text-slate-900 leading-relaxed">
              {lang === 'hi' ? selectedProtocol.summary_hi : selectedProtocol.summary_en}
            </p>
          </div>

          {/* DOs & DONTs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* DOs */}
            <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-xs sm:text-sm uppercase">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{t.faDosTitle}</span>
              </div>
              <ul className="space-y-2 text-xs text-emerald-950 font-semibold leading-relaxed">
                {(lang === 'hi' ? selectedProtocol.dos_hi : selectedProtocol.dos_en).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DONTs */}
            <div className="bg-rose-50/70 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-950 font-black text-xs sm:text-sm uppercase">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>{t.faDontsTitle}</span>
              </div>
              <ul className="space-y-2 text-xs text-rose-950 font-semibold leading-relaxed">
                {(lang === 'hi' ? selectedProtocol.donts_hi : selectedProtocol.donts_en).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {lang === 'hi' ? 'यह प्राथमिक उपचार एम्बुलेंस आने तक मरीज को स्थिर रखने के लिए है।' : 'These first aid steps are to keep the patient stable until 108 ambulance arrives.'}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
