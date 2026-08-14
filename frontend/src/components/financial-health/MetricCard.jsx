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

const PARAMETER_CONFIG = {
  savings_rate: {
    icon: PiggyBank,
    name: 'Savings Rate',
    color: '#6366F1',
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    bar: 'bg-indigo-500',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  budget_discipline: {
    icon: PieChart,
    name: 'Budget Discipline',
    color: '#10B981',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  income_stability: {
    icon: TrendingUp,
    name: 'Income Stability',
    color: '#0EA5E9',
    text: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    bar: 'bg-sky-500',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  expense_stability: {
    icon: TrendingDown,
    name: 'Expense Control',
    color: '#F43F5E',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    bar: 'bg-rose-500',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  goal_progress: {
    icon: Target,
    name: 'Goal Velocity',
    color: '#8B5CF6',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    bar: 'bg-violet-500',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  },
  emergency_fund: {
    icon: ShieldCheck,
    name: 'Emergency Buffer',
    color: '#F59E0B',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    bar: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  debt_ratio: {
    icon: CreditCard,
    name: 'Debt Load Ratio',
    color: '#14B8A6',
    text: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    bar: 'bg-teal-500',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
};

const FALLBACK_PALETTES = [
  PARAMETER_CONFIG.savings_rate,
  PARAMETER_CONFIG.budget_discipline,
  PARAMETER_CONFIG.income_stability,
  PARAMETER_CONFIG.expense_stability,
  PARAMETER_CONFIG.goal_progress,
  PARAMETER_CONFIG.emergency_fund,
  PARAMETER_CONFIG.debt_ratio,
];

const STATUS_BADGES = {
  EXCELLENT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  GOOD: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  FAIR: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  POOR: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export const MetricCard = ({ parameters = [] }) => {
  return (
    <div className="divide-y divide-zinc-800/80">
      {parameters.map((param, idx) => {
        const palette = PARAMETER_CONFIG[param.key] || FALLBACK_PALETTES[idx % FALLBACK_PALETTES.length];
        const Icon = palette.icon || CheckCircle2;
        const statusBadge = STATUS_BADGES[param.status] || STATUS_BADGES['GOOD'];
        const scorePct = Math.min(100, Math.max(0, (param.score / param.max_score) * 100));

        return (
          <motion.div
            key={param.key || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="py-4 hover:bg-zinc-900/40 transition-colors px-2 rounded-lg"
          >
            {/* Linear Row Layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Parameter Icon & Name */}
              <div className="flex items-center space-x-3.5 min-w-[220px]">
                <div className={`p-2 rounded-xl ${palette.bg} ${palette.text} border ${palette.border} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-white font-outfit">
                      {param.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${statusBadge}`}>
                      {param.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Weight: {param.weight_pct}%
                  </span>
                </div>
              </div>

              {/* Metric Value */}
              <div className="min-w-[120px]">
                <span className={`text-xl font-black font-outfit ${palette.text}`}>
                  {param.value_text}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="flex-1 min-w-[180px] max-w-md space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-semibold">{scorePct.toFixed(0)}% score capacity</span>
                  <span className="text-slate-300 font-bold">
                    <span className={palette.text}>{param.score}</span> / {param.max_score} pts
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/80">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    className={`h-full rounded-full ${palette.bar}`}
                  />
                </div>
              </div>
            </div>

            {/* Sub-Insight Line */}
            <div className="mt-2.5 pl-12 flex items-center space-x-2 text-xs text-slate-400">
              <AlertCircle className={`w-3.5 h-3.5 ${palette.text} flex-shrink-0`} />
              <p className="leading-tight text-slate-400 font-normal">{param.insight}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MetricCard;
