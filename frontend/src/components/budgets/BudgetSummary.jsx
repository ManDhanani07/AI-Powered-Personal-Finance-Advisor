import React from 'react';
import { Wallet, PieChart, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const BudgetSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Allocated Budget
          </p>
          <h3 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(summary.total_allocated)}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Wallet className="h-6 w-6" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Spent Amount
          </p>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(summary.total_spent)}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
          <TrendingDown className="h-6 w-6" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Remaining
          </p>
          <h3
            className={`text-xl font-extrabold mt-1 ${
              summary.total_remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
            }`}
          >
            {formatCurrency(summary.total_remaining)}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <PieChart className="h-6 w-6" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Overall Utilization
          </p>
          <h3 className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {summary.overall_utilization_pct}%
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;
