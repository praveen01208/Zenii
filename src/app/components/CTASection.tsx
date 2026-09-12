import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { Sparkles } from 'lucide-react';
// Video asset removed; using placeholder

type CTASectionProps = {
  onGetStarted: () => void;
  onScheduleDemo?: () => void;
};

export default function CTASection({ onGetStarted, onScheduleDemo }: CTASectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const circlesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    circlesRef.current.forEach((circle, index) => {
      if (circle) {
        gsap.to(circle, {
          y: Math.random() * 40 - 20,
          x: Math.random() * 40 - 20,
          duration: 3 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }
    });
  }, []);

  return (
    <section id="cta" ref={containerRef} className="py-8 sm:py-10 lg:py-12 bg-white dark:bg-[#050505] transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden border border-[#0d5d3a]/15 dark:border-white/10 rounded-2xl sm:rounded-3xl lg:rounded-[2.4rem] shadow-xl dark:shadow-none"
        >
          <div
            ref={(el) => (circlesRef.current[0] = el)}
            className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <div
            ref={(el) => (circlesRef.current[1] = el)}
            className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"
          />
          <div
            ref={(el) => (circlesRef.current[2] = el)}
            className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#27a86a]/20 rounded-full blur-3xl"
          />

          <div className="relative z-10 grid lg:grid-cols-2 min-h-[28rem] lg:min-h-[34rem]">
            <div className="relative min-h-[16rem] lg:min-h-full">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src="/asset/ok/ok.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0b2f1d]/35" />
            </div>

            <div className="flex flex-col justify-center items-center text-center p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] dark:from-[#111111] dark:to-[#1a1a1a]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-xs sm:text-sm text-white/90">Start Your Free Journey Today</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 sm:mb-6 max-w-xl"
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}
              >
                Ready to Transform Your Mental Health?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="text-base sm:text-lg text-white/90 mb-8 max-w-xl"
              >
                Join thousands of adolescents who have found support, healing, and growth through ZenMind. Your journey to wellness starts with a single step.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <button
                  onClick={onGetStarted}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '17px',
                    padding: '0.8em 1.3em 0.8em 0.9em',
                    color: 'white',
                    background: 'linear-gradient(to right, #0a2617, #0d5d3a, #1a8a5a)',
                    border: 'none',
                    letterSpacing: '0.05em',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    const svg = btn.querySelector('svg') as SVGElement | null;
                    const span = btn.querySelector('span') as HTMLSpanElement | null;
                    if (svg) (svg as HTMLElement).style.transform = 'translateX(5px) rotate(90deg)';
                    if (span) span.style.transform = 'translateX(7px)';
                  }}
                  onMouseLeave={e => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    const svg = btn.querySelector('svg') as SVGElement | null;
                    const span = btn.querySelector('span') as HTMLSpanElement | null;
                    if (svg) (svg as HTMLElement).style.transform = 'rotate(30deg)';
                    if (span) span.style.transform = 'translateX(0)';
                  }}
                >
                  <svg height={24} width={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px', transform: 'rotate(30deg)', transition: 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)' }}>
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 13c0-5.088 2.903-9.436 7-11.182C16.097 3.564 19 7.912 19 13c0 .823-.076 1.626-.22 2.403l1.94 1.832a.5.5 0 0 1 .095.603l-2.495 4.575a.5.5 0 0 1-.793.114l-2.234-2.234a1 1 0 0 0-.707-.293H9.414a1 1 0 0 0-.707.293l-2.234 2.234a.5.5 0 0 1-.793-.114l-2.495-4.575a.5.5 0 0 1 .095-.603l1.94-1.832C5.077 14.626 5 13.823 5 13zm1.476 6.696l.817-.817A3 3 0 0 1 9.414 18h5.172a3 3 0 0 1 2.121.879l.817.817.982-1.8-1.1-1.04a2 2 0 0 1-.593-1.82c.124-.664.187-1.345.187-2.036 0-3.87-1.995-7.3-5-8.96C8.995 5.7 7 9.13 7 13c0 .691.063 1.372.187 2.037a2 2 0 0 1-.593 1.82l-1.1 1.039.982 1.8zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor" />
                  </svg>
                  <span style={{ transition: 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)' }}>Get Started Free</span>
                </button>

                <button
                  onClick={onScheduleDemo}
                  className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-[#0d5d3a] rounded-full border-2 border-[#0d5d3a] font-semibold text-base sm:text-lg hover:bg-[#f0fbf4] transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Schedule a Demo
                </button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="text-white/70 text-xs sm:text-sm mt-6"
              >
                No credit card required • 100% confidential • Available 24/7
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
