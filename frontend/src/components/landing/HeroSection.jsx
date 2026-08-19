import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  DatabaseZap,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';
import { TextGenerateEffect } from '../ui/TextGenerateEffect.jsx';
import { SparklesCore } from '../ui/SparklesCore.jsx';

export const HeroSection = ({ onOpenLogin }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(ROUTES.AUTH.REGISTER);
  };

  const handleExplore = () => {
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden bg-transparent">
      {/* Subtle Background Radial Gradient Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-transparent to-transparent z-0" />

      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-emerald-500/10 blur-[150px] z-0" />

      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        
        {/* Centered High-Impact Executive Hero Container */}
        <div className="max-w-4xl mx-auto text-center space-y-7 relative z-10">
          
          {/* Eyebrow Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#121216] border border-zinc-800/90 text-slate-300 text-xs font-semibold tracking-wide shadow-glass"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200">Next-Gen AI Wealth Intelligence Platform</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 ml-1" />
          </motion.div>

          {/* Headline Title with TextGenerateEffect */}
          <TextGenerateEffect
            words="Master Your Wealth with Autonomous AI"
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white"
            highlightWords={["Autonomous", "AI"]}
            duration={0.6}
            filter={true}
          />

          {/* Official Aceternity UI Sparkles Container - Clean Spacing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-[40rem] max-w-full mx-auto h-36 relative flex flex-col items-center justify-center overflow-hidden pointer-events-none mt-2 mb-2"
          >
            {/* Ambient Glowing Gradient Beams */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-[2px] w-3/4 blur-sm z-20" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent h-px w-3/4 z-20" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent h-[5px] w-1/4 blur-sm z-20" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-cyan-300 to-transparent h-px w-1/4 z-20" />

            {/* Fine Pinprick Star Particle Field */}
            <SparklesCore
              id="heroSparkles"
              background="transparent"
              minSize={0.3}
              maxSize={1.0}
              particleDensity={750}
              className="w-full h-full z-10"
              particleColor={["#10B981", "#34D399", "#2DD4BF", "#00F2FE", "#FFFFFF"]}
              speed={0.8}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg lg:text-xl text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto"
          >
            Automate transaction tracking, project next-month outflows with AI expense prediction (98.8% accuracy), track category budgets, and receive real-time financial advisory.
          </motion.p>

          {/* CTA Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 group active:scale-[0.98] cursor-pointer font-outfit"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-950" />
            </button>

            <button
              onClick={handleExplore}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#121216] hover:bg-zinc-800 text-slate-200 font-semibold text-sm border border-zinc-800 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer font-outfit"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Explore Dashboard</span>
            </button>
          </motion.div>

          {/* Trust Badges Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-5 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-slate-400 border-t border-zinc-800/40 max-w-xl mx-auto"
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

      </div>
    </section>
  );
};

export default HeroSection;
