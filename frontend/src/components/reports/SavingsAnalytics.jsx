import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { PiggyBank, Percent } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const SavingsAnalytics = ({ data }) => {
  if (!data || !data.monthly_savings_trend || data.monthly_savings_trend.length === 0) {
    return <EmptyState title="No Savings Data Found" message="Log your monthly income and expenses to track your net savings rate." />;
  }

  const { total_accumulated_savings, avg_savings_rate_pct, monthly_savings_trend } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Accumulated Savings</span>
          </div>
          <h3 className="text-3xl font-black text-white mt-2">{formatINR(total_accumulated_savings)}</h3>
        </div>

        <div className="p-6 rounded-3xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Average Savings Rate</span>
          </div>
          <h3 className="text-3xl font-black text-white mt-2">{avg_savings_rate_pct}%</h3>
        </div>
      </div>

      <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Monthly Savings Rate (%) Trend
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly_savings_trend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} unit="%" />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Savings Rate']}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="savings_rate" stroke="#14B8A6" strokeWidth={3} dot={{ r: 4, fill: '#14B8A6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SavingsAnalytics;
