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
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchForecast = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await forecastService.getForecastSummary(periodDays);
      const payload = res?.data?.data ?? res?.data;

      if (payload) {
        setSummaryData(payload);
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
