import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const PredictionTopKpiCards = ({ forecast, summary, trendMetrics, overspendingRisk }) => {
  const predicted = Number(forecast?.predicted_routine_spend || 0);
  const momPct = Number(trendMetrics?.mom_change_pct || 0);
  const direction = trendMetrics?.direction || 'STABLE';
  const directionSymbol = trendMetrics?.direction_symbol || '→';
  const directionLabel = trendMetrics?.direction_label || 'Stable';

  const riskPct = overspendingRisk?.risk_percentage ?? 24;
  const riskLevel = overspendingRisk?.risk_level || 'Low';

  // For expenses: decreasing is good [emerald/green], increasing is rose/red
  const isDecreasingExpense = momPct < 0;
  const isIncreasingExpense = momPct > 0;

  const trendColor =
    direction === 'INCREASING'
      ? 'text-rose-400'
      : direction === 'DECREASING'
      ? 'text-emerald-400'
      : 'text-cyan-400';

  const trendBg =
    direction === 'INCREASING'
      ? 'bg-rose-500/10 border-rose-500/20'
      : direction === 'DECREASING'
      ? 'bg-emerald-500/10 border-emerald-500/20'
      : 'bg-cyan-500/10 border-cyan-500/20';

  const riskBadgeColor =
    riskLevel.toLowerCase() === 'high'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      : riskLevel.toLowerCase() === 'medium'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Expected Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-zinc-800 bg-[#09090B] p-5 sm:p-6 space-y-3 hover:border-emerald-500/30 transition-all shadow-glass"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit">
            Expected Expenses
          </span>
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <p className="text-3xl sm:text-4xl font-black text-white font-outfit tracking-tight">
            {formatCurrency(predicted)}
          </p>
        </div>

        <div className="flex items-center space-x-2 pt-1 border-t border-zinc-900">
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono border ${
              isDecreasingExpense
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : isIncreasingExpense
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-zinc-800 text-slate-300 border-zinc-700'
            }`}
          >
            {isDecreasingExpense ? (
              <TrendingDown className="w-3 h-3" />
            ) : isIncreasingExpense ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>
              {isDecreasingExpense ? '↓' : isIncreasingExpense ? '↑' : ''}{' '}
              {Math.abs(momPct).toFixed(1)}% vs last month
            </span>
          </span>
        </div>
      </motion.div>

      {/* Card 2: Spending Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-3xl border border-zinc-800 bg-[#09090B] p-5 sm:p-6 space-y-3 hover:border-cyan-500/30 transition-all shadow-glass"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit">
            Spending Trend
          </span>
          <div className={`p-1.5 rounded-xl border ${trendBg}`}>
            {direction === 'INCREASING' ? (
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            ) : direction === 'DECREASING' ? (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl sm:text-3xl font-black font-outfit ${trendColor}`}>
            {directionSymbol} {directionLabel}
          </span>
        </div>

        <p className="text-xs text-slate-400 font-medium pt-1 border-t border-zinc-900 leading-relaxed">
          {direction === 'INCREASING'
            ? 'Recent spending velocity is expanding.'
            : direction === 'DECREASING'
            ? 'Expenses contracting toward lower baseline.'
            : 'Spending remains within steady normal bounds.'}
        </p>
      </motion.div>

      {/* Card 3: Overspending Risk */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-3xl border border-zinc-800 bg-[#09090B] p-5 sm:p-6 space-y-3 hover:border-purple-500/30 transition-all shadow-glass"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit">
            Overspending Risk
          </span>
          <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-3xl sm:text-4xl font-black text-white font-outfit tracking-tight">
            {riskPct}%
          </p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-outfit border ${riskBadgeColor}`}
          >
            {riskLevel} Risk
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden pt-0.5">
          <div
            style={{ width: `${Math.min(100, Math.max(5, riskPct))}%` }}
            className={`h-full rounded-full transition-all ${
              riskLevel.toLowerCase() === 'high'
                ? 'bg-rose-500'
                : riskLevel.toLowerCase() === 'medium'
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-cyan-400 to-sky-400'
            }`}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default PredictionTopKpiCards;
