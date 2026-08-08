import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Tag, CreditCard, Copy, Edit3, Trash2, RotateCcw, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const TransactionDetails = ({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDuplicate,
  onDelete,
  onRestore,
}) => {
  if (!isOpen || !transaction) return null;

  const isIncome = transaction.transaction_type === 'INCOME';
  const isTransfer = transaction.transaction_type === 'TRANSFER';
  const isDeleted = transaction.is_deleted;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">
                  {transaction.transaction_number}
                </span>
                {isDeleted && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase text-red-600 dark:bg-red-950 dark:text-red-400">
                    Trash (Deleted)
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {transaction.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Amount & Type Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  isIncome
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : isTransfer
                    ? 'bg-indigo-500/10 text-indigo-500'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {isIncome ? (
                  <ArrowDownLeft className="h-6 w-6" />
                ) : isTransfer ? (
                  <RefreshCw className="h-6 w-6" />
                ) : (
                  <ArrowUpRight className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {transaction.transaction_type}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {transaction.merchant || 'General Merchant'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xl font-extrabold ${
                  isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                }`}
              >
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
            </div>
          </div>

          {/* Metadata Specifications */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/40 space-y-1">
              <span className="flex items-center gap-1.5 font-semibold text-slate-400 dark:text-slate-500">
                <Tag className="h-3.5 w-3.5" />
                Category
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {transaction.category?.category_name || 'Uncategorized'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/40 space-y-1">
              <span className="flex items-center gap-1.5 font-semibold text-slate-400 dark:text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                Date & Time
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {formatDate(transaction.transaction_date, 'DD MMM YYYY, hh:mm A')}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/40 space-y-1">
              <span className="flex items-center gap-1.5 font-semibold text-slate-400 dark:text-slate-500">
                <CreditCard className="h-3.5 w-3.5" />
                Payment Method
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {transaction.payment_method || 'UPI'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/40 space-y-1">
              <span className="flex items-center gap-1.5 font-semibold text-slate-400 dark:text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                Location
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {transaction.location || 'N/A'}
              </p>
            </div>
          </div>

          {/* Notes if available */}
          {transaction.notes && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/40 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Notes</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{transaction.notes}</p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {isDeleted ? (
              <div className="flex items-center justify-between w-full">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onRestore) onRestore(transaction.id);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore Transaction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(transaction);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Permanently
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(transaction);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDuplicate(transaction.id);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-400"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(transaction);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-red-50/80 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-950 dark:bg-red-950/40 dark:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionDetails;
