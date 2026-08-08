import React from 'react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Copy, Edit3, Trash2, Eye, RotateCcw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const TransactionCard = ({
  transaction,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onRestore,
}) => {
  const isIncome = transaction.transaction_type === 'INCOME';
  const isTransfer = transaction.transaction_type === 'TRANSFER';
  const isDeleted = transaction.is_deleted;

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 space-y-3 ${
        isDeleted ? 'bg-red-50/20 border-red-200 dark:bg-red-950/10 dark:border-red-900/40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDeleted
                ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                : isIncome
                ? 'bg-emerald-500/10 text-emerald-500'
                : isTransfer
                ? 'bg-indigo-500/10 text-indigo-500'
                : 'bg-red-500/10 text-red-500'
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft className="h-5 w-5" />
            ) : isTransfer ? (
              <RefreshCw className="h-5 w-5" />
            ) : (
              <ArrowUpRight className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {transaction.title}
              </h4>
              {isDeleted && (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:bg-red-950 dark:text-red-400 uppercase shrink-0">
                  Deleted
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {transaction.merchant || 'General Merchant'} • {transaction.category?.category_name || 'Uncategorized'}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span
            className={`text-sm font-extrabold ${
              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
            {formatDate(transaction.transaction_date, 'DD MMM YYYY')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {transaction.payment_method || 'UPI'}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(transaction)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {!isDeleted && (
            <>
              <button
                type="button"
                onClick={() => onEdit(transaction)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Edit"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDuplicate(transaction.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                title="Duplicate"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {isDeleted ? (
            <button
              type="button"
              onClick={() => onRestore && onRestore(transaction.id)}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              title="Restore Transaction"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
