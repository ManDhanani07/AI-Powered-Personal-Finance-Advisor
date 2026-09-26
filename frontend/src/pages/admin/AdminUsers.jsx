import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Send,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import AdminUserDetailModal from './AdminUserDetailModal.jsx';
import AdminBroadcastModal from './AdminBroadcastModal.jsx';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState('account');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTargetUser, setBroadcastTargetUser] = useState(null);
  const [inspectLoadingId, setInspectLoadingId] = useState(null);

  const getPlanTier = (u) => {
    if (u.plan_tier) return u.plan_tier;
    if ((u.transactions_count || 0) > 40) return 'Pro';
    return 'Free';
  };



  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search,
        status_filter: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: 15,
      });
      const payload = res?.data || res || {};
      const platformUsers = (payload.items || []).filter((u) => u.role !== 'ADMIN');
      setUsers(platformUsers);
      setTotalPages(payload.total_pages || 1);
      setTotalCount(payload.total_count || platformUsers.length);
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, statusFilter, sortBy, sortOrder, page]);

  const handleViewUser = async (userId, initialTab = 'account') => {
    setInspectLoadingId(userId);
    setModalInitialTab(initialTab);
    try {
      const res = await adminService.getUserDetails(userId);
      const detail = res?.data || res || {};
      setUserDetail(detail);
      setSelectedUserId(userId);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to load user details:', err);
      showToast.error('Failed to load user details.');
    } finally {
      setInspectLoadingId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-[1920px] w-full mx-auto">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div>
          <h2 className="text-base font-black text-white font-outfit">User Directory & Account Governance</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor identities, verify accounts, evaluate risk levels and enforce access controls.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl">
            <span>Total: <strong className="text-white">{totalCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name, email or ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
              <option value="blocked">Blocked Only</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>

          {/* Plan Tier Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-500">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="all">All Plans</option>
              <option value="Free">Free Tier</option>
              <option value="Pro">Pro Plan</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="created_at">Joined Date</option>
              <option value="last_login">Last Active</option>
              <option value="first_name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-xs text-slate-500 font-mono">Loading user directory…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No platform users match the specified criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Plan Tier</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4 text-center">Tx Count</th>
                  <th className="py-3.5 px-4 text-center">AI Queries</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {users
                  .filter((u) => u.role !== 'ADMIN' && (planFilter === 'all' || getPlanTier(u) === planFilter))
                  .map((u) => {
                    const tier = getPlanTier(u);
                    return (
                      <tr key={u.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {u.profile_picture ? (
                              <img
                                src={u.profile_picture.startsWith('http') ? u.profile_picture : `http://localhost:8000${u.profile_picture}`}
                                alt={u.name}
                                className="w-8 h-8 rounded-xl object-cover border border-zinc-800 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                                {(u.name || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{u.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] text-slate-300">{u.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              tier === 'Enterprise'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : tier === 'Pro'
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : 'bg-zinc-800 text-slate-400 border-zinc-700/60'
                            }`}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            {tier}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.is_verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{u.joined}</td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{u.last_active}</td>
                        <td className="py-3 px-4 text-center font-mono text-sky-400 font-bold">{u.transactions_count}</td>
                        <td className="py-3 px-4 text-center font-mono text-violet-400 font-bold">{u.ai_queries_count}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              u.risk_level === 'High'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : u.risk_level === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.risk_level === 'High'
                                  ? 'bg-rose-500'
                                  : u.risk_level === 'Medium'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            {u.risk_level}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              u.is_active
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => {
                                setBroadcastTargetUser(u);
                                setIsBroadcastOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-amber-400 transition-colors"
                              title="Send Notice / Warning to this User"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleViewUser(u.id, 'account')}
                              disabled={inspectLoadingId === u.id}
                              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-indigo-400 transition-colors disabled:opacity-50"
                              title="Inspect Account Details"
                            >
                              {inspectLoadingId === u.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-zinc-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {users.length} of {totalCount} users</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-white">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Drawer / Modal */}
      <AdminUserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userDetail={userDetail}
        onUserUpdated={loadUsers}
        initialTab={modalInitialTab}
      />

      {/* Broadcast & User Notice Modal */}
      <AdminBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => {
          setIsBroadcastOpen(false);
          setBroadcastTargetUser(null);
        }}
        onBroadcastSent={loadUsers}
        preselectedUser={broadcastTargetUser}
      />


    </div>
  );
};

export default AdminUsers;
