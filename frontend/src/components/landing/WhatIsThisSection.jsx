import React from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  CandlestickChart,
  Vault,
  Fingerprint,
  BrainCircuit,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Cpu,
    title: 'Gemini AI Wealth Copilot',
    desc: 'Conversational AI financial intelligence assistant that analyzes your transactions, flags overspending, and delivers actionable recommendations.',
    badge: 'Gemini 1.5 Pro AI Engine',
    color: 'text-[#FF5A5F]',
    bgColor: 'bg-[#FF5A5F]/15 border-[#FF5A5F]/20',
    badgeColor: 'text-[#FF5A5F] bg-[#FF5A5F]/10 border-[#FF5A5F]/20',
  },
  {
    icon: CandlestickChart,
    title: 'Meta Prophet ML Forecasting',
    desc: 'Time-series forecasting model projecting expected income, expenses, net savings, and account balance with 95% confidence bands.',
    badge: 'Prophet Time-Series ML',
    color: 'text-[#00F2FE]',
    bgColor: 'bg-[#00F2FE]/15 border-[#00F2FE]/20',
    badgeColor: 'text-[#00F2FE] bg-[#00F2FE]/10 border-[#00F2FE]/20',
  },
  {
    icon: Vault,
    title: 'Executive Financial Summary',
    desc: 'Consolidated report card covering top metrics, savings rate, spending category breakdown, and financial health score.',
    badge: 'Real-time Analytics',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15 border-purple-500/20',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Fingerprint,
    title: 'Bank Aggregator Sync & Privacy',
    desc: 'Bank-grade 256-bit encrypted data consent pipeline ensuring zero data leaks and read-only ledger synchronization.',
    badge: '256-Bit Encrypted',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15 border-emerald-500/20',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
];

export const WhatIsThisSection = () => {
  return (
    <section id="features" className="py-12 bg-transparent relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141418] border border-[#00F2FE]/20 text-[#00F2FE] text-xs font-extrabold uppercase tracking-widest mb-4 shadow-sm">
            <BrainCircuit className="w-4 h-4 text-[#00F2FE]" />
            <span>Autonomous Intelligence OS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-outfit">
            AI Financial Insights & Machine Learning
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Replaces scattered spreadsheets and complex banking tools with a unified AI wealth operating system.
          </p>
        </motion.div>

        {/* Clean 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-3xl border border-zinc-800 bg-[#09090B] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-all space-y-4 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${feat.bgColor} ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-extrabold tracking-wider uppercase ${feat.badgeColor}`}>
                      {feat.badge}
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

export default WhatIsThisSection;
