import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Scale } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const IncomeExpenseAnalytics = ({ summary, trend = [] }) => {
  if (!trend || trend.length === 0) {
    return <EmptyState title="No Income/Expense Data" message="No monthly cash flow data recorded in PostgreSQL database." />;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Income</span>
            <h3 className="text-2xl font-black text-white mt-1">{formatINR(summary.total_income)}</h3>
          </div>
          <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Expense</span>
            <h3 className="text-2xl font-black text-white mt-1">{formatINR(summary.total_expenses)}</h3>
          </div>
          <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Net Surplus</span>
            <h3 className="text-2xl font-black text-white mt-1">{formatINR(summary.net_savings)}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenseAnalytics;
