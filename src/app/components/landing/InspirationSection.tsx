import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export const InspirationSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Smooth expansion curve over 0 to 0.7 progress
  const cardWidth = useTransform(scrollYProgress, (v) => {
    const p = Math.min(Math.max(v / 0.7, 0), 1);
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    return `calc(280px + (100vw - 280px) * ${ease})`;
  });

  const cardHeight = useTransform(scrollYProgress, (v) => {
    const p = Math.min(Math.max(v / 0.7, 0), 1);
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    return `calc(180px + (100vh - 180px) * ${ease})`;
  });

  const cardRadius = useTransform(scrollYProgress, [0, 0.6], ["20px", "0px"]);

  // Text & UI fade out early
  const uiOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Logo fades in smoothly as card reaches full size
  const logoOpacity = useTransform(scrollYProgress, [0.5, 0.75], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#071d13] z-10 h-[140vh] md:h-[180vh]"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#071d13]">
        {/* Expanding video card container */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            style={{
              width: cardWidth,
              height: cardHeight,
              borderRadius: cardRadius,
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              boxShadow: `
                inset 0 0 20px rgba(255, 255, 255, 0.18),
                inset 0 0 5px rgba(255, 255, 255, 0.28),
                0 12px 30px rgba(0, 0, 0, 0.45)
              `,
              border: '1px solid rgba(255, 255, 255, 0.16)',
            }}
            className="overflow-hidden relative flex items-center justify-center shadow-2xl"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/logo-bg.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </div>

        {/* White Logo overlay inside sticky container */}
        <motion.div
          style={{ opacity: logoOpacity }}
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
        >
          <img
            src="/logo-white.png"
            alt="ZENI"
            className="w-20 sm:w-28 md:w-36 h-auto"
          />
        </motion.div>

        {/* UI Overlay */}
        <motion.div
          style={{ opacity: uiOpacity }}
          className="absolute inset-0 z-20 flex flex-col pointer-events-none"
        >
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between px-6 sm:px-10 md:px-14 lg:px-16 pt-8 pb-4">
            <p className="font-sans text-xs sm:text-sm tracking-wider text-[#ffebc4]/80">
              ZENI
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[#ffebc4]/80 text-sm">✱</span>
              <p className="font-sans text-xs sm:text-sm tracking-[0.2em] uppercase text-[#ffebc4]/80">
                Inspiration
              </p>
            </div>
            <p className="font-sans text-xs sm:text-sm tracking-wider text-[#ffebc4]/80">
              2026
            </p>
          </div>

          {/* Center Text flanking the card */}
          <div className="flex-1 flex items-center justify-center px-6 sm:px-10 md:px-14 lg:px-16">
            {/* Desktop layout */}
            <div className="hidden md:grid w-full max-w-7xl grid-cols-3 items-center gap-4 px-4">
              <h2 className="font-sans-main text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-normal leading-[1.05] tracking-tight text-[#ffebc4] text-left col-span-1 break-words">
                Your mind doesn&apos;t have office hours.
              </h2>
              <div className="col-span-1" />
              <h2 className="font-sans-main text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-normal leading-[1.05] tracking-tight text-[#ffebc4] text-right col-span-1 break-words">
                Neither does Zeni.
              </h2>
            </div>

            {/* Mobile layout */}
            <div className="flex md:hidden flex-col justify-between items-center h-full w-full py-6 text-center">
              <h2 className="font-sans-main text-2xl sm:text-4xl font-normal leading-[1.05] tracking-tight text-[#ffebc4] max-w-xs px-2">
                Your mind doesn&apos;t have office hours.
              </h2>
              <div className="flex-1" />
              <h2 className="font-sans-main text-2xl sm:text-4xl font-normal leading-[1.05] tracking-tight text-[#ffebc4] max-w-xs px-2">
                Neither does Zeni.
              </h2>
            </div>
          </div>

          {/* Bottom Instagram Row */}
          <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 pb-8 pt-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-sans text-xs sm:text-sm text-[#ffebc4]/50 mb-1">
                  Follow us on Instagram
                </p>
                <p className="font-sans-main text-xl sm:text-2xl md:text-3xl text-[#ffebc4] font-normal">
                  @zeni_app
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
