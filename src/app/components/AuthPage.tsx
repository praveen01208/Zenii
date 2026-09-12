import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, ShieldCheck, Smartphone } from 'lucide-react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import logo from '../../../asset/logo.png';

type AuthPageProps = { onBackHome: () => void; onAuthSuccess: () => void; };

export default function AuthPage({ onBackHome, onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      onAuthSuccess();
    }
  }, [isLoaded, isSignedIn, onAuthSuccess]);

  const clerkAppearance = {
    layout: {
      socialButtonsPlacement: 'top' as const,
      showOptionalFields: false,
    },
    variables: {
      colorPrimary: '#0d5d3a',
      colorText: '#0a2617',
      colorBackground: '#ffffff',
      borderRadius: '1rem',
      fontFamily: 'Google Sans, Inter, sans-serif',
    },
    elements: {
      rootBox: "w-full max-w-[540px] mx-auto",
      card: "shadow-none border-0 p-0 bg-transparent w-full",
      header: "mb-4",
      headerTitle: "text-2xl sm:text-3xl font-extrabold text-[#0d5d3a] tracking-tight",
      headerSubtitle: "text-xs sm:text-sm text-[#0a2617]/70 font-semibold",
      socialButtonsBlockButton: "border-2 border-[#0d5d3a]/15 hover:bg-[#e6f4ea] hover:border-[#0d5d3a]/30 rounded-2xl h-12 text-[#0a2617] font-bold text-xs transition-all shadow-xs",
      socialButtonsBlockButtonText: "font-bold text-xs text-[#0a2617]",
      dividerRow: "my-4",
      dividerText: "text-xs font-bold text-[#0d5d3a]/60 uppercase tracking-widest",
      dividerLine: "bg-[#0d5d3a]/15",
      formButtonPrimary: "bg-[#0d5d3a] hover:bg-[#084229] text-sm font-bold uppercase tracking-wider rounded-2xl h-12 text-white transition-all shadow-md mt-4",
      formFieldInput: "rounded-2xl border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 text-[#0a2617] h-12 px-4 font-semibold text-xs transition-all",
      formFieldLabel: "text-xs font-bold text-[#0a2617]/80 uppercase tracking-wider mb-1",
      footerActionLink: "text-[#0d5d3a] font-bold hover:underline",
      identityPreviewText: "text-[#0a2617] font-semibold",
      identityPreviewEditButton: "text-[#0d5d3a] font-bold hover:underline",
      formHeaderTitle: "text-xl font-bold text-[#0d5d3a]",
      formHeaderSubtitle: "text-xs text-[#0a2617]/70 font-medium",
    }
  };

  return (
    <section className="min-h-screen bg-[#f4faf7] text-[#0a2617] antialiased flex flex-col justify-between font-sans overflow-x-hidden">
      
      {/* ── STICKY TOP NAV BAR ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#0d5d3a]/15 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onBackHome}>
          <img src={logo} alt="ZenMind" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl tracking-tight text-[#0d5d3a]" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            ZenMind
          </span>
          <span className="hidden sm:inline-block text-xs font-extrabold text-[#78350f] bg-[#fef3c7] border border-[#fde68a] px-2.5 py-0.5 rounded-full">
            User Sanctuary
          </span>
        </div>

        <button
          type="button"
          onClick={onBackHome}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#0d5d3a]/20 text-[#0d5d3a] hover:bg-[#e6f4ea] font-bold text-xs uppercase tracking-wider transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* ── MAIN SPLIT-SCREEN AUTH CONTAINER (SOLACE UI STYLE IN GREEN, WHITE & GOLD) ── */}
      <main className="flex-1 p-3 sm:p-6 flex items-center justify-center my-2">
        <div className="grid w-full max-w-7xl gap-6 lg:grid-cols-[0.98fr_1.02fr] items-stretch">
          
          {/* ── LEFT COLUMN: CLERK AUTH CARD ── */}
          <div className="flex min-h-[680px] items-center rounded-3xl border-2 border-[#0d5d3a]/15 bg-white px-6 py-8 sm:px-10 lg:px-12 lg:py-12 shadow-xl relative overflow-hidden">
            <div className="mx-auto w-full max-w-[540px]">
              
              {/* Header Title */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#d97706] uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-[#d97706]" />
                  <span>ZenMind Portal</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#0d5d3a]" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
                  {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h1>
                <p className="mt-2 text-sm text-[#0a2617]/70 font-semibold">
                  {mode === 'login' ? 'Brainstorm in chat, track mood, build inner peace' : 'Join thousands starting their mindfulness journey today'}
                </p>
              </div>

              {/* Mode Selector Pill Toggle */}
              <div className="bg-[#e6f4ea] p-1 rounded-full flex gap-1 mb-6 border border-[#0d5d3a]/15">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all text-center ${
                    mode === 'login'
                      ? 'bg-[#0d5d3a] text-white shadow-xs'
                      : 'text-[#0d5d3a] hover:bg-[#d2ebd9]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all text-center ${
                    mode === 'signup'
                      ? 'bg-[#0d5d3a] text-white shadow-xs'
                      : 'text-[#0d5d3a] hover:bg-[#d2ebd9]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Clerk Embedded Component */}
              <div className="w-full flex justify-center">
                {mode === 'login' ? (
                  <SignIn
                    routing="hash"
                    appearance={clerkAppearance}
                    fallbackRedirectUrl="/"
                  />
                ) : (
                  <SignUp
                    routing="hash"
                    appearance={clerkAppearance}
                    fallbackRedirectUrl="/"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: SOLACE SHOWCASE BANNER (GREEN, GOLD & WHITE GRAIN GRADIENT) ── */}
          <div className="relative flex min-h-[500px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d5d3a] via-[#084229] to-[#042416] p-8 sm:p-12 text-white border-2 border-[#0d5d3a]/20 shadow-2xl lg:min-h-0 flex-col justify-between">
            
            {/* Ambient Gold Glow Ornaments */}
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#d97706]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[#e6f4ea]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Floating Decorative Gold Stars */}
            <div className="absolute top-8 right-12 z-10 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#fef3c7]/20 backdrop-blur-md flex items-center justify-center border border-[#fde68a]/30">
                <Sparkles className="w-4 h-4 text-[#fde68a]" />
              </div>
            </div>

            {/* Banner Top Content */}
            <div className="relative z-10 flex h-full w-full flex-col justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#fef3c7]/15 border border-[#fde68a]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#fde68a] mb-6">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Clinical Encryption & AI Companion</span>
                </div>

                <h2 className="max-w-[580px] text-4xl sm:text-5xl lg:text-[56px] lg:leading-[1.05] font-extrabold tracking-tight text-white" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
                  Think fast, <br />
                  <span className="text-[#fde68a]">Live mindfully.</span>
                </h2>

                <p className="mt-4 text-base sm:text-lg text-white/80 font-medium max-w-md leading-relaxed">
                  Your private space for AI therapy, daily mood tracking, clinical appointment booking, and wellness resources.
                </p>
              </div>

              {/* Bottom App Download CTA Pill */}
              <div className="pt-8">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("ZenMind Web & Mobile App is active on your device!"); }}
                  className="inline-flex h-14 max-w-full items-center gap-3.5 rounded-2xl border border-white/30 bg-white/10 px-6 text-sm sm:text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/50 shadow-lg"
                >
                  <Smartphone className="w-5 h-5 text-[#fde68a] shrink-0" />
                  <span className="truncate whitespace-nowrap">
                    Experience ZenMind Digital Sanctuary
                  </span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs font-semibold text-[#0d5d3a]/60">
        © {new Date().getFullYear()} ZenMind Health. All rights reserved.
      </footer>
    </section>
  );
}
