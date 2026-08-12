import React from 'react';
import { motion } from 'framer-motion';
import { Users, Receipt, Wallet, Brain, TrendingUp } from 'lucide-react';

const STATS = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Smart Users',
    subtext: 'Across 120+ Indian cities',
    color: 'text-[#FF5A5F]',
    bgColor: 'bg-[#FF5A5F]/15 border-[#FF5A5F]/20',
  },
  {
    icon: Receipt,
    value: '₹1,200 Cr+',
    label: 'Transactions Processed',
    subtext: '98.7% auto-categorized',
    color: 'text-[#00F2FE]',
    bgColor: 'bg-[#00F2FE]/15 border-[#00F2FE]/20',
  },
  {
    icon: Wallet,
    value: '₹5,000 Cr+',
    label: 'Total Money Managed',
    subtext: 'Bank-grade encrypted',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15 border-purple-500/20',
  },
  {
    icon: Brain,
    value: '2.5 Million+',
    label: 'AI Insights Generated',
    subtext: 'Tax & budget alerts delivered',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15 border-emerald-500/20',
  },
];

export const StatsSection = () => {
  return (
    <section id="about" className="py-12 bg-transparent relative overflow-hidden">
      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141418] border border-purple-500/20 text-purple-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Institutional Scale</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-outfit">
            Empowering Wealth Creation Across India
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Real-time financial intelligence powering thousands of individuals and families.
          </p>
        </motion.div>

        {/* 4 Cards Animated Grid matching user screenshot circular icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#141418] border border-zinc-800 text-slate-400">
                    VERIFIED
                  </span>
                </div>

                <div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white font-outfit tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-bold text-slate-200 mt-1 font-outfit">
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
