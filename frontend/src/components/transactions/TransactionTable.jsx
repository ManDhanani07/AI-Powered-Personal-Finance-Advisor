import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Eye,
  Edit3,
  Copy,
  Trash2,
  RotateCcw,
  ArrowUpDown,
  MoreVertical,
  Scissors,
  CheckSquare,
  Square,
  Building2,
  Calendar,
  CreditCard,
  Tag,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const TransactionTable = ({
  transactions = [],
  sortField,
  sortOrder,
  onSort,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onRestore,
  selectedIds = [],
  onToggleSelectRow,
  onToggleSelectAll,
  allSelected = false,
}) => {
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!transactions.length) return null;

  return (
    <div className="overflow-x-auto rounded-3xl border border-border-subtle bg-bg-surface/80 shadow-glass backdrop-blur-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full text-left text-xs border-collapse">
        {/* Table Header */}
        <thead className="bg-bg-elevated/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-border-subtle sticky top-0 backdrop-blur-md z-10">
          <tr>
            {/* Merchant & Title */}
            <th scope="col" className="py-3 px-4">
              <button
                type="button"
                onClick={() => onSort('title')}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <span>Merchant / Transaction</span>
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>

            {/* Category */}
            <th scope="col" className="py-3 px-3">
              <button
                type="button"
                onClick={() => onSort('category_id')}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Tag className="h-3 w-3 text-primary-500" />
                <span>Category</span>
              </button>
            </th>

            {/* Date / Time */}
            <th scope="col" className="py-3 px-3">
              <button
                type="button"
                onClick={() => onSort('transaction_date')}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Calendar className="h-3 w-3 text-primary-500" />
                <span>Date & Time</span>
              </button>
            </th>

            {/* Source Account / Payment Method */}
            <th scope="col" className="py-3 px-3">
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3 w-3 text-primary-500" />
                <span>Source Account</span>
              </span>
            </th>

            {/* Status Badge */}
            <th scope="col" className="py-3 px-3">
              <span>Status</span>
            </th>

            {/* Amount */}
            <th scope="col" className="py-3 px-3 text-right">
              <button
                type="button"
                onClick={() => onSort('amount')}
                className="flex items-center gap-1.5 ml-auto hover:text-white transition-colors"
              >
                <span>Amount</span>
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>

            {/* Context Menu Trigger */}
            <th scope="col" className="py-3 px-3 text-center w-12">
              <span>Actions</span>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-border-subtle font-medium">
          {transactions.map((tx) => {
            const isIncome = tx.transaction_type === 'INCOME';
            const isTransfer = tx.transaction_type === 'TRANSFER';
            const isDeleted = tx.is_deleted;
            const isSelected = selectedIds.includes(tx.id);

            const merchantName = tx.merchant || tx.title || 'Merchant';
            const initialLetter = merchantName.charAt(0).toUpperCase();

            return (
              <tr
                key={tx.id}
                onClick={() => onView(tx)}
                className={`group cursor-pointer transition-all duration-200 hover:translate-x-[2px] hover:bg-bg-elevated/70 ${
                  isSelected ? 'bg-primary-500/10' : isDeleted ? 'bg-rose-500/5 opacity-70' : ''
                }`}
              >
                {/* Merchant Info + Logo Avatar */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {/* Logo Avatar */}
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-primary-500/20 flex items-center justify-center font-bold text-primary-400 text-xs shadow-sm flex-shrink-0">
                      {initialLetter}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[200px]">
                        {tx.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {tx.merchant || 'General Merchant'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category Pill */}
                <td className="py-3 px-3">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border border-border-subtle bg-bg-elevated text-slate-700 dark:text-slate-200 shadow-sm"
                    style={{ borderColor: tx.category?.color || 'inherit' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tx.category?.color || '#6366F1' }}
                    />
                    {tx.category?.category_name || 'Uncategorized'}
                  </span>
                </td>

                {/* Date / Time */}
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                  {formatDate(tx.transaction_date, 'DD MMM YYYY, hh:mm A')}
                </td>

                {/* Source Account */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-lg border border-border-subtle bg-bg-elevated text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {tx.payment_method || 'UPI'} • {tx.account_type || 'Savings'}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="py-3 px-3">
                  {isDeleted ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold text-[10px]">
                      Deleted
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                      Completed
                    </span>
                  )}
                </td>

                {/* Amount (Color coded green for INCOME, white for EXPENSE) */}
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <span
                    className={`font-black text-xs ${
                      isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </td>

                {/* Row Context Menu Trigger (...) */}
                <td className="py-3 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setActiveMenuId(activeMenuId === tx.id ? null : tx.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-bg-elevated transition-colors"
                    title="Actions Menu"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Context Menu Dropdown */}
                  {activeMenuId === tx.id && (
                    <div className="absolute right-4 mt-1 w-36 rounded-2xl bg-bg-surface border border-border-strong shadow-2xl z-50 p-1 space-y-0.5 text-left">
                      <button
                        onClick={() => {
                          onView(tx);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-bg-elevated"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => {
                          onEdit(tx);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-bg-elevated"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          onDuplicate(tx.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-bg-elevated"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => {
                          onDelete(tx);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
