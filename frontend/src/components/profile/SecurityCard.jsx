import React, { useState } from 'react';
import { KeyRound, ShieldAlert, LogOut, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal.jsx';
import DeleteAccountModal from './DeleteAccountModal.jsx';
import useAuth from '../../hooks/useAuth.js';
import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/index.js';

export const SecurityCard = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleLogoutAllDevices = async () => {
    toast.info('Revoking session tokens from all devices...', { icon: '🔒' });
    await logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  const lastLoginStr = user?.last_login
    ? new Date(user.last_login).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Active Session';

  return (
    <>
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security & Access Controls</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage account credentials, authentication, and session safety</p>
        </div>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-800/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Password Protection
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                Bcrypt Hashed & Encrypted
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-800/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Last Active Login
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {lastLoginStr}
              </p>
            </div>
          </div>
        </div>

        {/* Security Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/60"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Change Password</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Update account password regularly for maximum security</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Update</span>
          </button>

          <button
            type="button"
            onClick={handleLogoutAllDevices}
            className="w-full flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/60"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <LogOut className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Logout From All Devices</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Revoke all active refresh session tokens</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Revoke</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-200/80 bg-red-50/40 p-4 dark:border-red-950/80 dark:bg-red-950/20 space-y-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
            <ShieldAlert className="h-4 w-4" />
            <span>Danger Zone</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Permanently delete your user profile, financial records, and AI forecasts.
          </p>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Account
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default SecurityCard;
