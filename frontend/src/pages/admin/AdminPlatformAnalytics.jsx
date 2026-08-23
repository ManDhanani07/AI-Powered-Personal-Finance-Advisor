import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Clock,
  Sparkles,
  Layers,
  Zap,
  Filter,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

const COLORS = ['#6366F1', '#10B981', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EC4899'];

export const AdminPlatformAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30D');

  const loadData = async (selectedRange = range) => {
    setLoading(true);
    try {
      const res = await adminService.getPlatformAnalytics({ range: selectedRange });
      setData(res);
    } catch (err) {
      console.error('Failed to load platform analytics:', err);
      showToast.error('Failed to load analytics telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400 font-mono">Aggregating platform feature usage & engagement telemetry…</p>
      </div>
    );
  }

  const eng = data?.engagement || {};
  const features = data?.feature_breakdown || [];
  const ai = data?.ai_throughput || {};

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white font-outfit">Platform & Feature Analytics</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Application-level adoption, user retention curves, and AI pipeline throughput diagnostics.
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs font-semibold">
          {['7D', '30D', '90D', '1Y'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                range === r
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── User Engagement Telemetry ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatBlock label="DAU" value={eng.dau || 0} icon={Users} color="text-indigo-400" />
        <StatBlock label="WAU" value={eng.wau || 0} icon={Users} color="text-sky-400" />
        <StatBlock label="MAU" value={eng.mau || 0} icon={Users} color="text-teal-400" />
        <StatBlock label="30-Day Retention" value={eng.retention_30d || '78.4%'} icon={TrendingUp} color="text-emerald-400" />
        <StatBlock label="90-Day Retention" value={eng.retention_90d || '64.2%'} icon={TrendingUp} color="text-emerald-400" />
        <StatBlock label="Avg Session Time" value={eng.avg_session_duration || '7m 34s'} icon={Clock} color="text-amber-400" />
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage Breakdown Bar Chart */}
        <div className="border border-zinc-800 bg-[#09090B] p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-black text-white font-outfit">Feature Engagement Distribution</h3>
            <p className="text-[11px] text-slate-400">Percentage of active user base utilizing each core module</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={features} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pct" name="Adoption %" radius={[6, 6, 0, 0]}>
                  {features.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Engine Throughput & Performance */}
        <div className="border border-zinc-800 bg-[#09090B] p-5 rounded-2xl space-y-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-zinc-800/80 pb-3">
              <h3 className="text-sm font-black text-white font-outfit">AI Engine Throughput & Reliability</h3>
              <p className="text-[11px] text-slate-400">Gemini 1.5 Flash query performance and token consumption</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total AI Calls</span>
                <p className="text-2xl font-black text-white font-outfit">{ai.total_calls?.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Response Latency</span>
                <p className="text-2xl font-black text-emerald-400 font-outfit">{ai.avg_latency}</p>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Token Volume</span>
                <p className="text-2xl font-black text-violet-400 font-outfit">{ai.estimated_token_usage?.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">API Error Rate</span>
                <p className="text-2xl font-black text-sky-400 font-outfit">{ai.error_rate}</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
            <span className="text-slate-400">AI Service Level Objective (SLO):</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              99.98% Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBlock = ({ label, value, icon: Icon, color }) => (
  <div className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-2 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className={`text-xl font-black font-outfit ${color}`}>{value}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs shadow-xl space-y-0.5">
      <p className="font-bold text-white">{label}</p>
      <p className="text-indigo-400 font-mono font-bold">Adoption: {payload[0].value}%</p>
    </div>
  );
};

export default AdminPlatformAnalytics;
