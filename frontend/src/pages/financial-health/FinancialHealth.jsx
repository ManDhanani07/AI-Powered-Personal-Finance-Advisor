import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageContainer } from '../../components/layout/PageContainer.jsx';

import financialHealthService from '../../services/financialHealthService.js';
import HealthScoreCard from '../../components/financial-health/HealthScoreCard.jsx';
import GradeCard from '../../components/financial-health/GradeCard.jsx';
import MetricCard from '../../components/financial-health/MetricCard.jsx';
import RecommendationCard from '../../components/financial-health/RecommendationCard.jsx';
import HealthHistory from '../../components/financial-health/HealthHistory.jsx';
import HealthBreakdown from '../../components/financial-health/HealthBreakdown.jsx';

export const FinancialHealth = () => {
  const [healthData, setHealthData] = useState(() => {
    try {
      const cached = sessionStorage.getItem('health_cache_data');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [historyData, setHistoryData] = useState(() => {
    try {
      const cached = sessionStorage.getItem('health_cache_history');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('health_cache_data');
    } catch {
      return true;
    }
  });

  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [healthRes, historyRes] = await Promise.all([
        financialHealthService.getScore(),
        financialHealthService.getHistory(12),
      ]);

      if (healthRes?.success && healthRes?.data) {
        setHealthData(healthRes.data);
        sessionStorage.setItem('health_cache_data', JSON.stringify(healthRes.data));
      }
      if (historyRes?.success && historyRes?.data) {
        setHistoryData(historyRes.data || []);
        sessionStorage.setItem('health_cache_history', JSON.stringify(historyRes.data || []));
      }
    } catch (err) {
      console.error('Financial Health Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <PageContainer
        title="Financial Health Index"
        description="Rule-based financial health scoring engine evaluating transaction ledger history."
      >
        <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-800/60 rounded-3xl" />
            <div className="h-64 bg-slate-800/60 rounded-3xl lg:col-span-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-800/60 rounded-3xl" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Financial Health Index"
      description="Rule-based financial health scoring engine evaluating transaction ledger history."
      action={
        <button
          onClick={loadData}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Recalculate Health Engine</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-[1920px] w-full mx-auto">
        {/* ── 1. Top Row: Overall Score Card & Grade Standing ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <HealthScoreCard
            score={healthData?.overall_score ?? 0}
            calculatedAt={healthData?.calculated_at}
            refreshing={refreshing}
            onRefresh={loadData}
          />
          <div className="lg:col-span-2">
            <GradeCard
              grade={healthData?.grade ?? 'B'}
              summary={healthData?.summary}
            />
          </div>
        </div>

        {/* ── 2. Weighted Parameters (7 Core Metrics Grid) ── */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary-400" />
            <h3 className="text-xl font-black text-white font-outfit">
              Weighted Parameter Performance (0–100%)
            </h3>
          </div>
          <MetricCard parameters={healthData?.parameters || []} />
        </div>

        {/* ── 3. Rule-Based Recommendations ── */}
        <RecommendationCard recommendations={healthData?.recommendations || []} />

        {/* ── 4. Parameter Capacity Radar & Score History Trajectory ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <HealthBreakdown parameters={healthData?.parameters || []} />
          <HealthHistory history={historyData} />
        </div>
      </div>
    </PageContainer>
  );
};

export default FinancialHealth;
