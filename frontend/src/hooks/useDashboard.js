/**
 * useDashboard — Custom React hook that aggregates all 7 dashboard API calls.
 * Uses parallel fetching with Promise.allSettled so partial failures don't
 * break the entire dashboard.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import dashboardService from '../services/dashboardService.js';

const STALE_SECONDS = 60; // Re-fetch after 60s

const initialState = {
  overview: null,
  summary: null,
  charts: null,
  recentTransactions: null,
  budgetOverview: null,
  goalsOverview: null,
  spendingAnalysis: null,
};

export const useDashboard = (txLimit = 10) => {
  const [data, setData] = useState(() => {
    try {
      const cached = sessionStorage.getItem('dashboard_cache_data');
      return cached ? JSON.parse(cached) : initialState;
    } catch {
      return initialState;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('dashboard_cache_data');
      return !cached;
    } catch {
      return true;
    }
  });

  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastFetched, setLastFetched] = useState(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await dashboardService.getCompleteDashboard(txLimit);
      const payload = res?.data?.data ?? res?.data;
      if (payload && (payload.overview || payload.charts)) {
        const nextData = {
          overview: payload.overview ?? null,
          summary: payload.summary ?? null,
          charts: payload.charts ?? null,
          recentTransactions: payload.recent_transactions ?? null,
          budgetOverview: payload.budget_overview ?? null,
          goalsOverview: payload.goals_overview ?? null,
          spendingAnalysis: payload.spending_analysis ?? null,
        };
        setData(nextData);
        sessionStorage.setItem('dashboard_cache_data', JSON.stringify(nextData));
        setErrors({});
        setLastFetched(Date.now());
        setLoading(false);
        setRefreshing(false);
        return;
      }
    } catch (err) {
      console.warn('[Dashboard] Consolidated fetch failed, falling back to parallel requests:', err);
    }

    // Fallback parallel requests if consolidated fails
    const results = await Promise.allSettled([
      dashboardService.getOverview(),
      dashboardService.getSummary(),
      dashboardService.getCharts(),
      dashboardService.getRecentTransactions(txLimit),
      dashboardService.getBudgetOverview(),
      dashboardService.getGoalsOverview(),
      dashboardService.getSpendingAnalysis(),
    ]);

    const keys = [
      'overview', 'summary', 'charts',
      'recentTransactions', 'budgetOverview',
      'goalsOverview', 'spendingAnalysis',
    ];

    const newData = { ...initialState };
    const newErrors = {};

    results.forEach((result, i) => {
      const key = keys[i];
      if (result.status === 'fulfilled') {
        newData[key] = result.value?.data?.data ?? result.value?.data ?? null;
      } else {
        newErrors[key] = result.reason?.message || 'Failed to load';
      }
    });

    const failCount = Object.keys(newErrors).length;
    if (failCount === keys.length) {
      toast.error('Dashboard failed to load. Please check your connection.', { toastId: 'dash-fatal' });
    }

    setData(newData);
    setErrors(newErrors);
    setLastFetched(Date.now());
    setLoading(false);
    setRefreshing(false);
  }, [txLimit]);

  // Initial fetch
  useEffect(() => {
    fetchAll(false);
  }, [fetchAll]);

  // Auto-refresh if data is stale
  useEffect(() => {
    if (!lastFetched) return;
    const timer = setTimeout(() => {
      fetchAll(true);
    }, STALE_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [lastFetched, fetchAll]);

  const refresh = useCallback(() => fetchAll(true), [fetchAll]);

  return { data, loading, refreshing, errors, refresh, lastFetched };
};

export default useDashboard;
