import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/index.js';

export const ForgotPasswordForm = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await forgotPassword(data.email);
      toast.success('6-digit reset code sent to your email! Please enter it below.', { icon: '✉️' });
      navigate(ROUTES.AUTH.VERIFY_EMAIL, {
        state: {
          email: data.email,
          purpose: 'PASSWORD_RESET',
        },
      });
    } catch (error) {
      const errMsg = error.message || '';
      // If a code was already sent recently and cooldown is active, redirect to verification page so user can enter the code they have
      if (errMsg.includes('seconds') || errMsg.includes('code')) {
        toast.info('A reset code was already sent to your email. Enter it below to proceed.', { icon: '✉️' });
        navigate(ROUTES.AUTH.VERIFY_EMAIL, {
          state: {
            email: data.email,
            purpose: 'PASSWORD_RESET',
          },
        });
      } else {
        toast.error(errMsg || 'Failed to request password reset code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl">
        {/* Form Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-outfit">
            Forgot Password?
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Enter your registered email address to receive a secure 6-digit password reset code
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Registered Email
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
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
                className={`block w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 bg-slate-950/80 text-white placeholder-slate-600 ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 py-3.5 px-4 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                <span>Sending Reset Code...</span>
              </>
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm;
