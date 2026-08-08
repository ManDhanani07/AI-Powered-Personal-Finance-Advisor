import React from 'react';
import { Search, X, LayoutGrid, List } from 'lucide-react';

export const BudgetFilters = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
}) => {
  const statuses = [
    { id: 'ALL', label: 'All Budgets' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'EXCEEDED', label: 'Exceeded' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
      <div className="flex flex-1 items-center gap-3 w-full">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search budget allocations..."
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

        {/* Status Filters */}
        <div className="hidden md:flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1 dark:border-slate-800/80 dark:bg-slate-900/80">
          {statuses.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStatusChange(s.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === s.id
                  ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            viewMode === 'grid'
              ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-500'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Grid
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('table')}
          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            viewMode === 'table'
              ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-500'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <List className="h-3.5 w-3.5" />
          Table
        </button>
      </div>
    </div>
  );
};

export default BudgetFilters;
