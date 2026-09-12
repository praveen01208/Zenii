import React from "react";
import { LazyMotion, domAnimation, m } from "motion/react";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple" | "emerald";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "emerald",
  className,
  rotate,
  colors: customColors,
}: CardProps) => {
  const defaultBgColors = {
    orange: "bg-[#092214]",
    blue: "bg-[#092214]",
    purple: "bg-[#092214]",
    emerald: "bg-[#092214]",
  };
  const defaultTextColors = {
    orange: "text-[#ffebc4]",
    blue: "text-[#10b981]",
    purple: "text-[#ffebc4]",
    emerald: "text-[#ffebc4]",
  };
  const defaultBorderColors = {
    orange: "border-white/20",
    blue: "border-[#10b981]/40",
    purple: "border-white/20",
    emerald: "border-white/20",
  };

  const bgColor = customColors?.bg || defaultBgColors[colorTheme];
  const textColor = customColors?.text || defaultTextColors[colorTheme];
  const borderColor = customColors?.border || defaultBorderColors[colorTheme];

  return (
    <div
      className={`relative w-full md:w-[320px] transition-transform duration-300 hover:z-30 hover:scale-105 ${rotate} ${className}`}
    >
      <div className="bg-[#0e3820] p-2 rounded-[25px] shadow-2xl border border-[#0e3820]/30">
        <Pin className={`w-8 h-8 ${textColor} z-20 mb-4 mx-auto`} />
        <div
          className={`${bgColor} border ${borderColor} rounded-[18px] p-6 h-full flex flex-col relative overflow-hidden text-white`}
        >
          <span
            className={`${textColor} text-4xl font-bold mb-3 font-sans-main`}
          >
            {number}
          </span>
          <h3 className="text-xl font-bold text-white leading-tight mb-3 font-sans-main">
            {title}
          </h3>
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed font-sans font-normal">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export interface Step {
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple" | "emerald";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

interface MindOverMatterSectionProps {
  onCompanyLinkClick?: (link: string) => void;
}

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[10%]", rotate: "rotate-6" },
  {
    className: "md:absolute md:top-[120px] md:right-[10%]",
    rotate: "-rotate-6",
  },
  { className: "md:absolute md:top-[450px] md:left-[10%]", rotate: "rotate-6" },
  {
    className: "md:absolute md:top-[570px] md:right-[10%]",
    rotate: "-rotate-6",
  },
  { className: "md:absolute md:top-[850px] md:left-[10%]", rotate: "rotate-6" },
];

export const MindOverMatterSection: React.FC<MindOverMatterSectionProps> = () => {
  const data: Step[] = [
    {
      title: "Tone & Sentiment Telemetry",
      description:
        "Behind every message, Zeni evaluates sentiment velocity and emotional patterns — identifying stress, burnout, sadness, or anxiety to respond with genuine care.",
      colorTheme: "emerald",
    },
    {
      title: "Independent Crisis Guardian",
      description:
        "Zeni's secondary AI safety layer monitors conversation flow for serious distress, ensuring care safeguards and crisis protocols activate seamlessly when needed.",
      colorTheme: "blue",
    },
    {
      title: "Contextual Memory Engine",
      description:
        "Zeni builds an encrypted, anonymized memory map of your ongoing journey — remembering milestones, personal triggers, and themes so you never repeat yourself.",
      colorTheme: "purple",
    },
    {
      title: "Multilingual Speech Resonance",
      description:
        "Express yourself naturally in Hinglish, Hindi, English, or Kannada with real-time regional speech attunement.",
      colorTheme: "orange",
    },
    {
      title: "Verified Clinical Integration",
      description:
        "Whenever human care is needed, seamlessly transition to 1-on-1 video sessions with licensed adolescent psychotherapists.",
      colorTheme: "emerald",
    },
  ];

  const height = 1130;

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="mind-over-matter"
        className="bg-[#f8fdf9] text-[#0e3820] py-24 sm:py-36 px-6 sm:px-10 lg:px-16 relative border-b border-[#0e3820]/10 overflow-hidden"
      >
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0e3820]/10 text-[#0e3820] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-4">
            <span>✦ NEURAL EMOTIONAL INTELLIGENCE</span>
          </div>
          <h2 className="font-sans-main text-4xl sm:text-6xl md:text-7xl lg:text-[80px] text-[#0e3820] font-normal leading-[0.98] tracking-tight mb-6">
            Deconstruct Stress.<br />
            <span className="italic text-[#10b981]">Reclaim Inner Quiet.</span>
          </h2>
          <p className="font-sans-main text-base sm:text-xl text-[#0e3820]/80 max-w-2xl mx-auto font-normal leading-relaxed">
            Powered by a dual-layer AI architecture that understands the emotional context and tone behind every word you say.
          </p>
        </div>

        {/* Pinned Card Flow Canvas */}
        <div className="max-w-6xl mx-auto relative z-10">
          <div
            className="relative w-full max-w-[1000px] mx-auto flex flex-col space-y-8 md:space-y-0 md:block h-auto md:h-[var(--md-height)]"
            style={{ "--md-height": `${height}px` } as React.CSSProperties}
          >
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block z-0"
              viewBox={`0 0 1000 ${height}`}
              preserveAspectRatio="none"
            >
              {(() => {
                const pathD = "M 290 150 C 500 150, 550 270, 710 270 C 850 270, 500 350, 290 450 C 290 600, 550 720, 750 720 C 950 720, 500 800, 290 850";
                return (
                  <m.path
                    d={pathD}
                    stroke="currentColor"
                    className="text-[#0e3820]/40"
                    strokeWidth="3"
                    strokeDasharray="8 6"
                    fill="none"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{
                      strokeDashoffset: -140,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                );
              })()}
            </svg>

            {data.map((step, index) => {
              const position = DEFAULT_CARD_POSITIONS[index % DEFAULT_CARD_POSITIONS.length];

              return (
                <Card
                  key={step.title}
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  colorTheme={step.colorTheme || "emerald"}
                  colors={step.colors}
                  rotate={position.rotate}
                  className={position.className}
                />
              );
            })}
          </div>
        </div>

      </section>
    </LazyMotion>
  );
};
