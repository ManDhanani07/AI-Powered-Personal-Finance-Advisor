import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2, Trash2, Archive } from 'lucide-react';
import { toast } from 'react-toastify';
import transactionService from '../../services/transactionService.js';

export const DeleteTransactionModal = ({
  isOpen,
  onClose,
  transaction,
  onSuccess,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !transaction) return null;

  const isAlreadyDeleted = transaction.is_deleted;

  const handleDelete = async (hard = false) => {
    setIsSubmitting(true);
    try {
      await transactionService.deleteTransaction(transaction.id, hard);
      toast.success(
        hard
          ? 'Transaction permanently deleted.'
          : 'Transaction moved to Trash. You can restore it anytime.',
        { icon: '🗑️' }
      );
      if (onSuccess) onSuccess(transaction.id);
      if (onConfirm) onConfirm(transaction.id);
      window.dispatchEvent(new CustomEvent('ledger_updated'));
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to delete transaction.');
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
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAlreadyDeleted ? 'Permanently Delete Transaction' : 'Delete Transaction'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{transaction.title}</strong>?
          </p>

          {!isAlreadyDeleted && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-[11px] text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              Soft deletion moves the transaction to Trash, allowing quick recovery anytime.
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            {!isAlreadyDeleted && (
              <button
                type="button"
                onClick={() => handleDelete(false)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-amber-500 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                Move to Trash
              </button>
            )}

            <button
              type="button"
              onClick={() => handleDelete(true)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isAlreadyDeleted ? 'Delete Forever' : 'Delete Permanently'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteTransactionModal;
