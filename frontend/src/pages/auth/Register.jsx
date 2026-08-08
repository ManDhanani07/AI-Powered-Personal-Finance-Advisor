import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import RegisterForm from '../../components/auth/RegisterForm.jsx';
import { ThemeToggle } from '../../components/common/ThemeToggle.jsx';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

export const Register = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-bg-base text-slate-900 dark:text-slate-100 font-sans">
      {/* LEFT: Feature Visual Canvas */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-bg-base border-r border-border-subtle">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute top-10 right-10 w-96 h-96 rounded-full bg-accent-500/20 blur-[130px]" />
        <div className="pointer-events-none absolute bottom-10 left-10 w-80 h-80 rounded-full bg-primary-500/20 blur-[100px]" />

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

        {/* Center Feature Highlights */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Join 50,000+ Smart Investors</span>
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-outfit">
            Start Your Journey to Financial Freedom Today.
          </h1>

          <p className="mt-4 text-slate-300 text-sm leading-relaxed">
            Create your account in under 60 seconds. Experience real-time wealth aggregation, AI-powered insights, and Prophet ML cash forecasting.
          </p>

          <div className="mt-8 space-y-3.5 text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-border-subtle backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Automated Bank Aggregator Stream</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-border-subtle backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <span>Gemini AI Financial Copilot</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-border-subtle backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>Real-Time Overspending & Anomaly Detection</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>© 2026 {APP_CONSTANTS.APP_NAME}</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bank-Grade 256-Bit TLS</span>
          </span>
        </div>
      </div>

      {/* RIGHT: Multi-Step Registration Form */}
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
          <RegisterForm />
        </div>

        <div className="text-center text-xs text-slate-400 lg:hidden">
          © 2026 {APP_CONSTANTS.APP_NAME}
        </div>
      </div>
    </div>
  );
};

export default Register;
