import React, { useEffect, useRef } from 'react';
import { Search, Download, Upload, X, Plus, ChevronDown } from 'lucide-react';

const SelectFilter = ({ value, onChange, children, minWidth = '140px' }) => (
  <div className="relative" style={{ minWidth }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 py-2 pl-3 pr-7 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer transition-colors"
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
  </div>
);

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
  hasActiveFilters,
  onClearFilters,
  onExportCSV,
  onImportCSV,
  onAddTransaction,
}) => {
  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search transactions…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/60 py-2 pl-9 pr-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700 transition-colors"
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-slate-600 bg-zinc-800 border border-zinc-700 rounded">
              /
            </kbd>
          </div>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category */}
        <SelectFilter value={selectedCategory} onChange={onCategoryChange} minWidth="148px">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.category_name || c.name}
            </option>
          ))}
        </SelectFilter>

        {/* Date Range */}
        <SelectFilter value={dateRange} onChange={onDateRangeChange} minWidth="130px">
          <option value="ALL">All Dates</option>
          <option value="THIS_MONTH">This Month</option>
          <option value="LAST_30">Last 30 Days</option>
          <option value="LAST_90">Last 90 Days</option>
          <option value="THIS_YEAR">This Year</option>
        </SelectFilter>

        {/* Payment Method */}
        <SelectFilter value={paymentMethod} onChange={onPaymentMethodChange} minWidth="148px">
          <option value="">All Methods</option>
          <option value="UPI">UPI / GPay</option>
          <option value="CREDIT_CARD">Credit Card</option>
          <option value="DEBIT_CARD">Debit Card</option>
          <option value="NET_BANKING">Net Banking</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CASH">Cash</option>
        </SelectFilter>

        {/* Reset Filters — only when active */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-medium transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}

        {/* Divider */}
        <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

        {/* Import CSV */}
        {onImportCSV && (
          <button
            onClick={onImportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
            title="Import transactions from bank CSV statement"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>
        )}

        {/* Export CSV */}
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* Add Transaction */}
        {onAddTransaction && (
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default HeaderControlBar;
