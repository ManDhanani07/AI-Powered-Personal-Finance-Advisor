import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const BudgetChart = ({ budgets = [] }) => {
  if (!budgets || budgets.length === 0) return null;

  // Prepare data for Bar Chart (Budget vs Spent)
  const barData = budgets.map((b) => ({
    name: b.category?.category_name || b.budget_name,
    Allocated: parseFloat(b.budget_amount || 0),
    Spent: parseFloat(b.spent_amount || 0),
  }));

  // Prepare data for Donut Pie Chart (Spent Distribution by Category)
  const pieData = budgets
    .filter((b) => parseFloat(b.spent_amount || 0) > 0)
    .map((b) => ({
      name: b.category?.category_name || b.budget_name,
      value: parseFloat(b.spent_amount || 0),
      color: b.category?.color || '#6366F1',
    }));

  const COLORS = pieData.map((d) => d.color);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar Chart: Budget vs Spending */}
      <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Budget Allocation vs Actual Spending
        </h4>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#FFF',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Allocated" fill="#6366F1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Spent" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart: Spent Distribution */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Spending Breakdown by Category
        </h4>

        <div className="h-64 w-full flex items-center justify-center">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400">No active spending records to plot.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetChart;
