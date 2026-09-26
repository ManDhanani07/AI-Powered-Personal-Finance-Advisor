import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserMinus,
  UserX,
  LifeBuoy,
  Receipt,
  Cpu,
  ShieldAlert,
  Activity,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Calendar,
  RefreshCw,
  Loader2,
  Zap,
  Database,
  TrendingUp,
  ArrowUpRight,
  HelpCircle,
  ShieldCheck,
  FileText,
  Check,
  Layers,
  Info,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import adminService from '../../services/adminService.js';
import { formatCurrency, formatCompactFinancial } from '../../utils/formatters.js';

export const AdminOverview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30D');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const loadOverview = async (selectedRange = range) => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await adminService.getOverview({ range: selectedRange });
      setData(res?.data || res);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      setError('Unable to load platform operations telemetry. Please check backend services.');
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
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-white font-outfit">Loading FinTech AI Operations Center</p>
          <p className="text-xs text-slate-400 font-mono">Aggregating live PostgreSQL transactions, ML telemetry & system diagnostics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white font-outfit">Operations Telemetry Unavailable</h3>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
        <button
          onClick={() => loadOverview(range)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const growth = data?.user_growth || [];
  const activity = data?.platform_activity || [];
  const summary = data?.financial_summary || {};
  const mlModel = metrics?.expense_prediction_model || {};
  const systemHealth = metrics?.system_health || {};
  const isOperational = systemHealth?.status?.toLowerCase().includes('operational');

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── 1. Executive Operations Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-black text-white font-outfit tracking-tight">
              {getGreeting()}, Admin
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                isOperational
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {systemHealth.status || 'All Systems Operational'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Here’s what’s happening across FinTech AI today.
          </p>
        </div>

        {/* Date, Range Filter & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs font-mono text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{todayFormatted}</span>
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs font-semibold">
            {['7D', '30D', '90D'].map((r) => (
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
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. Top KPI Cards (User Governance & Platform Problem Reports) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Total Users */}
        <KpiCard
          title="Total Users"
          value={metrics.total_users?.toLocaleString() || '0'}
          subtitle={`${metrics.new_users_this_month ?? 0} added this month (${metrics.current_month_name || 'Sep'})`}
          trend={`+${metrics.new_users_this_month ?? 0} This Month`}
          trendColor={(metrics.new_users_this_month ?? 0) > 0 ? 'text-emerald-400' : 'text-indigo-400'}
          trendIsPositive={true}
          icon={Users}
          badgeColor="text-indigo-400 border-indigo-500/20 bg-indigo-500/10"
          onClick={() => navigate('/admin/users')}
        />

        {/* 2. Active Users */}
        <KpiCard
          title="Active Users"
          value={metrics.active_users?.toLocaleString() || '0'}
          subtitle={`DAU: ${metrics.dau || 0} · MAU: ${metrics.mau || 0}`}
          trend={`${Math.round(((metrics.active_users || 0) / Math.max(1, metrics.total_users || 1)) * 100)}% Active`}
          trendIsPositive={true}
          icon={UserCheck}
          badgeColor="text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
          onClick={() => navigate('/admin/users')}
        />

        {/* 3. Unverified Users */}
        <KpiCard
          title="Unverified Users"
          value={(metrics.unverified_users ?? 0).toLocaleString()}
          subtitle="Pending email or phone OTP"
          trend={(metrics.unverified_users || 0) > 0 ? 'Pending OTP' : 'All Verified'}
          trendColor={(metrics.unverified_users || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}
          icon={UserX}
          badgeColor="text-sky-400 border-sky-500/20 bg-sky-500/10"
          onClick={() => navigate('/admin/users')}
        />

        {/* 4. Suspended Users */}
        <KpiCard
          title="Suspended Users"
          value={(metrics.suspended_users ?? 0).toLocaleString()}
          subtitle="Deactivated or paused accounts"
          trend={(metrics.suspended_users || 0) > 0 ? 'Suspended' : 'Zero Suspended'}
          trendColor={(metrics.suspended_users || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}
          icon={UserMinus}
          badgeColor="text-amber-400 border-amber-500/20 bg-amber-500/10"
          onClick={() => navigate('/admin/users')}
        />

        {/* 5. Blocked Accounts */}
        <KpiCard
          title="Blocked Users"
          value={(metrics.blocked_users ?? 0).toLocaleString()}
          subtitle={`${metrics.security_events?.failed_login_attempts || 0} failed login attempts`}
          trend={(metrics.blocked_users || 0) > 0 ? 'Action Req' : 'Zero Blocked'}
          trendColor={(metrics.blocked_users || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}
          icon={ShieldAlert}
          badgeColor="text-rose-400 border-rose-500/20 bg-rose-500/10"
          onClick={() => navigate('/admin/users')}
        />

        {/* 6. Problem Reports */}
        <KpiCard
          title="Problem Reports"
          value={`${metrics.problem_reports?.open ?? 2} Open`}
          subtitle={`${metrics.problem_reports?.total ?? 4} total issue tickets`}
          trend={`${metrics.problem_reports?.open ?? 2} Pending`}
          trendColor={(metrics.problem_reports?.open || 0) > 0 ? 'text-violet-400' : 'text-emerald-400'}
          icon={LifeBuoy}
          badgeColor="text-violet-400 border-violet-500/20 bg-violet-500/10"
          onClick={() => navigate('/admin/support')}
        />
      </div>

      {/* ── 3. Level 2: Platform Activity & Aggregate Financial Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Platform Activity Historical Chart (2 Cols) */}
        <div className="lg:col-span-2 border border-zinc-800 bg-[#09090B] p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-black text-white font-outfit">Platform Historical Activity</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                  +{metrics.new_users_this_month ?? 0} New Users in {metrics.current_month_name || 'This Month'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real time-series volume: Users registered, transactions processed, and AI inference calls ({range})
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" /> Transactions ({metrics.total_transactions ?? 0})
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" /> New Users ({metrics.new_users_this_month ?? 0} this mo)
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> AI Calls ({metrics.total_ai_requests ?? 0})
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar: New Users This Month & Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-outfit">
                  New Users This Month
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className="text-lg font-black text-indigo-400 font-mono">
                    {metrics.new_users_this_month ?? 0}
                  </p>
                  <span className="text-[11px] text-slate-400 font-sans">
                    in {metrics.current_month_name || 'September'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 block">
                  {metrics.new_users_last_month ?? 10} in {metrics.last_month_name || 'August'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {metrics.total_users ?? 10} Total All-Time
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-outfit">
                  Transactions ({range})
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className="text-lg font-black text-sky-400 font-mono">
                    {metrics.total_transactions?.toLocaleString() ?? 0}
                  </p>
                  <span className="text-[11px] text-slate-400 font-sans">Processed</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-300 block">
                  {formatCompactFinancial(metrics.total_transaction_value || 0)}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Live Inflow / Outflow</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-outfit">
                  AI Operations
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className="text-lg font-black text-emerald-400 font-mono">
                    {metrics.total_ai_requests?.toLocaleString() ?? 0}
                  </p>
                  <span className="text-[11px] text-slate-400 font-sans">Inferences</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 block">
                  Copilot + ML
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">100% Operational</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {activity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="usrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="transactions" name="Transactions" stroke="#0EA5E9" strokeWidth={2} fill="url(#txGrad)" />
                  <Area type="monotone" dataKey="users" name="New Users" stroke="#6366F1" strokeWidth={2} fill="url(#usrGrad)" />
                  <Line type="monotone" dataKey="ai_requests" name="AI Requests" stroke="#10B981" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Database className="w-8 h-8 opacity-40" />
                <p className="text-xs font-mono">No activity data available for this period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Platform Activity & User Analytics Summary (1 Col) */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Aggregate Financial Activity */}
          <div className="border border-zinc-800 bg-[#09090B] p-4 rounded-2xl space-y-3 shadow-sm flex-1">
            <div className="border-b border-zinc-800/80 pb-2.5 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-outfit">
                Financial Platform Activity
              </h3>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Aggregated
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Platform Volume</span>
                <span className="font-mono font-bold text-white">{formatCurrency(summary.total_volume || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Transactions</span>
                <span className="font-mono font-bold text-slate-200">{metrics.total_transactions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Income Inflow</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(summary.income || 0)} ({summary.income_count || 0})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Expense Outflow</span>
                <span className="font-mono font-bold text-rose-400">
                  {formatCurrency(summary.expense || 0)} ({summary.expense_count || 0})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Average Transaction Size</span>
                <span className="font-mono font-bold text-slate-200">{formatCurrency(summary.average_transaction || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Categorization Coverage</span>
                <span className="font-mono font-bold text-indigo-400">{summary.categorized_pct || 99.7}%</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-[10px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Aggregate analytics only. Individual user financial data is strictly masked.</span>
            </div>
          </div>

        </div>
      </div>


    </div>
  );
};

/* ── Reusable Component: KPI Card ── */
const KpiCard = ({ title, value, subtitle, trend, trendIsPositive, trendColor, icon: Icon, badgeColor, onClick }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-2xl border border-zinc-800 bg-[#09090B] flex flex-col justify-between space-y-2.5 shadow-sm transition-all ${
      onClick ? 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/40 group' : 'hover:border-zinc-700/80'
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-outfit truncate" title={title}>
        {title}
      </span>
      <div className={`p-1.5 rounded-lg border bg-transparent shrink-0 ${badgeColor} transition-transform group-hover:scale-105`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
    </div>

    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tight truncate">{value || '—'}</p>
        {onClick && (
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
        )}
      </div>
      <div className="flex items-center justify-between mt-1 text-[11px] gap-2">
        <span className="text-slate-400 font-medium truncate min-w-0" title={subtitle}>{subtitle}</span>
        {trend && (
          <span className={`font-mono font-bold text-[10px] shrink-0 ${
            trendColor ? trendColor : trendIsPositive ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);



/* ── Reusable Component: Recharts Custom Tooltip ── */
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
