import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

interface SanctuaryCTASectionProps {
  onGetStarted?: () => void;
}

export const SanctuaryCTASection: React.FC<SanctuaryCTASectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-24 sm:py-36 bg-[#0a2617] text-[#fffdf5] relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#10b981]/10 to-[#ffebc4]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-10 relative z-10">
        
        <div className="p-10 sm:p-20 rounded-[3rem] bg-gradient-to-br from-[#0d5d3a] via-[#071d13] to-[#8a3f36] border-2 border-white/20 shadow-2xl text-center relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-8">
            <Sparkles className="w-4 h-4" />
            <span>START YOUR SANCTUARY JOURNEY</span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl text-white font-normal leading-[0.98] mb-8 max-w-4xl mx-auto">
            Your Mind Deserves a <span className="text-[#ffebc4] italic">Safe Space to Breathe.</span>
          </h2>

          <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            No judgment, no appointments, no waiting lists. Experience 24/7 AI listening, encrypted mood insights, and verified human psychotherapy today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10">
            <button
              onClick={onGetStarted}
              className="px-10 py-5 rounded-full bg-[#ffebc4] text-[#0a2617] font-black text-sm uppercase tracking-wider hover:bg-white transition-all shadow-2xl border-0 cursor-pointer inline-flex items-center gap-3"
            >
              <span>TALK TO ZENI NOW</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/75 font-sans font-medium">
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#10b981]" />
              100% Encrypted & Anonymized
            </span>
            <span className="flex items-center gap-2">
              <Heart size={14} className="text-[#ffebc4]" />
              Multi-Lingual (Hindi, Hinglish, Kannada)
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
