import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Info,
} from 'lucide-react';
import adminService from '../../services/adminService.js';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        search,
        admin_filter: adminFilter !== 'all' ? adminFilter : undefined,
        action_filter: actionFilter !== 'all' ? actionFilter : undefined,
        page,
        page_size: 20,
      });
      setLogs(res.items || []);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.total_count || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [search, adminFilter, actionFilter, page]);

  return (
    <div className="space-y-5 max-w-[1920px] w-full mx-auto">
      {/* ── Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white font-outfit">Immutable Administrative Audit Trail</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Read-only regulatory compliance log of every administrative mutation and security event.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-xl">
          <span>Logged Actions: <strong className="text-white">{totalCount}</strong></span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search security audit trail by user, action, resource…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-500">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">Admin Login</option>
              <option value="USER_STATUS">User Status</option>
              <option value="AI_MODEL">AI Ops</option>
              <option value="SYSTEM_CONFIG">System Config</option>
              <option value="SECURITY">Security Action</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Audit Logs Table ── */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-xs text-slate-500 font-mono">Loading compliance audit history…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Admin Email</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Resource</th>
                  <th className="py-3.5 px-4">Metadata / Details</th>
                  <th className="py-3.5 px-4">Origin IP</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 text-white font-bold whitespace-nowrap">{log.user_email}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400 text-[11px] whitespace-nowrap">{log.action}</td>
                    <td className="py-3 px-4 text-slate-300 font-semibold">{log.resource}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate text-[11px]">{log.details}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{log.ip}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" /> {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-zinc-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {logs.length} of {totalCount} logs</span>
            <div className="flex items-center space-x-1">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-white">{page} / {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
