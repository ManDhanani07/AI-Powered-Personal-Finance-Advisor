import React from 'react';

export const CategoryFilters = ({
  typeFilter,
  onTypeChange,
  sourceFilter,
  onSourceChange,
}) => {
  const types = [
    { id: 'ALL', label: 'All Types' },
    { id: 'EXPENSE', label: 'Expenses' },
    { id: 'INCOME', label: 'Income' },
    { id: 'INVESTMENT', label: 'Investments' },
    { id: 'TRANSFER', label: 'Transfers' },
  ];

  const sources = [
    { id: 'ALL', label: 'All Sources' },
    { id: 'DEFAULT', label: 'System Default' },
    { id: 'CUSTOM', label: 'User Custom' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
          Type:
        </span>
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTypeChange(t.id)}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
              typeFilter === t.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
          Source:
        </span>
        {sources.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSourceChange(s.id)}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
              sourceFilter === s.id
                ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilters;
