import React from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Edit3,
  Trash2,
  Zap,
  Tag,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const EnvelopeCard = ({ budget, onEdit, onQuickEdit, onDelete }) => {
  const amountLimit = parseFloat(budget?.budget_amount) || 0;
  const spent = parseFloat(budget?.spent_amount) || 0;
  const pct = (amountLimit > 0 && !isNaN(spent)) ? Math.max(0, (spent / amountLimit) * 100) : 0;
  const safePct = isNaN(pct) ? 0 : Math.min(100, pct);

  const catName = budget?.category?.category_name || budget?.budget_name || 'General Expense';
  const iconName = budget?.category?.icon || budget?.category?.icon_name || 'Tag';
  const RawIcon = Icons[iconName] || Icons.Tag;
  const IconComp = typeof RawIcon === 'function' || (typeof RawIcon === 'object' && RawIcon !== null) ? RawIcon : Icons.Tag;
  const catColor = budget?.category?.color || '#6366F1';

  // Progress Bar Color Status:
  // Primary if <80%, Amber if 80-99%, Glowing Red if >=100%
  const isOver = pct >= 100;
  const isWarning = pct >= 80 && pct < 100;

  const barColor = isOver
    ? 'bg-rose-500 shadow-lg shadow-rose-500/50'
    : isWarning
    ? 'bg-amber-500 shadow-md shadow-amber-500/30'
    : 'bg-primary-500 shadow-md shadow-primary-500/20';

  // Burn-Rate Warning Calculation
  let burnRateText = 'Normal spending pace';
  if (isOver) {
    burnRateText = `Over budget by ${formatCurrency(spent - amountLimit)}`;
  } else if (isWarning) {
    burnRateText = `80%+ threshold reached (${(100 - pct).toFixed(0)}% remaining)`;
  } else {
    burnRateText = `On track for full 30-day period`;
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`rounded-3xl border bg-bg-surface p-6 shadow-glass flex flex-col justify-between space-y-4 relative overflow-hidden ${
        isOver ? 'border-rose-500/40 bg-rose-500/5' : isWarning ? 'border-amber-500/30' : 'border-border-subtle'
      }`}
    >
      {/* Top Bar: Icon + Category Title + Action Buttons (Edit, Slider, Delete) */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-3 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
            style={{ backgroundColor: catColor }}
          >
            <IconComp className="w-6 h-6" />
          </div>

          <div className="min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit truncate">
              {budget.budget_name || catName}
            </h4>
            {budget.category && budget.category.category_name !== budget.budget_name && (
              <p className="text-[11px] font-medium text-slate-400 truncate">
                Category: {budget.category.category_name}
              </p>
            )}
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
              {budget.period || 'MONTHLY'} ENVELOPE
            </span>
          </div>
        </div>

        {/* Action Buttons: Full Edit, Quick Slider, Delete */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onEdit && onEdit(budget)}
            className="p-2 rounded-xl border border-border-strong bg-bg-elevated/70 hover:bg-bg-elevated text-slate-400 hover:text-indigo-400 transition-colors"
            title="Edit Budget Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onQuickEdit && onQuickEdit(budget)}
            className="p-2 rounded-xl border border-border-strong bg-bg-elevated/70 hover:bg-bg-elevated text-slate-400 hover:text-primary-500 transition-colors"
            title="Adjust Budget Slider"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete && onDelete(budget)}
            className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
            title="Delete Budget"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spend Numbers */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 dark:text-white font-outfit">
            {formatCurrency(spent)}
          </span>
          <span className="text-xs font-bold text-slate-400">
            of {formatCurrency(amountLimit)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-bg-elevated overflow-hidden p-0.5 border border-border-subtle">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safePct}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
      </div>

      {/* AI Burn-Rate Warning Badge */}
      <div className="flex items-center justify-between pt-1">
        <div
          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
            isOver
              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
              : isWarning
              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
          }`}
        >
          {isOver ? (
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
          ) : isWarning ? (
            <Flame className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span className="truncate">{burnRateText}</span>
        </div>

        <button
          onClick={() => onQuickEdit(budget)}
          className="text-xs font-bold text-primary-500 hover:text-primary-400 underline"
        >
          Reallocate
        </button>
      </div>
    </motion.div>
  );
};

export default EnvelopeCard;
