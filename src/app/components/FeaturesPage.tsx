import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, BrainCircuit, ShieldCheck, MessageSquare, Heart, Globe, Lock, 
  UserCheck, ArrowRight, ChevronDown, Activity, Users, ShoppingBag, 
  Calendar, CheckCircle, RefreshCw, Layers, Shield, Zap, X, AlertCircle
} from 'lucide-react';
import { Navbar as LandingNavbar } from './landing/Navbar';
import { Footer as LandingFooter } from './landing/Footer';

const BELIEVE_FEATURES = [
  {
    id: "01",
    number: "01",
    title: "Emotion-Aware Conversations",
    description: "Zeni detects sentiment patterns in your messages",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "02",
    number: "02",
    title: "Independent Crisis Detection",
    description: "Independent safety pipeline to watch for signs of distress",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "03",
    number: "03",
    title: "Personal Conversation Memory",
    description: "Remembers past context and topics that matter to you",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "04",
    number: "04",
    title: "Private & Judgment-Free",
    description: "Anonymized logs and state-of-the-art data protection",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "05",
    number: "05",
    title: "English, Hindi, Hinglish & Kannada",
    description: "Communicate naturally in your preferred language",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "06",
    number: "06",
    title: "Personalized Check-ins",
    description: "Smart prompts tailored to your current energy and mood",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "07",
    number: "07",
    title: "Mood & Emotional Insights",
    description: "Visualize patterns and triggers over weeks and months",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "08",
    number: "08",
    title: "Guided Calm & Grounding",
    description: "Interactive tools to help when your mind gets loud",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "09",
    number: "09",
    title: "Professional Support Network",
    description: "Direct connection with verified offline and online experts",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "10",
    number: "10",
    title: "Available Whenever You Need It",
    description: "Instant response times, day or night",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
  },
];

const SWAP_CARDS = [
  {
    badge: "TIER 01 • INSTANT AI",
    title: "24/7 AI Companion",
    desc: "Instant empathetic responses in English, Hindi, Hinglish, and Kannada — available 24/7 without appointments.",
    color: "from-[#0d5d3a] to-[#10b981]",
    icon: MessageSquare,
  },
  {
    badge: "TIER 02 • TELEMETRY",
    title: "Sentiment & Tone Engine",
    desc: "Analyzes sentiment velocity and emotional context behind messages to provide tailored care guidance.",
    color: "from-[#071d13] to-[#0d5d3a]",
    icon: BrainCircuit,
  },
  {
    badge: "TIER 03 • PROTECTION",
    title: "Crisis Safety Guardian",
    desc: "Isolated background safety pipeline monitoring distress signals to activate immediate care protocols.",
    color: "from-[#8a3f36] to-[#c25a2a]",
    icon: ShieldCheck,
  },
  {
    badge: "TIER 04 • CLINICAL CARE",
    title: "Verified Human Therapy",
    desc: "Direct session booking with licensed adolescent psychologists and CBT specialists for deep healing.",
    color: "from-[#113322] to-[#0d5d3a]",
    icon: UserCheck,
  },
];

const ZENMIND_MODULES = [
  {
    id: "01",
    badge: "MODULE 01 • AI CONVERSATIONS",
    title: "Zeni 24/7 AI Companion",
    headline: "Always available. Zero judgment. 4 Regional Languages.",
    desc: "Zeni evaluates sentiment velocity and emotional context behind every message — offering instant, judgment-free support when your mind gets loud at 2 AM.",
    pills: ["English", "Hindi", "Hinglish", "Kannada", "100% Encrypted", "Zero Delay"],
    icon: MessageSquare,
    accent: "#10b981",
    preview: {
      type: "chat",
      userMsg: "I feel completely overwhelmed with exams tomorrow and can't sleep.",
      zeniMsg: "I hear how heavy that pressure feels right now. Take a deep breath — you don't have to carry it all at once.",
      status: "Empathy Attuned • 24/7 Active"
    }
  },
  {
    id: "02",
    badge: "MODULE 02 • MOOD INTELLIGENCE",
    title: "Encrypted Mood Journal & Analytics",
    headline: "Track emotional trends and uncover personal triggers.",
    desc: "Log daily energy levels, track sentiment scores over weeks, and discover patterns in your mental well-being with encrypted analytics.",
    pills: ["Daily Energy Log", "Trigger Analytics", "Sentiment Score", "Weekly Insights"],
    icon: Activity,
    accent: "#ffebc4",
    preview: {
      type: "stats",
      metric1Name: "Weekly Balance Score",
      metric1Val: "8.8 / 10",
      metric2Name: "Dominant Trait",
      metric2Val: "Calm Focus",
      status: "Encrypted & Private"
    }
  },
  {
    id: "03",
    badge: "MODULE 03 • PEER COMMUNITY",
    title: "Moderated Peer Circles",
    headline: "Safe, anonymous spaces to connect with students who understand.",
    desc: "Join moderated group circles to share lived experiences, reduce isolation, and build genuine resilience alongside peers.",
    pills: ["Anonymous Handles", "Moderated Rooms", "Shared Healing", "Zero Stigma"],
    icon: Users,
    accent: "#10b981",
    preview: {
      type: "circle",
      circleName: "Late Night Study Anxiety Room",
      activeCount: "24 Students Active",
      lastPost: "Knowing I'm not the only one feeling this way makes a huge difference."
    }
  },
  {
    id: "04",
    badge: "MODULE 04 • CLINICAL CARE",
    title: "Verified Psychotherapist Desk",
    headline: "Direct 1-on-1 session booking with licensed experts.",
    desc: "Connect directly with verified adolescent psychotherapists, psychiatrists, and CBT specialists for online or in-person sessions.",
    pills: ["10+ Yrs Exp", "CBT & Counseling", "Online / In-Person", "Verified Credentials"],
    icon: UserCheck,
    accent: "#ffebc4",
    preview: {
      type: "therapist",
      name: "Dr. Ananya Sharma",
      role: "Licensed Youth Psychologist",
      exp: "12+ Yrs Experience",
      availability: "Next Available Today, 4:00 PM"
    }
  },
  {
    id: "05",
    badge: "MODULE 05 • DIGITAL ASSETS",
    title: "Digital Wellness Store & Exercises",
    headline: "Curated meditation audio, grounding packs, and worksheets.",
    desc: "Access guided audio meditations, grounding exercises, and mental health worksheets designed by clinical psychologists.",
    pills: ["Guided Meditations", "Grounding Audio", "CBT Worksheets", "Instant Download"],
    icon: ShoppingBag,
    accent: "#10b981",
    preview: {
      type: "store",
      itemTitle: "2-Min Grounding Audio Pack",
      downloads: "1,420+ Downloads",
      price: "Free Access"
    }
  }
];

interface FeaturesPageProps {
  onClose: () => void;
  onGetStarted?: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
  onCompanyLinkClick?: (link: string) => void;
  onResourcesLinkClick?: (link: string) => void;
}

export default function FeaturesPage({
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
}: FeaturesPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);

  // Synus Card Swap Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % SWAP_CARDS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleCompanyNavigation = (link: string) => {
    if (link === 'About Us') {
      onCompanyLinkClick?.(link);
    } else if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectedModule = ZENMIND_MODULES[selectedModuleIdx];

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
      />

      {/* ── SECTION 1: HERO WITH SYNUS KINETIC CARD SWAP ── */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-24 sm:pb-32 bg-[#0a2617] overflow-hidden border-b border-white/10">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#ffebc4]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Headline */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#ffebc4]" />
                <span>PLATFORM ARCHITECTURE</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[72px] text-[#fffdf5] font-normal leading-[0.98] tracking-tight mb-8">
                Built to understand the <span className="text-[#ffebc4] italic">noise in your head.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#fffdf5]/85 font-normal leading-relaxed mb-10 max-w-xl">
                ZenMind combines instant 24/7 AI listening, multi-lingual natural speech, encrypted sentiment telemetry, and on-demand clinical human care in one sanctuary.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 rounded-full bg-[#ffebc4] text-[#0a2617] font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-xl border-0 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>EXPLORE PLATFORM NOW</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>

            {/* Right Interactive Synus Card Swap Display */}
            <div className="lg:col-span-6 relative h-[420px] sm:h-[460px] flex items-center justify-center">
              
              <div className="relative w-full max-w-md h-full flex items-center justify-center">
                {SWAP_CARDS.map((card, index) => {
                  const Icon = card.icon;
                  const isFront = index === activeCardIndex;
                  const offset = (index - activeCardIndex + SWAP_CARDS.length) % SWAP_CARDS.length;

                  return (
                    <motion.div
                      key={card.title}
                      onClick={() => setActiveCardIndex(index)}
                      initial={false}
                      animate={{
                        y: offset * 18,
                        scale: 1 - offset * 0.05,
                        opacity: offset < 3 ? 1 - offset * 0.2 : 0,
                        zIndex: SWAP_CARDS.length - offset,
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      className={`absolute inset-x-0 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br ${card.color} border border-white/20 shadow-2xl cursor-pointer select-none backdrop-blur-xl`}
                    >
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/15">
                        <span className="font-sans text-xs tracking-widest text-[#ffebc4] font-bold">
                          {card.badge}
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white">
                          <Icon size={20} />
                        </div>
                      </div>

                      <h3 className="text-3xl text-white font-normal mb-4">
                        {card.title}
                      </h3>

                      <p className="text-base text-white/85 font-normal leading-relaxed mb-6">
                        {card.desc}
                      </p>

                      <div className="flex items-center justify-between text-xs font-sans text-[#ffebc4] font-semibold pt-4 border-t border-white/15">
                        <span>Click to swap card</span>
                        <RefreshCw size={14} className={isFront ? "animate-spin" : ""} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 2: EXACT LANDING PAGE "MORE THAN A CONVERSATION" (10-ROW TABLE) ── */}
      <section
        id="pillars"
        className="relative w-full pt-24 sm:pt-32 md:pt-36 pb-20 sm:pb-28 bg-[#f8fdf9] text-[#0a2617] border-b border-white/10"
      >
        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 relative">
          {/* Section Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 sm:mb-14"
          >
            <h2 className="font-sans-main text-5xl sm:text-7xl md:text-8xl lg:text-[85px] text-[#0a2617] font-normal leading-[0.98] tracking-tight">
              More Than a Conversation
            </h2>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#0a2617]/75 font-normal max-w-xl">
              One companion. Built to understand the context behind the conversation.
            </p>
          </motion.div>

          {/* Table Column Headers */}
          <div className="w-full grid grid-cols-12 gap-4 pb-3 border-b border-[#0a2617]/15 text-[11px] sm:text-xs font-sans tracking-widest text-[#0a2617]/50 uppercase font-medium">
            <div className="col-span-3 sm:col-span-2">Feature</div>
            <div className="col-span-9 sm:col-span-10">Capabilities</div>
          </div>

          {/* List of 100% Full-Width Rows */}
          <div className="w-full flex flex-col relative pt-1">
            {BELIEVE_FEATURES.map((item, idx) => {
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative group cursor-pointer border-b border-[#0a2617]/15 py-3.5 sm:py-4.5 transition-colors duration-200 w-full overflow-visible"
                >
                  {/* Highlight background */}
                  {isHovered && (
                    <motion.div
                      layoutId="activeRowBackgroundFeatures"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 30,
                      }}
                      className="absolute inset-0 bg-[#0a2617]/[0.04] rounded-lg -mx-2 px-2 pointer-events-none"
                    />
                  )}

                  <div className="grid grid-cols-12 gap-4 items-center relative z-10 w-full">
                    {/* Number Roll Text */}
                    <div className="col-span-3 sm:col-span-2">
                      <div className="relative overflow-hidden h-[28px] sm:h-[32px] inline-flex flex-col">
                        <span className="block font-sans-main text-xl sm:text-2xl md:text-3xl text-[#0a2617]/70 font-normal leading-[28px] sm:leading-[32px] transition-transform duration-250 ease-out group-hover:-translate-y-full">
                          {item.number}
                        </span>
                        <span className="absolute top-full left-0 block font-sans-main text-xl sm:text-2xl md:text-3xl text-[#0a2617] font-medium leading-[28px] sm:leading-[32px] transition-transform duration-250 ease-out group-hover:-translate-y-full">
                          {item.number}
                        </span>
                      </div>
                    </div>

                    {/* Title Roll Text */}
                    <div className="col-span-9 sm:col-span-10">
                      <div className="relative overflow-hidden h-[32px] sm:h-[38px] md:h-[42px] inline-flex flex-col">
                        <span className="block font-sans-main text-xl sm:text-2xl md:text-3xl lg:text-[36px] text-[#0a2617] font-normal leading-[32px] sm:leading-[38px] md:leading-[42px] tracking-tight transition-transform duration-250 ease-out group-hover:-translate-y-full">
                          {item.title}
                        </span>
                        <span className="absolute top-full left-0 block font-sans-main text-xl sm:text-2xl md:text-3xl lg:text-[36px] text-[#0a2617] font-medium leading-[32px] sm:leading-[38px] md:leading-[42px] tracking-tight transition-transform duration-250 ease-out group-hover:-translate-y-full">
                          {item.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Card Preview */}
                  <div
                    className="absolute right-5 top-1/2 z-40 pointer-events-none hidden sm:block"
                    style={{ transform: 'translateY(-50%)', width: '30vh', height: '380%' }}
                  >
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.88, rotate: 5 }}
                          animate={{ opacity: 1, scale: 1, rotate: 3 }}
                          exit={{ opacity: 0, scale: 0.9, rotate: -2 }}
                          transition={{
                            duration: 0.25,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          style={{
                            backdropFilter: 'blur(15px)',
                            WebkitBackdropFilter: 'blur(15px)',
                            boxShadow: `
                              inset 0 0 20px rgba(255, 255, 255, 0.18),
                              inset 0 0 5px rgba(255, 255, 255, 0.28),
                              0 12px 30px rgba(0, 0, 0, 0.45)
                            `,
                            border: '1px solid rgba(255, 255, 255, 0.16)',
                          }}
                          className="w-full h-full rounded-[20px] overflow-hidden shadow-2xl bg-[#0a2617] relative"
                        >
                          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-3.5 left-4 right-4 text-white/95 font-sans text-[11px] sm:text-xs tracking-wider uppercase font-medium">
                            {item.number} — {item.title}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: RECREATED "THE 5 ZENMIND MODULES" (INTERACTIVE KINETIC SHOWCASE) ── */}
      <section className="py-24 sm:py-36 bg-[#0a2617] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold block mb-3">
                ✦ INTEGRATED DIGITAL HEALTH SYSTEM
              </span>
              <h2 className="text-4xl sm:text-6xl text-white font-normal leading-tight">
                The 5 ZenMind Modules
              </h2>
            </div>
            <p className="text-base text-white/75 max-w-md">
              Explore the five interconnected modules powering Zeni's adolescent wellness ecosystem.
            </p>
          </div>

          {/* Interactive 5-Module Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Module Navigation Buttons (col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {ZENMIND_MODULES.map((mod, i) => {
                const isSelected = selectedModuleIdx === i;
                const Icon = mod.icon;

                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleIdx(i)}
                    className={`p-6 rounded-[2rem] border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-[#071d13] border-[#ffebc4]/50 shadow-2xl scale-[1.02]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                        isSelected ? "bg-[#ffebc4] text-[#0a2617]" : "bg-white/10 text-white"
                      }`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <span className="font-sans text-[10px] tracking-widest text-[#ffebc4] uppercase font-bold block mb-0.5">
                          {mod.badge}
                        </span>
                        <h3 className="text-lg sm:text-xl text-white font-normal">
                          {mod.title}
                        </h3>
                      </div>
                    </div>

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-transform ${
                      isSelected ? "bg-[#ffebc4] text-[#0a2617] rotate-90" : "bg-white/10 text-white/50"
                    }`}>
                      →
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Active Module Interactive Visualizer Panel (col-span-7) */}
            <div className="lg:col-span-7 p-8 sm:p-12 rounded-[2.5rem] bg-[#071d13] border border-white/15 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedModule.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col justify-between h-full space-y-8"
                >
                  <div>
                    <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                      <span className="font-sans text-xs tracking-widest text-[#ffebc4] uppercase font-bold">
                        {selectedModule.badge}
                      </span>
                      <span className="px-3.5 py-1 rounded-full bg-white/10 text-xs font-sans text-[#10b981] border border-[#10b981]/30 font-semibold">
                        System Online ✦
                      </span>
                    </div>

                    <h3 className="text-3xl sm:text-4xl text-white font-normal mb-3">
                      {selectedModule.title}
                    </h3>

                    <p className="text-lg text-[#ffebc4] font-normal mb-4">
                      {selectedModule.headline}
                    </p>

                    <p className="text-base text-white/75 font-normal leading-relaxed mb-8">
                      {selectedModule.desc}
                    </p>

                    {/* Interactive Live Mockup Display */}
                    <div className="p-6 rounded-2xl bg-[#0a2617] border border-white/10 shadow-inner">
                      {selectedModule.preview.type === "chat" && (
                        <div className="space-y-4 text-xs sm:text-sm">
                          <div className="p-3.5 rounded-2xl bg-white/10 text-white max-w-sm ml-auto">
                            <p>{selectedModule.preview.userMsg}</p>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-[#10b981]/20 text-[#ffebc4] border border-[#10b981]/30 max-w-md">
                            <p className="font-semibold mb-1">Zeni AI:</p>
                            <p>{selectedModule.preview.zeniMsg}</p>
                          </div>
                        </div>
                      )}

                      {selectedModule.preview.type === "stats" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] font-sans text-white/50 uppercase block mb-1">
                              {selectedModule.preview.metric1Name}
                            </span>
                            <span className="text-2xl text-[#ffebc4] font-bold">
                              {selectedModule.preview.metric1Val}
                            </span>
                          </div>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] font-sans text-white/50 uppercase block mb-1">
                              {selectedModule.preview.metric2Name}
                            </span>
                            <span className="text-2xl text-white font-bold">
                              {selectedModule.preview.metric2Val}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedModule.preview.type === "circle" && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-white font-semibold">{selectedModule.preview.circleName}</span>
                            <span className="text-xs text-[#10b981] font-bold">{selectedModule.preview.activeCount}</span>
                          </div>
                          <p className="text-xs text-white/70 italic p-3 rounded-xl bg-white/5 border border-white/10">
                            "{selectedModule.preview.lastPost}"
                          </p>
                        </div>
                      )}

                      {selectedModule.preview.type === "therapist" && (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base text-white font-bold">{selectedModule.preview.name}</h4>
                            <p className="text-xs text-[#ffebc4]">{selectedModule.preview.role} • {selectedModule.preview.exp}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#10b981]/20 text-[#10b981] text-xs font-bold border border-[#10b981]/30">
                            {selectedModule.preview.availability}
                          </span>
                        </div>
                      )}

                      {selectedModule.preview.type === "store" && (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base text-white font-bold">{selectedModule.preview.itemTitle}</h4>
                            <p className="text-xs text-white/70">{selectedModule.preview.downloads}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#ffebc4] text-[#0a2617] text-xs font-extrabold">
                            {selectedModule.preview.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pills Strip */}
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
                    {selectedModule.pills.map((pill) => (
                      <span key={pill} className="px-3.5 py-1.5 rounded-full bg-white/5 text-xs font-sans text-[#ffebc4] border border-white/10 font-semibold">
                        {pill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 4: RECREATED "WHY ZENMIND STAND APART" (3D GLASS BENTO GRID) ── */}
      <section className="py-24 sm:py-36 bg-[#071d13] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold block mb-3">
              ✦ CLINICAL STANDARDS & TRUST
            </span>
            <h2 className="text-4xl sm:text-6xl text-white font-normal leading-tight">
              Why ZenMind Stands Apart
            </h2>
            <p className="text-base text-white/75 mt-4">
              Comparing our continuous hybrid care framework against conventional options.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Card 1: ZenMind Platform (TERRACOTTA & EMERALD HIGH-IMPACT HERO CARD) */}
            <motion.div
              whileHover={{ y: -8 }}
              className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-[#0d5d3a] via-[#071d13] to-[#8a3f36] border-2 border-[#10b981] shadow-2xl flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                  <span className="text-xs font-sans tracking-widest text-[#ffebc4] uppercase font-extrabold">
                    RECOMMENDED SANCTUARY
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#10b981] text-[#0a2617] text-xs font-black uppercase">
                    Hybrid Care
                  </span>
                </div>

                <h3 className="text-3xl text-white font-normal mb-3">
                  ZenMind Sanctuary
                </h3>

                <p className="text-sm text-white/85 leading-relaxed mb-8">
                  Continuous 24/7 AI companion paired with real-time sentiment telemetry and verified licensed human psychotherapists.
                </p>

                <div className="space-y-3.5 mb-8">
                  {[
                    "24/7 Instant Access (Zero Wait Time)",
                    "4 Languages (Hindi, Hinglish, English, Kannada)",
                    "Background Distress Safety Guardian",
                    "100% Encrypted & Anonymized Logs",
                    "Direct Licensed Human Therapist Handoff",
                    "Encrypted Mood & Sentiment Analytics"
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-3 text-xs sm:text-sm font-sans text-white font-semibold">
                      <div className="w-5 h-5 rounded-full bg-[#10b981] text-[#0a2617] flex items-center justify-center shrink-0">
                        <CheckCircle size={12} />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full py-4 rounded-full bg-[#ffebc4] text-[#0a2617] font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-xl border-0 cursor-pointer"
              >
                EXPERIENCE ZENMIND NOW →
              </button>
            </motion.div>

            {/* Card 2: Generic AI Chatbots (FADED CARD) */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-8 sm:p-10 rounded-[2.5rem] bg-[#0a2617]/80 border border-white/10 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <span className="text-xs font-sans tracking-widest text-white/50 uppercase font-bold">
                    GENERIC AI CHATBOTS
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold">
                    Text Only
                  </span>
                </div>

                <h3 className="text-2xl text-white/90 font-normal mb-3">
                  Generic LLM Apps
                </h3>

                <p className="text-sm text-white/60 leading-relaxed mb-8">
                  Basic conversational models lacking healthcare guardrails, human therapy connectivity, or emotional memory.
                </p>

                <div className="space-y-3.5 mb-8 text-xs sm:text-sm font-sans text-white/60">
                  <div className="flex items-center gap-3"><CheckCircle size={14} className="text-white/40" /><span>24/7 Text Generation</span></div>
                  <div className="flex items-center gap-3"><X size={14} className="text-red-400" /><span>No Regional Languages (Hinglish/Kannada)</span></div>
                  <div className="flex items-center gap-3"><X size={14} className="text-red-400" /><span>No Human Therapist Connection</span></div>
                  <div className="flex items-center gap-3"><X size={14} className="text-red-400" /><span>Data May Be Used For AI Training</span></div>
                  <div className="flex items-center gap-3"><X size={14} className="text-red-400" /><span>No Crisis Guardian Safeguard</span></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 text-center text-xs text-white/40 font-sans">
                Lacks Clinical Safety Standards
              </div>
            </motion.div>

            {/* Card 3: Traditional Clinic Therapy (FADED CARD) */}
            <motion.div
              whileHover={{ y: -4 }}
              className="p-8 sm:p-10 rounded-[2.5rem] bg-[#0a2617]/80 border border-white/10 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <span className="text-xs font-sans tracking-widest text-white/50 uppercase font-bold">
                    TRADITIONAL CLINICS
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-bold">
                    Offline Only
                  </span>
                </div>

                <h3 className="text-2xl text-white/90 font-normal mb-3">
                  In-Person Clinics
                </h3>

                <p className="text-sm text-white/60 leading-relaxed mb-8">
                  Traditional in-person sessions with high costs, appointment waiting lists, and limited late-night access.
                </p>

                <div className="space-y-3.5 mb-8 text-xs sm:text-sm font-sans text-white/60">
                  <div className="flex items-center gap-3"><CheckCircle size={14} className="text-white/40" /><span>1-on-1 In-Person Therapy</span></div>
                  <div className="flex items-center gap-3"><X size={14} className="text-red-400" /><span>2-Week Appointment Waiting Lists</span></div>
                  <div className="flex items-center gap-3"><X size={14} className="text-red-400" /><span>High Cost per Session (₹2,500+)</span></div>
                  <div className="flex items-center gap-3"><X size={14} className="text-red-400" /><span>No 2 AM Instant AI Support</span></div>
                  <div className="flex items-center gap-3"><X size={14} className="text-red-400" /><span>Social Stigma & Travel Friction</span></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 text-center text-xs text-white/40 font-sans">
                High Cost & Appointment Delays
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ── SECTION 5: CTA BANNER ── */}
      <section className="py-24 sm:py-36 bg-[#0a2617]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl text-white font-normal mb-8">
            Ready to experience an instant sanctuary for your mind?
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
      />
    </motion.div>
  );
}
