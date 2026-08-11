import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  PieChart,
  Scale,
  Sparkles,
  Loader2,
} from 'lucide-react';

import { PageContainer } from '../../components/layout/PageContainer.jsx';
import ReportsHeader from '../../components/reports/ReportsHeader.jsx';
import ReportFilters from '../../components/reports/ReportFilters.jsx';

import ExecutiveSummarySection from '../../components/reports/ExecutiveSummarySection.jsx';
import SpendingAnalysisSection from '../../components/reports/SpendingAnalysisSection.jsx';
import FinancialPerformanceSection from '../../components/reports/FinancialPerformanceSection.jsx';
import InsightsExportSection from '../../components/reports/InsightsExportSection.jsx';

import reportService from '../../services/reportService.js';
import transactionService from '../../services/transactionService.js';

const TABS = [
  { id: 'executive_summary', label: 'Executive Summary', icon: FileText },
  { id: 'spending_analysis', label: 'Spending Analysis', icon: PieChart },
  { id: 'financial_performance', label: 'Financial Performance', icon: Scale },
  { id: 'insights_export', label: 'Insights & Export', icon: Sparkles },
];

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('executive_summary');
  const [activeFilter, setActiveFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [comparePrevious, setComparePrevious] = useState(false);

  const [summaryData, setSummaryData] = useState(() => {
    try {
      const cached = sessionStorage.getItem('reports_cache_summary');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('reports_cache_summary');
    } catch {
      return true;
    }
  });

  const [monthlyReport, setMonthlyReport] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [incomeExpenseData, setIncomeExpenseData] = useState(null);
  const [savingsData, setSavingsData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [goalData, setGoalData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [rawTransactions, setRawTransactions] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadReportsData = async () => {
      setLoading(true);
      try {
        const [
          summaryRes,
          monthlyRes,
          categoryRes,
          incExpRes,
          savingsRes,
          budgetRes,
          goalRes,
          healthRes,
          forecastRes,
          txsRes,
        ] = await Promise.allSettled([
          reportService.getDashboardSummary(activeFilter, customStart, customEnd, comparePrevious),
          reportService.getMonthlyBreakdown(),
          reportService.getCategoryAnalysis(activeFilter, customStart, customEnd),
          reportService.getIncomeVsExpense(activeFilter, customStart, customEnd),
          reportService.getSavingsAnalysis(),
          reportService.getBudgetPerformance(),
          reportService.getGoalAnalysis(),
          reportService.getHealthScoreTrend(),
          reportService.getForecastData(),
          transactionService.getTransactions({ page: 1, limit: 100 }),
        ]);

        if (!isMounted) return;

        const unwrap = (res) => {
          if (res?.status !== 'fulfilled' || res.value === undefined || res.value === null) return null;
          // Handles both wrapped { data: { ... } } and unwrapped payload shapes safely
          if (res.value && typeof res.value === 'object' && res.value.data !== undefined && res.value.data !== null && typeof res.value.data === 'object') {
            return res.value.data;
          }
          return res.value;
        };

        const sumVal = unwrap(summaryRes);
        const monthVal = unwrap(monthlyRes);
        const catVal = unwrap(categoryRes);
        const incExpVal = unwrap(incExpRes);
        const savVal = unwrap(savingsRes);
        const budVal = unwrap(budgetRes);
        const goalVal = unwrap(goalRes);
        const healthVal = unwrap(healthRes);
        const fcVal = unwrap(forecastRes);
        const txVal = unwrap(txsRes);

        if (sumVal) {
          setSummaryData(sumVal);
          if (activeFilter === 'all') {
            sessionStorage.setItem('reports_cache_summary', JSON.stringify(sumVal));
          }
        }
        if (monthVal) setMonthlyReport(monthVal);
        if (catVal) setCategoryData(catVal);
        if (incExpVal) setIncomeExpenseData(incExpVal);
        if (savVal) setSavingsData(savVal);
        if (budVal) setBudgetData(budVal);
        if (goalVal) setGoalData(goalVal);
        if (healthVal) setHealthData(healthVal);
        if (fcVal) setForecastData(fcVal);
        if (txVal) setRawTransactions(txVal.items || (Array.isArray(txVal) ? txVal : []));
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadReportsData();

    return () => {
      isMounted = false;
    };
  }, [activeFilter, customStart, customEnd, comparePrevious]);

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleApplyCustomDates = () => {
    if (customStart && customEnd) {
      setActiveFilter('custom');
    }
  };

  const handleToggleCompare = () => {
    setComparePrevious((prev) => !prev);
  };

  const derivedCategories = useMemo(() => {
    if (categoryData?.categories?.length) return categoryData.categories;
    if (summaryData?.categories?.length) return summaryData.categories;
    return [];
  }, [categoryData, summaryData]);

  const derivedMerchants = useMemo(() => {
    if (categoryData?.merchants?.length) return categoryData.merchants;
    if (summaryData?.merchants?.length) return summaryData.merchants;
    return [];
  }, [categoryData, summaryData]);

  const derivedBudgetData = useMemo(() => {
    if (budgetData?.budgets) return budgetData;
    return { total_limit: 0, total_spent: 0, overall_utilization_pct: 0, budgets: [] };
  }, [budgetData]);

  const derivedGoalData = useMemo(() => {
    if (goalData?.goals) return goalData;
    return { total_target_amount: 0, total_saved_amount: 0, overall_completion_pct: 0, goals: [] };
  }, [goalData]);

  const derivedHealthData = useMemo(() => {
    if (healthData?.score_trend?.length) return healthData;
    return { latest_score: summaryData?.kpis?.health_score || 75.0, status: 'Good', score_trend: [] };
  }, [healthData, summaryData]);

  const derivedForecastData = useMemo(() => {
    if (forecastData) return forecastData;
    return { forecast_next_month_expense: 0, expected_expense_change_pct: 0, forecast_reliability: 'Moderate' };
  }, [forecastData]);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <ReportsHeader
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          summaryData={summaryData}
          categories={derivedCategories}
        />

        {/* Global Period Filter & Controls */}
        <ReportFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          customStart={customStart}
          setCustomStart={setCustomStart}
          customEnd={customEnd}
          setCustomEnd={setCustomEnd}
          onApplyCustom={handleApplyCustomDates}
          comparePrevious={comparePrevious}
          onToggleCompare={handleToggleCompare}
        />

        {/* Section Tab Selector */}
        <div className="flex items-center space-x-2 border-b border-border-subtle overflow-x-auto pb-1 scrollbar-none [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl font-extrabold shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Content Area */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
              Aggregating PostgreSQL Financial Data...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'executive_summary' && (
                <ExecutiveSummarySection
                  summaryData={summaryData}
                  monthlyReport={monthlyReport}
                  comparison={summaryData?.comparison}
                />
              )}

              {activeTab === 'spending_analysis' && (
                <SpendingAnalysisSection
                  categories={derivedCategories}
                  merchants={derivedMerchants}
                  rawTransactions={rawTransactions}
                  comparison={summaryData?.comparison}
                />
              )}

              {activeTab === 'financial_performance' && (
                <FinancialPerformanceSection
                  budgetData={derivedBudgetData}
                  goalData={derivedGoalData}
                  healthData={derivedHealthData}
                  forecastData={derivedForecastData}
                  monthlyReport={monthlyReport}
                />
              )}

              {activeTab === 'insights_export' && (
                <InsightsExportSection
                  summaryData={summaryData}
                  categories={derivedCategories}
                  budgetData={derivedBudgetData}
                  goalData={derivedGoalData}
                  healthData={derivedHealthData}
                  forecastData={derivedForecastData}
                  activeFilter={activeFilter}
                  customStart={customStart}
                  customEnd={customEnd}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageContainer>
  );
};

export default Reports;
