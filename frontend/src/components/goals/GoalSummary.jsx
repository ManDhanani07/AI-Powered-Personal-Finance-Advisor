import React from 'react';
import { Target, PiggyBank, PieChart, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const GoalSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Target */}
      <div className="rounded-2xl border border-zinc-800 bg-[#09090B] p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Target Amount
          </p>
          <h3 className="text-xl font-extrabold text-white mt-1 font-outfit">
            {formatCurrency(summary.total_target_amount)}
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-slate-300">
          <Target className="h-5 w-5" />
        </div>
      </div>

      {/* Total Saved */}
      <div className="rounded-2xl border border-zinc-800 bg-[#09090B] p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Saved Amount
          </p>
          <h3 className="text-xl font-extrabold text-emerald-400 mt-1 font-outfit">
            {formatCurrency(summary.total_saved_amount)}
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <PiggyBank className="h-5 w-5" />
        </div>
      </div>

      {/* Remaining Target */}
      <div className="rounded-2xl border border-zinc-800 bg-[#09090B] p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Remaining Target
          </p>
          <h3 className="text-xl font-extrabold text-teal-400 mt-1 font-outfit">
            {formatCurrency(summary.total_remaining_amount)}
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
          <PieChart className="h-5 w-5" />
        </div>
      </div>

      {/* Completion */}
      <div className="rounded-2xl border border-zinc-800 bg-[#09090B] p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Overall Completion
          </p>
          <h3 className="text-xl font-extrabold text-cyan-400 mt-1 font-outfit">
            {summary.overall_completion_pct}%
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Award className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default GoalSummary;
