'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';

/* ─── Data ─── */
const roleHomes: Record<Role, string> = {
  OFFICER:         '/officer',
  MANAGER:         '/manager',
  GENERAL_MANAGER: '/gm',
};

const roles: { key: Role; title: string; sub: string }[] = [
  { key: 'OFFICER',         title: 'Factory Officer',  sub: 'Monitor sensors · edit GLP'  },
  { key: 'MANAGER',         title: 'Factory Manager',  sub: 'Track revenue · set price'   },
  { key: 'GENERAL_MANAGER', title: 'General Manager',  sub: 'Compare all factories'        },
];

const slides = [
  {
    img:    '/images/leaf1.jpg',
    quote:  '"The finest teas are born from patience — every leaf tells the story of its fermentation."',
    author: 'Spectraleaf',
    role:   'Fermentation Intelligence',
    sub:    'Precision IoT monitoring for every cycle.',
  },
  {
    img:    '/images/leaf2.jpg',
    quote:  '"Real-time data turns instinct into certainty — measure every degree, every second."',
    author: 'Spectraleaf',
    role:   'IoT Tea Monitoring',
    sub:    'Sensor-driven decisions on the factory floor.',
  },
  {
    img:    '/images/leaf3.jpg',
    quote:  '"From leaf to cup, quality begins in the fermentation chamber — trust the data."',
    author: 'Spectraleaf',
    role:   'Quality Intelligence',
    sub:    'GLP analytics that protect your batch value.',
  },
];

/* ─── Page ─── */
export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email,    setEmail]    = useState('officer@spectraleaf.io');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(true);
  const [role,     setRole]     = useState<Role>('OFFICER');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  /* Slideshow */
  const [current, setCurrent] = useState(0);
  const [prev,    setPrev]    = useState<number | null>(null);
  const [fading,  setFading]  = useState(false);

  const goTo = useCallback((next: number) => {
    setPrev(current);
    setFading(true);
    setTimeout(() => {
      setCurrent(next);
      setFading(false);
      setPrev(null);
    }, 600);
  }, [current]);

  useEffect(() => {
    const id = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 3000);
    return () => clearInterval(id);
  }, [current, goTo]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setAuth(role, 'FAC001', ['FAC001', 'FAC002']);
      router.push(roleHomes[role]);
    }, 600);
  }

  const slide = slides[current];

  return (
    /* Lock to viewport — no scroll */
    <div className="h-screen w-screen flex overflow-hidden bg-white">

      {/* ══ LEFT: Form (fixed 46%) ══ */}
      <div className="w-full lg:w-[46%] h-full flex flex-col px-10 sm:px-16 py-8 overflow-y-auto">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#15803D]">
            <img src="/images/Logo.png" alt="Spectraleaf" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-semibold text-[16px] text-slate-800 tracking-tight">Spectraleaf</span>
        </div>

        {/* Centre the form vertically */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[360px]">

            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight mb-1">Welcome Back</h1>
            <p className="text-[14px] text-slate-500 mb-7">Welcome back! please enter your details.</p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full h-11 px-3.5 border border-slate-200 rounded-lg text-[14px] text-slate-900
                    placeholder:text-slate-400 focus:outline-none focus:border-[#15803D]
                    focus:ring-2 focus:ring-[#15803D]/10 bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full h-11 px-3.5 pr-11 border border-slate-200 rounded-lg text-[14px] text-slate-900
                      placeholder:text-slate-400 focus:outline-none focus:border-[#15803D]
                      focus:ring-2 focus:ring-[#15803D]/10 bg-white transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <button type="button" className="text-[13px] text-[#15803D] hover:underline font-medium">
                    Forget your password
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-2">Role</label>
                <div className="space-y-2">
                  {roles.map((r) => {
                    const active = role === r.key;
                    return (
                      <button key={r.key} type="button" onClick={() => setRole(r.key)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                          active ? 'border-[#15803D] bg-[#F0FDF4]' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          active ? 'border-[#15803D]' : 'border-slate-300'
                        }`}>
                          {active && <div className="w-2 h-2 rounded-full bg-[#15803D]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-semibold ${active ? 'text-[#166534]' : 'text-slate-700'}`}>
                            {r.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{r.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <button type="button" onClick={() => setRemember(!remember)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                    remember ? 'bg-[#15803D] border-[#15803D]' : 'border-slate-300'
                  }`}>
                  {remember && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
                <span className="text-[13px] text-slate-600">Remember me</span>
              </div>

              {error && (
                <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full h-11 rounded-xl text-white font-semibold text-[15px] transition-all
                  disabled:opacity-70 flex items-center justify-center gap-2 bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D]">
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Signing in…
                  </>
                ) : 'Log In'}
              </button>
            </form>

            <p className="text-center text-[13px] text-slate-500 mt-6">
              Don&apos;t have an account?{' '}
              <button type="button" className="text-[#15803D] font-semibold hover:underline">
                Sign up
              </button>
            </p>

          </div>
        </div>

        {/* Copyright */}
        <div className="text-[12px] text-slate-400 shrink-0">Copyright © 2025</div>
      </div>

      {/* ══ RIGHT: Slideshow (54%) ══ */}
      <div className="hidden lg:block flex-1 h-full relative overflow-hidden rounded-l-[32px]">

        {/* Image layers — crossfade */}
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${s.img})`,
              opacity:
                i === current ? (fading ? 0 : 1) :
                i === prev    ? (fading ? 1 : 0) : 0,
              transition: 'opacity 600ms ease-in-out',
              zIndex: i === current ? 2 : i === prev ? 1 : 0,
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.78) 100%)' }}
        />

        {/* Quote + controls */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-10">
          <blockquote
            key={current}
            className="text-white font-bold leading-[1.38] mb-5 max-w-[500px]"
            style={{ fontSize: 'clamp(17px, 2vw, 22px)' }}
          >
            {slide.quote}
          </blockquote>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-white font-semibold text-[15px]">{slide.author}</div>
              <div className="text-white/65 text-[13px] mt-0.5">{slide.role}</div>
              <div className="text-white/45 text-[12px] mt-0.5">{slide.sub}</div>
            </div>

            {/* Dot indicators + arrows */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`rounded-full transition-all ${
                      i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goTo((current - 1 + slides.length) % slides.length)}
                  className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center
                    text-white/70 hover:bg-white/15 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <button
                  onClick={() => goTo((current + 1) % slides.length)}
                  className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center
                    text-white/70 hover:bg-white/15 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
