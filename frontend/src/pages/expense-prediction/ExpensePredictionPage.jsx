import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  RefreshCw,
  Sparkles,
  PlusCircle,
  AlertCircle,
  Database,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'react-toastify';

import PageContainer from '../../components/layout/PageContainer.jsx';
import { ROUTES } from '../../constants/index.js';
import transactionService from '../../services/transactionService.js';
import useExpensePrediction from '../../hooks/useExpensePrediction.js';

import PredictionTopKpiCards from '../../components/expense-prediction/PredictionTopKpiCards.jsx';
import UnifiedExpenseForecastChart from '../../components/expense-prediction/UnifiedExpenseForecastChart.jsx';
import DualForecastInsights from '../../components/expense-prediction/DualForecastInsights.jsx';
import CategoryForecastList from '../../components/expense-prediction/CategoryForecastList.jsx';
import ForecastVsBudgetCard from '../../components/expense-prediction/ForecastVsBudgetCard.jsx';
import RecentPerformanceGrid from '../../components/expense-prediction/RecentPerformanceGrid.jsx';
import AiForecastInsightCard from '../../components/expense-prediction/AiForecastInsightCard.jsx';
import ScenarioSimulatorCard from '../../components/expense-prediction/ScenarioSimulatorCard.jsx';
import TierExpenseBreakdown from '../../components/expense-prediction/TierExpenseBreakdown.jsx';

const MONTH_OPTIONS = [
  { num: 1, name: 'January' },
  { num: 2, name: 'February' },
  { num: 3, name: 'March' },
  { num: 4, name: 'April' },
  { num: 5, name: 'May' },
  { num: 6, name: 'June' },
  { num: 7, name: 'July' },
  { num: 8, name: 'August' },
  { num: 9, name: 'September' },
  { num: 10, name: 'October' },
  { num: 11, name: 'November' },
  { num: 12, name: 'December' },
];

export const ExpensePredictionPage = () => {
  const navigate = useNavigate();
  const {
    data,
    metadata,
    loading,
    refreshing,
    simulating,
    error,
    isSimulated,
    targetMonth,
    refresh,
    runSimulation,
    resetSimulation,
    changeTargetMonth,
  } = useExpensePrediction();

  const [seeding, setSeeding] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const handleSeedTransactions = async () => {
    setSeeding(true);
    try {
      await transactionService.seedTransactions();
      toast.success('Populated 12 months of realistic financial ledger records!', { icon: '⚡' });
      refresh();
    } catch (err) {
      console.error('Failed to seed transactions:', err);
      toast.error('Failed to seed sample ledger data.');
    } finally {
      setSeeding(false);
    }
  };

  const hasData = Boolean(data && data.has_sufficient_data);

  return (
    <PageContainer
      title="Expense Prediction"
      description="AI-powered forecast based on your historical spending"
    >
      <div className="space-y-6 max-w-[1920px] w-full mx-auto">
        {/* Top Header & Horizon Selector matching blueprint */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl border border-zinc-800 bg-[#09090B] shadow-glass backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tight">
                  Expense Prediction
                </h1>
                {isSimulated && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[10px] font-outfit uppercase animate-pulse">
                    Simulation Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-normal">
                AI-powered forecast based on your historical spending
              </p>
            </div>
          </div>

          {/* Controls: Target Month Selector & Refresh */}
          <div className="flex items-center space-x-2.5 justify-end">
            <div className="relative">
              <select
                value={targetMonth || ''}
                onChange={(e) => changeTargetMonth(e.target.value)}
                className="appearance-none rounded-2xl border border-zinc-700 bg-zinc-900/90 pl-4 pr-10 py-2 text-xs font-black text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-outfit shadow-sm"
              >
                <option value="">This Month (Auto-Resolved)</option>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.num} value={m.num}>
                    {m.name} Forecast
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            <button
              onClick={refresh}
              disabled={refreshing || loading}
              className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Live Forecast"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer font-outfit ${
                showSimulator
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-slate-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showSimulator ? 'Hide Simulator' : 'What-If Simulator'}</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.TRANSACTIONS)}
              className="px-4 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer font-outfit"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Transaction</span>
            </button>
          </div>
        </div>

        {/* Optional Expandable Scenario Simulator */}
        <AnimatePresence>
          {showSimulator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ScenarioSimulatorCard
                onRunSimulation={runSimulation}
                onResetSimulation={resetSimulation}
                isSimulated={isSimulated}
                simulating={simulating}
                targetMonth={targetMonth}
                onChangeTargetMonth={changeTargetMonth}
                baselineIncome={data?.sanitized_summary?.robust_income}
                baselineRoutineSpend={data?.sanitized_summary?.clean_routine_spend}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="animate-pulse h-36 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
              <div className="animate-pulse h-36 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
              <div className="animate-pulse h-36 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
            </div>
            <div className="animate-pulse h-72 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-pulse h-48 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
              <div className="animate-pulse h-48 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
            </div>
          </div>
        ) : !hasData ? (
          /* Cold-Start Empty State */
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
                Transaction History Initializing
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Our multi-scale predictive engine decomposes transactions into Fixed, Routine, and Discretionary tiers. Seed your ledger with 12 months of realistic sample data or add live entries to unlock precision forecasts.
              </p>
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
          /* Main Blueprint Layout */
          <div className="space-y-6">
            {/* 1. TOP 3 KPI METRIC CARDS */}
            <PredictionTopKpiCards
              forecast={data?.forecast}
              summary={data?.sanitized_summary}
              trendMetrics={data?.trend_metrics}
              overspendingRisk={data?.overspending_risk}
            />

            {/* 2. EXPENSE FORECAST UNIFIED CHART */}
            <UnifiedExpenseForecastChart
              historicalTrend={data?.historical_trend}
              multiHorizonForecast={data?.multi_horizon_forecast}
              forecast={data?.forecast}
            />

            {/* 3. DUAL INSIGHTS: WHY THIS FORECAST & FORECAST RANGE */}
            <DualForecastInsights
              drivers={data?.why_this_forecast_drivers}
              confidenceRange={data?.forecast?.confidence_range_p10_p90}
              predictedSpend={data?.forecast?.predicted_routine_spend}
            />

            {/* 4. CATEGORY FORECAST (HORIZONTAL BARS) */}
            <CategoryForecastList
              categoryForecast={data?.category_forecast}
              totalPredicted={data?.forecast?.predicted_routine_spend}
            />

            {/* 5. FORECAST vs BUDGET */}
            <ForecastVsBudgetCard budgetComparison={data?.budget_comparison} />

            {/* 6. RECENT PERFORMANCE MULTI-PERIOD GRID */}
            <RecentPerformanceGrid benchmarks={data?.performance_benchmarks} />

            {/* 7. AI FORECAST INSIGHT & ASK AI ACTION */}
            <AiForecastInsightCard
              audit={data?.financial_health_audit}
              forecast={data?.forecast}
            />

            {/* 8. TIER EXPENSE BREAKDOWN */}
            <TierExpenseBreakdown summary={data?.sanitized_summary} />
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ExpensePredictionPage;
