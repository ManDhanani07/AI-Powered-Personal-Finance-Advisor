import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, TrendingUp, PiggyBank, DollarSign, Sparkles } from 'lucide-react';

export const MetaProphetBudgetCard = ({ forecastData }) => {
  if (!forecastData) return null;

  const {
    expected_monthly_expense = 0,
    forecast_increase_pct = 0,
    forecasted_savings = 0,
    forecasted_cash_flow = 0,
    message = 'Based on current spending, your expected monthly expense is calculated using Meta Prophet ML.',
  } = forecastData;

  const isPositiveCashflow = forecasted_cash_flow >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-primary-500/30 bg-gradient-to-br from-slate-900/90 via-primary-950/40 to-slate-900/90 p-6 text-white shadow-glass backdrop-blur-xl space-y-5"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-primary-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-400 font-bold ring-1 ring-primary-500/30">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-outfit">
                Meta Prophet ML Expense Forecast
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/20 px-2.5 py-0.5 text-[10px] font-bold text-primary-300">
                <Sparkles className="h-3 w-3" />
                Live Prophet Model
              </span>
            </div>
            <p className="text-xs text-slate-300/90 mt-0.5">{message}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-primary-500/20 bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <span>Expected Monthly Expense</span>
          </div>
          <p className="text-lg font-black text-amber-300 font-outfit">
            ₹{expected_monthly_expense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] font-semibold text-amber-400/80 mt-1">
            +{forecast_increase_pct}% vs allocated budget cap
          </p>
        </div>

        <div className="rounded-2xl border border-primary-500/20 bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <PiggyBank className="h-3.5 w-3.5 text-emerald-400" />
            <span>Forecasted Savings</span>
          </div>
          <p className="text-lg font-black text-emerald-400 font-outfit">
            ₹{forecasted_savings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] font-semibold text-slate-400 mt-1">
            Projected month-end reserve
          </p>
        </div>

        <div className="rounded-2xl border border-primary-500/20 bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
            <span>Forecasted Cash Flow</span>
          </div>
          <p
            className={`text-lg font-black font-outfit ${
              isPositiveCashflow ? 'text-indigo-300' : 'text-red-400'
            }`}
          >
            ₹{forecasted_cash_flow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] font-semibold text-slate-400 mt-1">
            {isPositiveCashflow ? 'Surplus cash trajectory' : 'Deficit cash trajectory'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MetaProphetBudgetCard;
