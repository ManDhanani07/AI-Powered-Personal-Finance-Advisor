import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Repeat, Calendar, CheckCircle2, Edit2 } from 'lucide-react';
import LiquidProgressGauge from './LiquidProgressGauge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

// 8 vibrant, non-repeating accent palettes
const VAULT_PALETTES = [
  { gauge: '#6366F1', light: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  cal: 'text-indigo-400'  }, // indigo
  { gauge: '#10B981', light: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', cal: 'text-emerald-400' }, // emerald
  { gauge: '#F59E0B', light: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   cal: 'text-amber-400'   }, // amber
  { gauge: '#8B5CF6', light: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  cal: 'text-violet-400'  }, // violet
  { gauge: '#0EA5E9', light: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     cal: 'text-sky-400'     }, // sky
  { gauge: '#F43F5E', light: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    cal: 'text-rose-400'    }, // rose
  { gauge: '#14B8A6', light: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    cal: 'text-teal-400'    }, // teal
  { gauge: '#EC4899', light: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    cal: 'text-pink-400'    }, // pink
];

// Priority label colors
const PRIORITY_STYLES = {
  HIGH:   'bg-rose-500/10   text-rose-400   border-rose-500/20',
  MEDIUM: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
  LOW:    'bg-slate-800     text-slate-400  border-zinc-700',
};

export const GoalVaultCard = ({ goal, onDeposit, onAutoSave, onEdit, index = 0 }) => {
  const target  = parseFloat(goal.target_amount)  || 0;
  const current = parseFloat(goal.current_amount) || 0;
  const pct       = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCompleted = pct >= 100;

  const palette = VAULT_PALETTES[index % VAULT_PALETTES.length];
  const priorityKey = (goal.priority || 'MEDIUM').toUpperCase();
  const priorityStyle = PRIORITY_STYLES[priorityKey] || PRIORITY_STYLES.MEDIUM;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-zinc-800 bg-[#09090B] p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden"
    >
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: palette.gauge, opacity: 0.6 }}
      />

      {/* Top Row: Title + Priority + Edit */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-black text-white font-outfit truncate max-w-[180px]">
              {goal.goal_name}
            </h4>
            {isCompleted && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Reached
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {goal.goal_type || 'Savings Target Vault'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wide ${priorityStyle}`}>
            {goal.priority || 'MEDIUM'}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-zinc-800 transition-colors"
              title="Edit goal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Gauge + Amounts */}
      <div className="flex items-center space-x-5 py-1">
        <LiquidProgressGauge percentage={pct} color={palette.gauge} />
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saved Vault Balance</p>
          <p className={`text-2xl font-black font-outfit truncate ${palette.light}`}>
            {formatCurrency(current)}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Target: <span className="font-bold text-slate-200">{formatCurrency(target)}</span>
          </p>
          {/* Mini progress bar */}
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: palette.gauge }}
            />
          </div>
        </div>
      </div>

      {/* Target Date Row */}
      <div className={`rounded-xl border ${palette.border} ${palette.bg} p-3 flex items-center justify-between text-xs`}>
        <span className={`flex items-center gap-1.5 ${palette.cal}`}>
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-slate-400">Target Date</span>
        </span>
        <span className="font-bold text-white">
          {goal.target_date ? formatDate(goal.target_date, 'DD/M/YYYY') : 'Dec 2026'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={() => onDeposit(goal)}
          className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Deposit</span>
        </button>

        <button
          onClick={() => onAutoSave(goal)}
          className="flex-1 py-2.5 rounded-xl border border-zinc-800 bg-[#09090B] hover:bg-zinc-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Repeat className="w-3.5 h-3.5" style={{ color: palette.gauge }} />
          <span>Auto-Save</span>
        </button>
      </div>
    </motion.div>
  );
};

export default GoalVaultCard;
