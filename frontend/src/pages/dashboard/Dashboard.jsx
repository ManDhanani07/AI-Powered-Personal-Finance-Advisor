import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../hooks/useDashboard.js';

// Dashboard Components
import { DashboardHeader } from '../../components/dashboard/DashboardHeader.jsx';
import { FinancialSummary } from '../../components/dashboard/FinancialSummary.jsx';
import { IncomeExpenseChart } from '../../components/dashboard/IncomeExpenseChart.jsx';
import { CashFlowChart } from '../../components/dashboard/CashFlowChart.jsx';
import { CategoryChart } from '../../components/dashboard/CategoryChart.jsx';

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
      className="space-y-6 max-w-screen-xl mx-auto"
    >
      {/* ── 1. Header: Greeting ── */}
      <DashboardHeader
        summary={data.summary}
      />

      {/* ── 2. Net Worth Executive Summary Banner ── */}
      <FinancialSummary
        summary={data.summary}
        loading={loading}
      />

      {/* ── 3. Primary Visual Graphs (Income vs Expense + Cash Flow Trajectory) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <IncomeExpenseChart charts={data.charts} loading={loading} onSeeded={refresh} />
        </Card>
        <Card>
          <CashFlowChart charts={data.charts} loading={loading} onSeeded={refresh} />
        </Card>
      </div>

      {/* ── 4. Secondary Visual Graph (Category Spending Breakdown) ── */}
      <Card>
        <CategoryChart charts={data.charts} loading={loading} onSeeded={refresh} />
      </Card>
    </motion.div>
  );
};

export default Dashboard;
