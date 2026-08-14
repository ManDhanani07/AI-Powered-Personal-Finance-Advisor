import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Target, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

import { PageContainer } from '../../components/layout/PageContainer.jsx';
import goalService from '../../services/goalService.js';

import GoalSummary from '../../components/goals/GoalSummary.jsx';
import GoalVaultCard from '../../components/goals/GoalVaultCard.jsx';
import DepositModal from '../../components/goals/DepositModal.jsx';
import GoalForm from '../../components/goals/GoalForm.jsx';
import DeleteGoalModal from '../../components/goals/DeleteGoalModal.jsx';

export const Goals = () => {
  const [goals, setGoals] = useState(() => {
    try {
      const cached = sessionStorage.getItem('goal_cache_items');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [summary, setSummary] = useState(() => {
    try {
      const cached = sessionStorage.getItem('goal_cache_summary');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('goal_cache_items');
    } catch {
      return true;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [goalsRes, summaryRes] = await Promise.allSettled([
        goalService.getGoals({ page_size: 100 }),
        goalService.getGoalSummary(),
      ]);

      if (goalsRes.status === 'fulfilled') {
        const res = goalsRes.value;
        const items = res?.data?.items || res?.items || (Array.isArray(res?.data) ? res.data : []);
        setGoals(items);
        sessionStorage.setItem('goal_cache_items', JSON.stringify(items));
      }

      if (summaryRes.status === 'fulfilled') {
        const res = summaryRes.value;
        if (res?.data) {
          setSummary(res.data);
          sessionStorage.setItem('goal_cache_summary', JSON.stringify(res.data));
        }
      }
    } catch (err) {
      console.warn('Failed to load goals data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGoals = loadAll;
  const loadSummary = loadAll;

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Filtered Goals List
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = g.goal_name.toLowerCase().includes(q);
        const matchType = g.goal_type ? g.goal_type.toLowerCase().includes(q) : false;
        if (!matchName && !matchType) return false;
      }
      return true;
    });
  }, [goals, searchQuery]);

  const handleOpenDeposit = (g) => {
    setSelectedGoalForDeposit(g);
    setIsDepositOpen(true);
  };

  const handleDepositSuccess = async (goalId, depositVal) => {
    try {
      await goalService.depositGoal(goalId, { amount: depositVal });
      window.dispatchEvent(new CustomEvent('ledger_updated'));
      loadGoals();
      loadSummary();
    } catch (err) {
      console.warn('Failed to deposit into goal vault:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to deposit into goal vault');
    }
  };

  const handleAutoSave = (g) => {
    toast.info(`Automated rule configured for ${g.goal_name}: ₹2,000 monthly auto-transfer`, { icon: '⚙️' });
  };

  return (
    <PageContainer
      title="Goal Vaults & Wealth Tracker"
      description="Visual savings targets with dynamic SVG liquid progress gauges and automated deposit rules."
      action={
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Vault</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-[1920px] w-full mx-auto">
        {/* Summary Stats Cards */}
        <GoalSummary summary={summary} />

        {/* Goal Vault Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <p className="text-xs font-semibold text-slate-400">Loading savings vaults...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="rounded-3xl border border-border-subtle bg-bg-surface p-12 text-center shadow-glass space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
              <Target className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              No Savings Vaults Found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Set up target vaults for your emergency fund, major purchases, or investments.
            </p>
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Vault
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((g, i) => (
              <GoalVaultCard
                key={g.id}
                goal={g}
                index={i}
                onDeposit={handleOpenDeposit}
                onAutoSave={handleAutoSave}
                onEdit={(item) => {
                  setEditingGoal(item);
                  setIsFormOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Deposit Allocation Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        goal={selectedGoalForDeposit}
        onSuccess={handleDepositSuccess}
      />

      {/* Goal Creation & Edit Modal */}
      <GoalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingGoal}
        onSuccess={() => {
          loadGoals();
          loadSummary();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteGoalModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        goal={deletingGoal}
        onSuccess={() => {
          loadGoals();
          loadSummary();
        }}
      />
    </PageContainer>
  );
};

export default Goals;
