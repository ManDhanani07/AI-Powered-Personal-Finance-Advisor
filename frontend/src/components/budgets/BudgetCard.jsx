import React from 'react';
import * as Icons from 'lucide-react';
import { Edit3, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import BudgetProgress from './BudgetProgress.jsx';

export const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const category = budget.category;
  const IconComp = (category?.icon && Icons[category.icon]) || Icons.PiggyBank;

  const isExceeded = budget.utilization_percentage >= 100;
  const isCritical = budget.utilization_percentage >= 90 && !isExceeded;
  const isWarning = budget.utilization_percentage >= 75 && !isCritical && !isExceeded;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-all hover:shadow-2xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: category?.color ? `${category.color}15` : '#6366F115',
              color: category?.color || '#6366F1',
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 dark:border-slate-800/60"
          >
            <IconComp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {budget.budget_name}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {category?.category_name || 'General Overall Budget'}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
            isExceeded
              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
              : isCritical
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : isWarning
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {budget.health_status || budget.status}
        </span>
      </div>

      {/* Figures */}
      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        <div className="rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-800/50">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Spent</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(budget.spent_amount)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-800/50">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Budget</span>
          <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {formatCurrency(budget.budget_amount)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <BudgetProgress
        percentage={budget.utilization_percentage}
        healthStatus={budget.health_status}
      />

      {/* Daily limit & period */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{formatDate(budget.end_date, 'DD MMM')}</span>
        </div>

        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Daily Limit: {formatCurrency(budget.daily_spending_limit)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Edit Budget"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget)}
            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            title="Delete Budget"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
