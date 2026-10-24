import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../hooks/useDashboard.js';

// Dashboard Core Components
import { DashboardHeader } from '../../components/dashboard/DashboardHeader.jsx';
import { FinancialSummary } from '../../components/dashboard/FinancialSummary.jsx';

// Heavy Visual Charts (Lazy Loaded so Recharts does not block initial FCP/LCP)
const IncomeExpenseChart = lazy(() => import('../../components/dashboard/IncomeExpenseChart.jsx'));
const CashFlowChart = lazy(() => import('../../components/dashboard/CashFlowChart.jsx'));
const CategoryChart = lazy(() => import('../../components/dashboard/CategoryChart.jsx'));

const ChartSkeletonFallback = () => (
  <div className="h-[280px] w-full flex items-center justify-center bg-zinc-950/40 rounded-2xl animate-pulse border border-zinc-800/40">
    <div className="flex flex-col items-center gap-2.5">
      <div className="w-5 h-5 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Rendering Data</span>
    </div>
  </div>
);

/**
 * Card wrapper — consistent glassmorphic card shell used throughout the executive dashboard.
 */
const Card = ({ children, className = '' }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    }}
    whileHover={{ y: -3 }}
    className={`rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const Dashboard = () => {
  const { data, loading, refreshing, refresh } = useDashboard(10);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1920px] w-full mx-auto"
    >
      {/* ── 1. Header: Greeting ── */}
      <DashboardHeader
        summary={data.summary}
      />

      {/* ── 2. Net Worth Executive Summary Banner ── */}
      <FinancialSummary
        summary={data.summary}
        overview={data.overview}
        budgetOverview={data.budgetOverview}
        loading={loading}
      />

      {/* ── 3. Primary Visual Graphs (Income vs Expense + Cash Flow Trajectory) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Suspense fallback={<ChartSkeletonFallback />}>
            <IncomeExpenseChart charts={data.charts} loading={loading} onSeeded={refresh} />
          </Suspense>
        </Card>
        <Card>
          <Suspense fallback={<ChartSkeletonFallback />}>
            <CashFlowChart charts={data.charts} loading={loading} onSeeded={refresh} />
          </Suspense>
        </Card>
      </div>

      {/* ── 4. Secondary Visual Graph (Category Spending Breakdown) ── */}
      <Card>
        <Suspense fallback={<ChartSkeletonFallback />}>
          <CategoryChart charts={data.charts} loading={loading} onSeeded={refresh} />
        </Suspense>
      </Card>
    </motion.div>
  );
};

export default Dashboard;
