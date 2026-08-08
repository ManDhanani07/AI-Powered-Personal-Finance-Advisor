import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import aiService from '../../services/aiService.js';

export const AiFinancialInsights = ({ summaryData, activeTab = 'overview' }) => {
  const navigate = useNavigate();
  const [insightText, setInsightText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchAiInsight = async () => {
    setLoading(true);
    setError(false);
    try {
      const kpis = summaryData?.kpis || {};
      const promptText = `Analyze my current financial standing: Income = ₹${kpis.total_income || 0}, Expenses = ₹${kpis.total_expenses || 0}, Net Savings = ₹${kpis.net_savings || 0}, Savings Rate = ${kpis.savings_rate || 0}%, Top Category = ${kpis.highest_expense_category || 'N/A'}. Give me a concise 2-sentence actionable FinTech advice on how to improve my wealth score and keep my budget on track.`;
      
      const res = await aiService.queryAdvisor(promptText);
      const responseContent = res?.data?.answer || res?.answer || res?.data?.response || res?.response || res?.data || '';
      if (responseContent) {
        setInsightText(responseContent);
      } else {
        throw new Error('Empty AI response');
      }
    } catch (err) {
      console.warn('Gemini API offline or rate limited, fallback insight activated:', err);
      setError(true);
      const inc = summaryData?.kpis?.total_income || 0;
      const exp = summaryData?.kpis?.total_expenses || 0;
      const savRate = summaryData?.kpis?.savings_rate || 0;
      const topCat = summaryData?.kpis?.highest_expense_category || 'Shopping & Dining';

      if (savRate < 20) {
        setInsightText(`Your current savings rate is ${savRate}%, which is below the recommended 20% benchmark. Consider auditing your ${topCat} category to reallocate cash towards high-yield savings goals.`);
      } else {
        setInsightText(`Great job maintaining a healthy ${savRate}% savings rate! Your net monthly surplus is ₹${(inc - exp).toLocaleString('en-IN')}. Continue allocating funds toward your milestone vaults.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiInsight();
  }, [summaryData?.kpis?.total_income, summaryData?.kpis?.total_expenses]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900/30 via-indigo-950/20 to-purple-900/30 border border-primary-500/30 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-black uppercase tracking-wider border border-primary-500/30">
              <Sparkles className="w-3.5 h-3.5 text-primary-400 animate-pulse" />
              Gemini AI Wealth Insight
            </span>
            {error && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" /> Dynamic Rule Engine Active
              </span>
            )}
          </div>
          
          <div className="text-sm font-medium text-slate-200 leading-relaxed">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-primary-400" />
                Generating real-time financial intelligence from PostgreSQL ledger...
              </div>
            ) : (
              <p className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>{insightText}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchAiInsight}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-bg-surface/60 border border-border-subtle hover:bg-slate-800 text-slate-300 transition-all text-xs font-semibold"
            title="Refresh AI Insights"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
          </button>
          
          <button
            onClick={() => navigate('/ai-assistant')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-lg shadow-primary-500/25 transition-all group"
          >
            <span>Ask AI Advisor</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiFinancialInsights;
