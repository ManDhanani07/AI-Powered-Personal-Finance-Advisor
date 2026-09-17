import React from 'react';
import { motion } from 'framer-motion';
import { History, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const RecentPerformanceGrid = ({ benchmarks }) => {
  const thisMonthPred = Number(benchmarks?.this_month_predicted || 0);
  const lastMonthAct = Number(benchmarks?.last_month_actual || 0);
  const threeMoAvg = Number(benchmarks?.three_month_avg || 0);
  const sixMoAvg = Number(benchmarks?.six_month_avg || 0);

  const items = [
    {
      label: 'This Month (Predicted)',
      amount: thisMonthPred,
      badge: 'Forecast Target',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      valueColor: 'text-cyan-300',
    },
    {
      label: 'Last Month (Actual)',
      amount: lastMonthAct,
      badge: 'Recorded Outflows',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      valueColor: 'text-white',
    },
    {
      label: '3-Month Average',
      amount: threeMoAvg,
      badge: 'Quarterly Mean',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      valueColor: 'text-white',
    },
    {
      label: '6-Month Average',
      amount: sixMoAvg,
      badge: 'Semi-Annual Mean',
      badgeColor: 'bg-zinc-800 text-slate-300 border-zinc-700',
      valueColor: 'text-white',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5 shadow-glass"
    >
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col justify-center space-y-0.5">
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider leading-tight">
              Recent Performance
            </h3>
            <p className="text-xs text-slate-400 font-normal leading-normal">
              Empirical historical benchmarks and multi-period rolling expenditure averages
            </p>
          </div>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 font-outfit">
                {it.label}
              </span>
            </div>

            <p className={`text-2xl font-black font-outfit tracking-tight ${it.valueColor}`}>
              {formatCurrency(it.amount)}
            </p>

            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-outfit border ${it.badgeColor}`}
            >
              {it.badge}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentPerformanceGrid;
