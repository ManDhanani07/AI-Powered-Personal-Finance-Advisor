import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, ArrowUpRight, RefreshCw, Edit3, Check } from 'lucide-react';

export const TransactionValidationModal = ({
  isOpen,
  onClose,
  validationData,
  onSaveAnyway,
  onEditTransaction,
  onOpenIncrease,
  onOpenReallocate,
}) => {
  if (!isOpen || !validationData || !validationData.exceeds) return null;

  const {
    category_name = 'Category',
    remaining_budget = 0,
    new_overspend = 0,
    message = 'This transaction exceeds your remaining budget.',
  } = validationData;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-3xl border-2 border-red-500/40 bg-slate-900 p-6 text-white shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-red-500/20 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 font-bold ring-2 ring-red-500/40 animate-pulse">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-outfit">
                Budget Threshold Exceeded
              </h3>
              <p className="text-xs text-red-300/90 mt-0.5">
                Transaction Validation Guardrail
              </p>
            </div>
          </div>

          {/* Details Box */}
          <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4 space-y-3">
            <p className="text-xs font-bold text-red-200 leading-relaxed">
              ⚠️ {message}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-red-500/20">
              <div>
                <span className="text-[11px] text-red-300/70 uppercase font-semibold block">
                  Remaining Budget
                </span>
                <span className="font-bold text-white font-mono">
                  ₹{remaining_budget.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-red-300/70 uppercase font-semibold block">
                  New Overspend Deficit
                </span>
                <span className="font-bold text-red-400 font-mono">
                  ₹{new_overspend.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                onSaveAnyway();
                onClose();
              }}
              className="w-full rounded-2xl bg-red-600 hover:bg-red-500 py-3 text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Check className="h-4 w-4" />
              <span>Save Anyway (Accept Overspending)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEditTransaction?.();
              }}
              className="w-full rounded-2xl border border-border-strong bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Transaction Amount</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenIncrease?.();
                }}
                className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 py-2.5 text-xs font-bold text-indigo-300 transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Increase Limit</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenReallocate?.();
                }}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 py-2.5 text-xs font-bold text-emerald-300 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reallocate</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionValidationModal;
