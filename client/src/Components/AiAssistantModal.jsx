import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  FileScan, 
  ShieldCheck, 
  RefreshCw, 
  User,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  Minimize2,
  Paperclip
} from 'lucide-react';

import { sendChatMessage} from '../services/chat.api'
import { explainPrescriptionBase64 } from '../services/explain.api'
import { uploadPrescription } from '../services/upload.api'

export default function AiAssistantModal({ isOpen, onClose, initialQuery = '' }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'नमस्ते! I am Cura AI, your Heal-U healthcare assistant. You can describe your symptoms in Hindi or English (जैसे "2 दिन से बुखार है" या "child has diarrhea"). How can I help you today?',
      mode: 'normal',
      sources: ['WHO & ICMR Guidelines', 'National Health Mission Protocol'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const [currentTab, setCurrentTab] = useState('chat'); // 'chat' or 'vision'
  const [isFullScreen, setIsFullScreen] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (initialQuery && initialQuery.trim()) {
        handleSend(initialQuery);
      }
    }
  }, [isOpen, initialQuery]);

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
        text: response.result || 'No advice could be generated. Please consult a doctor at your nearest PHC.',
        mode: response.mode || 'normal',
        category: response.category,
        sources: response.sources || ['Clinical Protocol'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);

      // If emergency SOS, play audio advisory alert automatically
      if (botMessage.mode === 'sos') {
        speakText(botMessage.text, botMessage.id);
      }

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: 'err-' + Date.now(),
        sender: 'bot',
        text: 'माफ़ करें, सर्वर से संपर्क नहीं हो पाया। यदि आपातकालीन स्थिति है तो तुरंत 108 पर कॉल करें। (Server connection error. If this is an emergency, dial 108 immediately.)',
        mode: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
    const hasHindi = /[\u0900-\u097F]/.test(text) || /(dard|bukhar|khoon|saans)/i.test(text);
    utterance.lang = hasHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);

    setActiveSpeechId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileUploadInChat = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userUploadMsg = {
      id: 'upload-' + Date.now(),
      sender: 'user',
      text: `[Attached Prescription: ${file.name}]`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userUploadMsg]);
    setLoading(true);

    try {
      const resp = await uploadPrescription(file);
      const data = resp.data;
      
      let summaryText = 'Prescription Analyzed successfully:\n\n';
      if (data.medicines && data.medicines.length > 0) {
        data.medicines.forEach((m, idx) => {
          summaryText += `${idx + 1}. ${m.name} (${m.purpose_en || m.purpose_hi})\n`;
          summaryText += `   • Timing: ${m.meal_timing === 'after_food' ? 'After food' : 'Before food'}\n`;
          summaryText += `   • Schedule: Morning: ${m.schedule?.morning ? 'Yes' : 'No'} | Noon: ${m.schedule?.afternoon ? 'Yes' : 'No'} | Night: ${m.schedule?.night ? 'Yes' : 'No'}\n`;
          if (m.warning) summaryText += `   • Warning: ${m.warning}\n`;
        });
      }
      if (data.general_advice_hi) {
        summaryText += `\nसलाह: ${data.general_advice_hi}`;
      }

      const botResp = {
        id: 'bot-rx-' + Date.now(),
        sender: 'bot',
        text: summaryText,
        mode: 'normal',
        sources: ['Gemini Vision AI', 'Standard Pharmacy Protocol'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botResp]);

    } catch (err) {
      // Fallback
      try {
        const fbResp = await explainPrescriptionBase64('', 'image/jpeg', file.name);
        const data = fbResp.data;
        let summaryText = `Prescription Guideline for ${file.name}:\n\n`;
        if (data.medicines) {
          data.medicines.forEach((m, idx) => {
            summaryText += `${idx + 1}. ${m.name} (${m.purpose_hi || m.purpose_en})\n`;
            summaryText += `   • निर्देश: ${m.audio_hi || m.audio_en}\n`;
          });
        }
        if (data.general_advice_hi) summaryText += `\nसलाह: ${data.general_advice_hi}`;

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
            text: 'Unable to analyze image file. Please ensure server is running.',
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
    '2 दिन से तेज बुखार और कंपकंपी है',
    'Severe chest pain radiating to left shoulder',
    'Snakebite first-aid protocol',
    'Child has loose watery stools and weakness'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        className={`bg-white rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden transition-all duration-300 ${
          isFullScreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-3xl h-[88vh] max-h-[780px]'
        }`}
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Cura AI</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/25 text-white">
                  Heal-U Assistant
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium">
                Grounded in WHO & ICMR Guidelines • English & हिन्दी
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Sub-Header Disclaimer Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Educational triage only. In life-threatening emergencies, always dial 108.</span>
          </div>
          <a
            href="tel:108"
            className="font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3" />
            <span>SOS 108</span>
          </a>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            const isSos = msg.mode === 'sos';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                    isSos 
                      ? 'bg-red-600 ring-4 ring-red-100 animate-pulse' 
                      : 'bg-teal-600'
                  }`}>
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                  
                  {/* Bubble Container */}
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${
                      isBot
                        ? isSos
                          ? 'bg-red-50 border-2 border-red-300 text-red-950 rounded-tl-xs shadow-red-100'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        : 'bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-tr-xs shadow-md shadow-sky-600/10'
                    }`}
                  >
                    {/* SOS Header Banner */}
                    {isSos && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-200 text-red-800 font-extrabold text-xs">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          EMERGENCY RED-FLAG TRIGGERED ({msg.category?.toUpperCase()})
                        </span>
                        <a
                          href="tel:108"
                          className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs hover:bg-red-700 shadow-xs flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          Dial 108
                        </a>
                      </div>
                    )}

                    <p>{msg.text}</p>

                    {/* Sources / Grounding Tags */}
                    {isBot && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-400 flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-500">Sources:</span>
                        {msg.sources.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Meta Bar (Timestamp + Audio Button) */}
                  <div className={`flex items-center gap-2 text-[11px] text-slate-400 px-1 ${
                    isBot ? 'justify-start' : 'justify-end'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {isBot && (
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          activeSpeechId === msg.id
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-200/80 hover:bg-slate-300 text-slate-600'
                        }`}
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{activeSpeechId === msg.id ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    )}
                  </div>

                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-slate-500 shadow-2xs">
                <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                <span>Cura AI is searching WHO/ICMR clinical guidelines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/60 overflow-x-auto flex items-center gap-2 text-xs shrink-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Try:</span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="shrink-0 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-700 hover:bg-sky-50 transition-all font-medium cursor-pointer shadow-2xs text-xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          
          <div className="flex items-center gap-2">
            
            {/* Hidden file input for prescription uploads inside chat */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUploadInChat}
              accept="image/*,.pdf"
              className="hidden"
            />

            {/* Attach prescription button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors cursor-pointer"
              title="Attach prescription photo or medicine strip"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask a health inquiry in Hindi or English (e.g. 'बुखार के लिए क्या करें')..."
              className="flex-1 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
            />

            {/* Send button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !inputText.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold shadow-md shadow-sky-600/20 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
