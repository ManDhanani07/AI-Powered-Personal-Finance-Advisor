import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Orbit, Lock, ShieldCheck, ArrowLeft,
  BrainCircuit, LineChart, Zap
} from 'lucide-react';
import RegisterForm from '../../components/auth/RegisterForm.jsx';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

const HIGHLIGHTS = [
  {
    icon: BrainCircuit,
    title: 'Gemini AI Copilot',
    desc: 'Autonomous transaction auto-tagging & real-time insights.',
    color: 'text-emerald-400',
  },
  {
    icon: LineChart,
    title: 'AI Expense Prediction',
    desc: 'Multi-scale adaptive ML forecasting & safe budget buffer.',
    color: 'text-teal-400',
  },
  {
    icon: Zap,
    title: 'Smart Transaction Importer',
    desc: 'Seamlessly upload CSV statements or log income & expenses.',
    color: 'text-cyan-400',
  },
];

const STATS = [
  { value: '₹2.4B+', label: 'AUM Tracked' },
  { value: '50K+', label: 'Active Investors' },
  { value: '31%', label: 'Avg Spend Reduction' },
];

// Flawless, ultra-smooth Live Running Edge Light Card (Direct DOM rotation, 0 React re-renders)
const LiveEdgeCard = ({ children, className = '' }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    let angle = 0;
    let lastTime = performance.now();
    let animId;

    const animate = (now) => {
      const delta = now - lastTime;
      lastTime = now;
      angle = (angle + delta * 0.075) % 360;
      if (cardRef.current) {
        cardRef.current.style.background = `conic-gradient(from ${angle}deg, #10B981 0%, #2DD4BF 25%, #00F2FE 45%, rgba(39, 39, 42, 0.45) 70%, #10B981 100%)`;
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative rounded-3xl p-[2px] transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.3)] ${className}`}
      style={{
        background: `conic-gradient(from 0deg, #10B981 0%, #2DD4BF 25%, #00F2FE 45%, rgba(39, 39, 42, 0.45) 70%, #10B981 100%)`,
      }}
    >
      <div className="rounded-[22px] bg-[#09090B] p-5 sm:p-6 lg:py-5 lg:px-6 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
};

export const Register = () => (
  <div className="min-h-screen w-full flex flex-col bg-[#000000] p-4 sm:p-6 lg:py-5 lg:px-8 xl:px-14 overflow-y-auto select-none">
    {/* Background Ambient Glow */}
    <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-emerald-500/5 blur-[200px]" />

    <div className="relative z-10 w-full max-w-[1240px] mx-auto min-h-full lg:h-full flex flex-col justify-between">
      {/* ── TOP HEADER BAR (FULL-WIDTH ALIGNMENT: LOGO LEFT, BACK TO LANDING RIGHT) ── */}
      <header className="w-full flex items-center justify-between shrink-0">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Orbit className="w-4 h-4 xl:w-5 xl:h-5" />
          </div>
          <span className="font-outfit font-black text-sm xl:text-lg text-white tracking-tight" style={{ color: '#FFFFFF' }}>
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

      {/* ── MAIN CONTENT (2 COLUMNS: VERTICALLY BALANCED, RIGHT FORM FLUSH RIGHT) ── */}
      <main className="w-full my-auto flex flex-col lg:flex-row-reverse items-center justify-between gap-8 lg:gap-12 xl:gap-16 py-3">

        {/* ── RIGHT SIDE (DESKTOP): SIGNUP FORM CARD (FLUSH RIGHT WITH BACK TO LANDING) ── */}
        <div className="w-full lg:w-[45%] xl:w-[42%] flex items-center justify-end">
          <div className="w-full max-w-md">
            <LiveEdgeCard>
              <RegisterForm />
            </LiveEdgeCard>
          </div>
        </div>

        {/* ── LEFT SIDE (DESKTOP): BRANDING & FEATURES ── */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] flex-col space-y-4 xl:space-y-5">
          
          {/* Compact Hero Content */}
          <div className="space-y-3 xl:space-y-3.5 max-w-xl">
            <div className="space-y-1.5 xl:space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Industry-Standard 256-Bit Encrypted OS</span>
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-outfit font-black text-white leading-tight tracking-tight">
                Join 50,000+ Investors <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Automating Their Wealth
                </span>
              </h1>

              <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-lg">
                Create your account in under 60 seconds. Connect transactions, train predictive models, and get AI guidance on budgets & tax optimization.
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

      {/* ── FOOTER (PINNED AT BOTTOM OF VIEWPORT, PERFECT ALIGNMENT) ── */}
      <footer className="w-full flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-zinc-900 shrink-0">
        <span>© 2026 {APP_CONSTANTS.APP_NAME}</span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit AES Encrypted</span>
        </span>
      </footer>
    </div>
  </div>
);

export default Register;
