import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import SocialLoginButtons from './SocialLoginButtons.jsx';
import { ROUTES } from '../../constants/index.js';

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

const BANKS = [
  { name: 'HDFC Bank', logo: '🏦' },
  { name: 'ICICI Bank', logo: '🏛️' },
  { name: 'State Bank of India', logo: '💳' },
  { name: 'Axis Bank', logo: '🏦' },
  { name: 'Zerodha Kite', logo: '📈' },
];

// Shared dark input class
const INPUT_BASE = 'block w-full rounded-xl border py-2 text-xs bg-[#09090B] text-white placeholder-slate-700 transition-all focus:outline-none focus:ring-2';
const INPUT_NORMAL = 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/10';
const INPUT_ERROR = 'border-rose-500/50 focus:ring-rose-500/15';
const LABEL_BASE = 'block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1';

export const RegisterForm = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState('professional');
  const [selectedBanks, setSelectedBanks] = useState(['HDFC Bank']);
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

  const goToStep3 = () => setStep(3);

  const toggleBankSelect = (bankName) => {
    setSelectedBanks((prev) =>
      prev.includes(bankName) ? prev.filter((b) => b !== bankName) : [...prev, bankName]
    );
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
      };
      await registerAuth(payload);
      toast.success('Account created successfully! Welcome to FinAdvisor.', { icon: '🎉' });
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Form Header */}
      <div className="mb-3 text-center">
        <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <UserPlus className="h-4 w-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-outfit">
          Create Free Account
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Step {step} of 3: {step === 1 ? 'Account Credentials' : step === 2 ? 'Personal Setup' : 'Bank Integration'}
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-2.5"
            >
              {/* Name Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={LABEL_BASE}>First Name</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="John"
                      autoComplete="given-name"
                      {...register('first_name', { required: 'Required' })}
                      className={`${INPUT_BASE} pl-9 pr-2.5 ${errors.first_name ? INPUT_ERROR : INPUT_NORMAL}`}
                    />
                  </div>
                  {errors.first_name && <p className="text-[10px] text-rose-400 mt-0.5">{errors.first_name.message}</p>}
                </div>

                <div>
                  <label className={LABEL_BASE}>Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    autoComplete="family-name"
                    {...register('last_name', { required: 'Required' })}
                    className={`${INPUT_BASE} px-3 ${errors.last_name ? INPUT_ERROR : INPUT_NORMAL}`}
                  />
                  {errors.last_name && <p className="text-[10px] text-rose-400 mt-0.5">{errors.last_name.message}</p>}
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
                    placeholder="john.doe@example.com"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' },
                    })}
                    className={`${INPUT_BASE} pl-9 pr-3 ${errors.email ? INPUT_ERROR : INPUT_NORMAL}`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-rose-400 mt-0.5">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className={LABEL_BASE}>Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register('password', {
                      required: 'Password is required',
                      validate: () => passedCount === 5 || 'Password must satisfy all requirements',
                    })}
                    className={`${INPUT_BASE} pl-9 pr-9 ${errors.password ? INPUT_ERROR : INPUT_NORMAL}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 hover:text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-rose-400 mt-0.5">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={LABEL_BASE}>Confirm Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register('confirm_password', {
                      required: 'Please confirm password',
                      validate: (v) => v === watchPassword || 'Passwords do not match',
                    })}
                    className={`${INPUT_BASE} pl-9 pr-9 ${errors.confirm_password ? INPUT_ERROR : INPUT_NORMAL}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 hover:text-slate-400"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-[10px] text-rose-400 mt-0.5">{errors.confirm_password.message}</p>}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={goToStep2}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Continue to Personal Setup</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <SocialLoginButtons />

              <p className="pt-1 text-center text-[11px] text-slate-500">
                Already have an account?{' '}
                <Link to={ROUTES.AUTH.LOGIN} className="font-semibold text-emerald-400 hover:text-emerald-300">
                  Sign in instead
                </Link>
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: PERSONAL SETUP ── */}
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
                <label className={LABEL_BASE}>Financial Persona / Occupation</label>
                <div className="grid grid-cols-1 gap-2">
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
                        className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500/60 bg-emerald-500/10 text-white shadow-sm'
                            : 'border-zinc-800 bg-[#09090B] text-slate-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`rounded-lg p-1.5 ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-zinc-800 text-slate-400'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{p.title}</p>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{p.desc}</p>
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

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-[#09090B] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={goToStep3}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white py-2 text-xs font-bold text-slate-950 hover:bg-slate-100"
                >
                  <span>Continue to Bank Sync</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: BANK INTEGRATION ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-3"
            >
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center">
                <div className="flex justify-center mb-1">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-xs font-bold text-white">RBI Account Aggregator (AA) Ready</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Select your primary accounts to auto-sync transactions safely via 256-bit AES encryption.
                </p>
              </div>

              <div>
                <label className={LABEL_BASE}>Select Your Financial Accounts</label>
                <div className="grid grid-cols-2 gap-2">
                  {BANKS.map((b) => {
                    const isSelected = selectedBanks.includes(b.name);
                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => toggleBankSelect(b.name)}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500/60 bg-emerald-500/10 text-white'
                            : 'border-zinc-800 bg-[#09090B] text-slate-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-sm">{b.logo}</span>
                        <span className="text-[11px] font-semibold flex-1 truncate">{b.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Final Submit */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-[#09090B] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
    </motion.div>
  );
};

export default RegisterForm;
