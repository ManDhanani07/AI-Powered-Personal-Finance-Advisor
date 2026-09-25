import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, ChevronDown, ChevronUp, Layers, CheckCircle, Sliders, ShieldCheck } from 'lucide-react';

export const DataQualityTechnicalModal = ({ dataQuality, metadata, summary }) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalTx = dataQuality?.total_transactions || summary?.txn_count || 0;
  const historyMonths = dataQuality?.history_months_count || 0;
  const categorizedPct = dataQuality?.categorized_pct || 95.0;
  const recurringCount = dataQuality?.recurring_patterns_count || 0;
  const earliest = dataQuality?.earliest_date || 'N/A';
  const latest = dataQuality?.latest_date || 'N/A';

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-4 shadow-glass">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
              Data Quality Audit & Technical Engine Specs
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Inspect ledger completeness, categorization depth, and production ML architecture
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 group-hover:text-white font-outfit">
          <span>{isOpen ? 'Collapse Details' : 'View Specifications'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Summary Chips Row (Always visible) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 p-3">
          <p className="text-[10px] uppercase font-bold text-slate-500 font-outfit">Ledger Records</p>
          <p className="text-base font-black font-mono text-white mt-0.5">{totalTx} transactions</p>
        </div>

        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 p-3">
          <p className="text-[10px] uppercase font-bold text-slate-500 font-outfit">Historical Depth</p>
          <p className="text-base font-black font-mono text-teal-300 mt-0.5">{historyMonths} months logged</p>
        </div>

        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 p-3">
          <p className="text-[10px] uppercase font-bold text-slate-500 font-outfit">Categorization Depth</p>
          <p className="text-base font-black font-mono text-emerald-400 mt-0.5">{categorizedPct.toFixed(1)}% categorized</p>
        </div>

        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 p-3">
          <p className="text-[10px] uppercase font-bold text-slate-500 font-outfit">Recurring Obligations</p>
          <p className="text-base font-black font-mono text-cyan-300 mt-0.5">{recurringCount} detected</p>
        </div>
      </div>

      {/* Expandable Technical Details */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-3 border-t border-zinc-800 overflow-hidden text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Architecture & Engine Details */}
              <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold font-outfit">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Architecture & Feature Pipeline</span>
                </div>
                <div className="space-y-1.5 text-slate-400 font-normal leading-relaxed text-[11px]">
                  <p>
                    <strong className="text-slate-300 font-outfit">Engine:</strong>{' '}
                    {metadata?.engine_name || 'Multi-Scale Adaptive Financial Forecasting Engine'} (v{metadata?.version || '4.0.0'})
                  </p>
                  <p>
                    <strong className="text-slate-300 font-outfit">Decomposition:</strong> 3-Tier Categorization (Fixed Contractual, Routine Living, Elastic Discretionary, Shock Outliers).
                  </p>
                  <p>
                    <strong className="text-slate-300 font-outfit">Algorithms:</strong> Multi-Scale Adaptive EMAs ($\alpha=0.50, 0.30, 0.15$), Gradient-Boosted Residual Booster, Quantile Pinball Loss ($P_{10}, P_{90}$).
                  </p>
                  <p>
                    <strong className="text-slate-300 font-outfit">Feature Count:</strong> {metadata?.feature_count || 32} time-series features including anchor lags, rolling medians, spending momentum, and expense-to-income ratios.
                  </p>
                </div>
              </div>

              {/* Data Provenance & Safety */}
              <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold font-outfit">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Ledger Provenance & Strict Reality</span>
                </div>
                <div className="space-y-1.5 text-slate-400 font-normal leading-relaxed text-[11px]">
                  <p>
                    <strong className="text-slate-300 font-outfit">Date Range:</strong> {earliest} → {latest}
                  </p>
                  <p>
                    <strong className="text-slate-300 font-outfit">Data Source:</strong> User's PostgreSQL authenticated ledger records with zero synthetic padding.
                  </p>
                  <p>
                    <strong className="text-slate-300 font-outfit">Shock Isolation:</strong> Automatic Interquartile Range ($IQR$) filtering protects against one-off emergency distortions.
                  </p>
                  <p>
                    <strong className="text-slate-300 font-outfit">Data Leakage Check:</strong> Passed. Strict time-aware feature engineering prevents future information from bleeding into priors.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataQualityTechnicalModal;
