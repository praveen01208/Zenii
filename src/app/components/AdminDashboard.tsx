import React, { useEffect, useRef, useState } from 'react';

import { motion, AnimatePresence } from 'motion/react';

import { Settings, LogOut, Shield, CheckCircle, ChevronLeft, ChevronRight, Users, Search, Trash2, Clock, Activity, UserX, UserCheck, Menu, X, AlertTriangle, FileText, Plus, Edit2, Save, Stethoscope, LifeBuoy, Eye, Video, Music, Image as ImageIcon, Link2, Upload as UploadIcon, BookOpen, MessageSquare, Brain, ToggleLeft, ToggleRight, UserCircle, Briefcase, ShieldAlert, TrendingUp, TrendingDown, Minus, Bell, Send, RefreshCw, ShoppingBag, HelpCircle, Grid, SlidersHorizontal } from 'lucide-react';

import { apiFetch } from '../api/client';

import logo from '../../../asset/logo.png';

import ThemeToggle from './ThemeToggle';
import AdminSidebarNav from './AdminSidebarNav';

import TherapistsManagement from './TherapistsManagement';

import ReadingListsAdmin from './ReadingListsAdmin';

import WellnessProgramsAdmin from './WellnessProgramsAdmin';

import TeamManagement from './TeamManagement';

import JobsManagement from './JobsManagement';

import ApplicationsAdmin from './ApplicationsAdmin';

import TherapistInboxAdmin from './TherapistInboxAdmin';

import SessionInsightsWidget from './SessionInsightsWidget';

import AdminAnalytics from './AdminAnalytics';

import WellnessStoreAdmin from './WellnessStoreAdmin';
import AdminFAQManager from './AdminFAQManager';



type AdminDashboardProps = { onLogout: () => void };



export default function AdminDashboard({ onLogout }: AdminDashboardProps) {

  const [activeTab, setActiveTab] = useState<'users' | 'therapists' | 'content' | 'faqs' | 'support' | 'circles' | 'quiz' | 'flagged' | 'reading' | 'programs' | 'settings' | 'team' | 'jobs' | 'applications' | 'therapist_inbox' | 'crisis' | 'notifications' | 'session_insights' | 'analytics' | 'store'>('users');

  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
  const saved = localStorage.getItem('admin_sidebar_expanded');
  return saved ? saved === 'true' : true;
});

  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('Admin');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);



  useEffect(() => {
  apiFetch('/admin/me').then((res: any) => setAdminUsername(res.username)).catch(() => {});
}, []);

// Persist sidebar expanded state
useEffect(() => {
  localStorage.setItem('admin_sidebar_expanded', String(sidebarExpanded));
}, [sidebarExpanded]);


  const navTo = (tab: 'users' | 'therapists' | 'content' | 'faqs' | 'support' | 'circles' | 'quiz' | 'flagged' | 'reading' | 'programs' | 'settings' | 'team' | 'jobs' | 'applications' | 'therapist_inbox' | 'crisis' | 'notifications' | 'session_insights' | 'analytics' | 'store') => {

    setActiveTab(tab);

    setMobileOpen(false);
  };

  const SidebarContent = ({ mobile }: { mobile?: boolean }) => {
    const wide = mobile || sidebarExpanded;
    return (
      <>
        {/* Floating Google "+ Action" Button */}
        <div className="p-2 mb-1 flex justify-center">
          <button
            type="button"
            onClick={() => { setActiveTab('content'); if (mobile) setMobileOpen(false); }}
            className={`flex items-center transition-all duration-200 ${
              wide
                ? 'gap-3 px-5 py-3.5 w-full bg-white text-[#0d5d3a] hover:bg-[#fef8ec] shadow-md hover:shadow-lg border-2 border-[#d97706]/40 rounded-2xl'
                : 'w-11 h-11 justify-center bg-[#d97706] text-white hover:bg-[#b45309] shadow-md rounded-full p-0 mx-auto'
            }`}
            title="Create Content / Entry"
          >
            <div className={`${wide ? 'w-6 h-6 rounded-full bg-[#d97706] text-white flex items-center justify-center flex-shrink-0 shadow-xs' : 'flex items-center justify-center'}`}>
              <Plus className={`${wide ? 'w-4 h-4' : 'w-6 h-6'} stroke-[3]`} />
            </div>
            {wide && (
              <span className="font-bold text-sm tracking-wide text-[#0d5d3a]">
                Quick Action
              </span>
            )}
          </button>
        </div>

        {/* Navigation Items (Scrollbar Hidden for clean look) */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${wide ? 'px-3' : 'px-1'} py-1 flex flex-col gap-1 no-scrollbar bg-[#f4faf7]`}>
          <AdminSidebarNav
            tab={activeTab}
            navigateToTab={navTo}
            collapsed={!sidebarExpanded && !mobile}
            setCollapsed={(c) => setSidebarExpanded(!c)}
          />
        </div>

        {/* System Status Widget */}
        {wide && (
          <div className="mx-3 my-2 p-3 bg-gradient-to-br from-[#fef3c7] to-[#ffffff] rounded-2xl border-2 border-[#d97706]/30 flex flex-col gap-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#78350f]">Admin System</span>
              <span className="text-[10px] font-bold text-[#0d5d3a] bg-[#e6f4ea] px-2 py-0.5 rounded-full border border-[#0d5d3a]/20">
                Operational
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#92400e]">
              Super Admin Session
            </span>
          </div>
        )}

        <div className="p-2 border-t border-[#0d5d3a]/15 shrink-0 bg-[#f4faf7] flex justify-center">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex items-center transition-colors text-red-600 hover:bg-red-50 font-bold text-xs ${
              wide ? 'w-full gap-3 px-4 py-2.5 rounded-full' : 'w-10 h-10 rounded-full justify-center p-0 mx-auto'
            }`}
            title="Sign Out"
          >
            <LogOut size={16} className="shrink-0" />
            {wide && <span>Sign Out</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#f4faf7] text-[#0a2617] font-sans">

      {/* ── GOOGLE WORKSPACE TOP HEADER BAR ── */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 bg-[#f4faf7] border-b border-[#0d5d3a]/15 z-20">
        
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setMobileOpen(m => !m);
              } else {
                setSidebarExpanded(s => !s);
              }
            }}
            className="p-2.5 rounded-full hover:bg-[#e6f4ea] text-[#0d5d3a] transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setActiveTab('analytics')}>
            <img src={logo} alt="ZenMind" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl tracking-tight text-[#0d5d3a]" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
              ZenMind
            </span>
            <span className="hidden sm:inline-block text-xs font-extrabold text-[#78350f] bg-[#fef3c7] border border-[#fde68a] px-2.5 py-0.5 rounded-full">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Center: Google Search Pill */}
        <div className="flex-1 max-w-2xl px-4 hidden md:block">
          <div className="relative flex items-center w-full bg-white hover:bg-[#fef8ec] focus-within:bg-white border-2 border-[#0d5d3a]/15 focus-within:border-[#d97706] focus-within:ring-2 focus-within:ring-[#d97706]/20 rounded-full px-4 py-2 shadow-xs transition-all duration-200">
            <Search className="w-4 h-4 text-[#0d5d3a] mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search members, therapists, content, FAQs, support tickets, or settings..."
              className="w-full bg-transparent text-sm text-[#0a2617] placeholder:text-[#0d5d3a]/50 font-medium focus:outline-none"
            />
            <button type="button" className="p-1 rounded-full hover:bg-[#fef3c7] text-[#d97706]">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className="p-2.5 rounded-full hover:bg-[#e6f4ea] text-[#0d5d3a] transition-colors hidden sm:flex items-center justify-center"
            title="App Launcher"
          >
            <Grid className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className="p-2.5 rounded-full hover:bg-[#e6f4ea] text-[#0d5d3a] transition-colors hidden sm:flex items-center justify-center"
            title="Support Desk"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="p-2.5 rounded-full hover:bg-[#e6f4ea] text-[#0d5d3a] transition-colors hidden sm:flex items-center justify-center"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Super Admin Avatar Circle */}
          <div className="relative ml-1 flex items-center gap-2 bg-[#fef3c7] border border-[#fde68a] px-3 py-1 rounded-full shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-[#0d5d3a] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#d97706]">
              <Shield size={14} />
            </div>
            <div className="hidden sm:block text-xs">
              <span className="font-bold text-[#78350f] block leading-tight">{adminUsername}</span>
              <span className="text-[10px] text-[#92400e] block font-semibold leading-tight">Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── WORKSPACE BODY GRID ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
          )}
        </AnimatePresence>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-[#0d5d3a]/15 flex flex-col z-40 md:hidden overflow-y-auto">
              <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-[#0d5d3a]">
                <X size={18} />
              </button>
              <SidebarContent mobile />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop Left Google Sidebar */}
        <aside className="hidden md:flex flex-col flex-shrink-0 bg-[#f4faf7] p-3 transition-all duration-300 overflow-y-auto border-r border-[#0d5d3a]/10"
          style={{ width: sidebarExpanded ? 260 : 72 }}>
          <SidebarContent />
        </aside>

        {/* ── GOOGLE MAIN CANVAS CONTAINER (ROUNDED CARD CANVAS) ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl border-2 border-[#0d5d3a]/15 shadow-sm overflow-hidden m-2 sm:m-3 transition-all duration-200">
          
          {/* Canvas Header */}
          <div className="px-5 py-3.5 border-b border-[#0d5d3a]/10 flex items-center justify-between flex-shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl leading-none">🛡️</span>
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold text-[#0d5d3a] truncate tracking-tight">
                  {activeTab === 'analytics' ? 'Platform Analytics' : activeTab === 'users' ? 'Members Directory' : activeTab === 'therapists' ? 'Therapists Directory' : activeTab === 'content' ? 'Content Management' : activeTab === 'faqs' ? 'FAQs Management' : activeTab === 'circles' ? 'Peer Circles' : activeTab === 'flagged' ? 'Flagged Content' : activeTab === 'reading' ? 'Reading Lists' : activeTab === 'programs' ? 'Wellness Programs' : activeTab === 'store' ? 'Wellness Store' : activeTab === 'quiz' ? 'Quiz Questions' : activeTab === 'support' ? 'Support Tickets' : activeTab === 'team' ? 'Team Members' : activeTab === 'jobs' ? 'Job Postings' : activeTab === 'applications' ? 'Job Applications' : activeTab === 'therapist_inbox' ? 'Therapist Inbox' : activeTab === 'crisis' ? 'Crisis Monitor' : activeTab === 'notifications' ? 'Notification Center' : activeTab === 'session_insights' ? 'Session Insights' : 'Admin Settings'}
                </h1>
                <p className="text-xs font-semibold text-[#d97706] truncate hidden sm:block">
                  ZenMind Administration System
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto w-full max-w-7xl">
              {activeTab === 'analytics' && <AdminAnalytics />}
              {activeTab === 'users' && <UsersManagement />}
              {activeTab === 'therapists' && <TherapistsManagement />}
              {activeTab === 'content' && <ContentManagement />}
              {activeTab === 'faqs' && <AdminFAQManager />}
              {activeTab === 'circles' && <PeerCirclesManagement />}
              {activeTab === 'flagged' && <FlaggedContent />}
              {activeTab === 'reading' && <ReadingListsAdmin />}
              {activeTab === 'programs' && <WellnessProgramsAdmin />}
              {activeTab === 'store' && <WellnessStoreAdmin />}
              {activeTab === 'quiz' && <QuizManagement />}
              {activeTab === 'support' && <SupportManagement />}
              {activeTab === 'team' && <TeamManagement />}
              {activeTab === 'jobs' && <JobsManagement />}
              {activeTab === 'applications' && <ApplicationsAdmin />}
              {activeTab === 'therapist_inbox' && <TherapistInboxAdmin />}
              {activeTab === 'crisis' && <CrisisMonitorWidget />}
              {activeTab === 'notifications' && <NotificationBroadcastWidget />}
              {activeTab === 'session_insights' && <SessionInsightsWidget />}
              {activeTab === 'settings' && <AdminSettings onUpdateName={setAdminUsername} />}
            </div>
          </div>
        </main>

        {/* ── GOOGLE WORKSPACE RIGHT COMPANION TOOLBAR ── */}
        <aside className="hidden lg:flex flex-col items-center gap-4 py-4 w-16 flex-shrink-0 bg-[#f4faf7] border-l border-[#0d5d3a]/15">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-[#0d5d3a] text-white shadow-md border-r-2 border-[#d97706]'
                : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
            }`}
            title="Analytics"
          >
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-[#d97706] text-white shadow-md'
                : 'text-[#d97706] hover:bg-[#fef3c7]'
            }`}
            title="Members Directory"
          >
            <Users className="w-6 h-6 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('therapists')}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 ${
              activeTab === 'therapists'
                ? 'bg-[#0d5d3a] text-white shadow-md border-r-2 border-[#d97706]'
                : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
            }`}
            title="Therapists Directory"
          >
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 ${
              activeTab === 'content'
                ? 'bg-[#d97706] text-white shadow-md'
                : 'text-[#d97706] hover:bg-[#fef3c7]'
            }`}
            title="Content Management"
          >
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-[#0d5d3a] text-white shadow-md border-r-2 border-[#d97706]'
                : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
            }`}
            title="Admin Settings"
          >
            <Settings className="w-6 h-6 stroke-[2.2]" />
          </button>
        </aside>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
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
                Sign out of Admin Panel?
              </h2>
              <p className="text-gray-600 text-xs font-semibold leading-relaxed mb-6">
                Are you sure you want to securely sign out of your administration portal?
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
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>

  );

}



function NavItem({ icon: Icon, label, active, onClick, expanded }: any) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center ${expanded ? 'gap-2.5 px-3' : 'justify-center px-0'} py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${active ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}`}
      title={!expanded ? label : undefined}>
      <Icon size={18} className="shrink-0" />
      {expanded && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
    </button>
  );
}



/* ── Custom Google Material Confirm Modal ── */

function ConfirmModal({ open, title, message, confirmLabel, danger, onConfirm, onCancel, busy }: {
  open: boolean; title: string; message: string; confirmLabel: string;
  danger?: boolean; onConfirm: () => void; onCancel: () => void; busy?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="bg-white rounded-[28px] shadow-2xl border-2 border-[#0d5d3a]/15 w-full max-w-md p-6 sm:p-8 text-center relative overflow-hidden"
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs ${danger ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-[#fef3c7] border border-[#fde68a] text-[#d97706]'}`}>
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        </div>

        <h3 className="font-extrabold text-[#0d5d3a] text-lg sm:text-xl mb-2" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
          {title}
        </h3>
        <p className="text-xs font-semibold text-gray-600 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 py-3 rounded-full bg-[#e6f4ea] hover:bg-[#d2ebd9] text-[#0d5d3a] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 py-3 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0d5d3a] hover:bg-[#084229]'}`}
          >
            {busy ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}



function AdminSettings({ onUpdateName }: { onUpdateName: (n: string) => void }) {

  const [username, setUsername] = useState('');

  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);

  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);



  const handleUpdate = async (e: React.FormEvent) => {

    e.preventDefault(); setBusy(true); setMsg(null);

    try {

      const body: any = {};

      if (username.trim()) body.username = username.trim();

      if (password.trim()) body.password = password.trim();

      if (Object.keys(body).length === 0) { setMsg({ text: 'No changes made.', ok: false }); return; }

      await apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(body) });

      if (body.username) onUpdateName(body.username);

      setMsg({ text: 'Settings updated successfully.', ok: true });

      setUsername(''); setPassword('');

    } catch (err: any) { setMsg({ text: err.message || 'Failed to update', ok: false }); }

    finally { setBusy(false); }

  };



  return (

    <div className="max-w-md">

      <h2 className="text-xl font-bold text-[#0a2617] dark:text-gray-100 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Update Credentials</h2>

      <p className="text-[#4a7c5d] dark:text-gray-400 text-sm mb-8">Change your admin username or password. Leave a field blank to keep it unchanged.</p>

      <form onSubmit={handleUpdate} className="space-y-5">

        <label className="block">

          <span className="text-sm font-semibold text-[#0a2617] dark:text-gray-300 mb-1.5 block">New Username</span>

          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter new username"

            className="w-full bg-white dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 transition-all text-sm shadow-sm text-[#0a2617] dark:text-white" />

        </label>

        <label className="block">

          <span className="text-sm font-semibold text-[#0a2617] dark:text-gray-300 mb-1.5 block">New Password</span>

          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"

            className="w-full bg-white dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 transition-all text-sm shadow-sm text-[#0a2617] dark:text-white" />

        </label>

        {msg && (

          <div className={`flex items-center gap-2 text-sm font-semibold p-3 rounded-xl ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] border border-green-200 dark:border-[#10b981]/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>

            {msg.ok && <CheckCircle size={16} />}{msg.text}

          </div>

        )}

        <button type="submit" disabled={busy || (!username.trim() && !password.trim())}

          className="w-full py-3 mt-4 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] disabled:opacity-50 transition-all">

          {busy ? 'Updating...' : 'Save Changes'}

        </button>

      </form>

    </div>

  );

}



type UserData = { _id: string; name: string; email: string; phone: string; age: number; gender: string; isSuspended: boolean; createdAt: string; };



function UsersManagement() {

  const [users, setUsers] = useState<UserData[]>([]);

  const [stats, setStats] = useState({ total: 0, suspended: 0, today: 0, active: 0 });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [genderFilter, setGenderFilter] = useState('all');

  const [ageFilter, setAgeFilter] = useState('all');

  const [time, setTime] = useState(new Date());



  // Confirm modal state

  const [confirm, setConfirm] = useState<{

    open: boolean; type: 'suspend' | 'delete' | null;

    userId: string; userName: string; currentlySuspended: boolean; busy: boolean;

  }>({ open: false, type: null, userId: '', userName: '', currentlySuspended: false, busy: false });



  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);



  const loadUsers = async () => {

    try {

      setError(null);

      const res = await apiFetch<any>('/admin/users');

      setUsers(res.users); setStats(res.stats);

    } catch (e: any) { 

      console.error('Failed to load users', e); 

      setError(e.message || 'Failed to load directory');

    }

    finally { setLoading(false); }

  };



  useEffect(() => { loadUsers(); }, []);



  const openSuspendConfirm = (u: UserData) =>

    setConfirm({ open: true, type: 'suspend', userId: u._id, userName: u.name, currentlySuspended: u.isSuspended, busy: false });



  const openDeleteConfirm = (u: UserData) =>

    setConfirm({ open: true, type: 'delete', userId: u._id, userName: u.name, currentlySuspended: u.isSuspended, busy: false });



  const closeConfirm = () => setConfirm(c => ({ ...c, open: false, busy: false }));



  const handleConfirmAction = async () => {

    setConfirm(c => ({ ...c, busy: true }));

    try {

      if (confirm.type === 'suspend') {

        const res = await apiFetch<any>(`/admin/users/${confirm.userId}/suspend`, { method: 'PUT' });

        setUsers(prev => prev.map(u => u._id === confirm.userId ? { ...u, isSuspended: res.isSuspended } : u));

        await loadUsers();

      } else if (confirm.type === 'delete') {

        await apiFetch(`/admin/users/${confirm.userId}`, { method: 'DELETE' });

        setUsers(prev => prev.filter(u => u._id !== confirm.userId));

        await loadUsers();

      }

      closeConfirm();

    } catch (e: any) {

      setConfirm(c => ({ ...c, busy: false }));

    }

  };



  const filteredUsers = users.filter(u => {

    const q = search.toLowerCase();

    const matchSearch = (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').includes(q);

    const matchGender = genderFilter === 'all' || u.gender === genderFilter;

    let matchAge = true;

    if (ageFilter === 'under18') matchAge = u.age < 18;

    else if (ageFilter === '18-25') matchAge = u.age >= 18 && u.age <= 25;

    else if (ageFilter === 'over25') matchAge = u.age > 25;

    return matchSearch && matchGender && matchAge;

  });



  if (loading) return <div className="text-center py-20 text-[#4a7c5d] font-bold">Loading members directory...</div>;



  return (

    <>

      <ConfirmModal

        open={confirm.open}

        title={confirm.type === 'suspend' ? (confirm.currentlySuspended ? 'Activate User?' : 'Suspend User?') : 'Delete User?'}

        message={confirm.type === 'suspend'

          ? (confirm.currentlySuspended

              ? `This will restore ${confirm.userName}'s access to the platform.`

              : `${confirm.userName} will be blocked from logging in immediately.`)

          : `This will permanently delete ${confirm.userName}'s account. This cannot be undone.`}

        confirmLabel={confirm.type === 'suspend' ? (confirm.currentlySuspended ? 'Yes, Activate' : 'Yes, Suspend') : 'Yes, Delete'}

        danger={confirm.type === 'delete'}

        onConfirm={handleConfirmAction}

        onCancel={closeConfirm}

        busy={confirm.busy}

      />



      <div className="flex flex-col gap-5">

        {error && (

          <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-4 py-3 text-sm font-semibold">

            Error: {error}

          </div>

        )}

        {/* Stats */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white dark:bg-[#111111] rounded-3xl p-5 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">

            <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-2"><Users size={14} /> Total Members</div>

            <div className="text-3xl font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>{stats.total}</div>

            <div className="text-xs text-[#0d5d3a] dark:text-[#10b981] mt-1 font-semibold">{stats.active} active • {stats.suspended} suspended</div>

          </div>

          <div className="bg-[#0d5d3a] dark:bg-[#1a8a5a] rounded-3xl p-5 text-white shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 relative overflow-hidden">

            <div className="absolute top-0 right-0 p-3 opacity-20"><Activity size={56} /></div>

            <div className="flex items-center gap-2 font-bold text-xs text-[#c8e6c9] dark:text-green-100 uppercase tracking-wider mb-2 relative z-10"><UserCheck size={14} /> Today's Members</div>

            <div className="text-3xl font-black relative z-10" style={{ fontFamily: 'Syne, sans-serif' }}>+{stats.today}</div>

            <div className="text-xs text-[#c8e6c9] dark:text-green-100 mt-1 font-semibold relative z-10">New signups today</div>

          </div>

          <div className="bg-white dark:bg-[#111111] rounded-3xl p-5 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">

            <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-2"><Clock size={14} /> Real-Time Clock</div>

            <div className="text-2xl font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>{time.toLocaleTimeString()}</div>

            <div className="text-xs text-[#0d5d3a] dark:text-[#10b981] mt-1 font-semibold">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>

          </div>

        </div>



        {/* Toolbar */}

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-[#111111] p-4 rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">

          <div className="relative w-full sm:w-80">

            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] dark:text-gray-400" />

            <input type="text" placeholder="Search name, email, or mobile..." value={search} onChange={e => setSearch(e.target.value)}

              className="w-full pl-9 pr-4 py-2.5 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 text-sm font-medium text-[#0a2617] dark:text-white" />

          </div>

          <div className="flex w-full sm:w-auto gap-3">

            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}

              className="flex-1 sm:flex-none px-3 py-2.5 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 text-sm font-medium text-[#0a2617] dark:text-white cursor-pointer">

              <option value="all">All Genders</option>

              <option value="male">Male</option>

              <option value="female">Female</option>

              <option value="other">Other</option>

            </select>

            <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)}

              className="flex-1 sm:flex-none px-3 py-2.5 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 text-sm font-medium text-[#0a2617] dark:text-white cursor-pointer">

              <option value="all">All Ages</option>

              <option value="under18">Under 18</option>

              <option value="18-25">18 – 25</option>

              <option value="over25">Over 25</option>

            </select>

          </div>

        </div>



        {/* Directory */}

        <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden">

          <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider">

            <div className="col-span-6 sm:col-span-4">Member</div>

            <div className="hidden sm:block col-span-3">Demographics</div>

            <div className="col-span-3 sm:col-span-3 text-center sm:text-left">Status</div>

            <div className="col-span-3 sm:col-span-2 text-right">Actions</div>

          </div>

          <div className="overflow-y-auto max-h-[480px] divide-y divide-[#0d5d3a]/5 dark:divide-white/5">

            {filteredUsers.length === 0 ? (

              <div className="text-center py-16 text-[#4a7c5d] dark:text-gray-400 font-semibold">No members found matching your filters.</div>

            ) : filteredUsers.map(u => (

              <div key={u._id} className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-4 items-center hover:bg-[#fbfdfb] dark:hover:bg-[#1a1a1a] transition-colors">

                <div className="col-span-6 sm:col-span-4 flex items-center gap-2 overflow-hidden">

                  <div className="w-9 h-9 rounded-full bg-[#e8f3ec] dark:bg-[#10b981]/20 flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm flex-shrink-0">

                    {(u.name || 'U').substring(0, 2).toUpperCase()}

                  </div>

                  <div className="truncate">

                    <div className="font-bold text-[#0a2617] dark:text-gray-100 text-sm truncate">{u.name || 'Unknown Member'}</div>

                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{u.email || 'No email'}</div>

                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{u.phone || 'No phone'}</div>

                  </div>

                </div>

                <div className="hidden sm:flex col-span-3 flex-col justify-center">

                  <div className="font-bold text-[#0a2617] dark:text-gray-100 text-sm capitalize">{u.gender || 'Unknown'}</div>

                  <div className="text-xs text-[#4a7c5d] dark:text-gray-400">Age: {u.age}</div>

                </div>

                <div className="col-span-3 flex justify-center sm:justify-start items-center">

                  {u.isSuspended ? (

                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">

                      <UserX size={11} /> <span className="hidden sm:inline">Suspended</span>

                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">

                      <UserCheck size={11} /> <span className="hidden sm:inline">Active</span>

                    </span>

                  )}

                </div>

                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1.5">

                  <button onClick={() => openSuspendConfirm(u)}

                    className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.isSuspended ? 'bg-[#0d5d3a]/10 text-[#0d5d3a] hover:bg-[#0d5d3a]/20' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>

                    {u.isSuspended ? 'Activate' : 'Suspend'}

                  </button>

                  <button onClick={() => openDeleteConfirm(u)}

                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">

                    <Trash2 size={15} />

                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </>

  );

}



/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   CRISIS MONITOR WIDGET

   Shows anonymized crisis event statistics — no user PII.

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function CrisisMonitorWidget() {

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    apiFetch<any>('/admin/analytics/crisis')

      .then(d => { setData(d); setLoading(false); })

      .catch(e => { setError(e.message || 'Failed to load crisis data'); setLoading(false); });

  }, []);



  const CAT: Record<string, { label: string; color: string; desc: string }> = {

    suicide_ideation: { label: 'Suicide Ideation',  color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',      desc: 'User message contained direct language about ending their life or suicidal thoughts.' },

    self_harm:        { label: 'Self-Harm',          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', desc: 'User message referenced self-harm or deliberate injury to themselves.' },

    severe_distress:  { label: 'Severe Distress',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',  desc: 'User message expressed hopelessness, giving up, or severe emotional distress.' },

    hindi_crisis:     { label: 'Hindi Keywords',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', desc: 'Crisis keywords detected in Hindi / Romanized Hindi language.' },

  };



  if (loading) return (

    <div className="flex items-center justify-center py-24">

      <div className="flex flex-col items-center gap-3">

        <div className="w-10 h-10 rounded-full border-4 border-[#0d5d3a]/20 border-t-[#0d5d3a] animate-spin" />

        <p className="text-sm font-semibold text-[#4a7c5d]">Loading crisis analytics...</p>

      </div>

    </div>

  );



  if (error) return (

    <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 p-6 text-red-700 dark:text-red-400 font-semibold">

      {error}

    </div>

  );



  const maxCount = Math.max(1, ...(data?.recentWeeks?.map((w: any) => w.count) || [1]));

  const weekCount = data?.recentWeeks?.length ?? 0;



  return (

    <div className="flex flex-col gap-6">



      {/* Privacy Notice */}

      <div className="flex items-start gap-3 bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 border border-[#0d5d3a]/20 dark:border-[#0d5d3a]/30 rounded-2xl px-5 py-4">

        <Shield size={18} className="text-[#0d5d3a] dark:text-[#10b981] mt-0.5 flex-shrink-0" />

        <div>

          <p className="text-sm font-bold text-[#0a2617] dark:text-gray-100">Fully Anonymized — Privacy Protected</p>

          <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-0.5">

            User IDs are stored as one-way SHA-256 hashes. No message content, names, or identifiable information is ever logged. This page shows counts only.

          </p>

        </div>

      </div>



      {/* KPI row */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">

          <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-3">

            <AlertTriangle size={14} /> This Week

          </div>

          <div className="text-4xl font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne,sans-serif' }}>

            {data?.thisCount ?? 0}

          </div>

          <div className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1 font-medium">{data?.thisWeek} — crisis events</div>

        </div>



        <div className={`rounded-3xl p-6 shadow-sm relative overflow-hidden ${

          data?.trend === 'up'   ? 'bg-red-500 text-white' :

          data?.trend === 'down' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white' :

          'bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10'

        }`}>

          <div className="absolute top-0 right-0 p-4 opacity-10">

            {data?.trend === 'up' ? <TrendingUp size={56} /> : data?.trend === 'down' ? <TrendingDown size={56} /> : <Minus size={56} />}

          </div>

          <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-3 relative z-10 ${data?.trend === 'same' ? 'text-[#4a7c5d] dark:text-gray-400' : 'text-white/80'}`}>

            {data?.trend === 'up' ? <TrendingUp size={14} /> : data?.trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />} Trend vs Last Week

          </div>

          <div className={`text-3xl font-black relative z-10 ${data?.trend === 'same' ? 'text-[#0a2617] dark:text-gray-100' : ''}`} style={{ fontFamily: 'Syne,sans-serif' }}>

            {data?.trend === 'up' ? '▲ More' : data?.trend === 'down' ? '▼ Fewer' : '— Same'}

          </div>

          <div className={`text-xs mt-1 font-medium relative z-10 ${data?.trend === 'same' ? 'text-[#4a7c5d] dark:text-gray-400' : 'text-white/70'}`}>

            Last week: {data?.lastCount ?? 0} events

          </div>

        </div>



        <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">

          <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-3">

            <Activity size={14} /> This Week by Type

          </div>

          {data?.byCategory && Object.keys(data.byCategory).length > 0 ? (

            <div className="flex flex-col gap-1.5">

              {Object.entries(data.byCategory).map(([cat, count]: any) => (

                <div key={cat} className="flex items-center justify-between gap-2">

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT[cat]?.color || 'bg-gray-100 text-gray-600'}`}>

                    {CAT[cat]?.label || cat}

                  </span>

                  <span className="text-sm font-black text-[#0a2617] dark:text-gray-100">{count}</span>

                </div>

              ))}

            </div>

          ) : (

            <p className="text-sm text-[#4a7c5d] dark:text-gray-400 font-medium">No events this week </p>

          )}

        </div>

      </div>



      {/* 8-week sparkline bar chart */}

      <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">

        <h3 className="text-base font-bold text-[#0a2617] dark:text-gray-100 mb-5 flex items-center gap-2" style={{ fontFamily: 'Syne,sans-serif' }}>

          <Activity size={18} className="text-[#0d5d3a] dark:text-[#10b981]" />

          8-Week Crisis Event Trend

        </h3>

        <div className="flex items-end gap-2 sm:gap-3 h-36">

          {(data?.recentWeeks || []).map((w: any, i: number) => {

            const heightPct = Math.max(4, (w.count / maxCount) * 100);

            const isNow = i === weekCount - 1;

            return (

              <div key={w.week} className="flex-1 flex flex-col items-center gap-1">

                <span className="text-[10px] font-bold text-[#0a2617] dark:text-gray-200" style={{ minHeight: 16 }}>

                  {w.count > 0 ? w.count : ''}

                </span>

                <div className="w-full rounded-t-lg relative overflow-hidden"

                  style={{

                    height: `${heightPct}%`,

                    background: isNow

                      ? 'linear-gradient(to top, #b91c1c, #f87171)'

                      : 'linear-gradient(to top, #0d5d3a, #10b981)',

                  }}

                >

                  {isNow && <div className="absolute inset-0 animate-pulse opacity-25 bg-white" />}

                </div>

                <span className="text-[9px] text-[#4a7c5d] dark:text-gray-500 font-medium truncate w-full text-center">

                  {w.week.replace(/\d{4}-/, '')}

                </span>

              </div>

            );

          })}

        </div>

        <p className="text-[10px] text-[#4a7c5d] dark:text-gray-500 mt-3 text-center">

          Red = current week. Counts only — no user data stored.

        </p>

      </div>



      {/* Category explanation */}

      <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">

        <h3 className="text-base font-bold text-[#0a2617] dark:text-gray-100 mb-4" style={{ fontFamily: 'Syne,sans-serif' }}>

          Category Definitions

        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {Object.entries(CAT).map(([key, { label, color, desc }]) => (

            <div key={key} className="flex items-start gap-3 p-3 rounded-xl bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/08 dark:border-white/08">

              <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${color}`}>{label}</span>

              <p className="text-xs text-[#4a7c5d] dark:text-gray-400 leading-relaxed">{desc}</p>

            </div>

          ))}

        </div>

        <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20">

          <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold leading-relaxed">

            ️ When a crisis keyword is detected, Zeni AI <strong>automatically</strong> skips the standard AI response and delivers a warm, empathetic reply followed by Indian crisis helpline numbers and a direct "Talk to a Therapist Now" button. No admin action is required per event.

          </p>

        </div>

      </div>



    </div>

  );

}



/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   NOTIFICATION BROADCAST WIDGET

   Admin composes and sends system notifications to all / one user.

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function NotificationBroadcastWidget() {

  const [title, setTitle] = useState('');

  const [body, setBody] = useState('');

  const [actionTab, setActionTab] = useState('');

  const [targetUserId, setTargetUserId] = useState('');

  const [sending, setSending] = useState(false);

  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);

  const [loadingRecent, setLoadingRecent] = useState(true);



  const toast = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 4000); };



  const loadRecent = async () => {

    setLoadingRecent(true);

    try {

      const r = await apiFetch<any>('/admin/notifications/recent');

      setRecentNotifs(r.notifications || []);

    } catch { /* silent */ }

    finally { setLoadingRecent(false); }

  };



  useEffect(() => { loadRecent(); }, []);



  const handleSend = async () => {

    if (!title.trim() || !body.trim()) { toast('Title and message are required', false); return; }

    setSending(true);

    try {

      const payload: any = { title: title.trim(), body: body.trim() };

      if (actionTab) payload.actionTab = actionTab;

      if (targetUserId.trim()) payload.targetUserId = targetUserId.trim();

      const r = await apiFetch<any>('/admin/notifications/broadcast', { method: 'POST', body: JSON.stringify(payload) });

      toast(` Sent to ${r.sent} user${r.sent !== 1 ? 's' : ''}`);

      setTitle(''); setBody(''); setActionTab(''); setTargetUserId('');

      loadRecent();

    } catch (e: any) { toast(e.message || 'Send failed', false); }

    finally { setSending(false); }

  };



  const ACTION_TAB_OPTIONS = [

    { value: '', label: 'No action (info only)' },

    { value: 'therapy', label: '🩺 Therapy Hub' },

    { value: 'sessions', label: ' My Sessions' },

    { value: 'programs', label: '️️ Wellness Programs' },

    { value: 'reading', label: ' Reading Lists' },

    { value: 'goals', label: ' My Goals' },

    { value: 'aichat', label: ' AI Chat' },

  ];



  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-[#0a2617] dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25';



  return (

    <div className="flex flex-col gap-6 max-w-3xl">

      {/* Toast */}

      <AnimatePresence>

        {msg && (

          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}

            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[500] px-5 py-3 rounded-2xl text-sm font-bold shadow-lg ${msg.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>

            {msg.text}

          </motion.div>

        )}

      </AnimatePresence>



      {/* Info banner */}

      <div className="flex items-start gap-3 bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 border border-[#0d5d3a]/20 dark:border-[#0d5d3a]/30 rounded-2xl px-5 py-4">

        <Bell size={18} className="text-[#0d5d3a] dark:text-[#10b981] mt-0.5 flex-shrink-0" />

        <div>

          <p className="text-sm font-bold text-[#0a2617] dark:text-gray-100">Broadcast Notifications</p>

          <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-0.5">

            Send a system notification to all users or a specific user by their MongoDB user ID.

            Notifications appear in the bell icon inside each user's dashboard in real-time on next page load or poll.

          </p>

        </div>

      </div>



      {/* Compose form */}

      <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm space-y-4">

        <h3 className="text-base font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>

          Compose Notification

        </h3>



        <div>

          <label className="block text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 uppercase tracking-wide">Title *</label>

          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. New Wellness Program Available!"

            className={inputCls} maxLength={120} />

          <p className="text-[10px] text-[#4a7c5d]/70 mt-1">{title.length}/120 characters</p>

        </div>



        <div>

          <label className="block text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 uppercase tracking-wide">Message *</label>

          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write a helpful, empathetic message for your users…"

            rows={3} className={`${inputCls} resize-none`} maxLength={400} />

          <p className="text-[10px] text-[#4a7c5d]/70 mt-1">{body.length}/400 characters</p>

        </div>



        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>

            <label className="block text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 uppercase tracking-wide">Action Link (optional)</label>

            <select value={actionTab} onChange={e => setActionTab(e.target.value)} className={inputCls}>

              {ACTION_TAB_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}

            </select>

            <p className="text-[10px] text-[#4a7c5d]/70 mt-1">Tapping the notification opens this tab</p>

          </div>

          <div>

            <label className="block text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 uppercase tracking-wide">Target User ID (optional)</label>

            <input value={targetUserId} onChange={e => setTargetUserId(e.target.value)} placeholder="Leave empty to broadcast to all"

              className={inputCls} />

            <p className="text-[10px] text-[#4a7c5d]/70 mt-1">Paste a MongoDB user _id to target one user</p>

          </div>

        </div>



        <div className="flex items-center gap-3 pt-2">

          <button onClick={handleSend} disabled={sending || !title.trim() || !body.trim()}

            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-black text-sm hover:bg-[#0a4a2e] transition-all disabled:opacity-50 shadow-md shadow-[#0d5d3a]/20">

            {sending ? <><RefreshCw size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> {targetUserId.trim() ? 'Send to User' : 'Broadcast to All'}</>}

          </button>

          {!targetUserId.trim() && (

            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">

              <AlertTriangle size={12} /> Will send to every registered user

            </span>

          )}

        </div>

      </div>



      {/* Recent notifications audit */}

      <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">

        <div className="flex items-center justify-between mb-4">

          <h3 className="text-base font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>

            Recent Notifications (Audit)

          </h3>

          <button onClick={loadRecent} disabled={loadingRecent}

            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] bg-[#f0fbf4] dark:bg-[#0d5d3a]/15 hover:bg-[#e8f5e9] dark:hover:bg-[#0d5d3a]/25 transition disabled:opacity-50">

            <RefreshCw size={12} className={loadingRecent ? 'animate-spin' : ''} /> Refresh

          </button>

        </div>

        <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mb-4">

          Last 50 notifications across all users. User IDs are shown as 12-char hashes for privacy.

        </p>



        {loadingRecent ? (

          <div className="flex justify-center py-8">

            <div className="w-8 h-8 border-4 border-[#0d5d3a]/20 border-t-[#0d5d3a] rounded-full animate-spin" />

          </div>

        ) : recentNotifs.length === 0 ? (

          <div className="text-center py-8 text-[#4a7c5d] dark:text-gray-400 text-sm font-semibold">

            No notifications sent yet.

          </div>

        ) : (

          <div className="space-y-2 max-h-[400px] overflow-y-auto">

            {recentNotifs.map((n: any) => (

              <div key={n._id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/08 dark:border-white/08">

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2 mb-0.5">

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${

                      n.type === 'system' ? 'bg-[#0d5d3a]/10 text-[#0d5d3a] dark:bg-[#0d5d3a]/20 dark:text-[#10b981]' :

                      n.type === 'crisis_followup' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' :

                      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'

                    }`}>{n.type}</span>

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${n.isRead ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'}`}>

                      {n.isRead ? 'read' : 'unread'}

                    </span>

                  </div>

                  <p className="text-sm font-bold text-[#0a2617] dark:text-gray-100 truncate">{n.title}</p>

                  <p className="text-[10px] text-[#4a7c5d] dark:text-gray-500 mt-0.5 font-mono">
                    user:{n.userHash}… · {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.actionTab && (
                    <span className="text-[9px] font-bold text-[#0d5d3a] dark:text-[#10b981] bg-[#0d5d3a]/08 dark:bg-[#0d5d3a]/20 px-2 py-1 rounded-lg whitespace-nowrap">
                      → {n.actionTab}
                    </span>
                  )}
                  <button onClick={async () => {
                    if (confirm('Delete this notification?')) {
                      try {
                        await apiFetch(`/admin/notifications/recent/${n._id}`, { method: 'DELETE' });
                        loadRecent();
                      } catch(e:any) { toast(e.message, false); }
                    }
                  }} className="text-red-500 hover:text-red-600 transition" title="Delete Notification">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}



function ContentManagement() {

  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'stories' | 'approval' | 'resources'>('approval');

  const [settings, setSettings] = useState({ activeUsers: '', satisfactionRate: '', therapistsCount: '', supportAvailable: '' });

  const [stories, setStories]   = useState<any[]>([]);

  const [pending, setPending]   = useState<any[]>([]);

  const [pendingCount, setPendingCount] = useState(0);

  const [loading, setLoading]   = useState(true);

  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [busyId, setBusyId]     = useState<string | null>(null);



  const loadData = async () => {

    try {

      const [setRes, stoRes, penRes] = await Promise.all([

        apiFetch<any>('/admin/settings/site'),

        apiFetch<any>('/admin/stories?status=approved'),

        apiFetch<any>('/admin/stories?status=pending'),

      ]);

      setSettings(setRes.settings || { activeUsers: '', satisfactionRate: '', therapistsCount: '', supportAvailable: '' });

      setStories(stoRes.stories || []);

      setPending(penRes.stories || []);

      setPendingCount(penRes.stories?.length || 0);

    } catch (e: any) {

      setMsg({ text: e.message || 'Failed to load content', ok: false });

    } finally { setLoading(false); }

  };



  useEffect(() => { loadData(); }, []);



  const saveSettings = async () => {

    try {

      setMsg(null);

      await apiFetch('/admin/settings/site', { method: 'PUT', body: JSON.stringify(settings) });

      setMsg({ text: 'Settings updated successfully.', ok: true });

    } catch (e: any) { setMsg({ text: e.message || 'Failed to update settings', ok: false }); }

  };



  const deleteStory = async (id: string) => {

    if (!confirm('Delete this story?')) return;

    try {

      await apiFetch(`/admin/stories/${id}`, { method: 'DELETE' });

      setStories(stories.filter(s => s._id !== id));

      setMsg({ text: 'Story deleted.', ok: true });

    } catch (e: any) { setMsg({ text: e.message || 'Failed to delete story', ok: false }); }

  };



  const moderateStory = async (id: string, approved: boolean) => {

    setBusyId(id);

    try {

      await apiFetch(`/admin/stories/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ approved }) });

      setPending(prev => prev.filter(s => s._id !== id));

      setPendingCount(c => Math.max(0, c - 1));

      if (approved) {

        const story = pending.find(s => s._id === id);

        if (story) setStories(prev => [{ ...story, isApproved: true }, ...prev]);

      }

      setMsg({ text: approved ? ' Story approved and is now live.' : '️ Story rejected and removed.', ok: approved });

    } catch (e: any) { setMsg({ text: e.message || 'Failed', ok: false }); }

    finally { setBusyId(null); }

  };



  const bulkApprove = async () => {

    const ids = Array.from(selectedIds);

    if (!ids.length) return;

    try {

      await apiFetch('/admin/stories/bulk-action', { method: 'POST', body: JSON.stringify({ ids, action: 'approve' }) });

      const approved = pending.filter(s => ids.includes(s._id));

      setPending(prev => prev.filter(s => !ids.includes(s._id)));

      setStories(prev => [...approved.map(s => ({ ...s, isApproved: true })), ...prev]);

      setPendingCount(c => Math.max(0, c - ids.length));

      setSelectedIds(new Set());

      setMsg({ text: ` ${ids.length} stories approved.`, ok: true });

    } catch (e: any) { setMsg({ text: e.message || 'Bulk approve failed', ok: false }); }

  };



  const bulkReject = async () => {

    const ids = Array.from(selectedIds);

    if (!ids.length || !confirm(`Reject and delete ${ids.length} stories?`)) return;

    try {

      await apiFetch('/admin/stories/bulk-action', { method: 'POST', body: JSON.stringify({ ids, action: 'delete' }) });

      setPending(prev => prev.filter(s => !ids.includes(s._id)));

      setPendingCount(c => Math.max(0, c - ids.length));

      setSelectedIds(new Set());

      setMsg({ text: `️ ${ids.length} stories rejected.`, ok: true });

    } catch (e: any) { setMsg({ text: e.message || 'Bulk reject failed', ok: false }); }

  };



  const toggleSelect = (id: string) => {

    const s = new Set(selectedIds);

    s.has(id) ? s.delete(id) : s.add(id);

    setSelectedIds(s);

  };



  const CATEGORY_LABELS: Record<string, string> = {
    anxiety: 'Anxiety', depression: 'Depression', stress: 'Stress',
    exam_pressure: 'Exam Pressure', bullying: 'Bullying', loneliness: 'Loneliness',
    family_issues: 'Family', self_esteem: 'Self-Esteem', trauma: 'Trauma', other: 'Other',
  };



  if (loading) return <div className="text-[#4a7c5d] font-bold">Loading content...</div>;





  return (

    <div className="flex flex-col gap-6">

      {msg && (

        <div className={`p-4 rounded-xl font-semibold flex items-center gap-2 ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981]' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>

          {msg.ok ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} {msg.text}

          <button onClick={() => setMsg(null)} className="ml-auto text-current opacity-60 hover:opacity-100"><X size={14}/></button>

        </div>

      )}



      {/* Sub-tab nav */}

      <div className="sticky top-0 z-20 flex flex-wrap gap-2 p-1 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#0d5d3a]/10 dark:border-white/10 rounded-2xl shadow-sm w-fit">

        {/* Approval Queue with badge */}

        <button onClick={() => setActiveSubTab('approval')}

          className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeSubTab === 'approval' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5'}`}>

          <Shield size={16}/> Approval Queue

          {pendingCount > 0 && (

            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">

              {pendingCount > 9 ? '9+' : pendingCount}

            </span>

          )}

        </button>

        <button onClick={() => setActiveSubTab('stories')}

          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeSubTab === 'stories' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5'}`}>

          <FileText size={16}/> Live Stories

        </button>

        <button onClick={() => setActiveSubTab('stats')}

          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeSubTab === 'stats' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5'}`}>

          <Activity size={16}/> Site Stats

        </button>

        <button onClick={() => setActiveSubTab('resources')}

          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeSubTab === 'resources' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5'}`}>

          <BookOpen size={16}/> Resources

        </button>

      </div>



      {/* ── APPROVAL QUEUE ── */}

      {activeSubTab === 'approval' && (

        <section className="flex flex-col gap-4">

          {/* Toolbar */}

          <div className="flex flex-wrap items-center gap-3">

            <div className="text-sm font-bold text-[#0a2617] dark:text-gray-100">

              {pending.length === 0 ? ' All clear — no stories pending review' : `${pending.length} stor${pending.length !== 1 ? 'ies' : 'y'} awaiting review`}

            </div>

            {selectedIds.size > 0 && (

              <div className="flex items-center gap-2 ml-auto flex-wrap">

                <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400">{selectedIds.size} selected</span>

                <button onClick={bulkApprove} className="px-4 py-2 rounded-xl bg-[#0d5d3a] text-white text-xs font-bold hover:bg-[#0a4a2e] transition flex items-center gap-1.5">

                  <CheckCircle size={14}/> Approve All Selected

                </button>

                <button onClick={bulkReject} className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-200 transition flex items-center gap-1.5">

                  <Trash2 size={14}/> Reject All Selected

                </button>

              </div>

            )}

            {pending.length > 0 && selectedIds.size === 0 && (

              <button onClick={() => setSelectedIds(new Set(pending.map((s: any) => s._id)))}

                className="ml-auto text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] hover:underline">

                Select all

              </button>

            )}

          </div>



          {pending.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08">

              <div className="text-5xl mb-4"></div>

              <div className="text-lg font-bold text-[#0a2617] dark:text-white mb-1">No pending stories</div>

              <div className="text-sm text-[#4a7c5d] dark:text-gray-400">New user submissions will appear here for your review.</div>

            </div>

          ) : (

            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">

              {pending.map((s: any) => (

                <div key={s._id}

                  className={`rounded-2xl border-2 p-5 transition-all ${selectedIds.has(s._id) ? 'border-[#0d5d3a] bg-[#f0fbf4] dark:bg-[#0d5d3a]/10' : 'border-[#0d5d3a]/08 dark:border-white/08 bg-white dark:bg-[#111111]'}`}>

                  <div className="flex items-start gap-3">

                    {/* Checkbox */}

                    <input type="checkbox" checked={selectedIds.has(s._id)} onChange={() => toggleSelect(s._id)}

                      className="mt-1 w-4 h-4 rounded accent-[#0d5d3a] flex-shrink-0 cursor-pointer" />

                    <div className="flex-1 min-w-0">

                      {/* Category badge */}

                      {s.category && (

                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] text-xs font-bold mb-2">

                          {CATEGORY_LABELS[s.category] || s.category}

                        </span>

                      )}

                      {/* Story text */}

                      <p className="text-sm text-[#0a2617] dark:text-gray-200 leading-relaxed italic mb-3">"{s.story}"</p>

                      {/* Meta */}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#4a7c5d] dark:text-gray-500">

                        <span className="font-bold">— {s.isAnonymous ? 'Anonymous' : s.author}</span>

                        <span className="flex items-center gap-1"><Clock size={11}/>{new Date(s.createdAt).toLocaleString()}</span>

                        {s.isAnonymous && <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 font-semibold">Anonymous</span>}

                      </div>

                    </div>

                    {/* Action buttons */}

                    <div className="flex flex-col gap-2 flex-shrink-0 ml-2">

                      <button onClick={() => moderateStory(s._id, true)} disabled={busyId === s._id}

                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d5d3a] text-white text-xs font-bold hover:bg-[#0a4a2e] disabled:opacity-50 transition whitespace-nowrap">

                        <CheckCircle size={13}/> {busyId === s._id ? '...' : 'Approve'}

                      </button>

                      <button onClick={() => moderateStory(s._id, false)} disabled={busyId === s._id}

                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-200 disabled:opacity-50 transition whitespace-nowrap">

                        <Trash2 size={13}/> Reject

                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      )}



      {/* ── LIVE STORIES ── */}

      {activeSubTab === 'stories' && (

        <section className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/08 dark:border-white/08 shadow-sm flex flex-col" style={{ maxHeight: 'calc(100vh - 220px)' }}>

          <h2 className="text-xl font-bold text-[#0a2617] dark:text-gray-100 mb-4 flex items-center gap-2 shrink-0">

            <FileText size={20} className="text-[#0d5d3a] dark:text-[#10b981]" /> Live Stories ({stories.length})

          </h2>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1">

            {stories.map((s: any) => (

              <div key={s._id} className="p-4 border border-[#0d5d3a]/08 dark:border-white/08 rounded-2xl flex gap-4 bg-[#fbfdfb] dark:bg-[#1a1a1a] items-start">

                <div className="flex-1 min-w-0">

                  {s.category && (

                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] text-[10px] font-bold mb-2">

                      {CATEGORY_LABELS[s.category] || s.category}

                    </span>

                  )}

                  <p className="text-sm text-[#0a2617] dark:text-gray-300 italic mb-2">"{s.story}"</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#4a7c5d] dark:text-gray-500">

                    <span className="font-bold">— {s.author}</span>

                    <span className="flex items-center gap-1"><Clock size={11}/>{new Date(s.createdAt).toLocaleString()}</span>

                    <span className="text-[#10b981] font-bold">️ {s.likes || 0}</span>

                  </div>

                </div>

                <button onClick={() => deleteStory(s._id)} className="shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition" title="Delete">

                  <Trash2 size={16}/>

                </button>

              </div>

            ))}

            {stories.length === 0 && <p className="text-sm text-[#4a7c5d] dark:text-gray-400">No live stories yet.</p>}

          </div>

        </section>

      )}



      {/* ── SITE STATS ── */}

      {activeSubTab === 'stats' && (

        <section className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/08 dark:border-white/08 shadow-sm">

          <h2 className="text-xl font-bold text-[#0a2617] dark:text-gray-100 mb-4 flex items-center gap-2">

            <Activity size={20} className="text-[#0d5d3a] dark:text-[#10b981]"/> Global Statistics

          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

            {(['activeUsers','satisfactionRate','therapistsCount','supportAvailable'] as const).map(k => (

              <label key={k} className="block">

                <span className="text-sm font-semibold text-[#4a7c5d] dark:text-gray-400 mb-1 block capitalize">

                  {k.replace(/([A-Z])/g, ' $1')}

                </span>

                <input type="text" value={settings[k]} onChange={e => setSettings({...settings,[k]:e.target.value})}

                  className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white"/>

              </label>

            ))}

          </div>

          <button onClick={saveSettings} className="mt-5 px-6 py-2.5 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold hover:bg-[#0a4a2e] transition flex items-center gap-2">

            <Save size={18}/> Save Statistics

          </button>

        </section>

      )}



      {/* ── RESOURCES ── */}

      {activeSubTab === 'resources' && <AdminResourcesPanel />}

    </div>

  );

}



/* ────────────────────────────────────────────────────────────────────────────────────────────────── 

   ADMIN RESOURCES PANEL

────────────────────────────────────────────────────────────────────────────────────────────────── */

type ResType = 'video' | 'audio' | 'image' | 'link';

type SrcType = 'upload' | 'youtube' | 'url';



const RES_TAGS = ['Anxiety','Breathing','Stress','Sleep','Relaxation','Mindfulness',

  'Focus','Motivation','Happiness','Self-Esteem','Education','Wellness'];



function fileToBase64(file: File): Promise<string> {

  return new Promise((resolve, reject) => {

    const r = new FileReader();

    r.onload  = () => resolve(String(r.result));

    r.onerror = () => reject(new Error('Read failed'));

    r.readAsDataURL(file);

  });

}



function AdminResourcesPanel() {

  const [resources, setResources] = useState<any[]>([]);

  const [loading, setLoading]     = useState(true);

  const [showForm, setShowForm]   = useState(false);

  const [saving, setSaving]       = useState(false);

  const [msg, setMsg]             = useState<{ text: string; ok: boolean } | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);



  // Form state

  const [title, setTitle]           = useState('');

  const [description, setDesc]      = useState('');

  const [type, setType]             = useState<ResType>('video');

  const [sourceType, setSourceType] = useState<SrcType>('youtube');

  const [url, setUrl]               = useState('');

  const [selectedTags, setTags]     = useState<string[]>([]);

  const [fileData, setFileData]     = useState('');

  const [fileMime, setFileMime]     = useState('');

  const [thumbData, setThumbData]   = useState('');

  const [thumbMime, setThumbMime]   = useState('');

  const fileRef  = useRef<HTMLInputElement>(null);

  const thumbRef = useRef<HTMLInputElement>(null);



  const load = async () => {

    setLoading(true);

    try {

      const res = await apiFetch<any>('/resources/admin/list');

      setResources(res.resources || []);

    } catch (e: any) { setMsg({ text: e.message, ok: false }); }

    finally { setLoading(false); }

  };

  useEffect(() => { load(); }, []);



  const resetForm = () => {

    setTitle(''); setDesc(''); setType('video'); setSourceType('youtube');

    setUrl(''); setTags([]); setFileData(''); setFileMime('');

    setThumbData(''); setThumbMime('');

    if (fileRef.current)  fileRef.current.value  = '';

    if (thumbRef.current) thumbRef.current.value = '';

  };



  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const f = e.target.files?.[0]; if (!f) return;

    const b64 = await fileToBase64(f);

    setFileData(b64.split(',')[1]);

    setFileMime(f.type);

  };



  const handleThumbChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const f = e.target.files?.[0]; if (!f) return;

    const b64 = await fileToBase64(f);

    setThumbData(b64.split(',')[1]);

    setThumbMime(f.type);

  };



  const toggleTag = (t: string) =>

    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!title.trim()) { setMsg({ text: 'Title is required', ok: false }); return; }

    setSaving(true); setMsg(null);

    try {

      await apiFetch('/resources/admin', {

        method: 'POST',

        body: JSON.stringify({

          title: title.trim(), description: description.trim(),

          type, sourceType, url,

          fileData, fileMime,

          thumbnailData: thumbData, thumbnailMime: thumbMime,

          tags: selectedTags,

        }),

      });

      setMsg({ text: ' Resource added successfully!', ok: true });

      resetForm(); setShowForm(false); load();

    } catch (e: any) { setMsg({ text: e.message || 'Failed to add resource', ok: false }); }

    finally { setSaving(false); }

  };



  const handleDelete = async (id: string) => {

    if (!confirm('Delete this resource?')) return;

    setDeletingId(id);

    try {

      await apiFetch(`/resources/admin/${id}`, { method: 'DELETE' });

      setResources(prev => prev.filter(r => r._id !== id));

      setMsg({ text: 'Resource deleted.', ok: true });

    } catch (e: any) { setMsg({ text: e.message, ok: false }); }

    finally { setDeletingId(null); }

  };



  const typeIcon = (t: string) => {

    if (t === 'video') return <Video size={14} />;

    if (t === 'audio') return <Music size={14} />;

    if (t === 'image') return <ImageIcon size={14} />;

    return <Link2 size={14} />;

  };

  const typePill = (t: string) => {

    const map: Record<string,string> = {

      video: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',

      audio: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',

      image: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',

      link:  'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',

    };

    return map[t] || '';

  };



  return (

    <div className="flex flex-col gap-5">

      {msg && (

        <div className={`p-3 rounded-xl font-semibold flex items-center gap-2 text-sm ${

          msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981]'

                 : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>

          {msg.ok ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>} {msg.text}

          <button onClick={() => setMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={13}/></button>

        </div>

      )}



      {/* Header row */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-[#0a2617] dark:text-gray-100" style={{ fontFamily:'Syne,sans-serif' }}>Wellness Resources</h2>

          <p className="text-sm text-[#4a7c5d] dark:text-gray-400">Add curated videos, audio, images and links for users.</p>

        </div>

        <button onClick={() => { setShowForm(v => !v); resetForm(); setMsg(null); }}

          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-sm hover:bg-[#0a4a2e] transition shadow-lg shadow-[#0d5d3a]/20">

          {showForm ? <X size={16}/> : <Plus size={16}/>} {showForm ? 'Cancel' : 'Add Resource'}

        </button>

      </div>



      {/* ── ADD FORM ── */}

      <AnimatePresence>

        {showForm && (

          <motion.form onSubmit={handleSubmit}

            initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}

            className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 p-6 flex flex-col gap-4 shadow-sm"

          >

            <h3 className="font-bold text-[#0a2617] dark:text-gray-100 text-base">New Resource</h3>



            {/* Title + Description */}

            <div className="grid sm:grid-cols-2 gap-4">

              <label className="block sm:col-span-2">

                <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Title *</span>

                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. 5-Minute Box Breathing"

                  className="w-full px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50" />

              </label>

              <label className="block sm:col-span-2">

                <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Description</span>

                <textarea value={description} onChange={e=>setDesc(e.target.value)} rows={2} placeholder="Short description shown on the card…"

                  className="w-full px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 resize-none" />

              </label>

            </div>



            {/* Type + Source selectors */}

            <div className="grid sm:grid-cols-2 gap-4">

              <label className="block">

                <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Resource Type</span>

                <select value={type} onChange={e=>{ setType(e.target.value as ResType); setSourceType(e.target.value === 'image' ? 'upload' : 'youtube'); setFileData(''); setFileMime(''); }}

                  className="w-full px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50">

                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="image">Image</option>
                  <option value="link">Link / Article</option>

                </select>

              </label>

              {type !== 'image' && type !== 'link' && (

                <label className="block">

                  <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Source</span>

                  <select value={sourceType} onChange={e=>{ setSourceType(e.target.value as SrcType); setUrl(''); setFileData(''); setFileMime(''); }}

                    className="w-full px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50">

                    <option value="youtube">YouTube URL</option>

                    <option value="upload">Upload File</option>

                    <option value="url">External URL</option>

                  </select>

                </label>

              )}

            </div>



            {/* URL / File input */}

            {(sourceType === 'youtube' || sourceType === 'url' || type === 'link') && (

              <label className="block">

                <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">

                  {sourceType === 'youtube' ? 'YouTube URL' : 'URL'}

                </span>

                <input value={url} onChange={e=>setUrl(e.target.value)}

                  placeholder={sourceType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}

                  className="w-full px-4 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50" />

              </label>

            )}

            {sourceType === 'upload' && type !== 'link' && (

              <label className="block">

                <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Upload File</span>

                <input ref={fileRef} type="file"

                  accept={type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : 'image/*'}

                  onChange={handleFileChange}

                  className="w-full text-sm text-[#0a2617] dark:text-white file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#0d5d3a] file:text-white file:font-bold file:cursor-pointer" />

                {fileData && <p className="text-[10px] text-[#0d5d3a] dark:text-[#10b981] mt-1 font-semibold"> File loaded ({fileMime})</p>}

              </label>

            )}



            {/* Thumbnail (for link/url only) */}

            {(type === 'link' || sourceType === 'url') && (

              <label className="block">

                <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-1">Thumbnail Image (optional)</span>

                <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumbChange}

                  className="w-full text-sm text-[#0a2617] dark:text-white file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#f0fbf4] dark:file:bg-[#0d5d3a]/20 file:text-[#0d5d3a] dark:file:text-[#10b981] file:font-bold file:cursor-pointer" />

                {thumbData && <p className="text-[10px] text-[#0d5d3a] dark:text-[#10b981] mt-1 font-semibold"> Thumbnail loaded</p>}

              </label>

            )}



            {/* Tags */}

            <div>

              <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400 block mb-2">Tags</span>

              <div className="flex flex-wrap gap-2">

                {RES_TAGS.map(tag => (

                  <button key={tag} type="button" onClick={() => toggleTag(tag)}

                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${

                      selectedTags.includes(tag)

                        ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-sm'

                        : 'bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#0d5d3a]/20'}`}>

                    {tag}

                  </button>

                ))}

              </div>

            </div>



            <div className="flex justify-end gap-3">

              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}

                className="px-5 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 text-[#4a7c5d] dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">

                Cancel

              </button>

              <button type="submit" disabled={saving}

                className="px-6 py-2.5 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-sm hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] disabled:opacity-60 transition flex items-center gap-2 shadow-lg shadow-[#0d5d3a]/20">

                {saving ? <><span className="animate-spin">↻</span> Saving…</> : <><Save size={15}/> Add Resource</>}

              </button>

            </div>

          </motion.form>

        )}

      </AnimatePresence>



      {/* ── RESOURCE LIST ── */}

      {loading ? (

        <div className="text-center py-12 text-[#4a7c5d] font-bold">Loading resources…</div>

      ) : resources.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08">

          <div className="text-5xl mb-4"></div>

          <div className="text-lg font-bold text-[#0a2617] dark:text-white mb-1">No resources yet</div>

          <div className="text-sm text-[#4a7c5d] dark:text-gray-400">Click "Add Resource" to upload your first item.</div>

        </div>

      ) : (

        <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 overflow-hidden shadow-sm">

          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-[10px] font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider">

            <div className="col-span-5">Resource</div>

            <div className="col-span-2 hidden sm:block">Type</div>

            <div className="col-span-2 hidden sm:block">Tags</div>

            <div className="col-span-2 hidden sm:block text-center">Views</div>

            <div className="col-span-7 sm:col-span-1 text-right">Del</div>

          </div>

          <div className="divide-y divide-[#0d5d3a]/05 dark:divide-white/05 max-h-[520px] overflow-y-auto">

            {resources.map(r => (

              <div key={r._id} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-[#fbfdfb] dark:hover:bg-[#1a1a1a] transition-colors">

                <div className="col-span-5 flex items-center gap-3 min-w-0">

                  {/* Mini thumbnail */}

                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0d5d3a]/20 to-[#1a8a5a]/20 flex items-center justify-center">

                    {r.youtubeVideoId ? (

                      <img src={`https://img.youtube.com/vi/${r.youtubeVideoId}/default.jpg`} alt="" className="w-full h-full object-cover" />

                    ) : typeIcon(r.type)}

                  </div>

                  <div className="min-w-0">

                    <div className="font-bold text-sm text-[#0a2617] dark:text-gray-100 truncate">{r.title}</div>

                    <div className="text-[10px] text-[#4a7c5d] dark:text-gray-400 truncate">{r.sourceType === 'youtube' ? 'YouTube' : r.sourceType === 'upload' ? 'Uploaded file' : r.url}</div>

                  </div>

                </div>

                <div className="col-span-2 hidden sm:flex items-center">

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${typePill(r.type)}`}>

                    {typeIcon(r.type)} {r.type}

                  </span>

                </div>

                <div className="col-span-2 hidden sm:flex flex-wrap gap-1">

                  {(r.tags || []).slice(0,2).map((t:string) => (

                    <span key={t} className="px-1.5 py-0.5 rounded-full bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] text-[9px] font-semibold">{t}</span>

                  ))}

                </div>

                <div className="col-span-2 hidden sm:flex justify-center">

                  <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400">{r.views ?? 0}</span>

                </div>

                <div className="col-span-7 sm:col-span-1 flex justify-end">

                  <button onClick={() => handleDelete(r._id)} disabled={deletingId === r._id}

                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition disabled:opacity-40">

                    <Trash2 size={14}/>

                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}





type SupportTicketData = {

  _id: string;

  type: 'contact' | 'report';

  subject: string;

  body: string;

  name: string;

  email: string;

  phone: string;

  status: 'pending' | 'resolved';

  createdAt: string;

};



function SupportManagement() {

  const [activeSubTab, setActiveSubTab] = useState<'contact' | 'report'>('contact');

  const [tickets, setTickets] = useState<SupportTicketData[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [viewingTicket, setViewingTicket] = useState<SupportTicketData | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);



  const loadData = async () => {
    setLoading(true);
    let serverTickets: SupportTicketData[] = [];
    try {
      const res = await apiFetch<any>('/admin/support');
      serverTickets = res.tickets || [];
    } catch (e: any) {}

    let localContactQueries: SupportTicketData[] = [];
    try {
      localContactQueries = JSON.parse(localStorage.getItem('zm_contact_queries') || '[]');
    } catch {}

    const combined = [...localContactQueries, ...serverTickets];
    const uniqueMap = new Map<string, SupportTicketData>();
    combined.forEach(t => {
      if (t._id) uniqueMap.set(t._id, t);
    });

    setTickets(Array.from(uniqueMap.values()));
    setSelectedIds(new Set());
    setLoading(false);
  };



  useEffect(() => { loadData(); }, []);



  const toggleStatus = async (id: string) => {
    try {
      await apiFetch(`/admin/support/${id}/resolve`, { method: 'PUT' });
      await loadData();
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to update ticket', ok: false });
    }
  };

  const deleteSingleTicket = async (id: string) => {
    if (!confirm('Delete this ticket?')) return;
    try {
      await apiFetch('/admin/support/bulk-delete', { 
        method: 'POST', 
        body: JSON.stringify({ ids: [id] }) 
      });
      setMsg({ text: 'Ticket deleted successfully.', ok: true });
      await loadData();
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to delete ticket', ok: false });
    }
  };



  const confirmBulkDelete = () => {

    if (selectedIds.size === 0) return;

    setDeleteConfirmOpen(true);

  };



  const executeBulkDelete = async () => {

    setIsDeleting(true);

    try {

      await apiFetch('/admin/support/bulk-delete', { 

        method: 'POST', 

        body: JSON.stringify({ ids: Array.from(selectedIds) }) 

      });

      setMsg({ text: 'Tickets deleted successfully.', ok: true });

      await loadData();

    } catch (e: any) {

      setMsg({ text: e.message || 'Failed to delete tickets', ok: false });

    } finally {

      setIsDeleting(false);

      setDeleteConfirmOpen(false);

    }

  };



  const filtered = tickets.filter(t => t.type === activeSubTab);



  const toggleSelectAll = () => {

    if (selectedIds.size === filtered.length) {

      setSelectedIds(new Set());

    } else {

      setSelectedIds(new Set(filtered.map(t => t._id)));

    }

  };



  const toggleSelect = (id: string) => {

    const newSet = new Set(selectedIds);

    if (newSet.has(id)) newSet.delete(id);

    else newSet.add(id);

    setSelectedIds(newSet);

  };



  if (loading) return <div className="text-[#4a7c5d] font-bold">Loading support tickets...</div>;



  return (

    <div className="flex flex-col gap-6">

      {msg && (

        <div className={`p-4 rounded-xl font-semibold flex items-center gap-2 ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981]' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>

           {msg.text}

        </div>

      )}



      <ConfirmModal

        open={deleteConfirmOpen}

        title="Delete Selected Tickets?"

        message={`Are you sure you want to delete ${selectedIds.size} selected ticket(s)? This action cannot be undone.`}

        confirmLabel="Yes, Delete"

        danger={true}

        onConfirm={executeBulkDelete}

        onCancel={() => setDeleteConfirmOpen(false)}

        busy={isDeleting}

      />



      {/* Sub-header Navigation */}

      <div className="sticky top-0 z-20 flex flex-wrap gap-2 justify-between items-center bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#0d5d3a]/10 dark:border-white/10 rounded-2xl p-2 shadow-sm">

        <div className="flex gap-2">

          <button

            onClick={() => { setActiveSubTab('contact'); setSelectedIds(new Set()); }}

            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'contact' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}`}

          >

            Contact Us Messages

          </button>

          <button

            onClick={() => { setActiveSubTab('report'); setSelectedIds(new Set()); }}

            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'report' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}`}

          >

            Reported Issues

          </button>

        </div>

        

        {selectedIds.size > 0 && (

          <div className="flex items-center gap-2">

            <span className="text-sm font-bold text-[#4a7c5d] dark:text-gray-400">{selectedIds.size} selected</span>

            <button onClick={confirmBulkDelete} className="px-4 py-2 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-200 dark:hover:bg-red-500/30 transition">

              Delete Selected

            </button>

          </div>

        )}

      </div>



      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]">

        <div className="overflow-x-auto flex-1 flex flex-col">

          <div className="min-w-[900px] flex-1 flex flex-col">

            <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider items-center shrink-0">

              <div className="col-span-1 flex items-center">

                <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-[#0d5d3a] focus:ring-[#0d5d3a]" />

              </div>

              <div className="col-span-3">User</div>

              <div className="col-span-4">Subject & Message</div>

              <div className="col-span-2 text-center">Status</div>

              <div className="col-span-2 text-right">Actions</div>

            </div>



            <div className="overflow-y-auto flex-1 divide-y divide-[#0d5d3a]/5 dark:divide-white/5">

              {filtered.length === 0 ? (

                <div className="text-center py-16 text-[#4a7c5d] dark:text-gray-400 font-semibold">No tickets found.</div>

              ) : filtered.map(t => (

                <div key={t._id} className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-4 items-center hover:bg-[#fbfdfb] dark:hover:bg-[#1a1a1a] transition-colors ${selectedIds.has(t._id) ? 'bg-[#0d5d3a]/5 dark:bg-[#1a8a5a]/10' : ''}`}>

                  <div className="col-span-1">

                    <input type="checkbox" checked={selectedIds.has(t._id)} onChange={() => toggleSelect(t._id)} className="w-4 h-4 rounded border-gray-300 text-[#0d5d3a] focus:ring-[#0d5d3a]" />

                  </div>

                  <div className="col-span-3 overflow-hidden">

                    <div className="font-bold text-[#0a2617] dark:text-gray-100 text-sm truncate">{t.name}</div>

                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{t.email}</div>

                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{t.phone}</div>

                  </div>

                  <div className="col-span-4 overflow-hidden pr-4">

                    <div className="font-bold text-[#0a2617] dark:text-gray-100 text-sm truncate">{t.subject}</div>

                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 line-clamp-2 mt-1">{t.body}</div>

                    <div className="text-[10px] text-gray-400 mt-1">{new Date(t.createdAt).toLocaleString()}</div>

                  </div>

                  <div className="col-span-2 flex justify-center">

                    {t.status === 'resolved' ? (

                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">

                        <CheckCircle size={11} /> Resolved

                      </span>

                    ) : (

                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">

                        <Clock size={11} /> Pending

                      </span>

                    )}

                  </div>

                  <div className="col-span-2 flex justify-end gap-2 items-center">
                    <button onClick={() => deleteSingleTicket(t._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition" title="Delete Ticket">
                      <Trash2 size={16} />
                    </button>
                    <button onClick={() => setViewingTicket(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => toggleStatus(t._id)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-xs font-bold transition">
                      {t.status === 'pending' ? 'Mark Resolved' : 'Mark Pending'}
                    </button>
                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

      

      {viewingTicket && (

        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111111] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">

            <div className="flex justify-between items-center p-6 border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0">

              <h3 className="text-xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>

                Ticket Details

              </h3>

              <button onClick={() => setViewingTicket(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition"><X size={20} className="text-gray-500" /></button>

            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider">Name</p>

                  <p className="text-[#0a2617] dark:text-white font-medium">{viewingTicket.name}</p>

                </div>

                <div>

                  <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider">Email</p>

                  <p className="text-[#0a2617] dark:text-white font-medium">{viewingTicket.email}</p>

                </div>

                <div>

                  <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider">Phone</p>

                  <p className="text-[#0a2617] dark:text-white font-medium">{viewingTicket.phone}</p>

                </div>

                <div>

                  <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider">Date Submitted</p>

                  <p className="text-[#0a2617] dark:text-white font-medium">{new Date(viewingTicket.createdAt).toLocaleString()}</p>

                </div>

              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">

                <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider mb-1">Subject</p>

                <p className="text-[#0a2617] dark:text-white font-bold">{viewingTicket.subject}</p>

              </div>

              <div className="mt-4">

                <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider mb-1">Message</p>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl text-[#0a2617] dark:text-gray-300 whitespace-pre-wrap text-sm border border-gray-100 dark:border-white/5">

                  {viewingTicket.body}

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      )}

    </div>

  );

}



const CIRCLE_ICONS = ['C', 'P', 'S', 'H', 'M', 'F', 'T', 'R', 'G', 'L', 'D', 'B'];

const CIRCLE_CATS  = ['general','anxiety','depression','trauma','relationships','teen','stress','grief'];



function PeerCirclesManagement() {

  const [circles, setCircles]       = useState<any[]>([]);

  const [loading, setLoading]       = useState(true);

  const [showForm, setShowForm]     = useState(false);

  const [msg, setMsg]               = useState<{text:string;ok:boolean}|null>(null);

  const [saving, setSaving]         = useState(false);

  const [viewCircle, setViewCircle] = useState<any|null>(null);

  const [viewMsgs, setViewMsgs]     = useState<any[]>([]);

  const [msgsLoading, setMsgsLoading] = useState(false);

  // Suspend modal state

  const [suspendTarget, setSuspendTarget] = useState<{userId:string;name:string;circleId:string}|null>(null);

  const [suspendHours, setSuspendHours]   = useState(24);

  const [suspending, setSuspending]       = useState(false);



  const [name, setName]         = useState('');

  const [desc, setDesc]         = useState('');

  const [category, setCategory] = useState('general');

  const [icon, setIcon]         = useState('');

  const [gradFrom, setGradFrom] = useState('#0d5d3a');

  const [gradTo, setGradTo]     = useState('#1a8a5a');



  const load = async () => {

    setLoading(true);

    try { const r = await apiFetch<any>('/circles/admin/list'); setCircles(r.circles||[]); }

    catch(e:any){ setMsg({text:e.message,ok:false}); }

    finally { setLoading(false); }

  };

  useEffect(()=>{ load(); },[]);



  const openMessages = async (c:any) => {

    setViewCircle(c); setViewMsgs([]); setMsgsLoading(true);

    try { const r = await apiFetch<any>(`/circles/admin/${c._id}/messages?limit=100`); setViewMsgs(r.messages||[]); }

    catch(e:any){ setMsg({text:e.message,ok:false}); }

    finally { setMsgsLoading(false); }

  };



  const deleteMsg = async (msgId:string) => {

    try {

      await apiFetch(`/circles/admin/messages/${msgId}`,{method:'DELETE'});

      setViewMsgs(p=>p.filter((m:any)=>m._id!==msgId));

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

  };



  const removeMember = async (userId:string, circleId:string, msgId:string) => {

    if(!confirm('Remove this user from the circle?')) return;

    try {

      await apiFetch(`/circles/admin/members/${userId}/circle/${circleId}`,{method:'DELETE'});

      setViewMsgs(p=>p.filter((m:any)=>m._id!==msgId));

      setMsg({text:'User removed from circle.',ok:true});

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

  };



  const doSuspend = async () => {

    if(!suspendTarget) return;

    setSuspending(true);

    try {

      await apiFetch(`/admin/users/${suspendTarget.userId}/suspend`,{

        method:'PUT',

        body:JSON.stringify({durationHours:suspendHours})

      });

      // Also remove from circle

      await apiFetch(`/circles/admin/members/${suspendTarget.userId}/circle/${suspendTarget.circleId}`,{method:'DELETE'});

      setMsg({text:`${suspendTarget.name} suspended for ${suspendHours}h and removed from circle.`,ok:true});

      setSuspendTarget(null);

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

    finally { setSuspending(false); }

  };



  const toggleCircle = async (c:any) => {

    try {

      await apiFetch(`/circles/admin/${c._id}`,{method:'PUT',body:JSON.stringify({isActive:!c.isActive})});

      setCircles(p=>p.map(x=>x._id===c._id?{...x,isActive:!x.isActive}:x));

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

  };



  const deleteCircle = async (id:string) => {

    if(!confirm('Delete this circle and all its messages?')) return;

    try {

      await apiFetch(`/circles/admin/${id}`,{method:'DELETE'});

      setCircles(p=>p.filter(c=>c._id!==id));

      setMsg({text:'Circle deleted.',ok:true});

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

  };



  const createCircle = async(e:React.FormEvent) => {

    e.preventDefault(); if(!name.trim()) return;

    setSaving(true); setMsg(null);

    try {

      await apiFetch('/circles/admin',{method:'POST',body:JSON.stringify({

        name:name.trim(), description:desc.trim(), category, icon,

        gradientFrom:gradFrom, gradientTo:gradTo

      })});

      setMsg({text:' Circle created!',ok:true});

      setName(''); setDesc(''); setCategory('general'); setIcon('');

      setShowForm(false); load();

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

    finally { setSaving(false); }

  };



  if(loading) return <div className="text-[#4a7c5d] font-bold py-10 text-center">Loading circles...</div>;



  return (

    <div className="flex flex-col gap-6">

      {msg && (

        <div className={`p-4 rounded-xl font-semibold flex items-center gap-2 text-sm ${msg.ok?'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] border border-green-200 dark:border-[#10b981]/20':'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>

          {msg.ok?<CheckCircle size={16}/>:<AlertTriangle size={16}/>} {msg.text}

          <button onClick={()=>setMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={14}/></button>

        </div>

      )}



      <div className="flex items-center justify-start border-b border-[#0d5d3a]/10 dark:border-white/10 pb-3 shrink-0">
        <button onClick={()=>setShowForm(s=>!s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-sm hover:bg-[#0a4a2e] transition shadow-md">
          <Plus size={16}/> New Circle
        </button>
      </div>



      {/* Create Form */}

      {showForm && (

        <form onSubmit={createCircle} className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/15 dark:border-white/10 p-6 flex flex-col gap-4 shadow-sm">

          <h3 className="font-black text-[#0a2617] dark:text-white">Create New Circle</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <label className="block">

              <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide">Name *</span>

              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Anxiety Support"

                className="mt-1.5 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white"/>

            </label>

            <label className="block">

              <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide">Category</span>

              <select value={category} onChange={e=>setCategory(e.target.value)}

                className="mt-1.5 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0a2617] dark:text-white">

                {CIRCLE_CATS.map(c=><option key={c} value={c}>{c}</option>)}

              </select>

            </label>

            <label className="col-span-full block">

              <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide">Description</span>

              <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Short description visible to users"

                className="mt-1.5 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white"/>

            </label>

            <div>

              <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide block mb-2">Icon</span>

              <div className="flex flex-wrap gap-2">

                {CIRCLE_ICONS.map(i=>(

                  <button key={i} type="button" onClick={()=>setIcon(i)}

                    className={`w-10 h-10 rounded-xl text-xl border-2 transition ${icon===i?'border-[#0d5d3a] bg-[#e6f4ea] dark:bg-[#0d5d3a]/30':'border-transparent bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-white/10'}`}>

                    {i}

                  </button>

                ))}

              </div>

            </div>

            <div className="flex gap-4 items-end">

              <label>

                <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide block mb-2">From</span>

                <input type="color" value={gradFrom} onChange={e=>setGradFrom(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0"/>

              </label>

              <label>

                <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide block mb-2">To</span>

                <input type="color" value={gradTo} onChange={e=>setGradTo(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0"/>

              </label>

              <div className="w-12 h-10 rounded-xl flex-shrink-0 shadow-md" style={{background:`linear-gradient(135deg,${gradFrom},${gradTo})`}}/>

            </div>

          </div>

          <div className="flex gap-3 justify-end">

            <button type="button" onClick={()=>setShowForm(false)}

              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>

            <button type="submit" disabled={saving||!name.trim()}

              className="px-5 py-2 rounded-xl bg-[#0d5d3a] text-white font-bold text-sm hover:bg-[#0a4a2e] transition disabled:opacity-50">

              {saving?'Creating…':'Create Circle'}

            </button>

          </div>

        </form>

      )}



      {/* Circles Grid */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        {circles.map(c=>(

          <div key={c._id} className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/12 dark:border-white/8 p-5 flex flex-col gap-3 shadow-sm">

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md"

                  style={{background:`linear-gradient(135deg,${c.gradientFrom||'#0d5d3a'},${c.gradientTo||'#1a8a5a'})`}}>

                  {c.icon||''}

                </div>

                <div>

                  <div className="font-black text-[#0a2617] dark:text-white text-sm">{c.name}</div>

                  <div className="text-[10px] text-[#4a7c5d] dark:text-gray-400 capitalize mt-0.5">{c.category} · {c.memberCount||0} members · {c.messageCount||0} msgs</div>

                </div>

              </div>

              <button onClick={()=>toggleCircle(c)} title={c.isActive?'Disable circle':'Enable circle'}

                className={`flex-shrink-0 rounded-lg p-1.5 transition ${c.isActive?'text-[#10b981] hover:bg-green-50 dark:hover:bg-green-500/10':'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>

                {c.isActive

                  ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="17" cy="12" r="3" fill="currentColor"/></svg>

                  : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="7" cy="12" r="3" fill="currentColor"/></svg>

                }

              </button>

            </div>

            {c.description && <p className="text-xs text-[#4a7c5d] dark:text-gray-400 line-clamp-2">{c.description}</p>}

            <span className={`text-[10px] font-bold px-2 py-1 rounded-full w-fit ${c.isActive?'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400':'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-500'}`}>

              {c.isActive?'● Active':'○ Disabled'}

            </span>

            <div className="flex gap-2 mt-1">

              <button onClick={()=>openMessages(c)}

                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0d5d3a]/8 dark:bg-white/5 text-[#0d5d3a] dark:text-[#10b981] text-xs font-bold hover:bg-[#0d5d3a]/15 dark:hover:bg-white/10 transition">

                <MessageSquare size={13}/> View Messages

              </button>

              <button onClick={()=>deleteCircle(c._id)}

                className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Delete circle">

                <Trash2 size={15}/>

              </button>

            </div>

          </div>

        ))}

        {circles.length===0 && (

          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08">

            <div className="text-5xl mb-3"></div>

            <div className="font-bold text-[#0a2617] dark:text-white mb-1">No circles yet</div>

            <div className="text-sm text-[#4a7c5d] dark:text-gray-400">Click "New Circle" to create the first peer support space.</div>

          </div>

        )}

      </div>



      {/* Messages Modal */}

      <AnimatePresence>

        {viewCircle && (

          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}

              className="bg-white dark:bg-[#111111] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-[#0d5d3a]/10 dark:border-white/10">

              <div className="flex items-center justify-between p-5 border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0">

                <div>

                  <h3 className="font-black text-[#0a2617] dark:text-white" style={{fontFamily:'Syne,sans-serif'}}>

                    {viewCircle.icon} {viewCircle.name} — Messages

                  </h3>

                  <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-0.5">Hover a message and click ️ to moderate</p>

                </div>

                <button onClick={()=>setViewCircle(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">

                  <X size={18} className="text-gray-500"/>

                </button>

              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">

                {msgsLoading && <div className="text-center py-10 text-[#4a7c5d] font-bold">Loading messages…</div>}

                {!msgsLoading && viewMsgs.length===0 && <div className="text-center py-10 text-gray-400 font-medium">No messages in this circle yet.</div>}

                {!msgsLoading && viewMsgs.map((m:any)=>(

                  <div key={m._id} className="flex items-start gap-3 p-3 rounded-xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/8 dark:border-white/5 group">

                    <div className="w-8 h-8 rounded-full bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] font-bold text-xs flex items-center justify-center flex-shrink-0">

                      {(m.authorName||'?').charAt(0).toUpperCase()}

                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center gap-2 mb-1">

                        <span className="text-xs font-bold text-[#0a2617] dark:text-white">{m.authorName||'Anonymous'}</span>

                        {m.isAnonymous && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 font-semibold">Anon</span>}

                        <span className="text-[10px] text-gray-400 ml-auto">{new Date(m.createdAt).toLocaleString()}</span>

                      </div>

                      <p className="text-sm text-[#0a2617] dark:text-gray-300 break-words leading-relaxed">{m.content}</p>

                      {/* Action buttons — visible on hover */}

                      <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">

                        <button onClick={()=>deleteMsg(m._id)}

                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Delete message">

                          <Trash2 size={11}/> Delete Msg

                        </button>

                        {m.userId && !m.isAnonymous && (

                          <>

                            <button onClick={()=>removeMember(m.userId, viewCircle._id, m._id)}

                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition">

                              <UserX size={11}/> Remove from Circle

                            </button>

                            <button onClick={()=>setSuspendTarget({userId:m.userId, name:m.authorName, circleId:viewCircle._id})}

                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition">

                              <Clock size={11}/> Suspend User

                            </button>

                          </>

                        )}

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </motion.div>

          </div>

        )}

      </AnimatePresence>



      {/* Suspend Modal */}

      <AnimatePresence>

        {suspendTarget && (

          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}

              className="bg-white dark:bg-[#111111] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-[#0d5d3a]/15 dark:border-white/10">

              <h3 className="font-black text-[#0a2617] dark:text-white mb-1 flex items-center gap-2" style={{fontFamily:'Syne,sans-serif'}}>

                <Clock size={16} className="text-purple-500" /> Timed Suspension

              </h3>

              <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mb-5">Suspending <strong className="text-[#0a2617] dark:text-white">{suspendTarget.name}</strong>. They will be auto-unsuspended after the set duration.</p>

              <div className="mb-5">

                <label className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide block mb-2">Suspension Duration</label>

                <div className="grid grid-cols-3 gap-2 mb-3">

                  {[1,6,12,24,48,72].map(h=>(

                    <button key={h} onClick={()=>setSuspendHours(h)}

                      className={`py-2 rounded-xl text-xs font-bold border-2 transition ${suspendHours===h?'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300':'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-purple-300'}`}>

                      {h}h

                    </button>

                  ))}

                </div>

                <div className="flex items-center gap-3">

                  <input type="number" min={1} max={720} value={suspendHours} onChange={e=>setSuspendHours(Number(e.target.value))}

                    className="flex-1 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400 text-[#0a2617] dark:text-white"/>

                  <span className="text-sm text-[#4a7c5d] font-semibold">hours</span>

                </div>

                <p className="text-[10px] text-[#4a7c5d] dark:text-gray-500 mt-2">

                  Auto-unsuspends: <strong>{new Date(Date.now()+suspendHours*3600000).toLocaleString()}</strong>

                </p>

              </div>

              <div className="flex gap-3">

                <button onClick={()=>setSuspendTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>

                <button onClick={doSuspend} disabled={suspending}

                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition disabled:opacity-50">

                  {suspending ? 'Suspending…' : `Suspend ${suspendHours}h`}

                </button>

              </div>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

    </div>

  );

}



/* ────────────────────────────────────────────────────────────────────────────────────────────────── 

   QUIZ QUESTIONS MANAGEMENT

────────────────────────────────────────────────────────────────────────────────────────────────── */

const DEFAULT_QUIZ_QUESTIONS = [
  { id:'concern',    question:"What's been weighing on you lately?",   options:['Anxiety & Stress','Depression & Low Mood','Relationship Issues','Trauma & PTSD','Teen / Youth Support',"I'm not sure yet"] },
  { id:'situation',  question:'How would you describe your situation?', options:['I need someone to talk to','I want structured therapy',"I'm in crisis, need help now",'Just exploring my options'] },
  { id:'format',     question:'Session format preference?',             options:['Online — from home','In-person at clinic','Either works for me'] },
  { id:'budget',     question:"What's your budget per session?",        options:['Under ₹500','₹500 – ₹1,000','₹1,000+','No preference'] },
  { id:'language',   question:'Language preference?',                   options:['English','Hindi','Both are fine','No preference'] },
  { id:'experience', question:'Experience level preference?',           options:['New but passionate (1–3 yrs)','Experienced (3–5 yrs)','Highly seasoned (5+ yrs)',"Doesn't matter"] },
];



function QuizManagement() {

  const [questions, setQuestions] = useState(DEFAULT_QUIZ_QUESTIONS.map(q=>({...q,enabled:true})));

  const [saved, setSaved] = useState(false);



  const toggle = (id:string) => {

    setQuestions(p=>p.map(q=>q.id===id?{...q,enabled:!q.enabled}:q));

    setSaved(false);

  };



  const enabledCount = questions.filter(q=>q.enabled).length;



  return (

    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="p-4 rounded-xl bg-[#f0fbf4] dark:bg-[#0d1f14] border border-[#0d5d3a]/10 dark:border-white/5 text-sm text-[#4a7c5d] dark:text-gray-400 font-medium">
        These are the 6 questions shown in the "Find My Therapist" AI quiz. Toggle any question off to skip it in the quiz flow for users.
      </div>



      {saved && (

        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] font-semibold text-sm border border-green-200 dark:border-[#10b981]/20">

          <CheckCircle size={16}/> Configuration saved — {enabledCount} of {questions.length} questions active.

          <button onClick={()=>setSaved(false)} className="ml-auto opacity-60 hover:opacity-100"><X size={14}/></button>

        </div>

      )}



      <div className="flex flex-col gap-3">

        {questions.map((q,i)=>(

          <div key={q.id}

            className={`bg-white dark:bg-[#111111] rounded-2xl border-2 p-5 transition-all ${q.enabled?'border-[#0d5d3a]/15 dark:border-white/10':'border-gray-200 dark:border-white/5 opacity-55'}`}>

            <div className="flex items-start gap-4">

              <div className="w-9 h-9 rounded-xl bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 flex items-center justify-center font-black text-[#0d5d3a] dark:text-[#10b981] text-sm flex-shrink-0">

                {i+1}

              </div>

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-[#0a2617] dark:text-white text-sm">{q.question}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">

                  {q.options.map(opt=>(

                    <span key={opt} className="px-2.5 py-1 bg-[#f4fbf6] dark:bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] rounded-lg text-[10px] font-semibold border border-[#0d5d3a]/10 dark:border-[#10b981]/10">

                      {opt}

                    </span>

                  ))}

                </div>

              </div>

              {/* Toggle switch */}

              <button onClick={()=>toggle(q.id)} title={q.enabled?'Disable this question':'Enable this question'}

                className={`flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 relative ${q.enabled?'bg-[#0d5d3a] dark:bg-[#10b981]':'bg-gray-300 dark:bg-gray-600'}`}>

                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${q.enabled?'left-6':'left-0.5'}`}/>

              </button>

            </div>

          </div>

        ))}

      </div>



      <div className="flex items-center gap-4 pt-2">

        <button onClick={()=>setSaved(true)}

          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-sm hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition shadow-md">

          <Save size={16}/> Save Configuration

        </button>

        <p className="text-xs text-[#4a7c5d] dark:text-gray-500 font-medium">

          {enabledCount} of {questions.length} questions active

        </p>

      </div>

    </div>

  );

}



/* ────────────────────────────────────────────────────────────────────────────────────────────────── 

   Profanity detection engine 

────────────────────────────────────────────────────────────────────────────────────────────────── */



// Plain word patterns (matched on normalized text)

const BAD_WORDS: string[] = [

  // ── English — sexual ──

  'fuck','fucker','fucking','fucked','fck','fuk','fvck','phuck','f u c k',

  'shit','sht','sh1t','shyt','shitting','bullshit',

  'bitch','b1tch','biatch','bytch','btch',

  'ass','arse','asshole','arsehole','asswipe','jackass','dumbass','smartass',

  'dick','d1ck','dik','cock','c0ck','cuck','cocks',

  'pussy','p*ssy','puss','vagina','penis','cunt','c*nt',

  'whore','slut','hoe','ho','skank','tramp',

  'porn','porno','xxx','nude','naked','nsfw','sex','sexting','boobs','tits','boob',

  'masturbat','orgasm','ejacul','erection','horny','pervert',

  // ── English — violence / threats ──

  'kill','murder','stab','shoot','bomb','terrorist','attack','harm','hurt',

  'rape','rapist','molest','abuse','beat you','beat him','beat her',

  'die','drop dead','go die','kys','kill yourself','end your life',

  'suicide','suicidal','self harm','cut yourself','overdose','hang yourself',

  // ── English — slurs ──

  'nigger','nigga','nig','negro','spic','chink','gook','wetback','kike',

  'faggot','fag','dyke','tranny','retard','retarded','spastic','cripple',

  // ── English — hate / toxic ──

  'hate you','i hate','loser','moron','idiot','stupid','dumb','fool','ugly',

  'worthless','useless','pathetic','disgusting','trash','garbage','scum',

  'bastard','son of a bitch','sob','prick','wanker','twat','bellend',

  // ── Abbreviations / shortcuts ──

  'mf','mfr','stfu','gtfo','wtf','omfg','lmfao','af','ffs','pos',

  'foff','f off','fu','foh','fhritp',

  // ── Hindi / Urdu profanity ──

  'chutiya','chutiye','chu','bc','bkl','bsdk','bhenchod','bhainchod',

  'madarchod','mc','maderchod','gaand','gand','lund','lauda','lavda',

  'randi','rand','harami','haramzada','haramkhor','kamina','kameena',

  'gandu','saala','sala','ullu','kutte','kutta','suar','chinal',

  'behenchod','behenchodi','maa ki','teri maa','teri behen','behen ke',

  'teri gand','tere baap','aukaat','jhaat','jhatu','lawde','chod',

  'chodna','chodega','chudai','chudwa','randa','randwa',

  // ── Urdu / Punjabi ──

  'choot','chooti','madar','madarjat','harami','haram',

  // ── Drug references ──

  'cocaine','heroin','weed','marijuana','meth','crack','drug','drugs',

];



// Regex patterns for spaced/symbolic variants

const BAD_PATTERNS: RegExp[] = [

  /f[\W_]*u[\W_]*c[\W_]*k/i,

  /s[\W_]*h[\W_]*i[\W_]*t/i,

  /b[\W_]*i[\W_]*t[\W_]*c[\W_]*h/i,

  /a[\W_]*s[\W_]*s[\W_]*h[\W_]*o[\W_]*l[\W_]*e/i,

  /c[\W_]*u[\W_]*n[\W_]*t/i,

  /n[\W_]*i[\W_]*g[\W_]*g[\W_]*[ae]/i,

  /k[\W_]*y[\W_]*s/i,           // kys

  /m[\W_]*f[\W_]*r?/i,          // mf / mfr

  /s[\W_]*t[\W_]*f[\W_]*u/i,    // stfu

  /g[\W_]*t[\W_]*f[\W_]*o/i,    // gtfo

  /b[\W_]*h[\W_]*e[\W_]*n[\W_]*c[\W_]*h[\W_]*o[\W_]*d/i,

  /m[\W_]*a[\W_]*d[\W_]*a[\W_]*r[\W_]*c[\W_]*h[\W_]*o[\W_]*d/i,

  /c[\W_]*h[\W_]*u[\W_]*t[\W_]*i[\W_]*y[\W_]*a/i,

];



// Normalize leetspeak/symbol substitutions

function normalizeLeet(text: string): string {

  return text

    .toLowerCase()

    .replace(/@/g, 'a').replace(/3/g, 'e').replace(/1/g, 'i')

    .replace(/0/g, 'o').replace(/5/g, 's').replace(/\$/g, 's')

    .replace(/7/g, 't').replace(/8/g, 'b').replace(/4/g, 'a')

    .replace(/\+/g, 't').replace(/!/g, 'i').replace(/\|/g, 'i');

}



function containsBadWord(text: string): string[] {

  const normalized = normalizeLeet(text);

  const found: string[] = [];

  // Plain word check on normalized text

  for (const word of BAD_WORDS) {

    if (normalized.includes(word)) found.push(word);

  }

  // Regex pattern check on original (catches spaced-out variants)

  for (const pattern of BAD_PATTERNS) {

    const m = text.match(pattern);

    if (m && !found.includes(m[0])) found.push(m[0]);

  }

  return [...new Set(found)];

}



function SuspendCountdown({ until }: { until: string }) {

  const [remaining, setRemaining] = useState('');

  useEffect(() => {

    const update = () => {

      const diff = new Date(until).getTime() - Date.now();

      if (diff <= 0) { setRemaining('Expired'); return; }

      const h = Math.floor(diff / 3600000);

      const m = Math.floor((diff % 3600000) / 60000);

      const s = Math.floor((diff % 60000) / 1000);

      setRemaining(`${h}h ${m}m ${s}s`);

    };

    update();

    const id = setInterval(update, 1000);

    return () => clearInterval(id);

  }, [until]);

  return <span className="font-mono text-purple-600 dark:text-purple-300">{remaining}</span>;

}



function FlaggedContent() {

  const [messages, setMessages]     = useState<any[]>([]);

  const [filtered, setFiltered]     = useState<any[]>([]);

  const [loading, setLoading]       = useState(true);

  const [msg, setMsg]               = useState<{text:string;ok:boolean}|null>(null);

  const [suspendTarget, setSuspendTarget] = useState<{userId:string;name:string;circleId:string}|null>(null);

  const [suspendHours, setSuspendHours]   = useState(24);

  const [suspending, setSuspending]       = useState(false);



  const load = async () => {

    setLoading(true);

    try {

      const r = await apiFetch<any>('/circles/admin/flagged');

      const all = r.messages || [];

      // Filter client-side using bad word list

      const flagged = all

        .map((m: any) => ({ ...m, flaggedWords: containsBadWord(m.content) }))

        .filter((m: any) => m.flaggedWords.length > 0);

      setMessages(all);

      setFiltered(flagged);

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

    finally { setLoading(false); }

  };

  useEffect(() => { load(); }, []);



  const deleteMsg = async (msgId: string) => {

    try {

      await apiFetch(`/circles/admin/messages/${msgId}`, { method: 'DELETE' });

      setFiltered(p => p.filter((m: any) => m._id !== msgId));

      setMsg({ text: 'Message removed.', ok: true });

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

  };



  const removeMember = async (userId: string, circleId: string, msgId: string) => {

    if (!confirm('Remove this user from the circle?')) return;

    try {

      await apiFetch(`/circles/admin/members/${userId}/circle/${circleId}`, { method: 'DELETE' });

      setFiltered(p => p.filter((m: any) => m._id !== msgId));

      setMsg({ text: 'User removed from circle.', ok: true });

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

  };



  const doSuspend = async () => {

    if (!suspendTarget) return;

    setSuspending(true);

    try {

      await apiFetch(`/admin/users/${suspendTarget.userId}/suspend`, {

        method: 'PUT', body: JSON.stringify({ durationHours: suspendHours })

      });

      await apiFetch(`/circles/admin/members/${suspendTarget.userId}/circle/${suspendTarget.circleId}`, { method: 'DELETE' });

      setMsg({ text: `${suspendTarget.name} suspended for ${suspendHours}h.`, ok: true });

      setSuspendTarget(null);

    } catch(e:any){ setMsg({text:e.message,ok:false}); }

    finally { setSuspending(false); }

  };



  return (

    <div className="flex flex-col gap-6">

      {msg && (

        <div className={`p-4 rounded-xl font-semibold flex items-center gap-2 text-sm ${msg.ok?'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] border border-green-200 dark:border-[#10b981]/20':'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>

          {msg.ok?<CheckCircle size={16}/>:<AlertTriangle size={16}/>} {msg.text}

          <button onClick={()=>setMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={14}/></button>

        </div>

      )}



      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#0d5d3a]/10 dark:border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle size={14} /> 
            {loading ? 'Scanning…' : `${filtered.length} flagged messages`}
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#f0fbf4] dark:bg-[#0d1f14] border border-[#0d5d3a]/10 dark:border-white/5 text-xs text-[#4a7c5d] dark:text-gray-400 hidden lg:block">
            {BAD_WORDS.length} patterns scanned. Anonymous msgs can only be deleted.
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white text-xs font-bold hover:bg-[#0a4a2e] transition shadow-md shrink-0">
          <RefreshCw size={14} /> Rescan
        </button>
      </div>



      {loading && <div className="text-center py-20 text-[#4a7c5d] font-bold">Scanning all circle messages…</div>}



      {!loading && filtered.length === 0 && (

        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08">

          <div className="text-5xl mb-3"></div>

          <div className="font-bold text-[#0a2617] dark:text-white mb-1">No flagged content</div>

          <div className="text-sm text-[#4a7c5d] dark:text-gray-400">All messages are clean. Last scanned {new Date().toLocaleTimeString()}.</div>

        </div>

      )}



      <div className="flex flex-col gap-3">

        {filtered.map((m:any) => (

          <div key={m._id} className="bg-white dark:bg-[#111111] rounded-2xl border-2 border-red-200 dark:border-red-500/20 p-5 shadow-sm">

            {/* Header */}

            <div className="flex items-start justify-between gap-3 mb-3">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-lg flex-shrink-0">{m.circleIcon}</div>

                <div>

                  <div className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wide">{m.circleName}</div>

                  <div className="font-bold text-[#0a2617] dark:text-white text-sm flex items-center gap-1.5">

                    {m.authorName || 'Anonymous'}

                    {m.isAnonymous && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 font-semibold">Anon</span>}

                  </div>

                  <div className="text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>

                </div>

              </div>

              <div className="flex flex-wrap gap-1.5 justify-end">

                {m.flaggedWords.map((w:string) => (

                  <span key={w} className="px-2 py-0.5 bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 text-[10px] font-bold rounded-full border border-red-200 dark:border-red-500/20">

                    âš ï¸ {w}

                  </span>

                ))}

              </div>

            </div>



            {/* Message content — bad words highlighted */}

            <div className="bg-red-50/50 dark:bg-red-500/5 rounded-xl p-3 mb-3 text-sm text-[#0a2617] dark:text-gray-300 border border-red-100 dark:border-red-500/10 leading-relaxed">

              {m.content}

            </div>



            {/* Actions */}

            <div className="flex flex-wrap gap-2">

              <button onClick={()=>deleteMsg(m._id)}

                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 transition">

                <Trash2 size={12}/> Delete Message

              </button>

              {m.userId && !m.isAnonymous && (

                <>

                  <button onClick={()=>removeMember(m.userId, m.circleId, m._id)}

                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 transition">

                    <UserX size={12}/> Remove from Circle

                  </button>

                  <button onClick={()=>setSuspendTarget({userId:m.userId, name:m.authorName, circleId:m.circleId})}

                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 transition">

                    <Clock size={12}/> Timed Suspend

                  </button>

                </>

              )}

            </div>

          </div>

        ))}

      </div>



      {/* Suspend Modal */}

      <AnimatePresence>

        {suspendTarget && (

          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}

              className="bg-white dark:bg-[#111111] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-[#0d5d3a]/15 dark:border-white/10">

              <h3 className="font-black text-[#0a2617] dark:text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>â³ Timed Suspension</h3>

              <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mb-5">

                Suspending <strong className="text-[#0a2617] dark:text-white">{suspendTarget.name}</strong>. Auto-unsuspended after the set duration.

              </p>

              <div className="mb-5">

                <label className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide block mb-2">Duration</label>

                <div className="grid grid-cols-3 gap-2 mb-3">

                  {[1,6,12,24,48,72].map(h=>(

                    <button key={h} onClick={()=>setSuspendHours(h)}

                      className={`py-2 rounded-xl text-xs font-bold border-2 transition ${suspendHours===h?'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300':'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-purple-300'}`}>

                      {h}h

                    </button>

                  ))}

                </div>

                <div className="flex items-center gap-3">

                  <input type="number" min={1} max={720} value={suspendHours} onChange={e=>setSuspendHours(Number(e.target.value))}

                    className="flex-1 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400 text-[#0a2617] dark:text-white"/>

                  <span className="text-sm text-[#4a7c5d] font-semibold">hours</span>

                </div>

                <p className="text-[10px] text-[#4a7c5d] dark:text-gray-500 mt-2">

                  Live countdown: <SuspendCountdown until={new Date(Date.now()+suspendHours*3600000).toISOString()}/>

                </p>

              </div>

              <div className="flex gap-3">

                <button onClick={()=>setSuspendTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>

                <button onClick={doSuspend} disabled={suspending}

                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition disabled:opacity-50">

                  {suspending ? 'Suspending…' : `Suspend ${suspendHours}h`}

                </button>

              </div>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

    </div>

  );

}




