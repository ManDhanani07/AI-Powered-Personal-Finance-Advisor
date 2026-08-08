import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Loader2, ArrowLeft, X } from 'lucide-react';

export const GoogleOAuthModal = ({ isOpen, onClose, onSelectAccount }) => {
  const [loadingEmail, setLoadingEmail] = useState(null);
  const [customEmailMode, setCustomEmailMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const accounts = [
    {
      name: 'Man Dhanani',
      email: 'mandhanani536@gmail.com',
      avatarBg: 'bg-purple-600',
      initial: 'M',
    },
    {
      name: 'Charusat Student',
      email: '24aiml007@charusat.edu.in',
      avatarBg: 'bg-blue-600',
      initial: 'D',
    },
  ];

  const handleSelect = async (email) => {
    setLoadingEmail(email);
    try {
      await onSelectAccount(email);
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customEmail) {
      handleSelect(customEmail);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-[500px] rounded-3xl bg-[#111622] border border-slate-700/80 shadow-2xl text-white overflow-hidden"
        >
          {/* Official Google Header Bar */}
          <div className="px-6 py-3.5 border-b border-slate-800 bg-[#0d111a] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="text-sm font-semibold text-slate-200 font-outfit">Sign in with Google</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header / Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-inner flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-outfit leading-tight tracking-tight">
                  Choose an account
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  to continue to <span className="text-primary-400 font-semibold">AI Personal Finance Advisor</span>
                </p>
              </div>
            </div>

            {/* Account List */}
            <div className="space-y-2.5">
              {!customEmailMode ? (
                <>
                  {accounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleSelect(acc.email)}
                      disabled={loadingEmail !== null}
                      className="w-full p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/60 hover:border-primary-500/50 transition-all flex items-center justify-between text-left group cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-md flex-shrink-0`}>
                          {acc.initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                            {acc.name}
                          </p>
                          <p className="text-xs text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">{acc.email}</p>
                        </div>
                      </div>
                      {loadingEmail === acc.email && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => setCustomEmailMode(true)}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/60 hover:border-slate-600 transition-all flex items-center space-x-3.5 text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      Use another account
                    </span>
                  </button>
                </>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Enter Google Account</span>
                    <button
                      type="button"
                      onClick={() => setCustomEmailMode(false)}
                      className="text-xs text-primary-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  </div>

                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  />

                  <button
                    type="submit"
                    disabled={loadingEmail !== null || !customEmail}
                    className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loadingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In as {customEmail}</span>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Official Google Footer */}
          <div className="px-6 sm:px-8 py-3.5 border-t border-slate-800 bg-[#0d111a] text-center">
            <p className="text-[11px] text-slate-400 leading-normal">
              Before using this app, you can review AI Personal Finance Advisor&apos;s{' '}
              <a href="#" className="text-primary-400 font-semibold hover:underline">Privacy Policy</a> and{' '}
              <a href="#" className="text-primary-400 font-semibold hover:underline">Terms of Service</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoogleOAuthModal;
