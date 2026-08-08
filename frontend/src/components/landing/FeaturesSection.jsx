import React from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  PieChart,
  Target,
  LineChart,
  Activity,
  FileBarChart,
  Sparkles,
} from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';

const FEATURES = [
  {
    icon: Receipt,
    title: 'Expense Tracking',
    desc: 'Auto-sync transactions via Secure Bank Aggregator with AI regex merchant categorization rules and custom tags.',
    color: 'from-blue-500 to-indigo-600',
    iconColor: 'text-primary-400',
    glowColor: 'group-hover:shadow-primary-500/25',
  },
  {
    icon: PieChart,
    title: 'Budget Planning',
    desc: 'Zero-based envelope budgeting with real-time limit sliders, surplus reallocation tools, and over-budget burn rate warnings.',
    color: 'from-accent-500 to-teal-600',
    iconColor: 'text-accent-400',
    glowColor: 'group-hover:shadow-accent-500/25',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    desc: 'Visual goal vaults with dynamic liquid progress wave indicators, target date projections, and Framer Motion celebration particle states.',
    color: 'from-emerald-500 to-green-600',
    iconColor: 'text-emerald-400',
    glowColor: 'group-hover:shadow-emerald-500/25',
  },
  {
    icon: LineChart,
    title: 'AI Forecast Engine',
    desc: 'Machine learning cash flow canvas displaying 12-month future trajectories with interactive scenario sliders and 95% confidence bands.',
    color: 'from-purple-500 to-indigo-600',
    iconColor: 'text-purple-400',
    glowColor: 'group-hover:shadow-purple-500/25',
  },
  {
    icon: Activity,
    title: 'Financial Health Score',
    desc: 'Real-time liquidity risk alerts, emergency fund readiness metrics, and vendor concentration dependency matrix.',
    color: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-400',
    glowColor: 'group-hover:shadow-amber-500/25',
  },
  {
    icon: FileBarChart,
    title: 'Reports & Tax Planning',
    desc: 'Visual reports with category breakdown, spending trends, income vs expense comparison, and 1-click executive PDF exports.',
    color: 'from-rose-500 to-pink-600',
    iconColor: 'text-rose-400',
    glowColor: 'group-hover:shadow-rose-500/25',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-bg-base relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="pointer-events-none absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -right-40 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          badge="Core Capabilities"
          badgeIcon={Sparkles}
          title="6 Intelligent Pillars of"
          highlightText="Wealth OS"
          subtitle="Everything you need to organize, protect, and grow your wealth in one unified platform."
          className="mb-16"
        />

        {/* Clean 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -8 }}
                className={`rounded-3xl border border-border-subtle bg-bg-surface p-7 shadow-glass flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-primary-500/40 hover:shadow-2xl ${feat.glowColor} transition-all duration-300`}
              >
                {/* Background ambient gradient glow on hover */}
                <div className="pointer-events-none absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary-500/5 group-hover:bg-primary-500/15 blur-2xl transition-all duration-300" />

                <div className="space-y-4 relative z-10">
                  {/* Icon Container with hover rotation */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${feat.color} text-white shadow-md group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-bg-elevated text-slate-400 border border-border-subtle">
                      AI Module
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-outfit">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
