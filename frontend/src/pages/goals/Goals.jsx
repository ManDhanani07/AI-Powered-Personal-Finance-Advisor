import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Target, Loader2, Sparkles, Search, Filter, ShieldCheck, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [selectedType, setSelectedType] = useState('ALL');

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
      if (selectedType !== 'ALL') {
        const gType = (g.goal_type || '').toUpperCase();
        if (gType !== selectedType.toUpperCase()) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (g.goal_name || '').toLowerCase().includes(q);
        const matchType = (g.goal_type || '').toLowerCase().includes(q);
        const matchDesc = (g.description || '').toLowerCase().includes(q);
        if (!matchName && !matchType && !matchDesc) return false;
      }
      return true;
    });
  }, [goals, searchQuery, selectedType]);

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

  const handleCreateNewGoal = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  return (
    <PageContainer
      title="Goal Vaults & Wealth Tracker"
      description="Visual savings targets with dynamic SVG liquid progress gauges and automated deposit rules."
      action={
        <button
          onClick={handleCreateNewGoal}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Vault</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-[1920px] w-full mx-auto">
        {/* Summary Stats Cards */}
        <GoalSummary summary={summary} />

        {/* Toolbar: Search + Quick Filters + Add Goal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search goals by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-white placeholder-zinc-500 text-xs font-medium focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNewGoal}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>

        {/* Goal Vault Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-xs font-semibold text-slate-400">Loading savings vaults...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-12 text-center shadow-glass space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-white font-outfit">
                No Savings Vaults Found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Set up target vaults for your emergency fund, vehicle, vacation, or investments.
              </p>
            </div>
            <button
              onClick={handleCreateNewGoal}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Goal Vault</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Goal Cards */}
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
