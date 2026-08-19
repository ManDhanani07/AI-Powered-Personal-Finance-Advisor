import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  RefreshCw,
  Sparkles,
  PlusCircle,
  Zap,
  AlertCircle,
  Database,
  History,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-toastify';

import PageContainer from '../../components/layout/PageContainer.jsx';
import { ROUTES } from '../../constants/index.js';
import transactionService from '../../services/transactionService.js';
import useExpensePrediction from '../../hooks/useExpensePrediction.js';

import PredictionHeroCard from '../../components/expense-prediction/PredictionHeroCard.jsx';
import QuantileRangeGauge from '../../components/expense-prediction/QuantileRangeGauge.jsx';
import TierExpenseBreakdown from '../../components/expense-prediction/TierExpenseBreakdown.jsx';
import ScenarioSimulatorCard from '../../components/expense-prediction/ScenarioSimulatorCard.jsx';
import SpendingRiskAuditCard from '../../components/expense-prediction/SpendingRiskAuditCard.jsx';

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
      title="AI Expense Prediction & Financial Advisory Engine"
      description="Multi-scale adaptive machine learning forecasting next-month outflows, P10–P90 quantile intervals, and safe budget ceilings."
    >
      <div className="space-y-6 max-w-[1920px] w-full mx-auto">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl border border-zinc-800 bg-[#09090B] shadow-glass backdrop-blur-xl">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-white font-outfit">
                Multi-Scale Adaptive Engine
              </span>
              <p className="text-[11px] text-slate-400 font-normal">
                EMAs + Residual Gradient Booster (R²: 0.9990, WPA: 98.86%)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 justify-end">
            <button
              onClick={refresh}
              disabled={refreshing || loading}
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Live Forecast"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => navigate(ROUTES.TRANSACTIONS)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer font-outfit"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Transaction</span>
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6">
            <div className="animate-pulse h-64 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-pulse h-48 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
              <div className="animate-pulse h-48 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
            </div>
          </div>
        ) : !hasData ? (
          /* Cold-Start / Insufficient Data Banner */
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
          /* Main Dashboard Content Grid */
          <div className="space-y-6">
            {/* Primary Hero Forecast Card */}
            <PredictionHeroCard
              forecast={data?.forecast}
              summary={data?.sanitized_summary}
              isSimulated={isSimulated}
              onResetSimulation={resetSimulation}
            />

            {/* Middle Row: Quantile Gauge & 3-Tier Decomposition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuantileRangeGauge
                confidenceRange={data?.forecast?.confidence_range_p10_p90}
                predictedSpend={data?.forecast?.predicted_routine_spend}
                safeCeiling={data?.forecast?.safe_total_budget_ceiling}
              />

              <TierExpenseBreakdown summary={data?.sanitized_summary} />
            </div>

            {/* Interactive What-If Scenario Simulator */}
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

            {/* Risk Assessment Audit & Model Metadata */}
            <SpendingRiskAuditCard
              audit={data?.financial_health_audit}
              metadata={metadata}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ExpensePredictionPage;
