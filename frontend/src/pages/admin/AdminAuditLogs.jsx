import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import adminService from '../../services/adminService.js';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const res = await adminService.getAuditLogs({ search, page, page_size: 20 });
        setLogs(res.items || []);
        setTotalPages(res.total_pages || 1);
        setTotalCount(res.total_count || 0);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [search, page]);

  return (
    <div className="space-y-5 max-w-[1920px] w-full mx-auto">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search security audit trail by user, action, resource…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        />
      </div>

      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            <p className="text-xs text-slate-500 font-mono">Loading security logs…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-4 text-white font-sans font-bold">{log.user_email}</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">{log.action}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{log.resource}</td>
                    <td className="py-3 px-4 text-slate-500">{log.ip}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-3 border-t border-zinc-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {logs.length} of {totalCount} logs</span>
            <div className="flex items-center space-x-1">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-white">{page} / {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40">
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
