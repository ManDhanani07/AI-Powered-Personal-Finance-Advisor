import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, TrendingDown, ShieldAlert, PiggyBank, Lightbulb } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const AiRecommendationsSection = ({ recommendations }) => {
  const items = recommendations || [];

  if (items.length === 0) return null;

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'SAVINGS':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: TrendingDown,
        };
      case 'BUDGET_RISK':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: ShieldAlert,
        };
      case 'CASH_FLOW':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: PiggyBank,
        };
      default:
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: Lightbulb,
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 space-y-5 shadow-glass"
    >
      <div className="flex items-center space-x-2.5 border-b border-zinc-800/80 pb-3">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-black text-white font-outfit uppercase tracking-wider">
            AI Advisory & Strategic Recommendations
          </h3>
          <p className="text-xs text-slate-400 font-normal">
            Calculated opportunities to optimize cash allocation and reduce overspending exposure
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((rec, idx) => {
          const style = getBadgeStyle(rec.impact_type);
          const IconComp = style.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-outfit border ${style.bg}`}
                  >
                    <IconComp className="w-3 h-3" />
                    <span>{rec.category || 'Strategic Tip'}</span>
                  </span>

                  {rec.potential_impact > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Impact: {formatCurrency(rec.potential_impact)}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white font-outfit">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {rec.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>{rec.metric_text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AiRecommendationsSection;
