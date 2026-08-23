import React, { useState } from 'react';
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
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const AdminUserDetailModal = ({ isOpen, onClose, userDetail, onUserUpdated }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen || !userDetail) return null;

  const u = userDetail.account || {};
  const act = userDetail.activity || {};
  const sec = userDetail.security || {};
  const txs = userDetail.recent_transactions || [];
  const aiQueries = userDetail.recent_ai_queries || [];

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
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-lg font-outfit">
                {(u.name || 'U').charAt(0).toUpperCase()}
              </div>
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
          <div className="flex items-center space-x-2 border-b border-zinc-800/80 pb-2">
            {[
              { id: 'account', label: 'Account Information', icon: User },
              { id: 'activity', label: 'Platform Activity', icon: Activity },
              { id: 'security', label: 'Security & Risk', icon: ShieldAlert },
              { id: 'actions', label: 'Administrative Actions', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
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
                    <p className="text-slate-400 text-[11px]">Individual salary and bank account numbers are masked per GDPR/Fintech compliance.</p>
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
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Voice Interactions</span>
                  <p className="text-xl font-black text-teal-400 font-outfit">{act.voice_queries}</p>
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

          {/* Tab 4: Administrative Actions */}
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
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminUserDetailModal;
