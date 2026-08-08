import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import aiService from '../../services/aiService.js';
import reportService from '../../services/reportService.js';
import exportService from '../../services/exportService.js';
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
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const kpis = summaryData?.kpis || {};

  // Key Financial Findings logic derived from actual data
  const positiveItems = [];
  const attentionItems = [];
  const riskItems = [];

  if (Number(kpis.savings_rate || 0) >= 20) {
    positiveItems.push(`Healthy savings rate of ${kpis.savings_rate}% achieved for this period.`);
  }
  if (Number(kpis.net_savings || 0) > 0) {
    positiveItems.push(`Generated a net cash surplus of ${formatINR(kpis.net_savings)}.`);
  }

  const highestCat = categories.length ? categories[0] : null;
  if (highestCat && Number(highestCat.percentage || 0) >= 30) {
    attentionItems.push(`${highestCat.category_name} represents ${highestCat.percentage}% of total expenses.`);
  }

  const bUtil = Number(budgetData?.overall_utilization_pct || 0);
  if (bUtil >= 90) {
    riskItems.push(`Overall budget utilization is at ${bUtil.toFixed(1)}%, near maximum cap.`);
  } else if (bUtil >= 75) {
    attentionItems.push(`Overall budget utilization is at ${bUtil.toFixed(1)}%.`);
  }

  if (healthData?.latest_score && healthData.latest_score < 60) {
    riskItems.push(`Financial Health Score is currently ${healthData.latest_score}/100.`);
  }

  // Auto-generate AI summary on mount or filter change
  React.useEffect(() => {
    handleGenerateAiSummary();
  }, [activeFilter]);

  // Handle Gemini AI Financial Summary Generation
  const handleGenerateAiSummary = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const summaryObj = await reportService.generateAiSummary(activeFilter, customStart, customEnd);
      if (summaryObj) {
        setAiInsight(typeof summaryObj === 'object' ? summaryObj : null);
      } else {
        throw new Error('Empty summary returned from backend.');
      }
    } catch (err) {
      console.warn('Backend AI Summary call failed, generating dynamic fallback:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Export handlers
  const handleExportCsv = async () => {
    try {
      await reportService.downloadReportFile('csv', 'executive', activeFilter, customStart, customEnd);
    } catch (err) {
      alert('Failed to download CSV export: ' + (err.message || 'Error occurred'));
    }
  };

  const handleExportPdf = async () => {
    try {
      await reportService.downloadReportFile('pdf', 'executive', activeFilter, customStart, customEnd);
    } catch (err) {
      alert('Failed to download PDF export: ' + (err.message || 'Error occurred'));
    }
  };

  const handleExportExcel = async () => {
    try {
      await reportService.downloadReportFile('excel', 'executive', activeFilter, customStart, customEnd);
    } catch (err) {
      alert('Failed to download Excel export: ' + (err.message || 'Error occurred'));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Risk Matrix & Key Findings */}
      <div className="bg-bg-surface/90 border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Key Financial Findings & Risk Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Positive Trends */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Positive Trends
            </h4>
            {positiveItems.length > 0 ? (
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                {positiveItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No significant positive trends identified for this filter.</p>
            )}
          </div>

          {/* Attention Required */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Attention Required
            </h4>
            {attentionItems.length > 0 ? (
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                {attentionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific alerts for this period.</p>
            )}
          </div>

          {/* Potential Risks */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Potential Risks
            </h4>
            {riskItems.length > 0 ? (
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                {riskItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No critical risks flagged.</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Gemini AI Financial Summary Panel */}
      <div className="bg-gradient-to-r from-primary-950/40 via-bg-surface to-indigo-950/40 border border-primary-500/30 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span>Gemini AI Financial Summary</span>
            </h3>
            <p className="text-xs text-slate-400">
              Generate an intelligent real-time summary synthesized across your income, expenses, budgets, and goals.
            </p>
          </div>

          <button
            onClick={handleGenerateAiSummary}
            disabled={loadingAi}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all shrink-0 disabled:opacity-50"
          >
            {loadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing your financial data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Financial Summary</span>
              </>
            )}
          </button>
        </div>

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

        {!loadingAi && aiInsight && typeof aiInsight === 'string' && (
          <div className="p-4 rounded-2xl bg-bg-card/70 border border-primary-500/30 text-xs text-slate-200 leading-relaxed font-medium space-y-2">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="font-extrabold text-primary-400 uppercase tracking-wider text-[10px]">Synthesis Report</span>
              <button onClick={handleGenerateAiSummary} className="text-slate-400 hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p>{aiInsight}</p>
          </div>
        )}

        {aiError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
            <p className="text-xs text-rose-400 font-medium">AI financial summary is temporarily unavailable.</p>
            <button
              onClick={handleGenerateAiSummary}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 3. Export Center */}
      <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Financial Reports</span>
            </h3>
            <p className="text-xs text-slate-400">
              Download your formatted financial statement for the selected period filter in PDF, Excel, or CSV format.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50"
            >
              {exportingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportCsv}
              disabled={exportingCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all disabled:opacity-50"
            >
              {exportingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Export Modal */}
      {showPdfModal && (
        <PdfExportModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          activeFilter={activeFilter}
          summaryData={summaryData}
          categories={categories}
        />
      )}
    </div>
  );
};

export default InsightsExportSection;
