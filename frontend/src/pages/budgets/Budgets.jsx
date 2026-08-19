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
  TrendingDown,
  Wallet,
  ShieldCheck,
  Gauge,
  Layers,
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
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
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

  // Derived Key Insights
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
    if (isAnyOver) return { text: 'Category Over Limit', badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400', dot: 'bg-rose-400' };
    if (parseFloat(usedPercentage) > 90) return { text: 'Near Upper Limit', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400', dot: 'bg-amber-400' };
    return { text: 'Optimal', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' };
  }, [budgets, usedPercentage]);

  // Curated, non-redundant actionable recommendations
  const actionRecommendations = useMemo(() => {
    const recs = [];

    if (highestSpending.amount > 0 && mostUsedBudget.pct > 75) {
      recs.push({
        title: `Pace spending in ${highestSpending.name} (${mostUsedBudget.pct}% used)`,
        description: `${highestSpending.name} accounts for ${formatCurrency(highestSpending.amount)} of your monthly spend. Consider capping non-essential transactions to preserve buffer.`,
        tag: 'Burn Velocity',
        tagColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      });
    }

    if (largestRemaining.amount > 0 && largestRemaining.name !== highestSpending.name) {
      recs.push({
        title: `Reallocate unspent buffer from ${largestRemaining.name} (+${formatCurrency(largestRemaining.amount)})`,
        description: `You have surplus liquidity in ${largestRemaining.name}. You can transfer unallocated funds to offset higher-velocity envelopes.`,
        tag: 'Surplus Buffer',
        tagColor: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      });
    }

    recs.push({
      title: `Maintain envelope utilization below 85% threshold`,
      description: `Overall portfolio utilization is at ${usedPercentage}%. Keeping buffer above 15% contributes directly to your Financial Health Score.`,
      tag: 'Portfolio Health',
      tagColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    });

    return recs;
  }, [highestSpending, mostUsedBudget, largestRemaining, usedPercentage]);

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
      description="Manage category spending limits and monitor real-time allocation velocity."
      action={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsReallocateOpen(true)}
            className="px-4 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer font-outfit"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reallocate Funds</span>
          </button>

          <button
            onClick={() => {
              setEditingBudget(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer font-outfit"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>New Envelope</span>
          </button>
        </div>
      }
    >
      <div className="space-y-7 max-w-[1920px] w-full mx-auto font-sans pb-10">
        
        {/* ─── 1. STREAMLINED EXECUTIVE KPI CARDS (Balanced Color Accents, Zero Shadows) ─── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Allocated Limit (Indigo/Cobalt Accent) */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0c0c0e] hover:border-indigo-500/40 p-4 space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-outfit">Total Allocated</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-tight">
              {formatCurrency(totalAllocated)}
            </p>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-sans pt-1">
              <span>{budgets.length} Active {budgets.length === 1 ? 'Envelope' : 'Envelopes'}</span>
              <span className="text-indigo-400 font-semibold font-mono">100% Capped</span>
            </div>
          </div>

          {/* Card 2: Spent (Coral Rose Accent) */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0c0c0e] hover:border-rose-500/40 p-4 space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider font-outfit">Total Spent</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-tight">
              {formatCurrency(totalSpent)}
            </p>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-sans pt-1 truncate">
              <span className="truncate">Top: <strong className="text-zinc-300">{highestSpending.name}</strong></span>
              <span className="text-rose-400 font-semibold font-mono shrink-0 ml-1">{formatCurrency(highestSpending.amount)}</span>
            </div>
          </div>

          {/* Card 3: Remaining Buffer (Emerald Mint Accent) */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0c0c0e] hover:border-emerald-500/40 p-4 space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-outfit">Net Remaining</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-outfit tracking-tight">
              {formatCurrency(remainingBudget)}
            </p>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-sans pt-1 truncate">
              <span className="truncate">Buffer: <strong className="text-zinc-300">{largestRemaining.name}</strong></span>
              <span className="text-emerald-400 font-semibold font-mono shrink-0 ml-1">+{formatCurrency(largestRemaining.amount)}</span>
            </div>
          </div>

          {/* Card 4: Capacity & Health (Electric Cyan Accent) */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0c0c0e] hover:border-cyan-500/40 p-4 space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-outfit">Capacity Used</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Gauge className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-outfit tracking-tight">
                {usedPercentage}%
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border font-outfit ${overallStatus.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${overallStatus.dot} mr-1`} />
                {overallStatus.text}
              </span>
            </div>
            {/* Crisp Flat Progress Indicator */}
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, parseFloat(usedPercentage) || 0)}%` }} 
              />
            </div>
          </div>
        </section>

        {/* ─── 2. CORE INTERACTIVE CATEGORY ENVELOPES (Front & Center) ─── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-outfit tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Category Budget Envelopes
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                Interactive zero-based envelopes with real-time spend limits & surplus adjustment
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                placeholder="Search envelopes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 transition-colors font-sans"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <p className="text-xs font-semibold text-zinc-400">Loading envelope budgets...</p>
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-10 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-outfit">No Envelope Budgets Found</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 font-sans">
                  Create category envelope limits to allocate your monthly zero-based budget.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingBudget(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors font-outfit cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                Create First Envelope Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {/* Minimalist Professional Add Budget Card */}
              <div
                onClick={() => {
                  setEditingBudget(null);
                  setIsFormOpen(true);
                }}
                className="rounded-2xl border border-dashed border-zinc-800 hover:border-emerald-500/40 bg-transparent hover:bg-emerald-500/[0.03] p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer min-h-[190px] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center transition-all">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-200 font-outfit group-hover:text-emerald-300 transition-colors">
                    Add Another Envelope
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">
                    Allocate spending limit for another category
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ─── 3. UNIFIED AI BUDGET INTELLIGENCE & HEALTH HUB (Professional, Zero Shadows) ─── */}
        <section className="rounded-2xl border border-zinc-800/90 bg-[#0c0c0e] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-outfit tracking-tight">
                  AI Budget Intelligence & Optimization
                </h3>
                <p className="text-[11px] text-zinc-400">Autonomous cash flow analysis and financial health impact</p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              Live Intelligence
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Financial Health Impact Score (5 Cols) */}
            {(() => {
              const currScore = Math.max(0, parseFloat(intelligence?.financial_health_impact?.current_score || 0));
              const prevScore = Math.max(0, parseFloat(intelligence?.financial_health_impact?.previous_score || 0));
              const diff = currScore - prevScore;
              const isZero = currScore === 0 && prevScore === 0;
              const isPositive = diff >= 0;

              return (
                <div className="lg:col-span-5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-outfit block">
                      Financial Health Impact
                    </span>

                    <div className="flex items-center space-x-4 pt-1">
                      <div className="text-center bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800">
                        <p className="text-[9px] font-bold uppercase text-zinc-500">Previous</p>
                        <p className="text-lg font-bold text-zinc-300 font-outfit">
                          {prevScore.toFixed(1)}
                        </p>
                      </div>

                      <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>

                      <div className="text-center bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800">
                        <p className="text-[9px] font-bold uppercase text-cyan-400">Current</p>
                        <p className="text-lg font-bold text-cyan-400 font-outfit">
                          {currScore.toFixed(1)}
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold font-outfit ${
                        isZero
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          : isPositive
                          ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {isZero ? '0.0 pts' : `${isPositive ? '+' : ''}${diff.toFixed(1)} pts`}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans border-t border-zinc-800/80 pt-3">
                    {isZero
                      ? 'Configure category envelope budgets and record transactions to compute your Financial Health Impact trajectory.'
                      : (intelligence?.financial_health_impact?.explanation ||
                        `Your current budget usage is maintaining an optimal burn-rate, contributing ${isPositive ? 'positively' : 'critically'} to your net worth trajectory.`)}
                  </p>
                </div>
              );
            })()}

            {/* Right Column: Actionable Recommendations (7 Cols) */}
            <div className="lg:col-span-7 space-y-3 flex flex-col justify-center">
              {actionRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 p-3.5 flex items-start space-x-3.5 transition-colors group"
                >
                  <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white font-outfit tracking-tight truncate">
                        {rec.title}
                      </h4>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border font-outfit shrink-0 ${rec.tagColor}`}>
                        {rec.tag}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {rec.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
