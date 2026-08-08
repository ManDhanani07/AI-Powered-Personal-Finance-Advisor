import React from 'react';
import { AlertCircle, CheckCircle2, BarChart2 } from 'lucide-react';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

const ProgressBar = ({ pct, color }) => {
  const width = Math.min(Number(pct) || 0, 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
      <div
        className="h-1.5 rounded-full transition-all duration-700"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
};

const StatusBadge = ({ status, pct }) => {
  const over = Number(pct) >= 100;
  const near = Number(pct) >= 75 && !over;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
      over
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
        : near
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
    }`}>
      {over ? <AlertCircle className="h-2.5 w-2.5" /> : <CheckCircle2 className="h-2.5 w-2.5" />}
      {over ? 'Exceeded' : near ? 'Near Limit' : 'On Track'}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-3 gap-3">
      {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl" />)}
    </div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
    </div>
  </div>
);

export const BudgetOverviewCard = ({ budgetOverview, loading }) => {
  if (loading) return <SkeletonCard />;

  const {
    total_active_budgets = 0,
    exceeded_budgets = 0,
    on_track_budgets = 0,
    total_budget_amount = 0,
    total_spent_amount = 0,
    total_remaining_amount = 0,
    overall_utilization_pct = 0,
    budgets = [],
  } = budgetOverview || {};

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Budget Overview</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Active budgets this period</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', value: total_active_budgets, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Exceeded', value: exceeded_budgets, color: 'text-rose-600 dark:text-rose-400' },
          { label: 'On Track', value: on_track_budgets, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Overall utilization */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-semibold">
            <BarChart2 className="h-4 w-4 text-indigo-500" />
            Overall Utilization
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white">{Number(overall_utilization_pct).toFixed(1)}%</span>
        </div>
        <ProgressBar
          pct={overall_utilization_pct}
          color={Number(overall_utilization_pct) >= 100 ? '#EF4444' : Number(overall_utilization_pct) >= 75 ? '#F59E0B' : '#10B981'}
        />
        <div className="flex justify-between mt-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Spent: {formatCompactFinancial(total_spent_amount)}</span>
          <span>Remaining: {formatCompactFinancial(total_remaining_amount)}</span>
        </div>
      </div>

      {/* Budget list */}
      {budgets.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No active budgets.</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {budgets.map((b) => (
            <div key={b.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">{b.budget_name}</p>
                  {b.category_name && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{b.category_name}</p>
                  )}
                </div>
                <StatusBadge status={b.status} pct={b.utilization_pct} />
              </div>
              <ProgressBar pct={b.utilization_pct} color={b.color} />
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                <span>{formatCompactFinancial(b.spent_amount)} spent</span>
                <span>{Number(b.utilization_pct).toFixed(0)}% of {formatCompactFinancial(b.budget_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetOverviewCard;
