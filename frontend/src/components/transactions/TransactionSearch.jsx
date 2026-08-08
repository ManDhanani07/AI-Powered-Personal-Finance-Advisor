import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export const TransactionSearch = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  hasActiveFilters,
  onResetFilters,
  onToggleFilters,
  isFilterOpen,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
      <div className="relative flex-1 w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by merchant, title, description, or notes..."
          className="w-full rounded-2xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-800 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onToggleFilters}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all ${
            isFilterOpen || hasActiveFilters
              ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-500/50 dark:bg-indigo-950/60 dark:text-indigo-400'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionSearch;
