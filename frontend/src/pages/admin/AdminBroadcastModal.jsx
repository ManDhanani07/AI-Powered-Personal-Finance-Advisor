import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Megaphone,
  AlertTriangle,
  Info,
  ShieldAlert,
  Send,
  Loader2,
  Users,
  CheckCircle2,
  Sparkles,
  Bell,
  Search,
  User,
  Check,
  ChevronDown,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

const PRESET_TEMPLATES = [
  {
    title: 'Scheduled System Maintenance',
    priority: 'WARNING',
    type: 'Platform Announcement',
    message: 'The platform will undergo scheduled database and performance maintenance on Sunday from 02:00 AM to 04:00 AM IST. Some services may experience brief latency.',
  },
  {
    title: 'Account Verification & Security Review',
    priority: 'WARNING',
    type: 'Individual Warning',
    message: 'Please review your active login sessions and verify your security settings to safeguard your account against unauthorized access.',
  },
  {
    title: 'Security Advisory: Review Recent Sessions',
    priority: 'CRITICAL',
    type: 'Security Warning',
    message: 'We recommend verifying your recent active sessions and updating your password or two-factor authentication from your Security Settings page.',
  },
  {
    title: 'Action Required: Incomplete Transaction Classifications',
    priority: 'INFO',
    type: 'User Instruction',
    message: 'Several recent transactions remain uncategorized. Please review your transactions to improve AI expense prediction accuracy and budget metrics.',
  },
  {
    title: 'Platform Update: AI Advisory Enhancements',
    priority: 'INFO',
    type: 'Feature Announcement',
    message: 'We have updated the AI Financial Advisor copilot with faster query processing and deeper multi-month expense categorization.',
  },
  {
    title: 'Urgent: Suspicious Activity Detected',
    priority: 'CRITICAL',
    type: 'Security Warning',
    message: 'Our automated security filters flagged an unrecognized access attempt on your account. Please update your credentials immediately.',
  },
];

export const AdminBroadcastModal = ({ isOpen, onClose, onBroadcastSent, preselectedUser = null }) => {
  const [target, setTarget] = useState(preselectedUser ? 'Particular User' : 'All Users');
  const [selectedUser, setSelectedUser] = useState(preselectedUser);
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [priority, setPriority] = useState('INFO');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (preselectedUser) {
      setSelectedUser(preselectedUser);
      setTarget('Particular User');
    }
  }, [preselectedUser]);

  useEffect(() => {
    if (isOpen && target === 'Particular User' && userList.length === 0) {
      fetchUsers();
    }
  }, [isOpen, target]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await adminService.getUsers({ page_size: 100 });
      const items = (res?.items || res?.data?.items || []).filter((u) => u.role !== 'ADMIN');
      setUserList(items);
    } catch (err) {
      console.error('Failed to load user list for broadcast picker:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setPriority(tpl.priority);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast.error('Please provide both an announcement title and message content.');
      return;
    }

    if (target === 'Particular User' && !selectedUser) {
      showToast.error('Please select a particular user to receive this notice.');
      return;
    }

    setSending(true);
    try {
      if (target === 'Particular User') {
        await adminService.sendUserMessage(selectedUser.id, {
          title: title.trim(),
          message: message.trim(),
          priority,
          type:
            priority === 'CRITICAL'
              ? 'ADMIN_SECURITY_WARNING'
              : priority === 'WARNING'
              ? 'ADMIN_WARNING'
              : 'ADMIN_INSTRUCTION',
        });
        showToast.success(`Notice successfully delivered to ${selectedUser.name || selectedUser.email}!`);
      } else {
        const res = await adminService.broadcastMessage({
          title: title.trim(),
          message: message.trim(),
          priority,
          target,
          segment: target,
        });
        const count = res?.delivered_count ?? res?.data?.delivered_count ?? 'all';
        showToast.success(`Broadcast announcement successfully dispatched to ${count} users!`);
      }

      if (onBroadcastSent) onBroadcastSent();
      onClose();
      // Reset state
      setTitle('');
      setMessage('');
      if (!preselectedUser) {
        setSelectedUser(null);
        setTarget('All Users');
      }
    } catch (err) {
      console.error('Failed to dispatch notification:', err);
      showToast.error(err?.response?.data?.detail || 'Failed to dispatch notification.');
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = userList.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-outfit">Platform Broadcast & User Notice</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Send an official announcement, instruction, or warning to all users or a particular individual user.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={sending}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Preset Templates */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Quick Preset Templates
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 text-left transition-colors group flex items-start space-x-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{tpl.title}</p>
                    <span className="text-[10px] text-slate-500 block truncate">{tpl.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Target Audience & Severity Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Audience */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'All Users', label: 'All Users', icon: Users },
                    { id: 'Active Users', label: 'Active Only', icon: CheckCircle2 },
                    { id: 'Particular User', label: 'One User', icon: User },
                  ].map((aud) => {
                    const Icon = aud.icon;
                    const isSelected = target === aud.id;
                    return (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() => {
                          setTarget(aud.id);
                          if (aud.id === 'Particular User' && userList.length === 0) {
                            fetchUsers();
                          }
                        }}
                        className={`flex items-center justify-center space-x-1 p-2 rounded-xl text-[11px] font-bold border transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30'
                            : 'bg-zinc-900 border-zinc-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="truncate">{aud.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority / Warning Level */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Alert Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'INFO', label: 'Info', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
                    { id: 'WARNING', label: 'Warning', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
                    { id: 'CRITICAL', label: 'Urgent', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
                  ].map((lvl) => {
                    const isSelected = priority === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setPriority(lvl.id)}
                        className={`flex items-center justify-center p-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? `${lvl.color} shadow-sm ring-1 ring-white/20`
                            : 'bg-zinc-900 border-zinc-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Individual User Picker (when target === 'Particular User') */}
            {target === 'Particular User' && (
              <div className="p-3.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Select Particular User <span className="text-rose-400">*</span></span>
                  </label>
                  {selectedUser && (
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-200 underline font-semibold"
                    >
                      Change User
                    </button>
                  )}
                </div>

                {selectedUser ? (
                  /* Chosen User Card */
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-indigo-500/30">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0 font-outfit">
                        {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-white truncate font-outfit">
                            {selectedUser.name}
                          </p>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            selectedUser.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {selectedUser.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{selectedUser.email}</p>
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mr-1" />
                  </div>
                ) : (
                  /* User Search & Selection Combobox */
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search user by name or email…"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 bg-zinc-950/80">
                      {loadingUsers ? (
                        <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                          <span>Loading platform users…</span>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No matching users found.
                        </div>
                      ) : (
                        filteredUsers.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className="p-2.5 flex items-center justify-between hover:bg-indigo-600/10 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                {(u.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">
                              Select
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Notice Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  target === 'Particular User'
                    ? 'e.g. Action Required: Review Account Security Settings'
                    : 'e.g. Scheduled System Maintenance Notice'
                }
                maxLength={200}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Instruction / Message Content <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the full instructions or details to inform users..."
                rows={4}
                maxLength={1000}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
              />
              <span className="text-[10px] text-slate-500 float-right mt-1">
                {message.length} / 1000 chars
              </span>
            </div>

            {/* Live Preview */}
            <div className="p-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Recipient In-App Notification Preview{' '}
                {target === 'Particular User'
                  ? `(As seen by ${selectedUser ? selectedUser.name : 'Particular User'})`
                  : `(All ${target === 'Active Users' ? 'Active ' : ''}Recipients)`}
              </span>
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div
                  className={`p-2 rounded-xl border ${
                    priority === 'CRITICAL'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      : priority === 'WARNING'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  }`}
                >
                  {priority === 'CRITICAL' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : priority === 'WARNING' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white truncate font-outfit">
                      {title || 'Notice Title'}
                    </h5>
                    <span className="text-[10px] font-mono text-slate-500">Just now</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                    {message || 'Your message preview will appear here as users see it in their notification menu.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  sending ||
                  !title.trim() ||
                  !message.trim() ||
                  (target === 'Particular User' && !selectedUser)
                }
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 transition-colors shadow-lg shadow-indigo-600/30"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {target === 'Particular User'
                        ? `Dispatch to ${
                            selectedUser ? selectedUser.name?.split(' ')[0] || selectedUser.email : 'Particular User'
                          }`
                        : `Dispatch to ${target}`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminBroadcastModal;
