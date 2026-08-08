import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Check, Loader2 } from 'lucide-react';
import { showToast } from '../common/ToastProvider.jsx';

export const ExportButtons = ({ onExport }) => {
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  const handleExport = async (format) => {
    try {
      setDownloadingFormat(format);
      await onExport(format);
      showToast.success(`Exported ${format.toUpperCase()} report successfully!`);
    } catch (err) {
      console.error(err);
      showToast.error(`Failed to export ${format.toUpperCase()} report.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport('pdf')}
        disabled={!!downloadingFormat}
        className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
      >
        {downloadingFormat === 'pdf' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        <span>PDF</span>
      </button>

      <button
        onClick={() => handleExport('xlsx')}
        disabled={!!downloadingFormat}
        className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
      >
        {downloadingFormat === 'xlsx' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5" />
        )}
        <span>Excel</span>
      </button>

      <button
        onClick={() => handleExport('csv')}
        disabled={!!downloadingFormat}
        className="px-3.5 py-2.5 rounded-2xl bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
      >
        {downloadingFormat === 'csv' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span>CSV</span>
      </button>
    </div>
  );
};

export default ExportButtons;
