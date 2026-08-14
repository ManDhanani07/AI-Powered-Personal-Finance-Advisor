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
  Loader2,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import AdminUserDetailModal from './AdminUserDetailModal.jsx';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
        status_filter: statusFilter !== 'all' ? statusFilter : undefined,
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
  }, [search, statusFilter, page]);

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
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            <p className="text-xs text-slate-500 font-mono">Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No users match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-center">Tx</th>
                  <th className="py-3 px-4 text-center">Budgets</th>
                  <th className="py-3 px-4 text-center">Goals</th>
                  <th className="py-3 px-4 text-center">AI</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{u.joined}</td>
                    <td className="py-3 px-4 text-slate-400">{u.last_active}</td>
                    <td className="py-3 px-4 text-center font-mono text-indigo-400 font-bold">{u.transactions_count}</td>
                    <td className="py-3 px-4 text-center font-mono text-teal-400 font-bold">{u.budgets_count}</td>
                    <td className="py-3 px-4 text-center font-mono text-amber-400 font-bold">{u.goals_count}</td>
                    <td className="py-3 px-4 text-center font-mono text-violet-400 font-bold">{u.ai_queries_count}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          u.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleViewUser(u.id)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 transition-colors"
                          title="View Details"
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
                          title={u.is_active ? 'Suspend User' : 'Activate User'}
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
          <div className="p-3 border-t border-zinc-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {users.length} of {totalCount} users</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-white">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <AdminUserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userDetail={userDetail}
      />
    </div>
  );
};

export default AdminUsers;
