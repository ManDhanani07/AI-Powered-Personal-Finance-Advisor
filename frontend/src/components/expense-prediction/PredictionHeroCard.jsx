import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const PredictionHeroCard = ({
  forecast,
  summary,
  trendMetrics,
  benchmarks,
  futureProjections,
  selectedHorizon = '30d',
  onHorizonChange,
  isSimulated,
  onResetSimulation,
  generatedAt,
}) => {
  const baseMonthly = Number(forecast?.predicted_routine_spend || 0);
  const p10Monthly = Number(forecast?.confidence_range_p10_p90?.p10_minimum_survival || (baseMonthly * 0.85));
  const p90Monthly = Number(forecast?.confidence_range_p10_p90?.p90_upper_discretionary || (baseMonthly * 1.15));
  const threeMonthAvg = Number(benchmarks?.three_month_avg || baseMonthly);

  // Horizon scaling
  let displayAmount = baseMonthly;
  let p10Display = p10Monthly;
  let p90Display = p90Monthly;
  let horizonLabel = 'Next 30 Days';

  if (selectedHorizon === '7d') {
    displayAmount = (baseMonthly / 30) * 7;
    p10Display = (p10Monthly / 30) * 7;
    p90Display = (p90Monthly / 30) * 7;
    horizonLabel = 'Next 7 Days';
  } else if (selectedHorizon === '3m') {
    displayAmount = Number(futureProjections?.three_months || (baseMonthly * 3));
    p10Display = p10Monthly * 3;
    p90Display = p90Monthly * 3;
    horizonLabel = 'Next 3 Months';
  } else if (selectedHorizon === '6m') {
    displayAmount = Number(futureProjections?.six_months || (baseMonthly * 6));
    p10Display = p10Monthly * 6;
    p90Display = p90Monthly * 6;
    horizonLabel = 'Next 6 Months';
  }

  const momPct = Number(trendMetrics?.mom_change_pct || 0);
  const momDir = trendMetrics?.direction || 'STABLE';
  const confidenceTier = forecast?.confidence_tier || 'Adaptive Model Confidence';

  // Last updated time formatted
  const formattedTime = generatedAt
    ? new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Live';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-8 shadow-glass"
    >
      <div className="relative z-10 space-y-6">
        {/* Top Control Bar: Horizon Toggles + Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
            {[
              { id: '7d', label: 'Next 7 Days' },
              { id: '30d', label: 'Next 30 Days' },
              { id: '3m', label: 'Next 3 Months' },
              { id: '6m', label: 'Next 6 Months' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onHorizonChange && onHorizonChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-outfit transition-all cursor-pointer ${
                  selectedHorizon === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-outfit">
            {isSimulated && (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[10px] uppercase animate-pulse">
                  Simulation Mode Active
                </span>
                <button
                  onClick={onResetSimulation}
                  className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white transition-colors border border-zinc-700 text-xs font-bold"
                >
                  Reset
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Updated: {formattedTime}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-slate-300">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{confidenceTier}</span>
            </div>
          </div>
        </div>

        {/* Hero Headline & Amount Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Forecast Number */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-outfit">
                Expected Spending ({horizonLabel})
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {formatCurrency(displayAmount)}
              </h2>

              {/* MoM trend chip */}
              {selectedHorizon === '30d' && (
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black font-mono border ${
                    momDir === 'INCREASING'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : momDir === 'DECREASING'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-800 text-slate-300 border-zinc-700'
                  }`}
                >
                  {momDir === 'INCREASING' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : momDir === 'DECREASING' ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                  <span>{momPct > 0 ? `+${momPct}%` : `${momPct}%`}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Model estimate synthesized from time-series moving averages, fixed contractual commitments, and adaptive seasonality.
            </p>
          </div>

          {/* Statistical Bounds & Benchmark Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {/* Statistically Valid Interval */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase font-outfit">
                P10 - P90 Estimate Range
              </p>
              <p className="text-sm font-black font-mono text-cyan-300">
                {formatCurrency(p10Display)} - {formatCurrency(p90Display)}
              </p>
              <p className="text-[10px] text-slate-500">
                Empirical 80% confidence interval
              </p>
            </div>

            {/* Historical Average Comparison */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase font-outfit">
                3-Month Historical Avg
              </p>
              <p className="text-sm font-black font-mono text-slate-200">
                {formatCurrency(threeMonthAvg)}
              </p>
              <p className="text-[10px] text-slate-500">
                Prior quarterly benchmark
              </p>
            </div>

            {/* Safe Budget Ceiling */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase font-outfit">
                Safe Budget Ceiling
              </p>
              <p className="text-sm font-black font-mono text-emerald-400">
                {formatCurrency(forecast?.safe_total_budget_ceiling || displayAmount)}
              </p>
              <p className="text-[10px] text-slate-500">
                Includes calibrated cushion
              </p>
            </div>

            {/* Liquidity Buffer */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase font-outfit">
                Emergency Cushion
              </p>
              <p className="text-sm font-black font-mono text-amber-300">
                {formatCurrency(forecast?.recommended_emergency_buffer || 0)}
              </p>
              <p className="text-[10px] text-slate-500">
                Recommended liquid buffer
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionHeroCard;
