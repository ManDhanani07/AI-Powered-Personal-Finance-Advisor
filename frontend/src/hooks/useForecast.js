/**
 * useForecast — React hook managing Meta Prophet forecast state, period filtering,
 * loading skeleton states, and insufficient data fallback states.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import forecastService from '../services/forecastService.js';

export const useForecast = (initialPeriod = 90) => {
  const [periodDays, setPeriodDays] = useState(initialPeriod);
  const [selectedMetric, setSelectedMetric] = useState('ALL'); // 'ALL' | 'EXPENSE' | 'INCOME' | 'SAVINGS' | 'BALANCE'
  const [summaryData, setSummaryData] = useState(() => {
    try {
      const cached = sessionStorage.getItem('forecast_cache_data');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('forecast_cache_data');
    } catch {
      return true;
    }
  });

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchForecast = useCallback(async (silent = false) => {
    if (!silent && !sessionStorage.getItem('forecast_cache_data')) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await forecastService.getForecastSummary(periodDays);
      const payload = res?.data?.data ?? res?.data;

      if (payload) {
        setSummaryData(payload);
        sessionStorage.setItem('forecast_cache_data', JSON.stringify(payload));
        setError(null);
      } else {
        setError('No forecast data available');
      }
    } catch (err) {
      console.error('[useForecast] Error loading Meta Prophet predictions:', err);
      setError(err?.message || 'Failed to load forecast data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodDays]);

  useEffect(() => {
    fetchForecast(false);
  }, [fetchForecast]);

  const refresh = useCallback(() => fetchForecast(true), [fetchForecast]);

  return {
    periodDays,
    setPeriodDays,
    selectedMetric,
    setSelectedMetric,
    summaryData,
    loading,
    refreshing,
    error,
    refresh,
    insufficientData: summaryData ? !summaryData.sufficient_data : false,
  };
};

export default useForecast;
