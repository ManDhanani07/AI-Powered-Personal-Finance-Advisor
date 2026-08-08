import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  Globe,
  Laptop,
  KeyRound,
  X,
  CheckCircle2,
  Trash2,
  Lock,
} from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_SESSIONS = [
  {
    id: 's1',
    device: 'Chrome on Windows 11',
    ip: '103.21.124.98',
    location: 'Mumbai, India',
    current: true,
    lastActive: 'Active now',
  },
  {
    id: 's2',
    device: 'Safari on iPhone 15 Pro',
    ip: '49.36.192.45',
    location: 'Bengaluru, India',
    current: false,
    lastActive: '2 hours ago',
  },
  {
    id: 's3',
    device: 'Firefox on macOS Sonoma',
    ip: '157.33.20.11',
    location: 'Delhi, India',
    current: false,
    lastActive: '3 days ago',
  },
];

export const SecuritySuite = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);

  const handle2FAToggle = () => {
    if (!is2FAEnabled) {
      setIs2FAModalOpen(true);
    } else {
      setIs2FAEnabled(false);
      toast.info('Two-Factor Authentication disabled.');
    }
  };

  const handleVerify2FA = () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit authenticator code');
      return;
    }
    setIs2FAEnabled(true);
    setIs2FAModalOpen(false);
    setVerificationCode('');
    toast.success('Two-Factor Authentication (2FA) successfully enabled!', { icon: '🔐' });
  };

  const handleRevokeSession = (sessionId, device) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success(`Revoked session for ${device}`);
  };

  return (
    <div className="space-y-6">
      {/* 2FA Authenticator Banner */}
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                Two-Factor Authentication (2FA)
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  is2FAEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure your wealth account with Google Authenticator or Authy TOTP.
            </p>
          </div>
        </div>

        <button
          onClick={handle2FAToggle}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all ${
            is2FAEnabled
              ? 'border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
              : 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white hover:from-primary-600 hover:to-indigo-700'
          }`}
        >
          {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>

      {/* Active Login Sessions Table */}
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              Active Device Sessions
            </h4>
            <p className="text-xs text-slate-400">
              Manage devices currently authenticated into your account.
            </p>
          </div>
          <button
            onClick={() => {
              setSessions(sessions.filter((s) => s.current));
              toast.success('Revoked all other active sessions!');
            }}
            className="text-xs font-bold text-rose-500 hover:underline"
          >
            Revoke All Other Sessions
          </button>
        </div>

        <div className="divide-y divide-border-subtle">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="py-3.5 flex items-center justify-between text-xs transition-colors hover:bg-bg-elevated/40 px-2 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-bg-elevated text-slate-400">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-slate-900 dark:text-white">{session.device}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-extrabold text-[9px] uppercase">
                        Current Device
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    IP: {session.ip} • {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>

              {!session.current && (
                <button
                  onClick={() => handleRevokeSession(session.id, session.device)}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold text-xs transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive 2FA QR Code Authenticator Modal */}
      <AnimatePresence>
        {is2FAModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIs2FAModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md rounded-3xl border border-border-strong bg-bg-surface p-6 shadow-2xl space-y-5 z-10 text-center"
              >
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center space-x-2 text-left">
                    <QrCode className="w-5 h-5 text-primary-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                      Setup 2FA Authenticator
                    </h3>
                  </div>
                  <button onClick={() => setIs2FAModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Scan this QR code using Google Authenticator, Authy, or 1Password to generate verification codes.
                </p>

                {/* Simulated QR Code Box */}
                <div className="p-4 rounded-2xl bg-white w-44 h-44 mx-auto flex items-center justify-center border border-border-strong shadow-inner">
                  <QrCode className="w-36 h-36 text-slate-950" />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-400">
                    Enter 6-Digit TOTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full rounded-2xl border border-border-strong bg-bg-elevated p-3 font-mono text-center text-xl font-black text-slate-900 dark:text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <button
                  onClick={handleVerify2FA}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                >
                  Verify & Activate 2FA
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecuritySuite;
