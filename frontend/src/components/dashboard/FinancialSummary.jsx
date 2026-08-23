import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

const MiniStat = ({ label, value, icon: Icon, badgeStyle }) => (
  <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-[#121216] border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-md group">
    <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${badgeStyle}`}>
      <Icon className="w-5 h-5 stroke-[2.25]" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-outfit truncate">{label}</span>
      <span className="text-base font-black text-white font-outfit mt-0.5 tracking-tight">{value}</span>
    </div>
  </div>
);

const SavingsBar = ({ rate }) => {
  const pct = Math.min(Math.max(Number(rate) || 0, 0), 100);
  const barGradient =
    pct >= 30
      ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
      : pct >= 15
      ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
      : 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]';

  const textClass =
    pct >= 30
      ? 'text-cyan-400'
      : pct >= 15
      ? 'text-amber-400'
      : 'text-rose-400';

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-300 font-outfit uppercase tracking-wider">
          Monthly Savings Efficiency
        </span>
        <span className={`text-xs font-black ${textClass} font-mono`}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800/80">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${barGradient}`}
        />
      </div>
    </div>
  );
};

export const FinancialSummary = ({ summary, overview, budgetOverview, loading }) => {
  if (loading) {
    return (
      <div className="rounded-3xl bg-[#09090B] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.98)] animate-pulse space-y-4">
        <div className="h-4 bg-zinc-800 rounded w-1/4" />
        <div className="h-9 bg-zinc-800 rounded w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-zinc-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // 1. Dynamic Net Worth (Balance)
  const balance = Number(
    summary?.total_balance ?? overview?.total_balance ?? 0
  );

  // 2. Dynamic Monthly Income
  const income = Number(
    summary?.monthly_income ?? overview?.monthly_income ?? 0
  );

  // 3. Dynamic Monthly Expense
  const expense = Number(
    summary?.monthly_expenses ?? overview?.monthly_expenses ?? 0
  );

  // 4. Dynamic Net Savings / Surplus (Income - Expense)
  const savings = summary?.net_savings !== undefined && summary?.net_savings !== null
    ? Number(summary.net_savings)
    : overview?.net_savings !== undefined && overview?.net_savings !== null
    ? Number(overview.net_savings)
    : (income - expense);

  // 5. Dynamic Budget Allocated (Exact User Budget Allocation, e.g. ₹10,000)
  const budgetAllocated = Number(
    overview?.current_month_budget_total ?? summary?.budget_total ?? budgetOverview?.total_budget ?? 0
  );

  // 6. Dynamic Savings Efficiency Rate
  const savingsRate = income > 0
    ? ((savings / income) * 100)
    : Number(summary?.savings_rate ?? overview?.savings_rate ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-6"
    >
      {/* Top Header & Net Worth */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-outfit">
              Total Consolidated Net Worth
            </span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl sm:text-5xl font-black text-white tracking-tight font-outfit mt-1">
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* 4 Dynamic Mini Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat
          label="Monthly Income"
          value={formatCompactFinancial(income)}
          icon={TrendingUp}
          badgeStyle="border border-emerald-500/30 text-emerald-400 bg-transparent"
        />
        <MiniStat
          label="Monthly Expense"
          value={formatCompactFinancial(expense)}
          icon={TrendingDown}
          badgeStyle="border border-rose-500/30 text-rose-400 bg-transparent"
        />
        <MiniStat
          label="Net Surplus"
          value={formatCompactFinancial(savings)}
          icon={PiggyBank}
          badgeStyle="border border-sky-500/30 text-sky-400 bg-transparent"
        />
        <MiniStat
          label="Budget Allocated"
          value={formatCurrency(budgetAllocated)}
          icon={Wallet}
          badgeStyle="border border-violet-500/30 text-violet-400 bg-transparent"
        />
      </div>

      {/* Dynamic Savings Efficiency Bar */}
      <SavingsBar rate={savingsRate} />
    </motion.div>
  );
};

export default FinancialSummary;
