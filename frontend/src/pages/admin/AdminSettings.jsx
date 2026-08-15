import React from 'react';
import { Settings, ShieldCheck, Lock, UserCheck, Key, Server } from 'lucide-react';
import { showToast } from '../../components/common/ToastProvider.jsx';

const ADMIN_EMAIL = "fintech0707@gmail.com";

export const AdminSettings = () => {
  const handleSaveConfig = (e) => {
    e.preventDefault();
    showToast.success('Admin system settings updated successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Primary Admin Account Details */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-4">
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white font-outfit">Primary Admin Identity</h3>
            <p className="text-xs text-slate-400">Restricted administrative access account</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Primary Admin Email</label>
            <input
              type="email"
              disabled
              value={ADMIN_EMAIL}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs font-mono text-slate-300 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-500 mt-1">Primary admin email cannot be changed from the UI for security compliance.</p>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Auth Encryption</label>
              <input type="text" disabled value="Bcrypt (12 Rounds)" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs font-mono text-slate-400" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Session Timeout</label>
              <input type="text" disabled value="60 Minutes (JWT Expiry)" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs font-mono text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* System Security Configuration Form */}
      <form onSubmit={handleSaveConfig} className="p-5 rounded-2xl border border-zinc-800 bg-[#09090B] space-y-4">
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white font-outfit">Security & Platform Controls</h3>
            <p className="text-xs text-slate-400">System-wide rate limits and registration toggles</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-bold text-white">Public User Registration</p>
              <p className="text-[11px] text-slate-400">Allow new users to sign up for accounts</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-indigo-500 cursor-pointer" />
          </div>

          <div className="flex items-center justify-between py-1 border-t border-zinc-800">
            <div>
              <p className="font-bold text-white">AI Copilot Rate Limit</p>
              <p className="text-[11px] text-slate-400">Maximum Gemini AI queries per user per day</p>
            </div>
            <span className="font-mono text-indigo-400 font-bold">50 queries/day</span>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-zinc-800">
            <div>
              <p className="font-bold text-white">Account Lockout Policy</p>
              <p className="text-[11px] text-slate-400">Lock account after 5 consecutive failed logins</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-indigo-500 cursor-pointer" />
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button type="submit" className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-sm transition-colors">
            Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
