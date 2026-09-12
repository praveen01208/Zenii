import React from 'react';
import { motion } from 'motion/react';
import { apiFetch } from '../api/client';

export default function SessionInsightsWidget() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    apiFetch<any>('/admin/analytics/post-session-mood')
      .then((d: any) => setData(d))
      .catch((e: any) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#0d5d3a]/20 border-t-[#0d5d3a] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-2xl font-semibold text-sm">
        {error}
      </div>
    );
  }

  const dist = data?.distribution || { low: 0, mid: 0, high: 0 };
  const total = dist.low + dist.mid + dist.high;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
  const avgMood = data?.averageMood;

  const kpis = [
    { label: 'Total Feedbacks',       value: data?.totalFeedbacks ?? '—', emoji: '' },
    { label: 'Avg Post-Session Mood', value: avgMood ? `${avgMood}/10` : '—', emoji: '' },
    { label: 'High Mood (7–10)',      value: dist.high ?? '—', emoji: '' },
  ];

  const bars = [
    { key: 'high', label: 'Positive (7–10)', count: dist.high, color: '#10b981' },
    { key: 'mid',  label: 'Neutral  (4–6)',  count: dist.mid,  color: '#eab308' },
    { key: 'low',  label: 'Low (1–3)',       count: dist.low,  color: '#dc2626' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white dark:bg-[#111111] rounded-3xl p-5 border border-[#0d5d3a]/10 dark:border-white/[0.08] shadow-sm">
            <div className="text-2xl mb-2">{k.emoji}</div>
            <div className="text-2xl font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
              {k.value}
            </div>
            <div className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Mood Distribution */}
      <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/[0.08] shadow-sm">
        <h3 className="font-black text-[#0a2617] dark:text-gray-100 mb-5 text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
          Mood Distribution
        </h3>
        {total === 0 ? (
          <p className="py-8 text-center text-[#4a7c5d] dark:text-gray-400 text-sm font-semibold">
            No feedback data yet — data appears here as users submit post-session ratings.
          </p>
        ) : (
          <div className="space-y-4">
            {bars.map(({ key, label, count, color }) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1.5">
                  <span>{label}</span>
                  <span>{count} ({pct(count)}%)</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct(count)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Trend */}
      {data?.weeklyTrend?.length > 0 && (
        <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/[0.08] shadow-sm">
          <h3 className="font-black text-[#0a2617] dark:text-gray-100 mb-5 text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
            Weekly Mood Trend
          </h3>
          <div className="flex items-end gap-2 h-32">
            {data.weeklyTrend.map((w: any, i: number) => {
              const barH = Math.max(Math.round(((w.avgMood || 0) / 10) * 100), 4);
              const weekLabel = w._id?.includes('-W') ? `W${w._id.split('-W')[1]}` : (w._id || '');
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-bold text-[#4a7c5d] dark:text-gray-400 opacity-0 group-hover:opacity-100 transition">
                    {(w.avgMood || 0).toFixed(1)}
                  </span>
                  <div
                    className="w-full rounded-t-lg"
                    style={{ height: `${barH}%`, background: 'linear-gradient(to top, #0d5d3a, #10b981)' }}
                  />
                  <span className="text-[9px] text-[#4a7c5d]/60 dark:text-gray-500 truncate w-full text-center">
                    {weekLabel}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[#4a7c5d]/60 dark:text-gray-500 mt-3 text-right">
            Average post-session mood per week (last 8 weeks)
          </p>
        </div>
      )}
    </div>
  );
}
