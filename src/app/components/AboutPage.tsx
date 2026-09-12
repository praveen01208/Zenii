import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Linkedin, Twitter, ExternalLink, Shield, ArrowRight, ChevronDown, Lock, Heart, Globe, UserCheck } from 'lucide-react';
import { apiFetch } from '../api/client';
import { Navbar as LandingNavbar } from './landing/Navbar';
import { Footer as LandingFooter } from './landing/Footer';

const FAQS = [
  {
    q: 'Why was ZenMind created?',
    a: 'ZenMind was created to bridge the massive gap in adolescent mental health care. Traditional therapy can be expensive, slow to schedule, and socially stigmatized. ZenMind provides instant 24/7 AI support while connecting users to verified human therapists when deeper care is needed.',
  },
  {
    q: 'Is my conversation with Zeni private?',
    a: 'Yes, completely. All chat logs are encrypted and anonymized. We never sell personal data, display ads, or share your private conversations with third parties.',
  },
  {
    q: 'Can I talk in Hindi or Hinglish?',
    a: 'Absolutely. Zeni natively understands English, Hindi, Hinglish, and Kannada, so you can type or talk exactly the way you communicate with friends.',
  },
  {
    q: 'How are team members managed on this page?',
    a: 'Our leadership directory is connected directly to the backend Admin Panel API. Administrators can publish, update, or edit team profiles in real time.',
  },
];

interface AboutPageProps {
  onClose: () => void;
  onGetStarted?: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
  onCompanyLinkClick?: (link: string) => void;
  onResourcesLinkClick?: (link: string) => void;
  onProductLinkClick?: (link: string) => void;
}

export default function AboutPage({
  onClose,
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
}: AboutPageProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<any>('/team')
      .then(res => {
        const list = res.members || [];
        setMembers(list);

        // Inject AboutPage & Person Schema for E-E-A-T & LLMO
        const schema = {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "mainEntity": {
            "@type": "MedicalOrganization",
            "name": "ZenMind",
            "url": "https://zenmind.in",
            "knowsAbout": ["Mental Health", "Adolescent Psychology", "Cognitive Behavioral Therapy (CBT)", "AI in Healthcare"],
            "founder": list.map((m: any) => ({
              "@type": "Person",
              "name": m.name,
              "jobTitle": m.role,
              "description": m.bio,
              "image": m.image
            }))
          }
        };

        let script = document.getElementById('zenmind-about-schema') as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement('script');
          script.id = 'zenmind-about-schema';
          script.type = 'application/ld+json';
          document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schema);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      const el = document.getElementById('zenmind-about-schema');
      if (el) el.remove();
    };
  }, []);

  const handleCompanyNavigation = (link: string) => {
    if (link === 'About Us' && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCompanyLinkClick?.(link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={containerRef}
      data-lenis-prevent
      className="fixed inset-0 z-[200] bg-[#0a2617] text-[#fffdf5] overflow-y-auto font-sans-main scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      {/* Landing Navbar */}
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

      {/* ── HERO SECTION: Cinematic Editorial Split ── */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-20 sm:pb-32 bg-[#0a2617] overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <span className="text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold block mb-4">
                ✦ ABOUT ZENMIND
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] text-[#fffdf5] font-normal leading-[0.98] tracking-tight mb-8">
                When your mind gets loud at 2 AM, waiting weeks isn't an option.
              </h1>
              <p className="text-lg sm:text-xl text-[#fffdf5]/85 font-normal leading-relaxed max-w-2xl">
                ZenMind was created to give every adolescent an instant, private, judgment-free sanctuary — paired with verified human therapists when you need deeper clinical care.
              </p>
            </motion.div>

            {/* Right Editorial Image Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/15 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80"
                  alt="Mindful Journaling & Quiet Reflection"
                  className="w-full h-full object-cover filter brightness-90 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2617] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#0a2617]/80 backdrop-blur-md border border-white/15">
                  <p className="text-sm text-[#ffebc4] font-normal italic">
                    "Empathy is not a feature — it is the foundation of everything we build."
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SECTION 2: EDITORIAL MANIFESTO (Full-width Dark Canvas) ── */}
      <section className="py-24 sm:py-36 bg-[#071d13] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#ffebc4] text-xs font-sans tracking-[0.25em] uppercase font-bold block mb-6">
              ✦ OUR MANIFESTO
            </span>
            
            <h2 className="text-3xl sm:text-5xl md:text-6xl text-[#fffdf5] font-normal leading-[1.1] tracking-tight mb-10 max-w-4xl mx-auto">
              In India, over 50 million young adults navigate severe academic stress, anxiety, and loneliness completely alone.
            </h2>

            <div className="w-16 h-[1px] bg-[#ffebc4]/40 mx-auto mb-10" />

            <p className="text-lg sm:text-xl text-[#fffdf5]/80 font-normal leading-relaxed max-w-3xl mx-auto">
              Traditional therapy is often expensive, slow to access, and carries social stigma. We built Zeni to ensure that no adolescent ever has to carry heavy thoughts in silence, giving them continuous 24/7 AI listening alongside direct pathways to verified human psychotherapists.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 3: ASYMMETRICAL 3-TIER CARE ARCHITECTURE ── */}
      <section className="py-24 sm:py-36 bg-[#0a2617] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
            <div>
              <span className="text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold block mb-3">
                ✦ CONTINUOUS CARE MODEL
              </span>
              <h2 className="text-4xl sm:text-6xl text-white font-normal leading-tight">
                The Hybrid Care Ecosystem
              </h2>
            </div>
            <p className="text-base text-white/75 max-w-md">
              A seamless continuum bridging instant AI attunement with clinical human expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Card 1: 24/7 AI Companion (col-span-7) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 p-8 sm:p-12 rounded-[2.5rem] bg-[#071d13] border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
                  <span className="text-xs font-sans tracking-widest text-[#ffebc4] uppercase font-bold">
                    TIER 01 • INSTANT ATTUNEMENT
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-sans text-white/80 border border-white/10">
                    24/7 Available
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl text-white font-normal mb-4">
                  24/7 Private AI Companion
                </h3>

                <p className="text-base sm:text-lg text-white/75 leading-relaxed mb-8">
                  Talk or type freely in English, Hindi, Hinglish, or Kannada. Zeni evaluates emotional tone and context in real time — offering immediate, judgment-free support without appointment delays.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
                <span className="px-4 py-1.5 rounded-full bg-white/5 text-xs font-sans text-[#ffebc4] border border-white/10 font-semibold">
                  Zero Wait Time
                </span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 text-xs font-sans text-[#ffebc4] border border-white/10 font-semibold">
                  100% Encrypted
                </span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 text-xs font-sans text-[#ffebc4] border border-white/10 font-semibold">
                  4 Languages
                </span>
              </div>
            </motion.div>

            {/* Card 2: Verified Human Therapists (col-span-5) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5 p-8 sm:p-12 rounded-[2.5rem] bg-[#8a3f36] text-white border border-white/20 flex flex-col justify-between shadow-2xl relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/15 mb-8">
                  <span className="text-xs font-sans tracking-widest text-[#ffebc4] uppercase font-bold">
                    TIER 02 • CLINICAL CARE
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-sans text-white border border-white/20">
                    Verified Experts
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl text-white font-normal mb-4">
                  Human Psychotherapists
                </h3>

                <p className="text-base text-white/85 leading-relaxed mb-8">
                  Direct online and offline session booking with verified clinical psychologists, psychiatrists, and adolescent counseling specialists for deeper care.
                </p>
              </div>

              <div className="pt-6 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs font-sans tracking-wider text-[#ffebc4] uppercase font-bold">
                  10+ Yrs Exp • Online / Offline
                </span>
                <span className="w-8 h-8 rounded-full bg-white text-[#8a3f36] flex items-center justify-center text-xs font-bold">
                  →
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SECTION 4: EDITORIAL IMAGE GRID (REAL ASSETS) ── */}
      <section className="py-24 sm:py-36 bg-[#071d13] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
                alt="Young Friends Supporting Each Other"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-sans tracking-widest text-[#ffebc4] uppercase font-bold block mb-1">COMMUNITY CIRCLES</span>
                <h4 className="text-xl text-white font-normal">Safe Peer Spaces Alongside AI</h4>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"
                alt="Professional Therapy Consultation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-sans tracking-widest text-[#ffebc4] uppercase font-bold block mb-1">CLINICAL PRECISION</span>
                <h4 className="text-xl text-white font-normal">Verified Adolescent Psychotherapists</h4>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SECTION 5: LEADERSHIP DIRECTORY (STRICTLY API-DRIVEN FROM ADMIN DASHBOARD) ── */}
      <section className="py-24 sm:py-36 bg-[#0a2617] relative border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold block mb-3">
                ✦ TEAM DIRECTORY
              </span>
              <h2 className="text-4xl sm:text-6xl text-white font-normal leading-tight">
                The People Behind ZenMind
              </h2>
            </div>
            <p className="text-base text-white/75 max-w-md">
              Managed directly via your Admin Dashboard. Published members render dynamically below.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-white/60 font-sans text-sm">
              Loading team directory...
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-[#071d13] border border-white/10 max-w-2xl mx-auto text-center">
              <Shield className="w-10 h-10 text-[#ffebc4] mx-auto mb-4" />
              <h3 className="text-2xl text-white font-normal mb-2">
                Admin Panel Directory Active
              </h3>
              <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                Founders and team members are added directly from your Admin Dashboard. Published profiles will appear here dynamically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((m: any, i: number) => (
                <TeamCard key={m._id || i} member={m} index={i} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── SECTION 6: INTERACTIVE FAQ ACCORDION ── */}
      <section className="py-24 sm:py-36 bg-[#071d13] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold block mb-3">
              ✦ FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-4xl sm:text-5xl text-white font-normal leading-tight">
              Got Questions?
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0a2617] border border-white/10 overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="p-6 cursor-pointer flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <h3 className="text-lg sm:text-xl text-white font-normal">
                      {faq.q}
                    </h3>
                    <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#ffebc4] transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#ffebc4] text-[#0a2617]' : ''
                    }`}>
                      <ChevronDown size={18} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6 pt-2 text-sm text-white/75 leading-relaxed border-t border-white/5"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SECTION 7: HIGH-IMPACT CTA BANNER ── */}
      <section className="py-24 sm:py-36 bg-[#0a2617]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl text-white font-normal mb-8">
            Ready to experience a sanctuary for your mind?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 rounded-full bg-[#ffebc4] text-[#0a2617] font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-xl border-0 cursor-pointer inline-flex items-center gap-2"
            >
              <span>TALK TO ZENI NOW</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <LandingFooter
        onGetStarted={onGetStarted}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={handleCompanyNavigation}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    </motion.div>
  );
}

function TeamCard({ member, index }: { member: any; index: number }) {
  const imageUrl = member.imageBase64
    ? (member.imageBase64.startsWith('data:') ? member.imageBase64 : `data:image/jpeg;base64,${member.imageBase64}`)
    : member.imageUrl || null;

  const cardInner = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -6 }}
      className="p-2 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group cursor-pointer transition-all"
    >
      <div className="bg-[#0a2617] rounded-[calc(2.5rem-0.5rem)] overflow-hidden border border-white/5">
        
        {/* Photo Container */}
        <div className="relative h-64 sm:h-72 bg-[#181310] overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={member.name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#181310]">
              <div className="w-20 h-20 rounded-full bg-[#ffebc4] text-[#0a2617] flex items-center justify-center text-3xl font-black">
                {member.name ? member.name.charAt(0) : 'Z'}
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Social Links on Hover */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="w-9 h-9 rounded-full bg-white/90 text-[#0a2617] flex items-center justify-center hover:bg-white transition-colors"
              >
                <Linkedin size={16} />
              </a>
            )}
            {member.twitterUrl && (
              <a
                href={member.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="w-9 h-9 rounded-full bg-white/90 text-[#0a2617] flex items-center justify-center hover:bg-white transition-colors"
              >
                <Twitter size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="font-sans text-[11px] tracking-widest text-[#ffebc4] uppercase font-semibold block mb-1">
                {member.role || 'Team Member'}
              </span>
              <h3 className="text-xl text-white font-normal">
                {member.name}
              </h3>
            </div>
            {member.profileLink && (
              <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 group-hover:text-white transition-colors">
                <ExternalLink size={14} />
              </span>
            )}
          </div>
          {member.bio && (
            <p className="text-xs text-white/70 font-light leading-relaxed line-clamp-3">
              {member.bio}
            </p>
          )}
        </div>

      </div>
    </motion.div>
  );

  if (member.profileLink) {
    return (
      <a href={member.profileLink} target="_blank" rel="noopener noreferrer" className="block no-underline">
        {cardInner}
      </a>
    );
  }

  return cardInner;
}
