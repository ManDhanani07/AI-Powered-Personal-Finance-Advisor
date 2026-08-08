import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PaginationToolbar = ({
  page = 1,
  pageSize = 10,
  totalItems = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-bg-surface/80 border border-border-subtle rounded-2xl backdrop-blur-md text-xs font-semibold text-slate-600 dark:text-slate-300">
      {/* Items Count Summary */}
      <div>
        Showing <span className="font-bold text-slate-900 dark:text-white">{startItem}</span> to{' '}
        <span className="font-bold text-slate-900 dark:text-white">{endItem}</span> of{' '}
        <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> transactions
      </div>

      <div className="flex items-center space-x-4">
        {/* Page Size Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-xl border border-border-strong bg-bg-elevated py-1 px-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Page Index Indicator */}
        <div className="text-slate-400">
          Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{totalPages || 1}</span>
        </div>

        {/* Previous / Next Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-xl border border-border-subtle bg-bg-elevated hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title={page <= 1 ? "Already on first page" : "Previous Page"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-xl border border-border-subtle bg-bg-elevated hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title={page >= totalPages ? "Already on last page" : "Next Page"}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationToolbar;
