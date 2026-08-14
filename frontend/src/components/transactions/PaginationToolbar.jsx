import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PaginationToolbar = ({
  page = 1,
  pageSize = 20,
  totalItems = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  // Generate compact page numbers (max 5 visible)
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2 text-xs text-slate-500">
      {/* Left: count info */}
      <div className="text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-300">{startItem}–{endItem}</span>{' '}
        of{' '}
        <span className="font-semibold text-slate-300">{totalItems.toLocaleString()}</span>{' '}
        transactions
      </div>

      {/* Right: pagination controls */}
      <div className="flex items-center gap-3">
        {/* Rows per page */}
        <div className="flex items-center gap-2 text-slate-500">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-zinc-800 bg-zinc-900 py-1 px-2 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-700 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Page buttons */}
        <div className="flex items-center gap-1">
          <PageBtn
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            title="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </PageBtn>

          {/* First page indicator if not visible */}
          {pageNumbers[0] > 1 && (
            <>
              <PageBtn onClick={() => onPageChange(1)}>1</PageBtn>
              {pageNumbers[0] > 2 && <span className="px-1 text-slate-600">…</span>}
            </>
          )}

          {pageNumbers.map((n) => (
            <PageBtn
              key={n}
              onClick={() => onPageChange(n)}
              active={n === page}
            >
              {n}
            </PageBtn>
          ))}

          {/* Last page indicator if not visible */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-1 text-slate-600">…</span>
              )}
              <PageBtn onClick={() => onPageChange(totalPages)}>{totalPages}</PageBtn>
            </>
          )}

          <PageBtn
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Next"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </PageBtn>
        </div>
      </div>
    </div>
  );
};

const PageBtn = ({ children, onClick, disabled, active, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`min-w-[28px] h-7 px-1.5 rounded-md text-xs font-medium transition-colors ${
      active
        ? 'bg-white text-zinc-950 font-semibold'
        : disabled
        ? 'text-slate-700 cursor-not-allowed'
        : 'text-slate-400 hover:text-white hover:bg-zinc-800'
    }`}
  >
    {children}
  </button>
);

export default PaginationToolbar;
