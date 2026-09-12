import React, { useState } from "react";
import { motion } from "motion/react";

interface Professional {
  id: string;
  name: string;
  role: string;
  experience: string;
  image: string;
  quote: string;
  tag: string;
}

const professionals: Professional[] = [
  {
    id: "1",
    name: "Dr. F Y Counselling",
    role: "Clinical Psychologist",
    experience: "13+ Yrs Experience",
    image: "/therapists/t1.jpg",
    quote: "Specializing in Cognitive Behavioral Therapy, anxiety management, depression support, and relationship counselling.",
    tag: "COGNITIVE BEHAVIORAL THERAPY",
  },
  {
    id: "2",
    name: "Dr. M. S. Mamatha",
    role: "Psychotherapist",
    experience: "10+ Yrs Experience",
    image: "/therapists/t2.jpg",
    quote: "Providing compassionate individual and family counseling for emotional health and youth resilience.",
    tag: "INDIVIDUAL & FAMILY COUNSELLING",
  },
  {
    id: "3",
    name: "Dr. Arka Healthcare",
    role: "Consultant Psychiatrist",
    experience: "14+ Yrs Experience",
    image: "/therapists/t3.jpg",
    quote: "Expert medical and psychiatric care for depression, anxiety, OCD, and bipolar disorders.",
    tag: "PSYCHIATRY & OCD CARE",
  },
  {
    id: "4",
    name: "Roots Healing Centre",
    role: "Youth & Couple Psychotherapist",
    experience: "9+ Yrs Experience",
    image: "/therapists/t4.jpg",
    quote: "Empowering adolescents and families to cultivate harmony, mental wellness, and life balance.",
    tag: "FAMILY THERAPY & MINDFULNESS",
  },
  {
    id: "5",
    name: "Mana Mental Health Clinic",
    role: "Clinical Psychologist Group",
    experience: "11+ Yrs Experience",
    image: "/therapists/t5.jpg",
    quote: "Tailored behavioral therapies helping teens navigate stress, anxiety, and depression.",
    tag: "CBT & STRESS MANAGEMENT",
  },
  {
    id: "6",
    name: "Dr. Abhijit",
    role: "Consultant Neuropsychiatrist",
    experience: "15+ Yrs Experience",
    image: "/therapists/t1.jpg",
    quote: "Specialized clinical neuropsychiatry, anxiety relief, depression support, and counseling.",
    tag: "NEUROPSYCHIATRY & COUNSELING",
  },
  {
    id: "7",
    name: "Dr. T. S. Sathyanarayana Rao",
    role: "Psychiatrist & Sexologist",
    experience: "20+ Yrs Experience",
    image: "/therapists/t2.jpg",
    quote: "Renowned psychiatry expert addressing deep anxiety, depression, and adolescent behavioral resilience.",
    tag: "PSYCHIATRY & BEHAVIORAL RESILIENCE",
  },
  {
    id: "8",
    name: "Mibo The Mind Expert",
    role: "Adolescent Psychologist",
    experience: "8+ Yrs Experience",
    image: "/therapists/t3.jpg",
    quote: "Guiding teens through individual therapy, anxiety management, and stress regulation.",
    tag: "YOUTH THERAPY & STRESS REGULATION",
  },
  {
    id: "9",
    name: "Heart It Out Centre",
    role: "Psychologists & Therapists Group",
    experience: "10+ Yrs Experience",
    image: "/therapists/t4.jpg",
    quote: "Accessible, compassionate therapy and counseling for individuals, couples, and adolescents.",
    tag: "COMPASSIONATE YOUTH THERAPY",
  },
  {
    id: "10",
    name: "Dr. Krithishree S. S.",
    role: "Consultant Psychiatrist",
    experience: "12+ Yrs Experience",
    image: "/therapists/t5.jpg",
    quote: "Dedicated psychiatric care and psychotherapy for youth depression, sleeping disorders, and anxiety.",
    tag: "PSYCHOTHERAPY & SLEEP CARE",
  },
];

const marqueeList = [...professionals, ...professionals, ...professionals];

interface ProfessionalsSectionProps {
  onBookSession?: () => void;
}

export const ProfessionalsSection: React.FC<ProfessionalsSectionProps> = ({ onBookSession }) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section
      id="professionals"
      className="relative w-full pt-8 sm:pt-12 md:pt-16 pb-20 sm:pb-28 md:pb-32 -mt-8 sm:-mt-12 bg-[#0a2617] text-[#fffdf5] overflow-hidden z-10"
    >
      {/* Section Header */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#c25a2a] text-sm">✱</span>
              <p className="font-sans text-xs sm:text-sm tracking-[0.2em] uppercase font-bold text-[#c25a2a]">
                EXPERT CARE TEAM
              </p>
            </div>
            <h2 className="font-sans-main text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-tight text-white">
              When AI Isn't Enough,<br />People Are There.
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-white/80 max-w-md font-normal leading-relaxed">
            Connect with verified mental-health professionals when you want support beyond the conversation.
          </p>
        </motion.div>
      </div>

      {/* Infinite Horizontal Carousel */}
      <div 
        className="w-full overflow-hidden relative cursor-grab active:cursor-grabbing py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft edge fade overlays */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-[#0a2617] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-[#0a2617] to-transparent z-20 pointer-events-none" />

        {/* Marquee Track */}
        <motion.div
          className="flex gap-6 sm:gap-8 w-max"
          animate={{
            x: isPaused ? undefined : ["0%", "-33.3333%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
        >
          {marqueeList.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}`}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
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
              className="relative w-[260px] sm:w-[300px] md:w-[320px] h-[400px] sm:h-[450px] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-2xl flex-shrink-0 bg-[#071d13] group"
            >
              {/* Therapist Photo */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

              {/* Top Tag Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-sans tracking-widest px-3 py-1 rounded-full uppercase font-medium border border-white/20">
                  {item.experience}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs">
                  ✱
                </div>
              </div>

              {/* Bottom Card Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 text-white flex flex-col justify-end">
                <span className="font-sans text-[10px] sm:text-xs tracking-[0.15em] text-[#ffebc4] uppercase font-semibold mb-1">
                  {item.role}
                </span>
                <h3 className="font-sans-main text-2xl sm:text-3xl text-white font-normal mb-2 leading-tight">
                  {item.name}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-white/80 font-light line-clamp-2 leading-relaxed mb-3">
                  "{item.quote}"
                </p>
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] sm:text-xs font-sans tracking-wider text-white/60 uppercase">
                  <span>{item.tag}</span>
                  <span className="text-[#ffebc4] group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom CTA Button */}
      <div className="w-full flex justify-center mt-12 sm:mt-16 relative z-30">
        <button
          onClick={onBookSession}
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#201914] text-[#fffdf5] font-bold text-sm tracking-wider uppercase hover:bg-[#c25a2a] transition shadow-lg w-fit border-0 cursor-pointer"
        >
          Explore Professionals &rarr;
        </button>
      </div>
    </section>
  );
};
