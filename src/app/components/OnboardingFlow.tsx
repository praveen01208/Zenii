import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Heart, Brain, Users, BookOpen, Target, Flame, Star, Sparkles, ChevronRight, ShieldCheck, Smile } from 'lucide-react';
import { apiFetch } from '../api/client';
import logo from '../../../asset/logo.png';

interface Props {
  userName: string;
  onComplete: () => void;
}

const GOALS = [
  { id: 'reduce_anxiety',   icon: '🧘', label: 'Reduce Anxiety',        desc: 'Calm racing thoughts & worry' },
  { id: 'better_sleep',     icon: '🌙', label: 'Sleep Better',           desc: 'Build a healthy sleep routine' },
  { id: 'boost_mood',       icon: '☀️', label: 'Improve My Mood',        desc: 'Feel more positive day-to-day' },
  { id: 'manage_stress',    icon: '🌿', label: 'Manage Stress',          desc: 'Handle pressure more calmly' },
  { id: 'build_confidence', icon: '✨', label: 'Build Confidence',       desc: 'Strengthen self-belief' },
  { id: 'therapy',          icon: '🩺', label: 'Talk to a Therapist',    desc: 'Professional 1-on-1 support' },
  { id: 'mindfulness',      icon: '🧠', label: 'Practice Mindfulness',   desc: 'Stay present & grounded' },
  { id: 'social',           icon: '🤝', label: 'Improve Relationships',  desc: 'Connect better with others' },
];

const MOODS = ['😢','😕','😐','🙂','😄'];
const STRESS = ['Very Low','Low','Moderate','High','Very High'];

const FEATURES = [
  { icon: <Brain className="w-7 h-7"/>, title: 'Zeni AI Companion', desc: 'Your 24/7 AI wellness friend — talk, vent, or get guided exercises anytime.' },
  { icon: <Heart className="w-7 h-7"/>, title: 'Therapy Hub', desc: 'Browse verified therapists and book video sessions in minutes.' },
  { icon: <Target className="w-7 h-7"/>, title: 'Wellness Goals', desc: 'Set daily goals and build powerful streaks that keep you motivated.' },
  { icon: <BookOpen className="w-7 h-7"/>, title: 'Reading Lists', desc: 'Therapist-curated articles, books and guides tailored to your needs.' },
  { icon: <Users className="w-7 h-7"/>, title: 'Peer Circles', desc: 'Safe, moderated group spaces to share experiences with others.' },
  { icon: <Flame className="w-7 h-7"/>, title: 'Wellness Programs', desc: 'Structured multi-day programs for mindfulness, sleep and more.' },
];

const STEP_COUNT = 5;

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-[#e6f4ea] px-3 py-1.5 rounded-full border border-[#0d5d3a]/20">
      {Array.from({ length: STEP_COUNT }).map((_, i) => (
        <motion.div key={i} animate={{ width: i === step ? 20 : 6, opacity: i <= step ? 1 : 0.35 }}
          transition={{ duration: 0.3 }}
          className={`h-2 rounded-full ${i <= step ? 'bg-[#0d5d3a]' : 'bg-[#0d5d3a]/30'}`} />
      ))}
    </div>
  );
}

/* ── Step 0: Welcome ── */
function StepWelcome({ name, onNext }: { name: string; onNext: () => void }) {
  const first = name.split(' ')[0];
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6 py-8 max-w-lg mx-auto">
      <div className="bg-white rounded-[28px] border-2 border-[#0d5d3a]/15 shadow-2xl p-8 sm:p-10 w-full relative overflow-hidden">
        
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-[#e6f4ea] border-2 border-[#0d5d3a]/20 flex items-center justify-center mx-auto mb-6 shadow-xs ring-4 ring-[#d97706]/20">
          <img src={logo} alt="ZenMind" className="w-12 h-12 object-contain" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#78350f] text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#d97706]" /> Google Workspace Onboarding
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d5d3a] mb-3 leading-tight" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Hi {first},<br />
            <span className="text-[#d97706]">Let's setup your account.</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mb-8 max-w-xs mx-auto">
            This takes just 2 minutes. We'll personalise your ZenMind dashboard so every tool works best for you.
          </p>

          <button onClick={onNext}
            className="w-full py-3.5 rounded-full bg-[#0d5d3a] hover:bg-[#084229] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] font-semibold text-gray-500 mt-4">You can adjust these settings anytime in your profile</p>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Step 1: Goals ── */
function StepGoals({ selected, onToggle, onNext, onBack }: { selected: string[]; onToggle: (id: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 py-6 max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-[28px] border-2 border-[#0d5d3a]/15 shadow-2xl p-6 sm:p-8 flex flex-col h-full overflow-hidden">
        
        <div className="mb-6 shrink-0 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d5d3a] mb-1" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            What brings you to ZenMind?
          </h2>
          <p className="text-xs font-semibold text-gray-600">Select all goals that apply — we'll tailor your workspace view accordingly.</p>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-y-auto pb-4 custom-scrollbar">
          {GOALS.map((g, i) => {
            const active = selected.includes(g.id);
            return (
              <motion.button key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => onToggle(g.id)}
                className={`relative flex flex-col items-center text-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  active ? 'border-[#0d5d3a] bg-[#e6f4ea] shadow-xs' : 'border-[#0d5d3a]/15 bg-white hover:bg-[#fef8ec]'
                }`}>
                {active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#d97706] text-white flex items-center justify-center shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </motion.div>
                )}
                <span className="text-2xl mb-1.5">{g.icon}</span>
                <p className="text-xs font-bold text-[#0d5d3a] leading-tight">{g.label}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-1 leading-tight hidden sm:block">{g.desc}</p>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#0d5d3a]/15 shrink-0">
          <button onClick={onBack} className="text-xs font-bold text-[#0d5d3a] hover:underline px-3 py-2">← Back</button>
          <button onClick={onNext}
            className="px-6 py-2.5 rounded-full bg-[#0d5d3a] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#084229] transition flex items-center gap-2 shadow-sm">
            {selected.length === 0 ? 'Skip for now' : `Continue (${selected.length})`} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Mood + Stress ── */
function StepMood({ mood, stress, onMood, onStress, onNext, onBack }: {
  mood: number; stress: number; onMood: (v: number) => void; onStress: (v: number) => void;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-6 max-w-lg mx-auto w-full">
      <div className="bg-white rounded-[28px] border-2 border-[#0d5d3a]/15 shadow-2xl p-6 sm:p-8 flex flex-col h-full overflow-hidden">
        
        <div className="mb-6 shrink-0 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d5d3a] mb-1" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            How are you feeling today?
          </h2>
          <p className="text-xs font-semibold text-gray-600">This configures your initial daily mood check-in.</p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Mood Slider */}
          <div>
            <p className="text-xs font-bold text-[#78350f] uppercase tracking-wider mb-3">Current Mood</p>
            <div className="flex justify-between gap-2">
              {MOODS.map((emoji, i) => (
                <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => onMood(i + 1)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                    mood === i + 1 ? 'border-[#0d5d3a] bg-[#e6f4ea] ring-2 ring-[#d97706]' : 'border-[#0d5d3a]/15 bg-white hover:bg-[#fef8ec]'
                  }`}>
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-[10px] font-bold text-[#0d5d3a] hidden sm:block">
                    {['Very Low','Low','Okay','Good','Great'][i]}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <p className="text-xs font-bold text-[#78350f] uppercase tracking-wider mb-3">
              Stress Level — <span className="text-[#0d5d3a]">{STRESS[stress - 1] || 'Select'}</span>
            </p>
            <div className="flex justify-between gap-2">
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => onStress(v)}
                  className={`flex-1 py-2.5 rounded-full font-bold text-xs border-2 transition-all ${
                    stress === v ? 'bg-[#0d5d3a] border-[#0d5d3a] text-white shadow-xs' : 'border-[#0d5d3a]/15 text-[#0d5d3a] hover:bg-[#e6f4ea]'
                  }`}>{v}</button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-gray-500 px-1 mt-1.5">
              <span>1 (Very Low)</span><span>5 (Very High)</span>
            </div>
          </div>

          <div className="bg-[#fef3c7] rounded-2xl p-4 border border-[#fde68a] flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#d97706] shrink-0" />
            <p className="text-xs text-[#78350f] font-semibold leading-relaxed">
              <strong>Private Data:</strong> Used strictly to tailor your personalized check-ins. Never shared.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#0d5d3a]/15 shrink-0">
          <button onClick={onBack} className="text-xs font-bold text-[#0d5d3a] hover:underline px-3 py-2">← Back</button>
          <button onClick={onNext}
            className="px-6 py-2.5 rounded-full bg-[#0d5d3a] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#084229] transition flex items-center gap-2 shadow-sm">
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Features Tour ── */
function StepFeatures({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [active, setActive] = useState(0);
  const f = FEATURES[active];
  return (
    <div className="flex flex-col h-full px-6 py-6 max-w-lg mx-auto w-full">
      <div className="bg-white rounded-[28px] border-2 border-[#0d5d3a]/15 shadow-2xl p-6 sm:p-8 flex flex-col h-full overflow-hidden">
        
        <div className="mb-4 shrink-0 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d5d3a] mb-1" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Everything Included Free
          </h2>
          <p className="text-xs font-semibold text-gray-600">A quick look at the features unlocked on your account.</p>
        </div>

        {/* Feature selector tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {FEATURES.map((feat, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 transition-all w-20 ${
                active === i ? 'border-[#0d5d3a] bg-[#e6f4ea] text-[#0d5d3a] shadow-xs' : 'border-[#0d5d3a]/10 bg-white text-gray-500 hover:bg-[#fef8ec]'
              }`}>
              {React.cloneElement(feat.icon, { className: 'w-5 h-5 text-[#d97706]' })}
              <span className="text-[10px] font-bold text-center leading-tight">{feat.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Feature card detail */}
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col items-center justify-center text-center bg-[#f4faf7] rounded-2xl border border-[#0d5d3a]/15 p-6">
            <div className="w-16 h-16 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#d97706] flex items-center justify-center mb-4 shadow-xs">
              {f.icon}
            </div>
            <h3 className="text-lg font-extrabold text-[#0d5d3a] mb-2" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>{f.title}</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed max-w-xs">{f.desc}</p>
            <div className="flex gap-1.5 mt-4">
              {FEATURES.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-[#d97706]' : 'w-1.5 bg-[#0d5d3a]/30'}`} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4 border-t border-[#0d5d3a]/15 shrink-0 mt-4">
          <button onClick={onBack} className="text-xs font-bold text-[#0d5d3a] hover:underline px-3 py-2">← Back</button>
          <button onClick={onNext}
            className="px-6 py-2.5 rounded-full bg-[#0d5d3a] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#084229] transition flex items-center gap-2 shadow-sm">
            Almost Ready <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step 4: All Set ── */
function StepAllSet({ name, saving, onFinish }: { name: string; saving: boolean; onFinish: () => void }) {
  const first = name.split(' ')[0];
  const perks = [
    'AI Chat powered by Zeni — 24/7 wellness companion',
    'Verified therapists for video & chat sessions',
    'Wellness goals, mood tracking, and reading lists',
    '100% Free & Unlimited access to all features',
  ];
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6 py-6 max-w-lg mx-auto">
      <div className="bg-white rounded-[28px] border-2 border-[#0d5d3a]/15 shadow-2xl p-8 sm:p-10 w-full relative overflow-hidden">
        
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 12 }}
          className="w-20 h-20 rounded-full bg-[#0d5d3a] text-[#d97706] flex items-center justify-center mx-auto mb-6 shadow-md ring-4 ring-[#d97706]/30">
          <Star className="w-10 h-10 fill-[#d97706]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d5d3a] mb-2" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            You're all set, <span className="text-[#d97706]">{first}!</span>
          </h1>
          <p className="text-xs font-semibold text-gray-600 mb-6">Your personalized ZenMind dashboard is ready.</p>
          
          <div className="text-left space-y-2.5 mb-8">
            {perks.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 bg-[#e6f4ea] rounded-2xl px-4 py-2.5 border border-[#0d5d3a]/15">
                <div className="w-5 h-5 rounded-full bg-[#0d5d3a] text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <p className="text-xs text-[#0d5d3a] font-bold">{p}</p>
              </motion.div>
            ))}
          </div>

          <button onClick={onFinish} disabled={saving}
            className="w-full py-3.5 rounded-full bg-[#0d5d3a] hover:bg-[#084229] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving Setup…</>
            ) : (
              <>Go to My Dashboard <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN GOOGLE MATERIAL ONBOARDING FLOW
══════════════════════════════════════════════════════ */
export default function OnboardingFlow({ userName, onComplete }: Props) {
  const [step, setStep]       = useState(0);
  const [goals, setGoals]     = useState<string[]>([]);
  const [mood, setMood]       = useState(3);
  const [stress, setStress]   = useState(3);
  const [saving, setSaving]   = useState(false);

  const toggleGoal = (id: string) =>
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const next = () => setStep(s => Math.min(STEP_COUNT - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const finish = async () => {
    setSaving(true);
    try {
      await apiFetch('/me/onboarding', {
        method: 'POST',
        body: JSON.stringify({ goals, currentMood: mood, stressLevel: stress }),
      });
    } catch { /* proceed on error */ }
    finally { setSaving(false); }
    onComplete();
  };

  const STEPS = [
    <StepWelcome name={userName} onNext={next} />,
    <StepGoals selected={goals} onToggle={toggleGoal} onNext={next} onBack={back} />,
    <StepMood mood={mood} stress={stress} onMood={setMood} onStress={setStress} onNext={next} onBack={back} />,
    <StepFeatures onNext={next} onBack={back} />,
    <StepAllSet name={userName} saving={saving} onFinish={finish} />,
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f4faf7] flex flex-col overflow-hidden text-[#0a2617] font-sans">
      
      {/* ── GOOGLE WORKSPACE ONBOARDING TOP BAR ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 h-16 bg-white border-b border-[#0d5d3a]/15 shadow-2xs z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ZenMind" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-[#0d5d3a]" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            ZenMind Setup
          </span>
          <span className="hidden sm:inline-block text-xs font-extrabold text-[#78350f] bg-[#fef3c7] border border-[#fde68a] px-2.5 py-0.5 rounded-full">
            Step {step + 1} of {STEP_COUNT}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ProgressDots step={step} />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto py-4">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="h-full min-h-full">
            {STEPS[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Skip Bar — Steps 1-3 */}
      {step > 0 && step < 4 && (
        <div className="flex-shrink-0 px-6 py-3 text-center bg-white border-t border-[#0d5d3a]/10">
          <button onClick={() => setStep(4)} className="text-xs font-bold text-[#0d5d3a] hover:text-[#d97706] transition">
            Skip Setup → Continue to My Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
