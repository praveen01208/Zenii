import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, Send, ArrowRight, FileText, Newspaper, Building2, BookOpen, ExternalLink, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Navbar as LandingNavbar } from './landing/Navbar';
import { Footer as LandingFooter } from './landing/Footer';

interface ComingSoonPageProps {
  page: string;
  onClose: () => void;
  onGetStarted?: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
  onCompanyLinkClick?: (link: string) => void;
  onResourcesLinkClick?: (link: string) => void;
  onProductLinkClick?: (link: string) => void;
}

export default function ComingSoonPage({
  page,
  onClose,
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
}: ComingSoonPageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (page === 'Blog') {
    return (
      <BlogView
        containerRef={containerRef}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    );
  }

  if (page === 'Press') {
    return (
      <PressView
        containerRef={containerRef}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    );
  }

  if (page === 'Partners') {
    return (
      <PartnersView
        containerRef={containerRef}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    );
  }

  // Fallback
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
      <div className="max-w-4xl mx-auto py-44 px-6 text-center">
        <span className="px-4 py-1.5 rounded-full bg-[#0d5d3a]/10 text-[#0d5d3a] text-xs font-bold uppercase tracking-widest mb-4 inline-block">
          ZENMIND SANCTUARY
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0a2617] mb-6">{page}</h1>
        <p className="text-base text-[#0a2617]/70 max-w-xl mx-auto mb-8">
          This section is being crafted to serve our community. Check back soon for full updates.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-4 rounded-full bg-[#0d5d3a] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#084229] transition-all shadow-lg"
        >
          Explore ZenMind Sanctuary →
        </button>
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
   BLOG VIEW
   ═══════════════════════════════════════════════════════ */
function BlogView({ containerRef, onGetStarted, onAdminLoginTrigger, onTherapistLoginTrigger, onCompanyLinkClick, onResourcesLinkClick, onProductLinkClick }: any) {
  const articles = [
    {
      tag: "MINDFULNESS & AI",
      title: "Overcoming 2 AM Exam Anxiety with Zeni Companion",
      desc: "How real-time conversational AI helps students ground racing thoughts and break stress spirals during peak academic pressure.",
      date: "May 12, 2026",
      readTime: "4 min read",
      author: "Dr. Ananya Roy",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
    },
    {
      tag: "RESEARCH & SCIENCE",
      title: "Adolescent Mental Health in India: Bridging the Care Gap",
      desc: "Examining why 78% of college students hesitate to seek traditional therapy and how student-first digital platforms are changing outcomes.",
      date: "May 08, 2026",
      readTime: "6 min read",
      author: "ZenMind Research Team",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80"
    },
    {
      tag: "PRODUCT INSIGHTS",
      title: "The Architecture of End-to-End Encrypted Emotional Logs",
      desc: "A deep dive into how ZenMind safeguards sentiment data while allowing users to spot long-term mood triggers.",
      date: "April 29, 2026",
      readTime: "5 min read",
      author: "KLECET Engineering Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
    }
  ];

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

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-20 bg-[#0a2617] text-center text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ZENMIND JOURNAL & INSIGHTS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Stories, Science & <span className="text-[#ffebc4] italic font-normal">Mindfulness.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
            Explorations into adolescent mental wellness, AI attunement, student resilience, and clinical insights.
          </p>
        </div>
      </section>

      {/* Articles Grid Section */}
      <section className="py-20 bg-[#f8fdf9] min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art, idx) => (
              <motion.article
                key={idx}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl border-2 border-[#0d5d3a]/15 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="h-52 overflow-hidden relative">
                    <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0d5d3a] text-white text-[10px] font-bold uppercase tracking-wider">
                      {art.tag}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-[#0d5d3a] font-bold mb-3">
                      <span>{art.date}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold text-[#0a2617] mb-3 leading-snug">{art.title}</h3>
                    <p className="text-sm text-[#0a2617]/70 leading-relaxed">{art.desc}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-[#0d5d3a]/10 mt-4">
                  <span className="text-xs font-bold text-[#d97706]">{art.author}</span>
                  <button className="text-xs font-bold text-[#0d5d3a] uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer">
                    Read Article →
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Newsletter Box */}
          <div className="mt-20 p-8 sm:p-12 rounded-[2.5rem] bg-[#0a2617] text-white flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-[#0d5d3a]/30 shadow-2xl">
            <div>
              <span className="text-xs font-bold text-[#ffebc4] uppercase tracking-widest block mb-2">WEEKLY WELLNESS DIGEST</span>
              <h3 className="text-2xl sm:text-4xl font-bold mb-2">Stay Mindful & Connected</h3>
              <p className="text-sm text-white/70 max-w-md">Get evidence-based coping strategies and student wellness articles delivered to your inbox every Sunday.</p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border border-white/20 rounded-full px-6 py-3.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#ffebc4] w-full sm:w-72"
              />
              <button className="px-8 py-3.5 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md">
                Subscribe Free
              </button>
            </div>
          </div>
        </div>
      </section>

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
   PRESS VIEW
   ═══════════════════════════════════════════════════════ */
function PressView({ containerRef, onGetStarted, onAdminLoginTrigger, onTherapistLoginTrigger, onCompanyLinkClick, onResourcesLinkClick, onProductLinkClick }: any) {
  const releases = [
    {
      date: "MAY 01, 2026",
      title: "ZenMind Launches India's First Multilingual AI Companion Tailored for Adolescent Mental Health",
      desc: "Built at KLECET Chikodi, ZenMind combines 24/7 AI chat with licensed clinical therapist networks across Karnataka and India.",
    },
    {
      date: "APRIL 14, 2026",
      title: "ZenMind Integrates End-to-End Safety Pipeline for Emergency Risk Detection",
      desc: "Independent crisis monitoring system connects users immediately with national helplines including iCall and Kiran 1800-599-0019.",
    },
    {
      date: "MARCH 22, 2026",
      title: "Student Wellness Initiative Expands Across Engineering Institutions",
      desc: "Over 15,000 college students gain free access to anonymized mood tracking and peer support circles.",
    }
  ];

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

      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-20 bg-[#0a2617] text-center text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <Newspaper className="w-3.5 h-3.5" />
            <span>PRESS & MEDIA DESK</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            ZenMind in the <span className="text-[#ffebc4] italic font-normal">News.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
            Official announcements, press releases, media kits, and coverage about our mission in adolescent mental healthcare.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f8fdf9]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="space-y-6 mb-16">
            {releases.map((rel, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 border-2 border-[#0d5d3a]/15 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-extrabold text-[#d97706] tracking-wider">{rel.date}</span>
                  <h3 className="text-xl font-bold text-[#0a2617] leading-tight">{rel.title}</h3>
                  <p className="text-sm text-[#0a2617]/70 leading-relaxed">{rel.desc}</p>
                </div>
                <button className="px-6 py-3 rounded-full bg-[#0d5d3a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#084229] transition-all shrink-0 cursor-pointer shadow-md">
                  Read Release
                </button>
              </div>
            ))}
          </div>

          {/* Media Kit Box */}
          <div className="bg-[#0a2617] rounded-[2.5rem] p-8 sm:p-12 text-white border-2 border-[#0d5d3a]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-xs font-bold text-[#ffebc4] uppercase tracking-widest block mb-2">MEDIA ASSETS & KITS</span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">Logos, Brand Assets & Executive Photos</h3>
              <p className="text-sm text-white/70 max-w-md">Download high-resolution brand guidelines, founder bios, and platform screenshots for publication.</p>
            </div>
            <button className="px-8 py-4 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shrink-0">
              Download Media Kit (.ZIP)
            </button>
          </div>
        </div>
      </section>

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
   PARTNERS VIEW
   ═══════════════════════════════════════════════════════ */
function PartnersView({ containerRef, onGetStarted, onAdminLoginTrigger, onTherapistLoginTrigger, onCompanyLinkClick, onResourcesLinkClick, onProductLinkClick }: any) {
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

      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-20 bg-[#0a2617] text-center text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <Building2 className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL PARTNERSHIPS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Partner with <span className="text-[#ffebc4] italic font-normal">ZenMind.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
            Collaborating with colleges, universities, NGOs, and clinical networks to ensure no student navigates mental health challenges alone.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f8fdf9]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-3xl p-8 border-2 border-[#0d5d3a]/15 shadow-xl text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#0d5d3a]/10 text-[#0d5d3a] flex items-center justify-center font-bold mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0a2617] mb-2">Campus Wellness Programs</h3>
              <p className="text-sm text-[#0a2617]/70 leading-relaxed">Integrate ZenMind into college student portals to provide 24/7 AI check-ins and direct therapist booking for students.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-[#0d5d3a]/15 shadow-xl text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#d97706]/10 text-[#d97706] flex items-center justify-center font-bold mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0a2617] mb-2">Clinical Therapist Networks</h3>
              <p className="text-sm text-[#0a2617]/70 leading-relaxed">Onboard verified adolescent psychotherapists to deliver structured online/offline care through our encrypted dashboard.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-[#0d5d3a]/15 shadow-xl text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#0d5d3a]/10 text-[#0d5d3a] flex items-center justify-center font-bold mb-6">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0a2617] mb-2">NGO & Youth Alliances</h3>
              <p className="text-sm text-[#0a2617]/70 leading-relaxed">Work with non-profit organizations to run mental health awareness campaigns and grant-funded support initiatives.</p>
            </div>
          </div>

          <div className="bg-[#0a2617] rounded-[2.5rem] p-8 sm:p-12 text-white border-2 border-[#0d5d3a]/30 shadow-2xl text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-[#ffebc4] uppercase tracking-widest block mb-2">BECOME A PARTNER</span>
            <h3 className="text-2xl sm:text-4xl font-bold mb-4">Bring ZenMind to Your Institution</h3>
            <p className="text-sm text-white/70 max-w-md mx-auto mb-8">Reach out to our institutional relations team to discuss custom campus deployment and partnership terms.</p>
            <button
              onClick={() => onResourcesLinkClick?.('Contact Us')}
              className="px-8 py-4 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Contact Partnership Desk →
            </button>
          </div>
        </div>
      </section>

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
