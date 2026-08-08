import React from 'react';
import { motion } from 'framer-motion';
import { Users, Receipt, Wallet, Brain, TrendingUp } from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';

const STATS = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Smart Users',
    subtext: 'Across 120+ Indian cities',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
    borderColor: 'border-primary-500/20',
  },
  {
    icon: Receipt,
    value: '₹1,200 Cr+',
    label: 'Transactions Processed',
    subtext: '98.7% auto-categorized',
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/10',
    borderColor: 'border-accent-500/20',
  },
  {
    icon: Wallet,
    value: '₹5,000 Cr+',
    label: 'Total Money Managed',
    subtext: 'Bank-grade encrypted',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    icon: Brain,
    value: '2.5 Million+',
    label: 'AI Insights Generated',
    subtext: 'Tax & budget alerts delivered',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
];

export const StatsSection = () => {
  return (
    <section id="about" className="py-20 bg-bg-surface/60 border-y border-border-subtle relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          badge="Institutional Impact"
          badgeIcon={TrendingUp}
          title="Empowering Wealth Creation"
          highlightText="At Scale"
          subtitle="Real-time financial intelligence powering thousands of individuals and families across India."
          className="mb-14"
        />

        {/* 4 Cards Animated Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`rounded-3xl border ${stat.borderColor} bg-bg-surface p-6 shadow-glass flex flex-col justify-between space-y-4 group relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-bg-elevated text-slate-400 border border-border-subtle">
                    Live Metric
                  </span>
                </div>

                <div>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-bold text-slate-300 mt-1 font-outfit">
                    {stat.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-normal">
                    {stat.subtext}
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

export default StatsSection;
