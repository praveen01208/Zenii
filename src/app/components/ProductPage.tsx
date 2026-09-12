import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, BrainCircuit, ShieldCheck, MessageSquare, HeartHandshake, Lock, 
  UserCheck, ArrowRight, ChevronDown, Activity, Users, ShoppingBag, 
  Calendar, CheckCircle, RefreshCw, Layers, Shield, Zap, Search, Send, Clock, HelpCircle, FileCode, AlertTriangle, Plus, Minus
} from 'lucide-react';
import FeaturesPage from './FeaturesPage';
import { Navbar as LandingNavbar } from './landing/Navbar';
import { Footer as LandingFooter } from './landing/Footer';
import { apiFetch } from '../api/client';

interface ProductPageProps {
  page: string;
  onClose: () => void;
  onGetStarted?: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
  onCompanyLinkClick?: (link: string) => void;
  onResourcesLinkClick?: (link: string) => void;
  onProductLinkClick?: (link: string) => void;
}

/* ═══════════════════════════════════════════════════════
   1. SYNUS-INSPIRED AI CHATBOT OVERLAY PAGE
   ═══════════════════════════════════════════════════════ */
function AIChatbotPage({
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
}: Omit<ProductPageProps, 'onClose' | 'page'>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'hindi' | 'english' | 'hinglish' | 'kannada'>('hinglish');
  const [inputMessage, setInputMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'zeni', text: 'Hey there. I\'m Zeni. Whenever your mind feels loud or you just need someone to vent to without judgment, I\'m here.' }
  ]);

  const samples = {
    hinglish: "Yaar exams ka tension bohot zyada lag raha hai, neend nahi aa rahi.",
    english: "I feel like everyone expects too much from me and I'm falling behind.",
    hindi: "मुझे बहुत चिंता हो रही है और समझ नहीं आ रहा किससे बात करूँ।",
    kannada: "ನನಗೆ ತುಂಬಾ ಒತ್ತಡ ಎನಿಸುತ್ತಿದೆ ಮತ್ತು ಏನು ಮಾಡಬೇಕೆಂದು ತಿಳಿಯುತ್ತಿಲ್ಲ."
  };

  const handleSend = (txt?: string) => {
    const msg = txt || inputMessage;
    if (!msg.trim()) return;
    setChatLog(prev => [...prev, { sender: 'user', text: msg }]);
    setInputMessage('');

    setTimeout(() => {
      setChatLog(prev => [
        ...prev,
        {
          sender: 'zeni',
          text: 'I hear how heavy that feels right now. Take a slow, deep breath with me. You don\'t have to navigate all of this pressure alone. Tell me more about what\'s weighing on you most.'
        }
      ]);
    }, 900);
  };

  return (
    <div ref={containerRef} data-lenis-prevent className="fixed inset-0 z-[200] bg-[#0a2617] text-[#fffdf5] overflow-y-auto font-sans-main scrollbar-none [&::-webkit-scrollbar]:hidden">
      <LandingNavbar
        scrollContainerRef={containerRef}
        delayReappearMs={1500}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-20 sm:pb-28 bg-[#0a2617] border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI COMPANION ARCHITECTURE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl text-white font-normal leading-[0.98] mb-6 max-w-4xl mx-auto">
            Meet Zeni: Your Private <span className="text-[#ffebc4] italic">24/7 AI Companion.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
            Attuned to adolescent emotional needs. Multi-lingual, memory-enabled, and guarded by real-time safety pipelines.
          </p>

          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-full bg-[#ffebc4] text-[#0a2617] font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-xl cursor-pointer"
          >
            START TALKING NOW →
          </button>
        </div>
      </section>

      {/* Interactive AI Sandbox Simulator */}
      <section className="py-24 bg-[#071d13] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#ffebc4] text-xs font-sans tracking-widest uppercase font-bold block mb-2">
              ✦ LIVE INTERACTIVE DEMO
            </span>
            <h2 className="text-3xl sm:text-5xl text-white font-normal">
              Try Zeni in 4 Regional Languages
            </h2>
          </div>

          {/* Language Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {(['hinglish', 'english', 'hindi', 'kannada'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => { setActiveTab(lang); setInputMessage(samples[lang]); }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  activeTab === lang
                    ? 'bg-[#ffebc4] text-[#0a2617] border-[#ffebc4]'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-[#0a2617] border border-white/15 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#10b981] animate-ping" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Zeni Active Simulator</span>
              </div>
              <span className="text-xs text-[#ffebc4] font-semibold">100% Encrypted & Anonymized</span>
            </div>

            <div className="space-y-4 min-h-[220px] max-h-[350px] overflow-y-auto pr-2">
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-md text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-white/15 text-white font-medium'
                      : 'bg-[#10b981]/20 border border-[#10b981]/30 text-[#ffebc4]'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your message to Zeni..."
                className="flex-1 bg-white/5 border border-white/15 rounded-full px-6 py-3.5 text-sm text-white focus:outline-none focus:border-[#10b981]"
              />
              <button
                onClick={() => handleSend()}
                className="px-6 py-3.5 rounded-full bg-[#10b981] text-[#0a2617] font-bold text-xs uppercase tracking-wider hover:bg-white transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter
        onGetStarted={onGetStarted}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   2. SYNUS-INSPIRED THERAPY DIRECTORY OVERLAY PAGE
   ═══════════════════════════════════════════════════════ */
function TherapyPage({
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
}: Omit<ProductPageProps, 'onClose' | 'page'>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [therapists, setTherapists] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/therapists')
      .then(res => setTherapists(res.therapists || []))
      .catch(() => {});
  }, []);

  const filterOptions = ['All', 'Adolescent CBT', 'Anxiety & Stress', 'Depression Care', 'Academic Pressure'];

  return (
    <div ref={containerRef} data-lenis-prevent className="fixed inset-0 z-[200] bg-[#0a2617] text-[#fffdf5] overflow-y-auto font-sans-main scrollbar-none [&::-webkit-scrollbar]:hidden">
      <LandingNavbar
        scrollContainerRef={containerRef}
        delayReappearMs={1500}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-20 sm:pb-28 bg-[#0a2617] border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <UserCheck className="w-3.5 h-3.5" />
            <span>VERIFIED CLINICAL CARE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl text-white font-normal leading-[0.98] mb-6 max-w-4xl mx-auto">
            When AI Isn't Enough, <span className="text-[#ffebc4] italic">People Are There.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
            Verified licensed adolescent psychotherapists, psychiatrists, and counselors for 1-on-1 online and in-person sessions.
          </p>

          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-full bg-[#ffebc4] text-[#0a2617] font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-xl cursor-pointer"
          >
            BOOK A SESSION NOW →
          </button>
        </div>
      </section>

      {/* Directory Section with Sticky Filter Bar */}
      <section className="py-24 bg-[#071d13] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          
          {/* Sticky Filter Bar */}
          <div className="sticky top-24 z-30 bg-[#0a2617]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/15 mb-12 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <span className="text-xs font-sans text-[#ffebc4] font-bold tracking-wider uppercase">Filter Specialization:</span>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSelectedFilter(opt)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    selectedFilter === opt
                      ? 'bg-[#10b981] text-[#0a2617] border-[#10b981]'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {therapists.length > 0 ? (
              therapists.map((t, idx) => (
                <motion.div
                  key={t._id || idx}
                  whileHover={{ y: -8 }}
                  className="p-6 rounded-[2.5rem] bg-[#0a2617] border border-white/15 shadow-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 rounded-2xl bg-white/10 mb-6 overflow-hidden relative">
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#ffebc4]">
                          {t.name ? t.name.charAt(0) : 'T'}
                        </div>
                      )}
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#10b981] text-[#0a2617] text-[10px] font-black uppercase">
                        Verified Expert
                      </span>
                    </div>

                    <h3 className="text-2xl text-white font-normal mb-1">{t.name}</h3>
                    <p className="text-xs text-[#ffebc4] font-semibold mb-4">{t.specialty || 'Psychotherapist'} • {t.experienceYears || '10+'} Yrs Exp</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-6">{t.bio || 'Specializes in adolescent mental wellness, stress management, and cognitive behavioral therapy.'}</p>
                  </div>

                  <button
                    onClick={onGetStarted}
                    className="w-full py-3.5 rounded-full bg-[#ffebc4] text-[#0a2617] font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-md cursor-pointer"
                  >
                    BOOK SESSION (₹{t.sessionFee || '1,200'}) →
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 p-8 rounded-[2.5rem] bg-[#0a2617] border border-white/15">
                <h3 className="text-2xl text-white mb-2">Verified Psychotherapist Directory</h3>
                <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
                  Online and offline appointment booking with licensed clinical counselors.
                </p>
                <button onClick={onGetStarted} className="px-6 py-3 rounded-full bg-[#ffebc4] text-[#0a2617] font-bold text-xs uppercase cursor-pointer">
                  Book Therapist Session →
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      <LandingFooter
        onGetStarted={onGetStarted}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3. FULL-SCREEN FAQ OVERLAY PAGE — ACCORDION PATTERN
   ═══════════════════════════════════════════════════════ */

const faqItems = [
  {
    id: "01",
    title: "What is ZenMind?",
    content: "ZenMind is a comprehensive mental wellness platform that combines AI-powered conversation therapy with verified human therapists. Built for college students, professionals, and anyone seeking accessible mental health support, ZenMind provides 24/7 AI companionship, mood tracking, peer circles, and on-demand human therapy sessions — all in one secure space.",
    services: "AI Chat Therapy, Human Therapy Sessions, Mood Tracking, Peer Circles, Wellness Programs, Crisis Support, Resource Hub",
  },
  {
    id: "02",
    title: "Is my conversation with Zeni private?",
    content: "Yes, 100%. All chat logs are anonymized and end-to-end encrypted. We never sell or share your personal emotional data. ZenMind is HIPAA-aligned and follows strict data protection protocols. Your therapy sessions, mood entries, and personal insights are stored securely and accessible only to you and your chosen therapist.",
    services: "End-to-End Encryption, Data Anonymization, HIPAA Alignment, Secure Storage, Privacy Controls, Data Deletion Rights",
  },
  {
    id: "03",
    title: "How does Zeni handle crisis situations?",
    content: "ZenMind runs an independent background safety pipeline that detects risk signals in real-time. When critical emotional distress is identified, the system immediately connects you with crisis helpline numbers (iCall: 9152987821, Vandrevala Foundation: 1860-2662-345) and licensed human therapists. Our AI never replaces professional help — it bridges the gap until expert care is available.",
    services: "Crisis Detection Pipeline, Emergency Helpline Integration, Real-Time Risk Assessment, Therapist Escalation, Safety Protocols, 24/7 Monitoring",
  },
  {
    id: "04",
    title: "What languages can I speak with Zeni in?",
    content: "Zeni fluently understands and responds in English, Hindi, Hinglish, and Kannada. Our AI is trained to pick up colloquial expressions, regional nuances, and code-switching patterns that are natural in Indian conversations. We're continuously expanding language support to make mental health care accessible to everyone.",
    services: "Multilingual AI, English Support, Hindi Support, Hinglish Support, Kannada Support, Regional Language Expansion",
  },
  {
    id: "05",
    title: "How do I book a session with a human therapist?",
    content: "Navigate to the Therapy Desk from your dashboard, browse verified practitioners filtered by specialization (anxiety, depression, relationships, career stress, etc.), select your preferred time slot, and confirm your booking — online or offline. You'll receive session prep cards before each appointment and post-session insights after.",
    services: "Therapist Directory, Specialization Filters, Online/Offline Booking, Session Prep Cards, Post-Session Insights, Therapist Matching",
  },
  {
    id: "06",
    title: "Is ZenMind free to use?",
    content: "ZenMind offers a generous free tier with 40 AI chat credits per month, basic mood logging, and peer circle access. For unlimited AI conversations, advanced analytics, and therapy session discounts, we offer affordable premium plans designed specifically for students. Our mission is to make mental health support accessible — cost should never be a barrier.",
    services: "Free Tier, Student Pricing, AI Chat Credits, Mood Analytics, Premium Features, Therapy Discounts",
  },
  {
    id: "07",
    title: "Who built ZenMind?",
    content: "ZenMind was built by a passionate team of students and mental health advocates headquartered at KLE Centre for Engineering and Technology (KLECET), Chikodi, Karnataka, India. We believe that technology can bridge the gap in mental healthcare accessibility, especially for young people in India who face unique pressures but lack affordable support options.",
    services: "Student-Built Platform, KLECET Chikodi, Mental Health Advocacy, Indian Youth Focus, Affordable Care Mission, Community-Driven Development",
  },
  {
    id: "08",
    title: "How can I reach the ZenMind team?",
    content: "We'd love to hear from you! Reach us via email at support@zenmind.in, call our toll-free helpline at 1800-599-0019 (available 24/7), or use the Contact Us form on our website. Whether it's feedback, partnership inquiries, technical issues, or just a friendly hello — we're always here to listen.",
    services: "Email Support, Toll-Free Helpline, Contact Form, Partnership Inquiries, Technical Support, Feedback Channel",
  },
];

function FAQPage({
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
}: Omit<ProductPageProps, 'onClose' | 'page'>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>("01");

  // Inject FAQPage Schema for AEO, Perplexity, and Google AI Overviews
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.title,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${item.content} (Related services: ${item.services})`
        }
      }))
    };

    let script = document.getElementById('zenmind-faq-schema') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'zenmind-faq-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqSchema);

    return () => {
      const el = document.getElementById('zenmind-faq-schema');
      if (el) el.remove();
    };
  }, []);

  return (
    <div ref={containerRef} data-lenis-prevent className="fixed inset-0 z-[200] bg-[#f8fdf9] text-[#0a2617] overflow-y-auto font-sans-main scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <LandingNavbar
        scrollContainerRef={containerRef}
        delayReappearMs={1500}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-20 bg-[#0a2617] text-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#ffebc4] text-xs font-sans tracking-[0.2em] uppercase font-bold mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl text-white font-extrabold leading-[0.98] mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            Frequently Asked <span className="text-[#ffebc4] italic font-normal">Questions.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about ZenMind, our AI companion Zeni, therapy sessions, and privacy.
          </p>
        </div>
      </section>

      {/* Full-width Accordion Section — Directly on section, NO card container */}
      <section className="relative bg-[#f8fdf9] min-h-[60vh] py-16 sm:py-24 border-t border-[#0d5d3a]/15">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

          {/* Accordion List directly on section */}
          <div className="w-full border-t border-b border-[#0d5d3a]/20 divide-y divide-[#0d5d3a]/15">
            {faqItems.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className={`transition-colors duration-300 ${isOpen ? 'bg-[#0d5d3a]/5' : 'hover:bg-[#0d5d3a]/[0.02]'}`}
                >
                  {/* Trigger */}
                  <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full flex items-center justify-between gap-4 py-7 sm:py-9 text-left cursor-pointer transition-all duration-300 hover:no-underline bg-transparent border-0 px-2 sm:px-4"
                  >
                    {/* Number + Title */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-[#d97706] tracking-wider font-sans shrink-0">{item.id}</span>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#0a2617] tracking-tight">{item.title}</h3>
                    </div>

                    {/* Plus / Minus Icon */}
                    <div className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      isOpen
                        ? 'bg-[#d97706] text-white shadow-md shadow-[#d97706]/30'
                        : 'bg-[#0d5d3a]/10 text-[#0d5d3a]'
                    }`}>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0, opacity: isOpen ? 0 : 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute"
                      >
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.div>
                      <motion.div
                        animate={{ rotate: isOpen ? 0 : -180, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute"
                      >
                        <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 sm:pb-10 pt-2 px-2 sm:px-4 pl-8 sm:pl-14">
                          <div className="grid gap-8 lg:grid-cols-12 items-start">
                            {/* Answer */}
                            <div className="lg:col-span-7">
                              <p className="text-base sm:text-lg text-[#0a2617]/85 leading-relaxed font-normal">
                                {item.content}
                              </p>
                            </div>

                            {/* Related Services */}
                            <div className="lg:col-span-5 space-y-2 lg:pl-8 border-l-0 lg:border-l border-[#0d5d3a]/15">
                              <p className="text-[10px] sm:text-xs font-bold text-[#0d5d3a] tracking-[0.15em] uppercase">RELATED SERVICES</p>
                              <p className="text-xs sm:text-sm text-[#0a2617]/70 leading-relaxed font-medium">
                                {item.services}
                              </p>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="mt-8 flex justify-end">
                            <button
                              onClick={() => onResourcesLinkClick?.('Contact Us')}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0d5d3a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#084229] transition-all cursor-pointer shadow-md"
                            >
                              <Send className="w-3.5 h-3.5 text-[#fde68a]" />
                              <span>Reach out support@zenmind.in</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-sm text-[#0a2617]/70 font-semibold mb-4">Still have questions?</p>
            <button
              onClick={() => onResourcesLinkClick?.('Contact Us')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0d5d3a] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#084229] transition-all cursor-pointer shadow-lg"
            >
              <Send className="w-4 h-4 text-[#fde68a]" />
              <span>Contact ZenMind Support</span>
            </button>
          </div>
        </div>
      </section>

      <div className="bg-[#0a2617]">
        <LandingFooter
          onGetStarted={onGetStarted}
          onTherapistLoginTrigger={onTherapistLoginTrigger}
          onCompanyLinkClick={onCompanyLinkClick}
          onResourcesLinkClick={onResourcesLinkClick}
          onProductLinkClick={onProductLinkClick}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PRODUCT PAGE OVERLAY ROUTER
   ═══════════════════════════════════════════════════════ */
export default function ProductPage({
  page,
  onClose,
  onGetStarted,
  onAdminLoginTrigger,
  onTherapistLoginTrigger,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onProductLinkClick,
}: ProductPageProps) {
  if (page === 'Features') {
    return (
      <FeaturesPage
        onClose={onClose}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    );
  }

  if (page === 'AI Chatbot') {
    return (
      <AIChatbotPage
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    );
  }

  if (page === 'Therapy') {
    return (
      <TherapyPage
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    );
  }

  if (page === 'FAQ') {
    return (
      <FAQPage
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    );
  }

  // Fallback for contact / docs pages
  return (
    <div data-lenis-prevent className="fixed inset-0 z-[200] bg-[#0a2617] text-[#fffdf5] overflow-y-auto font-sans-main scrollbar-none [&::-webkit-scrollbar]:hidden">
      <LandingNavbar
        delayReappearMs={1500}
        onGetStarted={onGetStarted}
        onAdminLoginTrigger={onAdminLoginTrigger}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />

      <div className="max-w-4xl mx-auto py-40 px-6 text-center">
        <h2 className="text-4xl text-white font-normal mb-4">{page}</h2>
        <p className="text-white/70 mb-8">This page is managed by ZenMind digital health services.</p>
        <button onClick={onGetStarted} className="px-6 py-3 rounded-full bg-[#ffebc4] text-[#0a2617] font-bold text-xs uppercase">
          Back to Sanctuary →
        </button>
      </div>

      <LandingFooter
        onGetStarted={onGetStarted}
        onTherapistLoginTrigger={onTherapistLoginTrigger}
        onCompanyLinkClick={onCompanyLinkClick}
        onResourcesLinkClick={onResourcesLinkClick}
        onProductLinkClick={onProductLinkClick}
      />
    </div>
  );
}
