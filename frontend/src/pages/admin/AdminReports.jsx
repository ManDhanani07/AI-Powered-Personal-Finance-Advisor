import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, FileCode } from 'lucide-react';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminReports = () => {
  const [downloading, setDownloading] = useState(false);

  const handleExport = (type, format) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      showToast.success(`Exported ${type} report as ${format.toUpperCase()}!`, { icon: '📥' });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      <div className="border border-zinc-800 bg-[#09090B] p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-extrabold text-white font-outfit">Platform Admin Reports & Exports</h3>
        <p className="text-xs text-slate-400">Generate and download platform-wide intelligence reports.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <ReportTile title="User Growth & Acquisition" desc="Complete registration and retention metrics." onExport={(fmt) => handleExport('User Growth', fmt)} />
          <ReportTile title="Platform Financial Ledger" desc="Full transaction history and income/expense breakdown." onExport={(fmt) => handleExport('Platform Ledger', fmt)} />
          <ReportTile title="AI Copilot Usage Log" desc="Gemini API prompt logs, latencies, and user query topics." onExport={(fmt) => handleExport('AI Usage', fmt)} />
          <ReportTile title="Budgets & Goals Performance" desc="Category budget allocations and goal vault progress." onExport={(fmt) => handleExport('Budgets & Goals', fmt)} />
          <ReportTile title="Security Audit Logs" desc="Administrative action history and login security events." onExport={(fmt) => handleExport('Audit Logs', fmt)} />
          <ReportTile title="System Health & Uptime" desc="Technical diagnostics and service latency logs." onExport={(fmt) => handleExport('System Health', fmt)} />
        </div>
      </div>
    </div>
  );
};

const ReportTile = ({ title, desc, onExport }) => (
  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3 flex flex-col justify-between">
    <div>
      <h4 className="text-xs font-bold text-white font-outfit">{title}</h4>
      <p className="text-[11px] text-slate-400 leading-tight mt-1">{desc}</p>
    </div>
    <div className="flex items-center space-x-2 pt-2 border-t border-zinc-800">
      <button onClick={() => onExport('csv')} className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-slate-300 transition-colors flex items-center space-x-1">
        <FileCode className="w-3 h-3 text-indigo-400" />
        <span>CSV</span>
      </button>
      <button onClick={() => onExport('excel')} className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-slate-300 transition-colors flex items-center space-x-1">
        <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
        <span>Excel</span>
      </button>
      <button onClick={() => onExport('pdf')} className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-slate-300 transition-colors flex items-center space-x-1">
        <FileText className="w-3 h-3 text-rose-400" />
        <span>PDF</span>
      </button>
    </div>
  </div>
);

export default AdminReports;
