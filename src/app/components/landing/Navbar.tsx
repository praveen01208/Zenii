import React, { useState, useEffect, useRef } from "react";
import { X, Shield, UserCheck, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

interface NavbarProps {
  onGetStarted?: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
  onCompanyLinkClick?: (link: string) => void;
  onResourcesLinkClick?: (link: string) => void;
  onProductLinkClick?: (link: string) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  delayReappearMs?: number;
}

interface NavLinkProps {
  label: string;
  onClick?: () => void;
  href?: string;
  isMenuOpen: boolean;
}

const TextFlipLink: React.FC<NavLinkProps> = ({ label, onClick, href, isMenuOpen }) => {
  const textColor = isMenuOpen ? "text-[#201914]" : "text-[#fffdf5]/80 hover:text-[#fffdf5]";
  const hoverColor = isMenuOpen ? "text-[#201914]/70" : "text-[#ffebc4]";
  
  const content = (
    <>
      <span className={`block whitespace-nowrap transition-all duration-300 ease-out group-hover:-translate-y-full text-[11px] lg:text-[13px] font-sans tracking-[0.15em] uppercase font-medium leading-[18px] ${textColor}`}>
        {label}
      </span>
      <span className={`absolute top-full left-0 block whitespace-nowrap transition-all duration-300 ease-out group-hover:-translate-y-full text-[11px] lg:text-[13px] font-sans tracking-[0.15em] uppercase font-medium leading-[18px] ${hoverColor}`}>
        {label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="relative inline-block overflow-hidden h-[18px] group shrink-0 text-left bg-transparent border-0 p-0 cursor-pointer">
        {content}
      </button>
    );
  }

  return (
    <a href={href || "#"} className="relative inline-block overflow-hidden h-[18px] group shrink-0">
      {content}
    </a>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
  scrollContainerRef,
  delayReappearMs = 1200,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const targetElement = scrollContainerRef?.current || window;

    const handleScroll = () => {
      const currentY = scrollContainerRef?.current
        ? scrollContainerRef.current.scrollTop
        : window.scrollY;

      const heroThreshold = 100;
      setIsPastHero(currentY > heroThreshold);

      if (mobileMenuOpen) return;

      if (currentY > heroThreshold) {
        if (currentY > lastScrollY.current && currentY - lastScrollY.current > 10) {
          // Scrolling DOWN: Hide header immediately
          setHidden(true);
        } else if (currentY < lastScrollY.current) {
          // Scrolling UP: Show header immediately
          setHidden(false);
        }
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;

      // When scroll STOPS, reappear after delayReappearMs (a few seconds)
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        if (!mobileMenuOpen) setHidden(false);
      }, delayReappearMs);
    };

    targetElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      targetElement.removeEventListener("scroll", handleScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [mobileMenuOpen, scrollContainerRef, delayReappearMs]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const leftNavItems = [
    { label: "ABOUT", onClick: () => onCompanyLinkClick?.('About Us') },
    { label: "FEATURES", onClick: () => onProductLinkClick?.('Features') },
    { label: "THERAPISTS", href: "#professionals" },
    { label: "CONTACT", onClick: () => onResourcesLinkClick?.('Contact Us') },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 w-full transition-all duration-500 ease-out z-[70] p-[10px] pb-0"
        style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
      >
        <div className={`w-full flex items-center justify-between h-16 md:h-20 px-4 sm:px-6 md:px-8 rounded-2xl md:rounded-3xl transition-all duration-500 ${
          isPastHero || mobileMenuOpen
            ? 'bg-[#0a2617]/90 backdrop-blur-2xl border border-white/16 shadow-2xl'
            : 'bg-transparent border-transparent shadow-none'
        }`}>
          
          {/* Left: Mobile Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-white/15 text-[#fffdf5] focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : (
                <div className="flex flex-col justify-center space-y-[4px] w-5">
                  <span className="w-full h-[1.5px] bg-[#fffdf5]" />
                  <span className="w-full h-[1.5px] bg-[#fffdf5]" />
                </div>
              )}
            </button>
            <a href="#" className="flex items-center gap-2">
              <img
                src="/logo-white.png"
                alt="ZENI"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </a>
          </div>

          {/* Center: Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {leftNavItems.map((item) => (
              <TextFlipLink
                key={item.label}
                label={item.label}
                href={item.href}
                onClick={item.onClick}
                isMenuOpen={mobileMenuOpen}
              />
            ))}
          </div>

          {/* Right: Portal Login links + Clerk Auth + Get Started CTA Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Therapist Login Portal */}
            <button
              onClick={onTherapistLoginTrigger}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-[#fffdf5]/80 hover:text-white hover:border-white text-[11px] font-sans tracking-wider uppercase transition-colors"
              title="Therapist Portal"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#ffebc4]" />
              <span>Therapist</span>
            </button>

            {/* Admin Login Portal */}
            <button
              onClick={onAdminLoginTrigger}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-[#fffdf5]/80 hover:text-white hover:border-white text-[11px] font-sans tracking-wider uppercase transition-colors"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-[#ffebc4]" />
              <span>Admin</span>
            </button>

            {/* Clerk Authentication Controls */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/30 text-[#fffdf5] hover:bg-white/10 text-[11px] font-sans tracking-wider uppercase transition-colors">
                  <LogIn className="w-3.5 h-3.5 text-[#ffebc4]" />
                  <span>Sign In</span>
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full bg-[#ffebc4] text-[#201914] font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-md group border-0 cursor-pointer">
                  <span>GET STARTED</span>
                  <span className="w-5 h-5 rounded-full border border-[#201914]/25 flex items-center justify-center text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <button
                onClick={onGetStarted}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700/80 text-white font-medium text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all border border-emerald-500/30"
              >
                <span>Dashboard</span>
              </button>
              <div className="flex items-center pl-1">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Fullscreen Split Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] pointer-events-none flex">
            {/* Left Half (Slides from Top) */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="w-1/2 h-full bg-[#071d13] border-r border-white/10 pointer-events-auto flex flex-col pt-32 lg:pt-40 pb-10 px-6 sm:px-12 md:px-16 text-white"
            >
              <div className="flex flex-col gap-5 sm:gap-6 ml-auto mr-0 md:mr-10">
                <button
                  onClick={() => { setMobileMenuOpen(false); onCompanyLinkClick?.('About Us'); }}
                  className="font-sans text-xs md:text-sm tracking-[0.1em] text-white/80 hover:text-white uppercase transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                >
                  ABOUT US
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onResourcesLinkClick?.('Contact Us'); }}
                  className="font-sans text-xs md:text-sm tracking-[0.1em] text-white/80 hover:text-white uppercase transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                >
                  CONTACT US
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onCompanyLinkClick?.('Careers'); }}
                  className="font-sans text-xs md:text-sm tracking-[0.1em] text-white/80 hover:text-white uppercase transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                >
                  CAREERS
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onResourcesLinkClick?.('Privacy Policy'); }}
                  className="font-sans text-xs md:text-sm tracking-[0.1em] text-white/80 hover:text-white uppercase transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                >
                  PRIVACY POLICY
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onResourcesLinkClick?.('Terms of Service'); }}
                  className="font-sans text-xs md:text-sm tracking-[0.1em] text-white/80 hover:text-white uppercase transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                >
                  TERMS & CONDITIONS
                </button>

                <div className="pt-6 border-t border-white/15 flex flex-col gap-3">
                  <button
                    onClick={() => { setMobileMenuOpen(false); onTherapistLoginTrigger?.(); }}
                    className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase text-[#ffebc4] font-bold text-left bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" /> Therapist Portal ↗
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onAdminLoginTrigger?.(); }}
                    className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase text-[#201914]/80 font-bold text-left bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" /> Admin Portal ↗
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right Half (Slides from Bottom) */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="w-1/2 h-full bg-[#0a2617] pointer-events-auto flex flex-col pt-32 lg:pt-40 pb-10 px-6 sm:px-12 md:px-16"
            >
              <div className="flex flex-col gap-4 max-w-sm ml-0 md:ml-6">
                {/* AI Companion Card */}
                <button
                  onClick={() => { setMobileMenuOpen(false); onGetStarted?.(); }}
                  className="flex flex-col items-center justify-center py-6 sm:py-8 px-4 bg-[#071d13] rounded-xl border border-white/10 hover:border-white/25 hover:shadow-lg transition-all duration-300 text-center cursor-pointer"
                >
                  <span className="font-sans-main text-xl sm:text-2xl md:text-3xl text-white mb-1 font-normal italic">Talk to Zeni</span>
                  <span className="font-sans text-[10px] md:text-xs tracking-[0.15em] text-[#10b981] uppercase font-bold">24/7 PRIVATE AI CHAT</span>
                </button>

                {/* Book Session Card */}
                <button
                  onClick={() => { setMobileMenuOpen(false); onGetStarted?.(); }}
                  className="flex flex-col items-center justify-center py-6 sm:py-8 px-4 bg-[#071d13] rounded-xl border border-white/10 hover:border-white/25 hover:shadow-lg transition-all duration-300 text-center cursor-pointer"
                >
                  <span className="font-sans-main text-xl sm:text-2xl md:text-3xl text-white mb-1 font-normal italic">Book Online</span>
                  <span className="font-sans text-[10px] md:text-xs tracking-[0.15em] text-[#ffebc4] uppercase font-bold">EXPERT HUMAN THERAPISTS</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
