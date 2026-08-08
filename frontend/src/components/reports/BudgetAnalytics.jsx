import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon, AlertTriangle, CheckCircle2, AlertCircle, ArrowRight, Sparkles, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState.jsx';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const BudgetAnalytics = ({ data }) => {
  const navigate = useNavigate();

  if (!data || !data.budgets || data.budgets.length === 0) {
    return <EmptyState title="No Active Budgets Found" message="Create budget targets per category to monitor your spending utilization." />;
  }

  const { total_limit, total_spent, overall_utilization_pct, budgets } = data;

  // Compute status helpers
  const getStatusBadge = (b) => {
    const limit = Number(b.limit || b.budget_amount || 0);
    const spent = Number(b.spent || b.spent_amount || 0);
    const util = limit > 0 ? (spent / limit) * 100 : 0;

    if (spent > limit) {
      return {
        label: 'EXCEEDED',
        color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        exceededAmt: spent - limit,
        exceededPct: limit > 0 ? ((spent - limit) / limit) * 100 : 100,
      };
    }
    if (util >= 90) {
      return { label: 'NEAR LIMIT', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    }
    if (util >= 70) {
      return { label: 'WARNING', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    return { label: 'HEALTHY', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  };

  const exceededList = budgets
    .map((b) => ({ ...b, meta: getStatusBadge(b) }))
    .filter((b) => b.meta.label === 'EXCEEDED');

  return (
    <div className="space-y-6">
      {/* Exceeded Budget Alert Callout Banner */}
      {exceededList.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Budget Limit Exceeded Alert</span>
          </div>
          <div className="space-y-1">
            {exceededList.map((b, i) => (
              <p key={i} className="text-xs font-semibold text-rose-200">
                ⚠️ <span className="font-bold text-white">{b.category_name}</span> exceeded its budget limit by{' '}
                <span className="font-black text-rose-400">{formatINR(b.meta.exceededAmt)}</span> (+{b.meta.exceededPct.toFixed(1)}%).
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-primary-500/10 border border-primary-500/30 text-primary-300">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Allocated Budget</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatINR(total_limit)}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Actual Spending</span>
          <h3 className="text-2xl font-black text-white mt-1">{formatINR(total_spent)}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Overall Utilization</span>
          <h3 className="text-2xl font-black text-white mt-1">{overall_utilization_pct}%</h3>
        </div>
      </div>

      {/* Budget Limit vs Spent Bar Chart */}
      <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Category Budget Utilization vs Limit
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/budgets')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-300 text-xs font-bold transition-all border border-primary-500/30"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>View Budget</span>
            </button>
            <button
              onClick={() => navigate('/ai-assistant')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold transition-all border border-purple-500/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgets} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="category_name" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val) => [formatINR(val)]}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="limit" name="Budget Limit" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="spent" name="Actual Spent" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Budget Category Table */}
        <div className="pt-4 border-t border-border-subtle overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Allocated Budget</th>
                <th className="py-3 px-4">Actual Spending</th>
                <th className="py-3 px-4">Remaining</th>
                <th className="py-3 px-4">Utilization</th>
                <th className="py-3 px-4">Status Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 text-slate-200">
              {budgets.map((b, i) => {
                const limit = Number(b.limit || b.budget_amount || 0);
                const spent = Number(b.spent || b.spent_amount || 0);
                const rem = Math.max(0, limit - spent);
                const util = limit > 0 ? ((spent / limit) * 100).toFixed(1) : 0;
                const statusMeta = getStatusBadge(b);

                return (
                  <tr key={i} className="hover:bg-bg-card/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{b.category_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{formatINR(limit)}</td>
                    <td className="py-3 px-4 font-mono text-white font-black">{formatINR(spent)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{formatINR(rem)}</td>
                    <td className="py-3 px-4 font-mono text-purple-300">{util}%</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetAnalytics;
