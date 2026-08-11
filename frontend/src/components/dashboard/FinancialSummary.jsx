import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

const MiniStat = ({ label, value, icon: Icon, colorClass }) => (
  <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#121216] shadow-md">
    <div className={`p-2 rounded-xl bg-zinc-800 ${colorClass}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-outfit">{label}</span>
      <span className="text-base font-black text-white font-outfit mt-0.5">{value}</span>
    </div>
  </div>
);

const SavingsBar = ({ rate }) => {
  const pct = Math.min(Math.max(Number(rate) || 0, 0), 100);
  const color = pct >= 30 ? 'bg-emerald-500' : pct >= 15 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-300 font-outfit uppercase tracking-wider">
          Monthly Savings Efficiency
        </span>
        <span className="text-xs font-black text-emerald-400 font-mono">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-zinc-900 overflow-hidden p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color} shadow-sm`}
        />
      </div>
    </div>
  );
};

export const FinancialSummary = ({ summary, loading }) => {
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

  const income = Number(summary?.monthly_income ?? 0);
  const expense = Number(summary?.monthly_expenses ?? 0);
  const savings = Number(summary?.net_savings ?? 0);
  const balance = Number(summary?.total_balance ?? 0);
  const budgetRem = Number(summary?.budget_remaining ?? 0);
  const savingsRate = Number(summary?.savings_rate ?? 0);

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
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-outfit">
              Total Consolidated Net Worth
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl sm:text-5xl font-black text-white tracking-tight font-outfit mt-1">
            {formatCurrency(balance)}
          </p>
        </div>

        <div className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xs font-extrabold uppercase tracking-wider font-outfit">
          ✓ Bank Synced
        </div>
      </div>

      {/* 4 Mini Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Monthly Income" value={formatCompactFinancial(income)} icon={TrendingUp} colorClass="text-emerald-400" />
        <MiniStat label="Monthly Expense" value={formatCompactFinancial(expense)} icon={TrendingDown} colorClass="text-rose-400" />
        <MiniStat label="Net Surplus" value={formatCompactFinancial(savings)} icon={PiggyBank} colorClass="text-sky-400" />
        <MiniStat label="Budget Unallocated" value={formatCompactFinancial(budgetRem)} icon={Wallet} colorClass="text-amber-400" />
      </div>

      {/* Savings Efficiency Bar */}
      <SavingsBar rate={savingsRate} />
    </motion.div>
  );
};

export default FinancialSummary;
