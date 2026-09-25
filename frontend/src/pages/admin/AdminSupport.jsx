import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  RefreshCw,
  Loader2,
  MessageSquare,
  Send,
  X,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Reply / Detail Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('Resolved');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

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

  const handleOpenReplyModal = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.admin_reply || '');
    setNewStatus(ticket.status || 'Resolved');
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setReplyText('');
  };

  const handleSaveReply = async () => {
    if (!selectedTicket) return;
    setIsSubmittingReply(true);
    try {
      await adminService.updateSupportTicket(selectedTicket.id, {
        status: newStatus,
        admin_reply: replyText.trim(),
      });
      showToast.success(`Ticket ${selectedTicket.id} updated with response.`);
      handleCloseModal();
      loadTickets();
    } catch (err) {
      console.error('Failed to update ticket reply:', err);
      showToast.error('Failed to update ticket reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleQuickStatusChange = async (ticketId, statusVal) => {
    try {
      await adminService.updateSupportTicket(ticketId, { status: statusVal });
      showToast.success(`Ticket ${ticketId} status updated to ${statusVal}.`);
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
    const matchSearch =
      !search ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.toLowerCase().includes(search.toLowerCase()) ||
      t.issue?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const openCount = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status)).length;
  const resolvedCount = tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length;

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white font-outfit">Problem Reports & Support Inquiries</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review user problem reports, reply with solutions, and resolve platform issues.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {openCount} Open / Active
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {resolvedCount} Resolved
            </span>
          </div>
          <button
            onClick={loadTickets}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Refresh Reports</span>
          </button>
        </div>
      </div>

      {/* ── Filters Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ticket code, email, issue, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>

        <div className="flex items-center flex-wrap gap-3">
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
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4">Admin Reply</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredTickets.map((t) => {
                const isCrit = t.priority === 'Critical';
                const isHigh = t.priority === 'High';
                const isMed = t.priority === 'Medium';
                const hasReply = !!t.admin_reply;

                return (
                  <tr key={t.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{t.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white truncate max-w-[140px]">{t.user_name || t.user}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{t.user}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-300 truncate" title={t.issue || t.description}>
                      {t.issue || t.description}
                    </td>
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
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{t.created_date}</td>
                    <td className="py-3 px-4 max-w-[160px]">
                      {hasReply ? (
                        <span className="text-emerald-400 text-[11px] font-medium truncate block" title={t.admin_reply}>
                          ✓ {t.admin_reply}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Awaiting response</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                        className={`rounded-lg border py-1 px-2 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-zinc-600 ${
                          t.status === 'Resolved' || t.status === 'Closed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : t.status === 'In Progress'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        <option value="Open" className="bg-zinc-950 text-white">Open</option>
                        <option value="In Progress" className="bg-zinc-950 text-white">In Progress</option>
                        <option value="Resolved" className="bg-zinc-950 text-white">Resolved</option>
                        <option value="Closed" className="bg-zinc-950 text-white">Closed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenReplyModal(t)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold transition-colors"
                        title="View details & write reply to user"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Reply & Resolution Modal ── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#09090B] p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-black text-white font-outfit">
                  Respond to Ticket #{selectedTicket.id}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ticket Info Details */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Submitted by: <strong className="text-white">{selectedTicket.user_name || selectedTicket.user}</strong> ({selectedTicket.user})</span>
                <span className="font-mono">{selectedTicket.created_date}</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">{selectedTicket.issue}</p>
                {selectedTicket.description && selectedTicket.description !== selectedTicket.issue && (
                  <p className="text-slate-300 mt-1 leading-relaxed bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                    {selectedTicket.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {selectedTicket.category}
                </span>
                <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Priority: {selectedTicket.priority}
                </span>
              </div>
            </div>

            {/* Admin Reply Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-outfit">
                Official Support Reply / Resolution Notes:
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your explanation, fix instructions, or resolution notes here. The user will see this directly on their Support page."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Workflow Status Picker */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Update Status:</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReply}
                  disabled={isSubmittingReply}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingReply ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Notify User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
