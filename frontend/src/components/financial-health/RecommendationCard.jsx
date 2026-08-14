import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/index.js';

const IMPACT_CONFIG = {
  HIGH: {
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    border: 'border-l-rose-500',
    icon: AlertTriangle,
  },
  MEDIUM: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    border: 'border-l-amber-500',
    icon: Zap,
  },
  LOW: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    border: 'border-l-emerald-500',
    icon: ShieldCheck,
  },
};

const CATEGORY_COLORS = {
  BUDGET: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  GOALS: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  EMERGENCY: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SAVINGS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DEBT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  INCOME: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

export const RecommendationCard = ({ recommendations = [] }) => {
  const navigate = useNavigate();

  const handleAction = (rec) => {
    if (rec.category === 'BUDGET') navigate(ROUTES.BUDGETS);
    else if (rec.category === 'GOALS' || rec.category === 'EMERGENCY') navigate(ROUTES.GOALS);
    else if (rec.category === 'SAVINGS' || rec.category === 'DEBT') navigate(ROUTES.TRANSACTIONS);
    else navigate(ROUTES.DASHBOARD);
  };

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-outfit">
              Prioritized Action Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Rule-based recommendations calculated from transaction ledger parameter evaluation
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-bold font-mono">
          {recommendations.length} Actions Available
        </span>
      </div>

      {/* Action Items List - Open Feed without outer Card */}
      <div className="grid grid-cols-1 gap-3">
        {recommendations.map((rec, idx) => {
          const impact = IMPACT_CONFIG[rec.impact] || IMPACT_CONFIG['MEDIUM'];
          const categoryBadge = CATEGORY_COLORS[rec.category] || 'bg-zinc-800 text-slate-300 border-zinc-700';
          const ImpactIcon = impact.icon;

          return (
            <motion.div
              key={rec.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`p-4 border-l-4 ${impact.border} border-y border-r border-zinc-800/80 bg-zinc-900/30 rounded-r-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all hover:bg-zinc-900/60 group`}
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${impact.badge} flex items-center gap-1`}>
                    <ImpactIcon className="w-3 h-3" />
                    {rec.impact} Impact
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${categoryBadge}`}>
                    {rec.category}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-white font-outfit">
                  {rec.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {rec.description}
                </p>
              </div>

              <button
                onClick={() => handleAction(rec)}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shadow-sm flex-shrink-0"
              >
                <span>Execute Action</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationCard;
