import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Brain, ArrowRight, ArrowLeft, Sparkles, Star, IndianRupee, Clock } from 'lucide-react';
import { getImgSrc } from '../utils/image';

/* ── Types ── */
interface Therapist {
  _id: string;
  name: string;
  specialization: string;
  sessionType: string;
  sessionCost: number;
  sessionTime: number;
  experience: number;
  languages?: string[];
  education?: string;
  profilePicture?: string;
  ratingAverage?: number;
  ratingCount?: number;
  about?: string;
}

interface MatchedTherapist extends Therapist {
  matchScore: number;
}

interface Props {
  therapists: Therapist[];
  onClose: () => void;
  onSelectTherapist: (t: Therapist) => void;
}

/* ── Quiz Questions ── */
const QUESTIONS = [
  {
    id: 'concern',
    question: "What's been weighing on you lately?",
    subtitle: 'Choose the one that resonates most with you right now.',
    options: [
      { label: 'Anxiety & Stress',        value: 'anxiety' },
      { label: 'Depression & Low Mood',   value: 'depression' },
      { label: 'Relationship Issues',     value: 'relationship' },
      { label: 'Trauma & PTSD',           value: 'trauma' },
      { label: 'Teen / Youth Support',    value: 'teen' },
      { label: "I'm not sure yet",        value: 'any' },
    ],
  },
  {
    id: 'situation',
    question: 'How would you describe your situation?',
    subtitle: 'This helps us find the right type of support for you.',
    options: [
      { label: 'I need someone to talk to',      value: 'talk' },
      { label: 'I want structured therapy',       value: 'structured' },
      { label: "I'm in crisis, need help now",   value: 'crisis' },
      { label: "Just exploring my options",      value: 'exploring' },
    ],
  },
  {
    id: 'format',
    question: 'Session format preference?',
    subtitle: 'Where are you most comfortable having sessions?',
    options: [
      { label: 'Online — from home',       value: 'online' },
      { label: 'In-person at clinic',      value: 'offline' },
      { label: 'Either works for me',      value: 'both' },
    ],
  },
  {
    id: 'budget',
    question: "What's your budget per session?",
    subtitle: 'We have great therapists at every price point.',
    options: [
      { label: 'Under ₹500',      value: 'low' },
      { label: '₹500 – ₹1,000',  value: 'mid' },
      { label: '₹1,000+',        value: 'high' },
      { label: 'No preference',   value: 'any' },
    ],
  },
  {
    id: 'language',
    question: 'Language preference?',
    subtitle: 'Communication is key — choose your comfort language.',
    options: [
      { label: 'English',          value: 'english' },
      { label: 'Hindi',            value: 'hindi' },
      { label: 'Both are fine',    value: 'both' },
      { label: 'No preference',    value: 'any' },
    ],
  },
  {
    id: 'experience',
    question: 'Experience level preference?',
    subtitle: "Sometimes fresh perspective, sometimes seasoned wisdom — you decide.",
    options: [
      { label: 'New but passionate (1–3 yrs)', value: 'new' },
      { label: 'Experienced (3–5 yrs)',         value: 'mid' },
      { label: 'Highly seasoned (5+ yrs)',      value: 'senior' },
      { label: "Doesn't matter",               value: 'any' },
    ],
  },
];

/* ── Scoring Algorithm ── */
function scoreTherapist(t: Therapist, answers: Record<string, string>): number {
  let score = 0;

  // Q1: Concern → specialization (30 pts)
  const concern = answers.concern || 'any';
  const spec = (t.specialization || '').toLowerCase();
  if (concern === 'any') {
    score += 30;
  } else {
    const map: Record<string, string[]> = {
      anxiety:      ['anxiety', 'stress', 'cognitive', 'cbt'],
      depression:   ['depression', 'clinical', 'mood'],
      relationship: ['relationship', 'couple', 'marriage', 'counsell'],
      trauma:       ['trauma', 'ptsd'],
      teen:         ['adolescent', 'teen', 'child', 'youth'],
    };
    const keywords = map[concern] || [];
    if (keywords.some(k => spec.includes(k))) score += 30;
    else score += 5; // small base for at least having a therapist
  }

  // Q3: Format (20 pts)
  const format = answers.format || 'any';
  const st = (t.sessionType || 'online').toLowerCase();
  if (format === 'both' || format === 'any') {
    score += 20;
  } else if (format === 'online' && (st === 'online' || st === 'both')) {
    score += 20;
  } else if (format === 'offline' && (st === 'offline' || st === 'both')) {
    score += 20;
  } else {
    score += 5;
  }

  // Q4: Budget (20 pts)
  const budget = answers.budget || 'any';
  const cost = t.sessionCost || 500;
  if (budget === 'any') {
    score += 20;
  } else if (budget === 'low' && cost < 500) {
    score += 20;
  } else if (budget === 'mid' && cost >= 500 && cost <= 1000) {
    score += 20;
  } else if (budget === 'high' && cost > 1000) {
    score += 20;
  } else {
    score += 5;
  }

  // Q5: Language (15 pts)
  const lang = answers.language || 'any';
  const langs = (t.languages || ['English', 'Hindi']).map(l => (l || '').toLowerCase());
  if (lang === 'any' || lang === 'both') {
    score += 15;
  } else if (lang === 'english' && langs.some(l => l.includes('english'))) {
    score += 15;
  } else if (lang === 'hindi' && langs.some(l => l.includes('hindi'))) {
    score += 15;
  } else {
    score += 5;
  }

  // Q6: Experience (15 pts)
  const exp = answers.experience || 'any';
  const yrs = t.experience || 1;
  if (exp === 'any') {
    score += 15;
  } else if (exp === 'new' && yrs <= 3) {
    score += 15;
  } else if (exp === 'mid' && yrs > 3 && yrs <= 5) {
    score += 15;
  } else if (exp === 'senior' && yrs > 5) {
    score += 15;
  } else {
    score += 5;
  }

  return Math.min(score, 100);
}

/* ── Main Component ── */
export default function TherapistMatchQuiz({ therapists, onClose, onSelectTherapist }: Props) {
  const [step, setStep] = useState(0); // 0 = intro, 1-6 = questions, 7 = results
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);

  const totalSteps = QUESTIONS.length;
  const currentQuestion = QUESTIONS[step - 1];

  const goNext = () => {
    setDirection(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep(s => Math.max(0, s - 1));
  };

  const selectAnswer = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const computeMatches = (): MatchedTherapist[] => {
    if (!therapists.length) return [];
    return therapists
      .map(t => ({ ...t, matchScore: scoreTherapist(t, answers) }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  };

  const matchedTherapists = step > totalSteps ? computeMatches() : [];
  const progress = step === 0 ? 0 : Math.round((step / totalSteps) * 100);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0 }),
    center: { x: '0%', opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)' }}>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10"
      >
        <X size={18} />
      </button>

      {/* Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-[#0d5d3a]/15 dark:border-white/10 overflow-hidden"
        style={{ maxHeight: '92vh' }}>

        {/* Progress bar */}
        {step > 0 && step <= totalSteps && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 z-10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        )}

        <div className="overflow-y-auto" style={{ maxHeight: '92vh' }}>
          <AnimatePresence mode="wait" custom={direction}>

            {/* ── INTRO ── */}
            {step === 0 && (
              <motion.div key="intro"
                custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex flex-col items-center text-center p-8 sm:p-12"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center mb-6 shadow-lg shadow-[#0d5d3a]/25">
                  <Brain size={38} className="text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0a2617] dark:text-white mb-3"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
                  Find Your Perfect Match
                </h2>
                <p className="text-[#4a7c5d] dark:text-gray-400 text-base leading-relaxed max-w-md mb-2">
                  Answer <strong className="text-[#0d5d3a] dark:text-[#10b981]">6 quick questions</strong> and we'll match you with the therapists who fit your needs best — completely anonymous, no sign-in needed.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Takes less than 2 minutes ⏱️</p>

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                  {['Anonymous', '100% Free', 'No Commitment', 'Instant Results'].map(tag => (
                    <span key={tag}
                      className="px-3 py-1.5 bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] rounded-full text-xs font-bold">
                       {tag}
                    </span>
                  ))}
                </div>

                <button onClick={goNext}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#0d5d3a]/30 hover:shadow-[#0d5d3a]/40 hover:scale-105 transition-all">
                  <Sparkles size={18} /> Start the Quiz <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {/* ── QUESTION STEPS ── */}
            {step >= 1 && step <= totalSteps && currentQuestion && (
              <motion.div key={`q-${step}`}
                custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="p-6 sm:p-8"
              >
                {/* Step counter */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {QUESTIONS.map((_, i) => (
                      <div key={i}
                        className={`rounded-full transition-all duration-300 ${i + 1 < step
                          ? 'w-5 h-5 bg-[#0d5d3a] dark:bg-[#10b981] flex items-center justify-center'
                          : i + 1 === step
                            ? 'w-5 h-5 bg-[#0d5d3a] dark:bg-[#10b981]'
                            : 'w-2 h-2 bg-[#d8e8dc] dark:bg-white/10'
                          }`}>
                        {i + 1 < step && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-500">
                    {step} of {totalSteps}
                  </span>
                </div>

                {/* Question card — matching Stepper/wellness card style */}
                <div className="bg-gradient-to-br from-[#f4fbf6] to-white dark:from-[#0d5d3a]/10 dark:to-[#111111] rounded-2xl border border-[#0d5d3a]/12 dark:border-white/8 p-5 sm:p-6 mb-5">
                  <h3 className="text-xl sm:text-2xl font-black text-[#0a2617] dark:text-white mb-2"
                    style={{ fontFamily: 'Syne, sans-serif' }}>
                    {currentQuestion.question}
                  </h3>
                  <p className="text-sm text-[#4a7c5d] dark:text-gray-400">{currentQuestion.subtitle}</p>
                </div>

                {/* Answer cards grid */}
                <div className={`grid gap-3 ${currentQuestion.options.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {currentQuestion.options.map(opt => {
                    const selected = answers[currentQuestion.id] === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAnswer(currentQuestion.id, opt.value)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${selected
                          ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] border-[#0d5d3a] dark:border-[#1a8a5a] text-white shadow-lg shadow-[#0d5d3a]/25'
                          : 'bg-white dark:bg-[#1a1a1a] border-[#0d5d3a]/15 dark:border-white/10 hover:border-[#0d5d3a]/40 dark:hover:border-[#10b981]/40 hover:bg-[#e6f4ea] dark:hover:bg-[#0d5d3a]/15'
                          }`}
                      >
                        <span className={`text-sm font-semibold leading-snug ${selected ? 'text-white' : 'text-[#0a2617] dark:text-white'}`}>
                          {opt.label}
                        </span>
                        {selected && (
                          <span className="ml-auto flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className={`mt-6 flex ${step > 1 ? 'justify-between' : 'justify-end'}`}>
                  {step > 1 && (
                    <button onClick={goBack}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 text-[#0d5d3a] dark:text-gray-300 text-sm font-semibold hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition">
                      <ArrowLeft size={15} /> Back
                    </button>
                  )}
                  <button
                    onClick={goNext}
                    disabled={!answers[currentQuestion.id]}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white text-sm font-bold hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  >
                    {step === totalSteps ? (
                      <><Sparkles size={15} /> Find My Matches</>
                    ) : (
                      <>Next <ArrowRight size={15} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── RESULTS ── */}
            {step > totalSteps && (
              <motion.div key="results"
                custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="p-6 sm:p-8"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] items-center justify-center mb-3 shadow-lg shadow-[#0d5d3a]/25">
                    <Sparkles size={26} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-[#0a2617] dark:text-white"
                    style={{ fontFamily: 'Syne, sans-serif' }}>
                    Your Top Matches
                  </h3>
                  <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">
                    Based on your answers, we found {matchedTherapists.length} great fit{matchedTherapists.length !== 1 ? 's' : ''} for you.
                  </p>
                </div>

                {matchedTherapists.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3"></div>
                    <p className="text-[#4a7c5d] dark:text-gray-400 font-medium">No therapists available yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Please check back soon as our network grows!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchedTherapists.map((t, i) => (
                      <motion.div
                        key={t._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#0d5d3a]/12 dark:border-white/8 p-4 sm:p-5 flex items-start gap-4 hover:border-[#0d5d3a]/30 dark:hover:border-[#10b981]/30 hover:shadow-md transition-all"
                      >
                        {/* Rank badge */}
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 dark:bg-gray-600 text-[#0a2617] dark:text-white' : 'bg-orange-300 text-white'}`}>
                          {i + 1}
                        </div>

                        {/* Avatar */}
                        {t.profilePicture
                          ? <img src={getImgSrc(t.profilePicture)} alt={t.name}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-[#e6f4ea] dark:border-[#0d5d3a]/30 flex-shrink-0" />
                          : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                              {(t.name || 'T').charAt(0)}
                            </div>
                        }

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h4 className="font-black text-[#0a2617] dark:text-white text-base leading-tight">
                                {t.name}
                              </h4>
                              <p className="text-xs text-[#4a7c5d] dark:text-gray-400 font-medium">{t.specialization}</p>
                            </div>
                            {/* Match % badge */}
                            <div className="flex-shrink-0 flex flex-col items-center bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] rounded-xl px-2.5 py-1.5 shadow-md shadow-[#0d5d3a]/20">
                              <span className="text-white text-sm font-black leading-none">{t.matchScore}%</span>
                              <span className="text-[#a7f3d0] text-[9px] font-bold leading-none mt-0.5">match</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <IndianRupee size={11} /> ₹{t.sessionCost}/{t.sessionTime}min
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock size={11} /> {t.experience}+ yrs
                            </span>
                            {t.ratingAverage ? (
                              <span className="flex items-center gap-1 text-xs text-amber-500">
                                <Star size={11} className="fill-amber-400" /> {t.ratingAverage.toFixed(1)} ({t.ratingCount})
                              </span>
                            ) : (
                              <span className="text-xs text-[#10b981] font-semibold"> New</span>
                            )}
                          </div>

                          <button
                            onClick={() => { onSelectTherapist(t); onClose(); }}
                            className="w-full py-2.5 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-sm hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition shadow-md"
                          >
                            View Profile & Book
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#0d5d3a]/10 dark:border-white/5">
                  <button onClick={() => { setStep(0); setAnswers({}); setDirection(-1); }}
                    className="text-sm text-[#4a7c5d] dark:text-gray-400 font-semibold hover:text-[#0d5d3a] dark:hover:text-white transition">
                    ↩ Retake Quiz
                  </button>
                  <button onClick={onClose}
                    className="text-sm text-[#4a7c5d] dark:text-gray-400 font-semibold hover:text-[#0d5d3a] dark:hover:text-white transition">
                    Browse All Therapists →
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
