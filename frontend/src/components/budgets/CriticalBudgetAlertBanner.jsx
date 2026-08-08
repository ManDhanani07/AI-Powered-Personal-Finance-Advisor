import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowUpRight, Bot, RefreshCw, X, ShieldAlert, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CriticalBudgetAlertBanner = ({
  bannerData,
  onOpenReallocate,
  onOpenIncrease,
  onIgnoreWarning,
}) => {
  const navigate = useNavigate();

  if (!bannerData) return null;

  const {
    title = '🚨 Budget Exceeded',
    message = 'You have exceeded your monthly budget.',
    budget = 0,
    spent = 0,
    exceeded_amount = 0,
    exceeded_percentage = 0,
    priority = 'CRITICAL',
  } = bannerData;

  const handleAskAI = () => {
    navigate('/ai', { state: { prefill: 'Why is my budget over?' } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border-2 border-red-500/40 bg-gradient-to-r from-red-950/80 via-red-900/60 to-rose-950/80 p-6 text-white shadow-2xl backdrop-blur-xl"
    >
      {/* Background Glow Overlay */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-red-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-rose-600/20 blur-3xl" />

      <div className="relative z-10 space-y-5">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-red-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 ring-2 ring-red-500/40 animate-pulse">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white font-outfit">
                  {title}
                </h3>
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                  Priority: {priority}
                </span>
              </div>
              <p className="text-xs font-medium text-red-200/90 mt-0.5">{message}</p>
            </div>
          </div>

          <button
            onClick={onIgnoreWarning}
            className="rounded-xl p-2 text-red-300 hover:bg-red-500/20 hover:text-white transition-colors"
            title="Ignore Warning"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-red-500/20 bg-black/30 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-red-200/70 uppercase tracking-wider">
              Allocated Budget
            </p>
            <p className="text-base font-bold text-white font-outfit mt-1">
              ₹{budget.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-black/30 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-red-200/70 uppercase tracking-wider">
              Amount Spent
            </p>
            <p className="text-base font-bold text-red-300 font-outfit mt-1">
              ₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/20 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-red-100 uppercase tracking-wider">
              Exceeded Amount
            </p>
            <p className="text-base font-black text-red-200 font-outfit mt-1">
              ₹{exceeded_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/20 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-red-100 uppercase tracking-wider">
              Exceeded %
            </p>
            <p className="text-base font-black text-rose-200 font-outfit mt-1">
              +{exceeded_percentage}%
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenReallocate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-4 py-2 text-xs font-bold text-white shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reallocate Budget</span>
            </button>

            <button
              onClick={onOpenIncrease}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-4 py-2 text-xs font-bold text-white shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Increase Budget</span>
            </button>

            <button
              onClick={handleAskAI}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-amber-500 hover:from-primary-600 hover:to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Ask AI: Why is my budget over?</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CriticalBudgetAlertBanner;
