import React from 'react';
import { Target, Calendar, Clock } from 'lucide-react';
import { formatCurrency, formatCompactFinancial, formatDate } from '../../utils/formatters.js';

const RadialProgress = ({ pct, color, size = 64 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(Number(pct) || 0, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth="6"
        className="fill-none stroke-slate-200 dark:stroke-slate-700" />
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth="6"
        className="fill-none transition-all duration-700"
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round" />
    </svg>
  );
};

const PriorityBadge = ({ priority }) => {
  const cls = {
    CRITICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
    HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
    MEDIUM: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400',
    LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }[priority] || 'bg-slate-100 text-slate-600';

  return (
    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${cls}`}>{priority}</span>
  );
};

const goalColor = (pct) => {
  if (pct >= 100) return '#10B981';
  if (pct >= 60) return '#6366F1';
  if (pct >= 30) return '#F59E0B';
  return '#EF4444';
};

const SkeletonCard = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
    ))}
  </div>
);

export const GoalOverviewCard = ({ goalsOverview, loading }) => {
  if (loading) return <SkeletonCard />;

  const {
    total_goals = 0,
    active_goals = 0,
    completed_goals = 0,
    overall_progress_pct = 0,
    nearest_deadline_goal = null,
    goals = [],
  } = goalsOverview || {};

  const activeGoals = goals.filter((g) => g.status === 'IN_PROGRESS');

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Goals Overview</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Your savings journey progress</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: total_goals, color: 'text-slate-700 dark:text-slate-200' },
          { label: 'Active', value: active_goals, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Achieved', value: completed_goals, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Nearest deadline */}
      {nearest_deadline_goal && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-2">
            <Clock className="h-3 w-3" /> Nearest Deadline
          </div>
          <div className="flex items-center gap-3">
            <RadialProgress pct={nearest_deadline_goal.progress_pct} color={goalColor(Number(nearest_deadline_goal.progress_pct))} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{nearest_deadline_goal.goal_name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                {formatDate(nearest_deadline_goal.target_date)} · {nearest_deadline_goal.days_remaining}d left
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Need: <span className="font-semibold text-amber-700 dark:text-amber-400">{formatCompactFinancial(nearest_deadline_goal.required_monthly_saving)}/mo</span>
              </p>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {Number(nearest_deadline_goal.progress_pct).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Active goals list */}
      {activeGoals.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-3">No active goals.</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {activeGoals.map((g) => {
            const pct = Number(g.progress_pct);
            const color = goalColor(pct);
            return (
              <div key={g.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 flex items-center gap-3">
                <RadialProgress pct={pct} color={color} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{g.goal_name}</p>
                    <PriorityBadge priority={g.priority} />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatCompactFinancial(g.current_amount)} / {formatCompactFinancial(g.target_amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {g.days_remaining}d · {formatCompactFinancial(g.required_monthly_saving)}/mo needed
                  </p>
                </div>
                <span className="text-xs font-black" style={{ color }}>{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalOverviewCard;
