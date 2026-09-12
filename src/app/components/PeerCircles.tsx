import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Send, ArrowLeft, UserCheck, UserPlus,
  Loader2, Shield, Eye, EyeOff, MessageSquare, Search
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '../api/client';

interface Circle {
  _id: string; name: string; description: string; category: string;
  icon: string; memberCount: number; messageCount: number; isJoined: boolean;
  gradientFrom: string; gradientTo: string;
}

interface CircleMsg {
  _id: string; circleId: string; authorName: string; content: string;
  isAnonymous: boolean; createdAt: string; userId?: string;
}

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

/* ── Circle Card ── */
function CircleCard({ circle, onJoin, onOpen, joining }: {
  circle: Circle; onJoin: (id: string) => void;
  onOpen: (c: Circle) => void; joining: string | null;
}) {
  return (
    <div className="zen-anim-border" style={{ borderRadius: 24 }}>
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="zen-anim-border-content rounded-3xl p-5 flex flex-col" style={{ borderRadius: 22 }}>
        <div className="flex items-start gap-3 mb-3">
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0, fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${circle.gradientFrom}, ${circle.gradientTo})`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>{circle.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#0a2617] dark:text-white text-sm leading-snug mb-1"
              style={{ fontFamily: 'Syne, sans-serif' }}>{circle.name}</h3>
            <div className="flex gap-3 text-[10px] text-[#4a7c5d] dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{circle.memberCount} members</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{circle.messageCount}</span>
            </div>
          </div>
          {circle.isJoined && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <UserCheck className="w-2.5 h-2.5" /> Joined
            </span>
          )}
        </div>
        <p className="text-xs text-[#4a7c5d] dark:text-gray-400 leading-relaxed mb-4 line-clamp-2 flex-1">
          {circle.description}
        </p>
        <div className="flex gap-2 mt-auto">
          <button onClick={() => onJoin(circle._id)} disabled={joining === circle._id}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              circle.isJoined
                ? 'bg-[#0d5d3a]/08 dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] border border-[#0d5d3a]/20'
                : 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white hover:bg-[#0a4a2e] shadow-md'
            } disabled:opacity-50`}>
            {joining === circle._id ? <Loader2 className="w-3 h-3 animate-spin" />
              : circle.isJoined ? <><UserCheck className="w-3 h-3" /> Joined</>
              : <><UserPlus className="w-3 h-3" /> Join</>}
          </button>
          <button onClick={() => onOpen(circle)}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                background: 'rgba(13,93,58,0.06)', border: '1.5px solid rgba(13,93,58,0.18)',
                color: '#0d5d3a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
            <MessageSquare className="w-3 h-3" /> Open
          </button>
        </div>
      </motion.div>
    </div>
  );
}


/* ── Chat Room View ── */
function CircleChatRoom({ circle, currentUserId, onBack, onJoin, joining }: {
  circle: Circle; currentUserId: string; onBack: () => void;
  onJoin: (id: string) => void; joining: string | null;
}) {
  const [messages, setMessages] = useState<CircleMsg[]>([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [isAnon, setIsAnon]     = useState(false);
  const [sending, setSending]   = useState(false);
  const socketRef               = useRef<Socket | null>(null);
  const bottomRef               = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try { const res = await apiFetch<any>(`/circles/${circle._id}/messages?limit=50`); setMessages(res.messages || []); }
    catch { /* silent */ } finally { setLoading(false); }
  }, [circle._id]);

  useEffect(() => {
    loadMessages();
    const socket = io(BACKEND_URL, { withCredentials: true, transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join-circle', circle._id);
    socket.on('circle-new-message', (msg: CircleMsg) => setMessages(prev => [...prev, msg]));
    socket.on('circle-message-removed', (msgId: string) => setMessages(prev => prev.filter(m => m._id !== msgId)));
    return () => { socket.emit('leave-circle', circle._id); socket.disconnect(); };
  }, [circle._id, loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await apiFetch<any>(`/circles/${circle._id}/messages`, { method: 'POST', body: JSON.stringify({ content: text.trim(), isAnonymous: isAnon }) });
      socketRef.current?.emit('circle-message', { circleId: circle._id, message: res.message });
      setText('');
    } catch { /* silent */ } finally { setSending(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const isOwnMsg = (msg: CircleMsg) => msg.userId === currentUserId;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--dash-sidebar-bg)', borderBottom: '2px solid var(--dash-border)', backdropFilter: 'blur(8px)' }}>
        <button onClick={onBack} style={{ padding: '6px', borderRadius: 10, border: 'none', background: 'rgba(13,93,58,0.08)', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: '#0d5d3a' }} />
        </button>
        <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, background: `linear-gradient(135deg, ${circle.gradientFrom}, ${circle.gradientTo})` }}>
          {circle.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#0a2617' }}>{circle.name}</div>
          <div style={{ fontSize: 10, color: '#4a7c5d', display: 'flex', alignItems: 'center', gap: 4 }}><Users className="w-3 h-3" />{circle.memberCount} members</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#059669', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Live
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#0d5d3a' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, textAlign: 'center' }}>
            <MessageSquare style={{ color: 'rgba(13,93,58,0.3)', width: 32, height: 32, marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: '#4a7c5d' }}>No messages yet. Be the first to share! </p>
          </div>
        ) : (
          messages.map(msg => {
            const own = isOwnMsg(msg);
            return (
              <div key={msg._id} style={{ display: 'flex', justifyContent: own ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start', gap: 2 }}>
                  {!own && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700, background: `linear-gradient(135deg, ${circle.gradientFrom}, ${circle.gradientTo})` }}>
                        {msg.authorName[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#4a7c5d' }}>
                        {msg.authorName}{msg.isAnonymous && <Shield className="w-2.5 h-2.5 inline ml-1" style={{ color: '#0d5d3a' }} />}
                      </span>
                    </div>
                  )}
                  <div style={{
                    padding: '8px 12px', borderRadius: own ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                    background: own ? 'linear-gradient(135deg,#0d5d3a,#1a8a5a)' : 'white',
                    color: own ? 'white' : '#0a2617',
                    border: own ? 'none' : '1px solid rgba(13,93,58,0.12)',
                    boxShadow: own ? '0 2px 8px rgba(13,93,58,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                  }}>{msg.content}</div>
                  <span style={{ fontSize: 9, color: 'rgba(74,124,93,0.7)', padding: '0 4px' }}>{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {circle.isJoined ? (
        <div style={{ flexShrink: 0, borderTop: '2px solid var(--dash-border)', background: 'var(--dash-sidebar-bg)', backdropFilter: 'blur(8px)', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <button onClick={() => setIsAnon(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', background: isAnon ? 'linear-gradient(135deg,#0d5d3a,#1a8a5a)' : 'rgba(13,93,58,0.08)', color: isAnon ? 'white' : '#0d5d3a' }}>
              {isAnon ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {isAnon ? 'Anonymous' : 'Visible name'}
            </button>
            <span style={{ fontSize: 10, color: '#4a7c5d' }}>{isAnon ? 'Your name is hidden' : 'Others can see your name'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
              placeholder="Share how you feel… (Enter to send)" rows={1}
              className="bg-white dark:bg-[#111111] text-[#0a2617] dark:text-white placeholder-gray-400"
              style={{ flex: 1, padding: '10px 14px', borderRadius: 16, border: '2px solid rgba(13,93,58,0.15)', fontSize: 13, outline: 'none', resize: 'none', maxHeight: 112, overflowY: 'auto', fontFamily: 'inherit' }}
              onInput={e => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 112) + 'px'; }} />
            <button onClick={sendMessage} disabled={!text.trim() || sending}
              style={{ width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0d5d3a,#1a8a5a)', color: 'white', boxShadow: '0 2px 8px rgba(13,93,58,0.3)', opacity: !text.trim() || sending ? 0.5 : 1 }}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flexShrink: 0, borderTop: '2px solid var(--dash-border)', background: 'var(--dash-sidebar-bg)', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'rgba(13,93,58,0.06)', borderRadius: 12, padding: '12px 14px', border: '1.5px solid rgba(13,93,58,0.15)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0a2617', marginBottom: 2 }}> You're viewing as a guest</p>
              <p style={{ fontSize: 11, color: '#4a7c5d' }}>Join this circle to send messages.</p>
            </div>
            <button onClick={() => onJoin(circle._id)} disabled={joining === circle._id}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d5d3a,#1a8a5a)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(13,93,58,0.25)', opacity: joining === circle._id ? 0.6 : 1 }}>
              {joining === circle._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />} Join Circle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main PeerCircles Component ── */
export default function PeerCircles({ userId }: { userId?: string }) {
  const [circles, setCircles]         = useState<Circle[]>([]);
  const [loading, setLoading]         = useState(true);
  const [joining, setJoining]         = useState<string | null>(null);
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [circleTab, setCircleTab]     = useState<'browse' | 'joined'>('joined');
  const [circleSearch, setCircleSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await apiFetch<any>('/circles'); setCircles(res.circles || []); }
    catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleJoin = async (id: string) => {
    setJoining(id);
    try {
      const res = await apiFetch<any>(`/circles/${id}/join`, { method: 'POST' });
      setCircles(prev => prev.map(c => c._id === id ? { ...c, isJoined: res.joined, memberCount: c.memberCount + (res.joined ? 1 : -1) } : c));
    } catch { /* silent */ } finally { setJoining(null); }
  };

  if (activeCircle) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <CircleChatRoom
          circle={activeCircle} currentUserId={userId || ''}
          onBack={() => setActiveCircle(null)}
          onJoin={async (id) => {
            setJoining(id);
            try {
              const res = await apiFetch<any>(`/circles/${id}/join`, { method: 'POST' });
              setActiveCircle(prev => prev ? { ...prev, isJoined: res.joined } : prev);
              setCircles(prev => prev.map(c => c._id === id ? { ...c, isJoined: res.joined, memberCount: c.memberCount + (res.joined ? 1 : -1) } : c));
            } catch { /* silent */ } finally { setJoining(null); }
          }}
          joining={joining}
        />
      </div>
    );
  }

  const joinedCircles = circles.filter(c => c.isJoined);
  const displayCircles = circleTab === 'joined'
    ? circles.filter(c => c.isJoined).filter(c => !circleSearch || c.name.toLowerCase().includes(circleSearch.toLowerCase()))
    : circles.filter(c => !circleSearch || c.name.toLowerCase().includes(circleSearch.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="zen-controls-bar">
        <div style={{ borderRadius: 10, background: 'rgba(13,93,58,0.07)', border: '1.5px solid rgba(13,93,58,0.15)', padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#0d5d3a' }} />
          <p style={{ fontSize: 10, color: '#0d5d3a', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>
            Safe, moderated spaces. Be kind, supportive, and never share personal contact details. You can post anonymously anytime.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search className="w-3.5 h-3.5" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={circleSearch} onChange={e => setCircleSearch(e.target.value)}
              placeholder="Search circles…"
              className="bg-white dark:bg-[#111111] text-[#0a2617] dark:text-white placeholder-gray-400"
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 20, border: '2px solid rgba(13,93,58,0.15)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {(['joined', 'browse'] as const).map(t => (
              <button key={t} onClick={() => setCircleTab(t)} className={`zen-tab-pill ${circleTab === t ? 'active' : ''}`}>
                {t === 'browse' ? <><Users className="w-3 h-3" />Browse</> : <><UserCheck className="w-3 h-3" />Joined ({joinedCircles.length})</>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#0d5d3a' }} />
          </div>
        ) : circleTab === 'joined' && displayCircles.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', textAlign: 'center' }}>
            <Users style={{ width: 48, height: 48, color: 'rgba(13,93,58,0.2)', marginBottom: 14 }} />
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#0a2617', marginBottom: 6 }}>You haven't joined any circles yet</p>
            <button onClick={() => setCircleTab('browse')}
              style={{ marginTop: 6, padding: '10px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#0d5d3a,#1a8a5a)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(13,93,58,0.25)' }}>
              Explore Circles
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {displayCircles.map(c => (
                  <CircleCard key={c._id} circle={c} onJoin={handleJoin} onOpen={setActiveCircle} joining={joining} />
                ))}
              </AnimatePresence>
            </div>
            {circleTab === 'joined' && joinedCircles.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                <button onClick={() => setCircleTab('browse')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12, border: '1.5px solid rgba(13,93,58,0.2)', background: 'rgba(13,93,58,0.04)', color: '#0d5d3a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <Users className="w-4 h-4" /> Explore More Circles
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
