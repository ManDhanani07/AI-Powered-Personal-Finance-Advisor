import React from 'react';
import { Target, PiggyBank, PieChart, Award, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const GoalSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Target Amount
          </p>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(summary.total_target_amount)}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Target className="h-6 w-6" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Total Saved Amount
          </p>
          <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(summary.total_saved_amount)}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <PiggyBank className="h-6 w-6" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Remaining Target
          </p>
          <h3 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(summary.total_remaining_amount)}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <PieChart className="h-6 w-6" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Overall Completion
          </p>
          <h3 className="text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
            {summary.overall_completion_pct}%
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
          <Award className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default GoalSummary;
