import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target, Plus, Check, Flame, Trophy, Trash2,
  Bell, BellOff, ChevronDown, ChevronUp, Loader2, X
} from 'lucide-react';
import { apiFetch } from '../api/client';

interface Goal {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetDays: number;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completedToday: boolean;
  color: string;
  createdAt: string;
}

interface Stats {
  totalGoals: number;
  completedToday: number;
  longestStreak: number;
  totalCompletions: number;
  todayRate: number;
}

const GOAL_COLORS = ['#0d5d3a','#7c3aed','#0369a1','#b45309','#be123c','#065f46','#374151','#1e40af'];

const CATEGORIES = [
  { value: 'mindfulness', label: ' Mindfulness' },
  { value: 'exercise',    label: ' Exercise' },
  { value: 'sleep',       label: ' Sleep' },
  { value: 'journaling',  label: ' Journaling' },
  { value: 'nutrition',   label: ' Nutrition' },
  { value: 'social',      label: ' Social' },
  { value: 'breathing',   label: '️ Breathing' },
  { value: 'gratitude',   label: ' Gratitude' },
  { value: 'learning',    label: ' Learning' },
  { value: 'other',       label: ' Other' },
];

/* ── Ring Progress ── */
function Ring({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(1, pct / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
    </svg>
  );
}

/* ── Goal Card ── */
function GoalCard({ goal, onToggle, onDelete, toggling }: {
  goal: Goal; onToggle: (id: string) => void;
  onDelete: (id: string) => void; toggling: string | null;
}) {
  const pct = Math.min(100, Math.round((goal.totalCompleted / goal.targetDays) * 100));
  const cat = CATEGORIES.find(c => c.value === goal.category);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="h-1" style={{ background: goal.color }} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <Ring pct={pct} color={goal.color} />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#0a2617] dark:text-gray-100">
              {pct}%
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-[#0a2617] dark:text-gray-100 leading-snug line-clamp-2"
              style={{ fontFamily: 'Syne, sans-serif' }}>{goal.title}</h3>
            <div className="text-[10px] text-[#4a7c5d] dark:text-gray-400 mt-0.5">{cat?.label}</div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-[11px] font-bold text-orange-500">
                <Flame className="w-3 h-3" />{goal.currentStreak}d streak
              </span>
              <span className="text-[10px] text-[#4a7c5d] dark:text-gray-400">
                {goal.totalCompleted}/{goal.targetDays} days
              </span>
            </div>
          </div>
          <button onClick={() => onDelete(goal._id)}
            className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        {goal.description && (
          <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-2 line-clamp-2">{goal.description}</p>
        )}
        <button onClick={() => onToggle(goal._id)} disabled={toggling === goal._id}
          className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
            goal.completedToday
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
              : 'text-white shadow-md'
          } disabled:opacity-50`}
          style={goal.completedToday ? {} : { backgroundColor: goal.color }}>
          {toggling === goal._id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : goal.completedToday
              ? <><Check className="w-3.5 h-3.5" /> Done today!</>
              : <><Check className="w-3.5 h-3.5" /> Mark complete</>}
        </button>
      </div>
    </motion.div>
  );
}


/* ── Push Notification Hook ── */
function usePushNotifications() {
  const [enabled, setEnabled]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any>('/push/vapid-public').then(r => { if (r.key) setVapidKey(r.key); }).catch(() => {});
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => setEnabled(!!sub))
      ).catch(() => {});
    }
  }, []);

  const urlBase64ToUint8Array = (b64: string) => {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
  };

  const toggle = async () => {
    if (!('serviceWorker' in navigator) || !vapidKey) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (enabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await apiFetch('/push/unsubscribe', { method: 'DELETE', body: JSON.stringify({ endpoint: sub.endpoint }) });
        }
        setEnabled(false);
      } else {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
        await apiFetch('/push/subscribe', { method: 'POST', body: JSON.stringify(sub.toJSON()) });
        setEnabled(true);
      }
    } catch (e) { console.error('[Push] toggle error:', e); }
    finally { setLoading(false); }
  };

  const sendNudge = async () => {
    setLoading(true);
    try { await apiFetch('/push/nudge', { method: 'POST' }); }
    catch { /* silent */ }
    finally { setLoading(false); }
  };

  return { enabled, loading, vapidKey, toggle, sendNudge };
}

/* ── Add Goal Form ── */
function AddGoalForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle]         = useState('');
  const [desc, setDesc]           = useState('');
  const [category, setCategory]   = useState('other');
  const [targetDays, setTarget]   = useState(21);
  const [color, setColor]         = useState(GOAL_COLORS[0]);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErr('Title is required.'); return; }
    setSaving(true); setErr(null);
    try {
      await apiFetch('/goals', { method: 'POST', body: JSON.stringify({ title: title.trim(), description: desc.trim(), category, targetDays, color }) });
      onSaved();
    } catch (e: any) { setErr(e.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  return (
    <motion.form onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 p-5 shadow-sm flex flex-col gap-4">
      <h3 className="font-bold text-[#0a2617] dark:text-gray-100 text-base" style={{ fontFamily: 'Syne, sans-serif' }}>New Wellness Goal</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="sm:col-span-2 block">
          <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Goal title *</span>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Meditate 10 mins daily"
            className="w-full px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30" />
        </label>
        <label className="sm:col-span-2 block">
          <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Description (optional)</span>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Why does this goal matter to you?"
            className="w-full px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Category</span>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Target days</span>
          <input type="number" min={1} max={365} value={targetDays} onChange={e => setTarget(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30" />
        </label>
      </div>

      <div>
        <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-2">Card colour</span>
        <div className="flex gap-2 flex-wrap">
          {GOAL_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-current scale-110' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {err && <p className="text-xs text-red-500 font-semibold">{err}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 text-[#4a7c5d] dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-sm hover:bg-[#0a4a2e] disabled:opacity-50 transition flex items-center gap-2 shadow-md shadow-[#0d5d3a]/20">
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Plus className="w-3.5 h-3.5" /> Add Goal</>}
        </button>
      </div>
    </motion.form>
  );
}

/* ── Main Component ── */
export default function WellnessGoalTracker() {
  const [goals, setGoals]       = useState<Goal[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const push = usePushNotifications();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, sRes] = await Promise.all([
        apiFetch<any>('/goals'),
        apiFetch<any>('/goals/stats'),
      ]);
      setGoals(gRes.goals || []);
      setStats(sRes.stats || null);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, [load]);

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      const res = await apiFetch<any>(`/goals/${id}/complete`, { method: 'PATCH' });
      setGoals(prev => prev.map(g => g._id === id
        ? { ...g, completedToday: res.completedToday, currentStreak: res.currentStreak, longestStreak: res.longestStreak, totalCompleted: res.totalCompleted }
        : g
      ));
      // Update stats
      setStats(prev => {
        if (!prev) return prev;
        const todayDone = goals.map(g => g._id === id ? res.completedToday : g.completedToday).filter(Boolean).length;
        return { ...prev, completedToday: todayDone };
      });
    } catch { /* silent */ }
    finally { setToggling(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await apiFetch(`/goals/${id}`, { method: 'DELETE' });
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch { /* silent */ }
  };

  const todayDone  = goals.filter(g => g.completedToday).length;
  const todayTotal = goals.length;

  return (
    <div className="flex flex-col h-full">
      {/* ── STICKY CONTROLS BAR ── */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-[#f7fbf8] dark:bg-[#050505] border-b border-[#0d5d3a]/8 dark:border-white/5 px-4 sm:px-6 pt-3 pb-3 space-y-3">
        {/* Stats + Actions single line */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stat badges */}
          {stats && [
            { label: "Today's progress", value: `${todayDone}/${todayTotal}`, icon: <Check className="w-3.5 h-3.5" />, color: '#0d5d3a' },
            { label: 'Longest streak',   value: `${stats.longestStreak}d`,    icon: <Flame className="w-3.5 h-3.5" />, color: '#f97316' },
            { label: 'Total completions',value: stats.totalCompletions,       icon: <Trophy className="w-3.5 h-3.5" />, color: '#7c3aed' },
            { label: 'Active goals',     value: stats.totalGoals,             icon: <Target className="w-3.5 h-3.5" />, color: '#0369a1' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: s.color }}>{s.icon}</div>
              <div>
                <div className="text-xs font-black text-[#0a2617] dark:text-gray-100 leading-none">{s.value}</div>
                <div className="text-[9px] text-[#4a7c5d] dark:text-gray-400 leading-none mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {push.vapidKey && (
              <button onClick={push.toggle} disabled={push.loading}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  push.enabled ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white' : 'bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] border border-[#0d5d3a]/15'
                } disabled:opacity-50`}>
                {push.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : push.enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                {push.enabled ? 'Nudges on' : 'Enable nudges'}
              </button>
            )}
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white text-xs font-bold hover:bg-[#0a4a2e] transition shadow-md shadow-[#0d5d3a]/20">
              {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showForm ? 'Cancel' : 'Add Goal'}
            </button>
          </div>
        </div>
        {/* Today progress bar */}
        {todayTotal > 0 && (
          <div className="bg-white dark:bg-[#111111] rounded-xl border border-[#0d5d3a]/10 dark:border-white/10 px-4 py-2.5 shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-[#0a2617] dark:text-gray-100">Today — {todayDone} of {todayTotal} complete</span>
              <span className="text-[10px] font-bold text-[#0d5d3a] dark:text-[#10b981]">{Math.round((todayDone/todayTotal)*100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#0d5d3a] to-[#10b981]"
                initial={{ width: 0 }} animate={{ width: `${Math.round((todayDone/todayTotal)*100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }} />
            </div>
            {todayDone === todayTotal && todayTotal > 0 && (
              <p className="text-[10px] text-[#0d5d3a] dark:text-[#10b981] font-bold mt-1 text-center">All goals done today! Amazing work!</p>
            )}
          </div>
        )}
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Add form */}
        <AnimatePresence>
          {showForm && <AddGoalForm onSaved={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />}
        </AnimatePresence>

        {/* Goals grid */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 text-[#0d5d3a] animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Target className="w-10 h-10 text-[#0d5d3a]/30 dark:text-white/20 mb-3" />
            <p className="text-sm font-semibold text-[#0a2617] dark:text-gray-100">No goals yet</p>
            <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1">Add your first wellness goal to start building streaks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {goals.map(g => (
                <GoalCard key={g._id} goal={g} onToggle={handleToggle} onDelete={handleDelete} toggling={toggling} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Send nudge */}
        {push.enabled && (
          <div className="flex justify-center pt-2">
            <button onClick={push.sendNudge} disabled={push.loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 text-[#0d5d3a] dark:text-[#10b981] text-xs font-semibold hover:bg-[#f0fbf4] dark:hover:bg-[#0d5d3a]/10 transition disabled:opacity-50">
              <Bell className="w-3.5 h-3.5" /> Send streak nudge now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
