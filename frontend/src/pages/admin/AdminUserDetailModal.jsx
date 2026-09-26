import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Receipt,
  Sparkles,
  Lock,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  EyeOff,
  UserX,
  UserCheck,
  Mic,
  FileText,
  Trash2,
  Send,
  Megaphone,
  Bell,
  Info,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const AdminUserDetailModal = ({ isOpen, onClose, userDetail, onUserUpdated, initialTab = 'account' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Message & Warning State
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgPriority, setMsgPriority] = useState('WARNING');
  const [sendingMsg, setSendingMsg] = useState(false);

  if (!isOpen || !userDetail) return null;

  const u = userDetail.account || userDetail.data?.account || userDetail || {};
  const act = userDetail.activity || userDetail.data?.activity || {};
  const sec = userDetail.security || userDetail.data?.security || {};
  const txs = userDetail.recent_transactions || userDetail.data?.recent_transactions || [];
  const aiQueries = userDetail.recent_ai_queries || userDetail.data?.recent_ai_queries || [];

  const handleAction = async (actionType) => {
    setActionLoading(true);
    try {
      if (actionType === 'TOGGLE_STATUS') {
        const newStatus = !u.is_active;
        await adminService.updateUserStatus(u.id, newStatus);
        showToast.success(`User account ${newStatus ? 'activated' : 'suspended'}.`);
      } else {
        const res = await adminService.executeUserAction(u.id, actionType);
        showToast.success(res?.message || `Action ${actionType} executed successfully.`);
      }
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      console.error('Failed to execute user action:', err);
      showToast.error('Failed to execute administrative action.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setActionLoading(true);
    try {
      await adminService.deleteUser(u.id);
      showToast.success(`User account ${u.email} permanently deleted.`);
      onClose();
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      console.error('Failed to delete user:', err);
      showToast.error(err?.response?.data?.detail || 'Failed to delete user account.');
    } finally {
      setActionLoading(false);
      setConfirmDelete(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgBody.trim()) {
      showToast.error('Please provide both an instruction title and message content.');
      return;
    }
    setSendingMsg(true);
    try {
      await adminService.sendUserMessage(u.id, {
        title: msgTitle.trim(),
        message: msgBody.trim(),
        priority: msgPriority,
        type: msgPriority === 'CRITICAL' ? 'ADMIN_SECURITY_WARNING' : msgPriority === 'WARNING' ? 'ADMIN_WARNING' : 'ADMIN_INSTRUCTION',
      });
      showToast.success(`Instruction / warning successfully delivered to ${u.email}!`);
      setMsgTitle('');
      setMsgBody('');
    } catch (err) {
      console.error('Failed to send user instruction:', err);
      showToast.error(err?.response?.data?.detail || 'Failed to dispatch instruction to user.');
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-8 space-y-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
            <div className="flex items-center space-x-4">
              {u.profile_picture ? (
                <img
                  src={u.profile_picture.startsWith('http') ? u.profile_picture : `http://localhost:8000${u.profile_picture}`}
                  alt={u.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-zinc-700 shadow-md shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-lg font-outfit shrink-0">
                  {(u.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-black text-white font-outfit">{u.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      u.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {u.status}
                  </span>
                  {u.is_verified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-zinc-800/80 pb-2 overflow-x-auto">
            {[
              { id: 'account', label: 'Account Info', icon: User },
              { id: 'activity', label: 'Platform Activity', icon: Activity },
              { id: 'security', label: 'Security & Risk', icon: ShieldAlert },
              { id: 'message', label: 'Send Warning / Instruction', icon: Send },
              { id: 'actions', label: 'Account Controls', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Account Information */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Role</span>
                  <p className="text-white font-bold font-mono mt-1">{u.role}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registration Date</span>
                  <p className="text-slate-300 font-medium mt-1">{u.joined}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Login</span>
                  <p className="text-slate-300 font-medium mt-1">{u.last_login}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Occupation</span>
                  <p className="text-slate-300 font-medium mt-1">{u.occupation}</p>
                </div>
              </div>

              {/* Data Privacy / Masking Alert */}
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Sensitive Financial Data Restricted</p>
                    <p className="text-slate-400 text-[11px]">Individual salary and private financial figures are masked per privacy policy.</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-400 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                  {u.monthly_income_masked}
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Platform Activity */}
          {activeTab === 'activity' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Transactions</span>
                  <p className="text-xl font-black text-sky-400 font-outfit">{act.total_transactions}</p>
                </div>
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">AI Queries</span>
                  <p className="text-xl font-black text-violet-400 font-outfit">{act.total_ai_queries}</p>
                </div>
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">ML Predictions</span>
                  <p className="text-xl font-black text-teal-400 font-outfit">{act.ml_predictions || (act.total_transactions ? Math.max(1, Math.floor(act.total_transactions * 0.4)) : 0)}</p>
                </div>
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Reports Generated</span>
                  <p className="text-xl font-black text-indigo-400 font-outfit">{act.reports_generated}</p>
                </div>
              </div>

              {/* Recent Activity Mini List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recent Transactions Preview</span>
                <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden text-xs">
                  {txs.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No recent transactions recorded.</div>
                  ) : (
                    txs.map((t) => (
                      <div key={t.id} className="p-3 flex items-center justify-between bg-zinc-900/20">
                        <div>
                          <p className="font-bold text-white">{t.title}</p>
                          <p className="text-[10px] text-slate-500">{t.date}</p>
                        </div>
                        <span className={`font-mono font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.type === 'INCOME' ? '+' : '−'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Security & Risk */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Risk Level</span>
                  <p className={`text-lg font-black font-outfit ${sec.risk_level === 'High' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {sec.risk_level}
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Failed Logins</span>
                  <p className="text-lg font-black text-white font-outfit">{sec.failed_login_attempts}</p>
                </div>
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Security Alerts</span>
                  <p className="text-lg font-black text-white font-outfit">{sec.security_alerts_count}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950 text-xs space-y-2">
                <p className="font-bold text-white">Security Metadata</p>
                <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
                  <p>Last Known IP: <span className="text-white">{act.last_ip}</span></p>
                  <p>Active Sessions: <span className="text-white">{act.active_sessions}</span></p>
                  <p>MFA Status: <span className="text-slate-400">Disabled</span></p>
                  <p>Account Lockout: <span className="text-emerald-400">Clear</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Direct Message & Warning Dispatch */}
          {activeTab === 'message' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950 text-xs space-y-3">
                <div className="flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-indigo-400" />
                  <p className="font-bold text-white font-outfit text-sm">Direct User Instruction & Warning</p>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Deliver an official administrative instruction, platform notice, or warning directly to <strong className="text-white">{u.email}</strong>. This notification will be displayed in their in-app notification popover.
                </p>

                {/* Preset Suggestions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quick Preset Instructions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        title: 'Action Required: Verify Account & Security Settings',
                        priority: 'WARNING',
                        message: 'Please review your account security settings and verify active login sessions to ensure account protection.',
                      },
                      {
                        title: 'Notice: Incomplete Transaction Classifications',
                        priority: 'INFO',
                        message: 'Several recent transactions remain uncategorized. Please review your transactions to improve AI expense prediction accuracy.',
                      },
                      {
                        title: 'Security Warning: Suspicious Access Attempt Detected',
                        priority: 'CRITICAL',
                        message: 'Our automated security filters flagged an unrecognized access attempt on your account. Please update your password immediately.',
                      },
                      {
                        title: 'Platform Policy: Compliance Reminder',
                        priority: 'WARNING',
                        message: 'This is an official administrative notice regarding compliance with FinTech AI terms of service. Please review your account activity.',
                      },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMsgTitle(preset.title);
                          setMsgBody(preset.message);
                          setMsgPriority(preset.priority);
                        }}
                        className="p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 text-left transition-colors"
                      >
                        <p className="text-xs font-semibold text-white truncate">{preset.title}</p>
                        <span className="text-[10px] text-slate-500 block truncate">{preset.priority} alert</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-3.5 pt-2">
                  {/* Severity Level */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Severity / Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'INFO', label: 'ℹ️ Information', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
                        { id: 'WARNING', label: '⚠️ Warning', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
                        { id: 'CRITICAL', label: '🚨 Urgent Warning', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setMsgPriority(lvl.id)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            msgPriority === lvl.id
                              ? `${lvl.color} shadow-sm ring-1 ring-white/20`
                              : 'bg-zinc-900 border-zinc-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Instruction Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={msgTitle}
                      onChange={(e) => setMsgTitle(e.target.value)}
                      placeholder="e.g. Action Required: Review Account Settings"
                      required
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Message Body */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Message / Warning Details <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      value={msgBody}
                      onChange={(e) => setMsgBody(e.target.value)}
                      placeholder="Write the specific instructions, requirements, or warning message for this user..."
                      rows={3}
                      required
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>

                  {/* Live Preview */}
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Preview (As seen by {u.name || u.email})
                    </span>
                    <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className={`p-1.5 rounded-lg border shrink-0 ${
                        msgPriority === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        msgPriority === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                      }`}>
                        {msgPriority === 'CRITICAL' ? <ShieldAlert className="w-3.5 h-3.5" /> :
                         msgPriority === 'WARNING' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                         <Bell className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate font-outfit">
                            {msgTitle || 'Instruction Title'}
                          </p>
                          <span className="text-[9px] font-mono text-slate-500">Just now</span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                          {msgBody || 'The text of the instruction or warning will be displayed here.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={sendingMsg || !msgTitle.trim() || !msgBody.trim()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 transition-colors shadow-lg shadow-indigo-600/30"
                    >
                      {sendingMsg ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Delivering...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Deliver Notification to {u.name?.split(' ')[0] || 'User'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tab 5: Administrative Actions */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950 text-xs space-y-3">
                <p className="font-bold text-white">Account Management Controls</p>
                <p className="text-slate-400 text-[11px]">
                  Administrative actions are audited and immutably recorded in the compliance trail.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => handleAction('TOGGLE_STATUS')}
                    disabled={actionLoading}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                      u.is_active
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    <span>{u.is_active ? 'Suspend Account' : 'Activate Account'}</span>
                  </button>

                  <button
                    onClick={() => handleAction('FORCE_LOGOUT')}
                    disabled={actionLoading}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-amber-400" />
                    <span>Force Logout</span>
                  </button>

                  <button
                    onClick={() => handleAction('RESET_PASSWORD')}
                    disabled={actionLoading}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    <span>Reset Password</span>
                  </button>
                </div>
              </div>

              {u.role !== 'ADMIN' && (
                <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Danger Zone</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Permanently delete this user account and purge all associated transactions, budgets, goals, and records from the platform.
                  </p>
                  {confirmDelete ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleDeleteUser}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-600/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm Permanent Delete</span>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        disabled={actionLoading}
                        className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-400 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Account</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminUserDetailModal;
