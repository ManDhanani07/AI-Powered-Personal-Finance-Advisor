import React from 'react';
import * as Icons from 'lucide-react';
import { Edit3, Trash2, Calendar, Pause, Play, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import GoalProgress from './GoalProgress.jsx';

export const GoalCard = ({ goal, onEdit, onToggleStatus, onDelete }) => {
  const IconComp = (goal.icon && Icons[goal.icon]) || Icons.Target;
  const isAchieved = goal.status === 'ACHIEVED' || goal.completion_percentage >= 100;
  const isPaused = goal.status === 'PAUSED';

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-all space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: goal.color ? `${goal.color}15` : '#6366F115',
              color: goal.color || '#6366F1',
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 dark:border-slate-800/60"
          >
            <IconComp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {goal.goal_name}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {goal.goal_type || 'General Savings'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
              goal.priority === 'CRITICAL'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : goal.priority === 'HIGH'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            {goal.priority} Priority
          </span>

          <span
            className={`text-[10px] font-bold ${
              isAchieved
                ? 'text-emerald-600 dark:text-emerald-400'
                : isPaused
                ? 'text-slate-400'
                : 'text-indigo-600 dark:text-indigo-400'
            }`}
          >
            {isAchieved ? '🎉 Achieved' : isPaused ? '⏸ Paused' : goal.performance_status}
          </span>
        </div>
      </div>

      {/* Figures */}
      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        <div className="rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-800/50">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Saved</span>
          <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(goal.current_amount)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-800/50">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Target</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(goal.target_amount)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <GoalProgress
        percentage={goal.completion_percentage}
        performanceStatus={goal.performance_status}
      />

      {/* Target date & required monthly saving */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{formatDate(goal.target_date, 'MMM YYYY')}</span>
        </div>

        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Req: {formatCurrency(goal.required_monthly_saving)}/mo
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleStatus(goal)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title={isPaused ? 'Resume Goal' : 'Pause Goal'}
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-emerald-500" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Edit Goal"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            title="Delete Goal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
