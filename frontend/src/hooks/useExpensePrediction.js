import { useState, useEffect, useCallback, useRef } from 'react';
import expensePredictionService from '../services/expensePredictionService.js';
import { toast } from 'react-toastify';

export const useExpensePrediction = (initialTargetMonth = null) => {
  const [targetMonth, setTargetMonth] = useState(initialTargetMonth);
  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Simulation State
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulationParams, setSimulationParams] = useState({
    income_growth_pct: 0,
    discretionary_spend_adj_pct: 0,
    recurring_bills_override: null,
  });

  const metadataFetchedRef = useRef(false);

  const fetchPrediction = useCallback(async (isRefresh = false, monthOverride = null) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const activeMonth = monthOverride !== null ? monthOverride : targetMonth;
      
      const calls = [expensePredictionService.getForecast(activeMonth)];
      if (!metadataFetchedRef.current) {
        calls.push(expensePredictionService.getMetadata());
      }

      const [predRes, metaRes] = await Promise.all(calls);

      const predData = predRes?.data?.data ?? predRes?.data ?? predRes;
      setData(predData);

      if (metaRes) {
        const metaData = metaRes?.data?.data ?? metaRes?.data ?? metaRes;
        if (metaData) {
          setMetadata(metaData);
          metadataFetchedRef.current = true;
        }
      }
      
      setIsSimulated(false);
    } catch (err) {
      console.error('[useExpensePrediction] Error loading prediction:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to load expense prediction.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetMonth]);

  useEffect(() => {
    fetchPrediction(false);
  }, [fetchPrediction]);

  const runSimulation = useCallback(async (overrides) => {
    setSimulating(true);
    try {
      const payload = {
        target_month: targetMonth || undefined,
        income_growth_pct: Number(overrides.income_growth_pct || 0),
        discretionary_spend_adj_pct: Number(overrides.discretionary_spend_adj_pct || 0),
        recurring_bills_override: overrides.recurring_bills_override ? Number(overrides.recurring_bills_override) : undefined,
      };

      const res = await expensePredictionService.simulateScenario(payload);
      const simData = res?.data?.data ?? res?.data ?? res;
      setData(simData);
      setIsSimulated(true);
      setSimulationParams(overrides);
      toast.success('Simulation scenario calculated!', { icon: '✨' });
    } catch (err) {
      console.error('[useExpensePrediction] Simulation error:', err);
      toast.error('Simulation failed. Please try again.');
    } finally {
      setSimulating(false);
    }
  }, [targetMonth]);

  const resetSimulation = useCallback(() => {
    setSimulationParams({
      income_growth_pct: 0,
      discretionary_spend_adj_pct: 0,
      recurring_bills_override: null,
    });
    fetchPrediction(false);
  }, [fetchPrediction]);

  const changeTargetMonth = useCallback((newMonth) => {
    const parsed = newMonth ? Number(newMonth) : null;
    setTargetMonth(parsed);
  }, []);

  return {
    data,
    metadata,
    loading,
    refreshing,
    simulating,
    error,
    isSimulated,
    simulationParams,
    targetMonth,
    refresh: () => fetchPrediction(true),
    runSimulation,
    resetSimulation,
    changeTargetMonth,
  };
};

export default useExpensePrediction;
