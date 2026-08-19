import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Orbit, Lock, TrendingUp, Cpu, Globe2,
  ShieldCheck, ArrowLeft
} from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm.jsx';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

const STATS = [
  { value: '₹2.4B+', label: 'AUM Tracked' },
  { value: '50K+', label: 'Active Investors' },
  { value: '99.97%', label: 'Uptime Reliability' },
];

const HIGHLIGHTS = [
  { icon: Cpu, title: 'Gemini AI Copilot', desc: 'Autonomous transaction auto-tagging & real-time insights.', color: 'text-emerald-400' },
  { icon: TrendingUp, title: 'AI Expense Prediction', desc: 'Multi-scale adaptive ML forecasting & safe budget buffer.', color: 'text-teal-400' },
  { icon: Globe2, title: 'RBI-Compliant AA API', desc: 'Bank-grade encrypted aggregator sync across Indian banks.', color: 'text-cyan-400' },
];

// Flawless, Glitch-Free Live Conic Edge Light Card Wrapper
const LiveEdgeCard = ({ children, className = '' }) => {
  const [angle, setAngle] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    let lastTime = performance.now();
    const animate = (now) => {
      const delta = now - lastTime;
      lastTime = now;
      setAngle((prev) => (prev + delta * 0.08) % 360);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      className={`relative rounded-3xl p-[2px] transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.3)] ${className}`}
      style={{
        background: `conic-gradient(from ${angle}deg, #10B981 0%, #2DD4BF 25%, #00F2FE 50%, #27272A 75%, #10B981 100%)`,
      }}
    >
      <div className="rounded-[22px] bg-[#09090B] p-4 sm:p-6 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
};

export const Login = () => (
  <div className="min-h-screen lg:h-screen flex items-center justify-center bg-[#000000] p-4 sm:p-6 lg:p-8 overflow-hidden">
    {/* Background Ambient Glow */}
    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[200px]" />

    {/* ── UNIFIED NO-SCROLL LAYOUT CONTAINER (NO CENTRAL DIVIDER LINE) ── */}
    <div className="relative z-10 w-full max-w-[1260px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 h-full max-h-[820px]">

      {/* ── LEFT SIDE: SIGN IN FORM CARD WITH LIVE CIRCULATING CONIC EDGE LIGHT ── */}
      <div className="w-full lg:w-[46%] xl:w-[44%] flex items-center justify-center">
        <div className="w-full max-w-md">
          
          {/* Mobile Header Logo */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Orbit className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-black text-sm text-white font-outfit">
                {APP_CONSTANTS.APP_NAME}
              </span>
            </Link>

            <Link to={ROUTES.AUTH.REGISTER} className="text-xs font-semibold text-emerald-400 hover:underline">
              Sign Up
            </Link>
          </div>

          {/* ── SIGN IN FORM CARD (CIRCULATING LIVE CONIC EDGE LIGHT) ── */}
          <LiveEdgeCard>
            <LoginForm />
          </LiveEdgeCard>

        </div>
      </div>

      {/* ── RIGHT SIDE: BRANDING & FEATURES (FITS 100% IN VIEWPORT, ZERO SCROLL) ── */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[56%] flex-col justify-between h-full max-h-[740px] p-4 sm:p-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between shrink-0 mb-2">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-3 group w-fit">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Orbit className="w-4.5 h-4.5 text-slate-950" />
            </div>
            <span className="font-black text-base text-white tracking-tight font-outfit">
              {APP_CONSTANTS.APP_NAME}
            </span>
          </Link>

          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Back to Landing</span>
          </Link>
        </div>

        {/* Compact Hero Content (Zero Scroll Overflow) */}
        <div className="my-auto space-y-5 max-w-xl">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI Wealth Intelligence Platform</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-outfit font-black text-white leading-tight tracking-tight">
              Where Wealth Meets <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>

            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              The institutional-grade financial OS trusted by 50,000+ professionals across India. AI-driven, bank-secured, and built for growth.
            </p>
          </div>

          {/* Compact 3 Highlights */}
          <div className="space-y-2.5">
            {HIGHLIGHTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#09090B] border border-zinc-800/80 hover:border-emerald-500/30 transition-all"
                >
                  <div className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 ${item.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-outfit">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 font-medium leading-normal mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Stat Row */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
            {STATS.map((stat, i) => (
              <div key={i}>
                <p className="text-lg xl:text-xl font-outfit font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 shrink-0">
          <span>© 2026 {APP_CONSTANTS.APP_NAME}</span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit AES Encrypted</span>
          </span>
        </div>
      </div>

    </div>
  </div>
);

export default Login;
