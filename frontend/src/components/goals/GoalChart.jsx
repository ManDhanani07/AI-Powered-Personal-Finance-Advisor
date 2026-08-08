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

export const GoalChart = ({ goals = [] }) => {
  if (!goals || goals.length === 0) return null;

  // Prepare data for Bar Chart (Target vs Current Saved)
  const barData = goals.map((g) => ({
    name: g.goal_name,
    Target: parseFloat(g.target_amount || 0),
    Saved: parseFloat(g.current_amount || 0),
  }));

  // Prepare data for Donut Pie Chart (Saved Distribution by Goal Type)
  const pieData = goals
    .filter((g) => parseFloat(g.current_amount || 0) > 0)
    .map((g) => ({
      name: g.goal_name,
      value: parseFloat(g.current_amount || 0),
      color: g.color || '#6366F1',
    }));

  const COLORS = pieData.map((d) => d.color);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar Chart: Target vs Saved */}
      <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Target Goal Amount vs Current Saved Accumulation
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
              <Bar dataKey="Target" fill="#6366F1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Saved" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart: Saved Amount Distribution */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Savings Distribution by Goal Target
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
            <p className="text-xs text-slate-400">No active savings allocations to plot.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalChart;
