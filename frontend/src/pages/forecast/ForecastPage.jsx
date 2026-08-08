import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Database, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { PageContainer } from '../../components/layout/PageContainer.jsx';
import { useForecast } from '../../hooks/useForecast.js';
import transactionService from '../../services/transactionService.js';
import { ROUTES } from '../../constants/index.js';

// Forecast Components
import ForecastFilters from '../../components/forecast/ForecastFilters.jsx';
import ForecastCards from '../../components/forecast/ForecastCards.jsx';
import ForecastSummary from '../../components/forecast/ForecastSummary.jsx';
import ForecastChart from '../../components/forecast/ForecastChart.jsx';
import ConfidenceChart from '../../components/forecast/ConfidenceChart.jsx';
import TrendCard from '../../components/forecast/TrendCard.jsx';

export const ForecastPage = () => {
  const navigate = useNavigate();
  const {
    periodDays,
    setPeriodDays,
    selectedMetric,
    setSelectedMetric,
    summaryData,
    loading,
    refreshing,
    error,
    refresh,
    insufficientData,
  } = useForecast(90);

  const [seeding, setSeeding] = React.useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await transactionService.seedTransactions();
      toast.success('Successfully populated 12-month sample financial ledger!', { icon: '⚡' });
      refresh();
    } catch (err) {
      toast.error('Failed to seed sample ledger data.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <PageContainer
      title="Meta Prophet Financial Forecast Engine"
      description="Enterprise time-series forecasting powered by Meta Prophet trained exclusively on your personal transaction history."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Control Filter Toolbar */}
        <ForecastFilters
          periodDays={periodDays}
          onPeriodChange={setPeriodDays}
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
          refreshing={refreshing}
          onRefresh={refresh}
        />

        {/* Insufficient Data Callout Banner */}
        {insufficientData ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-bg-surface to-bg-surface backdrop-blur-xl my-4"
          >
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg">
              <AlertCircle className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-lg font-extrabold text-white font-outfit">
                Transaction History Required for Forecasting
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {summaryData?.message ||
                  'At least 14-30 days of historical transactions are required for Meta Prophet time-series decomposition. Seed your ledger with 12 months of sample data or add live entries.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {seeding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Seeding Ledger...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-accent-300" />
                    <span>⚡ Load Sample Financial Ledger</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(ROUTES.TRANSACTIONS)}
                className="px-4 py-2.5 rounded-2xl bg-bg-surface border border-border-strong hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-primary-400" />
                <span>Add Transaction</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* 1. Executive AI Forecast Summary Header Banner */}
            <ForecastSummary
              summaryData={summaryData}
              periodDays={periodDays}
              loading={loading}
            />

            {/* 2. 4 Executive Financial KPI Cards */}
            <ForecastCards
              insights={summaryData?.insights}
              accuracyMetrics={summaryData?.accuracy_metrics}
              loading={loading}
            />

            {/* 3. Primary Meta Prophet Time-Series Forecast Canvas */}
            <ForecastChart
              expenseForecast={summaryData?.expense_forecast || []}
              incomeForecast={summaryData?.income_forecast || []}
              selectedMetric={selectedMetric}
              loading={loading}
            />

            {/* 4. 95% Confidence Bounds & Variance Band Chart */}
            <ConfidenceChart
              balanceForecast={summaryData?.balance_forecast || []}
              loading={loading}
            />

            {/* 5. Business Insights & Smart Warning Cards */}
            <TrendCard
              smartWarnings={summaryData?.smart_warnings || []}
              loading={loading}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default ForecastPage;
