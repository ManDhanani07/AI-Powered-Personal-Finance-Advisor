import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  DatabaseZap,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';
import Particles from './Particles.jsx';

export const HeroSection = ({ onOpenLogin }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(ROUTES.AUTH.REGISTER);
  };

  const handleExplore = () => {
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden bg-transparent">
      {/* Subtle Background Radial Gradient Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent z-0" />

      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        {/* 2-Column Side-by-Side Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-14">
          
          {/* LEFT COLUMN: Eyebrow, Title, Subtitle, Buttons, Badges */}
          <div className="lg:col-span-6 text-left space-y-6">
            {/* MNC Executive Eyebrow Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#121216] border border-zinc-800 text-slate-300 text-xs font-semibold tracking-wide"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-200">Next-Gen AI Wealth Intelligence Platform</span>
            </motion.div>

            {/* MNC Hero Title: Clean Metallic White with Emerald Accent */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.08] font-outfit"
            >
              Master Your Wealth with{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Autonomous AI
              </span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl"
            >
              Automate transaction tracking, analyze category budgets, project net worth growth using Meta Prophet ML, and receive real-time financial intelligence.
            </motion.p>

            {/* MNC Enterprise CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-2 flex flex-col sm:flex-row items-center gap-4"
            >
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 group active:scale-[0.98]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-950" />
              </button>

              <button
                onClick={handleExplore}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#121216] hover:bg-zinc-800 text-slate-200 font-semibold text-sm border border-zinc-800 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <span>Explore Dashboard</span>
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-400"
            >
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-300" />
                <span>256-Bit Bank Level Security</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <DatabaseZap className="w-4 h-4 text-slate-300" />
                <span>Real-time Bank Aggregator</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Real AI Dashboard Mockup Showcase Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl border border-zinc-800/90 bg-[#09090B] p-2 sm:p-2.5 overflow-hidden shadow-2xl">
              {/* High-Def Mockup Image */}
              <div className="overflow-hidden rounded-xl aspect-[16/11] sm:aspect-[16/10] max-h-[420px]">
                <img
                  src="/images/landing_hero_mockup.png"
                  alt="AI Personal Finance Advisor Dashboard Mockup"
                  className="w-full h-full object-cover object-top rounded-xl transition-transform hover:scale-[1.01] duration-500"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
