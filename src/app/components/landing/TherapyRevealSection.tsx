import React from "react";
import { motion } from "motion/react";
import { Sparkles, Shield, Users } from "lucide-react";

interface TherapyRevealSectionProps {
  onBookSession?: () => void;
}

export const TherapyRevealSection: React.FC<TherapyRevealSectionProps> = ({ onBookSession }) => {
  return (
    <section
      id="therapy-reveal"
      className="relative w-full bg-[#f8fdf9] py-20 sm:py-28 md:py-36 overflow-hidden z-20 border-b border-[#0d5d3a]/10"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* Section Headline */}
        <div className="flex flex-col items-start text-left max-w-4xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#78350f] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-4 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
            <span>COMPLETE CARE ECOSYSTEM</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-sans-main text-4xl sm:text-6xl md:text-7xl lg:text-[76px] text-[#0d5d3a] font-extrabold leading-[0.98] tracking-tight mb-4"
            style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}
          >
            Continuous AI Support.<br />
            <span className="text-[#d97706]">On-Demand Human Experts.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-sans text-base sm:text-xl text-[#0a2617]/80 font-semibold max-w-2xl leading-relaxed"
          >
            The seamless continuum between instant 24/7 AI conversations and verified offline & online adolescent psychotherapists.
          </motion.p>
        </div>

        {/* ── 6-GRID BENTO FEATURE BOXES SYSTEM (SHADCN STYLED IN GREEN, WHITE & GOLD) ── */}
        <div className="relative">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-6 gap-6">
            
            {/* Card 1: 100% Customizable */}
            <div className="relative col-span-full md:col-span-2 flex flex-col justify-center overflow-hidden bg-white border-2 border-[#0d5d3a]/15 rounded-3xl p-8 shadow-xl hover:border-[#d97706] transition-all group">
              <div className="relative m-auto size-fit pt-4 text-center">
                <div className="relative flex h-24 w-56 items-center justify-center mx-auto text-[#0d5d3a]">
                  <svg className="absolute inset-0 size-full text-[#0d5d3a]/15 group-hover:text-[#d97706]/30 transition-colors" viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="relative z-10 text-5xl font-extrabold text-[#0d5d3a]">100%</span>
                </div>
                <h3 className="mt-6 text-[#0d5d3a] text-2xl font-extrabold tracking-tight">Customizable Care</h3>
                <p className="text-xs text-[#0a2617]/70 font-semibold mt-2">Tailored therapy plans and AI companion tone customized to your personality.</p>
              </div>
            </div>

            {/* Card 2: Secure by Default */}
            <div className="relative col-span-full md:col-span-2 overflow-hidden bg-white border-2 border-[#0d5d3a]/15 rounded-3xl p-8 shadow-xl hover:border-[#d97706] transition-all">
              <div className="relative mx-auto flex aspect-square size-32 items-center justify-center rounded-full border-2 border-[#0d5d3a]/20 bg-[#f4faf7] before:absolute before:-inset-2 before:rounded-full before:border before:border-[#d97706]/30">
                <Shield className="w-12 h-12 text-[#0d5d3a]" />
              </div>
              <div className="relative z-10 mt-6 text-center space-y-2">
                <h3 className="text-[#0d5d3a] text-xl font-extrabold tracking-tight">Secure by Default</h3>
                <p className="text-xs text-[#0a2617]/70 font-semibold leading-relaxed">
                  End-to-end encrypted conversations, confidential therapist clinical records, and total privacy assurance.
                </p>
              </div>
            </div>

            {/* Card 3: Faster Than Light Latency */}
            <div className="relative col-span-full md:col-span-2 overflow-hidden bg-white border-2 border-[#0d5d3a]/15 rounded-3xl p-8 shadow-xl hover:border-[#d97706] transition-all">
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#d97706] mb-2 px-1">
                  <span>⚡ Instant Latency</span>
                  <span>Sub-400ms</span>
                </div>
                <div className="w-full h-24 bg-[#f4faf7] rounded-2xl border border-[#0d5d3a]/15 p-4 flex items-center justify-center">
                  <svg className="w-full h-full text-[#0d5d3a]" viewBox="0 0 386 123" fill="none">
                    <path
                      d="M3 121C35 87 66 80 91 80C116 80 108 64 125 92C142 78 165 83 193 92C213 64 243 92 265 60C285 87 304 73 333 64C345 62 362 80 383 106"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="relative z-10 mt-6 text-center space-y-2">
                <h3 className="text-[#0d5d3a] text-xl font-extrabold tracking-tight">Real-Time AI Companion</h3>
                <p className="text-xs text-[#0a2617]/70 font-semibold leading-relaxed">
                  Instant sub-second response times in English, Hindi, Hinglish, or Kannada when you need to vent at 2 AM.
                </p>
              </div>
            </div>

            {/* Card 4: Safe Clinical Monitoring Chart */}
            <div className="relative col-span-full md:col-span-3 bg-white border-2 border-[#0d5d3a]/15 rounded-3xl p-8 shadow-xl hover:border-[#d97706] transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] border border-[#fde68a] text-[#78350f] flex items-center justify-center font-bold">
                  <Shield className="w-6 h-6 text-[#d97706]" />
                </div>
                <span className="text-[10px] font-extrabold bg-[#e6f4ea] text-[#0d5d3a] px-3 py-1 rounded-full uppercase tracking-wider">
                  24/7 Risk Safeguard Pipeline
                </span>
              </div>
              <div className="mt-8 space-y-2">
                <h3 className="text-[#0d5d3a] text-2xl font-extrabold tracking-tight">Active Crisis Safety Net</h3>
                <p className="text-xs text-[#0a2617]/70 font-semibold leading-relaxed">
                  Isolated background safety guardians continuously monitor distress signals to ensure emergency clinical routing when required.
                </p>
              </div>
            </div>

            {/* Card 5: Verified Human Experts & Peer Sanctuary */}
            <div className="relative col-span-full md:col-span-3 bg-white border-2 border-[#0d5d3a]/15 rounded-3xl p-8 shadow-xl hover:border-[#d97706] transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#e6f4ea] text-[#0d5d3a] flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0d5d3a] bg-[#f4faf7] border border-[#0d5d3a]/20 px-3 py-1 rounded-full">
                    120+ Practitioners
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-[#0d5d3a] text-2xl font-extrabold tracking-tight">Keep Your Mind Safe & Healed</h3>
                <p className="text-xs text-[#0a2617]/70 font-semibold leading-relaxed">
                  Connect with licensed adolescent psychotherapists for 1-on-1 confidential video sessions or join moderated anonymous peer circles.
                </p>

                {onBookSession && (
                  <button
                    type="button"
                    onClick={onBookSession}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0d5d3a] hover:bg-[#084229] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    Book Session with Expert →
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
