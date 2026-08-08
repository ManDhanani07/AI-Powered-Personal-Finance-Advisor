import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Repeat,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Target,
} from 'lucide-react';
import LiquidProgressGauge from './LiquidProgressGauge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const GoalVaultCard = ({ goal, onDeposit, onAutoSave, onEdit }) => {
  const target = parseFloat(goal.target_amount) || 0;
  const current = parseFloat(goal.current_amount) || 0;
  const pct = target > 0 ? (current / target) * 100 : 0;
  const isCompleted = pct >= 100;

  const accentColor = goal.color || (isCompleted ? '#10B981' : '#6366F1');

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass flex flex-col justify-between space-y-5 relative overflow-hidden"
    >
      {/* Top Row: Vault Title & Priority Badge */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              {goal.goal_name}
            </h4>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Reached
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {goal.goal_type || 'Savings Target Vault'}
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full border border-border-strong bg-bg-elevated text-[10px] font-extrabold uppercase text-slate-300">
          {goal.priority || 'MEDIUM'}
        </span>
      </div>

      {/* Center Layout: Liquid Progress Gauge + Savings Numbers */}
      <div className="flex items-center space-x-5 py-1">
        {/* SVG Liquid Fill Gauge */}
        <LiquidProgressGauge percentage={pct} color={accentColor} />

        {/* Amount Breakdown */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Vault Balance</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-outfit truncate">
            {formatCurrency(current)}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Target: <span className="font-bold text-slate-200">{formatCurrency(target)}</span>
          </p>
        </div>
      </div>

      {/* Goal Completion Projection Badge */}
      <div className="rounded-2xl border border-border-subtle bg-bg-elevated/60 p-3 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary-500" />
          <span>Target Date</span>
        </span>
        <span className="font-bold text-slate-900 dark:text-white">
          {goal.target_date ? formatDate(goal.target_date, 'MMM YYYY') : 'Dec 2026'}
        </span>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={() => onDeposit(goal)}
          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Deposit</span>
        </button>

        <button
          onClick={() => onAutoSave(goal)}
          className="flex-1 py-2.5 rounded-2xl border border-border-strong bg-bg-elevated hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1"
        >
          <Repeat className="w-3.5 h-3.5 text-amber-400" />
          <span>Auto-Save</span>
        </button>
      </div>
    </motion.div>
  );
};

export default GoalVaultCard;
