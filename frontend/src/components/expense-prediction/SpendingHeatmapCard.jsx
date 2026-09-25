import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const SpendingHeatmapCard = ({ spendingHeatmap }) => {
  const days = spendingHeatmap?.day_distribution || [];
  const weekdayAvg = Number(spendingHeatmap?.weekday_avg || 0);
  const weekendAvg = Number(spendingHeatmap?.weekend_avg || 0);
  const insight = spendingHeatmap?.insight || 'Your spending intensity varies by day of week.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5 shadow-glass"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider">
              Weekly Spending Intensity & Heatmap
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Behavioral distribution of historical expenses by day of the week
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-outfit">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Weekday Avg:</span>
            <span className="font-mono font-bold text-white">{formatCurrency(weekdayAvg)}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Weekend Avg:</span>
            <span className="font-mono font-bold text-purple-400">{formatCurrency(weekendAvg)}</span>
          </div>
        </div>
      </div>

      {/* 7 Days Bar Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2">
        {days.map((d, idx) => {
          const intensity = Math.max(8, Math.min(100, d.intensity_pct || 0));
          const isWeekend = d.day_index >= 5;
          return (
            <div key={idx} className="flex flex-col items-center space-y-2 group">
              <span className="text-[11px] font-mono text-slate-400 font-bold group-hover:text-white transition-colors">
                {formatCurrency(d.total_spend || 0)}
              </span>

              {/* Intensity Bar Column */}
              <div className="h-28 w-full max-w-[48px] rounded-xl bg-zinc-900/80 border border-zinc-800 p-1 flex flex-col justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${intensity}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
                  className={`w-full rounded-lg transition-all ${
                    isWeekend
                      ? 'bg-gradient-to-t from-purple-600 to-purple-400'
                      : 'bg-gradient-to-t from-emerald-600 to-teal-400'
                  }`}
                  title={`${d.day_name}: ${formatCurrency(d.total_spend)} (${d.tx_count} transactions)`}
                />
              </div>

              <div className="text-center">
                <p className={`text-xs font-black font-outfit ${isWeekend ? 'text-purple-300' : 'text-slate-300'}`}>
                  {d.day_name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {d.tx_count} txs
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Behavioral Insight Banner */}
      <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-outfit">
        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
        <span className="font-semibold">{insight}</span>
      </div>
    </motion.div>
  );
};

export default SpendingHeatmapCard;
