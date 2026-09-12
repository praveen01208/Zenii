import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smile, Meh, Frown, ChevronRight } from 'lucide-react';
import { apiFetch } from '../api/client';

type Props = {
  onClose: () => void;
  onSaved?: (score: number) => void;
};

const MOOD_LABELS = [
  { score: 1,  emoji: '😭', label: 'Terrible',  color: '#dc2626' },
  { score: 2,  emoji: '😢', label: 'Very Bad',   color: '#ea580c' },
  { score: 3,  emoji: '😞', label: 'Bad',        color: '#f97316' },
  { score: 4,  emoji: '😟', label: 'Low',        color: '#eab308' },
  { score: 5,  emoji: '😐', label: 'Neutral',    color: '#84cc16' },
  { score: 6,  emoji: '🙂', label: 'Okay',       color: '#22c55e' },
  { score: 7,  emoji: '😊', label: 'Good',       color: '#10b981' },
  { score: 8,  emoji: '😄', label: 'Great',      color: '#0d9488' },
  { score: 9,  emoji: '😁', label: 'Excellent',  color: '#0891b2' },
  { score: 10, emoji: '🤩', label: 'Amazing!',   color: '#0d5d3a' },
];

export default function MoodCheckIn({ onClose, onSaved }: Props) {
  const [score, setScore]   = useState(0);
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  const selected = MOOD_LABELS.find(m => m.score === score);

  const handleSave = async () => {
    if (!score) return;
    setSaving(true);
    try {
      await apiFetch('/zen-progress/mood', {
        method: 'POST',
        body: JSON.stringify({ score, note }),
      });
      setDone(true);
      onSaved?.(score);
      setTimeout(onClose, 1800);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-sm bg-white dark:bg-[#111111] rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Daily Check-in</div>
            <div className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              How are you feeling today?
            </div>
            <div className="text-sm text-white/70 mt-1">Takes 10 seconds. Helps track your progress </div>
          </div>

          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-12 gap-3"
            >
              <div className="text-5xl">{selected?.emoji}</div>
              <div className="text-[#0d5d3a] font-bold text-lg">Mood saved!</div>
              <div className="text-sm text-[#4a7c5d]">See your progress in the Analytics tab</div>
            </motion.div>
          ) : (
            <div className="px-6 py-5">
              {/* Emoji grid */}
              <div className="grid grid-cols-5 gap-2 mb-5">
                {MOOD_LABELS.map(m => (
                  <button
                    key={m.score}
                    onClick={() => setScore(m.score)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-2xl border-2 transition-all ${
                      score === m.score
                        ? 'border-[#0d5d3a] bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 scale-110 shadow-md'
                        : 'border-transparent hover:border-[#0d5d3a]/30 hover:bg-[#f7fbf8] dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="text-2xl leading-none">{m.emoji}</span>
                    <span className="text-[9px] font-semibold text-[#4a7c5d] dark:text-gray-400">{m.score}</span>
                  </button>
                ))}
              </div>

              {/* Selected label */}
              <AnimatePresence mode="wait">
                {score > 0 && (
                  <motion.div
                    key={score}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center mb-4"
                  >
                    <span
                      className="inline-block text-2xl font-black px-4 py-1 rounded-full"
                      style={{ background: selected?.color + '20', color: selected?.color }}
                    >
                      {selected?.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Optional note */}
              {score > 0 && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Want to add a note? (optional)"
                    maxLength={200}
                    rows={2}
                    className="w-full bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#0a2617] dark:text-white placeholder:text-[#4a7c5d]/40 outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 resize-none mb-4"
                  />
                </motion.div>
              )}

              <button
                onClick={handleSave}
                disabled={!score || saving}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] text-white font-bold text-sm shadow-lg disabled:opacity-40 hover:from-[#0a4a2e] transition flex items-center justify-center gap-2"
              >
                {saving ? 'Saving...' : score ? `Log ${selected?.emoji} ${selected?.label}` : 'Select a mood first'}
                {!saving && score > 0 && <ChevronRight className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="w-full mt-2 py-2 text-xs text-[#4a7c5d] dark:text-gray-500 hover:text-[#0d5d3a] transition"
              >
                Maybe later
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
