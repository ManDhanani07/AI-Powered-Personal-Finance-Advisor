import React from 'react';
import {
  TrendingUp, TrendingDown, Activity, Zap,
  DollarSign, BarChart2,
} from 'lucide-react';
import { formatCompactFinancial, formatCurrency } from '../../utils/formatters.js';

const InsightCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 flex items-start gap-3">
    <div className={`p-2.5 rounded-2xl flex-shrink-0 ${accent}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 gap-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
    ))}
  </div>
);

export const SpendingInsights = ({ spendingAnalysis, loading }) => {
  if (loading) return <SkeletonGrid />;

  if (!spendingAnalysis) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
        No spending data available.
      </p>
    );
  }

  const {
    month,
    year,
    highest_spending_category,
    lowest_spending_category,
    avg_daily_spending,
    avg_monthly_spending,
    largest_transaction_amount,
    largest_transaction_title,
    smallest_transaction_amount,
    smallest_transaction_title,
    total_transactions_this_month,
    total_spent_this_month,
  } = spendingAnalysis;

  const insights = [
    {
      icon: TrendingUp,
      label: 'Highest Category',
      value: highest_spending_category?.category_name ?? '–',
      sub: highest_spending_category ? formatCompactFinancial(highest_spending_category.amount) : null,
      accent: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    },
    {
      icon: TrendingDown,
      label: 'Lowest Category',
      value: lowest_spending_category?.category_name ?? '–',
      sub: lowest_spending_category ? formatCompactFinancial(lowest_spending_category.amount) : null,
      accent: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Activity,
      label: 'Avg Daily Spend',
      value: formatCompactFinancial(avg_daily_spending),
      sub: `in ${month} ${year}`,
      accent: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: BarChart2,
      label: 'Avg Monthly Spend',
      value: formatCompactFinancial(avg_monthly_spending),
      sub: 'Last 6 months',
      accent: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400',
    },
    {
      icon: Zap,
      label: 'Largest Transaction',
      value: formatCompactFinancial(largest_transaction_amount),
      sub: largest_transaction_title ?? '–',
      accent: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
    {
      icon: DollarSign,
      label: 'Smallest Transaction',
      value: formatCompactFinancial(smallest_transaction_amount),
      sub: smallest_transaction_title ?? '–',
      accent: 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Spending Insights</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {month} {year} · {total_transactions_this_month} transactions · Total spent: {formatCompactFinancial(total_spent_this_month)}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {insights.map((ins) => <InsightCard key={ins.label} {...ins} />)}
      </div>
    </div>
  );
};

export default SpendingInsights;
