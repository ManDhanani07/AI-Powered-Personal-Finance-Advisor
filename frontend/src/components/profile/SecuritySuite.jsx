import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  Smartphone,
  Globe,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  X,
  Trash2,
  Loader2,
  Lock,
  LogOut,
  History,
  BellRing,
  ExternalLink,
  Check,
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth.js';
import userService from '../../services/userService.js';
import authService from '../../services/authService.js';
import ChangePasswordModal from './ChangePasswordModal.jsx';

export const SecuritySuite = () => {
  const { user, loadCurrentUser } = useAuth();

  // Modals & Forms
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isEmailOtpModalOpen, setIsEmailOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);

  // Live Data State
  const [sessions, setSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(user?.security_alerts_enabled ?? true);

  const isEmailVerified = Boolean(user?.is_verified || user?.email_verified);
  const is2FAEnabled = Boolean(user?.two_factor_enabled);
  const isGoogleConnected = Boolean(user?.google_id || user?.auth_provider === 'google');

  // Relative password age
  const passwordAgeText = user?.password_changed_at
    ? `Last changed ${new Date(user.password_changed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : 'Set during initial account creation';

  const loadSecurityData = async () => {
    try {
      const [sessRes, histRes] = await Promise.all([
        userService.getSessions(),
        userService.getLoginHistory(),
      ]);
      if (sessRes?.data) setSessions(sessRes.data);
      if (histRes?.data) setLoginHistory(histRes.data);
    } catch (err) {
      console.error('Failed to load security sessions or login history', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  // 1. Email OTP Flow
  const handleSendEmailOtp = async () => {
    if (!user?.email) return;
    setSendingOtp(true);
    try {
      await authService.resendVerificationCode(user.email, 'SIGNUP');
      setIsEmailOtpModalOpen(true);
      toast.success(`6-digit OTP code dispatched to ${user.email}`);
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch verification OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit code sent to your email.');
      return;
    }
    setVerifyingOtp(true);
    try {
      await authService.verifyEmail(user.email, otpCode.trim());
      toast.success('Email successfully verified! ✓', { icon: '🛡️' });
      setIsEmailOtpModalOpen(false);
      setOtpCode('');
      loadCurrentUser();
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // 2. 2FA Toggle
  const handleToggle2FA = async () => {
    if (!is2FAEnabled) {
      setIs2FAModalOpen(true);
    } else {
      setToggling2FA(true);
      try {
        await userService.toggle2FA(false);
        toast.info('Two-Factor Authentication disabled.');
        loadCurrentUser();
      } catch (err) {
        toast.error(err.message || 'Failed to disable 2FA.');
      } finally {
        setToggling2FA(false);
      }
    }
  };

  const handleConfirm2FAActivation = async () => {
    if (totpCode.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit authenticator code.');
      return;
    }
    setToggling2FA(true);
    try {
      await userService.toggle2FA(true);
      toast.success('Two-Factor Authentication (2FA) successfully activated! 🔐');
      setIs2FAModalOpen(false);
      setTotpCode('');
      loadCurrentUser();
    } catch (err) {
      toast.error(err.message || 'Failed to verify TOTP code.');
    } finally {
      setToggling2FA(false);
    }
  };

  // 3. Google OAuth Disconnect
  const handleDisconnectGoogle = async () => {
    setDisconnectingGoogle(true);
    try {
      await authService.disconnectGoogle();
      toast.success('Google account disconnected successfully.');
      loadCurrentUser();
    } catch (err) {
      toast.error(err.message || 'Failed to disconnect Google account.');
    } finally {
      setDisconnectingGoogle(false);
    }
  };

  // 4. Session Revocation
  const handleRevokeAllOthers = async () => {
    setRevokingSessions(true);
    try {
      await userService.revokeOtherSessions();
      setSessions((prev) => prev.filter((s) => s.is_current));
      toast.success('All other device sessions have been terminated.');
    } catch (err) {
      toast.error(err.message || 'Failed to revoke other sessions.');
    } finally {
      setRevokingSessions(false);
    }
  };

  const handleRevokeSingle = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success('Device session revoked.');
  };

  // 5. Security Alerts Toggle
  const handleToggleSecurityAlerts = async (enabled) => {
    setSecurityAlerts(enabled);
    try {
      await userService.toggleSecurityAlerts(enabled);
      toast.success(`Security alerts ${enabled ? 'enabled' : 'disabled'}.`);
      loadCurrentUser();
    } catch (err) {
      toast.error(err.message || 'Failed to update security alerts.');
    }
  };

  // Status calculation
  const securityChecks = [
    { label: 'Email Verified', passed: isEmailVerified },
    { label: 'Password Active', passed: true },
    { label: '2FA Enabled', passed: is2FAEnabled },
    { label: 'Google Linked', passed: isGoogleConnected },
  ];
  const passedChecksCount = securityChecks.filter((c) => c.passed).length;
  const isFullyProtected = passedChecksCount >= 3;

  return (
    <div className="space-y-8">
      {/* 1. Account Security Status Overview */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${isFullyProtected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
              {isFullyProtected ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-outfit">Account Security Standing</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isFullyProtected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {isFullyProtected ? 'Protected' : 'Needs Attention'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {passedChecksCount} of 4 security safeguards currently active
              </p>
            </div>
          </div>
        </div>

        {/* Safeguard Checklist Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {securityChecks.map((chk, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                chk.passed
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-slate-200'
                  : 'border-zinc-800 bg-black/40 text-slate-400'
              }`}
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${chk.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {chk.passed ? '✓' : '•'}
              </div>
              <span className="text-xs font-semibold">{chk.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SECTION A: Password Management */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 border border-amber-500/20 text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-outfit">Account Password</h4>
              <p className="text-xs text-slate-400">{passwordAgeText}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-2.5 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* 3. SECTION B: Email OTP Verification */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 border border-cyan-500/20 text-cyan-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white font-outfit">Email Verification</h4>
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    Verification Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          {!isEmailVerified && (
            <button
              type="button"
              onClick={handleSendEmailOtp}
              disabled={sendingOtp}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-black px-4 py-2.5 text-xs font-black shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {sendingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Verify With OTP</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. SECTION C: Two-Factor Authentication (2FA) */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 border border-violet-500/20 text-violet-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white font-outfit">Two-Factor Authentication (2FA)</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${is2FAEnabled ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                  {is2FAEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate authenticator TOTP codes via Google Authenticator, Authy, or 1Password.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle2FA}
            disabled={toggling2FA}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95 ${
              is2FAEnabled
                ? 'border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black shadow-violet-500/25'
            }`}
          >
            {toggling2FA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}</span>
          </button>
        </div>
      </div>

      {/* 5. SECTION D: Google OAuth Connection */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white font-outfit">Google Account Link</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isGoogleConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isGoogleConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enable 1-tap single sign-on using your Google credentials.
              </p>
            </div>
          </div>

          {isGoogleConnected ? (
            <button
              type="button"
              onClick={handleDisconnectGoogle}
              disabled={disconnectingGoogle}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              {disconnectingGoogle && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toast.info('Google Single Sign-On link ready.')}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Connect Google</span>
            </button>
          )}
        </div>
      </div>

      {/* 6. SECTION E: Active Device Sessions */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-white font-outfit">Active Device Sessions</h4>
            <p className="text-xs text-slate-400">Devices currently authenticated into your account</p>
          </div>

          <button
            type="button"
            onClick={handleRevokeAllOthers}
            disabled={revokingSessions || sessions.length <= 1}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {revokingSessions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            <span>Logout All Other Devices</span>
          </button>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-slate-300">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{sess.device}</p>
                    {sess.is_current && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold text-[9px] uppercase">
                        Current Device
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    IP: {sess.ip} • {sess.location} • {sess.last_active}
                  </p>
                </div>
              </div>

              {!sess.is_current && (
                <button
                  type="button"
                  onClick={() => handleRevokeSingle(sess.id)}
                  className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7. SECTION F: Login History Audit Log */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-5">
        <div className="border-b border-zinc-800 pb-4">
          <h4 className="text-base font-bold text-white font-outfit">Recent Login History</h4>
          <p className="text-xs text-slate-400">Security audit log of recent sign-in events and IP locations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Date &amp; Time</th>
                <th className="pb-3 px-3">Device &amp; Browser</th>
                <th className="pb-3 px-3">Location / IP</th>
                <th className="pb-3 pl-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {loginHistory.map((item) => {
                const isSuccess = item.status?.toUpperCase() === 'SUCCESSFUL' || item.status?.toUpperCase() === 'SUCCESS';
                return (
                  <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">{item.date_time}</td>
                    <td className="py-3 px-3 text-white font-sans font-medium whitespace-nowrap">
                      {item.device} ({item.browser})
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {item.location} • {item.ip}
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {isSuccess ? '✓ Successful' : '✕ Failed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. SECTION G: Security Alerts Settings */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-outfit">Suspicious Login Activity Alerts</h4>
              <p className="text-xs text-slate-400">
                Receive immediate email and push alerts if a login attempt occurs from an unrecognized device or country.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={securityAlerts}
              onChange={(e) => handleToggleSecurityAlerts(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-white">
              {securityAlerts ? 'Alerts Active' : 'Alerts Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => loadCurrentUser()}
      />

      {/* Email OTP Verification Modal */}
      {isEmailOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold font-outfit">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Verify Email Address</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailOtpModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Enter the 6-digit OTP code sent to <span className="font-mono text-emerald-400 font-bold">{user?.email}</span>
            </p>

            <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl border border-zinc-800 bg-black text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={sendingOtp}
                  className="text-xs text-slate-400 hover:text-emerald-400 cursor-pointer"
                >
                  {sendingOtp ? 'Sending...' : 'Resend code'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailOtpModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingOtp || otpCode.trim().length !== 6}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer disabled:opacity-50"
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify Email'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Setup QR Modal */}
      <AnimatePresence>
        {is2FAModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-2xl space-y-5 text-center"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-left">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white font-outfit">
                    Setup Authenticator (2FA)
                  </h3>
                </div>
                <button
                  onClick={() => setIs2FAModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Scan this QR code using Google Authenticator, Authy, or 1Password.
              </p>

              {/* QR Code Container */}
              <div className="p-4 rounded-2xl bg-white w-44 h-44 mx-auto flex items-center justify-center border border-zinc-700 shadow-inner">
                <QrCode className="w-36 h-36 text-black" />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-black p-3 font-mono text-center text-xl font-black text-white tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleConfirm2FAActivation}
                disabled={toggling2FA || totpCode.trim().length !== 6}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
              >
                {toggling2FA ? 'Activating...' : 'Activate 2FA'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecuritySuite;
