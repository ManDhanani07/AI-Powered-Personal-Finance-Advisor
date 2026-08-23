import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  RefreshCw,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSupportTickets();
      setTickets(res?.tickets || []);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
      showToast.error('Failed to load support ticket queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await adminService.updateSupportTicket(ticketId, { status: newStatus });
      showToast.success(`Ticket ${ticketId} status updated to ${newStatus}.`);
      loadTickets();
    } catch {
      showToast.error('Failed to update ticket status.');
    }
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400 font-mono">Loading customer inquiry & issue ticketing queue…</p>
      </div>
    );
  }

  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === 'ALL' || t.status.toUpperCase() === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || t.priority.toUpperCase() === priorityFilter;
    return matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white font-outfit">Support & Platform Issue Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Triage user inquiries, investigate statement parsing issues, and track customer resolution SLAs.
            </p>
          </div>
        </div>

        <button
          onClick={loadTickets}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ── Filters Toolbar ── */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>
      </div>

      {/* ── Support Tickets Table ── */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-white font-outfit">Active Ticket Queue</h3>
          <span className="text-xs text-slate-400 font-mono">{filteredTickets.length} Tickets in Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Issue Summary</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Assigned Admin</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Workflow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredTickets.map((t) => {
                const isCrit = t.priority === 'Critical';
                const isHigh = t.priority === 'High';
                const isMed = t.priority === 'Medium';

                return (
                  <tr key={t.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{t.id}</td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{t.user}</td>
                    <td className="py-3 px-4 max-w-xs text-slate-300 truncate">{t.issue}</td>
                    <td className="py-3 px-4 text-indigo-400 font-semibold">{t.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCrit
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : isHigh
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : isMed
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-zinc-800 text-slate-400 border-zinc-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{t.assigned_admin}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{t.created_date}</td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 py-1 px-2.5 text-[11px] font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
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

export default AdminSupport;
