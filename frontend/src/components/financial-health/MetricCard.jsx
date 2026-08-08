import React from 'react';
import { motion } from 'framer-motion';
import {
  PiggyBank,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const PARAMETER_ICONS = {
  savings_rate: { icon: PiggyBank, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  budget_discipline: { icon: PieChart, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  income_stability: { icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  expense_stability: { icon: TrendingDown, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  goal_progress: { icon: Target, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  emergency_fund: { icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  debt_ratio: { icon: CreditCard, color: 'text-rose-400', bg: 'bg-rose-500/10' },
};

const STATUS_STYLES = {
  EXCELLENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  GOOD: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  FAIR: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  POOR: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export const MetricCard = ({ parameters = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {parameters.map((param, idx) => {
        const iconConfig = PARAMETER_ICONS[param.key] || {
          icon: CheckCircle2,
          color: 'text-primary-400',
          bg: 'bg-primary-500/10',
        };
        const Icon = iconConfig.icon;
        const statusStyle = STATUS_STYLES[param.status] || STATUS_STYLES['GOOD'];
        const scorePct = Math.min(100, Math.max(0, (param.score / param.max_score) * 100));

        return (
          <motion.div
            key={param.key || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-border-subtle bg-bg-surface p-5 shadow-glass hover:border-primary-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-2xl ${iconConfig.bg} ${iconConfig.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white font-outfit">
                      {param.name}
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Weight: {param.weight_pct}%
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusStyle}`}>
                  {param.status}
                </span>
              </div>

              {/* Value and Score */}
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-black text-white font-outfit">
                  {param.value_text}
                </span>
                <span className="text-xs font-mono font-bold text-primary-400">
                  {param.score} / {param.max_score} pts
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 rounded-full bg-bg-elevated overflow-hidden p-0.5 border border-border-subtle">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePct}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                  className={`h-full rounded-full ${
                    scorePct >= 80
                      ? 'bg-emerald-500'
                      : scorePct >= 50
                      ? 'bg-primary-500'
                      : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>

            {/* Generated Rule Insight */}
            <div className="pt-3 border-t border-border-subtle flex items-start space-x-2 text-xs text-slate-300">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="leading-tight font-normal">{param.insight}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MetricCard;
