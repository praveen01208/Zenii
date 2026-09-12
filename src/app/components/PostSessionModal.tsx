/**
 * PostSessionModal
 *
 * Auto-appears when the user has a recently completed session without feedback.
 * Features: 1–10 mood slider with animated emoji, takeaways textarea,
 * confetti on high mood, AI-suggested resources after submit.
 * Matches ZenMind design system.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, ExternalLink, Loader2, Check, ChevronRight } from 'lucide-react';
import { apiFetch } from '../api/client';

interface Session {
  _id: string;
  therapistName: string;
  date: string;
}

interface Feedback {
  suggestedResources: { title: string; url: string }[];
}

interface Props {
  onClose?: () => void;
}

const MOOD_EMOJIS = ['','','','','','','','','',''];
const MOOD_LABELS = [
  'Very low','Low','Struggling','Neutral','Okay',
  'Good','Great','Really good','Excellent','Outstanding',
];
const MOOD_COLORS = [
  '#dc2626','#ea580c','#f97316','#eab308','#84cc16',
  '#22c55e','#10b981','#14b8a6','#0ea5e9','#6366f1',
];

export default function PostSessionModal({ onClose }: Props) {
  const [session, setSession]       = useState<Session | null>(null);
  const [checking, setChecking]     = useState(true);
  const [mood, setMood]             = useState(7);
  const [takeaways, setTakeaways]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback]     = useState<Feedback | null>(null);
  const [dismissed, setDismissed]   = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Poll once on mount for a pending completed session
  useEffect(() => {
    apiFetch<any>('/session-prep/completed')
      .then(r => setSession(r.session || null))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const fireConfetti = useCallback(async () => {
    try {
      // Use canvas-confetti if available (already in dependencies)
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d5d3a','#10b981','#34d399','#fff','#6ee7b7'],
      });
    } catch { /* non-critical */ }
  }, []);

  const handleSubmit = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<any>(`/session-prep/${session._id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ moodRating: mood, takeaways }),
      });
      setFeedback(res.feedback);
      if (mood >= 7) fireConfetti();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const close = () => {
    setDismissed(true);
    if (onClose) onClose();
  };

  if (checking || !session || dismissed) return null;

  const moodColor = MOOD_COLORS[mood - 1];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white rounded-[28px] border-2 border-[#0d5d3a]/15 shadow-2xl overflow-hidden"
          ref={confettiRef}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-[#0d5d3a]/15 bg-[#f4faf7]">
            <button onClick={close} className="absolute top-5 right-5 p-1.5 rounded-full text-[#0d5d3a] hover:bg-[#e6f4ea] transition">
              <X className="w-4 h-4" />
            </button>
            <div className="pr-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#78350f] text-xs font-bold mb-2">
                 Session Complete
              </div>
              <h2 className="text-xl font-extrabold text-[#0d5d3a]" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
                How did it go?
              </h2>
              <p className="text-xs text-[#d97706] font-semibold mt-0.5">
                Session with {session.therapistName} ·{' '}
                {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto max-h-[65vh]">
            {!feedback ? (
              <div className="space-y-6">
                {/* Mood Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-widest">
                      Mood Rating
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{MOOD_EMOJIS[mood - 1]}</span>
                      <span className="text-sm font-bold" style={{ color: moodColor }}>
                        {mood}/10 · {MOOD_LABELS[mood - 1]}
                      </span>
                    </div>
                  </div>

                  {/* Custom slider with gradient track */}
                  <div className="relative py-2">
                    <div
                      className="absolute top-1/2 left-0 h-2 rounded-full -translate-y-1/2 transition-all duration-150"
                      style={{ width: `${(mood - 1) / 9 * 100}%`, backgroundColor: moodColor }}
                    />
                    <div className="absolute top-1/2 left-0 w-full h-2 rounded-full -translate-y-1/2 bg-gray-100 dark:bg-white/10 -z-10" />
                    <input
                      type="range" min={1} max={10} value={mood}
                      onChange={e => setMood(Number(e.target.value))}
                      className="w-full relative z-10 appearance-none bg-transparent cursor-pointer"
                      style={{
                        WebkitAppearance: 'none',
                      }}
                    />
                    <style>{`
                      input[type=range]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        width: 22px; height: 22px;
                        border-radius: 50%;
                        background: ${moodColor};
                        cursor: pointer;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        transition: transform 0.1s;
                      }
                      input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }
                      input[type=range]::-moz-range-thumb {
                        width: 22px; height: 22px;
                        border-radius: 50%;
                        background: ${moodColor};
                        cursor: pointer;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                      }
                    `}</style>
                  </div>

                  <div className="flex justify-between text-[9px] text-[#4a7c5d]/60 dark:text-gray-500 mt-1">
                    <span>Very low</span><span>Outstanding</span>
                  </div>
                </div>

                {/* Takeaways */}
                <div>
                  <label className="block text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-widest mb-2">
                    Key Takeaways (private)
                  </label>
                  <textarea
                    value={takeaways}
                    onChange={e => setTakeaways(e.target.value)}
                    placeholder="What insights did you gain? What would you like to remember or work on?"
                    rows={4}
                    maxLength={3000}
                    className="w-full px-4 py-3 rounded-2xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-[#0a2617] dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 resize-none"
                  />
                  <p className="text-[10px] text-[#4a7c5d]/60 dark:text-gray-500 mt-1 text-right">
                    {takeaways.length}/3000
                  </p>
                </div>

                {mood >= 7 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 rounded-2xl p-3 border border-[#0d5d3a]/15 dark:border-[#0d5d3a]/30 text-sm text-[#0d5d3a] dark:text-[#10b981] font-semibold text-center">
                     Great job investing in yourself today!
                  </motion.div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-black text-sm hover:bg-[#0a4a2e] transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#0d5d3a]/20"
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : <>Save Feedback <ChevronRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            ) : (
              /* ── Success State ── */
              <div className="space-y-5 py-2">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#0d5d3a]/10 dark:bg-[#0d5d3a]/20 flex items-center justify-center mb-3">
                    <Check className="w-8 h-8 text-[#0d5d3a] dark:text-[#10b981]" />
                  </div>
                  <p className="text-base font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Feedback saved!
                  </p>
                  <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1">
                    Mood: {mood}/10 · {MOOD_EMOJIS[mood - 1]}
                  </p>
                </div>

                {feedback.suggestedResources && feedback.suggestedResources.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Suggested for You
                    </p>
                    <div className="space-y-2">
                      {feedback.suggestedResources.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 border border-[#0d5d3a]/15 dark:border-[#0d5d3a]/30 hover:border-[#0d5d3a]/40 transition group">
                          <span className="text-sm font-semibold text-[#0a2617] dark:text-gray-100 group-hover:text-[#0d5d3a] dark:group-hover:text-[#10b981] transition line-clamp-1">
                            {r.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#0d5d3a] dark:text-[#10b981] flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={close}
                  className="w-full py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-black text-sm hover:bg-[#0a4a2e] transition shadow-md shadow-[#0d5d3a]/15">
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
