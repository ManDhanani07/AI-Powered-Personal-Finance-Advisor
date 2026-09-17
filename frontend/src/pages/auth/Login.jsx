import React from 'react';
import { Link } from 'react-router-dom';
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

// Elegant Static Card with subtle glow and crisp gradient border (zero animation, zero movement)
const StaticCard = ({ children, className = '' }) => (
  <div
    className={`relative rounded-3xl p-[1px] bg-gradient-to-b from-emerald-500/40 via-zinc-800 to-zinc-800/80 shadow-[0_0_35px_rgba(16,185,129,0.12)] ${className}`}
  >
    <div className="rounded-[23px] bg-[#09090B] p-5 sm:p-6 lg:py-5 lg:px-6 backdrop-blur-xl">
      {children}
    </div>
  </div>
);

export const Login = () => (
  <div className="min-h-screen lg:h-screen flex flex-col bg-[#000000] p-4 sm:p-6 lg:pt-7 lg:pb-6 lg:px-8 xl:px-14 overflow-y-auto lg:overflow-hidden select-none">
    {/* Background Ambient Glow */}
    <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-emerald-500/5 blur-[200px]" />

    <div className="relative z-10 w-full max-w-[1240px] mx-auto flex flex-col">
      {/* ── TOP HEADER BAR (FULL-WIDTH ALIGNMENT: LOGO LEFT, BACK TO LANDING RIGHT) ── */}
      <header className="w-full flex items-center justify-between shrink-0 mb-6 lg:mb-8">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5 group w-fit">
          <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Orbit className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-black text-sm xl:text-base text-white tracking-tight font-outfit" style={{ color: '#FFFFFF' }}>
            {APP_CONSTANTS.APP_NAME}
          </span>
        </Link>

        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Back to Landing</span>
        </Link>
      </header>

      {/* ── MAIN CONTENT (2 COLUMNS: PERFECT TOP ALIGNMENT) ── */}
      <main className="w-full flex flex-col lg:flex-row-reverse items-start justify-between gap-8 lg:gap-12 xl:gap-16">

        {/* ── RIGHT SIDE (DESKTOP): SIGN IN FORM CARD ── */}
        <div className="w-full lg:w-[45%] xl:w-[42%] flex items-start justify-center">
          <div className="w-full max-w-md">
            <StaticCard>
              <LoginForm />
            </StaticCard>
          </div>
        </div>

        {/* ── LEFT SIDE (DESKTOP): BRANDING & FEATURES ── */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] flex-col space-y-4 xl:space-y-5">
          
          {/* Compact Hero Content */}
          <div className="space-y-3 xl:space-y-3.5 max-w-xl">
            <div className="space-y-1.5 xl:space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI Wealth Intelligence Platform</span>
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-outfit font-black text-white leading-tight tracking-tight">
                Where Wealth Meets <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Intelligence
                </span>
              </h1>

              <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-lg">
                The institutional-grade financial OS trusted by 50,000+ professionals across India. AI-driven, bank-secured, and built for growth.
              </p>
            </div>

            {/* Compact 3 Highlights */}
            <div className="space-y-2 xl:space-y-2.5">
              {HIGHLIGHTS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 xl:p-2.5 rounded-xl bg-[#09090B] border border-zinc-800/80 hover:border-emerald-500/30 transition-all"
                  >
                    <div className={`p-1.5 xl:p-2 rounded-lg bg-zinc-900 border border-zinc-800 ${item.color} shrink-0`}>
                      <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
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
            <div className="flex items-center justify-between pt-2.5 xl:pt-3 border-t border-zinc-800/60">
              {STATS.map((stat, i) => (
                <div key={i}>
                  <p className="text-base xl:text-xl font-outfit font-black text-white tracking-tight">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* ── FOOTER (FULL-WIDTH ACROSS BOTTOM, NO CUTOFF) ── */}
      <footer className="w-full flex items-center justify-between text-[11px] text-slate-500 pt-4 mt-6 lg:mt-8 border-t border-zinc-900 shrink-0">
        <span>© 2026 {APP_CONSTANTS.APP_NAME}</span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit AES Encrypted</span>
        </span>
      </footer>
    </div>
  </div>
);

export default Login;
