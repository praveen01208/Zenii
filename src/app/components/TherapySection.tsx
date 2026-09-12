import { useRef, type MouseEvent } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Calendar, Video, Clock, Award, ArrowRight } from 'lucide-react';

const benefits = [
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Book sessions that fit your schedule',
  },
  {
    icon: Video,
    title: 'Video or Chat',
    description: 'Choose your preferred communication method',
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get matched with a therapist in 24 hours',
  },
  {
    icon: Award,
    title: 'Licensed Professionals',
    description: 'All therapists are certified and experienced',
  },
];

export default function TherapySection({ onBookSession }: { onBookSession?: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const cursorRef  = useRef<HTMLDivElement>(null);

  // Raw scroll progress — no spring wrapper (spring was burning CPU on every scroll tick)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start center'],
  });
  const cardWidth = useTransform(scrollYProgress, [0, 1], ['72vw', '97vw']);
  const topRadius = useTransform(scrollYProgress, [0, 1], [26, 42]);

  // Direct DOM cursor — avoids framer-motion spring physics on every mousemove
  const handleCardMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!cursorRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - 24;
    const y = event.clientY - rect.top  - 24;
    cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
    cursorRef.current.style.opacity   = '1';
  };

  const handleMouseLeave = () => {
    if (cursorRef.current) cursorRef.current.style.opacity = '0';
  };

  return (
    <section
      id="therapy"
      ref={sectionRef}
      className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-[#050505] transition-colors duration-300 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#f2f8f3] dark:bg-[#10b981] rounded-full blur-3xl opacity-60 dark:opacity-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#edf7ef] dark:bg-[#059669] rounded-full blur-3xl opacity-70 dark:opacity-10" />

      <div className="relative z-10 flex justify-center px-4 sm:px-6">
        <motion.div
          style={{
            width: cardWidth,
            borderTopLeftRadius:     topRadius,
            borderTopRightRadius:    topRadius,
            borderBottomLeftRadius:  topRadius,
            borderBottomRightRadius: topRadius,
          }}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative min-h-[90vh] sm:min-h-[98vh] lg:min-h-[108vh] overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl dark:shadow-[#10b981]/10 cursor-none"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/asset/therapy.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            style={{ transform: 'translateZ(0)', willChange: 'transform' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55" />

          {/* Direct-DOM cursor — no framer-motion spring on mousemove */}
          <div
            ref={cursorRef}
            className="pointer-events-none absolute left-0 top-0 z-20 hidden h-12 w-12 rounded-full border border-white/70 bg-white/20 backdrop-blur-sm md:block"
            style={{ opacity: 0, willChange: 'transform', transition: 'opacity 0.15s ease' }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex min-h-[90vh] sm:min-h-[98vh] lg:min-h-[108vh] flex-col justify-between p-6 sm:p-10 lg:p-14">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.35 }}
              className="max-w-3xl"
            >
              <span className="text-[#d8efda] uppercase tracking-wider text-xs sm:text-sm font-medium">
                Professional Therapy
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-4 mb-4 sm:mb-6"
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}
              >
                Connect with{' '}
                <span className="bg-gradient-to-r from-[#c8e6c9] to-white bg-clip-text text-transparent">
                  Expert Therapists
                </span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-[#d8efda] max-w-2xl">
                Licensed professionals specialized in adolescent mental health, ready to guide you with care and confidentiality.
              </p>
              <button
                type="button"
                onClick={onBookSession}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#10b981] px-6 py-3 font-medium text-[#0d5d3a] dark:text-[#050505] transition hover:bg-[#e8f5e9] dark:hover:bg-[#34d399]"
              >
                Book a Session
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: index * 0.08 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="bg-white/14 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/25"
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#d8efda] mb-3" />
                    <h4 className="text-sm sm:text-base mb-1.5" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                      {benefit.title}
                    </h4>
                    <p className="text-white/80 text-xs sm:text-sm">{benefit.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
