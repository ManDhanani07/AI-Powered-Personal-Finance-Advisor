import React from 'react';
import { motion } from 'framer-motion';
import { Target, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const ForecastVsBudgetCard = ({ budgetComparison }) => {
  const expected = Number(budgetComparison?.expected_expense || 0);
  const budgetLimit = Number(budgetComparison?.monthly_budget_limit || 0);
  const remaining = Number(budgetComparison?.remaining_budget || 0);
  const utilPct = Number(budgetComparison?.utilization_pct || 0);
  const isOver = Boolean(budgetComparison?.is_over_budget);
  const alertText =
    budgetComparison?.status_alert ||
    (isOver
      ? '⚠ Forecasted expenses exceed your monthly budget.'
      : utilPct >= 90
      ? '⚠ You are likely to approach your monthly budget.'
      : '✓ Projected spend is well within your budget target.');

  const isWarning = utilPct >= 85 || isOver;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5 shadow-glass"
    >
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider">
              Forecast vs Budget
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Comparison between predicted outflows and allocated monthly budget
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-black font-mono border ${
            isOver
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : utilPct >= 85
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}
        >
          {utilPct.toFixed(1)}% Allocated
        </span>
      </div>

      {/* 3 Metric Column Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-outfit block">
            Expected Expense
          </span>
          <p className="text-xl font-black text-white font-outfit">
            {formatCurrency(expected)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-outfit block">
            Monthly Budget
          </span>
          <p className="text-xl font-black text-cyan-300 font-outfit">
            {formatCurrency(budgetLimit)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-outfit block">
            {remaining >= 0 ? 'Remaining Buffer' : 'Projected Deficit'}
          </span>
          <p
            className={`text-xl font-black font-outfit ${
              remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      </div>

      {/* Visual Utilization Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 font-mono">
          <span>0%</span>
          <span className="text-white font-black">{utilPct.toFixed(1)}% Capacity</span>
          <span>100% Target</span>
        </div>

        <div className="h-3.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(3, utilPct))}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full rounded-full transition-all ${
              isOver
                ? 'bg-rose-500'
                : utilPct >= 85
                ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500'
                : 'bg-emerald-500'
            }`}
          />
        </div>
      </div>

      {/* Alert Warning Box */}
      <div
        className={`p-3.5 rounded-2xl border flex items-start space-x-3 text-xs leading-relaxed font-medium ${
          isOver
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : isWarning
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}
      >
        {isOver || isWarning ? (
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
        )}
        <span>{alertText}</span>
      </div>
    </motion.div>
  );
};

export default ForecastVsBudgetCard;
