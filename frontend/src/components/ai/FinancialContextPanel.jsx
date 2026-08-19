import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  PieChart,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

export const FinancialContextPanel = ({
  summaryContext,
  healthData,
  isOpen = false,
  onClose,
}) => {
  const overview = summaryContext?.overview || {};
  const spending = summaryContext?.spending_analysis || {};
  const budget = summaryContext?.budget_overview || {};

  // Financial values
  const income = Number(overview?.monthly_income ?? overview?.total_income ?? 0);
  const expenses = Number(overview?.monthly_expenses ?? overview?.total_expenses ?? 0);
  const netSavings = Number(overview?.net_savings ?? overview?.net_surplus ?? (income - expenses));
  const savingsRate = Number(overview?.savings_rate ?? (income > 0 ? ((netSavings / income) * 100).toFixed(1) : 0));
  
  // Health Score
  const healthScore = Number(healthData?.health_score ?? overview?.financial_health_score ?? 85);
  const healthGrade = healthData?.grade ?? overview?.financial_health_grade ?? 'A';

  // Budget & Goal Progress
  const budgetUsedPct = Number(budget?.total_utilization_pct ?? overview?.budget_utilization_pct ?? 0);
  const goalsProgressPct = Number(overview?.overall_goals_progress_pct ?? overview?.goals_progress_pct ?? 0);

  // Top spending category
  const topSpendingCategory = spending?.highest_category || overview?.top_spending_category || 'Shopping';
  const topCategoryPct = Number(spending?.highest_category_pct || 0);

  // Real Focus Insights
  const focusInsights = [];

  if (topSpendingCategory && topCategoryPct > 30) {
    focusInsights.push({
      type: 'warning',
      text: `${topSpendingCategory} spending is high (${topCategoryPct.toFixed(0)}% of total expenses).`,
      icon: AlertTriangle,
    });
  } else if (topSpendingCategory) {
    focusInsights.push({
      type: 'warning',
      text: `${topSpendingCategory} is your highest spending category.`,
      icon: AlertTriangle,
    });
  }

  if (income > expenses && netSavings > 0) {
    focusInsights.push({
      type: 'positive',
      text: 'Income is higher than expenses.',
      icon: CheckCircle2,
    });
  } else if (expenses > income) {
    focusInsights.push({
      type: 'warning',
      text: 'Expenses exceed monthly income.',
      icon: AlertTriangle,
    });
  }

  if (savingsRate >= 20) {
    focusInsights.push({
      type: 'positive',
      text: `Strong savings rate of ${savingsRate.toFixed(1)}%.`,
      icon: CheckCircle2,
    });
  } else {
    focusInsights.push({
      type: 'warning',
      text: `Savings rate could be improved (${savingsRate.toFixed(1)}%).`,
      icon: AlertTriangle,
    });
  }

  const ContentBody = (
    <div className="space-y-4 p-3.5 sm:p-4 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white font-outfit tracking-tight">Your Financial Context</h3>
            <p className="text-[9px] text-slate-400 font-medium">PostgreSQL Ledger Data</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 flex items-center space-x-1 font-outfit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg bg-zinc-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-zinc-800/80 bg-[#12131A] p-2.5 space-y-0.5 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase font-outfit">
            <span>Income</span>
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>
          <p className="text-sm font-black text-white font-outfit tracking-tight">
            {formatCompactFinancial(income)}
          </p>
          <p className="text-[8px] text-slate-400 font-mono truncate">{formatCurrency(income)}</p>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-[#12131A] p-2.5 space-y-0.5 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase font-outfit">
            <span>Expenses</span>
            <TrendingDown className="w-3 h-3 text-rose-400" />
          </div>
          <p className="text-sm font-black text-white font-outfit tracking-tight">
            {formatCompactFinancial(expenses)}
          </p>
          <p className="text-[8px] text-slate-400 font-mono truncate">{formatCurrency(expenses)}</p>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-[#12131A] p-2.5 space-y-0.5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase font-outfit">
            <span>Net Savings</span>
            <Wallet className="w-3 h-3 text-cyan-400" />
          </div>
          <p className={`text-sm font-black font-outfit tracking-tight ${netSavings >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {formatCompactFinancial(netSavings)}
          </p>
          <p className="text-[8px] text-slate-400 font-mono truncate">{formatCurrency(netSavings)}</p>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-[#12131A] p-2.5 space-y-0.5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase font-outfit">
            <span>Savings Rate</span>
            <Sparkles className="w-3 h-3 text-purple-400" />
          </div>
          <p className="text-sm font-black text-emerald-400 font-outfit tracking-tight">
            {savingsRate.toFixed(1)}%
          </p>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className="rounded-xl border border-zinc-800/90 bg-[#12131A] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-black text-white font-outfit">Health Score</span>
          </div>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-[10px] font-outfit">
            Grade {healthGrade}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-outfit">
            {healthScore}<span className="text-[10px] text-slate-400 font-normal">/100</span>
          </span>
          <span className="text-[9px] font-bold text-slate-400">
            {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Review'}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, healthScore)}%` }}
          />
        </div>
      </div>

      {/* Budget & Goal Utilization */}
      <div className="space-y-2">
        <div className="rounded-xl border border-zinc-800/80 bg-[#101117] p-2.5 space-y-1">
          <div className="flex justify-between text-[11px] font-bold font-outfit">
            <span className="text-slate-300 flex items-center space-x-1">
              <PieChart className="w-3 h-3 text-cyan-400" />
              <span>Budget Usage</span>
            </span>
            <span className={budgetUsedPct > 90 ? 'text-rose-400 font-black' : 'text-cyan-400 font-black'}>
              {budgetUsedPct.toFixed(0)}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budgetUsedPct > 90 ? 'bg-rose-500' : 'bg-cyan-400'}`}
              style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-[#101117] p-2.5 space-y-1">
          <div className="flex justify-between text-[11px] font-bold font-outfit">
            <span className="text-slate-300 flex items-center space-x-1">
              <Target className="w-3 h-3 text-purple-400" />
              <span>Goal Progress</span>
            </span>
            <span className="text-purple-400 font-black">{goalsProgressPct.toFixed(0)}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, goalsProgressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Focus Section */}
      <div className="space-y-2 border-t border-zinc-800/80 pt-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center space-x-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Current Focus</span>
        </h4>
        <div className="space-y-1.5">
          {focusInsights.map((item, idx) => {
            const IconComp = item.icon;
            const isWarn = item.type === 'warning';
            return (
              <div
                key={idx}
                className={`p-2 rounded-xl border text-[11px] font-medium flex items-start space-x-2 ${
                  isWarn
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isWarn ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span className="leading-tight font-sans">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Column */}
      <aside className="hidden lg:flex w-72 shrink-0 border-l border-zinc-800/80 bg-[#0C0D10] flex-col h-full min-h-0 overflow-y-auto custom-scrollbar">
        {ContentBody}
      </aside>

      {/* Mobile/Tablet Slide-Over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xs h-full bg-[#0C0D10] border-l border-zinc-800 shadow-2xl overflow-y-auto custom-scrollbar"
            >
              {ContentBody}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FinancialContextPanel;
