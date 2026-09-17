import React from 'react';
import { FileText, RefreshCw, Sparkles, Download, Layers } from 'lucide-react';
import ExportButtons from './ExportButtons.jsx';

export const ReportsHeader = ({
  onRefresh,
  isRefreshing,
  onExport,
  activeFilter = 'all',
  customStart = null,
  customEnd = null,
  activeTab = 'executive_summary',
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary-500/20 to-indigo-600/20 border border-primary-500/30 text-primary-400 shadow-md">
          <FileText className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Financial Reports & Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary-500/15 border border-primary-500/30 text-primary-300">
              PostgreSQL Live Data
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise analytics engine with real-time KPI aggregations, multi-period breakdown, and export capabilities.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-2xl bg-bg-card hover:bg-border-subtle/50 border border-border-subtle text-slate-300 hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Refresh Reports Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-400' : ''}`} />
        </button>

        <ExportButtons
          onExport={onExport}
          activeFilter={activeFilter}
          customStart={customStart}
          customEnd={customEnd}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
};


export default ReportsHeader;
