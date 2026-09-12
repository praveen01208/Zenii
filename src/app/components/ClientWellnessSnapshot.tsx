import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, TrendingUp, Target, Dumbbell, AlertCircle, Heart, MessageCircle } from 'lucide-react';
import { apiFetch } from '../api/client';

type ClientWellnessSnapshotProps = {
  userId: string;
  onClose: () => void;
};

type SnapshotData = {
  userName: string;
  moods: { day: string; score: number }[];
  goals: { title: string; currentStreak: number; longestStreak: number; totalCompleted: number; category: string; color: string }[];
  activePrograms: any[];
};

export default function ClientWellnessSnapshot({ userId, onClose }: ClientWellnessSnapshotProps) {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiFetch<{ snapshot: SnapshotData }>(`/therapist/client/${userId}/wellness-snapshot`)
      .then(res => {
        if (alive) {
          setData(res.snapshot);
          setError(null);
        }
      })
      .catch(err => {
        if (alive) {
          setError(err.message || 'Failed to load snapshot');
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [userId]);

  const renderMoodSparkline = (moods: { day: string; score: number }[]) => {
    if (!moods || moods.length === 0) return <div className="text-sm text-gray-500 italic">No mood data logged in last 30 days.</div>;
    
    // Calculate simple trend
    const recent = moods.slice(-5);
    const avgRecent = recent.reduce((sum, m) => sum + m.score, 0) / recent.length;
    const allAvg = moods.reduce((sum, m) => sum + m.score, 0) / moods.length;
    
    let trendMsg = '';
    if (avgRecent > allAvg + 0.5) trendMsg = "Mood is trending upward recently.";
    else if (avgRecent < allAvg - 0.5) trendMsg = "Recent mood scores are lower than their average.";
    else trendMsg = "Mood is relatively stable.";

    return (
      <div>
        <div className="flex items-end gap-1 h-16 mt-2 mb-3">
          {moods.map((m, i) => {
            const height = `${(m.score / 5) * 100}%`;
            const color = m.score >= 4 ? 'bg-[#10b981]' : m.score === 3 ? 'bg-yellow-400' : 'bg-red-400';
            return (
              <div key={i} className="flex-1 flex flex-col justify-end group relative">
                <div className={`w-full rounded-t-sm ${color} opacity-80 group-hover:opacity-100 transition-all`} style={{ height }}></div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                  {new Date(m.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {m.score}/5
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 bg-[#f0fbf4] dark:bg-white/5 p-2 rounded-lg">
          <TrendingUp size={14} className="text-[#0d5d3a] dark:text-[#10b981]" />
          {trendMsg}
        </div>
      </div>
    );
  };

  const getSuggestedQuestions = (data: SnapshotData) => {
    let qs = [];
    if (data.moods.length > 0) {
      const avg = data.moods.reduce((s, m) => s + m.score, 0) / data.moods.length;
      if (avg < 3) qs.push("I noticed your mood scores have been a bit low recently. How have you been feeling overall?");
      else qs.push("Your mood tracking looks positive. What's been working well for you this week?");
    }
    
    if (data.goals.length > 0) {
      const highStreak = data.goals.find(g => g.currentStreak > 3);
      if (highStreak) {
        qs.push(`Great job keeping up with your '${highStreak.title}' goal! How does it feel to maintain that streak?`);
      }
    }
    
    if (data.activePrograms.length > 0) {
      qs.push(`I see you're working on the '${data.activePrograms[0].programId?.title || 'wellness'}' program. Have you found the daily steps helpful?`);
    }

    if (qs.length === 0) {
      qs.push("How has your week been since we last spoke?");
    }
    
    return qs;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 10 }} 
        className="bg-white dark:bg-[#111111] rounded-3xl w-full max-w-2xl shadow-2xl relative border border-[#0d5d3a]/10 dark:border-white/10 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-white">
              <Heart size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Wellness Snapshot
              </h3>
              {!loading && !error && data && (
                <p className="text-xs text-[#4a7c5d] dark:text-gray-400 font-semibold">
                  Client: {data.userName}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-[#0d5d3a] font-bold">Loading snapshot...</div>
          ) : error ? (
            <div className="text-center py-10">
              <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
              <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
              <p className="text-xs text-gray-500 mt-2">The client may have disabled progress sharing.</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Pre-Session Recommendations */}
              <div className="bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 border border-[#0d5d3a]/20 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-[#0d5d3a] dark:text-[#10b981] mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <MessageCircle size={16} /> Pre-Session Ideas
                </h4>
                <ul className="space-y-2">
                  {getSuggestedQuestions(data).map((q, idx) => (
                    <li key={idx} className="text-sm text-[#0a2617] dark:text-gray-200 font-medium flex gap-2">
                      <span className="text-[#10b981]">•</span> {q}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Mood Sparkline */}
                <div className="bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/10 dark:border-white/5 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-[#0a2617] dark:text-white mb-2 flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> 30-Day Mood Trend
                  </h4>
                  {renderMoodSparkline(data.moods)}
                </div>

                {/* Goals */}
                <div className="bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/10 dark:border-white/5 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-[#0a2617] dark:text-white mb-3 flex items-center gap-2">
                    <Target size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> Active Goals & Streaks
                  </h4>
                  {data.goals.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">No active goals.</div>
                  ) : (
                    <div className="space-y-3">
                      {data.goals.slice(0, 3).map((g, i) => (
                        <div key={i} className="flex justify-between items-center bg-[#fbfdfb] dark:bg-[#222] border border-gray-100 dark:border-white/5 p-2 rounded-xl">
                          <div className="text-sm font-semibold text-[#0a2617] dark:text-gray-200 truncate pr-2 flex-1">{g.title}</div>
                          <div className="shrink-0 text-xs font-bold bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-lg flex items-center gap-1">
                             {g.currentStreak}
                          </div>
                        </div>
                      ))}
                      {data.goals.length > 3 && <div className="text-xs text-center text-[#4a7c5d] pt-1">+{data.goals.length - 3} more goals</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Wellness Programs */}
              {data.activePrograms.length > 0 && (
                <div className="bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/10 dark:border-white/5 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-[#0a2617] dark:text-white mb-3 flex items-center gap-2">
                    <Dumbbell size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> Active Programs
                  </h4>
                  <div className="space-y-3">
                    {data.activePrograms.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#fbfdfb] dark:bg-[#222] border border-gray-100 dark:border-white/5 p-3 rounded-xl">
                        <div>
                          <div className="text-sm font-bold text-[#0a2617] dark:text-white">{p.programId?.title || 'Program'}</div>
                          <div className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-0.5">Category: {p.programId?.category || 'Wellness'}</div>
                        </div>
                        <div className="text-sm font-bold text-[#0d5d3a] dark:text-[#10b981]">
                          Day {p.progress}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
