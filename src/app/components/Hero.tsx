import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';
import { apiFetch } from '../api/client';
import heroVideo from '../../../asset/video.mp4';

type HeroProps = {
  onGetStarted: () => void;
  onLearnMore?: () => void;
};

export default function Hero({ onGetStarted, onLearnMore }: HeroProps) {
  const floatingRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    apiFetch<any>('/public/settings').then(res => setStatsData(res)).catch(console.error);
  }, []);

  useEffect(() => {
    if (floatingRef.current) {
      gsap.to(floatingRef.current, {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }

    circleRefs.current.forEach((circle, index) => {
      if (circle) {
        gsap.to(circle, {
          y: Math.random() * 30 - 15,
          x: Math.random() * 30 - 15,
          duration: 3 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: index * 0.2,
        });
      }
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] },
    },
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden bg-white dark:bg-[#050505] pt-14 sm:pt-16 transition-colors duration-300">
      <div className="absolute inset-y-0 right-0 hidden lg:block w-1/2 z-0 overflow-hidden">
        <video
          className="absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] object-cover pointer-events-none opacity-100 dark:opacity-70 grayscale-[40%]"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/60 via-transparent to-transparent dark:from-[#050505]/60 dark:via-transparent dark:to-transparent"
          aria-hidden="true"
        />
      </div>

      <div
        ref={(el) => (circleRefs.current[0] = el)}
        className="absolute top-20 left-10 w-64 h-64 bg-[#0d5d3a]/5 dark:bg-[#10b981]/10 rounded-full blur-3xl z-[1] lg:hidden"
        style={{ willChange: 'transform', contain: 'layout' }}
      />
      <div
        ref={(el) => (circleRefs.current[1] = el)}
        className="absolute bottom-20 right-10 w-96 h-96 bg-[#1a8a5a]/5 dark:bg-[#10b981]/10 rounded-full blur-3xl z-[1] lg:hidden"
        style={{ willChange: 'transform', contain: 'layout' }}
      />
      <div
        ref={(el) => (circleRefs.current[2] = el)}
        className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#c8e6c9]/10 dark:bg-[#0d5d3a]/20 rounded-full blur-3xl z-[1] lg:hidden"
        style={{ willChange: 'transform', contain: 'layout' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center"
        >
          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-white/5 rounded-full shadow-sm border border-[#0d5d3a]/10 dark:border-white/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#0d5d3a] dark:text-[#10b981]" />
              <span className="text-sm text-[#4a7c5d] dark:text-gray-300">Your Mental Wellness Journey Starts Here</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl text-[#0a2617] dark:text-white leading-tight max-w-none lg:max-w-[22ch]"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}
            >
              Empowering{' '}
              <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] dark:from-[#10b981] dark:to-[#34d399] bg-clip-text text-transparent">
                Adolescents
              </span>{' '}
              Through Mental Health
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] dark:text-gray-400 leading-relaxed max-w-xl"
            >
              A safe, supportive platform where young minds can share, heal, and grow. Connect with AI-powered support and professional therapists anytime, anywhere.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
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
                <span style={{ transition: 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)' }}>Start Your Journey</span>
              </button>

              <button
                onClick={onLearnMore}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#0d5d3a] rounded-full border-2 border-[#0d5d3a] font-semibold text-sm sm:text-base hover:bg-[#f0fbf4] transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Learn More
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 sm:gap-6 pt-2 sm:pt-4 min-h-[80px]">
              {(() => {
                const activeUsers = statsData?.activeUsers || '50K+';
                const satisfactionRate = statsData?.satisfactionRate || '98%';
                const supportAvailable = statsData?.supportAvailable || '24/7';
                return (
                  <>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl text-[#0d5d3a] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                        {activeUsers}
                      </div>
                      <div className="text-xs sm:text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">Active Users</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl text-[#0d5d3a] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                        {satisfactionRate}
                      </div>
                      <div className="text-xs sm:text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">Satisfaction Rate</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl text-[#0d5d3a] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                        {supportAvailable}
                      </div>
                      <div className="text-xs sm:text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">Support Available</div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>

          <motion.div
            ref={floatingRef}
            variants={itemVariants}
            className="relative"
          >
            <div className="hidden lg:block w-full h-full" aria-hidden="true" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
