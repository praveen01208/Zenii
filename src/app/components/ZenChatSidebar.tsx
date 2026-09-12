import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquarePlus, Trash2, ChevronLeft, ChevronRight,
  MessageCircle, Clock, Search, X, Sparkles
} from 'lucide-react';
import { apiFetch } from '../api/client';

type ZenSession = {
  _id: string;
  title: string;
  category: string;
  messageCount: number;
  moodScore: number | null;
  createdAt: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  anxiety:       'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
  depression:    'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
  stress:        'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
  exam_pressure: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
  bullying:      'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800/40',
  loneliness:    'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/40',
  family_issues: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
  self_esteem:   'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800/40',
  trauma:        'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  other:         'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

type Props = {
  open: boolean;
  onToggle: () => void;
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  refreshTrigger?: number;
};

export default function ZenChatSidebar({
  open, onToggle, currentSessionId, onSelectSession, onNewChat, refreshTrigger = 0
}: Props) {
  const [sessions, setSessions]           = useState<ZenSession[]>([]);
  const [loading, setLoading]             = useState(false);
  const [search, setSearch]               = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { sessions: s } = await apiFetch<{ sessions: ZenSession[] }>('/zen-sessions');
      setSessions(s || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions, refreshTrigger]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm !== id) { setDeleteConfirm(id); return; }
    try {
      await apiFetch(`/zen-sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s._id !== id));
      if (currentSessionId === id) onNewChat();
    } catch { /* silent */ }
    setDeleteConfirm(null);
  };

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  // Group by date
  const groups: { label: string; items: ZenSession[] }[] = [];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const todayItems     = filtered.filter(s => new Date(s.createdAt).toDateString() === today);
  const yestItems      = filtered.filter(s => new Date(s.createdAt).toDateString() === yesterday);
  const olderItems     = filtered.filter(s => {
    const d = new Date(s.createdAt).toDateString();
    return d !== today && d !== yesterday;
  });
  if (todayItems.length) groups.push({ label: 'Today', items: todayItems });
  if (yestItems.length)  groups.push({ label: 'Yesterday', items: yestItems });
  if (olderItems.length) groups.push({ label: 'Previous 7 Days', items: olderItems });

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <motion.div
        initial={false}
        animate={{ width: open ? 280 : 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="relative flex-shrink-0 h-full overflow-hidden z-40"
        style={{ minWidth: 0 }}
      >
        <div className="h-full w-[280px] flex flex-col bg-white/95 dark:bg-[#161619]/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/08">

          {/* Header Action */}
          <div className="p-3.5 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
            <button
              onClick={onToggle}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 transition"
              title="Close sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* iOS Search Bar */}
          <div className="px-3.5 py-2.5">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 rounded-xl px-3 py-2 border border-transparent focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-[#1c1c1f] transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search history..."
                className="flex-1 bg-transparent text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-4">
            {loading && sessions.length === 0 && (
              <div className="text-center text-xs text-slate-400 mt-8">Loading chats...</div>
            )}
            {!loading && sessions.length === 0 && (
              <div className="text-center px-4 mt-12">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-2 text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No conversations yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Your reflections with Zeni will appear here.</p>
              </div>
            )}

            {groups.map(group => (
              <div key={group.label}>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map(session => {
                    const isSelected = currentSessionId === session._id;
                    return (
                      <motion.button
                        key={session._id}
                        onClick={() => onSelectSession(session._id)}
                        layout
                        className={`w-full text-left p-2.5 rounded-xl group transition-all relative flex flex-col gap-1 border ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                            : 'bg-transparent hover:bg-slate-100/80 dark:hover:bg-white/5 border-transparent text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold truncate leading-snug ${isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                            {session.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo(session.createdAt)}</span>
                          </div>

                          {session.category && session.category !== 'other' && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${CATEGORY_COLORS[session.category] || CATEGORY_COLORS.other}`}>
                              {session.category.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={e => handleDelete(session._id, e)}
                          className={`absolute right-2 top-2.5 w-6 h-6 flex items-center justify-center rounded-lg transition ${
                            deleteConfirm === session._id
                              ? 'bg-rose-500 text-white opacity-100'
                              : isSelected
                                ? 'text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100'
                                : 'text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100'
                          }`}
                          title={deleteConfirm === session._id ? 'Click again to confirm delete' : 'Delete chat'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Stats */}
          {sessions.length > 0 && (
            <div className="border-t border-black/[0.05] dark:border-white/[0.08] px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>{sessions.length} Saved Reflections</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
