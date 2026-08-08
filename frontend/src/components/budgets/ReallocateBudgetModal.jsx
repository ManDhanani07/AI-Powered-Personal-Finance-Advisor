import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert, PlusCircle, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import budgetService from '../../services/budgetService.js';

export const ReallocateBudgetModal = ({
  isOpen,
  onClose,
  reallocationData,
  budgets = [],
  onSuccess,
  onOpenIncrease,
}) => {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const { possible = false, surplus_categories = [], message = 'No available budget can be reallocated.' } =
    reallocationData || {};

  const exceededBudgets = budgets.filter((b) => b.status === 'EXCEEDED' || parseFloat(b.spent_amount) > parseFloat(b.budget_amount));
  const surplusBudgetsList = surplus_categories.length > 0 ? surplus_categories : budgets.filter((b) => parseFloat(b.remaining_amount) > 0);

  const selectedSource = surplusBudgetsList.find((b) => (b.budget_id || b.id) === sourceId);
  const maxAvailable = selectedSource ? (selectedSource.available_surplus || parseFloat(selectedSource.remaining_amount) || 0) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sourceId || !targetId || !amount) {
      toast.error('Please select both source and target envelopes and specify an amount.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Reallocation amount must be greater than zero.');
      return;
    }

    if (numAmount > maxAvailable) {
      toast.error(`Reallocation amount exceeds available surplus (₹${maxAvailable.toLocaleString('en-IN')}).`);
      return;
    }

    setLoading(true);
    try {
      await budgetService.reallocateBudget({
        source_budget_id: sourceId,
        target_budget_id: targetId,
        amount: numAmount,
      });
      toast.success('Budget reallocated successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reallocate budget.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOneTime = () => {
    toast.info('Overspending marked as exceptional one-time expense. Budget warning acknowledged.');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-3xl border border-border-strong bg-bg-surface p-6 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-bold">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                  Envelope Budget Reallocation
                </h3>
                <p className="text-xs text-slate-400">
                  Transfer unallocated surplus from safe envelopes to balance exceeded budgets
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!possible && surplusBudgetsList.length === 0 ? (
            /* IF REALLOCATION IS NOT POSSIBLE */
            <div className="space-y-4 py-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <ShieldAlert className="h-7 w-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                  No Available Budget to Reallocate
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  All active category envelope budgets are fully utilized or exceeded. You cannot shift funds between envelopes currently.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenIncrease?.();
                  }}
                  className="w-full rounded-2xl bg-primary-500 py-3 text-xs font-bold text-white shadow-lg hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Increase Overall Budget Limit</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkOneTime}
                  className="w-full rounded-2xl border border-border-strong bg-bg-surface-soft py-2.5 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                >
                  Mark Expense as One-Time / Exceptional
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Accept Overspending Warning
                </button>
              </div>
            </div>
          ) : (
            /* REALLOCATION FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Source Envelope Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Transfer From (Surplus Source Envelope)
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full rounded-2xl border border-border-strong bg-bg-surface py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Surplus Category...</option>
                  {surplusBudgetsList.map((b) => (
                    <option key={b.budget_id || b.id} value={b.budget_id || b.id}>
                      {b.category_name || b.budget_name || b.category?.category_name} (Surplus: ₹
                      {(b.available_surplus || parseFloat(b.remaining_amount) || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Envelope Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Transfer To (Exceeded / Deficit Target Envelope)
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-2xl border border-border-strong bg-bg-surface py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Deficit Category...</option>
                  {budgets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.category?.category_name || b.budget_name} (Status: {b.status}, Spent: ₹
                      {parseFloat(b.spent_amount || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-900 dark:text-white">
                    Transfer Amount (₹)
                  </label>
                  {selectedSource && (
                    <span className="text-[11px] font-semibold text-emerald-500">
                      Max Available: ₹{maxAvailable.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="Enter amount to transfer..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={maxAvailable}
                  className="w-full rounded-2xl border border-border-strong bg-bg-surface py-2.5 px-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !sourceId || !targetId || !amount}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  {loading ? 'Reallocating...' : 'Confirm Reallocation'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReallocateBudgetModal;
