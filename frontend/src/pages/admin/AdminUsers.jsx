import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import AdminUserDetailModal from './AdminUserDetailModal.jsx';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search,
        status_filter: statusFilter,
        role_filter: roleFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: 15,
      });
      const payload = res?.data || res || {};
      setUsers(payload.items || []);
      setTotalPages(payload.total_pages || 1);
      setTotalCount(payload.total_count || 0);
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, statusFilter, roleFilter, sortBy, sortOrder, page]);

  const handleViewUser = async (userId) => {
    try {
      const detail = await adminService.getUserDetails(userId);
      setUserDetail(detail);
      setSelectedUserId(userId);
      setIsModalOpen(true);
    } catch {
      showToast.error('Failed to load user details.');
    }
  };

  const handleToggleStatus = async (userObj) => {
    const newStatus = !userObj.is_active;
    try {
      await adminService.updateUserStatus(userObj.id, newStatus);
      showToast.success(`User ${newStatus ? 'activated' : 'suspended'} successfully.`);
      loadUsers();
    } catch {
      showToast.error('Failed to update user status.');
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
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-xl">
          <span>Total Records: <strong className="text-white">{totalCount}</strong></span>
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
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="all">All Roles</option>
              <option value="USER">Standard User</option>
              <option value="ADMIN">Administrator</option>
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
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-300">{u.role}</span>
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
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          u.risk_level === 'High' ? 'bg-rose-500' : u.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleViewUser(u.id)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 transition-colors"
                          title="Inspect Account Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.is_active
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={u.is_active ? 'Suspend Account' : 'Activate Account'}
                        >
                          {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
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
      />
    </div>
  );
};

export default AdminUsers;
