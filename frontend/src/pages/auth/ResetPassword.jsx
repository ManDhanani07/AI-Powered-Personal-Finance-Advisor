import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShieldCheck } from 'lucide-react';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm.jsx';
import { ThemeToggle } from '../../components/common/ThemeToggle.jsx';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

export const ResetPassword = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-indigo-950/40 via-bg-base to-purple-950/30 text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent-500/15 blur-[100px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full py-2">
        <Link to={ROUTES.HOME} className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight font-outfit">
            {APP_CONSTANTS.APP_NAME}
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8">
        <ResetPasswordForm />
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-500 dark:text-slate-400 py-4 flex items-center justify-center space-x-2">
        <span>© {new Date().getFullYear()} {APP_CONSTANTS.APP_NAME}.</span>
        <span className="flex items-center space-x-1 text-emerald-500 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted Auth</span>
        </span>
      </footer>
    </div>
  );
};

export default ResetPassword;
