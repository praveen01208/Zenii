import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface WellnessTool {
  id: string;
  number: string;
  title: string;
  image: string;
}

const wellnessTools: WellnessTool[] = [
  {
    id: "01",
    number: "01",
    title: "Empathetic AI Chat",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "02",
    number: "02",
    title: "Mindful Journaling",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "03",
    number: "03",
    title: "Safe Peer Circles",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "04",
    number: "04",
    title: "Professional Therapy",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80",
  },
];

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev + 1) % wellnessTools.length);
  };

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev - 1 + wellnessTools.length) % wellnessTools.length);
  };

  const currentTool = wellnessTools[activeSlideIndex];

  return (
    <header id="hero" className="hero-section relative w-full min-h-[105vh] md:min-h-[110vh] flex flex-col justify-between bg-[#0a2617] pb-10 md:pb-14 overflow-hidden">
      {/* Full-bleed Hero Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          src="/videos/herovideo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover filter brightness-75 contrast-105 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a2617] via-[#0a2617]/40 to-[#0a2617]/60 pointer-events-none" />
      </div>

      {/* Hero Headline Content */}
      <div className="relative z-10 w-full px-5 sm:px-8 md:px-12 lg:px-16 pt-20 sm:pt-24 md:pt-28 flex-1 flex flex-col justify-center pb-6 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <h1 className="hero-header font-sans-main text-[44px] xs:text-[54px] sm:text-7xl md:text-[70px] lg:text-[90px] xl:text-[100px] text-[#fffdf5] font-normal leading-[0.95] tracking-tight drop-shadow-md">
            When Your Mind Gets Loud,
          </h1>
          <h1 className="hero-header font-sans-main text-[44px] xs:text-[54px] sm:text-7xl md:text-[70px] lg:text-[90px] xl:text-[100px] text-[#fffdf5] font-normal leading-[0.95] tracking-tight drop-shadow-md">
            Zeni Listens.
          </h1>
          
          <p className="mt-6 text-base sm:text-lg md:text-xl text-[#fffdf5]/80 font-normal max-w-xl leading-relaxed drop-shadow-sm">
            Your private AI companion for the moments you need someone to talk to — without judgment, pressure, or awkwardness.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#ffebc4] text-[#0a2617] font-bold text-sm tracking-wider uppercase hover:bg-[#fffdf5] transition shadow-lg w-fit border-0 cursor-pointer"
            >
              Talk to Zeni &rarr;
            </button>
            <span className="text-xs text-[#fffdf5]/75 font-sans tracking-wider">
              Private &bull; Always available &bull; Built for you
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section Layout */}
      <div className="relative z-10 w-full mb-4 md:mb-6">
        {/* Desktop / Tablet 2-Column Layout */}
        <div className="hidden md:grid md:grid-cols-2 border-t border-white/20 bg-transparent">
          {/* Wellness Tools Column */}
          <div className="p-6 md:p-8 pb-8 md:pb-10 flex flex-col justify-between">
            <span className="text-[#fffdf5]/90 text-xs font-sans tracking-wide mb-3 block">
              Wellness Tools
            </span>

            <div style={{
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              boxShadow: `
                inset 0 0 20px rgba(255, 255, 255, 0.18),
                inset 0 0 5px rgba(255, 255, 255, 0.28),
                0 12px 30px rgba(0, 0, 0, 0.45)
              `,
              border: '1px solid rgba(255, 255, 255, 0.16)',
            }} className="bg-white/10 rounded-2xl p-4 flex items-center justify-between w-full max-w-md shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTool.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center space-x-4 w-full justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div style={{
                      boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.25), 0 8px 20px rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={currentTool.image}
                        alt={currentTool.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col justify-between h-20 py-1">
                      <h3 className="font-sans-main text-[#fffdf5] text-base md:text-lg font-normal leading-tight max-w-[160px]">
                        {currentTool.title}
                      </h3>

                      <button
                        onClick={onGetStarted}
                        className="self-start text-[11px] font-sans uppercase tracking-widest text-[#fffdf5] border border-[#fffdf5]/60 rounded-full px-4 py-1 hover:bg-[#fffdf5] hover:text-[#0a2617] transition-colors cursor-pointer bg-transparent"
                      >
                        EXPLORE
                      </button>
                    </div>
                  </div>

                  <span className="text-[#fffdf5]/80 font-sans text-sm font-light self-start pt-1 pr-1">
                    {currentTool.number}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Controls Below Card */}
            <div className="flex items-center space-x-3 mt-6 pb-2 pl-2">
              <button
                onClick={handlePrevSlide}
                aria-label="Previous tool"
                className="w-8 h-8 rounded-full bg-[#ffebc4] text-[#0a2617] flex items-center justify-center hover:bg-[#fffdf5] transition-transform active:scale-95 shadow-sm border-0 cursor-pointer"
              >
                <img
                  src="/icons/arrow-left.svg"
                  alt="Previous"
                  className="w-3.5 h-3.5"
                />
              </button>

              <div className="flex items-center space-x-1.5 px-1">
                {wellnessTools.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`rounded-full transition-all border-0 p-0 cursor-pointer ${
                      idx === activeSlideIndex
                        ? "bg-[#ffebc4] w-2 h-2"
                        : "bg-[#ffebc4]/40 w-1.5 h-1.5 hover:bg-[#ffebc4]/70"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                aria-label="Next tool"
                className="w-8 h-8 rounded-full bg-[#ffebc4] text-[#0a2617] flex items-center justify-center hover:bg-[#fffdf5] transition-transform active:scale-95 shadow-sm border-0 cursor-pointer"
              >
                <img
                  src="/icons/arrow-right.svg"
                  alt="Next"
                  className="w-3.5 h-3.5"
                />
              </button>
            </div>
          </div>

          {/* Introduction Column */}
          <div className="p-6 md:p-8 pb-8 md:pb-10 border-l border-white/20 flex flex-col justify-between">
            <span className="text-[#fffdf5]/90 text-xs font-sans tracking-wide mb-3 block">
              Introduction
            </span>

            <div className="flex items-center justify-between gap-4 mt-2">
              <p className="font-sans-main text-[#fffdf5]/95 text-base md:text-lg font-normal leading-snug max-w-sm">
                A safe, supportive platform where young minds can share, heal, and grow.
              </p>

              {/* Bright White Long-Tailed Arrow */}
              <div className="flex-shrink-0 pr-2">
                <svg
                  className="w-6 h-8 text-[#fffdf5] animate-bounce"
                  viewBox="0 0 24 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2V30M12 30L4 22M12 30L20 22"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stacked Layout */}
        <div className="flex md:hidden flex-col pb-6">
          <div className="border-t border-white/20 w-full" />
          
          <div className="px-5 py-2.5">
            <span className="text-[#fffdf5]/90 text-xs font-sans tracking-wide block">
              Wellness Tools
            </span>
          </div>

          <div className="border-t border-white/20 w-full" />

          <div className="p-3.5 sm:p-4 pb-6 flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-3 flex items-center justify-between w-full shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTool.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center space-x-3 w-full justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                      <img
                        src={currentTool.image}
                        alt={currentTool.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col justify-between h-16 py-0.5">
                      <h3 className="font-sans-main text-[#fffdf5] text-sm sm:text-base font-normal leading-tight max-w-[130px]">
                        {currentTool.title}
                      </h3>

                      <button
                        onClick={onGetStarted}
                        className="self-start text-[10px] font-sans uppercase tracking-widest text-[#fffdf5] border border-[#fffdf5]/60 rounded-full px-3 py-0.5 hover:bg-[#fffdf5] hover:text-[#0a2617] transition-colors font-medium bg-transparent cursor-pointer"
                      >
                        EXPLORE
                      </button>
                    </div>
                  </div>

                  <span className="text-[#fffdf5]/80 font-sans text-xs font-light self-start pt-1 pr-1">
                    {currentTool.number}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center space-x-3 mt-3 pb-2">
              <button
                onClick={handlePrevSlide}
                aria-label="Previous tool"
                className="w-8 h-8 rounded-full bg-[#ffebc4] text-[#0a2617] flex items-center justify-center hover:bg-[#fffdf5] transition-transform active:scale-95 shadow-sm border-0 cursor-pointer"
              >
                <img
                  src="/icons/arrow-left.svg"
                  alt="Previous"
                  className="w-3.5 h-3.5"
                />
              </button>

              <div className="flex items-center space-x-1.5 px-1">
                {wellnessTools.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`rounded-full transition-all border-0 p-0 cursor-pointer ${
                      idx === activeSlideIndex
                        ? "bg-[#ffebc4] w-2 h-2"
                        : "bg-[#ffebc4]/40 w-1.5 h-1.5 hover:bg-[#ffebc4]/70"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                aria-label="Next tool"
                className="w-8 h-8 rounded-full bg-[#ffebc4] text-[#0a2617] flex items-center justify-center hover:bg-[#fffdf5] transition-transform active:scale-95 shadow-sm border-0 cursor-pointer"
              >
                <img
                  src="/icons/arrow-right.svg"
                  alt="Next"
                  className="w-3.5 h-3.5"
                />
              </button>
            </div>
          </div>

          <div className="border-t border-white/20 w-full" />

          <div className="px-5 py-2.5">
            <span className="text-[#fffdf5]/90 text-xs font-sans tracking-wide block">
              Introduction
            </span>
          </div>

          <div className="border-t border-white/20 w-full" />

          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <p className="font-sans-main text-[#fffdf5]/95 text-xs sm:text-sm font-normal leading-snug max-w-xs">
              A safe, supportive platform where young minds can share, heal, and grow.
            </p>

            {/* Bright White Long-Tailed Arrow */}
            <div className="flex-shrink-0 pr-1">
              <svg
                className="w-5 h-7 text-[#fffdf5] animate-bounce"
                viewBox="0 0 24 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2V30M12 30L4 22M12 30L20 22"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
