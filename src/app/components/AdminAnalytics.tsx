import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { apiFetch } from '../api/client';
import { TrendingUp, Users, Calendar, Brain, Star, AlertTriangle, RefreshCw } from 'lucide-react';

/* ── tiny helpers ── */
const fmt = (n: number | null | undefined) =>
  n == null ? '—' : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

function KpiCard({ label, value, icon, sub, color = '#0d5d3a' }: {
  label: string; value: string | number; icon: React.ReactNode;
  sub?: string; color?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#111111] rounded-3xl p-5 border border-[#0d5d3a]/10 dark:border-white/[0.08] shadow-sm flex flex-col gap-3">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
          {value}
        </div>
        <div className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-[#4a7c5d]/60 dark:text-gray-500 mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-black text-[#0a2617] dark:text-gray-100 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
      {children}
    </h2>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/[0.08] shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

const CHART_COLORS = { primary: '#0d5d3a', accent: '#10b981', amber: '#f59e0b', rose: '#f43f5e', blue: '#3b82f6', purple: '#8b5cf6' };
const PIE_COLORS  = ['#10b981', '#f59e0b', '#f43f5e'];

const ttStyle = {
  contentStyle: { background: '#0a2617', border: 'none', borderRadius: 12, fontSize: 12, color: '#fff' },
  itemStyle: { color: '#c8e6c9' },
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function AdminAnalytics() {
  const [overview,     setOverview]     = useState<any>(null);
  const [growth,       setGrowth]       = useState<any[]>([]);
  const [moodDist,     setMoodDist]     = useState<any>(null);
  const [sessionTrend, setSessionTrend] = useState<any[]>([]);
  const [engagement,   setEngagement]   = useState<any[]>([]);
  const [leaderboard,  setLeaderboard]  = useState<any[]>([]);
  const [content,      setContent]      = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState('');

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [ov, gr, md, st, fe, lb, cp] = await Promise.all([
        apiFetch<any>('/admin-analytics/overview'),
        apiFetch<any>('/admin-analytics/user-growth?period=12'),
        apiFetch<any>('/admin-analytics/mood-distribution'),
        apiFetch<any>('/admin-analytics/session-trends?period=30'),
        apiFetch<any>('/admin-analytics/feature-engagement'),
        apiFetch<any>('/admin-analytics/therapist-leaderboard'),
        apiFetch<any>('/admin-analytics/content-performance'),
      ]);
      setOverview(ov);
      setGrowth(gr.data || []);
      setMoodDist(md);
      setSessionTrend(st.data || []);
      setEngagement(fe.features || []);
      setLeaderboard(lb.leaderboard || []);
      setContent(cp);
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-[#0d5d3a]/20 border-t-[#0d5d3a] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl font-semibold text-sm">
      {error} — <button className="underline" onClick={() => load()}>retry</button>
    </div>
  );

  const moodPieData = moodDist ? [
    { name: 'Positive', value: moodDist.positive },
    { name: 'Neutral',  value: moodDist.neutral  },
    { name: 'Negative', value: moodDist.negative },
  ] : [];

  // Thin session trend to ~15 points for readability
  const trendSparse = sessionTrend.filter((_, i) => i % 2 === 0 || i === sessionTrend.length - 1);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0d5d3a]/10 dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm hover:bg-[#0d5d3a]/20 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div>
        <SectionTitle> Platform Health</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          <KpiCard label="Total Users"        value={fmt(overview?.totalUsers)}           icon={<Users className="w-5 h-5" />} />
          <KpiCard label="Active This Week"   value={fmt(overview?.activeThisWeek)}        icon={<TrendingUp className="w-5 h-5" />} color="#7c3aed" />
          <KpiCard label="Sessions This Month" value={fmt(overview?.sessionsThisMonth)}    icon={<Calendar className="w-5 h-5" />} color="#0369a1" />
          <KpiCard label="NPS Score"
            value={overview?.npsScore != null ? `${overview.npsScore > 0 ? '+' : ''}${overview.npsScore}` : '—'}
            icon={<Star className="w-5 h-5" />} color="#d97706"
            sub="Based on post-session mood"
          />
          <KpiCard label="Crisis Events (7d)" value={fmt(overview?.crisisEventsThisWeek)} icon={<AlertTriangle className="w-5 h-5" />} color="#dc2626" sub="Anonymised" />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <KpiCard label="Journal Entries"     value={fmt(overview?.totalJournalEntries)}    icon={<Brain className="w-4 h-4" />} color="#be185d" />
          <KpiCard label="Goal Check-ins"      value={fmt(overview?.totalGoalCheckIns)}      icon={<TrendingUp className="w-4 h-4" />} color="#0891b2" />
          <KpiCard label="Program Enrollments" value={fmt(overview?.totalProgramEnrollments)} icon={<Calendar className="w-4 h-4" />} color="#7c3aed" />
          <KpiCard label="Avg Post-Session Mood" value={overview?.averageMood != null ? `${overview.averageMood}/10` : '—'} icon={<Star className="w-4 h-4" />} color="#059669" />
        </div>
      </div>

      {/* ── Row 2: Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <SectionTitle> User Growth (12 months)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0d5d3a11" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4a7c5d' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#4a7c5d' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...ttStyle} />
              <Line type="monotone" dataKey="count" stroke={CHART_COLORS.primary} strokeWidth={2.5}
                dot={{ fill: CHART_COLORS.primary, r: 3 }} activeDot={{ r: 5 }} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Session Booking Trends */}
        <Card>
          <SectionTitle> Session Bookings (30 days)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendSparse}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0d5d3a11" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#4a7c5d' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#4a7c5d' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...ttStyle} />
              <Bar dataKey="count" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <SectionTitle> Journal Mood Distribution</SectionTitle>
          {moodDist?.total === 0 ? (
            <p className="text-sm text-[#4a7c5d] py-8 text-center">No AI-tagged journal entries yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={moodPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    dataKey="value" strokeWidth={0} paddingAngle={3}>
                    {moodPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip {...ttStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { label: 'Positive', pct: moodDist?.positivePct, color: PIE_COLORS[0] },
                  { label: 'Neutral',  pct: moodDist?.neutralPct,  color: PIE_COLORS[1] },
                  { label: 'Negative', pct: moodDist?.negativePct, color: PIE_COLORS[2] },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs font-bold text-[#4a7c5d] mb-1">
                      <span style={{ color: m.color }}>{m.label}</span>
                      <span>{m.pct ?? 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct ?? 0}%` }}
                        transition={{ duration: 0.8 }} className="h-full rounded-full"
                        style={{ backgroundColor: m.color }} />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-[#4a7c5d]/60 mt-1">Total: {moodDist?.total?.toLocaleString()} entries</p>
              </div>
            </div>
          )}
        </Card>

        {/* Feature Engagement */}
        <Card>
          <SectionTitle> Feature Engagement</SectionTitle>
          {engagement.length === 0 ? (
            <p className="text-sm text-[#4a7c5d] py-8 text-center">No engagement data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={engagement} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#0d5d3a11" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#4a7c5d' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: '#4a7c5d' }} tickLine={false} axisLine={false} />
                <Tooltip {...ttStyle} />
                <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── Row 3: Therapist Leaderboard ── */}
      <div>
        <SectionTitle> Therapist Leaderboard</SectionTitle>
        <Card>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-[#4a7c5d] py-6 text-center">No completed sessions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#0d5d3a]/10 dark:border-white/10">
                    {['#', 'Therapist', 'Specialization', 'Sessions', 'Avg Rating'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-[10px] font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((t, i) => (
                    <tr key={t.therapistId}
                      className="border-b border-[#0d5d3a]/05 dark:border-white/5 hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition">
                      <td className="py-3 px-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-400 text-white' : 'bg-[#0d5d3a]/10 text-[#0d5d3a]'
                        }`}>{i + 1}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#0a2617] dark:text-gray-100">{t.name}</td>
                      <td className="py-3 px-3 text-[#4a7c5d] dark:text-gray-400 text-xs">{t.specialization}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-lg bg-[#0d5d3a]/10 dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] font-bold text-xs">
                          {t.sessionsCompleted}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {t.avgRating != null ? (
                          <span className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                             {t.avgRating} <span className="text-[#4a7c5d] dark:text-gray-400 font-normal">({t.ratingCount})</span>
                          </span>
                        ) : <span className="text-gray-400 text-xs">No ratings</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Row 4: Content Performance ── */}
      {content && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Resources */}
          <Card>
            <SectionTitle> Top Resources</SectionTitle>
            {(content.topResources || []).length === 0 ? (
              <p className="text-sm text-[#4a7c5d] py-4 text-center">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {content.topResources.map((r: any, i: number) => (
                  <div key={r._id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#0d5d3a] dark:text-[#10b981] w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0a2617] dark:text-gray-100 truncate">{r.title}</p>
                      <p className="text-[10px] text-[#4a7c5d] dark:text-gray-400">{r.type} · {r.views} views</p>
                    </div>
                    <div className="shrink-0">
                      <div className="text-xs font-black text-[#0d5d3a] dark:text-[#10b981]">{r.views}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top Programs */}
          <Card>
            <SectionTitle> Top Programs</SectionTitle>
            {(content.topPrograms || []).length === 0 ? (
              <p className="text-sm text-[#4a7c5d] py-4 text-center">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {content.topPrograms.map((p: any, i: number) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#0d5d3a] dark:text-[#10b981] w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0a2617] dark:text-gray-100 truncate">{p.title}</p>
                      <p className="text-[10px] text-[#4a7c5d] dark:text-gray-400">{p.category} · {p.durationDays}d</p>
                    </div>
                    <span className="text-xs font-black text-[#0d5d3a] dark:text-[#10b981] shrink-0">{p.enrollmentCount}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top Reading Lists */}
          <Card>
            <SectionTitle> Top Reading Lists</SectionTitle>
            {(content.topReadingLists || []).length === 0 ? (
              <p className="text-sm text-[#4a7c5d] py-4 text-center">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {content.topReadingLists.map((rl: any, i: number) => (
                  <div key={rl._id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#0d5d3a] dark:text-[#10b981] w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0a2617] dark:text-gray-100 truncate">{rl.title}</p>
                      <p className="text-[10px] text-[#4a7c5d] dark:text-gray-400">by {rl.therapistName}</p>
                    </div>
                    <span className="text-xs font-black text-[#0d5d3a] dark:text-[#10b981] shrink-0">{rl.saveCount} saves</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Row 5: Crisis Trend ── */}
      {content?.crisisWeekly?.length > 0 && (
        <div>
          <SectionTitle> Crisis Events — Weekly Trend (anonymised)</SectionTitle>
          <Card>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={content.crisisWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4363611" />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#4a7c5d' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#4a7c5d' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...ttStyle} />
                <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Crisis Events" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-[#4a7c5d]/60 mt-2 text-right">No PII stored — hashed user IDs only</p>
          </Card>
        </div>
      )}
    </div>
  );
}
