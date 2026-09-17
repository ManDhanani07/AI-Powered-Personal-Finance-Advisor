import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { ROUTES } from '../../constants/index.js';

export const AiForecastInsightCard = ({ audit, forecast }) => {
  const navigate = useNavigate();
  const insight =
    audit?.advisor_insight ||
    'Your expenses are expected to remain relatively stable next month. Routine bills and essential living commitments remain well-balanced with disposable cash reserves.';

  const handleAskAI = () => {
    const monthName = forecast?.target_month_name || 'upcoming month';
    const predAmt = forecast?.predicted_routine_spend || 0;
    const promptText = `Can you analyze my expense prediction for ${monthName} (expected ₹${predAmt.toLocaleString('en-IN')}) and suggest actionable ways to optimize my budget and maximize savings?`;
    
    navigate(ROUTES.AI_ADVISOR, { state: { prefilledPrompt: promptText } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#09090B] via-[#0D1514] to-[#09090B] p-6 sm:p-8 space-y-6 shadow-glass relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 space-y-5">
        <div className="flex items-center space-x-3.5 border-b border-zinc-800/80 pb-3.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center space-y-0.5">
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider leading-tight">
              AI Forecast Insight
            </h3>
            <p className="text-xs text-slate-400 font-normal leading-normal">
              Autonomous generative advisory powered by Deep Intelligence
            </p>
          </div>
        </div>

        {/* High-Contrast Visible Insight Box */}
        <div className="p-6 rounded-2xl bg-zinc-900/95 border border-zinc-800 border-l-4 border-l-emerald-400 shadow-xl space-y-4">
          <div className="flex items-start gap-4">
            <span className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </span>
            <div className="space-y-2 flex-1">
              <p className="text-base sm:text-xl font-bold text-white leading-relaxed font-outfit tracking-wide">
                "{insight}"
              </p>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Autonomous advisory synthesized from routine billing patterns, discretionary variance, and disposable cash reserves.
              </p>
            </div>
          </div>

          {/* Contextual Metric Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-zinc-800/80">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Liquidity: Optimal</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Savings Capacity: High</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Horizon: Next Cycle</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleAskAI}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer font-outfit"
          >
            <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Ask AI About Forecast</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AiForecastInsightCard;
