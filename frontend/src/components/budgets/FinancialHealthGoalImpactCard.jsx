import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const FinancialHealthGoalImpactCard = ({ healthImpact, goalImpact }) => {
  const { previous_score = 78.5, current_score = 67.8, reasons = [] } = healthImpact || {};
  const { overspending_amount = 0, delayed_goals = [] } = goalImpact || {};

  const isScoreDropped = current_score < previous_score;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Financial Health Score Impact */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border-strong bg-bg-surface/90 p-6 shadow-glass backdrop-blur-xl space-y-5"
      >
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 font-bold">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              Financial Health Score Impact
            </h3>
            <p className="text-xs text-slate-400">
              Live recalculation based on current envelope utilization & budget health
            </p>
          </div>
        </div>

        <div className="flex items-center justify-around rounded-2xl border border-border-subtle bg-bg-surface-soft/60 p-4">
          <div className="text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Previous Score
            </p>
            <p className="text-2xl font-black text-slate-500 font-outfit mt-1">
              {previous_score}
            </p>
          </div>

          <ArrowRight className="h-5 w-5 text-slate-400" />

          <div className="text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Current Score
            </p>
            <p
              className={`text-2xl font-black font-outfit mt-1 ${
                isScoreDropped ? 'text-red-500' : 'text-emerald-500'
              }`}
            >
              {current_score}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Score Penalties / Reasons:
          </p>
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {reason}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Goal Impact */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-border-strong bg-bg-surface/90 p-6 shadow-glass backdrop-blur-xl space-y-5"
      >
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 font-bold">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              Goal Vault Target Impact
            </h3>
            <p className="text-xs text-slate-400">
              Estimated completion delays on savings targets caused by overspending
            </p>
          </div>
        </div>

        {delayed_goals.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center space-y-2">
            <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-900 dark:text-white font-outfit">
              Zero Goal Vault Delays Detected
            </p>
            <p className="text-[11px] text-slate-400">
              Your goal progress targets are fully on track according to current budget allocations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {delayed_goals.map((g, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xs shrink-0">
                    🎯
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white font-outfit">
                      {g.goal_name}
                    </h5>
                    <p className="text-[11px] font-semibold text-amber-500 mt-0.5">
                      {g.delay_text}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black text-amber-500 uppercase tracking-wider shrink-0 border border-amber-500/30">
                  +{g.delay_days} Days Delay
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FinancialHealthGoalImpactCard;
