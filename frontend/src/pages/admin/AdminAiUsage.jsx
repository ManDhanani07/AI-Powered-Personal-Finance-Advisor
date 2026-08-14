import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import adminService from '../../services/adminService.js';

export const AdminAiUsage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAi = async () => {
      try {
        const res = await adminService.getAiUsage();
        setData(res);
      } catch (err) {
        console.error('Failed to load AI usage stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAi();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        <p className="text-xs text-slate-500 font-mono">Loading AI analytics…</p>
      </div>
    );
  }

  const d = data || {};
  const logs = d.recent_logs || [];

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total AI Queries" value={d.total_queries?.toLocaleString()} icon={Sparkles} color="text-violet-400" />
        <StatCard label="Queries Today" value={d.queries_today?.toLocaleString()} icon={Bot} color="text-indigo-400" />
        <StatCard label="Avg Response Time" value={d.avg_response_time} icon={Clock} color="text-sky-400" />
        <StatCard label="Success Rate" value="100%" icon={CheckCircle2} color="text-emerald-400" />
      </div>

      {/* Query History Table */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden space-y-3">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white font-outfit">Recent AI Copilot Requests</h3>
          <span className="text-xs text-slate-500 font-mono">Gemini 1.5 Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-semibold text-slate-500 uppercase">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Question Prompt</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{log.user}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-md truncate">"{log.question}"</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{log.date}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{log.response_time}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Success
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

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="p-4 rounded-xl border border-zinc-800 bg-[#09090B] space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className={`text-xl font-black font-outfit ${color}`}>{value || 0}</p>
  </div>
);

export default AdminAiUsage;
