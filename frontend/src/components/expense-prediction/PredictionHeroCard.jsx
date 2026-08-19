import React from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Calendar,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

export const PredictionHeroCard = ({ forecast, summary, isSimulated, onResetSimulation }) => {
  const predicted = Number(forecast?.predicted_routine_spend || 0);
  const fixedBills = Number(summary?.fixed_bills || summary?.recurring_bills || 0);
  const savings = Number(forecast?.estimated_monthly_savings || 0);
  const income = Number(summary?.robust_income || 0);
  const monthName = forecast?.target_month_name || 'Next Month';

  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : '0.0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#09090B] via-[#0E0F15] to-[#121420] p-6 sm:p-8 backdrop-blur-xl"
    >
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-outfit">
                  AI Expense Prediction & Outlook
                </span>
                {isSimulated && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[10px] font-outfit uppercase animate-pulse">
                    Simulation Active
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tight">
                {monthName} Spending Outlook
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isSimulated && (
              <button
                onClick={onResetSimulation}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer font-outfit border border-zinc-700"
              >
                Reset Simulation
              </button>
            )}
            <span className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] font-extrabold text-slate-300 flex items-center space-x-1.5 font-outfit">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{forecast?.confidence_tier || 'Adaptive Confidence'}</span>
            </span>
          </div>
        </div>

        {/* Core KPI Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Prediction */}
          <div className="rounded-2xl border border-zinc-800 bg-[#09090B]/90 p-5 space-y-1.5 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase text-slate-400 font-outfit">
              <span>Total Predicted Expense</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-outfit tracking-tight">
              {formatCurrency(predicted)}
            </p>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Auto-calibrated with seasonal demand & routine commitments.
            </p>
          </div>

          {/* Monthly Savings Surplus */}
          <div className="rounded-2xl border border-zinc-800 bg-[#09090B]/90 p-5 space-y-1.5 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase text-slate-400 font-outfit">
              <span>Projected Monthly Savings</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent font-outfit tracking-tight">
              {formatCurrency(savings)}
            </p>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Estimated <strong className="text-emerald-400">{savingsRate}%</strong> monthly savings rate retained.
            </p>
          </div>

          {/* Fixed Obligations Card */}
          <div className="rounded-2xl border border-zinc-800 bg-[#09090B]/90 p-5 space-y-1.5 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase text-slate-400 font-outfit">
              <span>Fixed Monthly Commitments</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-cyan-300 font-outfit tracking-tight">
              {formatCurrency(fixedBills)}
            </p>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Non-negotiable recurring rent, EMIs, utilities & subscriptions.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionHeroCard;
