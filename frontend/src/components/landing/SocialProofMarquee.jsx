import React from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  LineChart,
  PieChart,
  ShieldCheck,
  Calculator,
  Target,
  Sparkles,
  Zap,
} from 'lucide-react';

const WEBSITE_CAPABILITIES = [
  {
    name: 'Gemini 1.5 Pro AI Engine',
    badge: 'Autonomous Wealth Insights',
    icon: BrainCircuit,
    color: 'text-emerald-400',
  },
  {
    name: 'AI Expense Prediction Engine',
    badge: 'Multi-Scale Quantile Outflows',
    icon: LineChart,
    color: 'text-teal-400',
  },
  {
    name: 'Smart Budget Envelopes',
    badge: 'Real-Time Auto-Categorization',
    icon: PieChart,
    color: 'text-cyan-400',
  },
  {
    name: 'Tax Optimizer Assistant',
    badge: '80C & New Regime Analysis',
    icon: Calculator,
    color: 'text-emerald-400',
  },
  {
    name: 'Milestone Goal Tracker',
    badge: 'Automated Savings Projections',
    icon: Target,
    color: 'text-teal-400',
  },
  {
    name: '256-Bit Bank-Grade Vault',
    badge: 'Zero-Knowledge Data Security',
    icon: ShieldCheck,
    color: 'text-cyan-400',
  },
  {
    name: 'Financial Health Matrix',
    badge: 'Real-Time Wealth Scoring',
    icon: Sparkles,
    color: 'text-emerald-400',
  },
  {
    name: 'Instant Ledger Analytics',
    badge: 'Multi-Asset Portfolio Sync',
    icon: Zap,
    color: 'text-teal-400',
  },
];

export const SocialProofMarquee = () => {
  const marqueeItems = [...WEBSITE_CAPABILITIES, ...WEBSITE_CAPABILITIES];

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="py-6 bg-transparent overflow-hidden"
    >
      <div className="max-w-screen-xl mx-auto px-4 mb-5 text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Powered by Institutional AI & Predictive Financial Models
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Gradient Fades for edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#000000] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#000000] to-transparent z-10" />

        {/* Marquee Track */}
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
          className="flex space-x-5 whitespace-nowrap"
        >
          {marqueeItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="inline-flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-[#09090B] border border-zinc-800 shadow-[0_8px_25px_rgba(0,0,0,0.8)] flex-shrink-0 group hover:border-emerald-500/30 transition-colors"
              >
                <div className={`p-2 rounded-xl bg-[#141418] ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{item.badge}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default SocialProofMarquee;
