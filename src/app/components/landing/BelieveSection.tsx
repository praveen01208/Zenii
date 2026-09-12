import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface FeatureItem {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
}

const featuresList: FeatureItem[] = [
  {
    id: "01",
    number: "01",
    title: "Emotion-Aware Conversations",
    description: "Zeni detects sentiment patterns in your messages",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "02",
    number: "02",
    title: "Independent Crisis Detection",
    description: "Independent safety pipeline to watch for signs of distress",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "03",
    number: "03",
    title: "Personal Conversation Memory",
    description: "Remembers past context and topics that matter to you",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "04",
    number: "04",
    title: "Private & Judgment-Free",
    description: "Anonymized logs and state-of-the-art data protection",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "05",
    number: "05",
    title: "English, Hindi, Hinglish & Kannada",
    description: "Communicate naturally in your preferred language",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "06",
    number: "06",
    title: "Personalized Check-ins",
    description: "Smart prompts tailored to your current energy and mood",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "07",
    number: "07",
    title: "Mood & Emotional Insights",
    description: "Visualize patterns and triggers over weeks and months",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "08",
    number: "08",
    title: "Guided Calm & Grounding",
    description: "Interactive tools to help when your mind gets loud",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "09",
    number: "09",
    title: "Professional Support Network",
    description: "Direct connection with verified offline and online experts",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "10",
    number: "10",
    title: "Available Whenever You Need It",
    description: "Instant response times, day or night",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
  },
];

function HoverCardImage({ imageSrc, alt }: { imageSrc: string; alt: string }) {
  return (
    <img
      src={imageSrc}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
    />
  );
}

export const BelieveSection: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      id="pillars"
      className="relative w-full pt-24 sm:pt-32 md:pt-36 pb-16 sm:pb-24 md:pb-28 bg-[#f8fdf9] text-[#0a2617]"
    >
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 relative">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 sm:mb-14"
        >
          <h2 className="font-sans-main text-5xl sm:text-7xl md:text-8xl lg:text-[85px] text-[#0a2617] font-normal leading-[0.98] tracking-tight">
            More Than a Conversation
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-[#0a2617]/75 font-normal max-w-xl">
            One companion. Built to understand the context behind the conversation.
          </p>
        </motion.div>

        {/* Table Column Headers */}
        <div className="w-full grid grid-cols-12 gap-4 pb-3 border-b border-[#0a2617]/15 text-[11px] sm:text-xs font-sans tracking-widest text-[#0a2617]/50 uppercase font-medium">
          <div className="col-span-3 sm:col-span-2">Feature</div>
          <div className="col-span-9 sm:col-span-10">Capabilities</div>
        </div>

        {/* List of 100% Full-Width Rows */}
        <div className="w-full flex flex-col relative pt-1">
          {featuresList.map((item, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative group cursor-pointer border-b border-[#0a2617]/15 py-3.5 sm:py-4.5 transition-colors duration-200 w-full overflow-visible"
              >
                {/* Highlight background */}
                {isHovered && (
                  <motion.div
                    layoutId="activeRowBackground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 30,
                    }}
                    className="absolute inset-0 bg-[#0a2617]/[0.04] rounded-lg -mx-2 px-2 pointer-events-none"
                  />
                )}

                <div className="grid grid-cols-12 gap-4 items-center relative z-10 w-full">
                  {/* Number Roll Text */}
                  <div className="col-span-3 sm:col-span-2">
                    <div className="relative overflow-hidden h-[28px] sm:h-[32px] inline-flex flex-col">
                      <span className="block font-sans-main text-xl sm:text-2xl md:text-3xl text-[#0a2617]/70 font-normal leading-[28px] sm:leading-[32px] transition-transform duration-250 ease-out group-hover:-translate-y-full">
                        {item.number}
                      </span>
                      <span className="absolute top-full left-0 block font-sans-main text-xl sm:text-2xl md:text-3xl text-[#0a2617] font-medium leading-[28px] sm:leading-[32px] transition-transform duration-250 ease-out group-hover:-translate-y-full">
                        {item.number}
                      </span>
                    </div>
                  </div>

                  {/* Title Roll Text */}
                  <div className="col-span-9 sm:col-span-10">
                    <div className="relative overflow-hidden h-[32px] sm:h-[38px] md:h-[42px] inline-flex flex-col">
                      <span className="block font-sans-main text-xl sm:text-2xl md:text-3xl lg:text-[36px] text-[#0a2617] font-normal leading-[32px] sm:leading-[38px] md:leading-[42px] tracking-tight transition-transform duration-250 ease-out group-hover:-translate-y-full">
                        {item.title}
                      </span>
                      <span className="absolute top-full left-0 block font-sans-main text-xl sm:text-2xl md:text-3xl lg:text-[36px] text-[#0a2617] font-medium leading-[32px] sm:leading-[38px] md:leading-[42px] tracking-tight transition-transform duration-250 ease-out group-hover:-translate-y-full">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Card Preview */}
                <div
                  className="absolute right-5 top-1/2 z-40 pointer-events-none hidden sm:block"
                  style={{ transform: 'translateY(-50%)', width: '30vh', height: '380%' }}
                >
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.88, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 3 }}
                        exit={{ opacity: 0, scale: 0.9, rotate: -2 }}
                        transition={{
                          duration: 0.25,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{
                          backdropFilter: 'blur(15px)',
                          WebkitBackdropFilter: 'blur(15px)',
                          boxShadow: `
                            inset 0 0 20px rgba(255, 255, 255, 0.18),
                            inset 0 0 5px rgba(255, 255, 255, 0.28),
                            0 12px 30px rgba(0, 0, 0, 0.45)
                          `,
                          border: '1px solid rgba(255, 255, 255, 0.16)',
                        }}
                        className="w-full h-full rounded-[20px] overflow-hidden shadow-2xl bg-[#0a2617] relative"
                      >
                        <HoverCardImage imageSrc={item.image} alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-3.5 left-4 right-4 text-white/95 font-sans text-[11px] sm:text-xs tracking-wider uppercase font-medium">
                          {item.number} — {item.title}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
