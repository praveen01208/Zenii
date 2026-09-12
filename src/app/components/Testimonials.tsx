import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Aanya S.',
    age: 17,
    location: 'Mumbai',
    avatar: 'A',
    color: '#7c3aed',
    rating: 5,
    text: "ZenMind helped me understand my anxiety for the first time. The AI doesn't judge — it just listens. I finally opened up about things I've never told anyone.",
    tag: 'Anxiety & Stress',
  },
  {
    id: 2,
    name: 'Rohan M.',
    age: 16,
    location: 'Delhi',
    avatar: 'R',
    color: '#0d5d3a',
    rating: 5,
    text: "I was skeptical about therapy. But the therapist match quiz found someone who actually gets me. Three months in and I'm sleeping better, thinking clearer.",
    tag: 'Depression',
  },
  {
    id: 3,
    name: 'Priya K.',
    age: 19,
    location: 'Bangalore',
    avatar: 'P',
    color: '#0369a1',
    rating: 5,
    text: "The mood journal with AI insights is incredible. It noticed patterns in my entries I never saw myself. It felt like having a therapist available 24/7.",
    tag: 'Mood Tracking',
  },
  {
    id: 4,
    name: 'Zara T.',
    age: 15,
    location: 'Hyderabad',
    avatar: 'Z',
    color: '#b45309',
    rating: 5,
    text: "Peer Support Circles changed everything. Knowing real people my age are going through similar things — I don't feel so alone anymore. 100% anonymous too.",
    tag: 'Peer Support',
  },
  {
    id: 5,
    name: 'Arjun P.',
    age: 18,
    location: 'Chennai',
    avatar: 'A',
    color: '#be185d',
    rating: 5,
    text: "Set goals, track habits, get nudged when I miss a day. The wellness programs are structured without feeling overwhelming. My focus improved massively.",
    tag: 'Wellness Goals',
  },
  {
    id: 6,
    name: 'Meera N.',
    age: 16,
    location: 'Pune',
    avatar: 'M',
    color: '#065f46',
    rating: 5,
    text: "My parents didn't understand what I was going through. ZenMind gave me the words and the confidence to talk to them. That conversation changed our relationship.",
    tag: 'Family & Communication',
  },
];

export default function Testimonials({ onGetStarted }: { onGetStarted?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [current, setCurrent] = useState(0);
  const visible = 3;

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(testimonials.length - visible, c + 1));

  return (
    <section
      ref={ref}
      className="py-20 sm:py-28 bg-gradient-to-b from-white to-[#f4fbf6] dark:from-[#050505] dark:to-[#071d13] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d5d3a]/08 dark:bg-[#10b981]/10 border border-[#0d5d3a]/15 dark:border-[#10b981]/20 mb-5">
            <Star className="w-3.5 h-3.5 text-[#0d5d3a] dark:text-[#10b981] fill-[#0d5d3a] dark:fill-[#10b981]" />
            <span className="text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-widest">Real Stories</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            They started where you are
          </h2>
          <p className="text-base sm:text-lg text-[#4a7c5d] dark:text-gray-400 max-w-2xl mx-auto">
            Real stories from real adolescents who took the first step. Names changed for privacy.
          </p>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mb-10">
          {testimonials.slice(current, current + visible).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              className="relative bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <Quote className="w-8 h-8 text-[#0d5d3a]/15 dark:text-white/10 mb-4 flex-shrink-0" />
              <p className="text-sm text-[#0a2617] dark:text-gray-200 leading-relaxed mb-5 flex-1">
                "{t.text}"
              </p>
              <div className="mt-auto">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0a2617] dark:text-white">{t.name}, {t.age}</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400">{t.location}</div>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: `${t.color}18`, color: t.color }}>
                    {t.tag}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile scroll cards */}
        <div className="lg:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-none mb-8 -mx-4 px-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex-shrink-0 w-72 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08 p-5 shadow-sm flex flex-col"
            >
              <Quote className="w-6 h-6 text-[#0d5d3a]/20 dark:text-white/10 mb-3" />
              <p className="text-xs text-[#0a2617] dark:text-gray-200 leading-relaxed mb-4 flex-1">"{t.text}"</p>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0a2617] dark:text-white">{t.name}, {t.age}</div>
                  <div className="text-[10px] text-[#4a7c5d] dark:text-gray-400">{t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop carousel controls */}
        <div className="hidden lg:flex items-center justify-center gap-4">
          <button onClick={prev} disabled={current === 0}
            className="w-10 h-10 rounded-full border border-[#0d5d3a]/20 flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#f0fbf4] dark:hover:bg-[#0d5d3a]/20 transition disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: testimonials.length - visible + 1 }).map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-[#0d5d3a] dark:bg-[#10b981]' : 'w-1.5 bg-[#0d5d3a]/20 dark:bg-white/20'}`} />
            ))}
          </div>
          <button onClick={next} disabled={current >= testimonials.length - visible}
            className="w-10 h-10 rounded-full border border-[#0d5d3a]/20 flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#f0fbf4] dark:hover:bg-[#0d5d3a]/20 transition disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          {[
            { value: '12,000+', label: 'Active users' },
            { value: '4.9 / 5', label: 'Average rating' },
            { value: '94%', label: 'Feel better in 30 days' },
            { value: '< 5 min', label: 'Average AI response' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#0d5d3a] dark:text-[#10b981]" style={{ fontFamily: 'Syne, sans-serif' }}>
                {stat.value}
              </div>
              <div className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
