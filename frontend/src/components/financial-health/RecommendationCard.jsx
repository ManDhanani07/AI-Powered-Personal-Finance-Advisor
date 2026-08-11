import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/index.js';

const IMPACT_BADGES = {
  HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export const RecommendationCard = ({ recommendations = [] }) => {
  const navigate = useNavigate();

  const handleAction = (rec) => {
    if (rec.category === 'BUDGET') navigate(ROUTES.BUDGETS);
    else if (rec.category === 'GOALS' || rec.category === 'EMERGENCY') navigate(ROUTES.GOALS);
    else if (rec.category === 'SAVINGS' || rec.category === 'DEBT') navigate(ROUTES.TRANSACTIONS);
    else navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-outfit">
              Rule-Based Action Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Calculated dynamically from PostgreSQL database parameter evaluation
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#121216] text-indigo-400 text-xs font-bold font-mono">
          {recommendations.length} Actions
        </span>
      </div>

      <div className="space-y-3.5">
        {recommendations.map((rec, idx) => {
          const impactStyle = IMPACT_BADGES[rec.impact] || IMPACT_BADGES['MEDIUM'];
          return (
            <motion.div
              key={rec.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-4 rounded-2xl bg-[#121216] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all group shadow-md"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${impactStyle}`}>
                    {rec.impact} Impact
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Category: {rec.category}
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
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500 hover:text-white font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
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
