import React, { useEffect, useRef } from 'react';
import { Search, Download, Filter, Calendar, CreditCard, Tag, X, Plus } from 'lucide-react';

export const HeaderControlBar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
  dateRange,
  onDateRangeChange,
  paymentMethod,
  onPaymentMethodChange,
  onExportCSV,
  onClearFilters,
  hasActiveFilters,
  onAddTransaction,
}) => {
  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-3 bg-bg-surface border border-border-subtle rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-glass">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar with '/' Shortcut Badge */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search merchant, title, or amount... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-border-strong bg-slate-900/90 dark:bg-bg-elevated py-2.5 pl-10 pr-10 text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Filters & Actions Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full rounded-2xl border border-border-strong bg-slate-900/90 dark:bg-bg-elevated py-2.5 px-3.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer shadow-inner appearance-none"
            >
              <option value="" className="bg-slate-900 text-white">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.category_name || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Range Selector */}
          <div className="relative min-w-[130px]">
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="w-full rounded-2xl border border-border-strong bg-slate-900/90 dark:bg-bg-elevated py-2.5 px-3.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer shadow-inner appearance-none"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Dates</option>
              <option value="THIS_MONTH" className="bg-slate-900 text-white">This Month</option>
              <option value="LAST_30" className="bg-slate-900 text-white">Last 30 Days</option>
              <option value="LAST_90" className="bg-slate-900 text-white">Last 90 Days</option>
              <option value="THIS_YEAR" className="bg-slate-900 text-white">This Year</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="relative min-w-[130px]">
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full rounded-2xl border border-border-strong bg-slate-900/90 dark:bg-bg-elevated py-2.5 px-3.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer shadow-inner appearance-none"
            >
              <option value="" className="bg-slate-900 text-white">All Payment Methods</option>
              <option value="UPI" className="bg-slate-900 text-white">UPI / GPay / PhonePe</option>
              <option value="CREDIT_CARD" className="bg-slate-900 text-white">Credit Card</option>
              <option value="DEBIT_CARD" className="bg-slate-900 text-white">Debit Card</option>
              <option value="NET_BANKING" className="bg-slate-900 text-white">Net Banking</option>
              <option value="CASH" className="bg-slate-900 text-white">Cash</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            onClick={onExportCSV}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* + Add Transaction Glowing Primary Action Button */}
          {onAddTransaction && (
            <button
              onClick={onAddTransaction}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 via-indigo-600 to-accent-500 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Transaction</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderControlBar;
