import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Laugh, Smile, Meh, Frown, HeartCrack,
  Sparkles, Trash2, ChevronDown, ChevronUp,
  BookOpen, TrendingUp, Calendar, Loader2, PenLine, X
} from 'lucide-react';
import { apiFetch } from '../api/client';

/* ────────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────── */
interface JournalEntry {
  _id: string;
  content: string;
  moodScore: number;
  moodLabel: string;
  aiTone: string;
  aiTags: string[];
  aiSummary: string;
  day: string;
  createdAt: string;
}

interface HeatmapDay {
  date: string;
  moodScore: number | null;
}

interface Insights {
  insight: string | null;
  entriesThisWeek: number;
  avgMood: number | null;
}

/* ────────────────────────────────────────────────────────────────
   Mood config  (Lucide icons — no raw Unicode emoji)
──────────────────────────────────────────────────────────────── */
const MOODS = [
  { score: 1, label: 'Very Low',  Icon: HeartCrack, color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-900/30',    ring: 'ring-rose-400',    heatBg: '#fca5a5' },
  { score: 2, label: 'Low',       Icon: Frown,      color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/30',ring: 'ring-orange-400',  heatBg: '#fdba74' },
  { score: 3, label: 'Okay',      Icon: Meh,        color: 'text-yellow-500',  bg: 'bg-yellow-50 dark:bg-yellow-900/30',ring: 'ring-yellow-400',  heatBg: '#fde68a' },
  { score: 4, label: 'Good',      Icon: Smile,      color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30', ring: 'ring-emerald-400', heatBg: '#6ee7b7' },
  { score: 5, label: 'Great',     Icon: Laugh,      color: 'text-teal-500',    bg: 'bg-teal-50 dark:bg-teal-900/30',    ring: 'ring-teal-400',    heatBg: '#0d9488' },
];

function moodFor(score: number | null) {
  return MOODS.find(m => m.score === score) ?? null;
}

/* ────────────────────────────────────────────────────────────────
   Heatmap Calendar (30 days)
──────────────────────────────────────────────────────────────── */
function HeatmapCalendar({ days }: { days: HeatmapDay[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; score: number | null } | null>(null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-[#0d5d3a] dark:text-[#10b981]" />
        <span className="text-sm font-bold text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
          30-Day Mood Map
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {days.map(d => {
          const m = moodFor(d.moodScore);
          return (
            <div
              key={d.date}
              title={`${d.date}${m ? ` — ${m.label}` : ' — no entry'}`}
              onMouseEnter={() => setTooltip({ date: d.date, score: d.moodScore })}
              onMouseLeave={() => setTooltip(null)}
              className="relative w-6 h-6 rounded-md cursor-pointer transition-transform hover:scale-110"
              style={{ backgroundColor: m ? m.heatBg : '#e5e7eb' }}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] text-[#4a7c5d] dark:text-gray-400 font-semibold">Mood:</span>
        {MOODS.map(m => (
          <div key={m.score} className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: m.heatBg }} />
            <span className="text-[10px] text-[#4a7c5d] dark:text-gray-400">{m.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded bg-gray-200 dark:bg-gray-700" />
          <span className="text-[10px] text-[#4a7c5d] dark:text-gray-400">No entry</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   AI Insights Card
──────────────────────────────────────────────────────────────── */
function InsightsCard({ insights, loading }: { insights: Insights | null; loading: boolean }) {
  return (
    <div className="rounded-3xl border border-[#0d5d3a]/15 dark:border-white/10 bg-gradient-to-br from-[#f0fbf4] to-white dark:from-[#0d5d3a]/10 dark:to-[#111111] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-[#0a2617] dark:text-gray-100 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
          Zeni's Weekly Insight
        </span>
        {insights && (
          <span className="ml-auto text-[10px] font-semibold text-[#4a7c5d] dark:text-gray-400 bg-[#e8f5ee] dark:bg-[#0d5d3a]/20 px-2 py-0.5 rounded-full">
            {insights.entriesThisWeek} {insights.entriesThisWeek === 1 ? 'entry' : 'entries'} this week
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Generating insight…
        </div>
      ) : insights?.insight ? (
        <>
          <p className="text-sm text-[#1a3a27] dark:text-gray-300 leading-relaxed italic">
            "{insights.insight}"
          </p>
          {insights.avgMood !== null && (
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#0d5d3a] dark:text-[#10b981]" />
              <span className="text-xs font-semibold text-[#0d5d3a] dark:text-[#10b981]">
                Avg mood this week: {insights.avgMood}/5
              </span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-[#4a7c5d] dark:text-gray-400">
          Write at least one journal entry this week to get your personalized AI insight. 
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Single Entry Card
──────────────────────────────────────────────────────────────── */
function EntryCard({ entry, onDelete }: { entry: JournalEntry; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const mood = moodFor(entry.moodScore);
  const MoodIcon = mood?.Icon ?? Meh;
  const toneColor = { positive: 'text-emerald-600', neutral: 'text-amber-600', negative: 'text-rose-600' }[entry.aiTone] ?? 'text-gray-500';

  const date = new Date(entry.createdAt);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 overflow-hidden shadow-sm"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Mood icon */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${mood?.bg ?? ''}`}>
            <MoodIcon className={`w-5 h-5 ${mood?.color ?? 'text-gray-400'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold ${mood?.color ?? 'text-gray-400'}`}>{mood?.label}</span>
              <span className="text-[10px] text-[#4a7c5d] dark:text-gray-400">{dateStr}</span>
              {entry.aiTone && (
                <span className={`text-[10px] font-semibold capitalize ${toneColor}`}>• {entry.aiTone}</span>
              )}
            </div>

            {/* Content preview */}
            <p className={`text-sm text-[#0a2617] dark:text-gray-200 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
              {entry.content}
            </p>

            {entry.content.length > 200 && (
              <button onClick={() => setExpanded(v => !v)} className="flex items-center gap-1 text-xs text-[#0d5d3a] dark:text-[#10b981] font-semibold mt-1 hover:underline">
                {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
              </button>
            )}

            {/* AI Tags */}
            {entry.aiTags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.aiTags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] text-[10px] font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onDelete(entry._id)}
            className="shrink-0 p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────
   New Entry Composer
──────────────────────────────────────────────────────────────── */
function Composer({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen]         = useState(false);
  const [content, setContent]   = useState('');
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState<string | null>(null);

  const canSave = content.trim().length >= 5 && moodScore !== null;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true); setErr(null);
    try {
      await apiFetch('/journal', {
        method: 'POST',
        body: JSON.stringify({ content: content.trim(), moodScore }),
      });
      setContent(''); setMoodScore(null); setOpen(false);
      onSaved();
    } catch (e: any) {
      setErr(e.message || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/12 dark:border-white/10 shadow-sm overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#f7fbf8] dark:hover:bg-white/5 transition"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center">
          <PenLine className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-[#0a2617] dark:text-gray-100 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
          Write today's entry
        </span>
        <span className="ml-auto">
          {open
            ? <ChevronUp className="w-4 h-4 text-[#4a7c5d]" />
            : <ChevronDown className="w-4 h-4 text-[#4a7c5d]" />}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-col gap-4 border-t border-[#0d5d3a]/08 dark:border-white/08">
              {/* Mood Picker */}
              <div>
                <p className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 mb-2 mt-3">How are you feeling right now?</p>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map(m => {
                    const Icon = m.Icon;
                    const selected = moodScore === m.score;
                    return (
                      <button
                        key={m.score}
                        onClick={() => setMoodScore(m.score)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 transition-all ${
                          selected
                            ? `${m.bg} border-transparent ring-2 ${m.ring} scale-105`
                            : 'bg-white dark:bg-[#1a1a1a] border-[#0d5d3a]/10 dark:border-white/10 hover:border-[#0d5d3a]/30'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${selected ? m.color : 'text-[#4a7c5d] dark:text-gray-400'}`} />
                        <span className={`text-[10px] font-bold ${selected ? m.color : 'text-[#4a7c5d] dark:text-gray-400'}`}>
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text area */}
              <div>
                <p className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 mb-1.5">What's on your mind?</p>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write freely… this is your private space. No one else can see this."
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl border border-[#0d5d3a]/12 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 dark:focus:ring-[#1a8a5a]/50 resize-none leading-relaxed placeholder-[#4a7c5d]/50"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-[10px] font-medium ${content.length > 2800 ? 'text-red-500' : 'text-[#4a7c5d] dark:text-gray-400'}`}>
                    {content.length}/3000
                  </span>
                  {err && <span className="text-[11px] text-red-500 font-semibold">{err}</span>}
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end gap-3">
                <button onClick={() => { setOpen(false); setContent(''); setMoodScore(null); }}
                  className="px-4 py-2.5 rounded-xl border border-[#0d5d3a]/12 dark:border-white/10 text-[#4a7c5d] dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={!canSave || saving}
                  className="px-5 py-2.5 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-sm hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] disabled:opacity-50 transition flex items-center gap-2 shadow-md shadow-[#0d5d3a]/20">
                  {saving
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                    : <><PenLine className="w-3.5 h-3.5" /> Save Entry</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Main MoodJournal Component
──────────────────────────────────────────────────────────────── */
export default function MoodJournal() {
  const [entries, setEntries]     = useState<JournalEntry[]>([]);
  const [heatmap, setHeatmap]     = useState<HeatmapDay[]>([]);
  const [insights, setInsights]   = useState<Insights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const loadEntries = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch<any>(`/journal?page=${pg}&limit=10`);
      setEntries(res.entries || []);
      setTotalPages(res.pages || 1);
      setPage(pg);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const loadHeatmap = useCallback(async () => {
    try {
      const res = await apiFetch<any>('/journal/heatmap');
      setHeatmap(res.days || []);
    } catch { /* silent */ }
  }, []);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await apiFetch<any>('/journal/insights');
      setInsights(res);
    } catch { /* silent */ }
    finally { setInsightsLoading(false); }
  }, []);

  useEffect(() => {
    loadEntries(1);
    loadHeatmap();
    loadInsights();
  }, [loadEntries, loadHeatmap, loadInsights]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiFetch(`/journal/${id}`, { method: 'DELETE' });
      setEntries(prev => prev.filter(e => e._id !== id));
      loadHeatmap();
    } catch { /* silent */ }
    finally { setDeleting(null); }
  };

  const handleSaved = () => {
    loadEntries(1);
    loadHeatmap();
    // Re-fetch insights after a short delay (AI runs async)
    setTimeout(loadInsights, 4000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── STICKY HEATMAP ── */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-[#f7fbf8] dark:bg-[#050505] border-b border-[#0d5d3a]/8 dark:border-white/5 px-4 sm:px-6 pt-4 pb-4">
        {heatmap.length > 0 && (
          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 p-4 shadow-sm">
            <HeatmapCalendar days={heatmap} />
          </div>
        )}
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {/* AI Insights */}
        <InsightsCard insights={insights} loading={insightsLoading} />

        {/* Composer */}
        <Composer onSaved={handleSaved} />

      {/* Entries List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
            Past Entries
          </span>
          {loading && <Loader2 className="w-4 h-4 text-[#0d5d3a] animate-spin" />}
        </div>

        {!loading && entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-10 h-10 text-[#0d5d3a]/30 dark:text-white/20 mb-3" />
            <p className="text-sm font-semibold text-[#0a2617] dark:text-gray-100">No entries yet</p>
            <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1">Click "Write today's entry" above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <AnimatePresence>
              {entries.map(entry => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  disabled={page <= 1}
                  onClick={() => loadEntries(page - 1)}
                  className="px-4 py-2 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 text-[#0d5d3a] dark:text-gray-300 text-xs font-bold disabled:opacity-40 hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition"
                >
                  ← Newer
                </button>
                <span className="text-xs text-[#4a7c5d] dark:text-gray-400 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => loadEntries(page + 1)}
                  className="px-4 py-2 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 text-[#0d5d3a] dark:text-gray-300 text-xs font-bold disabled:opacity-40 hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition"
                >
                  Older →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
