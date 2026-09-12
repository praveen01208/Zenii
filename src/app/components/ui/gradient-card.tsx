import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const cardVariants = cva(
  "relative flex flex-col justify-between h-full w-full overflow-hidden rounded-3xl p-8 shadow-xl transition-all duration-300 border border-white/20",
  {
    variants: {
      gradient: {
        orange: "bg-gradient-to-br from-[#0e3820] to-[#071d13]",
        gray: "bg-gradient-to-br from-[#092214] to-[#071d13]",
        purple: "bg-gradient-to-br from-[#0d5d3a] to-[#092214]",
        green: "bg-gradient-to-br from-[#10b981]/30 to-[#0e3820]",
      },
    },
    defaultVariants: {
      gradient: "gray",
    },
  }
);

export interface GradientCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  badgeText: string;
  badgeColor: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  imageUrl: string;
  onCtaClick?: () => void;
}

const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  (
    {
      className,
      gradient,
      badgeText,
      badgeColor,
      title,
      description,
      ctaText,
      ctaHref,
      imageUrl,
      onCtaClick,
      ...props
    },
    ref
  ) => {
    const cardAnimation = {
      rest: { scale: 1, y: 0 },
      hover: { scale: 1.03, y: -4 },
    };

    const imageAnimation = {
      rest: { scale: 1, rotate: 0 },
      hover: { scale: 1.1, rotate: 3 },
    };

    return (
      <motion.div
        variants={cardAnimation}
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="h-full"
        ref={ref}
      >
        <div className={cn(cardVariants({ gradient }), className)} {...props}>
          {/* Decorative background image with spring animation */}
          <motion.img
            src={imageUrl}
            alt={`${title} graphic`}
            variants={imageAnimation}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute -right-1/6 -bottom-1/6 w-2/3 h-2/3 object-cover rounded-3xl opacity-35 pointer-events-none filter brightness-90 contrast-110"
          />

          {/* Card Content */}
          <div className="z-10 flex flex-col justify-between h-full min-h-[220px]">
            <div>
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold font-sans tracking-wider uppercase text-[#ffebc4] border border-white/15 backdrop-blur-md w-fit">
                <span
                  className="h-2 w-2 rounded-full shadow-sm"
                  style={{ backgroundColor: badgeColor }}
                />
                {badgeText}
              </div>

              {/* Title and Description */}
              <h3 className="text-2xl font-normal font-sans-main text-white mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-white/85 text-xs sm:text-sm max-w-xs font-sans leading-relaxed">
                {description}
              </p>
            </div>

            {/* Call to Action Button/Link */}
            <button
              onClick={onCtaClick}
              className="group mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffebc4] hover:text-white transition-colors bg-transparent border-0 cursor-pointer w-fit"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
);
GradientCard.displayName = "GradientCard";

export { GradientCard, cardVariants };
