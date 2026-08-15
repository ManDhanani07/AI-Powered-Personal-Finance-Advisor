import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Target,
  Loader2,
  Search,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Zap,
  Gauge,
  Layers,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { PageContainer } from '../../components/layout/PageContainer.jsx';
import budgetService from '../../services/budgetService.js';
import apiClient from '../../api/client.js';

import EnvelopeCard from '../../components/budgets/EnvelopeCard.jsx';
import QuickEditEnvelopeModal from '../../components/budgets/QuickEditEnvelopeModal.jsx';
import BudgetForm from '../../components/budgets/BudgetForm.jsx';
import DeleteBudgetModal from '../../components/budgets/DeleteBudgetModal.jsx';
import ReallocateBudgetModal from '../../components/budgets/ReallocateBudgetModal.jsx';
import { formatCurrency } from '../../utils/formatters.js';

const CATEGORY_PALETTE = [
  { text: 'text-indigo-400', bg: 'bg-indigo-500', bar: 'from-indigo-500 to-blue-500', glow: 'shadow-[0_0_12px_rgba(99,102,241,0.5)]', badge: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' },
  { text: 'text-emerald-400', bg: 'bg-emerald-500', bar: 'from-emerald-500 to-teal-400', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]', badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
  { text: 'text-rose-400', bg: 'bg-rose-500', bar: 'from-rose-500 to-pink-500', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.5)]', badge: 'bg-rose-500/15 border-rose-500/30 text-rose-300' },
  { text: 'text-amber-400', bg: 'bg-amber-500', bar: 'from-amber-500 to-orange-500', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]', badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
  { text: 'text-purple-400', bg: 'bg-purple-500', bar: 'from-purple-500 to-violet-500', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.5)]', badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300' },
  { text: 'text-cyan-400', bg: 'bg-cyan-500', bar: 'from-cyan-500 to-sky-500', glow: 'shadow-[0_0_12px_rgba(6,182,212,0.5)]', badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' },
  { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500', bar: 'from-fuchsia-500 to-pink-500', glow: 'shadow-[0_0_12px_rgba(217,70,239,0.5)]', badge: 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-300' },
  { text: 'text-teal-400', bg: 'bg-teal-500', bar: 'from-teal-500 to-emerald-500', glow: 'shadow-[0_0_12px_rgba(20,184,166,0.5)]', badge: 'bg-teal-500/15 border-teal-500/30 text-teal-300' },
];

class BudgetsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Budgets Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-center space-y-4 max-w-2xl mx-auto my-12">
          <h3 className="text-lg font-bold text-rose-400">Budgets Component Render Error</h3>
          <p className="text-xs text-slate-300 font-mono bg-black/40 p-4 rounded-xl overflow-x-auto text-left">
            {this.state.error?.toString()}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const BudgetsContent = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Reallocate Modal State
  const [isReallocateOpen, setIsReallocateOpen] = useState(false);

  // Quick Slider Modal State
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedBudgetForSlider, setSelectedBudgetForSlider] = useState(null);

  // Form & Delete Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(null);

  // Load Categories for form
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/categories');
        const list = res?.data || res;
        setCategories(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [budgetsRes, summaryRes, intelRes] = await Promise.allSettled([
        budgetService.getBudgets({ page_size: 100 }),
        budgetService.getBudgetSummary(),
        budgetService.getBudgetIntelligence(),
      ]);

      if (budgetsRes.status === 'fulfilled') {
        const res = budgetsRes.value;
        const items = res?.data?.items || res?.items || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        setBudgets(items);
      }

      if (summaryRes.status === 'fulfilled') {
        const res = summaryRes.value;
        const sumData = res?.data || (res && typeof res === 'object' ? res : null);
        if (sumData) {
          setSummary(sumData);
        }
      }

      if (intelRes.status === 'fulfilled') {
        const res = intelRes.value;
        const intelData = res?.data || res;
        if (intelData) {
          setIntelligence(intelData);
        }
      }
    } catch (err) {
      console.warn('Error fetching budget data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Derived Totals
  const totalAllocated = useMemo(() => {
    if (!Array.isArray(budgets)) return 0;
    return budgets.reduce((acc, b) => acc + (parseFloat(b?.budget_amount) || 0), 0);
  }, [budgets]);

  const totalSpent = useMemo(() => {
    if (!Array.isArray(budgets)) return 0;
    return budgets.reduce((acc, b) => acc + (parseFloat(b?.spent_amount) || 0), 0);
  }, [budgets]);

  const remainingBudget = useMemo(() => {
    return Math.max(0, totalAllocated - totalSpent);
  }, [totalAllocated, totalSpent]);

  const usedPercentage = useMemo(() => {
    if (totalAllocated <= 0) return 0;
    return Math.min(100, ((totalSpent / totalAllocated) * 100)).toFixed(1);
  }, [totalAllocated, totalSpent]);

  const totalIncome = summary?.total_income ? parseFloat(summary.total_income) : (totalAllocated || 0);

  // Derived Insights
  const highestSpending = useMemo(() => {
    if (!Array.isArray(budgets) || budgets.length === 0) return { name: 'None', amount: 0 };
    const sorted = [...budgets].sort((a, b) => (parseFloat(b.spent_amount) || 0) - (parseFloat(a.spent_amount) || 0));
    const top = sorted[0];
    return {
      name: top?.category?.category_name || top?.budget_name || 'N/A',
      amount: parseFloat(top?.spent_amount) || 0,
    };
  }, [budgets]);

  const largestRemaining = useMemo(() => {
    if (!Array.isArray(budgets) || budgets.length === 0) return { name: 'None', amount: 0 };
    const sorted = [...budgets].sort((a, b) => {
      const remA = (parseFloat(a.budget_amount) || 0) - (parseFloat(a.spent_amount) || 0);
      const remB = (parseFloat(b.budget_amount) || 0) - (parseFloat(b.spent_amount) || 0);
      return remB - remA;
    });
    const top = sorted[0];
    const rem = (parseFloat(top?.budget_amount) || 0) - (parseFloat(top?.spent_amount) || 0);
    return {
      name: top?.category?.category_name || top?.budget_name || 'N/A',
      amount: Math.max(0, rem),
    };
  }, [budgets]);

  const mostUsedBudget = useMemo(() => {
    if (!Array.isArray(budgets) || budgets.length === 0) return { name: 'None', pct: 0 };
    const sorted = [...budgets].sort((a, b) => {
      const limitA = parseFloat(a.budget_amount) || 1;
      const spentA = parseFloat(a.spent_amount) || 0;
      const limitB = parseFloat(b.budget_amount) || 1;
      const spentB = parseFloat(b.spent_amount) || 0;
      return (spentB / limitB) - (spentA / limitA);
    });
    const top = sorted[0];
    const limit = parseFloat(top?.budget_amount) || 1;
    const spent = parseFloat(top?.spent_amount) || 0;
    return {
      name: top?.category?.category_name || top?.budget_name || 'N/A',
      pct: Math.min(100, ((spent / limit) * 100)).toFixed(1),
    };
  }, [budgets]);

  // Overall status string & color indicator
  const overallStatus = useMemo(() => {
    const isAnyOver = budgets.some((b) => (parseFloat(b.spent_amount) || 0) > (parseFloat(b.budget_amount) || 0));
    if (isAnyOver) return { text: 'Category Over Budget', color: 'text-rose-400', badge: 'bg-rose-500/15 border-rose-500/30' };
    if (parseFloat(usedPercentage) > 90) return { text: 'Near Upper Limit', color: 'text-amber-400', badge: 'bg-amber-500/15 border-amber-500/30' };
    return { text: 'Mostly under control', color: 'text-emerald-400', badge: 'bg-emerald-500/15 border-emerald-500/30' };
  }, [budgets, usedPercentage]);

  // Genuine recommendations parsed from live transactions, behavior, and backend stats
  const genuineRecommendations = useMemo(() => {
    const recs = [];

    // Parse backend recommendations array if present
    const rawList = intelligence?.ai_recommendations || [];
    if (Array.isArray(rawList) && rawList.length > 0) {
      rawList.forEach((item) => {
        if (typeof item === 'string' && item.trim()) {
          recs.push({
            title: item.trim(),
            description: 'Generated from real-time transaction velocity and category envelope performance.',
          });
        } else if (typeof item === 'object' && item !== null) {
          const title = item.title || item.action || item.name || item.text || 'Budget Recommendation';
          const description = item.description || item.reason || 'Calculated from historical cash flow parameters.';
          recs.push({ title, description });
        }
      });
    }

    if (recs.length === 0) {
      if (highestSpending.amount > 0) {
        recs.push({
          title: `Optimize ${highestSpending.name} Spending Velocity`,
          description: `${highestSpending.name} is your highest spending category (${formatCurrency(highestSpending.amount)} spent). Pacing daily transactions will preserve your ${formatCurrency(remainingBudget)} buffer.`,
        });
      }

      if (largestRemaining.amount > 0) {
        recs.push({
          title: `Reallocate Surplus Buffer from ${largestRemaining.name}`,
          description: `You have an unspent balance of ${formatCurrency(largestRemaining.amount)} in ${largestRemaining.name}. Reallocating unused funds can offset high-utilization envelopes.`,
        });
      }

      recs.push({
        title: `Envelope Capacity & Burn Rate Health`,
        description: `Total monthly budget utilization is currently ${usedPercentage}%. Keeping utilization under 85% will positively impact your Financial Health Score.`,
      });
    }

    return recs;
  }, [intelligence, highestSpending, largestRemaining, remainingBudget, usedPercentage]);

  // Filtered Budgets List
  const filteredBudgets = useMemo(() => {
    if (!Array.isArray(budgets)) return [];
    return budgets.filter((b) => {
      if (!b) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (b.budget_name || '').toLowerCase().includes(q);
        const matchCat = (b.category?.category_name || '').toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }
      return true;
    });
  }, [budgets, searchQuery]);

  const handleOpenSlider = (b) => {
    setSelectedBudgetForSlider(b);
    setIsSliderOpen(true);
  };

  const handleSliderSave = async (budgetId, newLimit) => {
    try {
      await budgetService.updateBudget(budgetId, { budget_amount: newLimit });
      refreshAll();
    } catch (err) {
      console.warn('Failed to update limit via slider');
    }
  };

  return (
    <PageContainer
      title="Budget Management"
      description="Manage your spending limits and keep your finances on track."
      action={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsReallocateOpen(true)}
            className="px-4 py-2 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/15 to-purple-500/10 hover:from-indigo-500/25 hover:to-purple-500/20 text-indigo-300 font-bold text-xs shadow-lg shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer font-outfit"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reallocate Funds</span>
          </button>

          <button
            onClick={() => {
              setEditingBudget(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer font-outfit"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>New Envelope Budget</span>
          </button>
        </div>
      }
    >
      <div className="space-y-8 max-w-[1920px] w-full mx-auto font-sans pb-10">
        
        {/* 1. BUDGET OVERVIEW (4 Vibrant Distinct Cards) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Budget Overview
            </h3>
            <span className="text-[11px] font-bold text-slate-500 font-mono">Real-Time Ledger</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* Card 1: Allocated (Electric Indigo) */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.12] to-zinc-950/80 p-4 space-y-2 relative overflow-hidden backdrop-blur-md shadow-xl group hover:border-indigo-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Allocated</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tight">
                {formatCurrency(totalAllocated)}
              </p>
              <div className="h-1 w-full bg-indigo-950/80 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full w-full" />
              </div>
            </div>

            {/* Card 2: Spent (Vivid Coral Rose) */}
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/[0.12] to-zinc-950/80 p-4 space-y-2 relative overflow-hidden backdrop-blur-md shadow-xl group hover:border-rose-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Spent</span>
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tight">
                {formatCurrency(totalSpent)}
              </p>
              <div className="h-1 w-full bg-rose-950/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" 
                  style={{ width: `${Math.min(100, (totalSpent / (totalAllocated || 1)) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Card 3: Remaining (Luminous Emerald) */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.12] to-zinc-950/80 p-4 space-y-2 relative overflow-hidden backdrop-blur-md shadow-xl group hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Remaining</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 font-outfit tracking-tight">
                {formatCurrency(remainingBudget)}
              </p>
              <div className="h-1 w-full bg-emerald-950/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${Math.min(100, (remainingBudget / (totalAllocated || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Card 4: Used Capacity (Electric Cyan/Sky) */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/[0.12] to-zinc-950/80 p-4 space-y-2 relative overflow-hidden backdrop-blur-md shadow-xl group hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Capacity</span>
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Gauge className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-xl sm:text-2xl font-black text-cyan-400 font-outfit tracking-tight">
                  {usedPercentage}%
                </p>
                <span className="text-[10px] font-bold text-slate-400 font-mono">Used</span>
              </div>
              <div className="h-1 w-full bg-cyan-950/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 rounded-full" 
                  style={{ width: `${Math.min(100, parseFloat(usedPercentage) || 0)}%` }} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. SPENDING VS BUDGET (Multi-Color Category Progression) */}
        {budgets.length > 0 && (
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Spending vs Budget
              </h3>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                {budgets.length} Active {budgets.length === 1 ? 'Envelope' : 'Envelopes'}
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 space-y-4 backdrop-blur-md shadow-2xl">
              {budgets.map((b, idx) => {
                const limit = parseFloat(b.budget_amount) || 0;
                const spent = parseFloat(b.spent_amount) || 0;
                const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
                const isOver = spent > limit;
                const isWarn = pct >= 80 && !isOver;

                // Pick a dedicated color style per category
                const catTheme = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];

                return (
                  <div key={b.id} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${catTheme.bg} shrink-0 shadow-sm`} />
                        <span className="font-extrabold text-white font-outfit">
                          {b.category?.category_name || b.budget_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-slate-400 text-xs">
                          {formatCurrency(spent)} <span className="text-slate-600">/</span> {formatCurrency(limit)}
                        </span>
                        <span
                          className={`font-black font-mono text-xs px-2 py-0.5 rounded-md border ${
                            isOver
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : isWarn
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : catTheme.badge
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800/60">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, pct)}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          isOver
                            ? 'from-rose-500 to-pink-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                            : isWarn
                            ? 'from-amber-500 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                            : `${catTheme.bar} ${catTheme.glow}`
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. BUDGET INSIGHTS (4 Vivid Distinct Metric Tiles) */}
        <section className="space-y-3 pt-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Budget Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Highest Spending: Crimson/Rose Theme */}
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/[0.08] to-zinc-950/90 p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Highest Spending</p>
                <p className="text-xs font-extrabold text-white font-outfit truncate max-w-[140px]">{highestSpending.name}</p>
                <p className="text-sm font-black text-rose-400 font-outfit font-mono">
                  {formatCurrency(highestSpending.amount)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Largest Remaining: Emerald Theme */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.08] to-zinc-950/90 p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Largest Remaining</p>
                <p className="text-xs font-extrabold text-white font-outfit truncate max-w-[140px]">{largestRemaining.name}</p>
                <p className="text-sm font-black text-emerald-400 font-outfit font-mono">
                  {formatCurrency(largestRemaining.amount)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* 3. Most Used Budget: Violet/Purple Theme */}
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-500/[0.08] to-zinc-950/90 p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Most Used Budget</p>
                <p className="text-xs font-extrabold text-white font-outfit truncate max-w-[140px]">{mostUsedBudget.name}</p>
                <p className="text-sm font-black text-purple-400 font-outfit font-mono">
                  {mostUsedBudget.pct}% Used
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            {/* 4. Overall Budget Health: Electric Cyan Theme */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/[0.08] to-zinc-950/90 p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Budget Status</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${overallStatus.color.replace('text-', 'bg-')} animate-ping`} />
                  <p className={`text-xs font-extrabold font-outfit ${overallStatus.color}`}>
                    {overallStatus.text}
                  </p>
                </div>
                <p className="text-[10px] font-semibold text-slate-400 font-mono">30-day velocity tracked</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. BUDGET VARIANCE (Refined Fintech Ledger Table) */}
        {budgets.length > 0 && (
          <section className="space-y-3 pt-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              Budget Variance
            </h3>
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 overflow-hidden shadow-2xl backdrop-blur-md">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-zinc-900/90 text-slate-400 font-outfit uppercase text-[10px] tracking-wider border-b border-zinc-800/80">
                    <tr>
                      <th className="py-3.5 px-5 font-bold">Category Envelope</th>
                      <th className="py-3.5 px-4 font-bold">Allocated Limit</th>
                      <th className="py-3.5 px-4 font-bold">Actual Spent</th>
                      <th className="py-3.5 px-4 font-bold">Net Remaining</th>
                      <th className="py-3.5 px-5 font-bold text-right">Health Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-slate-200">
                    {budgets.map((b, idx) => {
                      const limit = parseFloat(b.budget_amount) || 0;
                      const spent = parseFloat(b.spent_amount) || 0;
                      const rem = limit - spent;
                      const isOver = spent > limit;
                      const isWarn = (spent / limit) >= 0.8 && !isOver;
                      const catTheme = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];

                      return (
                        <tr key={b.id} className="hover:bg-zinc-900/60 transition-colors group">
                          <td className="py-3.5 px-5 font-bold text-white font-outfit">
                            <div className="flex items-center space-x-2.5">
                              <span className={`w-3 h-3 rounded-md ${catTheme.bg} shadow-sm`} />
                              <span className="group-hover:text-cyan-300 transition-colors">
                                {b.category?.category_name || b.budget_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{formatCurrency(limit)}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-rose-300">{formatCurrency(spent)}</td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span className={rem >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {rem >= 0 ? `+${formatCurrency(rem)}` : `-${formatCurrency(Math.abs(rem))}`}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold font-outfit border ${
                                isOver
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : isWarn
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOver ? 'bg-rose-400' : isWarn ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                              {isOver ? 'Over Budget' : isWarn ? 'Near Limit' : 'On Track'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 5. FINANCIAL HEALTH IMPACT (Gradient Hero Card) */}
        {(() => {
          const currScore = Math.max(0, parseFloat(intelligence?.financial_health_impact?.current_score || 0));
          const prevScore = Math.max(0, parseFloat(intelligence?.financial_health_impact?.previous_score || 0));
          const diff = currScore - prevScore;
          const isZero = currScore === 0 && prevScore === 0;
          const isPositive = diff >= 0;

          return (
            <section className="space-y-3 pt-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Financial Health Impact
              </h3>
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/[0.10] via-teal-500/[0.05] to-zinc-950 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 backdrop-blur-md shadow-2xl">
                <div className="flex items-center space-x-5">
                  <div className="text-center bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Previous Score</p>
                    <p className="text-xl font-black text-slate-300 font-outfit">
                      {prevScore.toFixed(1)}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="text-center bg-emerald-500/15 px-4 py-2.5 rounded-xl border border-emerald-500/30">
                    <p className="text-[10px] font-bold uppercase text-emerald-300">Current Score</p>
                    <p className="text-xl font-black text-emerald-400 font-outfit">
                      {currScore.toFixed(1)}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full border text-xs font-black font-outfit shadow-sm ${
                    isZero
                      ? 'bg-zinc-800/80 border-zinc-700 text-slate-400'
                      : isPositive
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}>
                    {isZero ? '0.0 pts' : `${isPositive ? '+' : ''}${diff.toFixed(1)} pts`}
                  </span>
                </div>

                <p className="text-xs text-slate-300 max-w-lg font-sans leading-relaxed">
                  {isZero
                    ? 'Configure category envelope budgets and record transactions to calculate your live Financial Health Impact score.'
                    : (intelligence?.financial_health_impact?.explanation ||
                      `Your current budget usage is maintaining an optimal burn-rate, contributing ${isPositive ? 'positively' : 'critically'} to your net worth trajectory and liquidity health.`)}
                </p>
              </div>
            </section>
          );
        })()}

        {/* 6. AI BUDGET INSIGHTS (Vibrant Multi-Color Accent Feed) */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit">
              AI Budget Insights
            </h3>
          </div>
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 space-y-3.5 backdrop-blur-md shadow-2xl">
            <div className="flex items-start space-x-3 text-xs text-slate-200">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✦</span>
              <p className="leading-relaxed">
                <strong className="text-white font-outfit">{highestSpending.name}</strong> is your highest-used budget at{' '}
                <span className="text-cyan-400 font-black font-mono">{mostUsedBudget.pct}%</span> capacity.
              </p>
            </div>
            <div className="border-t border-zinc-900 pt-3 flex items-start space-x-3 text-xs text-slate-200">
              <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✦</span>
              <p className="leading-relaxed">
                You still have <span className="text-emerald-400 font-black font-mono">{formatCurrency(remainingBudget)}</span> available across your category envelope limits.
              </p>
            </div>
            <div className="border-t border-zinc-900 pt-3 flex items-start space-x-3 text-xs text-slate-200">
              <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✦</span>
              <p className="leading-relaxed">Your current monthly spending velocity is remaining within planned parameters.</p>
            </div>
            <div className="border-t border-zinc-900 pt-3 flex items-start space-x-3 text-xs text-slate-200">
              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✦</span>
              <p className="leading-relaxed">Consider reviewing category spending periodically before reaching allocated limits.</p>
            </div>
          </div>
        </section>

        {/* 7. AI RECOMMENDATIONS (Numbered Distinct Multi-Color Badges) */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-outfit">
              AI Recommendations
            </h3>
          </div>
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 space-y-4 backdrop-blur-md shadow-2xl">
            {genuineRecommendations.map((rec, idx) => {
              const num = (idx + 1).toString().padStart(2, '0');
              const recTheme = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];

              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-4 ${
                    idx !== 0 ? 'border-t border-zinc-900 pt-4' : ''
                  }`}
                >
                  <span className={`w-8 h-8 rounded-xl ${recTheme.badge} flex items-center justify-center text-xs font-black font-mono shrink-0 mt-0.5 shadow-sm`}>
                    {num}
                  </span>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-xs font-extrabold text-white font-outfit tracking-tight">{rec.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. CATEGORY BUDGETS (INTERACTIVE ENVELOPES SECTION) */}
        <section className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white font-outfit tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Category Budget Envelopes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Interactive zero-based envelope allocations and limits</p>
            </div>

            <div className="relative flex-1 max-w-md w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search category envelopes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all font-sans"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-xs font-semibold text-slate-400">Loading envelope budgets...</p>
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center space-y-4 shadow-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-outfit">No Envelope Budgets Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-sans">
                  Create category envelope limits to allocate your monthly zero-based budget.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingBudget(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:from-emerald-300 hover:to-teal-300 transition-colors font-outfit cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Create First Envelope Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBudgets.map((b, idx) => (
                <EnvelopeCard
                  key={b.id}
                  budget={b}
                  index={idx}
                  onEdit={(item) => {
                    setEditingBudget(item);
                    setIsFormOpen(true);
                  }}
                  onQuickEdit={handleOpenSlider}
                  onDelete={(item) => {
                    setDeletingBudget(item);
                    setIsDeleteOpen(true);
                  }}
                />
              ))}

              {/* Quick Add Budget Card in Grid */}
              <motion.div
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                onClick={() => {
                  setEditingBudget(null);
                  setIsFormOpen(true);
                }}
                className="rounded-2xl border-2 border-dashed border-zinc-800 hover:border-emerald-400/50 bg-gradient-to-b from-emerald-500/[0.04] to-zinc-950/60 hover:bg-emerald-500/[0.08] p-6 shadow-lg flex flex-col items-center justify-center text-center space-y-3.5 cursor-pointer min-h-[200px] transition-all group backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 group-hover:bg-gradient-to-br group-hover:from-emerald-400 group-hover:to-teal-400 text-emerald-400 group-hover:text-slate-950 flex items-center justify-center font-bold shadow-lg transition-all">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white font-outfit group-hover:text-emerald-300 transition-colors">
                    Add Another Envelope
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Allocate budget limit for another category or merchant
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </section>
      </div>

      {/* Reallocation Modal */}
      <ReallocateBudgetModal
        isOpen={isReallocateOpen}
        onClose={() => setIsReallocateOpen(false)}
        reallocationData={intelligence?.reallocation_options}
        budgets={budgets}
        onSuccess={refreshAll}
        onOpenIncrease={() => {
          setEditingBudget(budgets[0] || null);
          setIsFormOpen(true);
        }}
      />

      {/* Quick Edit Envelope Limit Slider Modal */}
      <QuickEditEnvelopeModal
        isOpen={isSliderOpen}
        onClose={() => setIsSliderOpen(false)}
        budget={selectedBudgetForSlider}
        totalIncome={totalIncome}
        totalAllocated={totalAllocated}
        onSave={handleSliderSave}
      />

      {/* Budget Creation & Edit Modal */}
      <BudgetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingBudget}
        categories={categories}
        onSuccess={refreshAll}
      />

      {/* Delete Confirmation Modal */}
      <DeleteBudgetModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        budget={deletingBudget}
        onSuccess={refreshAll}
      />
    </PageContainer>
  );
};

export const Budgets = () => (
  <BudgetsErrorBoundary>
    <BudgetsContent />
  </BudgetsErrorBoundary>
);

export default Budgets;
