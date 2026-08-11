import React from 'react';
import { Filter, X, Calendar, MapPin, Store, Trash2 } from 'lucide-react';

export const TransactionFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories = [],
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Advanced Filters & Time Periods
          </h4>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Transaction Type */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Transaction Type
          </label>
          <select
            value={filters.transaction_type || ''}
            onChange={(e) => onFilterChange('transaction_type', e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income (+)</option>
            <option value="EXPENSE">Expense (-)</option>
            <option value="TRANSFER">Transfer (⇄)</option>
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Category
          </label>
          <select
            value={filters.category_id || ''}
            onChange={(e) => onFilterChange('category_id', e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Payment Method
          </label>
          <select
            value={filters.payment_method || ''}
            onChange={(e) => onFilterChange('payment_method', e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        {/* Account Type */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Account Type
          </label>
          <select
            value={filters.account_type || ''}
            onChange={(e) => onFilterChange('account_type', e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Accounts</option>
            <option value="SAVINGS">Savings Account</option>
            <option value="CHECKING">Checking Account</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="WALLET">Digital Wallet</option>
          </select>
        </div>

        {/* Year Preset */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Year
          </label>
          <select
            value={filters.year || ''}
            onChange={(e) => onFilterChange('year', e.target.value ? parseInt(e.target.value) : '')}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Years</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Month Preset */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Month
          </label>
          <select
            value={filters.month || ''}
            onChange={(e) => onFilterChange('month', e.target.value ? parseInt(e.target.value) : '')}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quarter Preset */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Quarter
          </label>
          <select
            value={filters.quarter || ''}
            onChange={(e) => onFilterChange('quarter', e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Quarters</option>
            <option value="Q1">Q1 (Jan - Mar)</option>
            <option value="Q2">Q2 (Apr - Jun)</option>
            <option value="Q3">Q3 (Jul - Sep)</option>
            <option value="Q4">Q4 (Oct - Dec)</option>
          </select>
        </div>

        {/* Merchant Filter */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Merchant
          </label>
          <input
            type="text"
            placeholder="e.g. McDonald's, Uber"
            value={filters.merchant || ''}
            onChange={(e) => onFilterChange('merchant', e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Min Amount */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Min Amount (₹)
          </label>
          <input
            type="number"
            placeholder="0"
            value={filters.min_amount || ''}
            onChange={(e) => onFilterChange('min_amount', e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Max Amount */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Max Amount (₹)
          </label>
          <input
            type="number"
            placeholder="100000"
            value={filters.max_amount || ''}
            onChange={(e) => onFilterChange('max_amount', e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Location Filter */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Location
          </label>
          <input
            type="text"
            placeholder="e.g. Mumbai, Online"
            value={filters.location || ''}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Recurring & Soft Deleted Toggles */}
        <div className="space-y-2 flex flex-col justify-end">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.is_recurring || false}
              onChange={(e) => onFilterChange('is_recurring', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
            />
            <span>Recurring Only</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.only_deleted || false}
              onChange={(e) => onFilterChange('only_deleted', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-900"
            />
            <span className="flex items-center gap-1">
              <Trash2 className="h-3 w-3" /> Show Trash / Deleted
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
