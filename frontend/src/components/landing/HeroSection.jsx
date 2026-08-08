import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const HeroSection = () => {


  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-bg-base">
      {/* Background Glow Effects & Animated Gradient Blob */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-primary-500/15 blur-[150px] animate-blob-spin" />
      <div className="pointer-events-none absolute top-1/3 right-10 w-[450px] h-[450px] rounded-full bg-accent-500/15 blur-[130px] animate-pulse-glow" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Centered Typography Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-extrabold uppercase tracking-widest mb-6 shadow-sm shadow-primary-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-accent-400" />
          <span>Next-Generation Wealth OS</span>
        </motion.div>

        {/* Large Hero Heading: "Manage Money Smarter with AI" */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto font-outfit"
        >
          Manage Money Smarter with{' '}
          <span className="bg-gradient-to-r from-primary-500 via-accent-400 to-emerald-400 bg-clip-text text-transparent">
            Artificial Intelligence
          </span>
        </motion.h1>

        {/* Professional Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Automate transaction tracking, analyze spending patterns, track savings goals, and project real-time net worth growth powered by AI.
        </motion.p>


        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-primary-500" />
            <span>256-Bit Bank Encryption</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Bank Aggregator Sync</span>
          </div>
        </motion.div>

      </div>

    </section>
  );
};

export default HeroSection;
