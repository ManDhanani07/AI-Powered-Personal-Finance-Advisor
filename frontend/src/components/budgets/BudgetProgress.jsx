import React from 'react';

export const BudgetProgress = ({ percentage = 0, healthStatus = 'Safe' }) => {
  const clampedPct = Math.min(Math.max(percentage, 0), 100);

  const getBarColor = () => {
    if (healthStatus === 'Exceeded' || clampedPct >= 100) return 'bg-red-500 shadow-sm shadow-red-500/50';
    if (healthStatus === 'Critical' || clampedPct >= 90) return 'bg-rose-500 shadow-sm shadow-rose-500/50';
    if (healthStatus === 'Warning' || clampedPct >= 75) return 'bg-amber-500 shadow-sm shadow-amber-500/50';
    return 'bg-emerald-500 shadow-sm shadow-emerald-500/50';
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-slate-500 dark:text-slate-400">Utilization</span>
        <span
          className={
            clampedPct >= 100
              ? 'text-red-600 dark:text-red-400 font-extrabold'
              : clampedPct >= 75
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-emerald-600 dark:text-emerald-400 font-bold'
          }
        >
          {percentage}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
    </div>
  );
};

export default BudgetProgress;
