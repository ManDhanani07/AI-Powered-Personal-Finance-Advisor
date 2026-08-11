import React from 'react';
import { motion } from 'framer-motion';
import {
  Workflow,
  Layers,
  Crosshair,
  Binary,
  Activity,
  FileSpreadsheet,
  Orbit,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Workflow,
    title: 'Expense Tracking',
    desc: 'Auto-sync transactions via Secure Bank Aggregator with AI regex merchant categorization rules and custom tags.',
    color: 'text-[#FF5A5F]',
    bgColor: 'bg-[#FF5A5F]/15 border-[#FF5A5F]/20',
  },
  {
    icon: Layers,
    title: 'Budget Planning',
    desc: 'Zero-based envelope budgeting with real-time limit sliders, surplus reallocation tools, and over-budget burn rate warnings.',
    color: 'text-[#00F2FE]',
    bgColor: 'bg-[#00F2FE]/15 border-[#00F2FE]/20',
  },
  {
    icon: Crosshair,
    title: 'Savings Goals',
    desc: 'Visual goal vaults with dynamic progress wave indicators, target date projections, and Framer Motion particle celebrations.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15 border-purple-500/20',
  },
  {
    icon: Binary,
    title: 'AI Forecast Engine',
    desc: 'Machine learning cash flow canvas displaying 12-month future trajectories with interactive scenario sliders and 95% confidence bands.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15 border-emerald-500/20',
  },
  {
    icon: Activity,
    title: 'Financial Health Score',
    desc: 'Real-time liquidity risk alerts, emergency fund readiness metrics, and vendor concentration dependency matrix.',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/15 border-sky-500/20',
  },
  {
    icon: FileSpreadsheet,
    title: 'Reports & Tax Planning',
    desc: 'Visual reports with category breakdown, spending trends, income vs expense comparison, and 1-click executive PDF exports.',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15 border-rose-500/20',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 bg-transparent relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141418] border border-purple-500/20 text-purple-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            <Orbit className="w-4 h-4 text-purple-400" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-outfit">
            6 Intelligent Pillars of <span className="bg-gradient-to-r from-[#FF5A5F] via-[#A855F7] to-[#00F2FE] bg-clip-text text-transparent">Wealth OS</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Everything you need to organize, protect, and grow your wealth in one unified platform.
          </p>
        </motion.div>

        {/* Clean 6 Cards Grid with circular icon styling matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="rounded-3xl border border-zinc-800 bg-[#09090B] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${feat.bgColor} ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#141418] border border-zinc-800 text-slate-400">
                      AI MODULE
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-outfit">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
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
