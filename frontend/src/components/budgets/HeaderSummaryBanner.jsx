import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, PieChart, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const HeaderSummaryBanner = ({
  totalIncome = 0,
  totalAllocated = 0,
  totalSpent = 0,
}) => {
  const unallocatedSurplus = Math.max(0, totalIncome - totalAllocated);
  const spentPct = totalAllocated > 0 ? Math.min(100, (totalSpent / totalAllocated) * 100) : 0;
  const allocatedPct = totalIncome > 0 ? Math.min(100, (totalAllocated / totalIncome) * 100) : 0;

  return (
    <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Allocated */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Monthly Allocated</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-outfit">
            {formatCurrency(totalAllocated)}
          </p>
          <p className="text-[11px] text-slate-400">
            {allocatedPct.toFixed(1)}% of ₹{totalIncome.toLocaleString('en-IN')} total income pool
          </p>
        </div>

        {/* Spent So Far */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spent So Far</p>
          <p className={`text-3xl font-black font-outfit ${spentPct > 100 ? 'text-rose-500' : 'text-primary-500'}`}>
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-[11px] text-slate-400">
            {spentPct.toFixed(1)}% of total allocated budget utilized
          </p>
        </div>

        {/* Unallocated Surplus */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unallocated Zero-Based Surplus</p>
          <div className="flex items-center space-x-2">
            <p className="text-3xl font-black text-emerald-500 font-outfit">
              {formatCurrency(unallocatedSurplus)}
            </p>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold uppercase">
              Ready to Assign
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Assign remaining surplus to savings or investments
          </p>
        </div>
      </div>

      {/* Multi-Segmented Visual Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-400">Global Envelope Budget Allocation</span>
          <span className="text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalSpent)} / {formatCurrency(totalAllocated)}
          </span>
        </div>

        <div className="h-4 w-full rounded-2xl bg-bg-elevated p-1 flex overflow-hidden border border-border-subtle">
          {/* Spent Segment */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalIncome > 0 ? Math.min(100, Math.max(0, (totalSpent / totalIncome) * 100)) : 0}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-xl ${
              spentPct >= 100
                ? 'bg-rose-500 shadow-lg shadow-rose-500/50'
                : spentPct >= 80
                ? 'bg-amber-500'
                : 'bg-primary-500'
            }`}
          />
          {/* Remaining Allocated Segment */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalIncome > 0 ? Math.max(0, ((totalAllocated - totalSpent) / totalIncome) * 100) : 0}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-xl bg-indigo-500/30"
          />
          {/* Unallocated Surplus Segment */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalIncome > 0 ? Math.max(0, (unallocatedSurplus / totalIncome) * 100) : 0}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-full rounded-xl bg-emerald-500/40"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            <span>Spent ({formatCurrency(totalSpent)})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/30" />
            <span>Remaining Limit ({formatCurrency(Math.max(0, totalAllocated - totalSpent))})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
            <span>Surplus ({formatCurrency(unallocatedSurplus)})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSummaryBanner;
