import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Calculator,
  LineChart,
  ShieldCheck,
  Zap,
  PieChart,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI Wealth Copilot',
    desc: 'Conversational AI assistant that analyzes your transactions, flags overspending, and suggests real-time wealth allocations.',
    badge: 'GPT-4o Engine',
    color: 'from-primary-500 to-indigo-600',
  },
  {
    icon: Calculator,
    title: 'Reports & PDF Exports',
    desc: 'Generate comprehensive financial reports — category breakdowns, spending trends, income vs expense charts, and professional PDF exports.',
    badge: 'Smart Analytics',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: LineChart,
    title: 'Predictive Cash Flow Forecast',
    desc: 'Machine learning cash flow canvas with 12-month Monte Carlo projections and 95% confidence bands.',
    badge: 'ML Scenario Engine',
    color: 'from-accent-500 to-purple-600',
  },
  {
    icon: ShieldCheck,
    title: 'Bank Account Aggregator Sync',
    desc: 'Bank-grade encrypted consent pipelines linking HDFC, ICICI, Zerodha, and CRED with live sync indicators.',
    badge: '256-Bit Encrypted',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: PieChart,
    title: 'Zero-Based Envelope Budgeting',
    desc: 'Smart envelope allocation grid with color-coded burn rate warnings and real-time surplus sliders.',
    badge: 'Burn Rate Alerts',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: Zap,
    title: 'Automated Rule Taxonomy',
    desc: 'IF-THEN regex rule builder auto-categorizing transactions across merchants with instant test simulation.',
    badge: 'Auto Merchant Engine',
    color: 'from-blue-500 to-cyan-600',
  },
];

export const WhatIsThisSection = () => {
  return (
    <section id="features" className="py-24 bg-bg-surface/50 border-y border-border-subtle relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-extrabold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>What Is AI Wealth OS?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
            The Complete Financial Operating System for Modern India
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            Replaces scattered spreadsheets, manual banking apps, and tax calculators with a unified AI-powered platform.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-3xl border border-border-subtle bg-bg-surface p-7 shadow-glass flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-primary-500/40"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${feat.color} text-white shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-bg-elevated text-slate-400 text-[10px] font-extrabold uppercase border border-border-subtle">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-outfit">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center text-xs font-bold text-primary-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatIsThisSection;
