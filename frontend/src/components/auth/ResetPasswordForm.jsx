import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowRight, Loader2, ArrowLeft, Check, X, ShieldAlert, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import PasswordInput from './PasswordInput.jsx';
import { ROUTES } from '../../constants/index.js';

export const ResetPasswordForm = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if session was already consumed or finished
  const wasAlreadyCompleted = sessionStorage.getItem('reset_flow_completed') === 'true';

  // Retrieve resetToken from location state, search params, or temporary sessionStorage
  const tokenParam =
    !wasAlreadyCompleted
      ? location.state?.resetToken ||
        searchParams.get('token') ||
        sessionStorage.getItem('pending_reset_token') ||
        ''
      : '';

  const emailParam =
    location.state?.email ||
    searchParams.get('email') ||
    sessionStorage.getItem('pending_verify_email') ||
    '';

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
    if (tokenParam && !wasAlreadyCompleted) {
      setValue('token', tokenParam);
      sessionStorage.setItem('pending_reset_token', tokenParam);
    }
  }, [tokenParam, setValue, wasAlreadyCompleted]);

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
    if (!data.token) {
      toast.error('This password reset session has expired. Please request a new code.');
      setIsCompleted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(data.token, data.new_password, emailParam);

      // Invalidate temporary token from storage and mark flow as completed
      sessionStorage.removeItem('pending_reset_token');
      sessionStorage.removeItem('pending_verify_email');
      sessionStorage.removeItem('pending_verify_purpose');
      sessionStorage.setItem('reset_flow_completed', 'true');
      setIsCompleted(true);

      toast.success('Password updated successfully! Redirecting to sign in...', { icon: '🔐' });

      setTimeout(() => {
        // Use replace: true so browser back button does not reopen this form
        navigate(ROUTES.AUTH.LOGIN, { replace: true });
      }, 1200);
    } catch (error) {
      toast.error(error.message || 'Password reset failed. Please request a new verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If token is missing, already consumed, or flow was completed -> render Enterprise Expired State
  if (!tokenParam || wasAlreadyCompleted || isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto"
      >
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white font-outfit">
            Session Expired
          </h2>

          <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            For your security, password reset links and verification sessions can only be used once and expire immediately after completion.
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('reset_flow_completed');
                navigate(ROUTES.AUTH.FORGOT_PASSWORD, { replace: true });
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 py-3.5 px-4 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Request New Reset Code</span>
            </button>

            <Link
              to={ROUTES.AUTH.LOGIN}
              replace
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 py-3 px-4 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

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
            Set New Password
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Create a secure new password for your account
          </p>
          {emailParam && (
            <div className="mt-2 inline-block font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-0.5 rounded-full">
              {emailParam}
            </div>
          )}
        </div>

        {/* Hidden token field - never exposed to user */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('token')} />

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
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">Security Requirements</span>
                <span className={passedCount === 5 ? 'text-emerald-400' : 'text-amber-400'}>
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
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                          : 'bg-amber-500'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-1.5 pt-1 text-[11px]">
                <div className="flex items-center gap-2 text-slate-400">
                  {passwordCriteria.length ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600" />
                  )}
                  <span className={passwordCriteria.length ? 'text-slate-200' : ''}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  {passwordCriteria.uppercase ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600" />
                  )}
                  <span className={passwordCriteria.uppercase ? 'text-slate-200' : ''}>Uppercase letter (A-Z)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  {passwordCriteria.lowercase ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600" />
                  )}
                  <span className={passwordCriteria.lowercase ? 'text-slate-200' : ''}>Lowercase letter (a-z)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  {passwordCriteria.number ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600" />
                  )}
                  <span className={passwordCriteria.number ? 'text-slate-200' : ''}>Numeric digit (0-9)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  {passwordCriteria.special ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600" />
                  )}
                  <span className={passwordCriteria.special ? 'text-slate-200' : ''}>Special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
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

          <button
            type="submit"
            disabled={isSubmitting || passedCount < 5 || !tokenParam}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 py-3.5 px-4 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
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

export default ResetPasswordForm;
