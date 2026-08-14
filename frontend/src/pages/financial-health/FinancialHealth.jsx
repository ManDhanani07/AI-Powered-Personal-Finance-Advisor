import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
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
          <div className="h-64 bg-slate-800/40 rounded-2xl" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/40 rounded-xl" />
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
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Recalculate Health Engine</span>
        </button>
      }
    >
      <div className="space-y-8 max-w-[1920px] w-full mx-auto">
        {/* ── 1. Top Integrated Hero Section (No Card Box) ── */}
        <div className="pb-6 border-b border-zinc-800/80 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
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

        {/* ── 2. Open Linear Parameter Performance Table ── */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800/80">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-black text-white font-outfit">
              Weighted Parameter Performance
            </h3>
          </div>
          <MetricCard parameters={healthData?.parameters || []} />
        </div>

        {/* ── 3. Rule-Based Recommendations Open Feed ── */}
        <RecommendationCard recommendations={healthData?.recommendations || []} />

        {/* ── 4. Parameter Breakdown & History Trajectory Open Panels ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-2">
          <HealthBreakdown parameters={healthData?.parameters || []} />
          <HealthHistory history={historyData} />
        </div>
      </div>
    </PageContainer>
  );
};

export default FinancialHealth;
