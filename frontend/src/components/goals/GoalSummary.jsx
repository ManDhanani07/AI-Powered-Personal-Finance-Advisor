import React from 'react';
import { Target, PiggyBank, TrendingDown, Trophy } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

const StatCard = ({ label, value, icon: Icon, valueColor, iconBg, iconBorder, iconColor }) => (
  <div className="rounded-2xl border border-zinc-800 bg-[#09090B] p-5 flex items-center justify-between shadow-sm">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <h3 className={`text-xl font-extrabold mt-1 font-outfit ${valueColor}`}>{value}</h3>
    </div>
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconBorder} ${iconColor}`}>
      <Icon className="h-5 w-5" />
    </div>
  </div>
);

export const GoalSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* 1 — Total Target: Indigo */}
      <StatCard
        label="Total Target Amount"
        value={formatCurrency(summary.total_target_amount)}
        icon={Target}
        valueColor="text-indigo-400"
        iconBg="bg-indigo-500/10"
        iconBorder="border border-indigo-500/20"
        iconColor="text-indigo-400"
      />

      {/* 2 — Total Saved: Emerald */}
      <StatCard
        label="Total Saved Amount"
        value={formatCurrency(summary.total_saved_amount)}
        icon={PiggyBank}
        valueColor="text-emerald-400"
        iconBg="bg-emerald-500/10"
        iconBorder="border border-emerald-500/20"
        iconColor="text-emerald-400"
      />

      {/* 3 — Remaining Target: Amber */}
      <StatCard
        label="Remaining Target"
        value={formatCurrency(summary.total_remaining_amount)}
        icon={TrendingDown}
        valueColor="text-amber-400"
        iconBg="bg-amber-500/10"
        iconBorder="border border-amber-500/20"
        iconColor="text-amber-400"
      />

      {/* 4 — Overall Completion: Violet */}
      <StatCard
        label="Overall Completion"
        value={`${summary.overall_completion_pct ?? 0}%`}
        icon={Trophy}
        valueColor="text-violet-400"
        iconBg="bg-violet-500/10"
        iconBorder="border border-violet-500/20"
        iconColor="text-violet-400"
      />
    </div>
  );
};

export default GoalSummary;
