import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const CashFlowForecastCard = ({ cashFlow, forecast, summary }) => {
  const income = Number(cashFlow?.expected_income || summary?.robust_income || 0);
  const expense = Number(cashFlow?.predicted_expenses || forecast?.predicted_routine_spend || 0);
  const netCash = Number(cashFlow?.net_cash_flow !== undefined ? cashFlow.net_cash_flow : (income - expense));
  const savingsRate = Number(cashFlow?.savings_rate_pct !== undefined ? cashFlow.savings_rate_pct : (income > 0 ? ((netCash / income) * 100) : 0));
  const incomeAvailable = cashFlow?.income_available ?? (income > 0);

  const isSurplus = netCash >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5 shadow-glass"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider">
              Cash Flow Forecast
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Projected net liquidity surplus derived from actual income and predicted outflows
            </p>
          </div>
        </div>

        {incomeAvailable && (
          <span className="px-3 py-1 rounded-full text-xs font-bold font-outfit bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {savingsRate.toFixed(1)}% Projected Savings Rate
          </span>
        )}
      </div>

      {!incomeAvailable ? (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Income forecast unavailable. Log an income deposit transaction to calculate real net disposable liquidity.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Expected Income */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-1 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 font-outfit">
              <span>Expected Monthly Income</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {formatCurrency(income)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Robust recurring baseline income
            </p>
          </div>

          {/* Predicted Expenses */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-1 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 font-outfit">
              <span>Predicted Outflows</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-rose-300 font-mono tracking-tight">
              {formatCurrency(expense)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Multi-scale AI forecast
            </p>
          </div>

          {/* Expected Remaining Cash */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-1 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 font-outfit">
              <span>Expected Net Surplus</span>
              <Wallet className={`w-3.5 h-3.5 ${isSurplus ? 'text-emerald-400' : 'text-rose-400'}`} />
            </div>
            <p className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isSurplus ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(netCash)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {isSurplus ? 'Available for savings & investments' : 'Projected monthly cash deficit'}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CashFlowForecastCard;
