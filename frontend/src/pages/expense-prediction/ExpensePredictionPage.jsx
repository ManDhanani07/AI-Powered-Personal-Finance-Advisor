import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Database,
  Calendar,
} from 'lucide-react';
import { toast } from 'react-toastify';

import PageContainer from '../../components/layout/PageContainer.jsx';
import { ROUTES } from '../../constants/index.js';
import transactionService from '../../services/transactionService.js';
import useExpensePrediction from '../../hooks/useExpensePrediction.js';

import SimplePredictionHero from '../../components/expense-prediction/SimplePredictionHero.jsx';
import SimpleExpenseTrendChart from '../../components/expense-prediction/SimpleExpenseTrendChart.jsx';
import WhyPredictionCard from '../../components/expense-prediction/WhyPredictionCard.jsx';
import UpcomingRecurringCard from '../../components/expense-prediction/UpcomingRecurringCard.jsx';
import SimpleWhatIfSimulator from '../../components/expense-prediction/SimpleWhatIfSimulator.jsx';
import CategoryForecastList from '../../components/expense-prediction/CategoryForecastList.jsx';

export const ExpensePredictionPage = () => {
  const navigate = useNavigate();
  const { data, loading, refreshing, error, refresh } = useExpensePrediction();
  const [seeding, setSeeding] = useState(false);

  const handleSeedTransactions = async () => {
    setSeeding(true);
    try {
      await transactionService.seedTransactions();
      toast.success('Populated 12 months of realistic financial ledger records!', { icon: '⚡' });
      refresh(true);
    } catch (err) {
      console.error('Failed to seed transactions:', err);
      toast.error('Failed to seed sample ledger data.');
    } finally {
      setSeeding(false);
    }
  };

  const hasData = Boolean(data && data.has_sufficient_data);
  const txCount = Number(
    data?.sanitized_summary?.txn_count ||
      data?.data_quality?.total_transactions ||
      0
  );
  const targetMonthName = data?.forecast?.target_month_name || 'July 2044';
  const historyMonths = Number(
    data?.data_quality?.history_months_count ||
      (data?.historical_trend ? data.historical_trend.filter((m) => !m.is_projected).length : 0)
  );

  return (
    <PageContainer
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span>Expense Prediction</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-[10px] tracking-wider uppercase font-outfit flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Model Active
            </span>
          </div>
        </div>
      }
      description={
        hasData
          ? `Machine learning expenditure projection for ${targetMonthName} calibrated across ${historyMonths > 0 ? `${historyMonths} months of ` : ''}verified financial records.`
          : 'AI-powered forecast of your upcoming spending based on your financial transaction patterns.'
      }
      actions={
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-outfit text-slate-300 flex items-center gap-1.5 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target: <strong className="text-white">{targetMonthName}</strong></span>
          </div>

          <button
            onClick={() => refresh(true)}
            disabled={refreshing || loading}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 hover:text-emerald-200 font-bold text-xs font-outfit transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            title="Recalibrate forecast with latest transactions"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Recalibrate</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl w-full mx-auto font-sans pb-10">
        {/* Error State */}
        {error && !loading && (
          <div className="p-5 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold font-outfit">Prediction Notice</p>
                <p className="text-slate-300 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => refresh(true)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white border border-zinc-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="animate-pulse h-56 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
            <div className="animate-pulse h-72 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
            <div className="animate-pulse h-48 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="animate-pulse h-48 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
              <div className="animate-pulse h-48 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
            </div>
          </div>
        ) : !hasData ? (
          /* Honest Insufficient Data State */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#09090B] to-[#09090B] backdrop-blur-xl"
          >
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg">
              <AlertCircle className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-xl font-black text-white font-outfit">
                Not Enough History For a Reliable Forecast
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                To forecast your upcoming expenses accurately, the engine requires consistent transaction records.
              </p>
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-slate-400 font-mono space-y-1">
                <p>
                  Current Data: <strong className="text-amber-400">{txCount} transactions</strong>
                </p>
                <p>
                  Recommended Minimum: <strong>15+ transactions across 1-2 months</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSeedTransactions}
                disabled={seeding}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 font-outfit"
              >
                {seeding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Populating Ledger...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>Load 12-Month Sample Ledger</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(ROUTES.TRANSACTIONS)}
                className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer font-outfit"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Add Transaction Manually</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Refined, Focused Forecasting Workspace */
          <div className="space-y-6">
            {/* 1. Main Prediction Hero Card */}
            <SimplePredictionHero
              forecast={data?.forecast}
              targetMonthName={data?.forecast?.target_month_name}
              trendMetrics={data?.trend_metrics}
              benchmarks={data?.performance_benchmarks}
              sanitizedSummary={data?.sanitized_summary}
              dataQuality={data?.data_quality}
              fixedVsVariable={data?.fixed_vs_variable}
            />

            {/* 2. Next Month Category Forecast with Method Toggle (AI Ensemble vs Historical Avg vs Last Month) & Empirical Tracking */}
            <CategoryForecastList
              categoryForecast={data?.category_forecast}
              totalPredicted={data?.forecast?.predicted_routine_spend}
              forecast={data?.forecast}
              trendMetrics={data?.trend_metrics}
              metadata={data?.model_metadata}
              benchmarks={data?.performance_benchmarks}
            />

            {/* 3. Monthly Spending Trend Chart */}
            <SimpleExpenseTrendChart historicalTrend={data?.historical_trend} />

            {/* 3. Why This Prediction? (100% Genuine Data-Backed Insights) */}
            <WhyPredictionCard
              forecast={data?.forecast}
              benchmarks={data?.performance_benchmarks}
              trendMetrics={data?.trend_metrics}
              sanitizedSummary={data?.sanitized_summary}
              totalRecurringAmount={data?.total_recurring_amount}
              recurringExpenses={data?.recurring_expenses}
              categoryForecast={data?.category_forecast}
            />

            {/* 4. Lower Two-Column Grid: Upcoming Recurring & What-If Simulator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <UpcomingRecurringCard
                recurringExpenses={data?.recurring_expenses}
                totalRecurringAmount={data?.total_recurring_amount}
              />
              <SimpleWhatIfSimulator
                currentPrediction={data?.forecast?.predicted_routine_spend}
              />
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ExpensePredictionPage;
