import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

export interface ImageItem {
  src: string;
  alt: string;
}

export interface PhoneCarouselProps {
  images?: ImageItem[];
  currentMsgIndex?: number;
  onLanguageChange?: (index: number) => void;
}

export function PhoneCarousel({ images, currentMsgIndex = 0, onLanguageChange }: PhoneCarouselProps) {
  const [activeIdx, setActiveIdx] = useState(currentMsgIndex);

  const messages = [
    {
      lang: "ENGLISH",
      tone: "Empathy Attuned",
      text: "I hear how heavy that exam pressure feels tonight. Take your time — there's no rush.",
      time: "02:14 AM",
    },
    {
      lang: "HINGLISH",
      tone: "Regional Speech",
      text: "Koi baat nahi, chill karo. Main yahan hoon tumhari baat sunne ke liye. Tension mat lo.",
      time: "02:15 AM",
    },
    {
      lang: "HINDI",
      tone: "Hindi Contextual",
      text: "मुझे आपकी बात समझ आ रही है, बेझिझक बोलिए। आपका मन हल्का होगा।",
      time: "02:16 AM",
    },
    {
      lang: "KANNADA",
      tone: "Kannada Fluent",
      text: "ನನಗೆ ನಿಮ್ಮ ಒತ್ತಡ ಅರ್ಥವಾಗುತ್ತಿದೆ, ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ಯಾವುದೇ ಆತಂಕ ಬೇಡ.",
      time: "02:17 AM",
    }
  ];

  // Automatic timer auto-play for ad-like cycling
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => {
        const nextIdx = (prev + 1) % messages.length;
        onLanguageChange?.(nextIdx);
        return nextIdx;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [messages.length, onLanguageChange]);

  useEffect(() => {
    setActiveIdx(currentMsgIndex);
  }, [currentMsgIndex]);

  const activeMsg = messages[activeIdx];

  const handleNext = () => {
    const nextIdx = (activeIdx + 1) % messages.length;
    setActiveIdx(nextIdx);
    onLanguageChange?.(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (activeIdx - 1 + messages.length) % messages.length;
    setActiveIdx(prevIdx);
    onLanguageChange?.(prevIdx);
  };

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto flex flex-col items-center select-none">
      
      {/* Outer iPhone Frame Chassis */}
      <div className="relative w-full h-[620px] rounded-[50px] bg-[#05140b] p-4 border-[6px] border-[#1a2e23] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col justify-between overflow-hidden">
        
        {/* Dynamic Island Notch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-black z-40 flex items-center justify-between px-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0a2617] border border-white/20" />
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
        </div>

        {/* Screen Viewport */}
        <div className="relative w-full h-full rounded-[38px] bg-gradient-to-b from-[#0a2617] via-[#092214] to-[#071d13] p-5 pt-12 flex flex-col justify-between overflow-hidden text-white">
          
          {/* Header App Bar inside Phone */}
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-[#ffebc4] text-[#0a2617] flex items-center justify-center font-bold font-sans text-sm">
                Z
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-[#0a2617]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-sans tracking-wide">Zeni Sanctuary AI</h4>
                <span className="text-[10px] text-[#10b981] font-sans font-semibold flex items-center gap-1">
                  <ShieldCheck size={10} /> 100% Encrypted
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-sans font-bold text-[#ffebc4] border border-white/15">
              {activeMsg.lang}
            </span>
          </div>

          {/* Chat Messages Body inside Phone */}
          <div className="my-auto py-4 space-y-4">
            
            {/* Incoming User Message */}
            <div className="flex justify-end">
              <div className="max-w-[82%] p-3.5 rounded-2xl rounded-tr-none bg-white/15 text-white text-xs font-sans leading-relaxed border border-white/10 shadow-md">
                I'm feeling so overwhelmed about finals tomorrow. I can't sleep.
                <div className="text-[9px] text-white/50 text-right mt-1 font-mono">02:13 AM</div>
              </div>
            </div>

            {/* AI Zeni Reply Bubble (Auto-cycling with current language) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-[#ffebc4] text-[#0a2617] flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                  Z
                </div>
                <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-none bg-[#0e3820] text-white border border-[#10b981]/40 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#ffebc4] font-sans font-bold">
                    <span>{activeMsg.tone}</span>
                    <span className="text-[#10b981]">Resonance 99.4%</span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans font-normal leading-relaxed text-white">
                    "{activeMsg.text}"
                  </p>
                  <div className="text-[9px] text-white/50 text-right font-mono pt-1">
                    {activeMsg.time} &bull; Read
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Bottom Interactive Control Buttons inside Phone */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-full bg-white/10 text-white text-[11px] font-sans font-semibold flex items-center gap-1 hover:bg-white/20 cursor-pointer"
            >
              <ChevronLeft size={14} />
              Prev
            </button>

            <div className="flex items-center gap-1">
              {messages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeIdx ? "w-5 bg-[#ffebc4]" : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-full bg-[#ffebc4] text-[#0a2617] text-[11px] font-sans font-bold flex items-center gap-1 hover:bg-white cursor-pointer"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
