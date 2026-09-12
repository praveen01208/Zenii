import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { apiFetch } from '../api/client';
import MoodCheckIn from './MoodCheckIn';
import WeeklyInsightsBanner from './WeeklyInsightsBanner';
import {
  TrendingUp, MessageCircle, Flame, Heart, BarChart3,
  Calendar, RefreshCw, Smile, PlusCircle
} from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

type ProgressData = {
  range: string;
  labels: string[];
  sessionsPerDay: number[];
  messagesPerDay: number[];
  moodPerDay: (number | null)[];
  categoryBreakdown: Record<string, number>;
  summary: {
    totalSessions: number;
    totalMessages: number;
    avgMood: number | null;
    streak: number;
    daysTracked: number;
  };
};

const CATEGORY_LABELS: Record<string, string> = {
  anxiety:       ' Anxiety',
  depression:    ' Depression',
  stress:        ' Stress',
  exam_pressure: ' Exam Pressure',
  bullying:      '️ Bullying',
  loneliness:    ' Loneliness',
  family_issues: ' Family',
  self_esteem:   ' Self-Esteem',
  trauma:        ' Trauma',
  other:         ' Other',
};

const CATEGORY_COLORS_PIE = [
  '#0d5d3a', '#10b981', '#059669', '#34d399', '#6ee7b7',
  '#a7f3d0', '#064e3b', '#047857', '#065f46', '#6d28d9',
];

// Resolve CSS var at runtime for dark/light mode
function getCSSVar(v: string, fallback: string) {
  try {
    const val = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    return val || fallback;
  } catch { return fallback; }
}

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08 p-4 shadow-sm flex items-start gap-3"
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xl font-black text-[#0a2617] dark:text-white truncate" style={{ fontFamily: 'Syne,sans-serif' }}>
          {value}
        </div>
        <div className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 mt-0.5 leading-tight">{label}</div>
        {sub && <div className="text-[10px] text-[#4a7c5d]/60 dark:text-gray-600 mt-0.5 leading-tight truncate">{sub}</div>}
      </div>
    </motion.div>
  );
}

const chartBaseOptions = (isDark: boolean) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark ? '#1a1a1a' : '#fff',
      titleColor: isDark ? '#e5e7eb' : '#0a2617',
      bodyColor: isDark ? '#9ca3af' : '#4a7c5d',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,93,58,0.12)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 12,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: isDark ? '#6b7280' : '#4a7c5d', font: { size: 11 } },
      border: { display: false },
    },
    y: {
      grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,93,58,0.06)' },
      ticks: { color: isDark ? '#6b7280' : '#4a7c5d', font: { size: 11 } },
      border: { display: false },
      beginAtZero: true,
    },
  },
});

export default function ZenProgressDashboard() {
  const [data, setData]       = useState<ProgressData | null>(null);
  const [range, setRange]     = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [showMood, setShowMood] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const isDark = document.documentElement.classList.contains('dark');

  const fetchData = async (r: 'weekly' | 'monthly') => {
    setLoading(true); setError(null);
    try {
      const [progress, todayMood] = await Promise.all([
        apiFetch<ProgressData>(`/zen-progress?range=${r}`),
        apiFetch<{ checkedIn: boolean }>('/zen-progress/mood/today'),
      ]);
      setData(progress);
      setCheckedIn(todayMood.checkedIn);
    } catch (e: any) {
      setError(e.message || 'Failed to load progress');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(range); }, [range]);

  const isEmpty = data && data.summary.totalSessions === 0;

  /* ── Chart datasets ─────────────────────────────────────────────────── */
  const sessionsChart = data ? {
    labels: data.labels,
    datasets: [{
      label: 'Sessions',
      data: data.sessionsPerDay,
      backgroundColor: isDark ? 'rgba(16,185,129,0.7)' : 'rgba(13,93,58,0.75)',
      borderRadius: 10,
      borderSkipped: false,
    }],
  } : null;

  const messagesChart = data ? {
    labels: data.labels,
    datasets: [{
      label: 'Messages',
      data: data.messagesPerDay,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  } : null;

  const moodChart = data ? {
    labels: data.labels,
    datasets: [{
      label: 'Mood (1-10)',
      data: data.moodPerDay,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.08)',
      fill: true,
      tension: 0.45,
      pointBackgroundColor: data.moodPerDay.map(v =>
        v === null ? 'transparent' : v >= 7 ? '#10b981' : v >= 4 ? '#f59e0b' : '#ef4444'
      ),
      pointRadius: data.moodPerDay.map(v => v === null ? 0 : 6),
      pointHoverRadius: 8,
      spanGaps: true,
    }],
  } : null;

  const catKeys = data ? Object.keys(data.categoryBreakdown) : [];
  const catChart = data && catKeys.length ? {
    labels: catKeys.map(k => CATEGORY_LABELS[k] || k),
    datasets: [{
      data: catKeys.map(k => data.categoryBreakdown[k]),
      backgroundColor: CATEGORY_COLORS_PIE.slice(0, catKeys.length),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  } : null;

  const baseOpts = chartBaseOptions(isDark);
  const moodOpts = {
    ...baseOpts,
    scales: {
      ...baseOpts.scales,
      y: { ...baseOpts.scales.y, min: 0, max: 10,
        ticks: { ...baseOpts.scales.y.ticks, stepSize: 2 } }
    },
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw className="w-6 h-6 text-[#0d5d3a]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {showMood && (
        <MoodCheckIn
          onClose={() => setShowMood(false)}
          onSaved={() => { setCheckedIn(true); fetchData(range); }}
        />
      )}

      {/* Sticky controls */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-[#f7fbf8] dark:bg-[#050505] border-b border-[#0d5d3a]/8 dark:border-white/5 px-4 sm:px-6 pt-3 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mood check-in */}
          {!checkedIn ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowMood(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md hover:from-amber-600 transition"
            >
              <Smile className="w-4 h-4" /> Log Today's Mood
            </motion.button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] text-sm font-semibold border border-[#0d5d3a]/12">
              <Smile className="w-4 h-4" /> Mood logged today
            </div>
          )}
          {/* Range toggle */}
          <div className="ml-auto flex rounded-2xl bg-[#f0fbf4] dark:bg-[#1a1a1a] p-1 border border-[#0d5d3a]/10 dark:border-white/08">
            {(['weekly', 'monthly'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition ${
                  range === r ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow' : 'text-[#4a7c5d] dark:text-gray-400 hover:text-[#0d5d3a] dark:hover:text-white'
                }`}>
                {r === 'weekly' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      {/* Weekly Insights Banner */}
      <div className="-mx-1 sm:-mx-1 mb-2">
        <WeeklyInsightsBanner />
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-white text-4xl mb-6 shadow-xl">
            
          </div>
          <h3 className="text-xl font-bold text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne,sans-serif' }}>
            No data yet
          </h3>
          <p className="text-[#4a7c5d] dark:text-gray-400 max-w-xs text-sm">
            Start a conversation with Zeni to track your progress here. Your charts will appear after your first session.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Total Sessions"
              value={data?.summary.totalSessions ?? 0}
              sub={`last ${data?.summary.daysTracked} days`}
              icon={<MessageCircle className="w-5 h-5" />}
              color="bg-gradient-to-br from-[#0d5d3a] to-[#10b981]"
            />
            <StatCard
              label="Messages Sent"
              value={data?.summary.totalMessages ?? 0}
              sub="your messages to Zeni"
              icon={<BarChart3 className="w-5 h-5" />}
              color="bg-gradient-to-br from-blue-600 to-blue-400"
            />
            <StatCard
              label="Avg Mood Score"
              value={data?.summary.avgMood != null ? `${data.summary.avgMood}/10` : '—'}
              sub={data?.summary.avgMood != null
                ? data.summary.avgMood >= 7 ? ' Doing great!'
                : data.summary.avgMood >= 4 ? ' Getting there'
                : ' Keep going'
                : 'Log a mood to start'}
              icon={<Heart className="w-5 h-5" />}
              color="bg-gradient-to-br from-rose-500 to-pink-400"
            />
            <StatCard
              label="Day Streak"
              value={data?.summary.streak ?? 0}
              sub="consecutive days active"
              icon={<Flame className="w-5 h-5" />}
              color="bg-gradient-to-br from-amber-500 to-orange-400"
            />
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

            {/* Sessions bar chart */}
            {sessionsChart && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-bold text-[#0a2617] dark:text-white">Sessions per Day</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-500">How often you talk to Zeni</div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#0d5d3a]/10 dark:bg-[#10b981]/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#0d5d3a] dark:text-[#10b981]" />
                  </div>
                </div>
                <div className="h-44">
                  <Bar data={sessionsChart} options={baseOpts as any} />
                </div>
              </motion.div>
            )}

            {/* Messages line chart */}
            {messagesChart && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-bold text-[#0a2617] dark:text-white">Message Activity</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-500">Your messages sent to Zeni</div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="h-44">
                  <Line data={messagesChart} options={baseOpts as any} />
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Mood trend */}
            {moodChart && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-bold text-[#0a2617] dark:text-white">Mood Trend</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-500">
                      {!checkedIn && 'Log your mood daily for better tracking · '}
                      Green = great, Amber = okay, Red = rough
                    </div>
                  </div>
                  {!checkedIn && (
                    <button
                      onClick={() => setShowMood(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-700/30 hover:bg-amber-100 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Log today
                    </button>
                  )}
                </div>
                <div className="h-44">
                  <Line data={moodChart} options={moodOpts as any} />
                </div>
              </motion.div>
            )}

            {/* Category donut */}
            {catChart && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08 p-5 shadow-sm"
              >
                <div className="text-sm font-bold text-[#0a2617] dark:text-white mb-1">Topics Explored</div>
                <div className="text-xs text-[#4a7c5d] dark:text-gray-500 mb-4">What you talk about most</div>
                <div className="h-36 flex items-center justify-center">
                  <Doughnut
                    data={catChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '65%',
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: isDark ? '#1a1a1a' : '#fff',
                          titleColor: isDark ? '#e5e7eb' : '#0a2617',
                          bodyColor: isDark ? '#9ca3af' : '#4a7c5d',
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,93,58,0.12)',
                          borderWidth: 1,
                          padding: 10,
                          cornerRadius: 12,
                        },
                      },
                    }}
                  />
                </div>
                {/* Legend */}
                <div className="mt-3 space-y-1">
                  {catKeys.slice(0, 5).map((k, i) => (
                    <div key={k} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS_PIE[i] }} />
                      <span className="text-[11px] text-[#4a7c5d] dark:text-gray-400 truncate">
                        {CATEGORY_LABELS[k] || k}
                      </span>
                      <span className="ml-auto text-[11px] font-bold text-[#0a2617] dark:text-white">
                        {data?.categoryBreakdown[k]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
