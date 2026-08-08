import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, PieChart, TrendingUp, Calendar, Receipt, ShoppingBag, Award } from 'lucide-react';

export const PremiumBudgetInsightCard = ({ analysisData }) => {
  if (!analysisData) return null;

  const {
    budget_allocated = 0,
    amount_spent = 0,
    remaining_budget = 0,
    exceeded_amount = 0,
    budget_utilization_pct = 0,
    largest_spending_category = { name: 'N/A', amount: 0 },
    most_expensive_transaction = { title: 'N/A', merchant: 'N/A', amount: 0, date: '' },
    average_daily_spending = 0,
    average_weekly_spending = 0,
  } = analysisData;

  const isExceeded = exceeded_amount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border-strong bg-bg-surface/90 p-6 shadow-glass backdrop-blur-xl space-y-6"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 font-bold">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              Budget Analysis & Health Metrics
            </h3>
            <p className="text-xs text-slate-400">
              Real-time PostgreSQL spending velocity, category weights, and daily averages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Utilization:</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-black font-outfit ${
              budget_utilization_pct > 100
                ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                : budget_utilization_pct > 80
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
            }`}
          >
            {budget_utilization_pct}%
          </span>
        </div>
      </div>

      {/* Grid of Key Financial Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border-subtle bg-bg-surface-soft/60 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <Wallet className="h-3.5 w-3.5 text-primary-500" />
            <span>Budget Allocated</span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white font-outfit">
            ₹{budget_allocated.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface-soft/60 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
            <span>Amount Spent</span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white font-outfit">
            ₹{amount_spent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface-soft/60 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
            <span>{isExceeded ? 'Exceeded Amount' : 'Remaining Budget'}</span>
          </div>
          <p
            className={`text-lg font-black font-outfit ${
              isExceeded ? 'text-red-500' : 'text-emerald-500 dark:text-emerald-400'
            }`}
          >
            ₹
            {(isExceeded ? exceeded_amount : remaining_budget).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface-soft/60 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <Award className="h-3.5 w-3.5 text-purple-500" />
            <span>Budget Utilization %</span>
          </div>
          <div className="space-y-1.5">
            <p className="text-lg font-black text-slate-900 dark:text-white font-outfit">
              {budget_utilization_pct}%
            </p>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budget_utilization_pct > 100
                    ? 'bg-red-500'
                    : budget_utilization_pct > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budget_utilization_pct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Insights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/50 p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-medium text-slate-400">Largest Category</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {largest_spending_category.name}
            </p>
            <p className="text-[11px] font-semibold text-purple-400">
              ₹{largest_spending_category.amount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface/50 p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-medium text-slate-400">Max Transaction</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {most_expensive_transaction.title}
            </p>
            <p className="text-[11px] font-semibold text-amber-400">
              ₹{most_expensive_transaction.amount.toLocaleString('en-IN')} ({most_expensive_transaction.merchant})
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface/50 p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Avg. Daily Spend</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
              ₹{average_daily_spending.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/day
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface/50 p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Avg. Weekly Spend</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
              ₹{average_weekly_spending.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/week
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumBudgetInsightCard;
