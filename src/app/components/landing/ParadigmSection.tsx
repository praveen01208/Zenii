import React, { useState } from "react";
import { motion } from "motion/react";
import { PhoneCarousel } from "../ui/phone-carousel";
import { Sparkles, Globe, Shield, Activity, Clock, CheckCircle2 } from "lucide-react";

export const ParadigmSection: React.FC = () => {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);

  const dialects = [
    { code: "EN", name: "English", desc: "Native attunement for international and urbane Indian students." },
    { code: "HI", name: "Hinglish", desc: "Seamless code-switching mixing Hindi & English as spoken naturally." },
    { code: "HN", name: "Hindi (हिंदी)", desc: "Warm, culturally grounded Hindi conversation & emotional expression." },
    { code: "KN", name: "Kannada (ಕನ್ನಡ)", desc: "Deep regional dialect attunement for Karnataka's student community." },
  ];

  return (
    <section
      id="paradigm"
      className="relative w-full bg-[#0a2617] py-24 sm:py-36 md:py-44 overflow-hidden z-20 text-white"
    >
      {/* ── SUBTLE PHOTOGRAPHY BACKGROUND WITH DARK SHADOW VIGNETTE OVERLAY ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=2000&q=80"
          alt="Quiet forest background"
          className="w-full h-full object-cover filter brightness-[0.25] contrast-125 opacity-40 pointer-events-none"
        />
        {/* Dark Shadow Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a2617] via-[#0a2617]/70 to-[#0a2617] pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0a2617]/50 to-[#0a2617] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* Section Headline aligned clean to section start */}
        <div className="flex flex-col items-start text-left max-w-4xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#ffebc4] text-[11px] font-sans tracking-[0.2em] uppercase font-bold mb-4 border border-white/15"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ffebc4]" />
            <span>CULTURALLY ATTUNED CARE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-sans-main text-4xl sm:text-6xl md:text-7xl lg:text-[80px] text-white font-normal leading-[0.98] tracking-tight mb-4"
          >
            When Pressure Mounts,<br />
            <span className="italic text-[#10b981]">Zeni Stands Beside You.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-sans-main text-lg sm:text-xl text-white/80 font-normal max-w-2xl leading-relaxed"
          >
            Experience instant emotional resonance through an interactive AI simulator trained on regional adolescent dialects.
          </motion.p>
        </div>

        {/* ── 2-COLUMN LAYOUT: PHONE SIMULATOR (LEFT) + DIALECT TELEMETRY (RIGHT) ── */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interactive Phone Simulator with Auto-Play Timer */}
          <div className="lg:col-span-6">
            <PhoneCarousel
              currentMsgIndex={selectedLangIndex}
              onLanguageChange={(idx) => setSelectedLangIndex(idx)}
            />
          </div>

          {/* Right Column: Dialect Selector & Telemetry Badges */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Dialect Selector Pills */}
            <div>
              <h3 className="font-sans text-xs font-bold tracking-widest text-[#ffebc4] uppercase mb-4">
                SELECT DIALECT ATTUNEMENT
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {dialects.map((item, idx) => {
                  const isSelected = selectedLangIndex === idx;

                  return (
                    <button
                      key={item.code}
                      onClick={() => setSelectedLangIndex(idx)}
                      className={`p-4 rounded-2xl text-left transition-all duration-300 border cursor-pointer ${
                        isSelected
                          ? "bg-[#0e3820] text-white border-[#10b981] shadow-xl ring-2 ring-[#10b981]/50"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans text-xs font-bold text-[#ffebc4]">{item.code}</span>
                        {isSelected && <CheckCircle2 size={14} className="text-[#10b981]" />}
                      </div>
                      <h4 className="font-sans-main text-base text-white font-medium">{item.name}</h4>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Dialect Description */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs font-sans text-white/50 block mb-1">ACTIVE LANGUAGE PROFILE</span>
              <p className="font-sans text-sm text-white/90 leading-relaxed">
                {dialects[selectedLangIndex].desc}
              </p>
            </div>

            {/* Telemetry Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15">
              <div className="space-y-1">
                <span className="text-xl font-bold font-sans-main text-[#ffebc4]">Sub-400ms</span>
                <p className="text-[11px] text-white/60 font-sans">Response Latency</p>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-bold font-sans-main text-[#10b981]">99.4%</span>
                <p className="text-[11px] text-white/60 font-sans">Emotional Score</p>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-bold font-sans-main text-[#ffebc4]">24/7/365</span>
                <p className="text-[11px] text-white/60 font-sans">Active Safety</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
