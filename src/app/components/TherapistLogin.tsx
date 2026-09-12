import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../api/client';
import logo from '../../../asset/logo.png';

export default function TherapistLogin({ onBackHome, onAuthSuccess }: { onBackHome: () => void; onAuthSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email') || '');
    const password = String(f.get('password') || '');
    if (!email || !password) { setError('Please fill in both fields.'); return; }
    setLoading(true); setError('');
    try {
      await apiFetch('/therapist/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or account suspended.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4faf7] text-[#0a2617] font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* ── STICKY TOP NAV BAR (LANDING PAGE STYLE) ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#0d5d3a]/15 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onBackHome}>
          <img src={logo} alt="ZenMind" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl tracking-tight text-[#0d5d3a]" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
            ZenMind
          </span>
          <span className="hidden sm:inline-block text-xs font-extrabold text-[#78350f] bg-[#fef3c7] border border-[#fde68a] px-2.5 py-0.5 rounded-full">
            Therapist Clinical Portal
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

      {/* ── MAIN THERAPIST LOGIN CARD (GOOGLE MATERIAL YOU) ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="bg-white rounded-[28px] border-2 border-[#0d5d3a]/15 shadow-2xl p-6 sm:p-10 max-w-md w-full mx-auto relative overflow-hidden">
          
          {/* Top Brand Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#e6f4ea] border-2 border-[#0d5d3a]/20 text-[#0d5d3a] flex items-center justify-center mx-auto mb-4 ring-4 ring-[#d97706]/20 shadow-xs">
              <Stethoscope className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d5d3a]" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
              Therapist Desk
            </h1>
            <p className="text-xs font-semibold text-[#d97706] mt-1">
              Sign in to manage your clinical sessions and clients
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-[#0d5d3a] mb-1.5 uppercase tracking-wider">Clinical Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#0d5d3a] absolute left-3.5 top-3.5" />
                <input
                  name="email"
                  type="email"
                  placeholder="therapist@zenmind.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 bg-white font-semibold text-sm text-[#0a2617] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0d5d3a] mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#0d5d3a] absolute left-3.5 top-3.5" />
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 bg-white font-semibold text-sm text-[#0a2617] outline-none"
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-3.5 text-[#0d5d3a]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#0d5d3a] hover:bg-[#084229] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating…' : 'Sign In to Clinical Desk'}
            </button>
          </form>

          <p className="text-[11px] font-semibold text-gray-500 text-center mt-6">
            Accounts issued and verified by ZenMind Administration
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs font-semibold text-[#0d5d3a]/60">
        © {new Date().getFullYear()} ZenMind Health. All rights reserved.
      </footer>
    </div>
  );
}
