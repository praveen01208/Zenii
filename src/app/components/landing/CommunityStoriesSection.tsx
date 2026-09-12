import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { CoverflowCarousel, CoverflowSlide } from '../CoverflowCarousel';
import { DotPattern } from '../ui/dot-pattern';

const STORY_SLIDES: CoverflowSlide[] = [
  {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    alt: 'Aarav',
    title: 'Aarav, 19 • CS Student',
    subtitle: '"Talking to Zeni at 2 AM when my exam anxiety hit peak was life-changing. It didn\'t judge me, just helped me ground my thoughts step by step."',
    meta: [{ label: 'Focus Area', value: 'Anxiety Relief' }, { label: 'Rating', value: '5.0 ★' }]
  },
  {
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    alt: 'Ananya',
    title: 'Ananya, 21 • Medical Intern',
    subtitle: '"Having Hinglish support made me feel like I was talking to a genuine friend who truly understands how I speak."',
    meta: [{ label: 'Language', value: 'Hinglish' }, { label: 'Rating', value: '5.0 ★' }]
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    alt: 'Rohan',
    title: 'Rohan, 20 • Design Major',
    subtitle: '"The peer circles showed me I wasn\'t the only one dealing with social burnout. ZenMind gave me my confidence back."',
    meta: [{ label: 'Community', value: 'Peer Circles' }, { label: 'Rating', value: '5.0 ★' }]
  },
  {
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    alt: 'Priya',
    title: 'Priya, 18 • High School Senior',
    subtitle: '"The mood journal helped me realize my stress peaks every Tuesday before labs. Spotting that trigger changed everything."',
    meta: [{ label: 'Feature', value: 'Mood Journal' }, { label: 'Rating', value: '5.0 ★' }]
  }
];

const FALLBACK_STORIES = [
  {
    id: '1',
    author: 'Aarav, 19',
    role: 'Computer Science Student',
    story: 'Talking to Zeni at 2 AM when my exam anxiety hit peak was life-changing. It didn\'t judge me, just helped me ground my thoughts step by step without any pressure.',
    rating: 5,
    tag: 'ANXIETY RELIEF',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    author: 'Ananya, 21',
    role: 'Medical Intern',
    story: 'Having Hinglish support made me feel like I was talking to a genuine friend who truly understands how I speak. The therapy session booking was seamless too.',
    rating: 5,
    tag: 'HINGLISH ATTUNEMENT',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    author: 'Rohan, 20',
    role: 'Design Major',
    story: 'The peer circles showed me I wasn\'t the only one dealing with social burnout. ZenMind gave me my confidence back when everything felt overwhelming.',
    rating: 5,
    tag: 'PEER COMMUNITY',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '4',
    author: 'Priya, 18',
    role: 'High School Senior',
    story: 'The mood journal helped me realize my stress peaks every Tuesday before labs. Spotting that trigger changed how I prepare for my week.',
    rating: 5,
    tag: 'MOOD ANALYTICS',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80'
  }
];

export const CommunityStoriesSection: React.FC = () => {
  const [stories, setStories] = useState<any[]>(FALLBACK_STORIES);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    apiFetch<any>('/stories')
      .then(res => {
        if (res.stories && res.stories.length > 0) setStories(res.stories);
      })
      .catch(() => {});
  }, []);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const current = stories[activeIdx] || FALLBACK_STORIES[0];

  return (
    <section className="py-24 sm:py-36 bg-[#071d13] text-[#fffdf5] border-b border-white/10 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#10b981]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#ffebc4] text-sm">✱</span>
              <p className="font-sans text-xs sm:text-sm tracking-[0.2em] uppercase font-bold text-[#ffebc4]">
                COMMUNITY VOICES & STORIES
              </p>
            </div>
            <h2 className="font-sans-main text-4xl sm:text-6xl md:text-7xl text-white font-normal leading-[1.02] tracking-tight">
              Stories of Hope
            </h2>
          </div>
        </div>

        {/* 3D Coverflow Student Stories Carousel */}
        <div className="my-10">
          <CoverflowCarousel
            slides={STORY_SLIDES}
            rotate={38}
            depth={0.5}
            perspective={2.8}
            falloff={0.55}
            fade={0.12}
            cardWidth="clamp(220px, 28vw, 340px)"
            showCaption={true}
            showPagination={true}
            showNavigation={true}
            label="3D Community Stories Carousel"
          />
        </div>

        {/* Cinematic Editorial Feature Quote Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id || activeIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 sm:p-14 lg:p-16 rounded-[2.5rem] bg-[#0a2617] border-2 border-[#ffebc4]/25 shadow-2xl relative overflow-hidden grid lg:grid-cols-12 gap-10 items-center"
          >
            {/* Background Dot Pattern — High contrast gold dots */}
            <DotPattern
              width={24}
              height={24}
              cx={2}
              cy={2}
              cr={1.5}
              className="fill-[#ffebc4]/35 [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
            />

            {/* Left Narrative Quote */}
            <div className="lg:col-span-8 space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <Quote className="w-8 h-8 text-[#ffebc4]" />
                <span className="px-3.5 py-1 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 text-xs font-bold font-sans uppercase tracking-wider">
                  {current.tag || 'VERIFIED EXPERIENCE'}
                </span>
              </div>

              <blockquote className="font-serif-display text-2xl sm:text-4xl md:text-5xl text-white font-normal leading-[1.15] italic tracking-wide">
                "{current.story}"
              </blockquote>

              <div className="pt-6 border-t border-white/15 flex items-center justify-between">
                <div>
                  <h4 className="font-sans-main text-xl sm:text-2xl text-white font-normal mb-0.5">
                    {current.author}
                  </h4>
                  <p className="font-sans text-xs text-[#ffebc4] tracking-wider uppercase font-semibold">
                    {current.role || 'ZenMind Sanctuary Member'}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-white/10 px-4 py-2 rounded-full border border-white/15">
                  <Star className="w-4 h-4 fill-[#ffebc4] text-[#ffebc4]" />
                  <span className="text-xs font-sans font-bold text-white">5.0 Attunement Rating</span>
                </div>
              </div>
            </div>

            {/* Right Author Photo Frame */}
            <div className="lg:col-span-4 relative z-10 aspect-square rounded-[2rem] overflow-hidden border-2 border-white/20 shadow-2xl">
              <img
                src={current.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                alt={current.author}
                className="w-full h-full object-cover filter brightness-90 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2617] via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-center text-xs font-sans text-white/80 font-medium">
                Verified Student Story • {activeIdx + 1} of {stories.length}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>

      {/* All Stories Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md p-6 flex items-center justify-center overflow-y-auto"
          >
            <div className="w-full max-w-4xl max-h-[85vh] bg-[#0a2617] border border-white/20 rounded-[2.5rem] p-8 overflow-y-auto relative">
              <div className="flex items-center justify-between pb-6 border-b border-white/15 mb-8">
                <h3 className="font-sans-main text-2xl text-white font-normal">All Community Stories of Hope</h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stories.map((s, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-[#071d13] border border-white/15">
                    <Quote className="w-6 h-6 text-[#ffebc4] opacity-40 mb-3" />
                    <p className="text-sm text-white/90 leading-relaxed mb-4">"{s.story}"</p>
                    <div className="flex items-center justify-between text-xs text-[#ffebc4] font-bold pt-3 border-t border-white/10">
                      <span>{s.author}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className="fill-[#ffebc4] text-[#ffebc4]" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};
