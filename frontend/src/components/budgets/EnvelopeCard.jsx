import React from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Edit3,
  Trash2,
  Tag,
  TrendingUp,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

// Vibrant 8-theme color cycle for budget cards
const COLOR_THEMES = [
  {
    border: 'border-indigo-500/30 hover:border-indigo-500/60',
    bg: 'bg-gradient-to-b from-indigo-500/[0.08] to-transparent',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/25',
    accentText: 'text-indigo-400',
    barGradient: 'from-indigo-500 to-blue-500',
    glow: 'shadow-[0_0_15px_rgba(99,102,241,0.35)]',
    pill: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  {
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    bg: 'bg-gradient-to-b from-emerald-500/[0.08] to-transparent',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25',
    accentText: 'text-emerald-400',
    barGradient: 'from-emerald-500 to-teal-400',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    border: 'border-rose-500/30 hover:border-rose-500/60',
    bg: 'bg-gradient-to-b from-rose-500/[0.08] to-transparent',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/25',
    accentText: 'text-rose-400',
    barGradient: 'from-rose-500 to-pink-500',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    pill: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  {
    border: 'border-amber-500/30 hover:border-amber-500/60',
    bg: 'bg-gradient-to-b from-amber-500/[0.08] to-transparent',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25',
    accentText: 'text-amber-400',
    barGradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
    pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    border: 'border-purple-500/30 hover:border-purple-500/60',
    bg: 'bg-gradient-to-b from-purple-500/[0.08] to-transparent',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/25',
    accentText: 'text-purple-400',
    barGradient: 'from-purple-500 to-violet-500',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.35)]',
    pill: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  {
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    bg: 'bg-gradient-to-b from-cyan-500/[0.08] to-transparent',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600 shadow-cyan-500/25',
    accentText: 'text-cyan-400',
    barGradient: 'from-cyan-500 to-sky-500',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.35)]',
    pill: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  {
    border: 'border-fuchsia-500/30 hover:border-fuchsia-500/60',
    bg: 'bg-gradient-to-b from-fuchsia-500/[0.08] to-transparent',
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-fuchsia-500/25',
    accentText: 'text-fuchsia-400',
    barGradient: 'from-fuchsia-500 to-pink-500',
    glow: 'shadow-[0_0_15px_rgba(217,70,239,0.35)]',
    pill: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  },
  {
    border: 'border-teal-500/30 hover:border-teal-500/60',
    bg: 'bg-gradient-to-b from-teal-500/[0.08] to-transparent',
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-500/25',
    accentText: 'text-teal-400',
    barGradient: 'from-teal-500 to-emerald-500',
    glow: 'shadow-[0_0_15px_rgba(20,184,166,0.35)]',
    pill: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
];

export const EnvelopeCard = ({ budget, onEdit, onQuickEdit, onDelete, index = 0 }) => {
  const amountLimit = parseFloat(budget?.budget_amount) || 0;
  const spent = parseFloat(budget?.spent_amount) || 0;
  const pct = amountLimit > 0 ? Math.max(0, (spent / amountLimit) * 100) : 0;
  const safePct = isNaN(pct) ? 0 : Math.min(100, pct);
  const remaining = Math.max(0, amountLimit - spent);

  const catName = budget?.category?.category_name || budget?.budget_name || 'General Expense';
  const iconName = budget?.category?.icon || budget?.category?.icon_name || 'Tag';
  const RawIcon = Icons[iconName] || Icons.Tag;
  const IconComp = typeof RawIcon === 'function' || (typeof RawIcon === 'object' && RawIcon !== null) ? RawIcon : Icons.Tag;

  // Pick theme based on index or hash of category name
  const themeIndex = (typeof index === 'number' && index >= 0)
    ? index % COLOR_THEMES.length
    : Math.abs(catName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % COLOR_THEMES.length;
  
  const theme = COLOR_THEMES[themeIndex];

  const isOver = pct >= 100;
  const isWarning = pct >= 80 && pct < 100;

  let statusText = `${(100 - pct).toFixed(0)}% remaining`;
  if (isOver) {
    statusText = `Over by ${formatCurrency(spent - amountLimit)}`;
  } else if (isWarning) {
    statusText = `Near Limit (${(100 - pct).toFixed(0)}% left)`;
  } else {
    statusText = `On track for month`;
  }

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl border ${theme.border} ${theme.bg} bg-zinc-950/90 p-5 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden backdrop-blur-md transition-all group`}
    >
      {/* Top Bar: Colorful Icon Badge + Titles + Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl ${theme.iconBg} flex items-center justify-center text-white font-bold shadow-lg shrink-0`}>
            <IconComp className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-white font-outfit truncate tracking-tight">
              {budget.budget_name || catName}
            </h4>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {budget.period || 'MONTHLY'}
              </span>
              <span className="text-slate-600">•</span>
              <span className={`text-[10px] font-bold font-mono ${theme.accentText}`}>
                {pct.toFixed(0)}% used
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onEdit && onEdit(budget)}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
            title="Edit Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onQuickEdit && onQuickEdit(budget)}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
            title="Adjust Slider"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete && onDelete(budget)}
            className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Delete Envelope"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spend Amount & Limit Bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase block text-[10px]">Spent</span>
            <span className="text-xl font-black text-white font-outfit">
              {formatCurrency(spent)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-bold uppercase block text-[10px]">Remaining</span>
            <span className={`text-sm font-black font-outfit ${isOver ? 'text-rose-400' : theme.accentText}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar with Gradient and subtle glow */}
        <div className="h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800/80">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safePct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${
              isOver ? 'from-rose-500 to-pink-500' : isWarning ? 'from-amber-500 to-orange-500' : theme.barGradient
            } ${isOver ? 'shadow-[0_0_12px_rgba(244,63,94,0.6)]' : theme.glow}`}
          />
        </div>
      </div>

      {/* Footer Pill & Quick Reallocate Link */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
        <div
          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            isOver
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : isWarning
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : theme.pill
          }`}
        >
          {isOver ? (
            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
          ) : isWarning ? (
            <Flame className="w-3 h-3 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          )}
          <span className="truncate">{statusText}</span>
        </div>

        <button
          onClick={() => onQuickEdit && onQuickEdit(budget)}
          className={`text-[11px] font-bold ${theme.accentText} hover:underline font-outfit cursor-pointer`}
        >
          Reallocate
        </button>
      </div>
    </motion.div>
  );
};

export default EnvelopeCard;
