import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import reportService from '../../services/reportService.js';

const TAB_TITLES = {
  executive_summary: 'Executive Summary',
  spending_analysis: 'Spending & Merchant Analysis',
  tax_audit: 'Tax & Fiscal Audit',
  insights_export: 'Comprehensive Financial Master Dossier',
};

export const ExportButtons = ({
  onExport,
  activeFilter = 'all',
  customStart = null,
  customEnd = null,
  activeTab = 'executive_summary',
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleExportPdf = async () => {
    try {
      setDownloading(true);
      const targetType = activeTab || 'executive_summary';
      if (typeof onExport === 'function') {
        await onExport('pdf', targetType);
      } else {
        await reportService.downloadReportFile('pdf', targetType, activeFilter, customStart, customEnd);
      }
      const pageTitle = TAB_TITLES[activeTab] || 'Financial Report';
      toast.success(`${pageTitle} PDF statement downloaded!`, { icon: '📄' });
    } catch (err) {
      console.error('PDF export download failed:', err);
      toast.error('Failed to generate and download PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleExportPdf}
      disabled={downloading}
      className="px-4 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer font-outfit"
      title="Download Formatted PDF Financial Statement"
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      <span>Download PDF</span>
    </button>
  );
};

export default ExportButtons;

