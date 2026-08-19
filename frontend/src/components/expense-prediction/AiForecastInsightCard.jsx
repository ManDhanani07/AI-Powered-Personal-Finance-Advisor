import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
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

      <div className="relative z-10 space-y-4">
        <div className="flex items-center space-x-3 border-b border-zinc-800/80 pb-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider">
              🤖 AI Forecast Insight
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              Autonomous generative advisory powered by Deep Intelligence
            </p>
          </div>
        </div>

        {/* Quote Box */}
        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium italic">
            "{insight}"
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
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
