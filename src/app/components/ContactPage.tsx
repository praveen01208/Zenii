import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Send, Sparkles, Phone, Mail, ArrowDownLeft, ShieldCheck, Globe2, MapPin, ExternalLink, Building2, Compass, CheckCircle, Clock } from "lucide-react";
import Globe from "./ui/globe";
import { Navbar as LandingNavbar } from "./landing/Navbar";
import { Footer as LandingFooter } from "./landing/Footer";
import { apiFetch } from "../api/client";

interface ContactPageProps {
  onClose: () => void;
  onGetStarted?: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
  onCompanyLinkClick?: (link: string) => void;
  onResourcesLinkClick?: (link: string) => void;
  onProductLinkClick?: (link: string) => void;
}

const defaultGlobeConfig = {
  positions: [
    { top: "50%", left: "75%", scale: 1.4 },  // Section 0 (Hero): Right side
    { top: "25%", left: "50%", scale: 0.9 },  // Section 1 (Presence): Top side
    { top: "20%", left: "80%", scale: 1.8 },  // Section 2 (HQ KLECET): Left/Right large
    { top: "50%", left: "50%", scale: 1.5 },  // Section 3 (Contact Form): Center backdrop
  ]
};

const parsePercent = (str: string): number => parseFloat(str.replace('%', ''));

export default function ContactPage({
  onClose,
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
}: ContactPageProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [globeTransform, setGlobeTransform] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();

  // Contact Form State
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const calculatedPositions = useMemo(() => {
    return defaultGlobeConfig.positions.map(pos => ({
      top: parsePercent(pos.top),
      left: parsePercent(pos.left),
      scale: pos.scale
    }));
  }, []);

  const updateScrollPosition = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const docHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    
    setScrollProgress(progress);

    const viewportCenter = window.innerHeight / 2;
    let newActiveSection = 0;
    let minDistance = Infinity;

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          newActiveSection = index;
        }
      }
    });

    // Check if footer is in viewport
    if (footerRef.current) {
      const footerRect = footerRef.current.getBoundingClientRect();
      if (footerRect.top < window.innerHeight - 100) {
        newActiveSection = 4; // Footer mode: hide globe completely
      }
    }

    const currentPos = calculatedPositions[newActiveSection] || calculatedPositions[3] || calculatedPositions[0];
    const transform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`;
    
    setGlobeTransform(transform);
    setActiveSection(newActiveSection);
  }, [calculatedPositions]);

  useEffect(() => {
    let ticking = false;
    const container = containerRef.current;
    
    const handleScroll = () => {
      if (!ticking) {
        animationFrameId.current = requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      updateScrollPosition();
    }
    
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [updateScrollPosition]);

  useEffect(() => {
    const initialPos = calculatedPositions[0];
    const initialTransform = `translate3d(${initialPos.left}vw, ${initialPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${initialPos.scale}, ${initialPos.scale}, 1)`;
    setGlobeTransform(initialTransform);
  }, [calculatedPositions]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setBusy(true);

    const newQuery = {
      _id: 'ct_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: 'contact',
      subject: formData.subject,
      body: formData.message,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'N/A',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await apiFetch('/support/contact', {
        method: 'POST',
        body: JSON.stringify(newQuery)
      });
    } catch (err) {
      // Fallback API
    } finally {
      try {
        const existing = JSON.parse(localStorage.getItem('zm_contact_queries') || '[]');
        existing.unshift(newQuery);
        localStorage.setItem('zm_contact_queries', JSON.stringify(existing));
      } catch {}
      setBusy(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  const handleCompanyNavigation = (link: string) => {
    if (link === 'Contact Us' && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCompanyLinkClick?.(link);
    }
  };

  const mapsUrl = "https://www.google.com/maps?sca_esv=11c71c9d54d57fde&rlz=1C1JJTC_enIN1106IN1107&output=search&q=klecet+chikodi&source=lnms&fbs=ABfTbFVyMZGZf1hfvX9uKjN_-G8c4u0nXx4bEIpwm1lnNH832VTJOOCxW_fyN-Q_ezyf8gKmVML23HcLQCydI7S-9bmoaQbnQjvqWqR3ZVfluTIt6owk8QYspgn5r-j5WWyEi-hRYfKKV6-Z2UFQx_cMNv1QVOi6V_Cn6Lcx_7pf9YGrQg46tAz-MPZRqLovPAxny-Ewux8rMCZOFWRCQaKr_EbZbQFsjw&entry=mc&ved=1t:200715&ictx=111";

  const navBadges = ["Welcome", "Global Presence", "HQ Location", "Contact Form"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      ref={containerRef}
      data-lenis-prevent
      style={{ backgroundColor: '#0a2617' }}
      className="fixed inset-0 z-[200] bg-[#0a2617] text-[#fffdf5] overflow-y-auto font-sans-main scrollbar-none [&::-webkit-scrollbar]:hidden no-scrollbar select-none"
    >
      {/* ── LANDING NAVBAR ── */}
      <LandingNavbar
        scrollContainerRef={containerRef}
        delayReappearMs={1500}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={handleCompanyNavigation}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-[250]">
        <div
          className="h-full bg-gradient-to-r from-[#0d5d3a] via-[#d97706] to-[#fde68a] transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Right Navigation Dots */}
      <div className="hidden sm:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[240] flex-col gap-4">
        {navBadges.map((badge, index) => (
          <button
            key={badge}
            type="button"
            onClick={() => {
              sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative flex items-center justify-end p-2 transition-all cursor-pointer"
          >
            <span className={`absolute right-8 px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap bg-white text-[#0d5d3a] shadow-md transition-all ${activeSection === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}>
              {badge}
            </span>
            <div className={`w-3 h-3 rounded-full border-2 transition-all ${activeSection === index ? 'bg-[#d97706] border-[#d97706] scale-125 shadow-md' : 'border-white/40 bg-white/10 hover:bg-white/30'}`} />
          </button>
        ))}
      </div>

      {/* ── INTERACTIVE 3D SCROLL GLOBE ── */}
      <div
        className="fixed pointer-events-none transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          zIndex: 15,
          transform: globeTransform,
          opacity: activeSection >= 4 ? 0 : activeSection === 3 ? 0.15 : 0.7,
          visibility: activeSection >= 4 ? 'hidden' : 'visible'
        }}
      >
        <Globe />
      </div>

      {/* ── SECTION 0: HERO ── */}
      <section
        ref={el => (sectionRefs.current[0] = el)}
        className="relative min-h-screen flex flex-col justify-center pt-32 sm:pt-40 md:pt-44 pb-20 bg-transparent overflow-hidden border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6"
            >
              <span className="text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold block">
                ✦ WELCOME TO ZENMIND CONTACT SANCTUARY
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] text-[#fffdf5] font-normal leading-[0.98] tracking-tight">
                Let&apos;s Make Mental Health<br />
                <span className="text-[#d97706] font-bold">Easier to Talk About.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#fffdf5]/85 font-normal leading-relaxed max-w-2xl">
                Journey through an immersive 24/7 digital sanctuary where technology meets compassionate care. Scroll down to explore our global reach, campus headquarters, and direct contact form.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => sectionRefs.current[3]?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  Fill Contact Form ↓
                </button>
                <button
                  type="button"
                  onClick={() => sectionRefs.current[2]?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Explore Campus HQ →
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SECTION 1: GLOBAL PRESENCE ── */}
      <section
        ref={el => (sectionRefs.current[1] = el)}
        className="relative min-h-screen flex flex-col justify-center py-24 sm:py-32 bg-transparent border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full relative z-20">
          <div className="max-w-3xl space-y-6">
            <span className="text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold block">
              ✦ GLOBAL DIGITAL NETWORK
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight">
              Connected Worldwide,<br />
              <span className="text-[#10b981] font-bold">Rooted in Care.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#fffdf5]/80 font-normal leading-relaxed">
              From every corner of the globe, our encrypted network supports adolescents, therapists, and institutions 24 hours a day, 7 days a week.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mt-12 max-w-4xl">
            <div className="bg-white/5 border border-white/15 p-6 rounded-3xl backdrop-blur-md space-y-3">
              <Clock className="w-8 h-8 text-[#d97706]" />
              <h3 className="text-lg font-bold text-white">24/7 AI Companion</h3>
              <p className="text-xs text-[#fffdf5]/70 leading-relaxed font-normal">
                Instant emotional support available anytime in English, Hindi, and Hinglish with zero waiting line.
              </p>
            </div>

            <div className="bg-white/5 border border-white/15 p-6 rounded-3xl backdrop-blur-md space-y-3">
              <ShieldCheck className="w-8 h-8 text-[#10b981]" />
              <h3 className="text-lg font-bold text-white">Encrypted Network</h3>
              <p className="text-xs text-[#fffdf5]/70 leading-relaxed font-normal">
                End-to-end encrypted messaging and clinical video consultation rooms for ultimate privacy.
              </p>
            </div>

            <div className="bg-white/5 border border-white/15 p-6 rounded-3xl backdrop-blur-md space-y-3">
              <Send className="w-8 h-8 text-[#d97706]" />
              <h3 className="text-lg font-bold text-white">Direct Admin Routing</h3>
              <p className="text-xs text-[#fffdf5]/70 leading-relaxed font-normal">
                All contact queries land directly inside our Super Admin dashboard for real-time response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: HEADQUARTERS & INTERACTIVE MAP ── */}
      <section
        ref={el => (sectionRefs.current[2] = el)}
        className="relative min-h-screen flex flex-col justify-center py-24 sm:py-32 bg-transparent border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full relative z-20">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Campus HQ Info */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold block">
                ✦ MAIN HEADQUARTERS LOCATION
              </span>
              
              <h2 className="text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight">
                Engineered at<br />
                <span className="text-[#d97706] font-bold">KLECET Chikodi.</span>
              </h2>

              <p className="text-base sm:text-lg text-[#fffdf5]/80 font-normal leading-relaxed">
                ZenMind is proudly engineered at KLE College of Engineering and Technology (KLECET), Chikodi. Serving students, therapists, and institutions across Karnataka, India, and global communities.
              </p>

              {/* Address Badge Card */}
              <div className="bg-white/5 border border-white/15 p-6 rounded-3xl backdrop-blur-md space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-[#d97706] shrink-0 mt-1" />
                  <div>
                    <div className="text-xs font-bold text-[#ffebc4] uppercase tracking-wider">Main Campus & HQ</div>
                    <div className="text-base font-bold text-white">KLE College of Engineering and Technology (KLECET)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#10b981] shrink-0 mt-1" />
                  <div>
                    <div className="text-xs font-bold text-[#ffebc4] uppercase tracking-wider">Location & Region</div>
                    <div className="text-sm font-semibold text-white/90">
                      Chikodi, District Belagavi, State Karnataka, India 🇮🇳
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap gap-4 text-xs text-[#ffebc4] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#d97706]" />
                    <span>support@zenmind.in</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#10b981]" />
                    <span>1800-599-0019 (24/7 Helpline)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => sectionRefs.current[3]?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  Proceed to Form ↓
                </button>
              </div>
            </div>

            {/* Right Column: Embedded Google Maps Location Card */}
            <div className="lg:col-span-6 bg-white/5 border border-white/15 p-4 sm:p-6 rounded-3xl backdrop-blur-md shadow-2xl relative">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#d97706]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Interactive Campus Map</span>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffebc4] hover:text-white transition-colors"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-lg relative bg-[#071a0e]">
                <iframe
                  title="KLECET Chikodi Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3830.4354228941784!2d74.59371077590885!3d16.146973684542277!2m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bf76d03d36b8a8b%3A0x8e8749a4f3b772c5!2sKLE%20College%20of%20Engineering%20and%20Technology%20Chikodi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full filter contrast-[1.05] brightness-[0.95]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: EXACT SAME CARD AS LANDING PAGE GetInTouchSection ── */}
      <section
        ref={el => (sectionRefs.current[3] = el)}
        className="relative w-full bg-[#0a2617] z-20"
      >
        <div className="w-full bg-[#0a2617]">
          <section
            id="contact-form-section"
            className="relative w-full bg-[#f8fdf9] text-[#0a2617] rounded-[2.5rem] lg:rounded-[3.5rem] z-20 pt-[10px] pb-16 sm:pb-24 overflow-hidden border-2 border-[#0d5d3a]/15 shadow-2xl"
          >
            {/* Decorative Arrow Top Right */}
            <div className="absolute top-[10px] right-[10px] sm:right-6 lg:right-10 text-[#0a2617]">
              <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 stroke-[1.5]" />
            </div>

            <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16">
              {/* Top Row: Heading + Subtitle */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 sm:mb-14 md:mb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="font-sans-main text-4xl sm:text-5xl md:text-6xl lg:text-[60px] xl:text-[70px] font-extrabold leading-[1.05] tracking-tight text-[#0d5d3a] -ml-1 mt-1 max-w-2xl text-left"
                  style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}
                >
                  Let&apos;s Make Mental Health<br />Easier to Talk About.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="font-sans text-xs sm:text-sm md:text-base text-[#0a2617]/80 max-w-xs md:max-w-md text-left leading-relaxed font-semibold"
                >
                  Whether you&apos;re a college student, mental-health professional, organization, or simply curious about ZenMind — we&apos;d love to hear from you.
                </motion.p>
              </div>

              {/* Form + Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
                {/* Left: Form Card — EXACT SAME AS GetInTouchSection */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#0d5d3a]/15 shadow-xl"
                >
                  {/* Star + Label */}
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-4 h-4 text-[#d97706]" />
                    <p className="font-sans text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#0d5d3a]">
                      Fill out the contact form
                    </p>
                  </div>

                  {/* Form Fields */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Full Name*</label>
                      <input
                        type="text"
                        placeholder="Harshit Sharma"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] placeholder:text-[#0d5d3a]/40 border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Email Address*</label>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] placeholder:text-[#0d5d3a]/40 border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Mobile Number</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] placeholder:text-[#0d5d3a]/40 border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Therapy Support">Therapy Support</option>
                        <option value="Partnership Request">Partnership Request</option>
                        <option value="Technical Issue">Technical Issue</option>
                        <option value="Feedback">Feedback & Suggestions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Message*</label>
                      <textarea
                        placeholder="Tell us how we can assist you..."
                        rows={4}
                        required
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] placeholder:text-[#0d5d3a]/40 border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all resize-y min-h-[120px]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busy}
                      className="mt-2 w-full bg-[#0d5d3a] hover:bg-[#084229] text-[#fffdf5] font-sans text-xs sm:text-sm tracking-[0.15em] uppercase font-extrabold py-4 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 text-[#fde68a]" />
                      <span>{submitted ? "Message Sent to Admin! ✓" : busy ? "Sending..." : "Start a Conversation →"}</span>
                    </button>
                  </form>
                </motion.div>

                {/* Right: Glassmorphism Image Card — EXACT SAME AS GetInTouchSection */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full aspect-[4/3] md:aspect-[690/520] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#0d5d3a]/20"
                >
                  <img
                    src="/peoples-image.webp"
                    alt="Happy People"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a2617]/90 via-[#0a2617]/30 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#d97706] text-white flex items-center justify-center font-bold">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#fde68a]">Email Support</div>
                          <div className="text-sm font-bold text-white">support@zenmind.in</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0d5d3a] text-white flex items-center justify-center font-bold">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#fde68a]">Toll-Free Helpline</div>
                          <div className="text-sm font-bold text-white">1800-599-0019 (24/7)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* ── LANDING FOOTER (NO EARTH GLOBE IN BACKGROUND HERE) ── */}
      <div ref={footerRef} className="relative z-30 bg-[#0a2617]">
        <LandingFooter
          onProductLinkClick={onProductLinkClick}
          onCompanyLinkClick={handleCompanyNavigation}
          onResourcesLinkClick={onResourcesLinkClick}
          onTherapistLoginTrigger={onTherapistLoginTrigger}
          onGetStarted={onGetStarted}
        />
      </div>
    </motion.div>
  );
}
