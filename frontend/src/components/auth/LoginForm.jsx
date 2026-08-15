import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import SocialLoginButtons from './SocialLoginButtons.jsx';
import { ROUTES } from '../../constants/index.js';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: { email: '', password: '', remember_me: false },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await login(data.email, data.password, data.remember_me);
      toast.success('Welcome back! Successfully authenticated.', { icon: '🔐' });
      if (data.email.toLowerCase() === 'fintech0707@gmail.com') {
        navigate('/admin/overview');
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (error) {
      const errMsg = error.message || 'Invalid email or password. Please check your credentials.';
      if (errMsg.includes('EMAIL_NOT_VERIFIED') || errMsg.includes('verify your email')) {
        toast.info('Please verify your email to activate your account.', { icon: '✉️' });
        navigate(ROUTES.AUTH.VERIFY_EMAIL, {
          state: { email: data.email, purpose: 'SIGNUP' },
        });
        return;
      }
      setLoginError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black text-white tracking-tight font-outfit leading-tight">
          Sign in
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Access your AI Wealth OS workspace.{' '}
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {loginError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/8 p-3.5 flex items-start space-x-3 text-xs text-rose-400 font-semibold"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address format',
                },
              })}
              className={`block w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm bg-[#09090B] text-white placeholder-slate-700 transition-all focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-rose-500/50 focus:ring-rose-500/15'
                  : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/10'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Password
            </label>
            <Link
              to={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
              className={`block w-full rounded-xl border py-2.5 pl-11 pr-12 text-sm bg-[#09090B] text-white placeholder-slate-700 transition-all focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-rose-500/50 focus:ring-rose-500/15'
                  : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/10'
              }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-600 hover:text-slate-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-400 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2.5">
          <input
            id="remember_me"
            type="checkbox"
            {...register('remember_me')}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
          />
          <label htmlFor="remember_me" className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
            Keep me signed in for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 py-3.5 px-4 text-sm font-bold text-slate-950 shadow-md transition-all hover:scale-[1.005] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 text-slate-700" />
            </>
          )}
        </button>

        {/* Social Login */}
        <SocialLoginButtons />
      </form>
    </motion.div>
  );
};

export default LoginForm;
