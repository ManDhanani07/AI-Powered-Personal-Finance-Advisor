import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const ForecastSummary = ({ summaryData, periodDays, loading }) => {
  if (loading || !summaryData) {
    return (
      <div className="animate-pulse p-6 rounded-3xl border border-border-subtle bg-bg-surface space-y-3">
        <div className="h-5 bg-slate-800 rounded w-1/3" />
        <div className="h-10 bg-slate-800/60 rounded-2xl w-2/3" />
      </div>
    );
  }

  const metrics = summaryData?.accuracy_metrics;
  const mae = metrics?.mae ? Number(metrics.mae) : 0;
  const mape = metrics?.mape ? Number(metrics.mape) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl border border-primary-500/30 bg-gradient-to-r from-primary-950/40 via-bg-surface to-indigo-950/30 p-6 shadow-2xl backdrop-blur-xl"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Meta Prophet Engine Active • {periodDays}-Day Horizon</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-outfit tracking-tight leading-tight">
            AI Time-Series Financial Outlook
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Models trained exclusively on your live transaction history using Meta Prophet decomposition to forecast cash flow trajectories and risk alerts.
          </p>
        </div>

        {/* Model Accuracy Metrics Badge */}
        {metrics && (
          <div className="flex flex-wrap items-center gap-4 bg-bg-elevated/80 border border-border-strong rounded-2xl p-4 shrink-0 shadow-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                <Activity className="w-3 h-3 text-indigo-400" />
                <span>Accuracy (MAPE)</span>
              </div>
              <p className="text-base font-extrabold text-emerald-400 font-outfit">
                {mape > 0 ? `${(100 - mape).toFixed(1)}%` : 'N/A'}
              </p>
            </div>

            <div className="h-8 w-px bg-border-subtle" />

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Mean Error (MAE)</span>
              </div>
              <p className="text-base font-extrabold text-white font-outfit">
                {formatCurrency(mae)}
              </p>
            </div>

            <div className="h-8 w-px bg-border-subtle" />

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>Training Days</span>
              </div>
              <p className="text-base font-extrabold text-sky-400 font-outfit">
                {metrics.data_points_count} Days
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ForecastSummary;
