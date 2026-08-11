import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Orbit, Lock, TrendingUp, BarChart3, Cpu, Globe2,
  ShieldCheck, CheckCircle2, Zap, ArrowLeft
} from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm.jsx';
import { LightPillar } from '../../components/common/LightPillar.jsx';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

const STATS = [
  { value: '₹2.4B+', label: 'Assets Under Management' },
  { value: '50K+', label: 'Active Investors' },
  { value: '99.97%', label: 'Uptime Reliability' },
  { value: '4.9★', label: 'Average User Rating' },
];

const FEATURES = [
  { icon: Cpu, label: 'Gemini AI Financial Copilot Engine', color: 'text-emerald-400' },
  { icon: TrendingUp, label: 'Meta Prophet ML 12-Month Cash Forecasting', color: 'text-teal-400' },
  { icon: BarChart3, label: 'Real-Time Category Spend Intelligence', color: 'text-cyan-400' },
  { icon: Globe2, label: 'RBI-Compliant Account Aggregator API', color: 'text-emerald-400' },
];

export const Login = () => (
  <div className="min-h-screen lg:h-screen flex bg-[#000000] overflow-y-auto lg:overflow-hidden [scrollbar-width:none] [::-webkit-scrollbar]:hidden">

    {/* ── LEFT PANEL (BRANDING & FEATURES) ── */}
    <div className="relative hidden lg:flex lg:w-[48%] flex-col justify-between p-8 xl:p-10 overflow-y-auto [scrollbar-width:none] [::-webkit-scrollbar]:hidden bg-[#000000] border-r border-zinc-800/40">
      <div className="pointer-events-none absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-[160px]" />

      {/* Brand */}
      <div className="relative z-10 shrink-0">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-3 group w-fit">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Orbit className="w-4.5 h-4.5 text-slate-950" />
          </div>
          <span className="font-black text-base text-white tracking-tight font-outfit">
            FinTech<span className="text-emerald-400">.AI</span>
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col gap-4 xl:gap-5 my-auto max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2.5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0D0D] border border-zinc-800 text-slate-300 text-[11px] font-semibold w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Wealth Intelligence Platform</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight font-outfit">
            Where Wealth Meets{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>

          <p className="text-xs xl:text-sm text-slate-400 leading-relaxed">
            The institutional-grade financial OS trusted by 50,000+ professionals across India. AI-driven, bank-secured, and built for growth.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-2 gap-2.5"
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="rounded-xl bg-[#09090B] border border-zinc-800 p-2.5 xl:p-3">
              <p className="text-lg xl:text-xl font-black text-white font-outfit tracking-tight">{value}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="flex flex-col gap-2"
        >
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#09090B] border border-zinc-800">
              <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <p className="text-xs font-semibold text-slate-200">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Security badges */}
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RBI AA-Framework</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ISO 27001</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>SOC 2 Type II</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 pt-4 shrink-0">
        <span>© 2026 {APP_CONSTANTS.APP_NAME}</span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit AES Encrypted Vault</span>
        </span>
      </div>
    </div>

    {/* ── RIGHT PANEL (FORM SECTION WITH LIGHTPILLAR EFFECT) ── */}
    <div className="relative flex-1 flex flex-col bg-[#000000] overflow-y-auto [scrollbar-width:none] [::-webkit-scrollbar]:hidden">
      {/* LightPillar Canvas */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-100 overflow-hidden">
        <LightPillar
          topColor="#10B981"
          bottomColor="#000000"
          intensity={1.1}
          rotationSpeed={0.5}
          glowAmount={0.008}
          pillarWidth={2}
          pillarHeight={0.6}
          noiseIntensity={2}
          pillarRotation={-30}
          interactive={false}
          mixBlendMode="normal"
          quality="high"
        />
      </div>

      {/* Top bar with Back to Home button */}
      <div className="flex items-center justify-between px-6 pt-4 flex-shrink-0 relative z-20">
        <Link to={ROUTES.HOME} className="lg:hidden flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Orbit className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-black text-sm text-white font-outfit">
            FinTech<span className="text-emerald-400">.AI</span>
          </span>
        </Link>
        <Link
          to={ROUTES.HOME}
          className="ml-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-800 bg-[#09090B] text-xs font-semibold text-slate-300 hover:text-white hover:border-zinc-700 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Form Container (Cleanly Centered without Scroll) */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-4 overflow-y-auto [scrollbar-width:none] [::-webkit-scrollbar]:hidden relative z-10">
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md my-auto rounded-3xl border border-zinc-800/90 bg-[#09090B]/95 backdrop-blur-xl p-5 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.25),0_20px_60px_rgba(0,0,0,0.95)]"
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>
  </div>
);

export default Login;
