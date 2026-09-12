import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence } from 'motion/react';
import { useUser, useClerk } from '@clerk/clerk-react';
import Hero from './components/Hero';
import Navigation from './components/Navigation';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import StorySection from './components/StorySection';
import TherapySection from './components/TherapySection';
import Statistics from './components/Statistics';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import TherapistLogin from './components/TherapistLogin';
import TherapistDashboard from './components/TherapistDashboard';
import LoadingScreen from './components/LoadingScreen';
import ProductPage from './components/ProductPage';
import AboutPage from './components/AboutPage';
import CareersPage from './components/CareersPage';
import ComingSoonPage from './components/ComingSoonPage';
import ResourcesPage from './components/ResourcesPage';
import ContactPage from './components/ContactPage';
import { apiFetch } from './api/client';
import OnboardingFlow from './components/OnboardingFlow';

// ZENI UI Landing Components
import { SmoothScrollProvider } from './components/landing/SmoothScrollProvider';
import { Navbar as LandingNavbar } from './components/landing/Navbar';
import { HeroSection as LandingHero } from './components/landing/HeroSection';
import { ParadigmSection } from './components/landing/ParadigmSection';
import { MindOverMatterSection } from './components/landing/MindOverMatterSection';
import { TherapyRevealSection } from './components/landing/TherapyRevealSection';
import { BelieveSection } from './components/landing/BelieveSection';
import { ProfessionalsSection } from './components/landing/ProfessionalsSection';
import { InspirationSection } from './components/landing/InspirationSection';
import { GetInTouchSection } from './components/landing/GetInTouchSection';
import { Footer as LandingFooter } from './components/landing/Footer';
import { HowItWorksSection } from './components/landing/HowItWorksSection';
import { CommunityStoriesSection } from './components/landing/CommunityStoriesSection';
import { PlatformImpactSection } from './components/landing/PlatformImpactSection';
// SanctuaryCTASection removed



gsap.registerPlugin(ScrollTrigger);

const ls = {
  get: (k: string) => { try { return localStorage.getItem(k) === '1'; } catch { return false; } },
  set: (k: string, v: boolean) => { try { v ? localStorage.setItem(k, '1') : localStorage.removeItem(k); } catch {} },
};

export default function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const [authed, setAuthed]           = useState(() => ls.get('zm_authed'));
  const [adminAuthed, setAdminAuthed] = useState(() => ls.get('zm_admin'));
  const [therapistAuthed, setTherapistAuthed] = useState(() => ls.get('zm_therapist'));
  const [meData, setMeData] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Sync Clerk authentication state
  useEffect(() => {
    if (clerkLoaded && isSignedIn && clerkUser) {
      setAuthed(true);
      ls.set('zm_authed', true);
      setMeData((prev: any) => ({
        ...prev,
        _id: prev?._id || clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'Friend',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        avatar: clerkUser.imageUrl ? { data: clerkUser.imageUrl } : prev?.avatar,
        subscriptionTier: prev?.subscriptionTier || 'free',
        aiWeeklyCredits: prev?.aiWeeklyCredits ?? 10,
      }));
      setShowAuth(false);
    }
  }, [clerkLoaded, isSignedIn, clerkUser]);

  const [showAuth, setShowAuth]       = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showTherapistLogin, setShowTherapistLogin] = useState(false);
  // Track which dashboard tab to open immediately after login
  const [loginIntent, setLoginIntent] = useState<'progress' | 'aichat' | 'therapy'>('progress');

  const [activeFooterPage, setActiveFooterPage] = useState<string | null>(null);
  const [activeCompanyPage, setActiveCompanyPage] = useState<string | null>(null);
  const [activeResourcesPage, setActiveResourcesPage] = useState<string | null>(null);

  // Helper: open any overlay and push history so browser back button closes it
  const openOverlay = (setter: (v: string) => void, value: string) => {
    history.pushState({ zmOverlay: true }, '');
    if (value === 'Contact Us' || value === 'Contact') {
      setActiveCompanyPage(null);
      setActiveFooterPage(null);
      setActiveResourcesPage('Contact Us');
      return;
    }
    setter(value);
  };

  // Handle URL hash and direct routes (e.g. #contact, #about, #features, #careers)
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      const path = window.location.pathname.toLowerCase().replace('/', '');
      const route = hash || path;

      if (route === 'contact' || route === 'contact-us' || route === 'contactus') {
        setActiveCompanyPage(null);
        setActiveFooterPage(null);
        setActiveResourcesPage('Contact Us');
      } else if (route === 'about' || route === 'about-us' || route === 'aboutus') {
        setActiveFooterPage(null);
        setActiveResourcesPage(null);
        setActiveCompanyPage('About Us');
      } else if (route === 'careers' || route === 'career') {
        setActiveFooterPage(null);
        setActiveResourcesPage(null);
        setActiveCompanyPage('Careers');
      } else if (route === 'features' || route === 'faq' || route === 'therapy' || route === 'ai-chatbot') {
        const pageName = route === 'ai-chatbot' ? 'AI Chatbot' : route.charAt(0).toUpperCase() + route.slice(1);
        setActiveCompanyPage(null);
        setActiveResourcesPage(null);
        setActiveFooterPage(pageName);
      } else if (route === 'blog') {
        setActiveFooterPage(null); setActiveResourcesPage(null); setActiveCompanyPage('Blog');
      } else if (route === 'press') {
        setActiveFooterPage(null); setActiveResourcesPage(null); setActiveCompanyPage('Press');
      } else if (route === 'partners' || route === 'partner') {
        setActiveFooterPage(null); setActiveResourcesPage(null); setActiveCompanyPage('Partners');
      } else if (route === 'help' || route === 'help-center' || route === 'helpcenter') {
        setActiveCompanyPage(null); setActiveFooterPage(null); setActiveResourcesPage('Help Center');
      } else if (route === 'crisis' || route === 'crisis-support') {
        setActiveCompanyPage(null); setActiveFooterPage(null); setActiveResourcesPage('Crisis Support');
      } else if (route === 'community') {
        setActiveCompanyPage(null); setActiveFooterPage(null); setActiveResourcesPage('Community');
      } else if (route === 'safety' || route === 'safety-guidelines') {
        setActiveCompanyPage(null); setActiveFooterPage(null); setActiveResourcesPage('Safety Guidelines');
      } else if (route === 'report' || route === 'report-issue' || route === 'reportissue') {
        setActiveCompanyPage(null); setActiveFooterPage(null); setActiveResourcesPage('Report Issue');
      } else if (route === 'feedback') {
        setActiveCompanyPage(null); setActiveFooterPage(null); setActiveResourcesPage('Feedback');
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);

  // Back button listener — close whichever overlay is open
  useEffect(() => {
    const handlePop = () => {
      setActiveCompanyPage(null);
      setActiveFooterPage(null);
      setActiveResourcesPage(null);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  /* Loading screen — only on very first fresh browser open this session */
  const [checking, setChecking] = useState(() => sessionStorage.getItem('zm_loaded') !== '1');
  const [apiReady, setApiReady] = useState(false);  // backend responded?
  const isDashboard = adminAuthed || therapistAuthed || authed || activeFooterPage !== null;

  useEffect(() => {
    if (!isDashboard) {
      document.documentElement.classList.remove('dark');
    } else {
      const theme = localStorage.getItem('theme');
      const isDarkMode = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDarkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [isDashboard]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.fade-in-section',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2,
          scrollTrigger: { trigger: '.fade-in-section', start: 'top 80%', toggleActions: 'play none none none' } }
      );
    }, mainRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let alive = true;

    // Fetch /me and return the data (not just a boolean) so Dashboard can use it directly
    const verifyMe = async (): Promise<{ ok: boolean; data: any }> => {
      try {
        const data = await apiFetch<any>('/me', { timeoutMs: 15_000 });
        return { ok: true, data };
      } catch (e: any) {
        const msg = String(e?.message ?? '').toLowerCase();
        if (msg.includes('unauthori') || msg.includes('forbidden')) {
          return { ok: false, data: null };
        }
        return { ok: ls.get('zm_authed'), data: null }; // network error — keep cached state
      }
    };

    const verifyOther = async (path: string): Promise<boolean | null> => {
      try {
        await apiFetch(path, { timeoutMs: 15_000 });
        return true;
      } catch (e: any) {
        const msg = String(e?.message ?? '').toLowerCase();
        if (msg.includes('unauthori') || msg.includes('forbidden')) return false;
        return null;
      }
    };

    Promise.all([verifyMe(), verifyOther('/admin/me'), verifyOther('/therapist/me')]).then(([u, a, t]) => {
      if (!alive) return;
      setAuthed(u.ok); ls.set('zm_authed', u.ok);
      if (u.data) {
        setMeData(u.data);
        // If returning user hasn't done onboarding yet, show it
        if (u.ok && u.data.onboardingDone === false) setShowOnboarding(true);
      }
      if (a !== null) { setAdminAuthed(!!a); ls.set('zm_admin', !!a); }
      if (t !== null) { setTherapistAuthed(!!t); ls.set('zm_therapist', !!t); }
      setApiReady(true);
    });

    return () => { alive = false; };
  }, []);

  const logoutUser = async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    try { await clerkSignOut(); } catch {}
    setAuthed(false); ls.set('zm_authed', false);
    setMeData(null);
  };

  const logoutAdmin = async () => {
    try { await apiFetch('/admin/logout', { method: 'POST' }); } catch {}
    setAdminAuthed(false); ls.set('zm_admin', false);
    setShowAdminLogin(false);
  };

  const logoutTherapist = async () => {
    try { await apiFetch('/therapist/logout', { method: 'POST' }); } catch {}
    setTherapistAuthed(false); ls.set('zm_therapist', false);
    setShowTherapistLogin(false);
  };

  /* Show loading screen only during initial check */
  if (checking) {
    return (
      <LoadingScreen
        apiReady={apiReady}
        onComplete={() => { sessionStorage.setItem('zm_loaded', '1'); setChecking(false); }}
      />
    );
  }

  return (
    <div ref={mainRef} className="w-full overflow-x-clip bg-[#0a2617] text-[#fffdf5]">
      {adminAuthed ? (
        <AdminDashboard onLogout={logoutAdmin} />
      ) : showAdminLogin ? (
        <AdminLogin
          onBackHome={() => setShowAdminLogin(false)}
          onAdminAuthSuccess={() => {
            setAdminAuthed(true); ls.set('zm_admin', true); setShowAdminLogin(false);
          }}
        />
      ) : therapistAuthed ? (
        <TherapistDashboard onLogout={logoutTherapist} />
      ) : showTherapistLogin ? (
        <TherapistLogin
          onBackHome={() => setShowTherapistLogin(false)}
          onAuthSuccess={() => {
            setTherapistAuthed(true); ls.set('zm_therapist', true); setShowTherapistLogin(false);
          }}
        />
      ) : authed ? (
        showOnboarding ? (
          <OnboardingFlow
            userName={meData?.name || 'Friend'}
            onComplete={() => { setShowOnboarding(false); setMeData((d: any) => d ? { ...d, onboardingDone: true } : d); }}
          />
        ) : (
          <Dashboard onLogout={logoutUser} prefetchedMe={meData} initialTab={loginIntent} />
        )
      ) : showAuth ? (
        <AuthPage
          onBackHome={() => setShowAuth(false)}
          onAuthSuccess={() => {
          setAuthed(true);
          ls.set('zm_authed', true);
          setShowAuth(false);
          // Fetch /me to check onboardingDone for brand-new signups
          apiFetch<any>('/me').then(d => {
            setMeData(d);
            if (!d.onboardingDone) setShowOnboarding(true);
          }).catch(() => {});
        }}
        />
      ) : (
        <>
          <SmoothScrollProvider>
            <div className="min-h-screen bg-[#0a2617] text-[#fffdf5] relative overflow-x-clip">
              <LandingNavbar
                onGetStarted={() => { setLoginIntent('progress'); setShowAuth(true); }}
                onAdminLoginTrigger={() => setShowAdminLogin(true)}
                onTherapistLoginTrigger={() => setShowTherapistLogin(true)}
                onCompanyLinkClick={(link) => openOverlay(setActiveCompanyPage, link)}
                onResourcesLinkClick={(link) => openOverlay(setActiveResourcesPage, link)}
                onProductLinkClick={(link) => openOverlay(setActiveFooterPage, link)}
              />
              <LandingHero
                onGetStarted={() => { setLoginIntent('progress'); setShowAuth(true); }}
              />
              <ParadigmSection />
              <MindOverMatterSection
                onCompanyLinkClick={(link) => openOverlay(setActiveCompanyPage, link)}
              />
              <HowItWorksSection
                onGetStarted={() => { setLoginIntent('progress'); setShowAuth(true); }}
              />
              <TherapyRevealSection
                onBookSession={() => { setLoginIntent('therapy'); setShowAuth(true); }}
              />
              <BelieveSection />
              <ProfessionalsSection
                onBookSession={() => { setLoginIntent('therapy'); setShowAuth(true); }}
              />
              <CommunityStoriesSection />
              <PlatformImpactSection />
              <InspirationSection />
              <GetInTouchSection />

              <LandingFooter
                onGetStarted={() => { setLoginIntent('progress'); setShowAuth(true); }}
                onTherapistLoginTrigger={() => setShowTherapistLogin(true)}
                onProductLinkClick={(link) => openOverlay(setActiveFooterPage, link)}
                onCompanyLinkClick={(link) => openOverlay(setActiveCompanyPage, link)}
                onResourcesLinkClick={(link) => openOverlay(setActiveResourcesPage, link)}
              />
            </div>

            {activeFooterPage && (
              <ProductPage
                page={activeFooterPage}
                onClose={() => { setActiveFooterPage(null); }}
                onGetStarted={() => { setActiveFooterPage(null); setLoginIntent('progress'); setShowAuth(true); }}
                onAdminLoginTrigger={() => setShowAdminLogin(true)}
                onTherapistLoginTrigger={() => setShowTherapistLogin(true)}
                onCompanyLinkClick={(link) => {
                  setActiveFooterPage(null);
                  openOverlay(setActiveCompanyPage, link);
                }}
                onResourcesLinkClick={(link) => openOverlay(setActiveResourcesPage, link)}
                onProductLinkClick={(link) => openOverlay(setActiveFooterPage, link)}
              />
            )}
          </SmoothScrollProvider>

          {/* ── Company Pages ── */}
          <AnimatePresence>
            {activeCompanyPage === 'About Us' && (
              <AboutPage
                onClose={() => setActiveCompanyPage(null)}
                onGetStarted={() => { setActiveCompanyPage(null); setLoginIntent('progress'); setShowAuth(true); }}
                onAdminLoginTrigger={() => setShowAdminLogin(true)}
                onTherapistLoginTrigger={() => setShowTherapistLogin(true)}
                onCompanyLinkClick={(link) => openOverlay(setActiveCompanyPage, link)}
                onResourcesLinkClick={(link) => openOverlay(setActiveResourcesPage, link)}
                onProductLinkClick={(link) => {
                  setActiveCompanyPage(null);
                  openOverlay(setActiveFooterPage, link);
                }}
              />
            )}
            {activeCompanyPage === 'Careers' && (
              <CareersPage
                onClose={() => setActiveCompanyPage(null)}
                onGetStarted={() => { setActiveCompanyPage(null); setLoginIntent('progress'); setShowAuth(true); }}
                onAdminLoginTrigger={() => setShowAdminLogin(true)}
                onTherapistLoginTrigger={() => setShowTherapistLogin(true)}
                onCompanyLinkClick={(link) => openOverlay(setActiveCompanyPage, link)}
                onResourcesLinkClick={(link) => openOverlay(setActiveResourcesPage, link)}
                onProductLinkClick={(link) => {
                  setActiveCompanyPage(null);
                  openOverlay(setActiveFooterPage, link);
                }}
              />
            )}
            {(activeCompanyPage === 'Blog' || activeCompanyPage === 'Press' || activeCompanyPage === 'Partners') && (
              <ComingSoonPage
                page={activeCompanyPage}
                onClose={() => setActiveCompanyPage(null)}
                onGetStarted={() => { setActiveCompanyPage(null); setLoginIntent('progress'); setShowAuth(true); }}
                onAdminLoginTrigger={() => setShowAdminLogin(true)}
                onTherapistLoginTrigger={() => setShowTherapistLogin(true)}
                onCompanyLinkClick={(link) => openOverlay(setActiveCompanyPage, link)}
                onResourcesLinkClick={(link) => openOverlay(setActiveResourcesPage, link)}
                onProductLinkClick={(link) => {
                  setActiveCompanyPage(null);
                  openOverlay(setActiveFooterPage, link);
                }}
              />
            )}
          </AnimatePresence>

          {/* ── Resources & Contact Pages ── */}
          <AnimatePresence>
            {activeResourcesPage && (
              (activeResourcesPage === 'Contact Us' || activeResourcesPage === 'Contact') ? (
                <ContactPage
                  onClose={() => setActiveResourcesPage(null)}
                  onGetStarted={() => { setActiveResourcesPage(null); setLoginIntent('progress'); setShowAuth(true); }}
                  onAdminLoginTrigger={() => setShowAdminLogin(true)}
                  onTherapistLoginTrigger={() => setShowTherapistLogin(true)}
                  onCompanyLinkClick={(link) => openOverlay(setActiveCompanyPage, link)}
                  onResourcesLinkClick={(link) => openOverlay(setActiveResourcesPage, link)}
                  onProductLinkClick={(link) => {
                    setActiveResourcesPage(null);
                    openOverlay(setActiveFooterPage, link);
                  }}
                />
              ) : (
                <ResourcesPage
                  page={activeResourcesPage}
                  onClose={() => setActiveResourcesPage(null)}
                  onGetStarted={() => { setActiveResourcesPage(null); setLoginIntent('progress'); setShowAuth(true); }}
                  onAdminLoginTrigger={() => setShowAdminLogin(true)}
                  onTherapistLoginTrigger={() => setShowTherapistLogin(true)}
                  onCompanyLinkClick={(link) => openOverlay(setActiveCompanyPage, link)}
                  onResourcesLinkClick={(link) => openOverlay(setActiveResourcesPage, link)}
                  onProductLinkClick={(link) => {
                    setActiveResourcesPage(null);
                    openOverlay(setActiveFooterPage, link);
                  }}
                />
              )
            )}
          </AnimatePresence>

          {/* ── Floating Message Widget — ONLY on landing page ── */}
          {!activeFooterPage && !activeCompanyPage && !activeResourcesPage && (
            <FloatingMessageWidget onOpen={() => { setLoginIntent('aichat'); setShowAuth(true); }} />
          )}
        </>
      )}
    </div>
  );
}

/* ── Sleek Floating Message Trigger Widget ── */
function FloatingMessageWidget({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-6 right-6 z-[9999] group flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#10b981] text-[#0a2617] font-extrabold text-xs uppercase tracking-wider shadow-2xl border border-white/30 hover:bg-white hover:text-[#0a2617] transition-all duration-300 cursor-pointer active:scale-95"
      aria-label="Talk to Zeni AI"
    >
      <div className="relative flex items-center justify-center">
        <MessageCircle className="w-5 h-5 text-[#0a2617] group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
      </div>
      <span className="font-sans font-extrabold text-xs tracking-wider">Talk to Zeni</span>
    </button>
  );
}
