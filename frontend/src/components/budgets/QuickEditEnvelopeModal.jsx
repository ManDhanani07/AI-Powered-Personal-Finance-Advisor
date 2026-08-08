import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Check, Sparkles, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { toast } from 'react-toastify';

export const QuickEditEnvelopeModal = ({
  isOpen,
  onClose,
  budget,
  totalIncome = 0,
  totalAllocated = 0,
  onSave,
}) => {
  const [newLimit, setNewLimit] = useState(budget?.budget_amount || 0);

  useEffect(() => {
    if (budget) {
      setNewLimit(parseFloat(budget.budget_amount) || 0);
    }
  }, [budget]);

  if (!isOpen || !budget) return null;

  const currentLimit = parseFloat(budget.budget_amount) || 0;
  const difference = newLimit - currentLimit;
  const currentUnallocated = Math.max(0, totalIncome - totalAllocated);
  const remainingSurplusAfterEdit = currentUnallocated - difference;

  const handleSave = () => {
    if (onSave) {
      onSave(budget.id, newLimit);
    }
    toast.success(`Budget limit for ${budget.category?.category_name || 'Envelope'} updated to ${formatCurrency(newLimit)}!`, { icon: '🎯' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && budget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md rounded-3xl border border-border-strong bg-bg-surface p-6 shadow-2xl backdrop-blur-2xl space-y-5 z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                      Adjust Envelope Budget Limit
                    </h3>
                    <p className="text-xs text-slate-400">
                      {budget.category?.category_name || budget.budget_name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-bg-elevated transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slider Input Canvas */}
              <div className="space-y-4 rounded-2xl border border-border-strong bg-bg-elevated/60 p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">New Limit</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-outfit">
                    {formatCurrency(newLimit)}
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={1000}
                  max={500000}
                  step={1000}
                  value={newLimit}
                  onChange={(e) => setNewLimit(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg bg-border-strong appearance-none cursor-pointer accent-primary-500"
                />

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Min: ₹1,000</span>
                  <span>Max: ₹5,00,000</span>
                </div>
              </div>

              {/* Real-time Visual Feedback on Unallocated Surplus */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Remaining Zero-Based Surplus</span>
                  <span className={`text-base font-black font-outfit ${remainingSurplusAfterEdit < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {formatCurrency(remainingSurplusAfterEdit)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {difference > 0
                    ? `Increasing budget by ${formatCurrency(difference)} consumes zero-based surplus.`
                    : difference < 0
                    ? `Decreasing budget frees up ${formatCurrency(Math.abs(difference))} to surplus.`
                    : 'Budget limit unchanged.'}
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl border border-border-strong bg-bg-elevated font-bold text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-primary-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Save Budget Allocation
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickEditEnvelopeModal;
