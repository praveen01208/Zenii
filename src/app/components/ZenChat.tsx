import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, RotateCcw, Sparkles, ExternalLink, Heart, 
  MessageCircle, Phone, ArrowRight, ShieldCheck,
  UserCheck, Smile, HelpCircle, Compass
} from 'lucide-react';
import { apiFetch } from '../api/client';
import ZenChatSidebar from './ZenChatSidebar';
import MoodCheckIn from './MoodCheckIn';

type MessageAction = 'STORY_BUTTONS' | 'POST_STORY' | 'THERAPY_BUTTON' | 'CRISIS' | null;
type Message = { role: 'user' | 'assistant'; content: string; id: string; action?: MessageAction; timestamp?: string };

let _id = 0;
const uid = () => `m_${Date.now()}_${_id++}`;

const ACTION_RE = /\[ACTION:(STORY_BUTTONS|POST_STORY|THERAPY_BUTTON|CRISIS)\]/g;

function stripActionTags(text: string): string {
  return text.replace(ACTION_RE, '').replace(/^\s+|\s+$/g, '').replace(/\n{3,}/g, '\n\n');
}

function detectAction(raw: string): MessageAction {
  const reset = new RegExp(ACTION_RE.source, 'g');
  const m = reset.exec(raw);
  return m ? (m[1] as MessageAction) : null;
}

function parseReply(raw: string): { text: string; action: MessageAction } {
  const action = detectAction(raw);
  const text = stripActionTags(raw);
  return { text, action };
}

const CRISIS_NUMBERS = [
  { name: 'iCall Psychosocial Helpline', number: '9152987821', tag: 'Mon–Sat, 8am–9pm · Free' },
  { name: 'Vandrevala Foundation', number: '9999 666 555', tag: '24/7 · Toll-Free' },
  { name: 'Tele-MANAS (Govt of India)', number: '14416', tag: '24/7 · Multilingual' },
  { name: 'AASRA Suicide Prevention', number: '9820466627', tag: '24/7 · Confidential' },
  { name: 'NIMHANS Helpline', number: '080-46110007', tag: 'Mon–Sat, 8am–8pm' },
];

const QUICK_STARTERS = [
  { label: 'Moment of Calm', prompt: 'I feel a bit anxious right now, can you help me relax and center myself?', icon: '🌿' },
  { label: 'Uplifting Story', prompt: 'Tell me an inspiring story about overcoming self-doubt and finding peace.', icon: '✨' },
  { label: 'Untangle Thoughts', prompt: 'I have too much on my mind today and feel overwhelmed. Can we talk through it?', icon: '💭' },
  { label: 'Breathing Exercise', prompt: 'Could you guide me through a 2-minute 4-7-8 calming breath exercise?', icon: '🫁' },
];

/* ── Crisis Card (iOS Emergency / Health style) ─────────────── */
function CrisisCard({ onGoToTherapy }: { onGoToTherapy?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mt-3.5 w-full max-w-md rounded-2xl overflow-hidden shadow-xl shadow-rose-500/10 border border-rose-200/80 dark:border-rose-500/30 bg-white/95 dark:bg-[#1a1215]/95 backdrop-blur-xl"
    >
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 px-4 py-3.5 flex items-center gap-3 text-white">
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 fill-white text-white" />
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight leading-tight">You are never alone</p>
          <p className="text-rose-100 text-[11px] font-medium">Compassionate, free, and confidential support is here 24/7</p>
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-2">
        <p className="text-[10px] text-rose-700 dark:text-rose-300 font-bold uppercase tracking-wider px-1">
          Direct Helpline Directory
        </p>

        {CRISIS_NUMBERS.map(({ name, number, tag }) => (
          <a
            key={name}
            href={`tel:${number.replace(/[^0-9]/g, '')}`}
            className="flex items-center justify-between bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/90 dark:hover:bg-rose-900/40 border border-rose-200/60 dark:border-rose-500/20 rounded-xl px-3 py-2.5 transition-all group active:scale-[0.99]"
          >
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-rose-950 dark:text-rose-100 truncate">{name}</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-300/80 font-medium">{tag}</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-300 bg-white dark:bg-rose-900/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-500/30 group-hover:shadow-sm whitespace-nowrap">
              <Phone className="w-3 h-3" />
              {number}
            </span>
          </a>
        ))}

        {onGoToTherapy && (
          <button
            onClick={onGoToTherapy}
            className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-700/20 active:scale-[0.99]"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Connect with a Licensed Therapist
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Message Bubble Component (iOS iMessage Style) ─────────── */
function MessageBubble({ msg, onStoryYes, onStoryNo, onFeelingGood, onConnectReal, onGoToTherapy }: {
  msg: Message;
  onStoryYes: () => void;
  onStoryNo: () => void;
  onFeelingGood: () => void;
  onConnectReal: () => void;
  onGoToTherapy: () => void;
}) {
  const isBot = msg.role === 'assistant';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-3 w-full ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[1.5px] shadow-sm mt-0.5">
          <div className="w-full h-full rounded-full bg-white dark:bg-[#1c1c1e] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
        
        {/* Name / Meta Tag */}
        <div className="flex items-center gap-1.5 px-1 mb-1">
          <span className={`text-[11px] font-semibold tracking-wide ${isBot ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
            {isBot ? 'Zeni' : 'You'}
          </span>
          {isBot && (
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
              AI Guide
            </span>
          )}
        </div>

        {/* The Speech Bubble */}
        <div
          className={`relative px-4 py-3 sm:px-4.5 sm:py-3.5 text-[15px] leading-relaxed select-text transition-all ${
            isBot
              ? 'bg-[#f2f2f7] dark:bg-[#252528] text-[#1c1c1e] dark:text-[#f2f2f7] border border-black/[0.04] dark:border-white/[0.08] rounded-[22px] rounded-tl-[6px] shadow-sm'
              : 'bg-gradient-to-b from-[#10b981] to-[#059669] text-white rounded-[22px] rounded-tr-[6px] shadow-sm shadow-emerald-900/10 font-medium'
          }`}
          style={{ wordBreak: 'break-word' }}
        >
          <div className="whitespace-pre-wrap">{stripActionTags(msg.content)}</div>
        </div>

        {/* Action Trigger Buttons (iOS segmented style) */}
        {isBot && msg.action === 'STORY_BUTTONS' && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-center gap-2 mt-2.5 flex-wrap"
          >
            <button 
              onClick={onStoryYes}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5"
            >
              <span>Yes, please</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button 
              onClick={onStoryNo}
              className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-full border border-slate-200 dark:border-white/10 transition active:scale-95"
            >
              Not right now
            </button>
          </motion.div>
        )}

        {isBot && msg.action === 'POST_STORY' && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-center gap-2 mt-2.5 flex-wrap"
          >
            <button 
              onClick={onFeelingGood}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Feeling better</span>
            </button>
            <button 
              onClick={onConnectReal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-full transition shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Connect to a real person</span>
            </button>
          </motion.div>
        )}

        {isBot && msg.action === 'THERAPY_BUTTON' && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mt-2.5 w-full max-w-sm"
          >
            <button 
              onClick={onGoToTherapy}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-900/15 hover:shadow-lg active:scale-[0.99] transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">Explore Verified Therapists</p>
                  <p className="text-[10px] text-emerald-100">1-on-1 confidential video sessions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        )}

        {isBot && msg.action === 'CRISIS' && <CrisisCard onGoToTherapy={onGoToTherapy} />}
      </div>

      {/* User Avatar */}
      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm">
          U
        </div>
      )}
    </motion.div>
  );
}

/* ── Main ZenChat Component ────────────────────────────────── */
export default function ZenChat({ onNavigateToTherapy, me, onUpgradeClick }: { onNavigateToTherapy?: () => void, me?: any, onUpgradeClick?: () => void }) {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const [localCredits, setLocalCredits] = useState(me?.aiCreditsRemaining ?? 0);
  useEffect(() => { setLocalCredits(me?.aiCreditsRemaining ?? 0); }, [me?.aiCreditsRemaining]);

  // Session persistence
  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  // Mood check-in
  const [showMood, setShowMood]       = useState(false);
  const moodShownRef                  = useRef(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, loading]);

  const checkMoodAndPrompt = useCallback(async () => {
    if (moodShownRef.current) return;
    try {
      const { checkedIn } = await apiFetch<{ checkedIn: boolean }>('/zen-progress/mood/today');
      if (!checkedIn) { setShowMood(true); moodShownRef.current = true; }
    } catch { /* silent */ }
  }, []);

  const GREETING = "Hey, I'm Zeni 👋 I'm here for you — no judgment, just warm support and science-backed guidance. How is your heart and mind feeling today?";

  const loadSession = useCallback(async (id: string) => {
    try {
      const data = await apiFetch<{ messages: any[]; sessionId: string; title: string }>(`/zen-sessions/${id}/messages`);
      const restored: Message[] = data.messages.map((m: any) => ({
        id: uid(),
        role: m.role as 'user' | 'assistant',
        content: m.content,
        action: m.action || null,
      }));
      setMessages(restored.length ? restored : [{ role: 'assistant', id: uid(), content: GREETING }]);
      setSessionId(id);
      setInput('');
      setError(null);
    } catch { /* silent */ }
  }, [GREETING]);

  useEffect(() => {
    setMessages([{ role: 'assistant', id: uid(), content: GREETING }]);
  }, [GREETING]);

  const handleSend = useCallback(async (text: string) => {
    const t = text.trim(); 
    if (!t || loading) return;

    setInput(''); 
    setError(null);
    const userMsg: Message = { role: 'user', content: t, id: uid() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].slice(-14).map(({ role, content }) => ({ role, content }));
      const body: any = { messages: history };
      if (sessionId) body.sessionId = sessionId;

      const res = await apiFetch<{ reply: string; sessionId: string; creditsLeft?: number }>('/zen-chat', {
        method: 'POST',
        body: JSON.stringify(body),
        timeoutMs: 28000,
      });
      const { reply, sessionId: newSessionId, creditsLeft } = res;

      if (creditsLeft !== undefined && creditsLeft !== null) {
        setLocalCredits(creditsLeft);
      }

      if (newSessionId && !sessionId) {
        setSessionId(newSessionId);
        setSidebarRefresh(r => r + 1);
      }

      const { text: cleanText, action } = parseReply(reply);
      const botMsg: Message = { role: 'assistant', content: cleanText, id: uid(), action };
      setMessages(prev => [...prev, botMsg]);

      checkMoodAndPrompt();
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('timed out') || msg.includes('took too long')) {
        setError('Zeni is taking a moment to reflect. Please tap send again.');
      } else if (msg.includes('fetch') || msg.includes('connect') || msg.includes('Failed')) {
        setError('Could not reach Zeni. Please check your internet connection.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally { 
      setLoading(false); 
    }
  }, [messages, loading, sessionId, checkMoodAndPrompt]);

  const handleStoryYes    = useCallback(() => handleSend("Yes, please tell me the story"), [handleSend]);
  const handleStoryNo     = useCallback(() => handleSend("Not right now, thanks"), [handleSend]);
  const handleFeelingGood = useCallback(async () => {
    if (sessionId) {
      apiFetch(`/zen-sessions/${sessionId}/mood`, {
        method: 'PATCH',
        body: JSON.stringify({ score: 8 }),
      }).catch(() => {});
    }
    handleSend("Feeling good now, thank you!");
  }, [handleSend, sessionId]);
  const handleConnectReal = useCallback(() => handleSend("I'd like to connect to a real person"), [handleSend]);
  const handleGoToTherapy = useCallback(() => { if (onNavigateToTherapy) onNavigateToTherapy(); }, [onNavigateToTherapy]);

  const clearChat = () => {
    setInput(''); 
    setError(null);
    setSessionId(null);
    setMessages([{ role: 'assistant', id: uid(), content: GREETING }]);
    setSidebarRefresh(r => r + 1);
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden rounded-3xl bg-white dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 shadow-xl shadow-emerald-950/5">

      <AnimatePresence>
        {showMood && <MoodCheckIn onClose={() => setShowMood(false)} />}
      </AnimatePresence>

      {/* iOS Sidebar for Chat History */}
      <div className="relative flex-shrink-0 h-full">
        <ZenChatSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
          currentSessionId={sessionId}
          onSelectSession={loadSession}
          onNewChat={clearChat}
          refreshTrigger={sidebarRefresh}
        />
      </div>

      {/* Main iOS Chat Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-[#f8faf9]/70 dark:bg-[#121214] relative">
        
        {/* iOS Frosted Glass Top Navigation Bar */}
        <header className="flex-shrink-0 h-16 px-4 sm:px-6 flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition"
              title="Chat History"
            >
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#18181b] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                {/* Active pulsating badge */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#18181b]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Zeni AI Companion</h2>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Empathetic Emotional Support</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-black/[0.04] dark:border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Private & Secure</span>
            </div>

            <button
              onClick={clearChat}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
              title="Start New Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          
          {/* Messages */}
          {messages.map(msg => (
            <MessageBubble 
              key={msg.id} 
              msg={msg}
              onStoryYes={handleStoryYes}
              onStoryNo={handleStoryNo}
              onFeelingGood={handleFeelingGood}
              onConnectReal={handleConnectReal}
              onGoToTherapy={handleGoToTherapy}
            />
          ))}

          {/* iOS Typing Indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }} 
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#1c1c1e] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="px-4 py-3 rounded-[20px] rounded-tl-[4px] bg-[#f2f2f7] dark:bg-[#252528] border border-black/[0.04] dark:border-white/[0.08] shadow-sm flex items-center gap-1.5 h-10">
                  {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i} 
                      className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" 
                      animate={{ scale: [1, 1.35, 1], opacity: [0.4, 1, 0.4] }} 
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} 
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }} 
                className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 p-3.5 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between"
              >
                <span className="font-semibold">{error}</span>
                <button 
                  onClick={() => handleSend(messages[messages.length - 1]?.content || 'Hello')} 
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Starter Pills (When chat is young) */}
          {messages.length <= 1 && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="pt-4"
            >
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
                Suggested Prompts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_STARTERS.map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleSend(item.prompt)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#1a1a1c] hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700/50 shadow-xs transition-all text-left group active:scale-[0.98]"
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* iOS Floating Bottom Input Bar */}
        <div className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-white via-white/90 dark:from-[#121214] dark:via-[#121214]/90 to-transparent">
          <div className="relative flex items-center bg-white dark:bg-[#1c1c1f] rounded-full border border-slate-200 dark:border-white/12 shadow-lg shadow-emerald-950/5 p-1.5 pl-4 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
              placeholder="Message Zeni..."
              className="flex-1 bg-transparent border-0 focus:ring-0 px-1 py-2 text-[14px] outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button 
              onClick={() => handleSend(input)} 
              disabled={!input.trim() || loading} 
              className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center disabled:opacity-30 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Zeni provides supportive AI wellness guidance. In an emergency, call 14416 or 9152987821.
          </p>
        </div>

      </div>
    </div>
  );
}
