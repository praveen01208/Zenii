import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, Shield, FileText, Users, HeartHandshake, BookOpen, AlertTriangle, CheckCircle, Send, Sparkles, ArrowDownLeft, Lock, HelpCircle, AlertCircle, ShieldCheck, Clock } from 'lucide-react';
import ContactPage from './ContactPage';
import { Navbar as LandingNavbar } from './landing/Navbar';
import { Footer as LandingFooter } from './landing/Footer';
import { apiFetch } from '../api/client';

const CRISIS_LINES = [
  { name: 'iCall – Tata Institute', number: '9152987821', desc: 'Mon–Sat, 8am–10pm · Free counselling & therapy', tag: 'Counselling' },
  { name: 'Kiran – Govt of India', number: '1800-599-0019', desc: '24/7 · Free · 13 Indian languages · All India', tag: '24/7 Free' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: '24/7 · Mental health & suicide prevention', tag: '24/7' },
  { name: 'iCharity / iCall Alt', number: '9820466627', desc: 'Crisis support & emotional counselling', tag: 'Counselling' },
  { name: 'NIMHANS Helpline', number: '080-46110007', desc: 'National Institute of Mental Health, Bangalore', tag: 'Clinical' },
  { name: 'Aasra Helpline', number: '022-27546669', desc: '24/7 · Suicide prevention & emotional support', tag: '24/7' },
];

interface ResourcesPageProps {
  page: string;
  onClose: () => void;
  onGetStarted?: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
  onCompanyLinkClick?: (link: string) => void;
  onResourcesLinkClick?: (link: string) => void;
  onProductLinkClick?: (link: string) => void;
}

export default function ResourcesPage({
  page,
  onClose,
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
}: ResourcesPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (page === 'Contact Us' || page === 'Contact') {
    return (
      <ContactPage
        onClose={onClose}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className="fixed inset-0 z-[200] bg-[#0a2617] text-[#fffdf5] overflow-y-auto font-sans-main scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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

      {/* Main Content Area */}
      <div>
        {page === 'Help Center' && <HelpCenter onContactClick={() => onResourcesLinkClick?.('Contact Us')} />}
        {page === 'Privacy Policy' && <PrivacyPolicy />}
        {page === 'Terms of Service' && <TermsOfService />}
        {page === 'Crisis Support' && <CrisisSupport />}
        {page === 'Community' && <Community onJoinClick={onGetStarted} />}
        {page === 'Safety Guidelines' && <SafetyGuidelines />}
        {(page === 'Report Issue' || page === 'Report') && <ReportIssueForm />}
        {page === 'Feedback' && <FeedbackForm />}
      </div>

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

/* ═══════════════════════════════════════════════════════
   REPORT ISSUE FORM & CONTENT (MATCHES CONTACT PAGE STYLE)
   ═══════════════════════════════════════════════════════ */
function ReportIssueForm() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: 'Bug Report',
    severity: 'Medium',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const newQuery = {
      _id: 'rep_' + Date.now(),
      type: 'report',
      subject: `[${formData.issueType}] Severity: ${formData.severity}`,
      body: formData.description,
      name: formData.name,
      email: formData.email,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await apiFetch('/support/contact', { method: 'POST', body: JSON.stringify(newQuery) });
    } catch {}

    setBusy(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', issueType: 'Bug Report', severity: 'Medium', description: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="w-full bg-[#0a2617]">
      {/* Hero Header Section */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 bg-[#0a2617] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>SECURITY & SAFETY SUPPORT DESK</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Report an Issue or <span className="text-[#ffebc4] italic font-normal">Platform Concern.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl leading-relaxed mb-12">
            Our safety response team and engineering staff review all bug tickets, accessibility hurdles, and safety flags within 24 hours.
          </p>

          {/* Info Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-md">
              <Clock className="w-6 h-6 text-[#ffebc4] mb-3" />
              <h3 className="font-bold text-lg text-white mb-1">24-Hour SLA</h3>
              <p className="text-xs text-white/70">Every report is acknowledged and assigned to our core engineering team.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-[#10b981] mb-3" />
              <h3 className="font-bold text-lg text-white mb-1">Encrypted Logs</h3>
              <p className="text-xs text-white/70">Technical details and account context are submitted through secure end-to-end channels.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-[#d97706] mb-3" />
              <h3 className="font-bold text-lg text-white mb-1">Direct Resolution</h3>
              <p className="text-xs text-white/70">Receive direct email updates when your issue is resolved or patched.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Card Section — FULL WIDTH w-full SIT CLEANLY BELOW HERO CARDS WITHOUT OVERLAPPING */}
      <section
        className="relative w-full bg-[#f8fdf9] text-[#0a2617] rounded-[2.5rem] lg:rounded-[3.5rem] z-20 pt-[10px] pb-16 sm:pb-24 overflow-hidden mt-6 sm:mt-10 mb-16 sm:mb-24 border-2 border-[#0d5d3a]/15 shadow-2xl"
      >
        {/* Top Right Decorative Arrow */}
        <div className="absolute top-[10px] right-[10px] sm:right-6 lg:right-10 text-[#0a2617]">
          <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 stroke-[1.5]" />
        </div>

        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 sm:mb-14 md:mb-16">
            <h2 className="font-sans-main text-4xl sm:text-5xl md:text-6xl lg:text-[60px] font-extrabold leading-[1.05] tracking-tight text-[#0d5d3a] -ml-1 mt-1 max-w-2xl text-left" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
              Fill Out the Issue<br />Report Form.
            </h2>
            <p className="font-sans text-xs sm:text-sm md:text-base text-[#0a2617]/80 max-w-xs md:max-w-md text-left leading-relaxed font-semibold">
              Provide steps to reproduce or details regarding your report so our engineers can investigate immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left Form Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#0d5d3a]/15 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 text-[#d97706]" />
                <p className="font-sans text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#0d5d3a]">
                  Issue Ticket Details
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Your Name*</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Aarav Sharma"
                    className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Email Address*</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Issue Category</label>
                    <select
                      value={formData.issueType}
                      onChange={e => setFormData({ ...formData, issueType: e.target.value })}
                      className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] outline-none cursor-pointer"
                    >
                      <option value="Bug Report">Technical Bug</option>
                      <option value="Safety Concern">Safety / Content Flag</option>
                      <option value="Account Issue">Account Access Issue</option>
                      <option value="Abuse Report">Peer Circle Misconduct</option>
                      <option value="Other">Other Concern</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] outline-none cursor-pointer"
                  >
                    <option value="Low">Low - Cosmetic / Minor</option>
                    <option value="Medium">Medium - Feature Disrupted</option>
                    <option value="High">High - Unable to Use Account</option>
                    <option value="Critical">Critical - Safety Pipeline Signal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Issue Details & Steps to Reproduce*</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what happened, error message seen, or details..."
                    className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] outline-none resize-y min-h-[120px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 w-full bg-[#0d5d3a] hover:bg-[#084229] text-[#fffdf5] font-sans text-xs sm:text-sm tracking-[0.15em] uppercase font-extrabold py-4 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-[#fde68a]" />
                  <span>{submitted ? "Issue Reported to Safety Team! ✓" : busy ? "Submitting..." : "Submit Issue Report →"}</span>
                </button>
              </form>
            </div>

            {/* Right Glass Card */}
            <div className="relative w-full aspect-[4/3] md:aspect-[690/520] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#0d5d3a]/20">
              <img src="/peoples-image.webp" alt="Support Team" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2617]/90 via-[#0a2617]/30 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#d97706] text-white flex items-center justify-center font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#fde68a]">Direct Safety Email</div>
                      <div className="text-sm font-bold text-white">safety@zenmind.in</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0d5d3a] text-white flex items-center justify-center font-bold">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#fde68a]">Emergency Helpline</div>
                      <div className="text-sm font-bold text-white">1800-599-0019 (24/7)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-12 bg-[#0a2617]"></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEEDBACK FORM & CONTENT (MATCHES CONTACT PAGE STYLE)
   ═══════════════════════════════════════════════════════ */
function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', category: 'AI Chat Experience', feedback: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const newQuery = {
      _id: 'fb_' + Date.now(),
      type: 'feedback',
      subject: `[Feedback] ${formData.category}`,
      body: formData.feedback,
      name: formData.name,
      email: formData.email,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await apiFetch('/support/contact', { method: 'POST', body: JSON.stringify(newQuery) });
    } catch {}

    setBusy(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', category: 'AI Chat Experience', feedback: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="w-full bg-[#0a2617]">
      {/* Hero Header Section */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 bg-[#0a2617] text-center text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
            <span>COMMUNITY FEEDBACK CHANNEL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Help Shape the Future of <span className="text-[#ffebc4] italic font-normal">ZenMind.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
            Your ideas directly guide our product team, AI fine-tuning, and clinical feature releases.
          </p>
        </div>
      </section>

      {/* Form Card Section — FULL WIDTH w-full SIT CLEANLY BELOW HERO CARDS WITHOUT OVERLAPPING */}
      <section
        className="relative w-full bg-[#f8fdf9] text-[#0a2617] rounded-[2.5rem] lg:rounded-[3.5rem] z-20 pt-[10px] pb-16 sm:pb-24 overflow-hidden mt-6 sm:mt-10 mb-16 sm:mb-24 border-2 border-[#0d5d3a]/15 shadow-2xl"
      >
        {/* Top Right Decorative Arrow */}
        <div className="absolute top-[10px] right-[10px] sm:right-6 lg:right-10 text-[#0a2617]">
          <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 stroke-[1.5]" />
        </div>

        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 sm:mb-14 md:mb-16">
                <h2 className="font-sans-main text-4xl sm:text-5xl md:text-6xl lg:text-[60px] font-extrabold leading-[1.05] tracking-tight text-[#0d5d3a] -ml-1 mt-1 max-w-2xl text-left" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
                  Share Product Feedback &<br />Feature Suggestions.
                </h2>
                <p className="font-sans text-xs sm:text-sm md:text-base text-[#0a2617]/80 max-w-xs md:max-w-md text-left leading-relaxed font-semibold">
                  Tell us what features you love, what feels awkward, or new tools you'd like to see on ZenMind.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
                {/* Left Form Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#0d5d3a]/15 shadow-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-4 h-4 text-[#d97706]" />
                    <p className="font-sans text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#0d5d3a]">
                      Send Feedback Ticket
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Your Name*</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ananya Roy"
                        className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Email Address*</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Feature Area</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] outline-none cursor-pointer"
                        >
                          <option value="AI Chat Experience">Zeni AI Companion</option>
                          <option value="Therapist Booking">Therapy Desk</option>
                          <option value="Peer Circles">Peer Circles</option>
                          <option value="Mood Journal">Mood Journal & Analytics</option>
                          <option value="General UX">General Design & UX</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Your Feedback & Suggestions*</label>
                      <textarea
                        rows={4}
                        required
                        value={formData.feedback}
                        onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                        placeholder="Share your thoughts, ideas, or experiences with ZenMind..."
                        className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] outline-none resize-y min-h-[120px]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busy}
                      className="mt-2 w-full bg-[#0d5d3a] hover:bg-[#084229] text-[#fffdf5] font-sans text-xs sm:text-sm tracking-[0.15em] uppercase font-extrabold py-4 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 text-[#fde68a]" />
                      <span>{submitted ? "Feedback Sent to Product Team! ✓" : busy ? "Sending..." : "Submit Feedback →"}</span>
                    </button>
                  </form>
                </div>

                {/* Right Glass Card */}
                <div className="relative w-full aspect-[4/3] md:aspect-[690/520] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#0d5d3a]/20">
                  <img src="/peoples-image.webp" alt="ZenMind Community" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a2617]/90 via-[#0a2617]/30 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#d97706] text-white flex items-center justify-center font-bold">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#fde68a]">Community Voice</div>
                          <div className="text-sm font-bold text-white">feedback@zenmind.in</div>
                        </div>
                      </div>
                    </div>
                  </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── HELP CENTER ── */
function HelpCenter({ onContactClick }: { onContactClick: () => void }) {
  return (
    <div className="w-full bg-[#0a2617]">
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 bg-[#0a2617] text-center text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <HelpCircle className="w-3.5 h-3.5 text-[#ffebc4]" />
            <span>SUPPORT & HELP DESK</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            How Can We Help <span className="text-[#ffebc4] italic font-normal">You Today?</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
            Search guide topics, read common answers, or get directly in touch with our student care desk.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f8fdf9]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { q: 'How do I start talking to Zeni?', a: 'Click "Get Started" to create a free account. Zeni is ready 24/7 for judgment-free conversations.' },
              { q: 'How do I book a human therapist?', a: 'Navigate to the Therapy Desk from your dashboard, filter by specialization, and pick an available time slot.' },
              { q: 'Is my emotional data private?', a: 'Yes, 100%. All chats are encrypted and anonymized. We never sell personal data or display ads.' },
              { q: 'Can I talk in Hindi or Hinglish?', a: 'Zeni natively understands English, Hindi, Hinglish, and Kannada — talk naturally in your dialect.' },
              { q: 'How do I cancel a session?', a: 'Go to Dashboard → My Sessions → Cancel. Full refunds apply when cancelled at least 24 hours prior.' },
              { q: 'How do I report a technical issue?', a: 'Select "Report Issue" in the footer menu or contact our team directly at support@zenmind.in.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-3xl border-2 border-[#0d5d3a]/15 p-6 shadow-lg text-left space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0d5d3a]/10 text-[#0d5d3a] flex items-center justify-center font-bold text-sm">
                  0{i + 1}
                </div>
                <h3 className="font-bold text-lg text-[#0a2617] leading-snug">{faq.q}</h3>
                <p className="text-sm text-[#0a2617]/70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0a2617] rounded-[2.5rem] p-8 sm:p-12 text-white border-2 border-[#0d5d3a]/30 shadow-2xl text-center max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Still Need Assistance?</h3>
            <p className="text-sm text-white/70 max-w-md mx-auto mb-6">Our student support desk is available to resolve any questions within 24 hours.</p>
            <button
              onClick={onContactClick}
              className="px-8 py-4 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Contact Support Desk →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── CRISIS SUPPORT ── */
function CrisisSupport() {
  return (
    <div className="w-full bg-[#0a2617]">
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 bg-[#0a2617] text-center text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-extrabold text-xs uppercase tracking-wider mb-6">
            <AlertTriangle size={16} /> If in immediate danger, call emergency <a href="tel:112" className="underline font-black">112</a>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Crisis Support & <span className="text-[#ffebc4] italic font-normal">Helplines.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
            You are never alone. Verified free crisis counsellors and emergency numbers are available 24/7 across India. Tap to call directly.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f8fdf9]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {CRISIS_LINES.map((line, i) => (
              <a
                key={i}
                href={`tel:${line.number.replace(/[^0-9]/g, '')}`}
                className="group bg-white rounded-3xl border-2 border-[#0d5d3a]/15 p-6 flex flex-col justify-between hover:border-[#d97706] hover:shadow-xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-bold text-[#0a2617] text-base">{line.name}</span>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#0d5d3a]/10 text-[#0d5d3a] uppercase">
                      {line.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#0a2617]/70 leading-relaxed mb-4">{line.desc}</p>
                </div>

                <div className="pt-4 border-t border-[#0d5d3a]/10 flex items-center justify-between text-[#0d5d3a] font-extrabold group-hover:text-[#d97706]">
                  <span className="text-lg">{line.number}</span>
                  <Phone size={18} />
                </div>
              </a>
            ))}
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-center max-w-3xl mx-auto">
            <p className="text-amber-900 text-sm font-semibold leading-relaxed">
              <strong>Important Notice:</strong> ZenMind is a supportive wellness platform, not an emergency service. If you are experiencing acute medical or life-threatening distress, please dial <strong>112</strong> immediately or visit your nearest hospital emergency department.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── PRIVACY POLICY ── */
function PrivacyPolicy() {
  const sections = [
    { title: 'Information We Collect', body: 'We collect minimal necessary data: your name, email, and preferences. AI conversations are processed securely and never stored in identifiable formats for third-party use.' },
    { title: 'How We Use Your Data', body: 'Data is strictly utilized to deliver ZenMind services — tailoring AI check-ins, scheduling therapist appointments, and improving crisis detection algorithms.' },
    { title: 'Data Security Standards', body: 'All transmission uses TLS 1.3 encryption. Sentiment data and session records are stored under AES-256 encryption aligned with HIPAA standards.' },
    { title: 'Data Deletion & Ownership', body: 'You own your emotional health data. You can export or request complete account and data deletion anytime via support@zenmind.in.' },
  ];

  return (
    <div className="w-full bg-[#0a2617]">
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 bg-[#0a2617] text-center text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>LEGAL & DATA STANDARDS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Privacy <span className="text-[#ffebc4] italic font-normal">Policy.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-xl mx-auto leading-relaxed">
            Our foundational commitment: complete transparency, zero data selling, and state-of-the-art encryption.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f8fdf9]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="bg-white rounded-3xl border-2 border-[#0d5d3a]/15 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-[#0d5d3a]" />
                <h3 className="text-xl font-bold text-[#0a2617]">{s.title}</h3>
              </div>
              <p className="text-sm sm:text-base text-[#0a2617]/75 leading-relaxed pl-8">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── TERMS OF SERVICE ── */
function TermsOfService() {
  const sections = [
    { title: 'Acceptance of Terms', body: 'By accessing or using ZenMind, you agree to these Terms of Service. If you disagree with any part, please refrain from using our service.' },
    { title: 'Platform Scope', body: 'ZenMind provides digital mental health tools and therapist connections. It does not substitute for emergency clinical intervention.' },
    { title: 'Therapist Independent Care', body: 'Licensed psychotherapists on ZenMind are independent practitioners. Session bookings follow independent clinical standards and cancellation terms.' },
    { title: 'Prohibited Conduct', body: 'Users must not misuse peer circles, attempt reverse-engineering, or post abusive or harmful content.' },
  ];

  return (
    <div className="w-full bg-[#0a2617]">
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 bg-[#0a2617] text-center text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <FileText className="w-3.5 h-3.5 text-[#ffebc4]" />
            <span>TERMS & CONDITIONS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Terms of <span className="text-[#ffebc4] italic font-normal">Service.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-xl mx-auto leading-relaxed">
            Simple, fair guidelines for using the ZenMind platform.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f8fdf9]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="bg-white rounded-3xl border-2 border-[#0d5d3a]/15 p-8 shadow-lg">
              <h3 className="text-xl font-bold text-[#0a2617] mb-3"><span className="text-[#d97706] mr-2">0{i + 1}.</span>{s.title}</h3>
              <p className="text-sm sm:text-base text-[#0a2617]/75 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── COMMUNITY ── */
function Community({ onJoinClick }: { onJoinClick?: () => void }) {
  return (
    <div className="w-full bg-[#0a2617]">
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 bg-[#0a2617] text-center text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <Users className="w-3.5 h-3.5 text-[#10b981]" />
            <span>STUDENT COMMUNITY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            You Belong <span className="text-[#ffebc4] italic font-normal">Here.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-xl mx-auto leading-relaxed">
            A safe, moderated environment for young people to share journeys, support peers, and grow together.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f8fdf9]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Peer Support Circles', desc: 'Topic-based safe spaces for exam anxiety, career choices, sleep hygiene, and relationships.' },
              { title: 'Community Stories', desc: 'Read authentic experiences from college students across India sharing how they navigated pressure.' },
              { title: 'Moderated & Safe', desc: 'Trained moderators ensure zero tolerance for hate speech, harassment, or unsafe content.' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-3xl border-2 border-[#0d5d3a]/15 p-6 shadow-lg space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0d5d3a]/10 text-[#0d5d3a] flex items-center justify-center font-bold">
                  0{i + 1}
                </div>
                <h3 className="font-bold text-lg text-[#0a2617]">{c.title}</h3>
                <p className="text-sm text-[#0a2617]/70 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0a2617] rounded-[2.5rem] p-8 sm:p-12 text-white border-2 border-[#0d5d3a]/30 shadow-2xl max-w-3xl mx-auto text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Join the ZenMind Community</h3>
            <p className="text-sm text-white/70 max-w-md mx-auto mb-8">Access Peer Circles, mood check-ins, and shared stories with fellow students.</p>
            <button
              onClick={onJoinClick}
              className="px-8 py-4 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Get Started Free →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── SAFETY GUIDELINES ── */
function SafetyGuidelines() {
  return (
    <div className="w-full bg-[#0a2617]">
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 bg-[#0a2617] text-center text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>SAFETY & CRISIS PROTOCOLS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Safety <span className="text-[#ffebc4] italic font-normal">Guidelines.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-xl mx-auto leading-relaxed">
            How our background risk detection algorithms and clinical escalation protocols protect every user.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f8fdf9]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border-2 border-[#0d5d3a]/15 p-8 shadow-lg space-y-3">
              <h3 className="text-xl font-bold text-[#0d5d3a]">Independent Crisis Detection</h3>
              <p className="text-sm text-[#0a2617]/75 leading-relaxed">Our AI runs an independent background safety evaluator. If critical risk signals are detected, the system immediately presents emergency helpline numbers and escalation paths to licensed human therapists.</p>
            </div>

            <div className="bg-white rounded-3xl border-2 border-[#0d5d3a]/15 p-8 shadow-lg space-y-3">
              <h3 className="text-xl font-bold text-[#0d5d3a]">Zero Tolerance Moderation</h3>
              <p className="text-sm text-[#0a2617]/75 leading-relaxed">Peer circles and community comments are continuously monitored. Harassment, self-harm encouragement, or hate speech results in immediate content removal and account suspension.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
