import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AIRecommendationsWidget = ({ recommendations = [] }) => {
  const navigate = useNavigate();

  const handleAskAI = () => {
    navigate('/ai', { state: { prefill: 'Why is my budget over?' } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-border-strong bg-gradient-to-br from-bg-surface via-bg-surface-soft to-bg-surface p-6 shadow-glass backdrop-blur-xl space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              AI Intelligent Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous expense-reduction and budget re-balancing copilot strategies
            </p>
          </div>
        </div>

        <button
          onClick={handleAskAI}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Bot className="h-4 w-4" />
          <span>Ask AI: Why is my budget over?</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border-subtle bg-bg-surface/60 p-4 flex items-start gap-3 hover:border-primary-500/30 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 shrink-0 font-bold">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white font-outfit">
                Recommendation #{idx + 1}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">{rec}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AIRecommendationsWidget;
