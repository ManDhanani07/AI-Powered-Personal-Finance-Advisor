import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  User,
  Phone,
  IndianRupee,
  ArrowRight,
  ArrowLeft,
  Loader2,
  UserPlus,
  Check,
  X,
  GraduationCap,
  Briefcase,
  Building2,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Crown,
  Zap,
} from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import SocialLoginButtons from './SocialLoginButtons.jsx';
import { ROUTES } from '../../constants/index.js';

const MEMBERSHIP_PLANS = [
  {
    id: 'starter',
    name: 'Starter Account',
    tierLabel: 'Free Forever',
    price: '₹0',
    period: 'forever',
    icon: Shield,
    badge: 'FREE',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    desc: 'Essential tracking for students & early career starters.',
    highlights: ['Manual & CSV Logging', 'Up to 3 Active Budgets', 'Standard Reports'],
  },
  {
    id: 'pro',
    name: 'Professional Wealth',
    tierLabel: 'Most Popular',
    price: '₹299',
    period: '/ month',
    trialNote: '14-Day Free Trial',
    icon: Crown,
    badge: 'RECOMMENDED',
    badgeColor: 'border-amber-500/50 text-amber-300 bg-amber-500/15',
    desc: 'Full AI Wealth OS with automated ML predictions & copilot.',
    highlights: ['Gemini AI Copilot', 'ML Expense Forecasting', 'Unlimited Budgets', 'Anomaly Alerts'],
  },
  {
    id: 'business',
    name: 'Business Suite & HNIs',
    tierLabel: 'Elite Tier',
    price: '₹799',
    period: '/ month',
    trialNote: '14-Day Free Trial',
    icon: Zap,
    badge: 'UNLIMITED',
    badgeColor: 'border-violet-500/50 text-violet-300 bg-violet-500/15',
    desc: 'Multi-portfolio tracking for business owners & family hubs.',
    highlights: ['Multi-Entity Family Hub', 'CA-Ready Tally Export', 'Priority AI Advisory'],
  },
];

const PERSONAS = [
  {
    id: 'student',
    title: 'Student / Learner',
    icon: GraduationCap,
    desc: 'Tracking allowance, subscriptions, and building early savings habits.',
    defaultIncome: '15000',
  },
  {
    id: 'professional',
    title: 'Working Professional',
    icon: Briefcase,
    desc: 'Salaried employee seeking tax optimization under Section 80C & New Regime.',
    defaultIncome: '85000',
  },
  {
    id: 'business',
    title: 'Freelancer / Business',
    icon: Building2,
    desc: 'Variable income management, GST expense tagging, and HNI wealth growth.',
    defaultIncome: '150000',
  },
];

// Shared dark input class
const INPUT_BASE = 'block w-full rounded-xl border py-2 text-xs bg-[#09090B] text-white placeholder-slate-700 transition-all focus:outline-none focus:ring-2';
const INPUT_NORMAL = 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/10';
const INPUT_ERROR = 'border-rose-500/50 focus:ring-rose-500/15';
const LABEL_BASE = 'block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1';

export const RegisterForm = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planParam = (searchParams.get('plan') || '').toLowerCase();
  const validPlans = ['starter', 'pro', 'business'];
  const defaultPlan = validPlans.includes(planParam) ? planParam : 'pro';

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [selectedPersona, setSelectedPersona] = useState('professional');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
      monthly_income: '85000',
    },
  });

  const watchPassword = watch('password', '');

  const passwordCriteria = useMemo(() => ({
    length: watchPassword.length >= 8,
    uppercase: /[A-Z]/.test(watchPassword),
    lowercase: /[a-z]/.test(watchPassword),
    number: /[0-9]/.test(watchPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(watchPassword),
  }), [watchPassword]);

  const passedCount = useMemo(() => Object.values(passwordCriteria).filter(Boolean).length, [passwordCriteria]);

  const goToStep2 = async () => {
    const valid = await trigger(['first_name', 'last_name', 'email', 'password', 'confirm_password']);
    if (valid) {
      if (passedCount < 5) {
        toast.warn('Please satisfy all password strength requirements before proceeding.');
        return;
      }
      setStep(2);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        monthly_income: parseFloat(data.monthly_income) || 0.0,
        occupation: selectedPersona,
        membership_tier: selectedPlan,
      };
      const res = await registerAuth(payload);
      toast.success('Verification code sent to your email! Please enter the 6-digit code.', { icon: '✉️' });
      navigate(ROUTES.AUTH.VERIFY_EMAIL, {
        state: {
          email: data.email,
          maskedEmail: res?.data?.email,
          purpose: 'SIGNUP',
        },
      });
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-3 text-center">
        <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <UserPlus className="h-4 w-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-outfit">
          {step === 1 ? 'Create Account' : step === 2 ? 'Choose Membership' : 'Financial Profile'}
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Step {step} of 3: {step === 1 ? 'Account Credentials' : step === 2 ? 'Select Membership Tier' : 'Personal Financial Setup'}
        </p>

        {/* Step Progress Dots */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-6 bg-emerald-500'
                  : s < step
                  ? 'w-4 bg-emerald-700'
                  : 'w-4 bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: ACCOUNT CREDENTIALS ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22 }}
              className="space-y-3"
            >
              {/* Google OAuth Instant Register */}
              <SocialLoginButtons />

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-[#121216] px-2 text-slate-600">or manual registration</span>
                </div>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={LABEL_BASE}>First Name</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Alex"
                      {...register('first_name', { required: 'First name is required' })}
                      className={`${INPUT_BASE} pl-9 pr-3 ${errors.first_name ? INPUT_ERROR : INPUT_NORMAL}`}
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className={LABEL_BASE}>Last Name</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Vance"
                      {...register('last_name', { required: 'Last name is required' })}
                      className={`${INPUT_BASE} pl-9 pr-3 ${errors.last_name ? INPUT_ERROR : INPUT_NORMAL}`}
                    />
                  </div>
                  {errors.last_name && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={LABEL_BASE}>Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="email"
                    placeholder="alex@company.com"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`${INPUT_BASE} pl-9 pr-3 ${errors.email ? INPUT_ERROR : INPUT_NORMAL}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-0.5 text-[10px] text-rose-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className={LABEL_BASE}>Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    {...register('password', {
                      required: 'Password is required',
                      validate: () => passedCount === 5 || 'Password does not meet all criteria',
                    })}
                    className={`${INPUT_BASE} pl-9 pr-9 ${errors.password ? INPUT_ERROR : INPUT_NORMAL}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 hover:text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Password Strength Checklist */}
                {watchPassword && (
                  <div className="mt-2 rounded-xl border border-zinc-800 bg-[#09090B] p-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500 uppercase tracking-widest">Strength</span>
                      <span className={passedCount === 5 ? 'text-emerald-400' : 'text-amber-400'}>
                        {passedCount}/5 Satisfied
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 h-1 w-full">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-full rounded-full transition-all duration-300 ${
                            lvl <= passedCount
                              ? passedCount === 5
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                              : 'bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        {passwordCriteria.length ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <X className="h-3 w-3 text-zinc-700" />
                        )}
                        <span className={passwordCriteria.length ? 'text-slate-300' : ''}>8+ chars</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        {passwordCriteria.uppercase ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <X className="h-3 w-3 text-zinc-700" />
                        )}
                        <span className={passwordCriteria.uppercase ? 'text-slate-300' : ''}>Uppercase (A-Z)</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        {passwordCriteria.lowercase ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <X className="h-3 w-3 text-zinc-700" />
                        )}
                        <span className={passwordCriteria.lowercase ? 'text-slate-300' : ''}>Lowercase (a-z)</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        {passwordCriteria.number ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <X className="h-3 w-3 text-zinc-700" />
                        )}
                        <span className={passwordCriteria.number ? 'text-slate-300' : ''}>Number (0-9)</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 col-span-2">
                        {passwordCriteria.special ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <X className="h-3 w-3 text-zinc-700" />
                        )}
                        <span className={passwordCriteria.special ? 'text-slate-300' : ''}>Special symbol (!@#$)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={LABEL_BASE}>Confirm Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    {...register('confirm_password', {
                      required: 'Please confirm password',
                      validate: (val) => val === watchPassword || 'Passwords do not match',
                    })}
                    className={`${INPUT_BASE} pl-9 pr-9 ${errors.confirm_password ? INPUT_ERROR : INPUT_NORMAL}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 hover:text-slate-400"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-0.5 text-[10px] text-rose-400">{errors.confirm_password.message}</p>
                )}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={goToStep2}
                disabled={passedCount < 5}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed mt-1 cursor-pointer"
              >
                <span>Continue to Choose Membership</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <p className="text-center text-[11px] text-slate-500 pt-1">
                Already have an account?{' '}
                <Link to={ROUTES.AUTH.LOGIN} className="font-semibold text-emerald-400 hover:text-emerald-300">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: MEMBERSHIP PLAN SELECTION ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-3"
            >
              <div>
                <label className={LABEL_BASE}>Select Your Membership Tier</label>
                <div className="space-y-2">
                  {MEMBERSHIP_PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative rounded-2xl border p-2.5 cursor-pointer transition-all duration-200 select-none ${
                          isSelected
                            ? 'border-emerald-500/80 bg-emerald-500/[0.08] shadow-[0_0_20px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/40'
                            : 'border-zinc-800/80 bg-[#09090B] hover:border-zinc-700 hover:bg-zinc-900/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl border ${
                              isSelected
                                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                                : 'border-zinc-800 bg-zinc-900 text-slate-400'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs font-black text-white font-outfit">{plan.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${plan.badgeColor}`}>
                                  {plan.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{plan.desc}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="flex items-baseline justify-end gap-1">
                              <span className="text-sm font-black text-white font-outfit">{plan.price}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{plan.period}</span>
                            </div>
                            {plan.trialNote && (
                              <span className="text-[9px] font-bold text-emerald-400 font-mono block">
                                {plan.trialNote}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Feature bullets */}
                        <div className="mt-2 pt-2 border-t border-zinc-800/60 flex flex-wrap gap-1.5">
                          {plan.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-300 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800"
                            >
                              <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                              <span>{h}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 p-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Check className="w-3 h-3 text-emerald-400" />
                    14-day free trial on Pro &amp; Business
                  </span>
                  <span className="text-slate-500 font-mono">No card required</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-[#09090B] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-zinc-800 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-slate-100 shadow-md cursor-pointer"
                >
                  <span>Continue with {MEMBERSHIP_PLANS.find((p) => p.id === selectedPlan)?.name || 'Plan'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: PERSONA & MONTHLY INCOME ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-3"
            >
              <div>
                <label className={LABEL_BASE}>Select Your Financial Profile</label>
                <div className="space-y-2">
                  {PERSONAS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedPersona === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPersona(p.id);
                          setValue('monthly_income', p.defaultIncome);
                        }}
                        className={`w-full flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500/60 bg-emerald-500/10 text-white'
                            : 'border-zinc-800 bg-[#09090B] text-slate-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`mt-0.5 rounded-lg p-1.5 ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-slate-400'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{p.title}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Income */}
              <div>
                <label className={LABEL_BASE}>Estimated Monthly Income (₹)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                    <IndianRupee className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="number"
                    placeholder="85000"
                    {...register('monthly_income', { required: 'Monthly income is required' })}
                    className={`${INPUT_BASE} pl-9 pr-3 ${errors.monthly_income ? INPUT_ERROR : INPUT_NORMAL}`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={LABEL_BASE}>Phone Number (Optional)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    {...register('phone')}
                    className={`${INPUT_BASE} pl-9 pr-3 ${INPUT_NORMAL}`}
                  />
                </div>
              </div>

              {/* Selected Plan Summary Banner */}
              <div className="rounded-xl border border-zinc-800 bg-[#121216] px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Plan: <span className="text-white font-bold">{MEMBERSHIP_PLANS.find(p => p.id === selectedPlan)?.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  Change Plan
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-[#09090B] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-zinc-800 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </form>
    </div>
  );
};

export default RegisterForm;
