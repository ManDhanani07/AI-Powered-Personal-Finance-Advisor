import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Receipt,
  Sparkles,
  Target,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import adminService from '../../services/adminService.js';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

const CATEGORY_COLORS = ['#6366F1', '#10B981', '#0EA5E9', '#F43F5E', '#8B5CF6'];

export const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await adminService.getOverview();
        setData(res?.data || res);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        <p className="text-xs text-slate-500 font-medium">Loading platform analytics…</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const growth = data?.user_growth || [];
  const summary = data?.financial_summary || {};
  const categories = data?.top_categories || [];
  const recent = data?.recent_activity || [];

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Compact Top Metric Blocks ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricBlock title="Total Users" value={metrics.total_users?.toLocaleString()} icon={Users} color="text-indigo-400" />
        <MetricBlock title="Active Users" value={metrics.active_users?.toLocaleString()} icon={Users} color="text-emerald-400" />
        <MetricBlock title="Transactions" value={metrics.total_transactions?.toLocaleString()} icon={Receipt} color="text-sky-400" />
        <MetricBlock title="Total Volume" value={formatCompactFinancial(metrics.total_transaction_value)} icon={TrendingUp} color="text-emerald-400" />
        <MetricBlock title="AI Queries" value={metrics.total_ai_queries?.toLocaleString()} icon={Sparkles} color="text-violet-400" />
        <MetricBlock title="Active Budgets" value={metrics.active_budgets?.toLocaleString()} icon={PieChart} color="text-teal-400" />
        <MetricBlock title="Active Goals" value={metrics.active_goals?.toLocaleString()} icon={Target} color="text-amber-400" />
        <MetricBlock title="System Status" value="Healthy" icon={CheckCircle2} color="text-emerald-400" />
      </div>

      {/* ── Charts Row 1: User Growth & Financial Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="border border-zinc-800 bg-[#09090B] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white font-outfit">User Acquisition Trend</h3>
              <p className="text-[11px] text-slate-500">Daily new user signups (Last 7 days)</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">+12% vs last week</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2.5} fill="url(#userGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Volume Summary */}
        <div className="border border-zinc-800 bg-[#09090B] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white font-outfit">Platform Transaction Volume</h3>
              <p className="text-[11px] text-slate-500">Income vs Expenses aggregate totals</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Net: {formatCompactFinancial(summary.net)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Platform Income</span>
              <p className="text-lg font-black text-emerald-400 mt-0.5">{formatCompactFinancial(summary.income)}</p>
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Platform Expenses</span>
              <p className="text-lg font-black text-rose-400 mt-0.5">{formatCompactFinancial(summary.expense)}</p>
            </div>
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Net Surplus</span>
              <p className="text-lg font-black text-indigo-400 mt-0.5">{formatCompactFinancial(summary.net)}</p>
            </div>
          </div>

          {/* Top Categories Bar Chart */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Most Used Categories</p>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} barGap={4}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity Stream Table ── */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white font-outfit">Recent Activity Stream</h3>
          <span className="text-xs text-slate-500 font-mono">Live PostgreSQL Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-semibold text-slate-500 uppercase">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {recent.map((act) => (
                <tr key={act.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{act.user}</td>
                  <td className="py-3 px-4 text-slate-300">{act.activity}</td>
                  <td className="py-3 px-4 text-indigo-400 font-medium">{act.module}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{act.time}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricBlock = ({ title, value, icon: Icon, color }) => (
  <div className="p-3.5 rounded-xl border border-zinc-800 bg-[#09090B] flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
    <p className={`text-base font-extrabold mt-2 font-outfit ${color}`}>{value || 0}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs">
      <p className="font-bold text-white mb-1">{label}</p>
      <p className="text-indigo-400 font-bold font-mono">Signups: {payload[0].value}</p>
    </div>
  );
};

export default AdminOverview;
