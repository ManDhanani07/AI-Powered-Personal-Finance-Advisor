import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Download,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import reportService from '../../services/reportService.js';
import PdfExportModal from './PdfExportModal.jsx';
import StructuredAiInsightCards from './StructuredAiInsightCards.jsx';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const InsightsExportSection = ({
  summaryData,
  categories = [],
  budgetData,
  goalData,
  healthData,
  forecastData,
  activeFilter,
  customStart = '',
  customEnd = '',
}) => {
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const kpis = summaryData?.kpis || {};
  const totalInc = Number(kpis.total_income || 0);
  const totalExp = Number(kpis.total_expenses || 0);
  const netSavings = Number(kpis.net_savings || 0);
  const savingsRate = Number(kpis.savings_rate || 0);
  const highestCat = categories.length ? categories[0] : null;

  // Auto-generate AI summary on mount or filter change
  useEffect(() => {
    handleGenerateAiSummary();
  }, [activeFilter]);

  const handleGenerateAiSummary = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const summaryObj = await reportService.generateAiSummary(activeFilter, customStart, customEnd);
      if (summaryObj) {
        setAiInsight(typeof summaryObj === 'object' ? summaryObj : null);
      }
    } catch (err) {
      console.warn('Backend AI Summary call failed, using dynamic synthesis fallback:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Export handlers
  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await reportService.downloadReportFile('pdf', 'insights_export', activeFilter, customStart, customEnd);
      toast.success('Comprehensive Financial Master Dossier PDF downloaded!', { icon: '📄' });
    } catch (err) {
      console.warn('Export PDF failed:', err);
      toast.error('Failed to generate and download PDF report.');
    } finally {
      setExportingPdf(false);
    }
  };



  return (
    <div className="space-y-6 font-sans">
      {/* 1. Gemini AI Financial Intelligence Hub */}
      <div className="bg-zinc-950/90 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 font-outfit">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Gemini AI Financial Intelligence</span>
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous strategic analysis, prioritized action plans, and health vector diagnostics.
            </p>
          </div>

          <button
            onClick={handleGenerateAiSummary}
            disabled={loadingAi}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 disabled:opacity-50 font-outfit cursor-pointer"
          >
            {loadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Analyze Ledger</span>
              </>
            )}
          </button>
        </div>

        {/* Structured non-redundant action matrix and vector cards */}
        <StructuredAiInsightCards
          data={aiInsight}
          summaryData={summaryData}
          categories={categories}
          budgetData={budgetData}
          goalData={goalData}
          healthData={healthData}
          forecastData={forecastData}
          activeFilter={activeFilter}
        />
      </div>

      {/* 2. Enterprise Report Export Hub */}
      <div className="bg-zinc-950/90 border border-zinc-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-outfit">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Financial Reports</span>
            </h3>
            <p className="text-xs text-slate-400">
              Download your formatted financial statements, category breakdowns, and audit ledgers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold font-outfit transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download Formatted PDF Financial Statement"
            >
              {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-rose-400" />}
              <span>Export PDF Statement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default InsightsExportSection;
