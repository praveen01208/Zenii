import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserPlus, MessageSquare, Activity, UserCheck, ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    number: "01",
    icon: UserPlus,
    badge: "STEP 01 • PRIVATE ONBOARDING",
    title: "Create Your Sanctuary Account",
    desc: "Sign up in 30 seconds with complete privacy. Anonymized profile creation ensures your identity stays 100% confidential.",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    highlight: "100% Anonymous & Secure"
  },
  {
    number: "02",
    icon: MessageSquare,
    badge: "STEP 02 • 24/7 CONVERSATION",
    title: "Start Talking with Zeni AI",
    desc: "Share your thoughts without judgment. Zeni parses sentiment patterns and offers empathetic responses in English, Hindi, Hinglish, or Kannada.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    highlight: "Available at 2 AM with Zero Wait"
  },
  {
    number: "03",
    icon: Activity,
    badge: "STEP 03 • MOOD & TELEMETRY",
    title: "Track Your Emotional Journey",
    desc: "Log daily energy levels, visualize sentiment trends over weeks, and discover underlying emotional triggers in your private dashboard.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    highlight: "Encrypted Personal Analytics"
  },
  {
    number: "04",
    icon: UserCheck,
    badge: "STEP 04 • CLINICAL CARE",
    title: "Connect with Verified Therapists",
    desc: "Whenever you want support beyond AI conversation, book 1-on-1 video sessions with licensed adolescent psychotherapists.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
    highlight: "Verified Adolescent Specialists"
  }
];

interface HowItWorksSectionProps {
  onGetStarted?: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onGetStarted }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Manual scroll handler
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 380;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Auto horizontal scroll interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 380, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-24 sm:py-36 bg-[#071d13] text-[#fffdf5] border-b border-white/10 relative overflow-hidden w-full">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#10b981]/5 rounded-full blur-[180px] pointer-events-none" />

      {/* 100% Full-Width Header Row */}
      <div className="w-full px-6 sm:px-10 lg:px-16 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#ffebc4] text-sm">✱</span>
              <p className="font-sans text-xs sm:text-sm tracking-[0.2em] uppercase font-bold text-[#ffebc4]">
                STEP-BY-STEP JOURNEY
              </p>
            </div>
            <h2 className="font-sans-main text-4xl sm:text-6xl md:text-7xl text-white font-normal leading-[1.02] tracking-tight">
              How ZenMind Works
            </h2>
          </div>

          {/* Manual Scroll Control Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScroll('left')}
              className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#ffebc4] hover:text-[#0a2617] transition-all cursor-pointer shadow-lg active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#ffebc4] hover:text-[#0a2617] transition-all cursor-pointer shadow-lg active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* 100% Full-Width Horizontal Auto-Scrolling Carousel Track */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="w-full overflow-x-auto scrollbar-none flex gap-6 px-6 sm:px-10 lg:px-16 py-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {STEPS.map((step) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={step.number}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="w-[320px] sm:w-[380px] md:w-[420px] h-[480px] sm:h-[520px] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl relative shrink-0 flex flex-col justify-between p-8 sm:p-10 group"
            >
              {/* Full-Bleed Background Photography */}
              <img
                src={step.image}
                alt={step.title}
                className="absolute inset-0 w-full h-full object-cover filter brightness-75 contrast-110 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              />

              {/* Smoky Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#071d13] via-[#071d13]/80 to-[#071d13]/30 backdrop-blur-[2px] pointer-events-none" />

              {/* Top Header info */}
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#ffebc4] text-[#0a2617] flex items-center justify-center font-extrabold shadow-md">
                    <Icon size={20} />
                  </div>
                  <span className="font-sans text-xs tracking-widest text-[#ffebc4] uppercase font-bold">
                    {step.number}
                  </span>
                </div>
                <span className="text-[10px] font-sans text-white/70 uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  Phase {step.number} of 04
                </span>
              </div>

              {/* Bottom Content Area */}
              <div className="relative z-10 space-y-4">
                <h3 className="font-sans-main text-2xl sm:text-3xl text-white font-normal leading-tight">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-white/85 font-normal leading-relaxed">
                  {step.desc}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-bold text-[#10b981]">
                    <CheckCircle size={14} />
                    {step.highlight}
                  </span>

                  <button
                    onClick={onGetStarted}
                    className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#ffebc4] hover:text-[#0a2617] transition-all cursor-pointer shrink-0"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Subtle Step Watermark */}
              <div className="absolute right-6 top-16 text-8xl font-sans-main font-bold text-white/5 pointer-events-none select-none">
                {step.number}
              </div>

            </motion.div>
          );
        })}
      </div>

    </section>
  );
};
