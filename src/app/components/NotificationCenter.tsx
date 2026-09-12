/**
 * NotificationCenter
 *
 * A self-contained notification bell + flyout panel that fits into the Dashboard header.
 * Matches the exact UI patterns used throughout the ZenMind codebase:
 *   - bg-white dark:bg-[#111111] cards
 *   - rounded-3xl / rounded-2xl / rounded-xl border hierarchy
 *   - #0d5d3a / #1a8a5a green primary palette
 *   - #0a2617 dark text, #4a7c5d muted text
 *   - Framer Motion / motion/react animations
 *   - apiFetch utility
 *   - Syne font-family for headings
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, BellOff, Check, CheckCheck, Trash2, X, ChevronRight,
  Calendar, MessageCircle, Flame, BookOpen, Dumbbell, Megaphone,
  Heart, Loader2,
} from 'lucide-react';
import { apiFetch } from '../api/client';

/* ────────────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────────── */
interface Notif {
  _id: string;
  type: string;
  title: string;
  body: string;
  actionTab: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  /** Called when the user clicks the action button on a notification to navigate */
  onNavigate?: (tab: string) => void;
}

/* ────────────────────────────────────────────────────────────────────
   Type → icon + accent colour mapping
──────────────────────────────────────────────────────────────────── */
const TYPE_META: Record<string, { icon: React.ReactNode; accent: string; bg: string }> = {
  session_booked:      { icon: <Calendar   className="w-4 h-4" />, accent: '#0d5d3a', bg: 'bg-[#0d5d3a]/10 dark:bg-[#0d5d3a]/20' },
  session_reminder:    { icon: <Calendar   className="w-4 h-4" />, accent: '#0369a1', bg: 'bg-blue-100 dark:bg-blue-500/10' },
  session_cancelled:   { icon: <Calendar   className="w-4 h-4" />, accent: '#dc2626', bg: 'bg-red-100 dark:bg-red-500/10' },
  session_rescheduled: { icon: <Calendar   className="w-4 h-4" />, accent: '#d97706', bg: 'bg-amber-100 dark:bg-amber-500/10' },
  message_received:    { icon: <MessageCircle className="w-4 h-4" />, accent: '#7c3aed', bg: 'bg-purple-100 dark:bg-purple-500/10' },
  goal_streak:         { icon: <Flame      className="w-4 h-4" />, accent: '#ea580c', bg: 'bg-orange-100 dark:bg-orange-500/10' },
  program_unlocked:    { icon: <Dumbbell   className="w-4 h-4" />, accent: '#0d5d3a', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
  reading_new:         { icon: <BookOpen   className="w-4 h-4" />, accent: '#0369a1', bg: 'bg-sky-100 dark:bg-sky-500/10' },
  system:              { icon: <Megaphone  className="w-4 h-4" />, accent: '#4a7c5d', bg: 'bg-[#0d5d3a]/08 dark:bg-[#0d5d3a]/15' },
  crisis_followup:     { icon: <Heart      className="w-4 h-4" />, accent: '#be123c', bg: 'bg-rose-100 dark:bg-rose-500/10' },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META.system;
}

/* ────────────────────────────────────────────────────────────────────
   Relative time helper
──────────────────────────────────────────────────────────────────── */
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ────────────────────────────────────────────────────────────────────
   Individual Notification Row
──────────────────────────────────────────────────────────────────── */
function NotifRow({
  notif,
  onRead,
  onDelete,
  onNavigate,
}: {
  notif: Notif;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (tab: string) => void;
}) {
  const meta = getTypeMeta(notif.type);

  const handleClick = () => {
    if (!notif.isRead) onRead(notif._id);
    if (notif.actionTab && onNavigate) onNavigate(notif.actionTab);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer rounded-2xl mx-2 mb-1 ${
        notif.isRead
          ? 'hover:bg-gray-50 dark:hover:bg-white/05'
          : 'bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 hover:bg-[#e8f5e9] dark:hover:bg-[#0d5d3a]/15'
      }`}
      onClick={handleClick}
    >
      {/* Unread dot */}
      {!notif.isRead && (
        <span className="absolute left-2 top-4 w-1.5 h-1.5 rounded-full bg-[#0d5d3a] dark:bg-[#10b981] flex-shrink-0" />
      )}

      {/* Icon badge */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg}`}
        style={{ color: meta.accent }}
      >
        {meta.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-6">
        <p className={`text-sm leading-snug ${notif.isRead ? 'font-semibold text-[#0a2617] dark:text-gray-200' : 'font-bold text-[#0a2617] dark:text-gray-100'}`}>
          {notif.title}
        </p>
        <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.body}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-[#4a7c5d]/70 dark:text-gray-500">
            {relTime(notif.createdAt)}
          </span>
          {notif.actionTab && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#0d5d3a] dark:text-[#10b981]">
              Open <ChevronRight className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Delete button — always visible and interactive */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(notif._id); }}
        className="absolute right-3 top-3 opacity-60 hover:opacity-100 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
        title="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Empty state
──────────────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-14 h-14 rounded-3xl bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 flex items-center justify-center mb-4">
        <BellOff className="w-7 h-7 text-[#0d5d3a]/40 dark:text-[#10b981]/40" />
      </div>
      <p className="text-sm font-bold text-[#0a2617] dark:text-gray-100">All caught up!</p>
      <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1">
        Your notifications will appear here as you use ZenMind.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Main NotificationCenter component
──────────────────────────────────────────────────────────────────── */
export default function NotificationCenter({ onNavigate }: Props) {
  const [open, setOpen]             = useState(false);
  const [notifs, setNotifs]         = useState<Notif[]>([]);
  const [unreadCount, setUnread]    = useState(0);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter]         = useState<'all' | 'unread'>('all');
  const [clearing, setClearing]     = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef  = useRef<HTMLButtonElement>(null);

  /* ── Load notifications ── */
  const load = useCallback(async (pg = 1, flt = filter, append = false) => {
    setLoading(true);
    try {
      const res = await apiFetch<any>(
        `/notifications?page=${pg}&limit=15&unreadOnly=${flt === 'unread'}`
      );
      setNotifs(prev => append ? [...prev, ...(res.notifications || [])] : (res.notifications || []));
      setUnread(res.unreadCount ?? 0);
      setPage(pg);
      setTotalPages(res.totalPages ?? 1);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filter]);

  /* ── Poll unread count every 30s (lightweight) ── */
  useEffect(() => {
    const poll = () => {
      apiFetch<any>('/notifications/unread-count')
        .then(r => setUnread(r.unreadCount ?? 0))
        .catch(() => {});
    };
    poll(); // immediate
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);

  /* ── Open / close the panel ── */
  const openPanel = () => {
    setOpen(true);
    setFilter('all');
    load(1, 'all', false);
  };
  const closePanel = () => setOpen(false);

  /* ── Click outside to close ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current  && !bellRef.current.contains(e.target as Node)
      ) closePanel();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* ── Escape to close ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  /* ── Mark single as read ── */
  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    try {
      const r = await apiFetch<any>(`/notifications/${id}/read`, { method: 'PATCH' });
      setUnread(r.unreadCount ?? 0);
    } catch { /* silent */ }
  };

  /* ── Mark all as read ── */
  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await apiFetch<any>('/notifications/read-all', { method: 'PATCH' });
    } catch { /* silent */ }
  };

  /* ── Delete single ── */
  const deleteOne = async (id: string) => {
    setNotifs(prev => {
      const next = prev.filter(n => n._id !== id);
      setUnread(next.filter(n => !n.isRead).length);
      return next;
    });
    try {
      const r = await apiFetch<any>(`/notifications/${id}`, { method: 'DELETE' });
      if (r && typeof r.unreadCount === 'number') setUnread(r.unreadCount);
    } catch { /* silent */ }
  };

  /* ── Clear all ── */
  const clearAll = async () => {
    setClearing(true);
    setNotifs([]);
    setUnread(0);
    try {
      await apiFetch<any>('/notifications/clear-all', { method: 'DELETE' });
    } catch { /* silent */ }
    finally { setClearing(false); }
  };

  /* ── Load more ── */
  const loadMore = () => {
    if (page < totalPages && !loading) load(page + 1, filter, true);
  };

  /* ── Filter switch ── */
  const switchFilter = (flt: 'all' | 'unread') => {
    setFilter(flt);
    load(1, flt, false);
  };

  /* ── Navigate via notification ── */
  const handleNavigate = (tab: string) => {
    closePanel();
    if (onNavigate) onNavigate(tab as any);
  };

  const displayedNotifs = notifs;

  return (
    <div className="relative flex-shrink-0">
      {/* Bell button */}
      <button
        ref={bellRef}
        id="notification-bell"
        onClick={open ? closePanel : openPanel}
        className={`relative p-2 rounded-xl border transition-all ${
          open
            ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] border-[#0d5d3a] text-white'
            : 'border-[#0d5d3a]/15 dark:border-white/10 text-[#0d5d3a] dark:text-gray-300 hover:bg-[#f0fbf4] dark:hover:bg-white/10'
        }`}
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center leading-none shadow-md shadow-red-500/30 ring-2 ring-white dark:ring-[#050505]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Flyout panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] w-[340px] sm:w-[380px] bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-[500] flex flex-col"
            style={{ maxHeight: '80vh' }}
          >
            {/* Panel header */}
            <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-[#0d5d3a]/08 dark:border-white/08">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-[#4a7c5d] dark:text-gray-400 font-semibold mt-0.5">
                      {unreadCount} unread
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Mark all read */}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-[#0d5d3a] dark:text-[#10b981] bg-[#f0fbf4] dark:bg-[#0d5d3a]/15 hover:bg-[#e8f5e9] dark:hover:bg-[#0d5d3a]/25 transition"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      All read
                    </button>
                  )}
                  {/* Clear all */}
                  {notifs.length > 0 && (
                    <button
                      onClick={clearAll}
                      disabled={clearing}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition disabled:opacity-50"
                      title="Clear all notifications"
                    >
                      {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Clear
                    </button>
                  )}
                  {/* Close */}
                  <button
                    onClick={closePanel}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 p-1 bg-[#f0fbf4] dark:bg-[#0d1f14] rounded-2xl w-fit">
                {(['all', 'unread'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => switchFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      filter === f
                        ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-sm'
                        : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/10'
                    }`}
                  >
                    {f === 'all' ? `All${notifs.length > 0 && filter === 'all' ? ` (${notifs.length}${page < totalPages ? '+' : ''})` : ''}` : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto py-2">
              {loading && notifs.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-[#0d5d3a] dark:text-[#10b981] animate-spin" />
                </div>
              ) : displayedNotifs.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <AnimatePresence>
                    {displayedNotifs.map(n => (
                      <NotifRow
                        key={n._id}
                        notif={n}
                        onRead={markRead}
                        onDelete={deleteOne}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Load more */}
                  {page < totalPages && (
                    <div className="px-4 pt-1 pb-3">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full py-2.5 rounded-2xl border border-[#0d5d3a]/15 dark:border-white/10 text-[#0d5d3a] dark:text-[#10b981] text-xs font-bold hover:bg-[#f0fbf4] dark:hover:bg-[#0d5d3a]/10 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Load more'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Panel footer */}
            <div className="flex-shrink-0 border-t border-[#0d5d3a]/08 dark:border-white/08 px-4 py-2.5 flex items-center justify-between">
              <p className="text-[10px] text-[#4a7c5d]/70 dark:text-gray-500">
                Notifications auto-expire after 30 days
              </p>
              <button
                onClick={() => { closePanel(); }}
                className="text-[11px] font-bold text-[#0d5d3a] dark:text-[#10b981] hover:underline"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
