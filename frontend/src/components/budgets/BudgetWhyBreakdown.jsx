import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Store, Zap, Layers, AlertCircle } from 'lucide-react';

export const BudgetWhyBreakdown = ({ whyData }) => {
  if (!whyData) return null;

  const {
    category_breakdown = [],
    highest_spending_category = { name: 'N/A', amount: 0 },
    highest_expense_merchant = { name: 'N/A', total_amount: 0 },
    most_recent_large_transaction = { title: 'N/A', merchant: 'N/A', amount: 0, date: '' },
  } = whyData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border-strong bg-bg-surface/90 p-6 shadow-glass backdrop-blur-xl space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 font-bold">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
            Budget Variance & Root Cause Analysis
          </h3>
          <p className="text-xs text-slate-400">
            Categorical expenditure breakdown and transaction highlights driving overall spend
          </p>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 flex items-start gap-3">
          <div className="rounded-xl bg-purple-500/10 p-2 text-purple-500">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
              Highest Spending Category
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white font-outfit mt-0.5">
              {highest_spending_category.name}
            </p>
            <p className="text-xs font-semibold text-purple-400">
              ₹{highest_spending_category.amount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex items-start gap-3">
          <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-500">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Highest Expense Merchant
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white font-outfit mt-0.5">
              {highest_expense_merchant.name}
            </p>
            <p className="text-xs font-semibold text-indigo-400">
              ₹{highest_expense_merchant.total_amount.toLocaleString('en-IN')} total spent
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Recent Large Transaction
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white font-outfit mt-0.5 truncate max-w-[180px]">
              {most_recent_large_transaction.title}
            </p>
            <p className="text-xs font-semibold text-amber-400">
              ₹{most_recent_large_transaction.amount.toLocaleString('en-IN')} ({most_recent_large_transaction.merchant})
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table / Bars */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Category Allocation vs Actual Outflow
        </h4>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {category_breakdown.map((item) => {
            const isOver = item.spent_amount > item.budget_amount;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border-subtle bg-bg-surface-soft/40 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.category_name}
                    </span>
                    {isOver && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        Over by ₹{item.exceeded_amount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{item.spent_amount.toLocaleString('en-IN')}
                    </span>{' '}
                    / ₹{item.budget_amount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver ? 'bg-red-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min(100, item.utilization_pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default BudgetWhyBreakdown;
