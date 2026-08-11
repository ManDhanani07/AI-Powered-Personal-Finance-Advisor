import React, { useState } from 'react';
import { Calendar, Filter, ChevronRight } from 'lucide-react';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

export const ReportFilters = ({
  activeFilter,
  onFilterChange,
  customStart,
  customEnd,
  onCustomRangeChange,
  comparePrevious = false,
  onCompareToggle,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [startDate, setStartDate] = useState(customStart || '');
  const [endDate, setEndDate] = useState(customEnd || '');

  const handleSelect = (id) => {
    if (id === 'custom') {
      setShowCustomModal(true);
    } else {
      setShowCustomModal(false);
      onFilterChange(id);
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      onCustomRangeChange(startDate, endDate);
      onFilterChange('custom');
      setShowCustomModal(false);
    }
  };

  return (
    <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-4 rounded-3xl shadow-lg space-y-3">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-primary-400" />
          <span>Period Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-extrabold shadow-sm'
                    : 'bg-[#09090B] hover:bg-zinc-900 text-slate-400 hover:text-white border border-zinc-800'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Compare Previous Toggle Switch */}
        {onCompareToggle && activeFilter !== 'all' && (
          <label className="flex items-center gap-2 cursor-pointer bg-primary-500/10 border border-primary-500/30 px-3.5 py-1.5 rounded-2xl transition-all hover:bg-primary-500/20">
            <input
              type="checkbox"
              checked={comparePrevious}
              onChange={(e) => onCompareToggle(e.target.checked)}
              className="w-4 h-4 accent-primary-500 cursor-pointer rounded"
            />
            <span className="text-xs font-bold text-primary-300 whitespace-nowrap">
              Compare with Previous Period
            </span>
          </label>
        )}
      </div>

      {activeFilter === 'custom' && customStart && customEnd && (
        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-primary-300 font-mono">
          <span>Active Range: {customStart} to {customEnd}</span>
          <button
            onClick={() => setShowCustomModal(true)}
            className="hover:underline text-slate-400 text-[11px]"
          >
            Change Date Range
          </button>
        </div>
      )}

      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-400" />
                <span>Select Custom Date Range</span>
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-bg-card border border-border-subtle rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-bg-card border border-border-subtle rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-2xl bg-bg-card border border-border-subtle text-xs text-slate-300 hover:bg-border-subtle/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 text-xs text-white font-bold hover:scale-[1.02]"
                >
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
