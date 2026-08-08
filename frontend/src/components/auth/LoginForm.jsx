import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import PasswordInput from './PasswordInput.jsx';
import RememberMeCheckbox from './RememberMeCheckbox.jsx';
import SocialLoginButtons from './SocialLoginButtons.jsx';
import { ROUTES } from '../../constants/index.js';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await login(data.email, data.password, data.remember_me);
      toast.success('Welcome back! Successfully authenticated.', { icon: '🔐' });
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      const errMsg = error.message || 'Invalid email or password. Please check your credentials.';
      setLoginError(errMsg);
      toast.error(errMsg);
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
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">
            Sign In to Account
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Access your AI personal finance advisor platform
          </p>
        </div>

        {/* Animated Error Alert */}
        <AnimatePresence>
          {loginError && (
            <motion.div
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', mb: 16 }}
              exit={{ opacity: 0, height: 0, mb: 0 }}
              className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start space-x-3 text-xs text-rose-600 dark:text-rose-400 font-semibold"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Address
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
                className={`block w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-slate-950 text-white placeholder-slate-500 ${
                  errors.email
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs font-medium text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            register={register}
            error={errors.password}
            validation={{
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            }}
          />

          {/* Options: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <RememberMeCheckbox register={register} />
            <Link
              to={ROUTES.AUTH.FORGOT_PASSWORD}
              className="font-semibold text-primary-500 hover:text-primary-400"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 via-indigo-600 to-accent-500 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Social Logins */}
          <div className="pt-2">
            <SocialLoginButtons />
          </div>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="font-bold text-primary-500 hover:text-primary-400"
          >
            Create account
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;
