import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import PillNav from './PillNav';
import StaggeredMenu from './StaggeredMenu';
import logo from '../../../asset/logo.png';

type NavigationProps = {
  onGetStarted: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
};

export default function Navigation({ onGetStarted, onAdminLoginTrigger, onTherapistLoginTrigger }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features',     href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Therapy',      href: '#therapy' },
    { label: 'About',        href: '#about' },
  ];

  // StaggeredMenu items — use scrollIntoView for anchors, callbacks for actions
  const mobileMenuItems = [
    {
      key: 'features',
      label: 'Features',
      onClick: () => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      key: 'how-it-works',
      label: 'How It Works',
      onClick: () => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      key: 'therapy',
      label: 'Therapy',
      onClick: () => document.querySelector('#therapy')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      key: 'about',
      label: 'About',
      onClick: () => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      key: 'therapist-login',
      label: 'Therapist Login',
      onClick: () => onTherapistLoginTrigger?.(),
    },
    {
      key: 'get-started',
      label: 'Get Started',
      onClick: () => onGetStarted(),
    },
  ];

  return (
    <>
      {/* ── Desktop nav pill (sm and above only — StaggeredMenu handles mobile) ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden sm:flex fixed top-0 left-0 right-0 z-50 justify-center px-4 pointer-events-none"
      >
        <motion.div
          animate={{
            width: isScrolled ? 'min(94vw, 940px)' : 'min(96vw, 1280px)',
            marginTop: isScrolled ? '8px' : '0px',
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`pointer-events-auto px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 dark:bg-[#050505]/95 backdrop-blur-lg shadow-md border border-[#0d5d3a]/10 dark:border-white/10 rounded-2xl sm:rounded-3xl'
              : 'bg-transparent'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Logo — always visible */}
            <motion.a
              href="#"
              onDoubleClick={(e) => { e.preventDefault(); onAdminLoginTrigger?.(); }}
              className="flex items-center gap-2 text-xl sm:text-2xl text-[#0a2617] dark:text-white whitespace-nowrap cursor-pointer select-none"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <img src={logo} alt="ZenMind Logo" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover pointer-events-none" />
              <span className="hidden sm:inline">ZenMind</span>
            </motion.a>

            {/* Centre pill nav — desktop only */}
            <div className="hidden sm:flex flex-1 justify-center">
              <PillNav
                logo={logo}
                logoAlt="ZenMind Logo"
                items={navItems}
                activeHref=""
                ease="power2.easeOut"
                baseColor="#0d5d3a"
                pillColor="#ffffff"
                hoveredPillTextColor="#ffffff"
                pillTextColor="#0d5d3a"
                initialLoadAnimation
                showLogo={false}
              />
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={onTherapistLoginTrigger}
                className="zen-blob-btn"
              >
                <div className="zen-blob" />
                <div className="zen-blob-inner">Therapist Login</div>
              </button>
            </div>

            {/* Get Started — pinned to the far right end */}
            <button
              onClick={onGetStarted}
              className="hidden sm:block ml-auto"
              style={{
                fontFamily: '"Gochi Hand", cursive',
                fontSize: '15px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '5px',
                background: '#5cdb95',
                boxShadow: '0 2px 0 #494a4b',
                transform: 'rotate(5deg)',
                transformOrigin: 'center',
                padding: '0 0 3px 0',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                whiteSpace: 'nowrap',
              }}
              onMouseDown={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(5deg) translateY(5px)';
                (e.currentTarget as HTMLButtonElement).style.paddingBottom = '0';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
              onMouseUp={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(5deg)';
                (e.currentTarget as HTMLButtonElement).style.paddingBottom = '3px';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 0 #494a4b';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(5deg)';
                (e.currentTarget as HTMLButtonElement).style.paddingBottom = '3px';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 0 #494a4b';
              }}
            >
              <span style={{
                background: '#f1f5f8',
                display: 'block',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                border: '2px solid #494a4b',
                fontWeight: 600,
                color: '#494a4b',
              }}>
                Get Started
              </span>
            </button>

            {/* Mobile: invisible spacer so logo stays flush left;
                StaggeredMenu renders its own toggle button in top-right */}
            <div className="sm:hidden w-24" aria-hidden="true" />
          </div>
        </motion.div>
      </motion.nav>

      {/* ── StaggeredMenu — mobile only (CSS hides it at ≥ 768px) ── */}
      <StaggeredMenu
        items={mobileMenuItems}
        colors={['#0a2617', '#0d5d3a']}
        accentColor="#10b981"
        displayItemNumbering={true}
        displaySocials={false}
        logoUrl={logo}
        onLogoDoubleClick={onAdminLoginTrigger}
        isScrolled={isScrolled}
      />
    </>
  );
}
