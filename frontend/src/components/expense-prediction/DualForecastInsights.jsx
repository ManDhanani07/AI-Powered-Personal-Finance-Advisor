import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Sliders, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const DualForecastInsights = ({ drivers, confidenceRange, predictedSpend }) => {
  const p10 = Number(confidenceRange?.p10_minimum_survival || predictedSpend * 0.85 || 0);
  const p50 = Number(confidenceRange?.p50_expected_routine || predictedSpend || 0);
  const p90 = Number(confidenceRange?.p90_upper_discretionary || predictedSpend * 1.15 || 0);

  // Calculate percentage position of p50 relative to p10 and p90
  const rangeSpan = p90 - p10;
  const p50Pct = rangeSpan > 0 ? Math.min(95, Math.max(5, ((p50 - p10) / rangeSpan) * 100)) : 50;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Card: WHY THIS FORECAST? */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-4 shadow-glass"
      >
        <div className="flex items-center space-x-2.5 border-b border-zinc-800/80 pb-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-outfit uppercase tracking-wider">
              Why This Forecast?
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Key econometric drivers extracted from your recent ledger records
            </p>
          </div>
        </div>

        <ul className="space-y-3 pt-1">
          {drivers && drivers.length > 0 ? (
            drivers.map((driver, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 hover:border-zinc-700 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-medium">{driver.replace(/^•\s*/, '')}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-400 italic">
              • Historical spending series baseline initialized.
            </li>
          )}
        </ul>
      </motion.div>

      {/* Right Card: FORECAST RANGE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5 shadow-glass"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-outfit uppercase tracking-wider">
                Forecast Range
              </h3>
              <p className="text-xs text-slate-400 font-normal">
                Quantile spending spectrum (P10 to P90 bounds)
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-mono font-bold border border-cyan-500/20">
            P10–P90 Interval
          </span>
        </div>

        {/* Big Range Values */}
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tight">
            {formatCurrency(p10)} — {formatCurrency(p90)}
          </p>
          <p className="text-xs font-bold text-emerald-400 font-outfit">
            Expected: <span className="text-sm font-black text-white">{formatCurrency(p50)}</span>
          </p>
        </div>

        {/* Visual Progress Bar Gauge */}
        <div className="space-y-2 pt-2">
          <div className="relative h-3 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-visible">
            <div
              className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-500/50 via-cyan-500/60 to-purple-500/50"
              style={{ left: '0%', width: '100%' }}
            />
            {/* Expected Center Indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${p50Pct}%` }}
            >
              <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-zinc-950 shadow-lg animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium font-mono pt-1">
            <span>Frugal Floor: {formatCurrency(p10)}</span>
            <span className="text-cyan-300 font-bold">Expected ({p50Pct.toFixed(0)}%)</span>
            <span>Peak Cap: {formatCurrency(p90)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DualForecastInsights;
