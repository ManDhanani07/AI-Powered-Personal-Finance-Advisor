import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  IndianRupee,
  MapPin,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { toast } from 'react-toastify';
import authService from '../../services/authService.js';

export const ProfileCard = ({ user, onEditClick, onVerifySuccess }) => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const isVerified = Boolean(user?.is_verified || user?.email_verified);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  const handleSendOtp = async () => {
    if (!user?.email) return;
    setSendingOtp(true);
    try {
      await authService.resendVerificationCode(user.email, 'SIGNUP');
      setShowOtpModal(true);
      toast.success(`Verification OTP sent to ${user.email}`);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code.');
      return;
    }
    setVerifyingOtp(true);
    try {
      await authService.verifyEmail(user.email, otp.trim());
      toast.success('Email successfully verified! ✓', { icon: '🛡️' });
      setShowOtpModal(false);
      if (onVerifySuccess) onVerifySuccess();
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const personalInfoItems = [
    {
      icon: User,
      label: 'First Name',
      value: user?.first_name || 'N/A',
      colorClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
    {
      icon: User,
      label: 'Last Name',
      value: user?.last_name || 'N/A',
      colorClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      icon: Mail,
      label: 'Email Address',
      value: user?.email || 'N/A',
      isEmail: true,
      colorClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    {
      icon: Phone,
      label: 'Phone Number',
      value: user?.phone || 'Not provided',
      colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      icon: Briefcase,
      label: 'Occupation',
      value: user?.occupation || 'Not specified',
      colorClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    },
    {
      icon: IndianRupee,
      label: 'Monthly Income',
      value: formatCurrency(user?.monthly_income || 0, user?.currency || 'INR'),
      highlight: true,
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      icon: MapPin,
      label: 'City & State',
      value: [user?.city, user?.state].filter(Boolean).join(', ') || 'Not specified',
      colorClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      icon: MapPin,
      label: 'Country',
      value: user?.country || 'India',
      colorClass: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-outfit">Personal Information</h3>
            <p className="text-xs text-slate-400">Your core identity details and contact information</p>
          </div>
          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-400 transition-all hover:bg-indigo-500/20 cursor-pointer active:scale-95"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {personalInfoItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 rounded-2xl border border-zinc-800/80 bg-black/40 p-4 transition-all hover:border-zinc-700/80"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </p>

                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-semibold truncate ${
                        item.highlight ? 'text-emerald-400 text-base font-mono' : 'text-slate-200'
                      }`}
                    >
                      {item.value}
                    </p>

                    {/* Email Verification Status Badge */}
                    {item.isEmail && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="h-3 w-3" />
                            ✓ Verified
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                              <AlertTriangle className="h-3 w-3" />
                              ⚠ Unverified
                            </span>
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={sendingOtp}
                              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 underline cursor-pointer"
                            >
                              {sendingOtp ? 'Sending...' : 'Verify Email'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Membership Card */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-outfit">Account Membership</h3>
              <p className="text-xs text-slate-400">Your tier privileges and subscription standing</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-950/20 to-black/40 space-y-1 hover:border-violet-500/40 transition-colors">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Plan</p>
            <p className="text-base font-black text-white font-outfit">Pro Member</p>
            <p className="text-[11px] text-violet-400 font-medium">Full AI Advisor Access</p>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-black/40 space-y-1 hover:border-emerald-500/40 transition-colors">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Plan Status</p>
            <p className="text-base font-black text-emerald-400 font-outfit">Active &amp; Good Standing</p>
            <p className="text-[11px] text-slate-400">Unlimited Predictions</p>
          </div>

          <div className="p-4 rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-950/20 to-black/40 space-y-1 hover:border-sky-500/40 transition-colors">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Member Since</p>
            <p className="text-base font-black text-white font-outfit">{memberSince}</p>
            <p className="text-[11px] text-sky-400">Continuous Protection</p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold font-outfit">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Verify Email Address</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              We sent a 6-digit verification code to <span className="font-mono text-emerald-400 font-bold">{user?.email}</span>. Please enter it below.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl border border-zinc-800 bg-black text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="text-xs text-slate-400 hover:text-emerald-400 cursor-pointer"
                >
                  {sendingOtp ? 'Resending...' : 'Resend code'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingOtp || otp.trim().length !== 6}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer disabled:opacity-50"
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify Now'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
