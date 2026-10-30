import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  PhoneCall, 
  Volume2, 
  ShieldCheck, 
  RefreshCw, 
  User, 
  Paperclip,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

import { sendChatMessage} from '../services/chat.api'
import { explainPrescriptionBase64 } from '../services/explain.api'
import { uploadPrescription } from '../services/upload.api'
import { useLanguage } from '../context/LanguageContext';

export default function ChatView({ initialQuery = '', onBack }) {
  const { lang, t } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: lang === 'hi'
        ? 'नमस्ते! मैं क्यूरा AI (Cura AI) हूँ, आपका स्वास्थ्य साथी। आप मुझसे अपनी बीमारी या लक्षणों के बारे में हिन्दी या अंग्रेजी में पूछ सकते हैं (जैसे: "2 दिन से बुखार है" या "बच्चे को दस्त हैं")।'
        : 'Hello! I am Cura AI, your Heal-U healthcare assistant. You can describe your symptoms in simple English or Hindi (e.g. "I have fever since 2 days" or "chest pain"). How can I help you today?',
      mode: 'normal',
      sources: ['WHO & ICMR Guidelines', 'National Health Mission Protocol'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText = null) => {
    const textToSend = queryText || inputText;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputText('');
    setLoading(true);

    try {
      const response = await sendChatMessage(textToSend.trim());
      
      const botMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'bot',
        text: response.result || (lang === 'hi' ? 'सलाह उपलब्ध नहीं हो सकी। कृपया PHC जाकर डॉक्टर से परामर्श लें।' : 'No advice generated. Please visit nearest PHC.'),
        mode: response.mode || 'normal',
        category: response.category,
        sources: response.sources || ['Clinical Protocol'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);

      if (botMessage.mode === 'sos') {
        speakText(botMessage.text, botMessage.id);
      }

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: 'err-' + Date.now(),
        sender: 'bot',
        text: lang === 'hi'
          ? 'माफ़ करें, सर्वर से संपर्क नहीं हो पाया। यदि आपातकालीन स्थिति है तो तुरंत 108 पर कॉल करें।'
          : 'Server communication error. If this is an emergency, please dial 108 immediately.',
        mode: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text, msgId) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    if (activeSpeechId === msgId) {
      setActiveSpeechId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const hasHindi = /[\u0900-\u097F]/.test(text) || lang === 'hi';
    utterance.lang = hasHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);

    setActiveSpeechId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessages((prev) => [
      ...prev,
      {
        id: 'upload-' + Date.now(),
        sender: 'user',
        text: `[${lang === 'hi' ? 'संलग्न पर्ची' : 'Attached Prescription'}: ${file.name}]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setLoading(true);

    try {
      const resp = await uploadPrescription(file);
      const data = resp.data;

      let summaryText = lang === 'hi' 
        ? 'दवा पर्ची का विश्लेषण सफल रहा:\n\n' 
        : 'Prescription Analyzed successfully:\n\n';

      if (data.medicines && data.medicines.length > 0) {
        data.medicines.forEach((m, idx) => {
          summaryText += `${idx + 1}. ${m.name} (${m.purpose_hi || m.purpose_en})\n`;
          summaryText += `   • ${lang === 'hi' ? 'समय' : 'Timing'}: ${m.meal_timing === 'after_food' ? (lang === 'hi' ? 'खाना खाने के बाद' : 'After Food') : (lang === 'hi' ? 'खाली पेट' : 'Before Food')}\n`;
          summaryText += `   • ${lang === 'hi' ? 'खुराक' : 'Schedule'}: ${m.audio_hi || m.audio_en}\n`;
        });
      }
      if (data.general_advice_hi) {
        summaryText += `\nसलाह: ${data.general_advice_hi}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-rx-' + Date.now(),
          sender: 'bot',
          text: summaryText,
          mode: 'normal',
          sources: ['Gemini Vision AI', 'Pharmacy Protocol'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (err) {
      try {
        const fbResp = await explainPrescriptionBase64('', 'image/jpeg', file.name);
        const data = fbResp.data;
        let summaryText = `Prescription Guideline:\n\n`;
        if (data.medicines) {
          data.medicines.forEach((m, idx) => {
            summaryText += `${idx + 1}. ${m.name} (${m.purpose_hi || m.purpose_en})\n`;
            summaryText += `   • निर्देश: ${m.audio_hi || m.audio_en}\n`;
          });
        }
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-rx-fb-' + Date.now(),
            sender: 'bot',
            text: summaryText,
            mode: 'normal',
            sources: ['Clinical Reference Model'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (fbErr) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'err-rx-' + Date.now(),
            sender: 'bot',
            text: lang === 'hi' ? 'पर्ची का विश्लेषण नहीं हो सका।' : 'Unable to analyze prescription image.',
            mode: 'error',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    t.chatSample1,
    t.chatSample2,
    t.chatSample3,
    t.chatSample4
  ];

  return (
    <div className="animate-view-fade max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 pb-24 lg:pb-12">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>{t.chatTitle}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.chatSubtitle}
            </p>
          </div>
        </div>

        <a
          href="tel:108"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-black text-xs hover:bg-red-100"
        >
          <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-bounce" />
          <span>SOS 108</span>
        </a>
      </div>

      {/* Safety Notice Ribbon */}
      <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900 text-xs flex items-center gap-2 font-medium">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
        <span>{t.chatDisclaimer}</span>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[65vh] sm:h-[68vh] min-h-[460px]">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 bg-slate-50/60">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            const isSos = msg.mode === 'sos';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                    isSos ? 'bg-rose-600 ring-4 ring-rose-100 animate-pulse' : 'bg-teal-600'
                  }`}>
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}

                <div className="max-w-[88%] sm:max-w-[78%] space-y-1.5">
                  <div
                    className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-wrap ${
                      isBot
                        ? isSos
                          ? 'bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-tl-xs shadow-red-100 font-medium'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs font-medium'
                        : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-tr-xs shadow-md shadow-teal-600/10 font-medium'
                    }`}
                  >
                    {isSos && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-200 text-rose-900 font-black text-xs">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          {t.chatSosAlert} ({msg.category?.toUpperCase()})
                        </span>
                        <a
                          href="tel:108"
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs hover:bg-rose-700 shadow-xs"
                        >
                          108 Call
                        </a>
                      </div>
                    )}

                    <p>{msg.text}</p>

                    {isBot && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-500">{t.chatSources}</span>
                        {msg.sources.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metadata & Audio TTS */}
                  <div className={`flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 px-1 ${
                    isBot ? 'justify-start' : 'justify-end'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {isBot && (
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          activeSpeechId === msg.id
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-200/90 hover:bg-slate-300 text-slate-700'
                        }`}
                        title="Listen audio explanation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{activeSpeechId === msg.id ? t.chatSpeaking : t.chatListen}</span>
                      </button>
                    )}
                  </div>

                </div>

                {!isBot && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5 sm:gap-3 justify-start items-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-teal-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-slate-500 shadow-2xs font-medium">
                <RefreshCw className="w-4 h-4 text-teal-600 animate-spin" />
                <span>{lang === 'hi' ? 'क्यूरा AI दिशानिर्देशों से जांच कर रहा है...' : 'Cura AI is consulting clinical guidelines...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-t border-slate-200/90 overflow-x-auto flex items-center gap-2 text-xs shrink-0">
          <span className="text-[10px] sm:text-[11px] font-black text-slate-400 shrink-0">{t.chatTryPrompt}</span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="shrink-0 px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-800 hover:bg-teal-50 transition-all font-semibold cursor-pointer shadow-2xs text-xs whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form Bar */}
        <div className="p-2.5 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.pdf"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 sm:p-3 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors cursor-pointer shrink-0"
              title={t.chatAttachFile}
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              disabled={loading}
              placeholder={t.chatPlaceholder}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !inputText.trim()}
              className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-black shadow-md shadow-teal-600/20 disabled:opacity-40 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
