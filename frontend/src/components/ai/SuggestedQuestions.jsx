import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  PieChart,
  Wallet,
  Activity,
  Target,
  LineChart,
  HelpCircle,
  TrendingDown,
  Calculator,
  Compass,
} from 'lucide-react';

export const QUICK_ACTIONS = [
  {
    label: 'Financial Summary',
    prompt: 'Give me my complete financial summary with income, expenses, savings rate, and health score.',
    icon: Compass,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]',
  },
  {
    label: 'Am I overspending?',
    prompt: 'Am I overspending? Where is most of my money going and how can I cut costs?',
    icon: TrendingDown,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30 hover:border-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]',
  },
  {
    label: 'Category Breakdown',
    prompt: 'Show my spending breakdown across all categories with visual distribution bars.',
    icon: PieChart,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]',
  },
  {
    label: 'What If Scenario',
    prompt: 'What if I reduce my Shopping spending by 20%? How much will I save yearly?',
    icon: Calculator,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]',
  },
  {
    label: 'Check Savings Goals',
    prompt: 'Show my savings goals progress and calculate when I will reach my Emergency Fund target.',
    icon: Target,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
  },
  {
    label: 'Prophet Forecast',
    prompt: 'Forecast my upcoming expenses for the next 1 to 3 months and show expected savings.',
    icon: LineChart,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/30 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]',
  },
];

export const SuggestedQuestions = ({ onSelectQuestion, disabled = false, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 overflow-x-auto py-1 px-1 custom-scrollbar no-scrollbar scroll-smooth">
        {QUICK_ACTIONS.map((action, idx) => {
          const IconComp = action.icon;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSelectQuestion(action.prompt)}
              className={`shrink-0 px-3 py-1.5 rounded-full bg-[#12131A] border ${action.borderColor} text-xs font-bold text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50 font-outfit shadow-sm hover:scale-[1.02] active:scale-[0.98]`}
            >
              <IconComp className={`w-3.5 h-3.5 ${action.color}`} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2.5 py-2 max-w-3xl mx-auto">
      <div className="flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-400 font-outfit px-1">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Live PostgreSQL Financial Intelligence Actions</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={disabled}
              onClick={() => onSelectQuestion(item.prompt)}
              className={`p-3.5 rounded-2xl bg-[#101117] border ${item.borderColor} text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-all text-left flex items-center space-x-3 cursor-pointer disabled:opacity-50 shadow-glass group`}
            >
              <div className={`p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 ${item.color} shrink-0 group-hover:scale-110 transition-transform`}>
                <IconComp className="w-4 h-4" />
              </div>
              <span className="leading-tight font-outfit text-xs sm:text-sm font-black truncate">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
