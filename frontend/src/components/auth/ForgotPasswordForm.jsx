import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, KeyRound, ArrowLeft, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/index.js';

export const ForgotPasswordForm = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await forgotPassword(data.email);
      if (res?.data?.reset_token) {
        setGeneratedToken(res.data.reset_token);
        toast.success('Password reset token generated! Token displayed below.', { icon: '🔑' });
      } else {
        toast.info(res?.message || 'If an account exists, a reset link has been dispatched.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to request password reset token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTokenToClipboard = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      toast.success('Token copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <div className="rounded-3xl border border-border-strong bg-bg-surface/90 p-8 shadow-2xl backdrop-blur-2xl">
        {/* Form Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">
            Forgot Password?
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Enter your registered email address to receive password reset credentials
          </p>
        </div>

        {generatedToken ? (
          <div className="space-y-4 rounded-2xl border border-primary-500/30 bg-primary-500/10 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-400">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Password Reset Token Generated</span>
            </div>
            <p className="text-xs text-slate-300">
              Use this token to complete your password reset on the Reset Password page:
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-bg-surface p-3 font-mono text-xs font-medium text-slate-900 dark:text-white">
              <span className="truncate flex-1">{generatedToken}</span>
              <button
                type="button"
                onClick={copyTokenToClipboard}
                className="flex items-center gap-1 rounded-lg bg-bg-elevated px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate(`${ROUTES.AUTH.RESET_PASSWORD}?token=${generatedToken}`)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
            >
              <span>Proceed to Reset Password</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Registered Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address format',
                    },
                  })}
                  className={`block w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 bg-bg-surface text-slate-900 dark:text-white ${
                    errors.email ? 'border-rose-500' : 'border-border-strong focus:border-primary-500 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 via-indigo-600 to-accent-500 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Requesting Token...
                </>
              ) : (
                <>
                  <span>Generate Reset Token</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm;
