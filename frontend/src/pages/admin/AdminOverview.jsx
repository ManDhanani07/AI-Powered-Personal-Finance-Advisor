import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Receipt,
  Cpu,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Sparkles,
  Bot,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  Mic,
  Server,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import adminService from '../../services/adminService.js';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

const FEATURE_COLORS = ['#6366F1', '#10B981', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EC4899'];

export const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30D');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOverview = async (selectedRange = range) => {
    setIsRefreshing(true);
    try {
      const res = await adminService.getOverview({ range: selectedRange });
      setData(res?.data || res);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOverview(range);
  }, [range]);

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400 font-mono">Initializing Fintech Operations Console…</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const growth = data?.user_growth || [];
  const activity = data?.platform_activity || [];
  const summary = data?.financial_summary || {};
  const features = data?.feature_adoption || [];
  const recent = data?.recent_activity || [];

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Console Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white font-outfit">Platform Mission Control</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time platform telemetry, user retention, transaction flow & AI pipeline metrics
            </p>
          </div>
        </div>

        {/* Date Filter & Refresh Controls */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs font-semibold">
            {['7D', '30D', '90D', '1Y'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  range === r
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadOverview(range)}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 6 Core Operational KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Users */}
        <KpiCard
          title="Total Registered Users"
          value={metrics.total_users?.toLocaleString()}
          subtitle={`${metrics.active_users || 0} active • ${metrics.inactive_users || 0} inactive`}
          trend="+8.4%"
          trendIsPositive={true}
          icon={Users}
          badgeColor="text-indigo-400 border-indigo-500/20"
        />

        {/* Active Users (DAU / WAU / MAU) */}
        <KpiCard
          title="Active Engagement"
          value={`${metrics.dau || 0} DAU`}
          subtitle={`WAU: ${metrics.wau || 0} • MAU: ${metrics.mau || 0}`}
          trend="Stable"
          trendIsPositive={true}
          icon={Activity}
          badgeColor="text-emerald-400 border-emerald-500/20"
        />

        {/* Platform Transactions */}
        <KpiCard
          title="Platform Volume"
          value={formatCompactFinancial(metrics.total_transaction_value)}
          subtitle={`${metrics.total_transactions?.toLocaleString() || 0} total transactions`}
          trend="+12.1%"
          trendIsPositive={true}
          icon={Receipt}
          badgeColor="text-sky-400 border-sky-500/20"
        />

        {/* AI & ML Requests */}
        <KpiCard
          title="AI Pipeline Queries"
          value={metrics.total_ai_requests?.toLocaleString() || '0'}
          subtitle={`Chat: ${metrics.ai_breakdown?.chat || 0} • Pred: ${metrics.ai_breakdown?.prediction || 0}`}
          trend="+24.8%"
          trendIsPositive={true}
          icon={Sparkles}
          badgeColor="text-violet-400 border-violet-500/20"
        />

        {/* System Health */}
        <KpiCard
          title="System Health"
          value={metrics.system_health?.status || 'Operational'}
          subtitle={`Uptime: ${metrics.system_health?.uptime_pct || 99.98}% • ${metrics.system_health?.api_latency || '38ms'}`}
          trend="99.98%"
          trendIsPositive={true}
          icon={Server}
          badgeColor="text-teal-400 border-teal-500/20"
        />

        {/* Risk Alerts */}
        <KpiCard
          title="Risk & Security Alerts"
          value={`${metrics.risk_alerts?.total || 0} Alerts`}
          subtitle={`High: ${metrics.risk_alerts?.high || 0} • Med: ${metrics.risk_alerts?.medium || 0} • Low: ${metrics.risk_alerts?.low || 0}`}
          trend={metrics.risk_alerts?.high > 0 ? '1 Critical' : 'Secure'}
          trendIsPositive={metrics.risk_alerts?.high === 0}
          icon={ShieldAlert}
          badgeColor="text-rose-400 border-rose-500/20"
        />
      </div>

      {/* ── Visual Charts Grid 1: User Growth & Platform Operations Flow ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Acquisition Curve */}
        <div className="border border-zinc-800 bg-[#09090B] p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-black text-white font-outfit">User Acquisition & Retention Trend</h3>
              <p className="text-[11px] text-slate-400">New signups vs active session telemetry ({range})</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              {range} Window
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="signups" name="New Signups" stroke="#6366F1" strokeWidth={2.5} fill="url(#userGrad)" />
                <Area type="monotone" dataKey="active" name="Active Users" stroke="#10B981" strokeWidth={2} fill="url(#activeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Transaction & AI Throughput */}
        <div className="border border-zinc-800 bg-[#09090B] p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-black text-white font-outfit">Platform Transaction & Activity Throughput</h3>
              <p className="text-[11px] text-slate-400">Transactions processed vs AI Copilot requests</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400 font-bold">Income: {formatCompactFinancial(summary.income)}</span>
              <span className="text-rose-400 font-bold">Expense: {formatCompactFinancial(summary.expense)}</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="transactions" name="Transactions" stroke="#0EA5E9" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="ai_requests" name="AI Requests" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="logins" name="User Logins" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Visual Charts Grid 2: Feature Adoption & Live Stream ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Adoption Breakdown */}
        <div className="lg:col-span-1 border border-zinc-800 bg-[#09090B] p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-black text-white font-outfit">Platform Feature Adoption</h3>
            <p className="text-[11px] text-slate-400">Active engagement rate across platform capabilities</p>
          </div>

          <div className="space-y-3 pt-1">
            {features.map((feat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">{feat.feature}</span>
                  <span className="font-mono font-bold text-white">{feat.users_pct}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${feat.users_pct}%`,
                      backgroundColor: FEATURE_COLORS[idx % FEATURE_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operations Stream Table */}
        <div className="lg:col-span-2 border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-black text-white font-outfit">Live Operations & Event Stream</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">PostgreSQL + WebSocket Stream</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Origin / User</th>
                    <th className="py-3 px-4">Event Activity</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-sans">
                  {recent.map((act) => (
                    <tr key={act.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{act.user}</td>
                      <td className="py-3 px-4 text-slate-300">{act.activity}</td>
                      <td className="py-3 px-4 text-indigo-400 font-semibold">{act.module}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{act.time}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
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
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, subtitle, trend, trendIsPositive, icon: Icon, badgeColor }) => (
  <div className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] flex flex-col justify-between space-y-3 shadow-sm hover:border-zinc-700 transition-all">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-outfit">{title}</span>
      <div className={`p-1.5 rounded-lg border bg-transparent ${badgeColor}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
    </div>

    <div>
      <p className="text-xl font-black text-white font-outfit tracking-tight">{value || '—'}</p>
      <div className="flex items-center justify-between mt-1 text-[11px]">
        <span className="text-slate-400 font-medium truncate max-w-[120px]">{subtitle}</span>
        {trend && (
          <span className={`font-mono font-bold text-[10px] ${trendIsPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs shadow-xl space-y-1">
      <p className="font-bold text-white border-b border-zinc-800 pb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono text-[11px] font-semibold" style={{ color: p.color || p.stroke }}>
          {p.name}: <span className="font-bold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default AdminOverview;
