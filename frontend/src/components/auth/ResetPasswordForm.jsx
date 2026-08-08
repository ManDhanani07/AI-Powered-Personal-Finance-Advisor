import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, ArrowRight, Loader2, ArrowLeft, Check, X, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import PasswordInput from './PasswordInput.jsx';
import { ROUTES } from '../../constants/index.js';

export const ResetPasswordForm = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tokenParam = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      token: tokenParam,
      new_password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (tokenParam) {
      setValue('token', tokenParam);
    }
  }, [tokenParam, setValue]);

  const watchPassword = watch('new_password', '');

  const passwordCriteria = useMemo(() => {
    return {
      length: watchPassword.length >= 8,
      uppercase: /[A-Z]/.test(watchPassword),
      lowercase: /[a-z]/.test(watchPassword),
      number: /[0-9]/.test(watchPassword),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(watchPassword),
    };
  }, [watchPassword]);

  const passedCount = useMemo(() => {
    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await resetPassword(data.token, data.new_password);
      toast.success('Password reset successfully! Please sign in with your new password.', { icon: '🔑' });
      navigate(ROUTES.AUTH.LOGIN);
    } catch (error) {
      toast.error(error.message || 'Password reset failed. Please check your reset token.');
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
      <div className="rounded-3xl border border-border-strong bg-bg-surface/90 p-8 shadow-2xl backdrop-blur-2xl">
        {/* Form Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">
            Set New Password
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Create a secure new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Reset Token Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Reset Token
            </label>
            <input
              type="text"
              placeholder="Paste 32-character reset token"
              {...register('token', { required: 'Reset token is required' })}
              className={`block w-full rounded-xl border py-2.5 px-4 font-mono text-xs transition-all focus:outline-none focus:ring-2 bg-bg-surface text-slate-900 dark:text-white ${
                errors.token ? 'border-rose-500' : 'border-border-strong focus:ring-primary-500/20'
              }`}
            />
            {errors.token && <p className="text-[11px] text-rose-500">{errors.token.message}</p>}
          </div>

          {/* New Password */}
          <PasswordInput
            id="new_password"
            name="new_password"
            label="New Password"
            register={register}
            error={errors.new_password}
            validation={{
              required: 'New password is required',
              validate: () => passedCount === 5 || 'Password must satisfy all strength criteria',
            }}
          />

          {/* Real-Time Password Requirement Checklist Validation */}
          {watchPassword && (
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated/60 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">Security Requirements</span>
                <span className={passedCount === 5 ? 'text-emerald-500' : 'text-amber-500'}>
                  {passedCount}/5 Satisfied
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-full rounded-full transition-all duration-300 ${
                      level <= passedCount
                        ? passedCount === 5
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                        : 'bg-border-strong'
                    }`}
                  />
                ))}
              </div>

              {/* Requirement Checklist with Green Morph Icons */}
              <div className="space-y-1.5 pt-1 text-xs">
                {[
                  { key: 'length', label: 'At least 8 characters long' },
                  { key: 'uppercase', label: 'At least one uppercase letter (A-Z)' },
                  { key: 'lowercase', label: 'At least one lowercase letter (a-z)' },
                  { key: 'number', label: 'At least one number (0-9)' },
                  { key: 'special', label: 'At least one special character (!@#$%^&*)' },
                ].map((item) => {
                  const isPassed = passwordCriteria[item.key];
                  return (
                    <div
                      key={item.key}
                      className={`flex items-center space-x-2 transition-all ${
                        isPassed ? 'text-emerald-500 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <motion.div
                        initial={false}
                        animate={{ scale: isPassed ? [1, 1.25, 1] : 1 }}
                        transition={{ duration: 0.2 }}
                        className={`p-0.5 rounded-full flex items-center justify-center ${
                          isPassed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-border-strong text-slate-500'
                        }`}
                      >
                        {isPassed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </motion.div>
                      <span className="text-[11px]">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confirm New Password */}
          <PasswordInput
            id="confirm_password"
            name="confirm_password"
            label="Confirm New Password"
            register={register}
            error={errors.confirm_password}
            validation={{
              required: 'Please confirm your new password',
              validate: (val) => val === watchPassword || 'Passwords do not match',
            }}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 via-indigo-600 to-accent-500 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

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

export default ResetPasswordForm;
