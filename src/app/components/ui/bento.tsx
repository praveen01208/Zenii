import React from "react";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { Sparkles, Heart, Shield, Activity, Users, MessageSquare } from "lucide-react";

export function BentoCard({
  dark = false,
  className = "",
  eyebrow,
  title,
  description,
  graphic,
  fade = [],
}: {
  dark?: boolean;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  graphic?: React.ReactNode;
  fade?: ("top" | "bottom")[];
}) {
  return (
    <motion.div
      initial="idle"
      whileHover="active"
      variants={{ idle: {}, active: {} }}
      data-dark={dark ? "true" : undefined}
      className={clsx(
        className,
        "group relative flex flex-col overflow-hidden rounded-3xl",
        "bg-[#0e3820] transform-gpu border border-white/15 shadow-2xl ring-1 ring-white/10",
        "data-[dark]:bg-[#092214]"
      )}
    >
      <div className="relative h-[22rem] sm:h-[26rem] shrink-0 overflow-hidden">
        {graphic}
        {fade.includes("top") && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e3820] to-50% opacity-40 pointer-events-none" />
        )}
        {fade.includes("bottom") && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e3820] to-50% opacity-40 pointer-events-none" />
        )}
      </div>
      <div className="relative p-8 sm:p-10 z-20 isolate mt-[-110px] h-[15rem] backdrop-blur-xl text-white bg-[#0e3820]/90 border-t border-white/10 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold font-sans tracking-widest text-[#ffebc4] uppercase block mb-1">
            {eyebrow}
          </span>
          <h3 className="text-2xl font-normal font-sans-main tracking-tight text-white group-data-[dark]:text-white">
            {title}
          </h3>
          <p className="mt-2 max-w-[600px] text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function FUIBentoGridDark() {
  return (
    <div className="w-full flex flex-col">
      <div className="grid grid-cols-1 gap-6 sm:mt-10 lg:grid-cols-6 lg:grid-rows-2">
        <BentoCard
          eyebrow="24/7 AI Listening"
          title="Empathetic Conversational Companion"
          description="Zeni parses sentiment patterns and nuance, responding with genuine attunement in English, Hindi, Hinglish, and Kannada without judgment."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center filter brightness-75 group-hover:scale-105 transition-transform duration-700" />
          }
          className="max-lg:rounded-t-3xl lg:col-span-3 lg:rounded-tl-3xl"
        />

        <BentoCard
          eyebrow="Clinical Excellence"
          title="Verified Psychotherapists"
          description="Whenever you need care beyond AI listening, book 1-on-1 video therapy sessions with licensed adolescent CBT specialists."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center filter brightness-75 group-hover:scale-105 transition-transform duration-700" />
          }
          className="lg:col-span-3 lg:rounded-tr-3xl"
        />

        <BentoCard
          eyebrow="Crisis Safety"
          title="Background Safety Guardian"
          description="Independent secondary AI pipeline actively monitors risk signals to ensure immediate care pathways when needed."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center filter brightness-75 group-hover:scale-105 transition-transform duration-700" />
          }
          className="lg:col-span-2 lg:rounded-bl-3xl"
        />

        <BentoCard
          eyebrow="Peer Sanctuary"
          title="Moderated Peer Circles"
          description="Connect anonymously with students facing similar academic stress and social burnout in safe, moderated rooms."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center filter brightness-75 group-hover:scale-105 transition-transform duration-700" />
          }
          className="lg:col-span-2"
        />

        <BentoCard
          eyebrow="Encrypted Memory"
          title="Private Mood Telemetry"
          description="Visualize sentiment trends over weeks and discover underlying emotional triggers in your personal encrypted dashboard."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center filter brightness-75 group-hover:scale-105 transition-transform duration-700" />
          }
          className="max-lg:rounded-b-3xl lg:col-span-2 lg:rounded-br-3xl"
        />
      </div>
    </div>
  );
}
