import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
}

export interface CircularCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const VISIBLE_COUNT = 5;
const RADIUS_X = 220;
const RADIUS_Y = 100;

function getItemPosition(index: number, activeIndex: number, total: number) {
  const offset = index - activeIndex;
  const half = Math.floor(VISIBLE_COUNT / 2);
  let adjustedOffset = offset;

  if (offset > half) adjustedOffset = offset - total;
  if (offset < -half) adjustedOffset = offset + total;

  if (Math.abs(adjustedOffset) > half * 2) return null;

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI;
  const x = Math.sin(angle) * RADIUS_X;
  const y = -Math.cos(angle) * RADIUS_Y;

  const distance = Math.abs(adjustedOffset);
  const maxDistance = half + 1;
  const scale = Math.max(0, 1 - (distance / maxDistance) * 0.3);
  const opacity = Math.max(0.3, 1 - (distance / maxDistance) * 0.7);
  const zIndex = VISIBLE_COUNT - distance;

  return { x, y, scale, opacity, zIndex, adjustedOffset };
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 4000,
  className,
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = controlledIndex ?? internalIndex;
  const total = items.length;

  const goTo = useCallback(
    (index: number) => {
      const newIndex = ((index % total) + total) % total;
      if (controlledIndex === undefined) {
        setInternalIndex(newIndex);
      }
      onActiveChange?.(newIndex);
    },
    [total, controlledIndex, onActiveChange],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || isHovered || isFocused) return;
    intervalRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [next, prev]);

  const activeItem = items[activeIndex];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`relative flex flex-col items-center justify-center gap-8 outline-none select-none ${className || ''}`}
    >
      {/* Circular track with enlarged bounds */}
      <div className="relative h-[340px] sm:h-[380px] w-full max-w-2xl flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const pos = getItemPosition(i, activeIndex, total);
            if (!pos) return null;

            const isActive = i === activeIndex;

            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  x: pos.x,
                  y: pos.y,
                  scale: pos.scale,
                  opacity: pos.opacity,
                  zIndex: pos.zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => goTo(i)}
                aria-label={item.title}
                aria-selected={isActive}
                role="option"
                className={`absolute left-1/2 top-1/2 flex h-44 sm:h-48 w-64 sm:w-72 md:w-80 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-start justify-between rounded-3xl border border-white/25 bg-[#0e3820] p-6 shadow-2xl transition-all duration-300 ${
                  isActive
                    ? "shadow-[0_25px_70px_-12px_rgba(16,185,129,0.5)] border-[#10b981] bg-[#092214]"
                    : "shadow-[0_12px_32px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_40px_-4px_rgba(0,0,0,0.6)]"
                }`}
                style={{ transformOrigin: "center center" }}
              >
                {item.tag && (
                  <span className="rounded-full bg-[#10b981]/25 border border-[#10b981]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#ffebc4]">
                    {item.tag}
                  </span>
                )}
                <div className="w-full text-left">
                  <h3
                    className={`font-semibold font-sans-main leading-tight transition-colors duration-300 ${
                      isActive
                        ? "text-white text-lg sm:text-xl"
                        : "text-white/90 text-base"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-1.5 line-clamp-2 text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
                      isActive ? "text-white/90" : "text-white/70"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Center content counter */}
        <motion.div
          key={activeItem.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0"
        >
          <span className="text-7xl font-bold font-sans-main tracking-tight text-[#0e3820]/30">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="mt-1 text-xs text-[#0e3820]/50 font-sans font-semibold">
            of {String(total).padStart(2, "0")}
          </span>
        </motion.div>

      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 relative z-10">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={prev}
          aria-label="Previous item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0e3820]/20 bg-[#0e3820] text-white shadow-lg transition-colors hover:bg-[#ffebc4] hover:text-[#0e3820] cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? "w-6 bg-[#0e3820]"
                  : "w-1.5 bg-[#0e3820]/30 hover:bg-[#0e3820]/60"
              }`}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={next}
          aria-label="Next item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0e3820]/20 bg-[#0e3820] text-white shadow-lg transition-colors hover:bg-[#ffebc4] hover:text-[#0e3820] cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

export default CircularCarousel;
