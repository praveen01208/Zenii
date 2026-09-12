/**
 * SessionPrepCard
 *
 * Shows in the Dashboard when there is a session within 24 hours.
 * Displays AI-generated reflection prompts and lets the user write
 * their session intention. Matches the ZenMind design system perfectly.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sparkles, ChevronDown, ChevronUp, Loader2, Check, RefreshCw } from 'lucide-react';
import { apiFetch } from '../api/client';

interface Session {
  _id: string;
  therapistName: string;
  date: string;
  status: string;
}

interface Prep {
  _id: string;
  prompts: string[];
  userResponse: string;
}

function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Starting now';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h away`;
  if (h > 0) return `${h}h ${m}m away`;
  return `${m}m away`;
}

export default function SessionPrepCard() {
  const [session, setSession]         = useState<Session | null>(null);
  const [prep, setPrep]               = useState<Prep | null>(null);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [expanded, setExpanded]       = useState(true);
  const [response, setResponse]       = useState('');
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<any>('/session-prep/upcoming');
      setSession(res.session || null);
      if (res.prep) {
        setPrep(res.prep);
        setResponse(res.prep.userResponse || '');
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generatePrompts = async () => {
    if (!session) return;
    setGenerating(true);
    try {
      const res = await apiFetch<any>(`/session-prep/${session._id}/generate`, { method: 'POST' });
      setPrep(res.prep);
    } catch { /* silent */ }
    finally { setGenerating(false); }
  };

  const saveResponse = async () => {
    if (!session || !prep) return;
    setSaving(true);
    try {
      await apiFetch(`/session-prep/${session._id}/response`, {
        method: 'PATCH',
        body: JSON.stringify({ userResponse: response }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  // Only show when session is within 24h
  if (loading || !session) return null;
  const hoursUntil = (new Date(session.date).getTime() - Date.now()) / 3_600_000;
  if (hoursUntil > 24 || hoursUntil < 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#0a2617] to-[#0d5d3a] rounded-3xl border border-[#0d5d3a]/20 shadow-xl shadow-[#0d5d3a]/15 overflow-hidden mb-4"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Session with {session.therapistName}
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                {timeUntil(session.date)}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {new Date(session.date).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </div>
        </div>
        <div className="text-white/50">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
              {/* AI Prompts section */}
              {!prep || prep.prompts.length === 0 ? (
                <div className="text-center py-4">
                  <Sparkles className="w-8 h-8 text-white/40 mx-auto mb-3" />
                  <p className="text-sm text-white/70 mb-4">
                    Get personalised reflection prompts to help you make the most of your session.
                  </p>
                  <button
                    onClick={generatePrompts}
                    disabled={generating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition mx-auto disabled:opacity-50"
                  >
                    {generating
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                      : <><Sparkles className="w-4 h-4" /> Generate Prep Prompts</>
                    }
                  </button>
                </div>
              ) : (
                <>
                  {/* Prompts */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> AI Reflection Prompts
                      </p>
                      <button onClick={generatePrompts} disabled={generating} className="text-white/40 hover:text-white/70 transition" title="Regenerate">
                        <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {prep.prompts.map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 bg-white/08 rounded-2xl px-4 py-3"
                        >
                          <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-white/85 leading-relaxed">{p}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Intention textarea */}
                  <div>
                    <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-2">
                      Your Session Intention (private)
                    </label>
                    <textarea
                      value={response}
                      onChange={e => setResponse(e.target.value)}
                      placeholder="What do you want to get out of today's session?"
                      rows={3}
                      maxLength={2000}
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm outline-none focus:bg-white/15 focus:ring-2 focus:ring-white/20 resize-none transition"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-white/30">{response.length}/2000</span>
                      <button
                        onClick={saveResponse}
                        disabled={saving || !response.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition disabled:opacity-50"
                      >
                        {saving
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                          : saved
                          ? <><Check className="w-3.5 h-3.5 text-green-300" /> Saved!</>
                          : 'Save Intention'
                        }
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
