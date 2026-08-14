import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, ShieldCheck, Cpu, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import adminService from '../../services/adminService.js';

export const AdminSystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSystemHealth();
      setHealth(res);
    } catch (err) {
      console.error('Failed to load system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        <p className="text-xs text-slate-500 font-mono">Checking system health status…</p>
      </div>
    );
  }

  const services = health?.services || [];

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B]">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-outfit">All Core Services Operational</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time health monitoring and latency diagnostics</p>
          </div>
        </div>

        <button
          onClick={loadHealth}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-[#09090B] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-white font-outfit">{s.name}</p>
              <p className="text-[11px] text-slate-500 font-mono">Latency: {s.latency}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {s.status}
            </span>
          </div>
        ))}
      </div>

      {/* System Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] text-xs">
        <div>
          <span className="text-slate-500 font-bold uppercase text-[10px]">API Latency</span>
          <p className="text-emerald-400 font-bold font-mono text-sm mt-0.5">{health?.api_response_time}</p>
        </div>
        <div>
          <span className="text-slate-500 font-bold uppercase text-[10px]">DB Connection</span>
          <p className="text-emerald-400 font-bold font-mono text-sm mt-0.5">{health?.db_connection_status}</p>
        </div>
        <div>
          <span className="text-slate-500 font-bold uppercase text-[10px]">Last Database Backup</span>
          <p className="text-slate-300 font-medium mt-0.5">{health?.last_backup}</p>
        </div>
        <div>
          <span className="text-slate-500 font-bold uppercase text-[10px]">Server Uptime</span>
          <p className="text-indigo-400 font-bold font-mono text-sm mt-0.5">{health?.server_uptime}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemHealth;
