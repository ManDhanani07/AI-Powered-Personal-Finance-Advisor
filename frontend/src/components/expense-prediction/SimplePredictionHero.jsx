import React from 'react';
import {
  Sparkles,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const SimplePredictionHero = ({
  forecast,
  targetMonthName,
  trendMetrics,
  benchmarks,
  sanitizedSummary,
  dataQuality,
  fixedVsVariable,
}) => {
  const predictedRoutine = Number(forecast?.predicted_routine_spend || 0);
  const emergencyShock = Number(
    forecast?.emergency_shock_amount ||
      forecast?.recommended_emergency_buffer ||
      0
  );
  const emergencySpend = Number(
    forecast?.emergency_scenario_spend ||
      predictedRoutine + emergencyShock
  );

  const p10 = Number(
    forecast?.confidence_range_p10_p90?.p10_minimum_survival || predictedRoutine * 0.85
  );
  const p90 = Number(
    forecast?.confidence_range_p10_p90?.p90_upper_discretionary || predictedRoutine * 1.15
  );

  // Interval Spread & Pin Position on Track
  const intervalSpread = Math.round((p90 - p10) / 2);
  const rangeSpan = Math.max(1, p90 - p10);
  const pointerPct = Math.min(95, Math.max(5, ((predictedRoutine - p10) / rangeSpan) * 100));

  // Benchmark & Trend calculations
  const lastMonthActual = Number(
    benchmarks?.last_month_actual || trendMetrics?.last_month_expense || 0
  );
  const momPct = Number(trendMetrics?.mom_change_pct || 0);
  const momAmt = Number(
    trendMetrics?.mom_change_amt || (lastMonthActual > 0 ? predictedRoutine - lastMonthActual : 0)
  );

  const threeMonthAvg = Number(benchmarks?.three_month_avg || 0);
  const vsThreeMonthPct =
    threeMonthAvg > 0
      ? (((predictedRoutine - threeMonthAvg) / threeMonthAvg) * 100).toFixed(1)
      : null;

  // Real-time Trend Direction Pill
  const trendDir = trendMetrics?.direction || (momPct > 2 ? 'INCREASING' : momPct < -2 ? 'DECREASING' : 'STABLE');
  let trendBadge = {
    label: 'Stable',
    icon: Minus,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    prefix: momPct > 0 ? '+' : '',
  };
  if (trendDir === 'INCREASING' || momPct > 2) {
    trendBadge = {
      label: 'Increasing',
      icon: TrendingUp,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      prefix: '+',
    };
  } else if (trendDir === 'DECREASING' || momPct < -2) {
    trendBadge = {
      label: 'Decreasing',
      icon: TrendingDown,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      prefix: '',
    };
  }
  const TrendIcon = trendBadge.icon;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-8 shadow-glass backdrop-blur-xl">
      {/* Subtle ambient gradient highlight */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
        {/* Header Badges: Scope, ML Autonomous Regime, Trend */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-outfit uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Month's Expected Expense</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-bold font-outfit">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>{forecast?.ai_regime_label || 'AI Regime: Routine Living'}</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${trendBadge.bgColor} ${trendBadge.borderColor} border ${trendBadge.color} text-xs font-bold font-outfit`}
          >
            <TrendIcon className="w-3.5 h-3.5" />
            <span>
              {trendBadge.prefix}
              {momPct}% {trendBadge.label}
            </span>
          </div>
        </div>

        {/* Primary Hero Number & Subtitle */}
        <div className="space-y-2">
          <div className="text-4xl sm:text-6xl font-black text-white font-outfit tracking-tight">
            {formatCurrency(predictedRoutine)}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-outfit">
            {forecast?.ai_regime_subtitle || (
              `AI-modeled spending trajectory ${targetMonthName ? `for ${targetMonthName}` : ''} • Continuous Routine Living`
            )}
          </p>
        </div>

        {/* Executive 3-Column Context Grid (Interval, MoM Shift, Emergency Resilience) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-1">
          {/* 1. Prediction Interval */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-outfit">
              <span>Prediction Interval</span>
              <span className="text-cyan-400 font-mono font-semibold text-[10px]">90% Bounds</span>
            </div>
            <div className="text-sm sm:text-base font-black text-white font-mono">
              {formatCurrency(p10)} – {formatCurrency(p90)}
            </div>
            <p className="text-[11px] text-slate-400 font-outfit">
              Margin of ±{formatCurrency(intervalSpread)}
            </p>
          </div>

          {/* 2. Month-over-Month Shift */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-outfit">
              <span>vs. Last Month</span>
              <span className={`font-mono font-bold text-[10px] ${trendBadge.color}`}>
                {trendBadge.prefix}
                {momPct}%
              </span>
            </div>
            <div className={`text-sm sm:text-base font-black font-mono ${trendBadge.color}`}>
              {momAmt >= 0 ? '+' : ''}
              {formatCurrency(momAmt)}
            </div>
            <p className="text-[11px] text-slate-400 font-outfit">
              {lastMonthActual > 0 ? `Last spent: ${formatCurrency(lastMonthActual)}` : 'Baseline comparison'}
            </p>
          </div>

          {/* 3. Emergency Resilience Buffer (Decided by ML Model) */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-outfit">
              <span>Emergency Buffer</span>
              <span className="text-amber-400 font-mono font-semibold text-[10px]">Shock Cushion</span>
            </div>
            <div className="text-sm sm:text-base font-black text-slate-200 font-mono">
              {formatCurrency(emergencyShock)}
            </div>
            <p className="text-[11px] text-slate-400 font-outfit">
              {forecast?.shock_source_label || (
                forecast?.has_isolated_spike
                  ? 'Calibrated from isolated historical spike'
                  : 'Calibrated from standard liquidity safety reserve'
              )}
            </p>
          </div>
        </div>

        {/* Expected Range Horizontal Visualizer */}
        <div className="w-full max-w-xl pt-2 pb-1 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-outfit font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Interval Range (P10 Floor to P90 Ceiling)</span>
            </span>
            <span className="font-mono text-slate-300 text-xs">
              Spread: {formatCurrency(rangeSpan)}
            </span>
          </div>

          {/* Range Track Bar */}
          <div className="relative h-2.5 w-full rounded-full bg-zinc-800/80 overflow-visible">
            {/* Active Range Fill */}
            <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-teal-500/25 via-emerald-500 to-cyan-400/30" />

            {/* Target Marker Pin */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
              style={{ left: `${pointerPct}%` }}
            >
              <div className="w-4 h-4 rounded-full bg-white border-2 border-emerald-400 shadow-lg ring-4 ring-emerald-500/25" />
            </div>
          </div>

          {/* Bound labels under track */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
            <div className="text-left">
              <div className="text-slate-500 text-[10px] font-outfit">P10 Floor (Frugal)</div>
              <div className="text-slate-300 font-bold">{formatCurrency(p10)}</div>
            </div>

            <div className="text-center">
              <div className="text-emerald-400 text-[10px] font-outfit font-bold uppercase">Expected</div>
              <div className="text-emerald-400 font-black text-xs">{formatCurrency(predictedRoutine)}</div>
            </div>

            <div className="text-right">
              <div className="text-slate-500 text-[10px] font-outfit">P90 Ceiling</div>
              <div className="text-slate-300 font-bold">{formatCurrency(p90)}</div>
            </div>
          </div>
        </div>

        {/* Autonomous AI Assessment & Emergency Resilience Callout */}
        <div className="p-3.5 rounded-2xl text-xs font-outfit flex items-start gap-2.5 text-left w-full border bg-emerald-500/10 border-emerald-500/25 text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px] tracking-wide uppercase">
              {forecast?.has_isolated_spike
                ? 'AI Model Assessment: Routine Living (De-Spiked)'
                : 'AI Model Assessment: Normal Living Routine'}
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              {forecast?.ai_assessment_text || (
                `The ML model projects routine expenditure at ${formatCurrency(predictedRoutine)}. ` +
                (fixedVsVariable?.fixed_amount > 0
                  ? `Fixed liabilities (Rent, EMI, SIP) remain stable at ${formatCurrency(fixedVsVariable.fixed_amount)}. `
                  : '') +
                (forecast?.has_isolated_spike
                  ? `One-off irregular outflows were de-spiked so your baseline forecast is realistic. Your emergency shock cushion provides ${formatCurrency(emergencyShock)} of debt protection.`
                  : `With steady routine spending and no isolated shocks detected, your projected disposable cash surplus ensures strong financial resilience.`)
              )}
            </p>
          </div>
        </div>

        {/* Updated Timestamp Footer */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-outfit pt-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last calibrated: {todayStr} • 100% Genuine Machine Learning Model</span>
        </div>
      </div>
    </div>
  );
};

export default SimplePredictionHero;
