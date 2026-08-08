import React from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444'];

export const BudgetChartsSection = ({ chartsData }) => {
  if (!chartsData) return null;

  const {
    budget_vs_actual = [],
    category_spending = [],
    overspending_trend = [],
  } = chartsData;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Budget vs Actual */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border-strong bg-bg-surface/90 p-6 shadow-glass backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 font-bold">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
                Budget Allocation vs Actual Spend
              </h4>
              <p className="text-[11px] text-slate-400">Category envelope limits vs actual outflows</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budget_vs_actual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="budget" name="Allocated Budget" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="spent" name="Actual Spent" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Category Spending Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border-strong bg-bg-surface/90 p-6 shadow-glass backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold">
              <PieIcon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
                Category Spending Distribution
              </h4>
              <p className="text-[11px] text-slate-400">Share of total monthly expenditure</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2 flex items-center justify-center">
            {category_spending.length === 0 ? (
              <p className="text-xs text-slate-400">No expense data logged yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_spending}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {category_spending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Chart 3: Overspending Velocity & Forecast Trend */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl border border-border-strong bg-bg-surface/90 p-6 shadow-glass backdrop-blur-xl space-y-4"
      >
        <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
              Daily Spending Velocity vs Envelope Cap Line
            </h4>
            <p className="text-[11px] text-slate-400">Cumulative day-by-day spend trajectory vs safe limit line</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overspending_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="limitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="spent" name="Cumulative Spent" stroke="#ef4444" fillOpacity={1} fill="url(#spentGradient)" />
              <Area type="monotone" dataKey="limit" name="Safe Limit Line" stroke="#10b981" fillOpacity={1} fill="url(#limitGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default BudgetChartsSection;
