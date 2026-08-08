import React from 'react';
import { Calendar, Filter, Sparkles, RefreshCw } from 'lucide-react';

const PERIOD_OPTIONS = [
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '180 Days', value: 180 },
  { label: '365 Days', value: 365 },
];

const METRIC_OPTIONS = [
  { label: 'All Models', value: 'ALL' },
  { label: 'Monthly Expenses', value: 'EXPENSE' },
  { label: 'Monthly Income', value: 'INCOME' },
  { label: 'Net Savings', value: 'SAVINGS' },
  { label: 'Account Balance', value: 'BALANCE' },
];

export const ForecastFilters = ({
  periodDays,
  onPeriodChange,
  selectedMetric,
  onMetricChange,
  refreshing,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl border border-border-subtle bg-bg-surface/80 shadow-glass backdrop-blur-xl">
      {/* Forecast Horizon Period Control Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500/10 text-primary-400 text-xs font-bold shrink-0">
          <Calendar className="w-3.5 h-3.5" />
          <span>Horizon:</span>
        </div>
        {PERIOD_OPTIONS.map((opt) => {
          const isActive = periodDays === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onPeriodChange(opt.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-md shadow-primary-500/20 scale-[1.02]'
                  : 'bg-bg-elevated/70 text-slate-400 hover:text-white hover:bg-bg-elevated'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Right Actions: Metric Filter & Refresh */}
      <div className="flex items-center gap-3 justify-end">
        <div className="relative">
          <select
            value={selectedMetric}
            onChange={(e) => onMetricChange(e.target.value)}
            className="rounded-xl border border-border-strong bg-bg-elevated py-1.5 pl-3 pr-8 text-xs font-bold text-slate-200 focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            {METRIC_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl border border-border-strong bg-bg-surface hover:bg-bg-elevated text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          title="Re-run Meta Prophet Engine"
        >
          <RefreshCw className={`w-4 h-4 text-primary-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ForecastFilters;
