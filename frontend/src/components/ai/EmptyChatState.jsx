import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, ShieldCheck, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const EmptyChatState = ({ summaryContext, onSelectQuestion }) => {
  const overview = summaryContext?.overview;
  const income = Number(overview?.monthly_income ?? overview?.total_income ?? 0);
  const expense = Number(overview?.monthly_expenses ?? overview?.total_expenses ?? 0);
  const surplus = Number(overview?.net_savings ?? overview?.net_surplus ?? (income - expense));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-6 max-w-2xl mx-auto"
    >
      {/* Bot Icon Glow */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary-500 to-indigo-600 opacity-20 blur-xl animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-2xl">
          <Bot className="h-8 w-8" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">
          Gemini AI Financial Copilot
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Powered directly by your live PostgreSQL transaction history. Ask questions about your spending, budget capacity, or Section 80C tax optimization.
        </p>
      </div>

      {/* Live Financial Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-2">
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-3.5 shadow-glass flex items-center space-x-3 text-left">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Income</p>
            <p className="text-sm font-extrabold text-white font-outfit">{formatCurrency(income)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-3.5 shadow-glass flex items-center space-x-3 text-left">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Expenses</p>
            <p className="text-sm font-extrabold text-white font-outfit">{formatCurrency(expense)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-3.5 shadow-glass flex items-center space-x-3 text-left">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Net Surplus</p>
            <p className="text-sm font-extrabold text-indigo-400 font-outfit">{formatCurrency(surplus)}</p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>100% PostgreSQL Ledger Verified • Zero Hallucinations</span>
      </div>
    </motion.div>
  );
};

export default EmptyChatState;
