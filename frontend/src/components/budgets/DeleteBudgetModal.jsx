import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import budgetService from '../../services/budgetService.js';

export const DeleteBudgetModal = ({
  isOpen,
  onClose,
  budget,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !budget) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await budgetService.deleteBudget(budget.id);
      toast.info(`Budget '${budget.budget_name}' removed.`, { icon: '🗑️' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to remove budget allocation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-950 dark:bg-slate-900 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-red-100 dark:border-red-950">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Budget</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{budget.budget_name}</strong>?
            This will stop threshold tracking for this category limit.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Confirm Delete
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteBudgetModal;
