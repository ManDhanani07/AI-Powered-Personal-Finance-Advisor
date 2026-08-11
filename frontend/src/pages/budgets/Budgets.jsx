import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Loader2, Search, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

import { PageContainer } from '../../components/layout/PageContainer.jsx';
import budgetService from '../../services/budgetService.js';
import apiClient from '../../api/client.js';

import EnvelopeCard from '../../components/budgets/EnvelopeCard.jsx';
import QuickEditEnvelopeModal from '../../components/budgets/QuickEditEnvelopeModal.jsx';
import BudgetForm from '../../components/budgets/BudgetForm.jsx';
import DeleteBudgetModal from '../../components/budgets/DeleteBudgetModal.jsx';

import PremiumBudgetInsightCard from '../../components/budgets/PremiumBudgetInsightCard.jsx';
import BudgetWhyBreakdown from '../../components/budgets/BudgetWhyBreakdown.jsx';
import ReallocateBudgetModal from '../../components/budgets/ReallocateBudgetModal.jsx';
import FinancialHealthGoalImpactCard from '../../components/budgets/FinancialHealthGoalImpactCard.jsx';
import AIRecommendationsWidget from '../../components/budgets/AIRecommendationsWidget.jsx';

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
        <div className="p-8 rounded-3xl border border-red-500/30 bg-red-500/10 text-center space-y-4 max-w-2xl mx-auto my-12">
          <h3 className="text-lg font-bold text-red-500">Budgets Component Render Error</h3>
          <p className="text-xs text-slate-300 font-mono bg-black/40 p-4 rounded-xl overflow-x-auto text-left">
            {this.state.error?.toString()}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md"
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
  const [budgets, setBudgets] = useState(() => {
    try {
      const cached = sessionStorage.getItem('budget_cache_budgets');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [summary, setSummary] = useState(() => {
    try {
      const cached = sessionStorage.getItem('budget_cache_summary');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [intelligence, setIntelligence] = useState(() => {
    try {
      const cached = sessionStorage.getItem('budget_cache_intel');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('budget_cache_budgets');
    } catch {
      return true;
    }
  });

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
        sessionStorage.setItem('budget_cache_budgets', JSON.stringify(items));
      }

      if (summaryRes.status === 'fulfilled') {
        const res = summaryRes.value;
        const sumData = res?.data || (res && typeof res === 'object' ? res : null);
        if (sumData) {
          setSummary(sumData);
          sessionStorage.setItem('budget_cache_summary', JSON.stringify(sumData));
        }
      }

      if (intelRes.status === 'fulfilled') {
        const res = intelRes.value;
        const intelData = res?.data || res;
        if (intelData) {
          setIntelligence(intelData);
          sessionStorage.setItem('budget_cache_intel', JSON.stringify(intelData));
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

  const totalIncome = summary?.total_income ? parseFloat(summary.total_income) : (totalAllocated || 0);

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
      title="Intelligent Budget Management System"
      description="Zero-based category envelope budgeting with automated variance detection, live health impact, and cash flow re-balancing."
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReallocateOpen(true)}
            className="px-4 py-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reallocate Funds</span>
          </button>

          <button
            onClick={() => {
              setEditingBudget(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>New Envelope Budget</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* 1. Premium Budget Analysis Card */}
        {intelligence?.analysis_card && (
          <PremiumBudgetInsightCard analysisData={intelligence.analysis_card} />
        )}

        {/* 2. Explain Why / Root Cause Breakdown */}
        {intelligence?.why_explanation && (
          <BudgetWhyBreakdown whyData={intelligence.why_explanation} />
        )}

        {/* 3. Financial Health & Goal Impact */}
        {intelligence?.financial_health_impact && intelligence?.goal_impact && (
          <FinancialHealthGoalImpactCard
            healthImpact={intelligence.financial_health_impact}
            goalImpact={intelligence.goal_impact}
          />
        )}

        {/* 4. AI Recommendations Widget */}
        {intelligence?.ai_recommendations && (
          <AIRecommendationsWidget recommendations={intelligence.ai_recommendations} />
        )}

        {/* 5. Category Envelopes Management Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-subtle">
          <div className="relative flex-1 max-w-md w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search category envelopes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border-strong bg-bg-surface py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="text-xs text-slate-400 font-bold">
            Showing <span className="text-slate-900 dark:text-white font-black">{filteredBudgets.length}</span> active category envelopes
          </div>
        </div>

        {/* 6. 3-Column Responsive Envelope Card Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <p className="text-xs font-semibold text-slate-400">Loading envelope budgets...</p>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="rounded-3xl border border-border-subtle bg-bg-surface p-12 text-center shadow-glass space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
              <Target className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                No Envelope Budgets Found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Create category envelope limits to allocate your monthly zero-based budget and unlock intelligent AI burn-rate alerts.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBudget(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Envelope Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBudgets.map((b) => (
              <EnvelopeCard
                key={b.id}
                budget={b}
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
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setEditingBudget(null);
                setIsFormOpen(true);
              }}
              className="rounded-3xl border-2 border-dashed border-border-strong hover:border-primary-500/50 bg-bg-surface/40 hover:bg-primary-500/5 p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3 cursor-pointer min-h-[200px] transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 group-hover:bg-primary-500 text-primary-500 flex items-center justify-center font-bold transition-all group-hover:text-white">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
                  Add Another Envelope
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Allocate budget limit for another category or merchant
                </p>
              </div>
            </motion.div>
          </div>
        )}
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
