import React from 'react';
import { 
  Bot, 
  FileScan, 
  MapPin, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  HeartHandshake,
  Check,
  Stethoscope,
  Pill,
  Ambulance,
  BookOpen
} from 'lucide-react';

export default function Features({ onOpenAssistant, onSelectSection }) {
  const pillars = [
    {
      id: 'triage',
      icon: Stethoscope,
      color: 'sky',
      badge: 'ICMR & WHO RAG',
      title: 'Bilingual Clinical Triage',
      desc: 'Ask questions in everyday Hindi or English. Our AI analyzes symptoms and provides immediate non-emergency guidance while strictly screening for red-flags.',
      highlights: [
        'Understands colloquial terms (dard, ulti, bukhar)',
        'Evidence-backed from official WHO guidelines',
        'Automatic emergency escalation when critical'
      ],
      cta: 'Start Clinical Chat',
      action: () => onOpenAssistant()
    },
    {
      id: 'scanner',
      icon: Pill,
      color: 'teal',
      badge: 'Multimodal Vision AI',
      title: 'Prescription & Blister Scanner',
      desc: 'Take a clear photograph of any handwritten prescription or medicine strip. The AI extracts exact dosages, schedule pills, and Hindi audio directions.',
      highlights: [
        'Visual morning, afternoon, night dosage pills',
        'Clear meal instructions (before/after food)',
        'Spoken audio guidance for low-literacy users'
      ],
      cta: 'Scan Prescription',
      action: () => {
        const el = document.getElementById('scanner');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'facilities',
      icon: Ambulance,
      color: 'emerald',
      badge: 'Real-time Directory',
      title: 'Nearby Health Centers & PHC',
      desc: 'Locate verified District Hospitals, Community Health Centres (CHC), and Primary Health Centres (PHC) in your region with emergency capabilities.',
      highlights: [
        'Anti-snake venom (ASV) availability status',
        '24x7 emergency & blood bank tags',
        'Direct one-tap telephone calling'
      ],
      cta: 'Explore Centers',
      action: () => {
        const el = document.getElementById('facilities');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'emergency',
      icon: ShieldAlert,
      color: 'rose',
      badge: 'Immediate Life-Saving SOP',
      title: 'Emergency First-Aid Protocols',
      desc: 'Zero-delay first-aid directions for time-sensitive hazards like venomous snakebites, acute cardiac distress, and trauma while waiting for 108 ambulance.',
      highlights: [
        'Step-by-step action items for bystander care',
        'What to do and what NEVER to do',
        'Bilingual audio and text in Hindi & English'
      ],
      cta: 'View First Aid Protocols',
      action: () => {
        const el = document.getElementById('emergency');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  return (
    <section id="triage" className="py-20 bg-slate-50/70 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Comprehensive Care System</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Designed For Rural Healthcare Realities.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Heal-U bridges the gap between low doctor-to-patient ratios, language barriers, and emergency transport with four core clinical modules.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div>
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {p.badge}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {p.desc}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                    {p.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA */}
                <button
                  onClick={p.action}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
