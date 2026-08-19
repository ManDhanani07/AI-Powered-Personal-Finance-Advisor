import React from 'react';
import {
  Sliders,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Edit3,
  Trash2,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

// Curated professional fintech palette across categories
const CATEGORY_THEMES = [
  {
    iconBox: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
    accentText: 'text-indigo-400',
    barFill: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
    remainingText: 'text-indigo-300',
  },
  {
    iconBox: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    accentText: 'text-cyan-400',
    barFill: 'bg-cyan-500',
    badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    remainingText: 'text-cyan-300',
  },
  {
    iconBox: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    accentText: 'text-purple-400',
    barFill: 'bg-purple-500',
    badge: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    remainingText: 'text-purple-300',
  },
  {
    iconBox: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    accentText: 'text-amber-400',
    barFill: 'bg-amber-500',
    badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    remainingText: 'text-amber-300',
  },
  {
    iconBox: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    accentText: 'text-rose-400',
    barFill: 'bg-rose-500',
    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    remainingText: 'text-rose-300',
  },
  {
    iconBox: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
    accentText: 'text-teal-400',
    barFill: 'bg-teal-500',
    badge: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
    remainingText: 'text-teal-300',
  },
  {
    iconBox: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    accentText: 'text-sky-400',
    barFill: 'bg-sky-500',
    badge: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
    remainingText: 'text-sky-300',
  },
  {
    iconBox: 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400',
    accentText: 'text-fuchsia-400',
    barFill: 'bg-fuchsia-500',
    badge: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300',
    remainingText: 'text-fuchsia-300',
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
    ? index % CATEGORY_THEMES.length
    : Math.abs(catName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % CATEGORY_THEMES.length;
  
  const theme = CATEGORY_THEMES[themeIndex];

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

  // Dynamic progress fill: Warning (Amber), Over (Rose), or Category Signature Color
  const barColor = isOver
    ? 'bg-rose-500'
    : isWarning
    ? 'bg-amber-400'
    : theme.barFill;

  // Status pill style
  const pillStyle = isOver
    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    : isWarning
    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    : theme.badge;

  return (
    <div
      className="rounded-2xl border border-zinc-800/90 bg-[#0c0c0e] hover:border-zinc-700/90 p-5 flex flex-col justify-between space-y-4 transition-colors group"
    >
      {/* Top Bar: Icon Badge + Titles + Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl border ${theme.iconBox} flex items-center justify-center shrink-0`}>
            <IconComp className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white font-outfit truncate tracking-tight">
              {budget.budget_name || catName}
            </h4>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                {budget.period || 'MONTHLY'}
              </span>
              <span className="text-zinc-600">•</span>
              <span className={`text-[10px] font-bold font-mono ${isOver ? 'text-rose-400' : isWarning ? 'text-amber-400' : theme.accentText}`}>
                {pct.toFixed(0)}% used
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onEdit && onEdit(budget)}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Edit Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onQuickEdit && onQuickEdit(budget)}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Adjust Slider"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete && onDelete(budget)}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
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
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-outfit">Spent</span>
            <span className="text-lg font-bold text-white font-outfit">
              {formatCurrency(spent)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-outfit">Remaining</span>
            <span className={`text-sm font-bold font-outfit ${isOver ? 'text-rose-400' : theme.remainingText}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar (Crisp, zero glow/shadow) */}
        <div className="h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden">
          <div
            style={{ width: `${safePct}%` }}
            className={`h-full rounded-full ${barColor} transition-all duration-300`}
          />
        </div>
      </div>

      {/* Footer Pill & Quick Reallocate Link */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
        <div
          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${pillStyle}`}
        >
          {isOver ? (
            <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400" />
          ) : isWarning ? (
            <Flame className="w-3 h-3 shrink-0 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-400" />
          )}
          <span className="truncate">{statusText}</span>
        </div>

        <button
          onClick={() => onQuickEdit && onQuickEdit(budget)}
          className={`text-[11px] font-semibold ${theme.accentText} hover:underline font-outfit cursor-pointer transition-colors`}
        >
          Reallocate
        </button>
      </div>
    </div>
  );
};

export default EnvelopeCard;
