import React from 'react';

export const GoalProgress = ({ percentage = 0, performanceStatus = 'On Track' }) => {
  const clampedPct = Math.min(Math.max(percentage, 0), 100);

  const getBarColor = () => {
    if (performanceStatus === 'Achieved' || clampedPct >= 100) return 'bg-emerald-500 shadow-sm shadow-emerald-500/50';
    if (performanceStatus === 'Ahead of Schedule') return 'bg-indigo-500 shadow-sm shadow-indigo-500/50';
    if (performanceStatus === 'On Track') return 'bg-violet-500 shadow-sm shadow-violet-500/50';
    return 'bg-amber-500 shadow-sm shadow-amber-500/50';
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-slate-500 dark:text-slate-400">Progress</span>
        <span
          className={
            clampedPct >= 100
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-indigo-600 dark:text-indigo-400 font-bold'
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

export default GoalProgress;
