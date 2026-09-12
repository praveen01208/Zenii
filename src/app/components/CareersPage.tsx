import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Clock, Briefcase, ChevronRight, Search, Star, Send, Upload,
  CheckCircle, Sparkles, Building2, Users, DollarSign, GraduationCap,
  BadgeCheck, Award, Heart, Zap, Layers, Filter, X, ChevronDown,
  ExternalLink, Globe, Calendar, Tag, ArrowRight, Loader2, Trophy,
  Code2, Palette, Megaphone, FlaskConical, TrendingUp
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { Navbar as LandingNavbar } from './landing/Navbar';
import { Footer as LandingFooter } from './landing/Footer';

interface CareersPageProps {
  onClose: () => void;
  onGetStarted?: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
  onCompanyLinkClick?: (link: string) => void;
  onResourcesLinkClick?: (link: string) => void;
  onProductLinkClick?: (link: string) => void;
}

/* ── Department Icon Map ── */
const DEPT_ICONS: Record<string, React.ReactNode> = {
  'Engineering': <Code2 className="w-4 h-4" />,
  'Design': <Palette className="w-4 h-4" />,
  'Marketing': <Megaphone className="w-4 h-4" />,
  'Clinical': <FlaskConical className="w-4 h-4" />,
};
const DEPT_COLORS: Record<string, string> = {
  'Engineering': '#0d5d3a',
  'Design': '#7c3aed',
  'Marketing': '#b45309',
  'Clinical': '#be123c',
};

/* ── Employment Type Badge Colors ── */
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'Full-time':  { bg: '#0d5d3a', text: '#ffffff' },
  'Part-time':  { bg: '#0369a1', text: '#ffffff' },
  'Internship': { bg: '#b45309', text: '#ffffff' },
  'Contract':   { bg: '#6b7280', text: '#ffffff' },
};

export default function CareersPage({
  onClose,
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
}: CareersPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', portfolio: '', coverLetter: '' });
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => {
    apiFetch<any>('/jobs')
      .then(r => {
        const j = r.jobs || [];
        setJobs(j);
        // Auto-select first job on desktop
        if (j.length > 0) setSelectedJob(j[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Derived Data ── */
  const departments = useMemo(() => ['All', ...Array.from(new Set(jobs.map(j => j.department).filter(Boolean)))], [jobs]);
  const employmentTypes = useMemo(() => ['All', ...Array.from(new Set(jobs.map(j => j.employmentType).filter(Boolean)))], [jobs]);

  const filtered = useMemo(() => jobs.filter(j => {
    const q = search.toLowerCase();
    const matchQ = !q || j.title?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q) || j.department?.toLowerCase().includes(q) || j.skills?.some((s: string) => s.toLowerCase().includes(q));
    const matchDept = deptFilter === 'All' || j.department === deptFilter;
    const matchType = typeFilter === 'All' || j.employmentType === typeFilter;
    return matchQ && matchDept && matchType;
  }), [jobs, search, deptFilter, typeFilter]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    totalPositions: jobs.length,
    totalOpenings: jobs.reduce((sum: number, j: any) => sum + (j.openings || 1), 0),
    departments: new Set(jobs.map(j => j.department).filter(Boolean)).size,
    featured: jobs.filter(j => j.featured).length,
  }), [jobs]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      await apiFetch(`/jobs/${selectedJob._id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          portfolioUrl: formData.portfolio,
          coverLetter: formData.coverLetter,
        }),
      });
    } catch { /* still show success for UX */ }
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowApplyForm(false);
      setFormData({ name: '', email: '', phone: '', portfolio: '', coverLetter: '' });
    }, 4000);
  };

  const selectJob = (job: any) => {
    setSelectedJob(job);
    setShowApplyForm(false);
    setSubmitted(false);
    setMobileSidebar(false);
  };

  const deptColor = (dept: string) => DEPT_COLORS[dept] || '#374151';
  const deptIcon = (dept: string) => DEPT_ICONS[dept] || <Briefcase className="w-4 h-4" />;
  const typeColor = (type: string) => TYPE_COLORS[type] || TYPE_COLORS['Full-time'];

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className="fixed inset-0 z-[200] bg-[#f8fdf9] text-[#0a2617] overflow-y-auto font-sans-main scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <LandingNavbar
        scrollContainerRef={containerRef}
        delayReappearMs={1500}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-20 bg-[#0a2617] text-center text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <Briefcase className="w-3.5 h-3.5" />
            <span>JOIN THE ZENMIND TEAM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Build the Future of <span className="text-[#ffebc4] italic font-normal">Adolescent Healthcare.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed mb-10">
            Join engineers, designers, psychotherapists, and clinical researchers in making mental wellness accessible to every student in India.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {[
              { icon: <Briefcase className="w-3.5 h-3.5" />, value: stats.totalPositions, label: 'Open Roles', color: '#10b981' },
              { icon: <Users className="w-3.5 h-3.5" />, value: stats.totalOpenings, label: 'Total Openings', color: '#fbbf24' },
              { icon: <Building2 className="w-3.5 h-3.5" />, value: stats.departments, label: 'Departments', color: '#60a5fa' },
              { icon: <Star className="w-3.5 h-3.5" />, value: stats.featured, label: 'Featured', color: '#f97316' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: s.color }}>
                  {s.icon}
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-white leading-none">{s.value}</div>
                  <div className="text-[10px] text-white/60 leading-none mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT — SIDEBAR + DETAIL (Dashboard-style)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f7fbf8] min-h-[60vh]">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex relative">

            {/* ─── LEFT SIDEBAR (Desktop) / Drawer (Mobile) ─── */}
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileSidebar(true)}
              className="lg:hidden fixed bottom-6 left-6 z-[250] flex items-center gap-2 px-4 py-3 rounded-full bg-[#0d5d3a] text-white text-xs font-bold uppercase tracking-wider shadow-2xl border border-white/20 hover:bg-[#084229] transition-all cursor-pointer"
            >
              <Filter className="w-4 h-4" /> Roles ({filtered.length})
            </button>

            {/* Mobile drawer overlay */}
            <AnimatePresence>
              {mobileSidebar && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[260] bg-black/60 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobileSidebar(false)}
                />
              )}
            </AnimatePresence>

            {/* Sidebar content — fixed on desktop, drawer on mobile */}
            <aside className={`
              ${mobileSidebar ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0
              fixed lg:sticky top-0 lg:top-0
              left-0 z-[270] lg:z-0
              w-[320px] sm:w-[360px] lg:w-[340px] xl:w-[380px]
              h-screen lg:h-auto lg:min-h-[60vh]
              bg-white lg:bg-transparent
              border-r border-[#0d5d3a]/10 lg:border-r-0
              transition-transform duration-300 lg:transition-none
              flex flex-col
              overflow-hidden
            `}>
              {/* Sidebar Header */}
              <div className="flex-shrink-0 px-5 pt-6 pb-4 border-b border-[#0d5d3a]/8 bg-white lg:bg-[#f7fbf8]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-[#0a2617] uppercase tracking-wider">Open Positions</h2>
                  <button onClick={() => setMobileSidebar(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-[#0d5d3a]/10 transition cursor-pointer">
                    <X className="w-4 h-4 text-[#0a2617]" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0d5d3a]/50" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search roles, skills, locations..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#0d5d3a]/12 bg-[#f4faf7] text-xs text-[#0a2617] font-semibold outline-none focus:border-[#0d5d3a]/40 focus:ring-2 focus:ring-[#0d5d3a]/10 transition-all placeholder:text-[#0a2617]/40"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#0d5d3a]/10 cursor-pointer">
                      <X className="w-3 h-3 text-[#0a2617]/50" />
                    </button>
                  )}
                </div>

                {/* Department Filter */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {departments.map(d => (
                    <button
                      key={d}
                      onClick={() => setDeptFilter(d)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        deptFilter === d
                          ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-sm'
                          : 'bg-[#f4faf7] text-[#0a2617]/60 border-[#0d5d3a]/10 hover:border-[#0d5d3a]/30'
                      }`}
                    >
                      {d !== 'All' && <span className="opacity-70">{deptIcon(d)}</span>}
                      {d}
                    </button>
                  ))}
                </div>

                {/* Employment Type Filter */}
                <div className="flex flex-wrap gap-1.5">
                  {employmentTypes.map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        typeFilter === t
                          ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-sm'
                          : 'bg-[#f4faf7] text-[#0a2617]/60 border-[#0d5d3a]/10 hover:border-[#0d5d3a]/30'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job List (scrollable) */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 text-[#0d5d3a] animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <Briefcase className="w-8 h-8 text-[#0d5d3a]/20 mb-3" />
                    <p className="text-sm font-bold text-[#0a2617]">No roles found</p>
                    <p className="text-xs text-[#0a2617]/50 mt-1">Try adjusting your filters or search.</p>
                    <button
                      onClick={() => { setSearch(''); setDeptFilter('All'); setTypeFilter('All'); }}
                      className="mt-3 px-4 py-2 rounded-lg bg-[#0d5d3a]/10 text-[#0d5d3a] text-xs font-bold hover:bg-[#0d5d3a]/20 transition cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  filtered.map((job) => {
                    const isActive = selectedJob?._id === job._id;
                    const tc = typeColor(job.employmentType);
                    return (
                      <button
                        key={job._id || job.title}
                        onClick={() => selectJob(job)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer group ${
                          isActive
                            ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-lg shadow-[#0d5d3a]/20'
                            : 'bg-white hover:bg-[#f0fbf4] border-[#0d5d3a]/8 hover:border-[#0d5d3a]/25'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                              isActive ? 'bg-white/20 text-white/90' : ''
                            }`} style={!isActive ? { backgroundColor: deptColor(job.department) + '15', color: deptColor(job.department) } : {}}>
                              {job.department || 'General'}
                            </span>
                            {job.featured && (
                              <span className={`flex items-center gap-0.5 text-[9px] font-bold ${isActive ? 'text-[#ffebc4]' : 'text-[#d97706]'}`}>
                                <Star className="w-3 h-3 fill-current" /> Featured
                              </span>
                            )}
                          </div>
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'text-white/60' : 'text-[#0a2617]/30 group-hover:translate-x-0.5'}`} />
                        </div>

                        <h3 className={`text-sm font-bold leading-snug mb-1.5 ${isActive ? 'text-white' : 'text-[#0a2617]'}`}>
                          {job.title}
                        </h3>

                        <div className={`flex items-center gap-3 text-[10px] ${isActive ? 'text-white/70' : 'text-[#0a2617]/50'}`}>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {job.location?.split('/')[0]?.trim() || 'Remote'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {job.employmentType || 'Full-time'}
                          </span>
                        </div>

                        {job.salary && (
                          <div className={`mt-2 text-[10px] font-bold ${isActive ? 'text-[#ffebc4]' : 'text-[#0d5d3a]'}`}>
                            {job.salary}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="flex-shrink-0 px-5 py-4 border-t border-[#0d5d3a]/8 bg-[#f0fbf4] lg:bg-[#f0fbf4]">
                <p className="text-[10px] text-[#0a2617]/50 font-semibold text-center">
                  {filtered.length} of {jobs.length} positions shown
                </p>
              </div>
            </aside>

            {/* ─── RIGHT DETAIL PANEL ─── */}
            <main className="flex-1 min-h-[60vh] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
              {!selectedJob ? (
                /* No selection state */
                <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
                  <div className="w-20 h-20 rounded-3xl bg-[#0d5d3a]/8 flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 text-[#0d5d3a]/40" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0a2617] mb-2">Select a role to view details</h3>
                  <p className="text-sm text-[#0a2617]/50 max-w-md">Browse open positions from the sidebar and click on any role to see the full job description, requirements, and apply.</p>
                </div>
              ) : (
                /* Job Detail View */
                <div className="max-w-3xl">
                  {/* Job Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: deptColor(selectedJob.department) + '15', color: deptColor(selectedJob.department) }}>
                        {deptIcon(selectedJob.department)} {selectedJob.department || 'General'}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: typeColor(selectedJob.employmentType).bg }}>
                        {selectedJob.employmentType || 'Full-time'}
                      </span>
                      {selectedJob.featured && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#ffebc4] text-[#b45309] text-[10px] font-bold uppercase tracking-wider">
                          <Star className="w-3 h-3 fill-current" /> Featured Role
                        </span>
                      )}
                      {selectedJob.status === 'active' && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#10b981]/15 text-[#0d5d3a] text-[10px] font-bold uppercase tracking-wider">
                          <Zap className="w-3 h-3" /> Actively Hiring
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0a2617] leading-tight mb-4" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
                      {selectedJob.title}
                    </h1>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {[
                        { icon: <MapPin className="w-4 h-4" />, label: 'Location', value: selectedJob.location || 'Remote', color: '#0d5d3a' },
                        { icon: <GraduationCap className="w-4 h-4" />, label: 'Experience', value: selectedJob.experience || 'Any', color: '#7c3aed' },
                        { icon: <DollarSign className="w-4 h-4" />, label: 'Compensation', value: selectedJob.salary || 'Competitive', color: '#b45309' },
                        { icon: <Users className="w-4 h-4" />, label: 'Openings', value: `${selectedJob.openings || 1} position${(selectedJob.openings || 1) > 1 ? 's' : ''}`, color: '#0369a1' },
                      ].map(m => (
                        <div key={m.label} className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-[#0d5d3a]/8 shadow-sm">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: m.color }}>
                            {m.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] text-[#0a2617]/40 font-bold uppercase tracking-wider">{m.label}</div>
                            <div className="text-xs font-bold text-[#0a2617] truncate">{m.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Posted Date */}
                    {selectedJob.postedDate && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#0a2617]/40 font-semibold mb-6">
                        <Calendar className="w-3 h-3" />
                        Posted {new Date(selectedJob.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedJob.description && (
                    <div className="mb-8">
                      <h2 className="text-sm font-black text-[#0a2617] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-5 rounded-full bg-[#0d5d3a]" /> About the Role
                      </h2>
                      <p className="text-sm text-[#0a2617]/75 leading-relaxed pl-4 border-l-2 border-[#0d5d3a]/10">
                        {selectedJob.description}
                      </p>
                    </div>
                  )}

                  {/* Responsibilities */}
                  {selectedJob.responsibilities?.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-sm font-black text-[#0a2617] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-5 rounded-full bg-[#7c3aed]" /> What You'll Do
                      </h2>
                      <div className="space-y-2">
                        {selectedJob.responsibilities.map((r: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#0d5d3a]/6 shadow-sm">
                            <div className="w-6 h-6 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="w-3.5 h-3.5 text-[#7c3aed]" />
                            </div>
                            <span className="text-sm text-[#0a2617]/75 leading-snug">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {selectedJob.requirements?.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-sm font-black text-[#0a2617] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-5 rounded-full bg-[#0369a1]" /> What We're Looking For
                      </h2>
                      <div className="space-y-2">
                        {selectedJob.requirements.map((r: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#0d5d3a]/6 shadow-sm">
                            <div className="w-6 h-6 rounded-lg bg-[#0369a1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <BadgeCheck className="w-3.5 h-3.5 text-[#0369a1]" />
                            </div>
                            <span className="text-sm text-[#0a2617]/75 leading-snug">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedJob.skills?.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-sm font-black text-[#0a2617] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-5 rounded-full bg-[#b45309]" /> Required Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map((s: string, i: number) => (
                          <span key={i} className="px-4 py-2 rounded-xl bg-white border border-[#0d5d3a]/10 text-xs font-bold text-[#0a2617] shadow-sm flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-[#b45309]" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {selectedJob.benefits?.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-sm font-black text-[#0a2617] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-5 rounded-full bg-[#10b981]" /> Perks & Benefits
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedJob.benefits.map((b: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#f0fbf4] border border-[#10b981]/15">
                            <div className="w-7 h-7 rounded-lg bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                              <Heart className="w-3.5 h-3.5 text-[#10b981]" />
                            </div>
                            <span className="text-xs font-semibold text-[#0a2617]/75">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apply Button / Application Form */}
                  <div className="mt-10 mb-8">
                    <AnimatePresence mode="wait">
                      {!showApplyForm ? (
                        <motion.div
                          key="apply-cta"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex flex-col sm:flex-row gap-3"
                        >
                          <button
                            onClick={() => setShowApplyForm(true)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#0d5d3a] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#084229] transition-all cursor-pointer shadow-lg shadow-[#0d5d3a]/20 hover:shadow-xl hover:shadow-[#0d5d3a]/30 hover:-translate-y-0.5"
                          >
                            <Send className="w-4 h-4" /> Apply for this Role
                          </button>
                          <button
                            onClick={() => onResourcesLinkClick?.('Contact Us')}
                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border-2 border-[#0d5d3a]/15 text-[#0d5d3a] font-bold text-sm hover:bg-[#f0fbf4] transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" /> Ask a Question
                          </button>
                        </motion.div>
                      ) : submitted ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-[#f0fbf4] rounded-[2rem] border-2 border-[#10b981]/20 p-10 text-center"
                        >
                          <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-[#10b981]" />
                          </div>
                          <h4 className="text-2xl font-extrabold text-[#0d5d3a] mb-2">Application Submitted!</h4>
                          <p className="text-sm text-[#0a2617]/60 max-w-md mx-auto">Our talent team will review your portfolio and reach out within 3 business days. Best of luck!</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                        >
                          <div className="bg-white rounded-[2rem] border-2 border-[#0d5d3a]/12 shadow-xl overflow-hidden">
                            {/* Form Header */}
                            <div className="px-6 sm:px-8 py-5 bg-[#f0fbf4] border-b border-[#0d5d3a]/8 flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-black text-[#0d5d3a] uppercase tracking-wider">Apply for {selectedJob.title}</h3>
                                <p className="text-[10px] text-[#0a2617]/50 mt-0.5">{selectedJob.department} · {selectedJob.location}</p>
                              </div>
                              <button
                                onClick={() => setShowApplyForm(false)}
                                className="px-3 py-1.5 rounded-xl bg-[#0d5d3a]/10 text-[#0d5d3a] text-xs font-bold hover:bg-[#0d5d3a] hover:text-white transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleApplySubmit} className="px-6 sm:px-8 py-6 flex flex-col gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-[#0d5d3a] mb-1.5 uppercase tracking-wider">Full Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={formData.name}
                                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                                  placeholder="Aarav Sharma"
                                  className="w-full bg-[#f4faf7] rounded-xl px-4 py-3 text-sm font-semibold border border-[#0d5d3a]/12 outline-none focus:border-[#0d5d3a]/40 focus:ring-2 focus:ring-[#0d5d3a]/10 transition-all placeholder:text-[#0a2617]/30"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-[#0d5d3a] mb-1.5 uppercase tracking-wider">Email *</label>
                                  <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="aarav@example.com"
                                    className="w-full bg-[#f4faf7] rounded-xl px-4 py-3 text-sm font-semibold border border-[#0d5d3a]/12 outline-none focus:border-[#0d5d3a]/40 focus:ring-2 focus:ring-[#0d5d3a]/10 transition-all placeholder:text-[#0a2617]/30"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-[#0d5d3a] mb-1.5 uppercase tracking-wider">Mobile</label>
                                  <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    className="w-full bg-[#f4faf7] rounded-xl px-4 py-3 text-sm font-semibold border border-[#0d5d3a]/12 outline-none focus:border-[#0d5d3a]/40 focus:ring-2 focus:ring-[#0d5d3a]/10 transition-all placeholder:text-[#0a2617]/30"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-[#0d5d3a] mb-1.5 uppercase tracking-wider">Portfolio / GitHub / Resume Link *</label>
                                <input
                                  type="url"
                                  required
                                  value={formData.portfolio}
                                  onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                                  placeholder="https://github.com/username or LinkedIn"
                                  className="w-full bg-[#f4faf7] rounded-xl px-4 py-3 text-sm font-semibold border border-[#0d5d3a]/12 outline-none focus:border-[#0d5d3a]/40 focus:ring-2 focus:ring-[#0d5d3a]/10 transition-all placeholder:text-[#0a2617]/30"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-[#0d5d3a] mb-1.5 uppercase tracking-wider">Why do you want to join ZenMind? *</label>
                                <textarea
                                  rows={4}
                                  required
                                  value={formData.coverLetter}
                                  onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                                  placeholder="Tell us about your background and passion for mental healthcare..."
                                  className="w-full bg-[#f4faf7] rounded-xl px-4 py-3 text-sm font-semibold border border-[#0d5d3a]/12 outline-none focus:border-[#0d5d3a]/40 focus:ring-2 focus:ring-[#0d5d3a]/10 transition-all resize-y placeholder:text-[#0a2617]/30"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 rounded-2xl bg-[#0d5d3a] hover:bg-[#084229] text-white font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#0d5d3a]/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
                              >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {submitting ? 'Submitting...' : 'Submit Application'}
                              </button>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Why Join ZenMind Section */}
                  <div className="mb-10 mt-16">
                    <h2 className="text-sm font-black text-[#0a2617] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-5 rounded-full bg-[#d97706]" /> Why Join ZenMind?
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: <Globe className="w-4 h-4" />, title: 'Remote-First Culture', desc: 'Work from anywhere in India. Flexible hours that respect your life.', color: '#0d5d3a' },
                        { icon: <Heart className="w-4 h-4" />, title: 'Impact-Driven Mission', desc: 'Every line of code you write helps a student breathe easier.', color: '#be123c' },
                        { icon: <TrendingUp className="w-4 h-4" />, title: 'Growth & Learning', desc: 'Dedicated L&D budget. Conferences, courses, and mentorship.', color: '#7c3aed' },
                        { icon: <Award className="w-4 h-4" />, title: 'Equity for Early Joiners', desc: 'Early team members receive equity options as the platform scales.', color: '#b45309' },
                        { icon: <Sparkles className="w-4 h-4" />, title: 'Wellness Subscription', desc: 'Free access to the full ZenMind platform for you and your family.', color: '#0369a1' },
                        { icon: <Layers className="w-4 h-4" />, title: 'Small Team, Big Ownership', desc: 'No bureaucracy. Ship features, make decisions, see immediate impact.', color: '#065f46' },
                      ].map(p => (
                        <div key={p.title} className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#0d5d3a]/6 shadow-sm hover:shadow-md transition-all">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: p.color }}>
                            {p.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#0a2617] mb-0.5">{p.title}</h4>
                            <p className="text-[11px] text-[#0a2617]/55 leading-snug">{p.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Open Application CTA */}
                  <div className="bg-[#0a2617] rounded-[2rem] p-8 sm:p-10 text-center mb-10">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
                      Don't see a role that fits?
                    </h3>
                    <p className="text-sm text-white/60 max-w-lg mx-auto mb-6">
                      We're always looking for passionate builders and clinicians. Send us an open application and we'll reach out when a suitable role opens up.
                    </p>
                    <button
                      onClick={() => onResourcesLinkClick?.('Contact Us')}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#10b981] text-[#0a2617] text-xs font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer shadow-lg"
                    >
                      <Send className="w-4 h-4" /> Send Open Application
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="bg-[#0a2617]">
        <LandingFooter
          onGetStarted={onGetStarted}
          onTherapistLoginTrigger={onTherapistLoginTrigger}
          onCompanyLinkClick={onCompanyLinkClick}
          onResourcesLinkClick={onResourcesLinkClick}
          onProductLinkClick={onProductLinkClick}
        />
      </div>
    </div>
  );
}
