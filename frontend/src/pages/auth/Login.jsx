import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm.jsx';
import { ThemeToggle } from '../../components/common/ThemeToggle.jsx';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

export const Login = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-bg-base text-slate-900 dark:text-slate-100 font-sans">
      {/* LEFT: Dynamic Visual Feature Canvas */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-bg-base border-r border-border-subtle">
        {/* Glow Blobs */}
        <div className="pointer-events-none absolute top-10 left-10 w-96 h-96 rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent-500/20 blur-[100px]" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight font-outfit">
              {APP_CONSTANTS.APP_NAME}
            </span>
          </Link>
        </div>

        {/* Middle Feature Showcase Canvas */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-400 text-xs font-extrabold uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Financial Intelligence</span>
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-outfit">
            Master Your Wealth With Automated Precision.
          </h1>

          <p className="mt-4 text-slate-300 text-sm leading-relaxed">
            Connect your accounts securely, get AI-powered spending insights, and receive real-time anomaly alerts.
          </p>

          {/* Floating Metric Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 rounded-3xl border border-border-strong bg-white/5 backdrop-blur-xl p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>Savings Rate Increased</span>
              </div>
              <span className="text-xs font-black text-white">+32.4% MoM</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 w-[78%]" />
            </div>
            <p className="text-[11px] text-slate-400">
              ₹48,200 saved this month across automated investment allocations.
            </p>
          </motion.div>

          {/* Bullet points */}
          <div className="mt-8 space-y-2 text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Bank Account Aggregator Regulated Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-primary-400" />
              <span>256-Bit Bank Grade Encryption</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>© 2026 {APP_CONSTANTS.APP_NAME}</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Vault</span>
          </span>
        </div>
      </div>

      {/* RIGHT: Auth Card Container */}
      <div className="relative flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
        <div className="flex items-center justify-between lg:justify-end space-x-4">
          <Link to={ROUTES.HOME} className="flex lg:hidden items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm font-outfit">{APP_CONSTANTS.APP_NAME}</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="my-auto py-8">
          <LoginForm />
        </div>

        <div className="text-center text-xs text-slate-400 lg:hidden">
          © 2026 {APP_CONSTANTS.APP_NAME}
        </div>
      </div>
    </div>
  );
};

export default Login;
