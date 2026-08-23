import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Database,
  Cpu,
  ShieldCheck,
  Lock,
  Sliders,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  HardDrive,
  Loader2,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminSystemConsole = () => {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [telemetry, setTelemetry] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        adminService.getSystemTelemetry(),
        adminService.getSystemConfig(),
      ]);
      setTelemetry(tRes);
      setConfig(cRes);
    } catch (err) {
      console.error('Failed to load system telemetry & config:', err);
      showToast.error('Failed to load system parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSystemConfig(config);
      showToast.success('Platform configuration thresholds updated successfully.');
    } catch {
      showToast.error('Failed to update platform configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400 font-mono">Querying system runtime telemetry & cluster status…</p>
      </div>
    );
  }

  const services = telemetry?.services || [];
  const storage = telemetry?.storage || {};
  const roles = config?.rbac_roles || [];

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white font-outfit">System Health, Configuration & RBAC</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Uptime: {telemetry?.server_uptime || '99.98%'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Infrastructure health gauges, runtime threshold controls, and role-based access matrix.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Refresh System Health</span>
        </button>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        {[
          { id: 'telemetry', label: 'Services & Telemetry', icon: Activity },
          { id: 'config', label: 'Platform & AI Configuration', icon: Sliders },
          { id: 'rbac', label: 'Admin RBAC Permissions Matrix', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Services Health Telemetry ── */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <p className="text-xs font-black text-white font-outfit">{s.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>Latency: <strong className="text-slate-200">{s.latency}</strong></span>
                    {s.error_rate && <span>• Err: {s.error_rate}</span>}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          {/* Storage & DB Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">PostgreSQL Database Storage</span>
              <p className="text-lg font-black text-white font-mono">{storage.database_storage}</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Uploaded Statement Files</span>
              <p className="text-lg font-black text-teal-400 font-mono">{storage.uploaded_statements}</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">ML Dataset Storage</span>
              <p className="text-lg font-black text-violet-400 font-mono">{storage.ml_dataset_storage}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Platform Configuration Controls ── */}
      {activeTab === 'config' && config && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-3xl border border-zinc-800 bg-[#09090B] space-y-6 shadow-sm">
          {/* AI Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Provider & Confidence Thresholds</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">AI Engine Provider</label>
                <input
                  type="text"
                  disabled
                  value={config.ai?.provider || 'Google Gemini'}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-slate-400 font-mono cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Categorization Min Confidence</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="0.99"
                  value={config.ai?.categorization_confidence_threshold || 0.85}
                  onChange={(e) => setConfig({
                    ...config,
                    ai: { ...config.ai, categorization_confidence_threshold: parseFloat(e.target.value) }
                  })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Daily AI Quota / User</label>
                <input
                  type="number"
                  value={config.ai?.daily_ai_rate_limit_per_user || 50}
                  onChange={(e) => setConfig({
                    ...config,
                    ai: { ...config.ai, daily_ai_rate_limit_per_user: parseInt(e.target.value, 10) }
                  })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Security & Sessions */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Authentication & Session Policies</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={config.security?.session_timeout_minutes || 60}
                  onChange={(e) => setConfig({
                    ...config,
                    security: { ...config.security, session_timeout_minutes: parseInt(e.target.value, 10) }
                  })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Brute-force Lockout Attempt Limit</label>
                <input
                  type="number"
                  value={config.security?.max_failed_login_attempts || 5}
                  onChange={(e) => setConfig({
                    ...config,
                    security: { ...config.security, max_failed_login_attempts: parseInt(e.target.value, 10) }
                  })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving…' : 'Save System Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── Tab 3: RBAC Roles Matrix ── */}
      {activeTab === 'rbac' && (
        <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white font-outfit">Role-Based Access Control (RBAC) Hierarchy</h3>
              <p className="text-xs text-slate-400 mt-0.5">Least-privilege operational access separation matrix.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Administrative Role</th>
                  <th className="py-3.5 px-4">Active Admins</th>
                  <th className="py-3.5 px-4">Assigned Permission Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {roles.map((r, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{r.role}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{r.users_count} assigned</td>
                    <td className="py-3 px-4 text-slate-300">{r.permissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystemConsole;
