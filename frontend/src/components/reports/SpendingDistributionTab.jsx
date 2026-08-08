import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import dashboardService from '../../services/dashboardService.js';

const CustomTooltip = ({ active, payload, totalSpend }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const pct = totalSpend > 0 ? ((item.value / totalSpend) * 100).toFixed(1) : '0';

    return (
      <div className="rounded-2xl border border-border-strong bg-bg-surface/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="font-bold text-slate-900 dark:text-white font-outfit">{item.name}</span>
        </div>
        <p className="font-mono font-bold text-slate-200">{formatCurrency(item.value)}</p>
        <p className="text-[11px] text-slate-400">{pct}% of total expense</p>
      </div>
    );
  }
  return null;
};

export const SpendingDistributionTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCategorySpending = async () => {
      try {
        const res = await dashboardService.getCompleteDashboard(10);
        const payload = res?.data?.data ?? res?.data;
        const catSpending = payload?.charts?.category_spending || [];

        if (isMounted) {
          const formatted = catSpending.map((c) => ({
            name: c.category_name,
            value: Number(c.value),
            color: c.color || '#6366F1',
          }));
          setData(formatted);
        }
      } catch (err) {
        console.error('Error fetching spending distribution:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategorySpending();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSpend = data.reduce((acc, d) => acc + d.value, 0);

  if (loading) {
    return (
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-4 animate-pulse">
        <div className="h-5 bg-slate-800 rounded w-1/3" />
        <div className="h-64 bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  if (!data.length || totalSpend === 0) {
    return (
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-8 shadow-glass flex flex-col items-center justify-center text-center space-y-3">
        <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400">
          <PieIcon className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-white font-outfit">No Category Spending Data Yet</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Log expense transactions or seed your ledger to view your category spending distribution.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
          Category Spending Breakdown
        </h3>
        <p className="text-xs text-slate-400">
          Live expense distribution calculated from your PostgreSQL transaction history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Recharts Donut Canvas */}
        <div className="lg:col-span-7 h-[320px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={115}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip totalSpend={totalSpend} />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-slate-400">Total Expense</span>
            <span className="text-xl font-extrabold text-white font-outfit">
              {formatCurrency(totalSpend)}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="lg:col-span-5 space-y-2.5">
          {data.map((item) => {
            const pct = totalSpend > 0 ? ((item.value / totalSpend) * 100).toFixed(1) : '0';
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-2xl bg-bg-elevated/60 border border-border-subtle/50 text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-slate-200">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white block">{formatCurrency(item.value)}</span>
                  <span className="text-[10px] text-slate-400">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpendingDistributionTab;
