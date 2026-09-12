import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle, Settings, BookMarked, BarChart2,
  PanelLeftOpen, PanelLeftClose, Eye, EyeOff, LogOut, Menu, X, Stethoscope,
  Calendar, Clock, Trash2, CheckSquare, IndianRupee, Star, Save,
  Library, BookHeart, Users2, Target, Globe2, Dumbbell, Info, Upload, ShoppingBag,
  Search, SlidersHorizontal, Grid, HelpCircle, Bell
} from 'lucide-react';
import { apiFetch } from '../api/client';
import SidebarNav from './SidebarNav';
import ThemeToggle from './ThemeToggle';
import VideoRoom from './VideoRoom';
import CancellationPolicy from './CancellationPolicy';
import UserChat from './UserChat';
import ZenChat from './ZenChat';
import ZenProgressDashboard from './ZenProgressDashboard';
import CommunityWall from './CommunityWall';
import ResourceHub from './ResourceHub';
import MoodJournal from './MoodJournal';
import PeerCircles from './PeerCircles';
import WellnessGoalTracker from './WellnessGoalTracker';
import ReadingListsUser from './ReadingListsUser';
import WellnessProgramsUser from './WellnessProgramsUser';
import WellnessStore from './WellnessStore';
import NotificationCenter from './NotificationCenter';
import SessionPrepCard from './SessionPrepCard';
import PostSessionModal from './PostSessionModal';
import RequireTier from './RequireTier';
import FakePaymentModal from './FakePaymentModal';
import TherapyHub from './TherapyHub';

type DashboardProps = {
  onLogout: () => void;
  prefetchedMe?: any; // already fetched by App.tsx during startup verification
  initialTab?: TabKey;  // which tab to open right after login (default: 'progress')
};

type Me = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  avatar: { mime: string; data: string } | null;
  shareProgressWithTherapist?: boolean;
  subscriptionTier?: 'free' | 'silver' | 'gold' | 'platinum';
  aiCreditsRemaining?: number;
  freeTherapySessionsUsed?: number;
  freeTherapyQuota?: number;
};

type TabKey = 'aichat' | 'therapy' | 'settings' | 'sessions' | 'chat' | 'progress' | 'community' | 'resources' | 'journal' | 'circles' | 'goals' | 'reading' | 'programs' | 'store';

const TAB_ICONS: Record<TabKey, string> = {
  aichat: '', therapy: '🩺', settings: '️', sessions: '', chat: '',
  progress: '', community: '', resources: '', journal: '',
  circles: '', goals: '', reading: '', programs: '', store: '🛍️',
};

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'aichat',     label: 'AI Chat',           icon: <MessageCircle className="w-5 h-5 flex-shrink-0" /> },
  { key: 'therapy',    label: 'Therapy Hub',        icon: <Stethoscope   className="w-5 h-5 flex-shrink-0" /> },
  { key: 'resources',  label: 'Resources',          icon: <Library       className="w-5 h-5 flex-shrink-0" /> },
  { key: 'reading',    label: 'Reading Lists',      icon: <BookMarked    className="w-5 h-5 flex-shrink-0" /> },
  { key: 'programs',   label: 'Wellness Programs',  icon: <Dumbbell      className="w-5 h-5 flex-shrink-0" /> },
  { key: 'store',      label: 'Store',              icon: <ShoppingBag   className="w-5 h-5 flex-shrink-0" /> },
  { key: 'journal',    label: 'Mood Journal',       icon: <BookHeart     className="w-5 h-5 flex-shrink-0" /> },
  { key: 'circles',    label: 'Peer Circles',       icon: <Users2        className="w-5 h-5 flex-shrink-0" /> },
  { key: 'goals',      label: 'My Goals',           icon: <Target        className="w-5 h-5 flex-shrink-0" /> },
  { key: 'progress',   label: 'My Progress',        icon: <BarChart2     className="w-5 h-5 flex-shrink-0" /> },
  { key: 'community',  label: 'Community',          icon: <Globe2        className="w-5 h-5 flex-shrink-0" /> },
  { key: 'sessions',   label: 'My Sessions',        icon: <Calendar      className="w-5 h-5 flex-shrink-0" /> },
  { key: 'settings',   label: 'Settings',           icon: <Settings      className="w-5 h-5 flex-shrink-0" /> },
];

const getAvatarRingClass = (tier?: string) => {
  return 'ring-[1.5px] ring-[#0d5d3a]/20 dark:ring-white/20';
};

const getTierBadge = (tier?: string) => {
  return null;
};

export default function Dashboard({ onLogout, prefetchedMe, initialTab }: DashboardProps) {
  const [tab, setTab]         = useState<TabKey>(initialTab ?? 'progress');
  const [me, setMe]           = useState<Me | null>(prefetchedMe ?? null);
  const [loading, setLoading] = useState(!prefetchedMe);
  const [error, setError]     = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('zm_sidebar_collapsed');
    return saved === 'true';
  });
  // Persist collapse state
  useEffect(() => {
    localStorage.setItem('zm_sidebar_collapsed', String(collapsed));
  }, [collapsed]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatTherapist, setChatTherapist] = useState<any | null>(null);

  // ── Back-button navigation ──
  const [navStack, setNavStack]             = useState<TabKey[]>([]);
  const [programDetailOpen, setProgramDetailOpen] = useState(false);
  const [closeProgramSignal, setCloseProgramSignal] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Monetization
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<'silver' | 'gold' | 'platinum'>('gold');

  // Push initial history entry when dashboard mounts
  useEffect(() => { history.pushState({ zmDash: true }, ''); }, []);

  // Navigate to a new tab, pushing browser + internal history
  const navigateToTab = (newTab: TabKey) => {
    if (newTab === tab) { setMobileOpen(false); return; }
    history.pushState({ zmDash: true }, '');
    setNavStack(prev => [...prev, tab]);
    setTab(newTab);
    setMobileOpen(false);
  };

  // Back-button handler
  useEffect(() => {
    const handlePop = () => {
      if (programDetailOpen) {
        setCloseProgramSignal(c => c + 1);
        setProgramDetailOpen(false);
        return;
      }
      if (navStack.length > 0) {
        const prev = navStack[navStack.length - 1];
        setNavStack(s => s.slice(0, -1));
        setTab(prev);
        return;
      }
      // At root — show logout confirmation and push a state back so we keep the page
      history.pushState({ zmDash: true }, '');
      setShowLogoutConfirm(true);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [programDetailOpen, navStack]);

  useEffect(() => {
    // If prefetchedMe was already provided, skip the fetch
    if (prefetchedMe) { setMe(prefetchedMe); setLoading(false); return; }

    // Fallback: fetch /me (happens after AuthPage login without full page reload)
    let alive = true;
    setLoading(true);
    const fetchMe = (attempt = 0): Promise<Me> =>
      apiFetch<Me>('/me', { timeoutMs: 8000 }).catch((e) => {
        if (attempt === 0) return fetchMe(1);
        throw e;
      });
    fetchMe()
      .then((data) => { if (alive) { setMe(data); setError(null); } })
      .catch((e)  => { if (alive) setError(e.message || 'Failed to load profile'); })
      .finally(()  => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [prefetchedMe]); // re-run if App passes fresh data

  const avatarUrl = useMemo(() => {
    if (!me?.avatar?.data) return null;
    return `data:${me.avatar.mime};base64,${me.avatar.data}`;
  }, [me?.avatar?.data, me?.avatar?.mime]);

  const initials = me?.name
    ? me.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ZM';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#f4faf7] text-[#0a2617] font-sans">
      
      {/* ── GOOGLE WORKSPACE TOP HEADER BAR (GREEN, WHITE, GOLD) ── */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 bg-[#f4faf7] border-b border-[#0d5d3a]/15 z-20">
        
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setMobileOpen(m => !m);
              } else {
                setCollapsed(c => !c);
              }
            }}
            className="p-2.5 rounded-full hover:bg-[#e6f4ea] text-[#0d5d3a] transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigateToTab('progress')}>
            <img src="/logo.png" alt="ZenMind" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl tracking-tight text-[#0d5d3a]" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
              ZenMind
            </span>
            <span className="hidden sm:inline-block text-xs font-extrabold text-[#78350f] bg-[#fef3c7] border border-[#fde68a] px-2.5 py-0.5 rounded-full">
              Sanctuary
            </span>
          </div>
        </div>

        {/* Center: Google Search Pill */}
        <div className="flex-1 max-w-2xl px-4 hidden md:block">
          <div className="relative flex items-center w-full bg-white hover:bg-[#fef8ec] focus-within:bg-white border-2 border-[#0d5d3a]/15 focus-within:border-[#d97706] focus-within:ring-2 focus-within:ring-[#d97706]/20 rounded-full px-4 py-2 shadow-xs transition-all duration-200">
            <Search className="w-4 h-4 text-[#0d5d3a] mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search in ZenMind resources, therapy, goals, or community..."
              className="w-full bg-transparent text-sm text-[#0a2617] placeholder:text-[#0d5d3a]/50 font-medium focus:outline-none"
            />
            <button type="button" className="p-1 rounded-full hover:bg-[#fef3c7] text-[#d97706]">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* Google 9-Dots Grid Launcher */}
          <button
            type="button"
            onClick={() => navigateToTab('resources')}
            className="p-2.5 rounded-full hover:bg-[#e6f4ea] text-[#0d5d3a] transition-colors hidden sm:flex items-center justify-center"
            title="ZenMind Apps"
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* Help Icon */}
          <button
            type="button"
            onClick={() => navigateToTab('resources')}
            className="p-2.5 rounded-full hover:bg-[#e6f4ea] text-[#0d5d3a] transition-colors hidden sm:flex items-center justify-center"
            title="Help & Support"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => navigateToTab('settings')}
            className="p-2.5 rounded-full hover:bg-[#e6f4ea] text-[#0d5d3a] transition-colors hidden sm:flex items-center justify-center"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <NotificationCenter onNavigate={(t) => navigateToTab(t as TabKey)} />

          {/* User Profile Avatar Circle with Gold Border */}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => navigateToTab('settings')}
              className="flex items-center focus:outline-none"
              title={me?.name || 'Account'}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#d97706] shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#0d5d3a] text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-[#d97706]">
                  {initials}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── WORKSPACE BODY GRID ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed left-0 top-0 h-full w-64 z-40 md:hidden shadow-2xl flex flex-col bg-white border-r border-[#0d5d3a]/15"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#0d5d3a]/15">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="ZM" className="w-7 h-7 object-contain" />
                  <span className="font-bold text-lg text-[#0d5d3a]">ZenMind</span>
                </div>
                <button type="button" onClick={() => setMobileOpen(false)} className="p-1.5 rounded-full hover:bg-[#e6f4ea]">
                  <X className="w-5 h-5 text-[#0d5d3a]" />
                </button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto">
                <SidebarNav tab={tab} navigateToTab={navigateToTab} collapsed={collapsed} setCollapsed={setCollapsed} />
              </div>
              <div className="p-3 border-t border-[#0d5d3a]/15">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl px-4 py-2.5 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Left Google Sidebar */}
        <aside
          className="hidden md:flex flex-col flex-shrink-0 bg-[#f4faf7] p-3 transition-all duration-300 overflow-y-auto border-r border-[#0d5d3a]/10"
          style={{ width: collapsed ? 72 : 256 }}
        >
          <SidebarNav tab={tab} navigateToTab={navigateToTab} collapsed={collapsed} setCollapsed={setCollapsed} />
          
          <div className="mt-auto pt-2">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              title={collapsed ? "Sign out" : undefined}
              className={`flex items-center gap-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-full transition-all ${
                collapsed ? 'w-10 h-10 justify-center p-0 mx-auto' : 'w-full px-4 py-2.5'
              }`}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* ── GOOGLE MAIN CANVAS CONTAINER (PURE WHITE CARD CANVAS WITH GOLD & EMERALD ACCENTS) ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl border-2 border-[#0d5d3a]/15 shadow-sm overflow-hidden m-2 sm:m-3 transition-all duration-200">
          
          {/* Canvas Header */}
          <div className="px-5 py-3.5 border-b border-[#0d5d3a]/10 flex items-center justify-between flex-shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl leading-none">{TAB_ICONS[tab] || '🌿'}</span>
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold text-[#0d5d3a] truncate tracking-tight">
                  {tab === 'sessions'  ? 'My Sessions' :
                   tab === 'therapy'   ? 'Therapy Hub' :
                   tab === 'chat'      ? 'Chat' :
                   tab === 'aichat'    ? 'AI Chat' :
                   tab === 'progress'  ? 'My Progress' :
                   tab === 'community' ? 'Community' :
                   tab === 'resources' ? 'Resources' :
                   tab === 'reading'   ? 'Reading Lists' :
                   tab === 'journal'   ? 'Mood Journal' :
                   tab === 'circles'   ? 'Peer Circles' :
                   tab === 'goals'     ? 'My Goals' :
                   tab === 'programs'  ? 'Wellness Programs' :
                   tab === 'store'     ? 'Wellness Store' :
                   tab === 'settings'  ? 'Settings' :
                   loading ? 'Loading…' : `Welcome, ${me?.name?.split(' ')[0] || 'there'}!`}
                </h1>
                <p className="text-xs font-medium text-[#d97706] truncate hidden sm:block">
                  {tab === 'sessions'  ? 'Manage your therapy appointments' :
                   tab === 'therapy'   ? 'Connect with verified professionals' :
                   tab === 'chat'      ? 'Real-time messaging with your therapist' :
                   tab === 'aichat'    ? 'Your AI wellness companion' :
                   tab === 'progress'  ? 'Track your mood & wellness journey' :
                   tab === 'community' ? 'Real stories from real people' :
                   tab === 'resources' ? 'Curated wellness resources' :
                   tab === 'reading'   ? 'Therapist-curated books & articles' :
                   tab === 'journal'   ? 'Your private AI-powered diary' :
                   tab === 'circles'   ? 'Safe group spaces to share & support' :
                   tab === 'goals'     ? 'Build daily habits & streaks' :
                   tab === 'programs'  ? 'Science-backed day-by-day programs' :
                   tab === 'store'     ? 'Download free & premium wellness resources' :
                   tab === 'settings'  ? 'Manage your account & preferences' :
                   'Your personal wellness dashboard'}
                </p>
              </div>
            </div>
          </div>

          {/* Active Tab Panel Canvas */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white">
            <PostSessionModal />

          {tab === 'therapy' ? (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 px-4 sm:px-6 pt-4">
                  <SessionPrepCard />
                </div>
                <div className="flex-1 overflow-hidden">
                  <TherapyHub
                    onSessionBooked={() => setTab('sessions')}
                    onStartChat={(t) => { setChatTherapist(t); setTab('chat'); }}
                    userTier={me?.subscriptionTier || 'free'}
                  />
                </div>
            </div>
          ) : tab === 'sessions' ? (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 sm:px-6 pt-4">
                    <SessionPrepCard />
                  </div>
                  <MySessionsPanel />
                </div>
            </div>
          ) : tab === 'chat' && chatTherapist && me ? (
            <div className="flex-1 overflow-hidden">
              <UserChat therapist={chatTherapist} me={me} onBack={() => setTab('therapy')} />
            </div>
          ) : tab === 'aichat' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-4 sm:px-6 py-4">
              <ZenChat 
                onNavigateToTherapy={() => setTab('therapy')} 
                me={me}
                onUpgradeClick={() => { setUpgradeTarget('silver'); setShowPaymentModal(true); }}
              />
            </div>
          ) : tab === 'progress' ? (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <ZenProgressDashboard me={me} />
                </div>
            </div>
          ) : tab === 'community' ? (
            <div className="flex-1 overflow-hidden">
              <CommunityWall me={me} />
            </div>
          ) : tab === 'resources' ? (
            <div className="flex-1 overflow-hidden">
              <ResourceHub me={me} />
            </div>
          ) : tab === 'journal' ? (
            <div className="flex-1 overflow-hidden">
              <MoodJournal me={me} />
            </div>
          ) : tab === 'circles' ? (
            <div className="flex-1 overflow-hidden">
              <PeerCircles me={me} />
            </div>
          ) : tab === 'goals' ? (
            <div className="flex-1 overflow-hidden">
              <WellnessGoalTracker me={me} />
            </div>
          ) : tab === 'reading' ? (
            <div className="flex-1 overflow-hidden">
              <ReadingListsUser me={me} />
            </div>
          ) : tab === 'programs' ? (
            <div className="flex-1 overflow-hidden">
              <WellnessProgramsUser me={me} />
            </div>
          ) : tab === 'store' ? (
            <div className="flex-1 overflow-hidden">
              <WellnessStore me={me} />
            </div>
          ) : tab === 'settings' ? (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
                {error && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
                )}
                <SettingsPanel me={me} setMe={setMe} onLogout={onLogout} />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-center h-full text-[#0d5d3a] text-sm font-semibold">
                Page not found
              </div>
            </div>
          )}
          </div>
        </main>

        {/* ── GOOGLE WORKSPACE RIGHT COMPANION TOOLBAR (EMERALD & GOLD) ── */}
        <aside className="hidden lg:flex flex-col items-center gap-4 py-4 w-14 flex-shrink-0 bg-[#f4faf7] border-l border-[#0d5d3a]/15">
          <button
            type="button"
            onClick={() => navigateToTab('aichat')}
            className={`p-3 rounded-2xl transition-all duration-200 ${
              tab === 'aichat'
                ? 'bg-[#0d5d3a] text-white shadow-md border-r-2 border-[#d97706]'
                : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
            }`}
            title="Quick AI Assistant"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('journal')}
            className={`p-3 rounded-2xl transition-all duration-200 ${
              tab === 'journal'
                ? 'bg-[#d97706] text-white shadow-md'
                : 'text-[#d97706] hover:bg-[#fef3c7]'
            }`}
            title="Quick Mood Check"
          >
            <BookHeart className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('therapy')}
            className={`p-3 rounded-2xl transition-all duration-200 ${
              tab === 'therapy'
                ? 'bg-[#0d5d3a] text-white shadow-md border-r-2 border-[#d97706]'
                : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
            }`}
            title="Therapy Desk"
          >
            <Stethoscope className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('goals')}
            className={`p-3 rounded-2xl transition-all duration-200 ${
              tab === 'goals'
                ? 'bg-[#d97706] text-white shadow-md'
                : 'text-[#d97706] hover:bg-[#fef3c7]'
            }`}
            title="Goals & Habits"
          >
            <Target className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('progress')}
            className={`p-3 rounded-2xl transition-all duration-200 ${
              tab === 'progress'
                ? 'bg-[#0d5d3a] text-white shadow-md border-r-2 border-[#d97706]'
                : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
            }`}
            title="My Progress"
          >
            <BarChart2 className="w-5 h-5" />
          </button>
        </aside>
      </div>

      {/* ── Logout Confirmation Modal ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-[28px] shadow-2xl border-2 border-[#0d5d3a]/15 p-6 sm:p-8 max-w-sm w-full text-center relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Icon Header */}
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <LogOut className="w-6 h-6 stroke-[2.5]" />
              </div>

              <h2 className="text-xl font-extrabold text-[#0d5d3a] mb-2" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
                Sign out of ZenMind?
              </h2>
              <p className="text-gray-600 text-xs font-semibold leading-relaxed mb-6">
                Your progress is saved securely. You can sign back in anytime to continue your wellness journey.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  Yes, Sign Out
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-3 rounded-full bg-[#e6f4ea] hover:bg-[#d2ebd9] text-[#0d5d3a] font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Stay on ZenMind
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}

/* AI CHAT */
function AiChatPanel({ onNavigateToTherapy, me, onUpgradeClick }: { onNavigateToTherapy?: () => void, me: any, onUpgradeClick?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <ZenChat onNavigateToTherapy={onNavigateToTherapy} me={me} onUpgradeClick={onUpgradeClick} />
    </motion.div>
  );
}

/* ── SETTINGS (Profile + Security combined) ── */
function SettingsPanel({ me, setMe, onLogout }: { me: Me | null; setMe: (v: Me | null) => void; onLogout: () => void }) {
  /* ---- Profile state ---- */
  const [name, setName]   = useState(me?.name  || '');
  const [phone, setPhone] = useState(me?.phone || '');
  const [age, setAge]     = useState(String(me?.age ?? ''));
  const [gender, setGender] = useState(me?.gender || '');
  const [saving, setSaving]     = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);

  /* ---- Privacy state ---- */
  const [shareProgress, setShareProgress] = useState(me?.shareProgressWithTherapist ?? false);
  const [privacyBusy, setPrivacyBusy] = useState(false);

  useEffect(() => { 
    setName(me?.name||''); 
    setPhone(me?.phone||''); 
    setAge(me?.age!==undefined?String(me.age):''); 
    setGender(me?.gender||''); 
    setShareProgress(me?.shareProgressWithTherapist ?? false);
  }, [me]);

  const avatarUrl = me?.avatar?.data ? `data:${me.avatar.mime};base64,${me.avatar.data}` : null;
  const initials  = me?.name ? me.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'ZM';

  const handleAvatar = async (file: File) => {
    const base64 = await fileToBase64(file);
    const data = base64.split(',')[1] || '';
    await apiFetch('/me/avatar', { method: 'PUT', body: JSON.stringify({ mime: file.type, data }) });
    const refreshed = await apiFetch<Me>('/me');
    setMe(refreshed);
  };

  const saveProfile = async () => {
    setSaving(true); setProfileMsg(null);
    try {
      const updated = await apiFetch<Me>('/me', { method: 'PUT', body: JSON.stringify({ name, phone, age: Number(age), gender }) });
      setMe(updated); setProfileMsg({ text: 'Profile saved ', ok: true });
    } catch (e: any) { setProfileMsg({ text: e.message || 'Save failed', ok: false }); }
    finally { setSaving(false); }
  };

  const toggleShareProgress = async () => {
    const newVal = !shareProgress;
    setPrivacyBusy(true);
    try {
      await apiFetch('/me/share-progress', { method: 'PATCH', body: JSON.stringify({ shareProgressWithTherapist: newVal }) });
      setShareProgress(newVal);
      if (me) setMe({ ...me, shareProgressWithTherapist: newVal });
    } catch (e) {
      console.error('Failed to update privacy settings', e);
    } finally {
      setPrivacyBusy(false);
    }
  };

  /* ---- Password state ---- */
  const [pwMode, setPwMode]             = useState<'old'|'otp'>('old');
  const [oldPassword, setOldPassword]   = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPw, setConfirmPw]       = useState('');
  const [showOld, setShowOld]           = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [otpStep, setOtpStep]           = useState<'send'|'verify'|'reset'>('send');
  const [otpCode, setOtpCode]           = useState('');
  const [otpNew, setOtpNew]             = useState('');
  const [otpConfirm, setOtpConfirm]     = useState('');
  const [showOtpNew, setShowOtpNew]     = useState(false);
  const [showOtpConfirm, setShowOtpConfirm] = useState(false);
  const [otpSecs, setOtpSecs]           = useState(0);
  const [pwBusy, setPwBusy]             = useState(false);
  const [pwMsg, setPwMsg]               = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (otpSecs <= 0) return;
    const t = setInterval(() => setOtpSecs(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(t);
  }, [otpSecs]);

  const resetOtp = () => { setOtpStep('send'); setOtpCode(''); setOtpNew(''); setOtpConfirm(''); setOtpSecs(0); };

  const updateWithOld = async () => {
    if (newPassword !== confirmPw)  { setPwMsg({ text: 'Passwords do not match', ok: false }); return; }
    if (newPassword.length < 6)     { setPwMsg({ text: 'Min. 6 characters', ok: false }); return; }
    setPwBusy(true); setPwMsg(null);
    try {
      await apiFetch('/auth/update-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) });
      setOldPassword(''); setNewPassword(''); setConfirmPw('');
      setPwMsg({ text: 'Password updated ', ok: true });
    } catch (e: any) { setPwMsg({ text: e.message||'Update failed', ok: false }); }
    finally { setPwBusy(false); }
  };

  const sendOtp = async () => {
    setPwBusy(true); setPwMsg(null);
    try {
      /* /auth/send-otp is authenticated â€” fetches email from DB via JWT */
      await apiFetch('/auth/send-otp', { method: 'POST', body: '{}' });
      setOtpSecs(120); setOtpStep('verify');
      setPwMsg({ text: 'OTP sent to your registered email ', ok: true });
    } catch (e: any) { setPwMsg({ text: e.message||'Failed to send OTP', ok: false }); }
    finally { setPwBusy(false); }
  };

  const verifyOtp = async () => {
    if (otpCode.length !== 6) { setPwMsg({ text: 'Enter 6-digit code', ok: false }); return; }
    setPwBusy(true); setPwMsg(null);
    try {
      await apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone: me?.phone, code: otpCode }) });
      setOtpStep('reset'); setPwMsg({ text: 'Code verified ', ok: true });
    } catch (e: any) { setPwMsg({ text: e.message||'Invalid code', ok: false }); }
    finally { setPwBusy(false); }
  };

  const resetWithOtp = async () => {
    if (otpNew !== otpConfirm) { setPwMsg({ text: 'Passwords do not match', ok: false }); return; }
    if (otpNew.length < 6)     { setPwMsg({ text: 'Min. 6 characters', ok: false }); return; }
    setPwBusy(true); setPwMsg(null);
    try {
      await apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ phone: me?.phone, code: otpCode, newPassword: otpNew }) });
      resetOtp(); setPwMsg({ text: 'Password reset ', ok: true });
    } catch (e: any) { setPwMsg({ text: e.message||'Reset failed', ok: false }); }
    finally { setPwBusy(false); }
  };

  /* ---- Delete Account state ---- */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== me?.email && deleteConfirmText.trim() !== me?.phone) {
      setDeleteMsg({ text: 'Email or phone does not match.', ok: false });
      return;
    }
    setDeleteBusy(true); setDeleteMsg(null);
    try {
      await apiFetch('/me', { method: 'DELETE' });
      onLogout(); // Log the user out immediately since account is gone
    } catch (e: any) {
      setDeleteMsg({ text: e.message || 'Failed to delete account', ok: false });
      setDeleteBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

      {/* ── PROFILE SECTION ── */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-[#0a2617] text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Profile</h2>
            <p className="text-sm text-[#4a7c5d]">Update your personal details and photo.</p>
          </div>
          {profileMsg && <div className={`text-sm font-semibold ${profileMsg.ok ? 'text-[#0d5d3a]' : 'text-red-600'}`}>{profileMsg.text}</div>}
        </div>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-4 mb-6">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#0d5d3a]/15 dark:ring-white/10" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xl font-bold">{initials}</div>
        )}
        <div>
          <div className="text-sm font-semibold text-[#0a2617] dark:text-gray-100">Profile Photo</div>
          <div className="text-xs text-[#4a7c5d] dark:text-gray-400 mb-2">PNG/JPG recommended</div>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 text-[#0d5d3a] dark:text-gray-300 text-sm font-semibold cursor-pointer hover:bg-[#f0fbf4] dark:hover:bg-[#222222] transition">
            <Upload className="w-3.5 h-3.5" /> Upload
            <input type="file" accept="image/*" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) handleAvatar(f).catch(()=>{}); }} />
          </label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mb-6">
        <Field label="Name"  value={name}  onChange={setName}  placeholder="Your name" />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 ..." />
        <Field label="Email (read-only)" value={me?.email||''} onChange={()=>{}} placeholder="" disabled />
        <Field label="Age"   value={age}   onChange={setAge}   placeholder="e.g. 16" />
        <label className="block">
          <div className="text-xs font-semibold text-[#0a2617] dark:text-gray-300">Gender</div>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-[#0d5d3a]/12 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] px-4 py-3 text-sm outline-none text-[#0a2617] dark:text-white focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/50"
          >
            <option value="" disabled>Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <button type="button" onClick={saveProfile} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 disabled:opacity-60 hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#0d5d3a]/10 my-8" />

      {/* PRIVACY SECTION */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#0a2617] dark:text-gray-100 text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Privacy & Sharing</h2>
            <p className="text-sm text-[#4a7c5d] dark:text-gray-400">Control who sees your wellness data.</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111] border border-[#0d5d3a]/15 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-[#0a2617] dark:text-gray-100">Share Progress with Therapist</div>
            <div className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1 max-w-sm">
              Allow your assigned therapist to view your mood trends, goal streaks, and wellness program progress. This helps them prepare better for your sessions.
            </div>
          </div>
          <button 
            type="button" 
            onClick={toggleShareProgress} 
            disabled={privacyBusy}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${shareProgress ? 'bg-[#0d5d3a]' : 'bg-gray-200 dark:bg-gray-700'} ${privacyBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${shareProgress ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#0d5d3a]/10 my-8" />

      {/* SECURITY SECTION */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#0a2617] dark:text-gray-100 text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Security</h2>
            <p className="text-sm text-[#4a7c5d] dark:text-gray-400">Change your password using your current password or via OTP sent to your email.</p>
          </div>
          {pwMsg && <div className={`text-sm font-semibold max-w-xs text-right ${pwMsg.ok ? 'text-[#0d5d3a] dark:text-[#10b981]' : 'text-red-600 dark:text-red-400'}`}>{pwMsg.text}</div>}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-2xl bg-[#eaf6ee] dark:bg-[#1a1a1a] p-1 max-w-xs mb-6 border border-transparent dark:border-white/10">
        {(['old','otp'] as const).map(m => (
          <button key={m} type="button" onClick={() => { setPwMode(m); setPwMsg(null); resetOtp(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${pwMode===m ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white' : 'text-[#0d5d3a] dark:text-gray-400 hover:text-white hover:bg-white/5'}`}>
            {m==='old' ? 'Old password' : 'Via OTP'}
          </button>
        ))}
      </div>

      {pwMode === 'old' ? (
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="sm:col-span-2">
            <PwField label="Current password" value={oldPassword} onChange={setOldPassword} show={showOld} onToggle={() => setShowOld(s=>!s)} placeholder="Enter current password" />
          </div>
          <PwField label="New password"     value={newPassword} onChange={setNewPassword} show={showNew}     onToggle={() => setShowNew(s=>!s)}     placeholder="Min. 6 characters" />
          <PwField label="Confirm password" value={confirmPw}   onChange={setConfirmPw}   show={showConfirm} onToggle={() => setShowConfirm(s=>!s)} placeholder="Repeat new password" />
          <div className="sm:col-span-2">
            <button type="button" onClick={updateWithOld} disabled={pwBusy}
              className="px-5 py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition disabled:opacity-60">
              {pwBusy ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-xl space-y-3">
          {/* Step 1 */}
          <div className={`rounded-2xl border p-4 ${otpStep!=='send' ? 'bg-[#f4fbf6] border-[#0d5d3a]/20' : 'bg-white border-[#0d5d3a]/12'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#0a2617]">Step 1 — Send OTP to your email</div>
                <div className="text-xs text-[#4a7c5d] mt-0.5">
                  We'll send a 6-digit code to your registered email.
                  {otpSecs > 0 && <span className="ml-2 text-[#0d5d3a] font-semibold">Expires in {otpSecs}s</span>}
                </div>
              </div>
              <button type="button" onClick={sendOtp} disabled={pwBusy || otpSecs > 0}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#0d5d3a] text-white text-sm font-semibold hover:bg-[#0a4a2e] transition disabled:opacity-60">
                {otpSecs > 0 ? `Resend (${otpSecs}s)` : pwBusy && otpStep==='send' ? 'Sending…' : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          {(otpStep==='verify'||otpStep==='reset') && (
            <div className={`rounded-2xl border p-4 ${otpStep==='reset' ? 'bg-[#f4fbf6] border-[#0d5d3a]/20' : 'bg-white border-[#0d5d3a]/12'}`}>
              <div className="text-sm font-semibold text-[#0a2617] mb-3">Step 2 — Enter the code</div>
              <div className="flex gap-3 items-end">
                <div className="flex-1"><Field label="6-digit OTP" value={otpCode} onChange={setOtpCode} placeholder="e.g. 123456" disabled={otpStep==='reset'} /></div>
                {otpStep==='verify' && (
                  <button type="button" onClick={verifyOtp} disabled={pwBusy||otpCode.length!==6}
                    className="shrink-0 px-4 py-3 rounded-xl bg-[#0d5d3a] text-white text-sm font-semibold hover:bg-[#0a4a2e] transition disabled:opacity-60">
                    {pwBusy ? 'Checking…' : 'Verify OTP'}
                  </button>
                )}
                {otpStep==='reset' && <div className="shrink-0 px-3 py-2 rounded-xl bg-[#0d5d3a]/10 text-[#0d5d3a] text-xs font-semibold"> Verified</div>}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {otpStep==='reset' && (
            <div className="rounded-2xl border border-[#0d5d3a]/12 bg-white p-4">
              <div className="text-sm font-semibold text-[#0a2617] mb-3">Step 3 — Set new password</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <PwField label="New password"     value={otpNew}     onChange={setOtpNew}     show={showOtpNew}     onToggle={() => setShowOtpNew(s=>!s)}     placeholder="Min. 6 characters" />
                <PwField label="Confirm password" value={otpConfirm} onChange={setOtpConfirm} show={showOtpConfirm} onToggle={() => setShowOtpConfirm(s=>!s)} placeholder="Repeat new password" />
                <div className="sm:col-span-2">
                  <button type="button" onClick={resetWithOtp} disabled={pwBusy}
                    className="px-5 py-3 rounded-2xl bg-[#0d5d3a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition disabled:opacity-60">
                    {pwBusy ? 'Resetting…' : 'Reset Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#0d5d3a]/10 my-10" />

      {/* DANGER ZONE (Delete Account) */}
      <div className="mb-8 mt-10 border-t border-red-500/10 pt-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-red-600 dark:text-red-500 text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Danger Zone</h2>
            <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-red-50 dark:bg-[#1a0505] border border-red-200 dark:border-red-500/20 rounded-2xl p-5 max-w-xl">
            <h3 className="text-red-700 dark:text-red-400 font-bold mb-2">Are you absolutely sure?</h3>
            <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4">
              This action cannot be undone. This will permanently delete your personal information, settings, and all active sessions.
            </p>
            <label className="block mb-4">
              <div className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1.5 block">
                Please type your registered email or phone number to confirm:
              </div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={me?.email || me?.phone || ''}
                className="w-full bg-white dark:bg-[#111111] border border-red-300 dark:border-red-500/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 text-black dark:text-white transition-all text-sm"
              />
            </label>
            
            {deleteMsg && (
              <div className={`mb-4 text-sm font-semibold ${deleteMsg.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {deleteMsg.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteBusy || !deleteConfirmText.trim()}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleteBusy ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setDeleteMsg(null);
                }}
                disabled={deleteBusy}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-[#333333] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </motion.div>
  );
}

/* FIELD */
function Field({ label, value, onChange, placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-[#0a2617] dark:text-gray-300">{label}</div>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-[#0d5d3a]/12 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] px-4 py-3 text-sm outline-none text-[#0a2617] dark:text-white focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/50 disabled:opacity-60"
      />
    </label>
  );
}


/* PASSWORD FIELD WITH SHOW/HIDE */
function PwField({ label, value, onChange, show, onToggle, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-[#0a2617] dark:text-gray-300">{label}</div>
      <div className="mt-1.5 relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-[#0d5d3a]/12 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] px-4 pr-11 py-3 text-sm outline-none text-[#0a2617] dark:text-white focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/50"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] dark:text-gray-400 hover:text-[#0d5d3a] dark:hover:text-white transition">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </label>
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/* ── MY SESSIONS PANEL ── */
function MySessionsPanel() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionTab, setSessionTab] = useState<'upcoming'|'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPast, setSelectedPast] = useState<string[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null); // null = modal closed
  const [now, setNow] = useState(new Date());
  const [activeVideoSession, setActiveVideoSession] = useState<string | null>(null);
  
  const [cancelSessionId, setCancelSessionId] = useState<string | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelSession = async () => {
    if (!cancelSessionId) return;
    setCancelling(true);
    try {
      await apiFetch(`/sessions/${cancelSessionId}/cancel`, { method: 'POST' });
      setCancelSessionId(null);
      fetchSessions();
    } catch (e: any) {
      alert(e.message || 'Failed to cancel session');
    } finally {
      setCancelling(false);
    }
  };
  
  const [ratingSessionId, setRatingSessionId] = useState<string | null>(null);
  const [ratingVal, setRatingVal] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const submitRating = async () => {
    if (!ratingSessionId || ratingVal === 0) return;
    setSubmittingRating(true);
    try {
      await apiFetch(`/sessions/${ratingSessionId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating: ratingVal, review: reviewText })
      });
      setRatingSessionId(null);
      setRatingVal(0);
      setReviewText('');
      fetchSessions();
    } catch (e: any) {
      alert(e.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await apiFetch<any>('/sessions/me');
      if (res.ok) setSessions(res.sessions || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Opens the confirm modal for deleting specific ids (or current selection)
  const confirmDeletePast = (ids?: string[]) => {
    const toDelete = ids ?? selectedPast;
    if (toDelete.length === 0) return;
    setPendingDeleteIds(toDelete);
  };

  const handleDeletePast = async () => {
    if (!pendingDeleteIds || pendingDeleteIds.length === 0) return;
    try {
      await apiFetch('/sessions/past', {
        method: 'DELETE',
        body: JSON.stringify({ sessionIds: pendingDeleteIds })
      });
      setSelectedPast(prev => prev.filter(id => !pendingDeleteIds.includes(id)));
      setPendingDeleteIds(null);
      fetchSessions();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const todayStr = now.toDateString();

  const upcoming = sessions.filter(s => {
    const d = new Date(s.date);
    return d > now && d.toDateString() !== todayStr && s.status !== 'completed' && s.status !== 'cancelled';
  });

  const today = sessions.filter(s => {
    const d = new Date(s.date);
    return d.toDateString() === todayStr && s.status !== 'completed' && s.status !== 'cancelled';
  });

  const past = sessions.filter(s => {
    const d = new Date(s.date);
    return s.status === 'completed' || s.status === 'cancelled' || (d <= now && d.toDateString() !== todayStr);
  });

  const togglePastSelect = (id: string) => {
    setSelectedPast(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllPast = () => {
    if (selectedPast.length === past.length) setSelectedPast([]);
    else setSelectedPast(past.map(p => p._id));
  };

  const formatCountdown = (date: Date) => {
    const diff = date.getTime() - now.getTime();
    if (diff <= 0) return 'Starting now';
    
    // Only show hours/mins/secs if within 24 hours
    if (diff <= 24 * 60 * 60 * 1000) {
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `Starts in ${h}h ${m}m ${s}s`;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  const isJoinable = (date: Date) => {
    const diff = date.getTime() - now.getTime();
    // Joinable if it's within 2 minutes of starting (120,000 ms) and up to 1 hour after starting (-3600000 ms)
    return diff <= 2 * 60 * 1000 && diff >= -60 * 60 * 1000;
  };

  if (loading) return <div className="p-8 text-center text-[#4a7c5d] font-bold">Loading your sessions...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-20">

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, paddingBottom: 12, borderBottom: '2px solid var(--dash-border)' }}>
        <button onClick={() => setSessionTab('upcoming')}
          className={`zen-tab-pill ${sessionTab === 'upcoming' ? 'active' : ''}`}>
           Upcoming
        </button>
        <button onClick={() => setSessionTab('past')}
          className={`zen-tab-pill ${sessionTab === 'past' ? 'active' : ''}`}>
           Past Sessions
        </button>
      </div>

      {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}

      {sessionTab === 'upcoming' && (
        <>
          {/* TODAY */}
          {today.length > 0 && (
            <div className="mb-10">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#0a2617', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 2s infinite' }} /> Today's Sessions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {today.map(s => (
                  <div key={s._id} className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm p-5 flex flex-col">
                    <div className="mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md">
                         {formatCountdown(new Date(s.date))}
                      </span>
                      <h4 className="font-bold text-[#0a2617] dark:text-white mt-2 text-base">{s.therapistName}</h4>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-[#4a7c5d] dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2"><Clock size={12}/> {new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="flex items-center gap-2"><IndianRupee size={12}/> {s.amountPaid} Paid</div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button disabled={!isJoinable(new Date(s.date))} onClick={() => setActiveVideoSession(s._id)}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                          isJoinable(new Date(s.date))
                            ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white hover:bg-[#0a4a2e] shadow-md'
                            : 'bg-[#0d5d3a]/10 text-[#0d5d3a] opacity-60 cursor-not-allowed'
                        }`}>
                        {isJoinable(new Date(s.date)) ? 'Join Call' : 'Wait...'}
                      </button>
                      <button onClick={() => setCancelSessionId(s._id)}
                        className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition border border-red-100 dark:border-red-500/20">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPCOMING */}
          <div className="mb-10">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#0a2617', marginBottom: 14 }}>Upcoming Sessions</h3>
            {upcoming.length === 0 ? (
              <div style={{ background: 'rgba(13,93,58,0.04)', border: '1.5px solid rgba(13,93,58,0.12)', borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
                <Calendar style={{ width: 40, height: 40, color: 'rgba(13,93,58,0.25)', margin: '0 auto 10px' }} />
                <p style={{ color: '#4a7c5d', fontWeight: 500, fontSize: 13 }}>No upcoming sessions scheduled.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcoming.map(s => (
                  <div key={s._id} className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm p-5 flex flex-col">
                    <div className="mb-3">
                      <span className="text-[10px] font-bold bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] px-2.5 py-1 rounded-full">
                        {formatCountdown(new Date(s.date))}
                      </span>
                      <h4 className="font-bold text-[#0a2617] dark:text-white mt-2 text-base">{s.therapistName}</h4>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs text-[#4a7c5d] dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2"><Calendar size={12}/> {new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="flex items-center gap-2"><Clock size={12}/> {new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="flex items-center gap-2"><IndianRupee size={12}/> {s.amountPaid} Paid</div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button disabled={!isJoinable(new Date(s.date))} onClick={() => setActiveVideoSession(s._id)}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                          isJoinable(new Date(s.date))
                            ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white hover:bg-[#0a4a2e] shadow-md'
                            : 'bg-[#0d5d3a]/10 text-[#0d5d3a] opacity-60 cursor-not-allowed'
                        }`}>
                        {isJoinable(new Date(s.date)) ? 'Join Call' : 'Wait...'}
                      </button>
                      <button onClick={() => setCancelSessionId(s._id)}
                        className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition border border-red-100 dark:border-red-500/20">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {sessionTab === 'past' && (
      <div>
        {/* PAST */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#0a2617] dark:text-white flex items-center gap-2 text-lg">
            Past Sessions
          </h3>
          {past.length > 0 && (
            <div className="flex gap-2">
              <button onClick={selectAllPast} className="text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] bg-[#e6f4ea] dark:bg-[#1a8a5a]/20 px-3 py-1.5 rounded-lg hover:bg-[#cce8d5] dark:hover:bg-[#1a8a5a]/40 transition">
                {selectedPast.length === past.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedPast.length > 0 && (
                <button onClick={() => confirmDeletePast()} className="text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 transition flex items-center gap-1">
                  <Trash2 size={12} /> Delete ({selectedPast.length})
                </button>
              )}
            </div>
          )}
        </div>
        
        {past.length === 0 ? (
          <div className="bg-[#fbfdfb] dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-3xl p-8 text-center">
            <p className="text-gray-400 font-medium">No past sessions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {past.map(s => {
              const selected = selectedPast.includes(s._id);
              return (
                <div key={s._id}
                  className={`border rounded-3xl p-5 cursor-pointer transition-all ${selected ? 'bg-[#e6f4ea]/50 dark:bg-[#0d5d3a]/10 border-[#0d5d3a] dark:border-[#10b981]' : 'bg-white dark:bg-[#111111] border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}>
                  
                  <div className="flex justify-between items-start mb-3">
                    <h4 onClick={() => togglePastSelect(s._id)} className="font-bold text-[#0a2617] dark:text-white flex items-center gap-2 flex-1 cursor-pointer">
                      {s.therapistName}
                      {s.status === 'cancelled' && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded-md">
                          Cancelled
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDeletePast([s._id]); }}
                        className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center transition"
                        title="Delete this session"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div onClick={() => togglePastSelect(s._id)} className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${selected ? 'bg-[#0d5d3a] border-[#0d5d3a] text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                        {selected && <CheckSquare size={12} />}
                      </div>
                    </div>
                  </div>
                  
                  <div onClick={() => togglePastSelect(s._id)} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                    <Calendar size={12} /> {new Date(s.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div onClick={() => togglePastSelect(s._id)} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium">
                    <Clock size={12} /> {new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • ₹{s.amountPaid}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}
      {activeVideoSession && (
        <VideoRoom roomId={activeVideoSession} onLeave={async () => {
          try {
            await apiFetch(`/sessions/${activeVideoSession}/complete`, { method: 'POST' });
          } catch(e) {}
          setRatingSessionId(activeVideoSession);
          setActiveVideoSession(null);
          fetchSessions();
        }} />
      )}

      {/* DELETE PAST SESSIONS CONFIRM MODAL */}
      <AnimatePresence>
        {pendingDeleteIds !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="bg-white dark:bg-[#111111] rounded-3xl p-7 max-w-sm w-full shadow-2xl relative border border-red-200/60 dark:border-red-500/20"
            >
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <Trash2 size={30} className="text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-xl font-black text-center text-[#0a2617] dark:text-white mb-2"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Delete {pendingDeleteIds.length === 1 ? 'Session' : `${pendingDeleteIds.length} Sessions`}?
              </h3>

              {/* Body */}
              <p className="text-center text-[#4a7c5d] dark:text-gray-400 text-sm font-medium mb-2">
                This will permanently remove
                {pendingDeleteIds.length === 1
                  ? ' this session'
                  : ` these ${pendingDeleteIds.length} sessions`}{' '}
                from your history.
              </p>
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3 mb-6">
                <Star size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  The review you gave for{' '}
                  {pendingDeleteIds.length === 1 ? 'this session' : 'these sessions'}{' '}
                  will also be deleted permanently.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingDeleteIds(null)}
                  className="flex-1 py-3 rounded-xl bg-[#f4f4f4] dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[#0a2617] dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-white/5 transition"
                >
                  Keep It
                </button>
                <button
                  onClick={handleDeletePast}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-md"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RATING MODAL */}
      <AnimatePresence>
        {ratingSessionId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-[#0d5d3a]/10 dark:border-white/10">
              <button onClick={() => setRatingSessionId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star size={32} className="fill-current" />
                </div>
                <h3 className="text-2xl font-black text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Rate Your Session</h3>
                <p className="text-[#4a7c5d] dark:text-gray-400 text-sm font-medium">How was your session? Your feedback helps us improve.</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRatingVal(star)} className={`transition-all ${ratingVal >= star ? 'text-amber-400 scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-amber-400/50 hover:scale-110'}`}>
                    <Star size={36} className={ratingVal >= star ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <textarea
                  placeholder="Leave an optional review..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/10 dark:border-white/5 rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-sm resize-none h-24 text-gray-900 dark:text-white"
                />
              </div>

              <button
                disabled={ratingVal === 0 || submittingRating}
                onClick={submitRating}
                className="w-full py-3.5 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold hover:bg-[#0a4a2e] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANCEL MODAL */}
      <AnimatePresence>
        {cancelSessionId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-[#0d5d3a]/10 dark:border-white/10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Cancel Session?</h3>
                <p className="text-[#4a7c5d] dark:text-gray-400 text-sm font-medium mb-4">Are you sure you want to cancel this session?</p>
                
                <button 
                  onClick={() => setShowPolicy(true)}
                  className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <Info size={14} /> Read cancellation policy before cancelling
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  disabled={cancelling}
                  onClick={() => setCancelSessionId(null)} 
                  className="flex-1 py-3 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[#0a2617] dark:text-white rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition disabled:opacity-50"
                >
                  No, Keep it
                </button>
                <button
                  disabled={cancelling}
                  onClick={handleCancelSession}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-md disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPolicy && <CancellationPolicy onClose={() => setShowPolicy(false)} />}
      </AnimatePresence>

    </motion.div>
  );
}

