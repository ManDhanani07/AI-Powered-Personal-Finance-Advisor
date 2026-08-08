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
  Landmark,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import PasswordInput from './PasswordInput.jsx';
import SocialLoginButtons from './SocialLoginButtons.jsx';
import { ROUTES } from '../../constants/index.js';

// Personas for Step 2
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

// Bank Link Prompts for Step 3
const BANKS = [
  { name: 'HDFC Bank', logo: '🏦' },
  { name: 'ICICI Bank', logo: '🏛️' },
  { name: 'State Bank of India', logo: '💳' },
  { name: 'Axis Bank', logo: '🏦' },
  { name: 'Zerodha Kite', logo: '📈' },
];

export const RegisterForm = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  // Multi-step state (1: Credentials, 2: Persona, 3: Bank Sync Prompt)
  const [step, setStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState('professional');
  const [selectedBanks, setSelectedBanks] = useState(['HDFC Bank']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({
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

  // Password strength criteria
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

  // Step 1 -> Step 2 validation
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

  // Step 2 -> Step 3
  const goToStep3 = () => {
    setStep(3);
  };

  const toggleBankSelect = (bankName) => {
    if (selectedBanks.includes(bankName)) {
      setSelectedBanks(selectedBanks.filter((b) => b !== bankName));
    } else {
      setSelectedBanks([...selectedBanks, bankName]);
    }
  };

  // Final Submission
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
      className="w-full max-w-lg mx-auto"
    >
      <div className="rounded-3xl border border-border-strong bg-bg-surface/90 p-8 shadow-2xl backdrop-blur-2xl">
        {/* Form Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">
            Create Free Account
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Step {step} of 3: {step === 1 ? 'Account Credentials' : step === 2 ? 'Persona Setup' : 'Bank Integration'}
          </p>

          {/* Step Progress Bar */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-10 bg-primary-500'
                    : s < step
                    ? 'w-6 bg-emerald-500'
                    : 'w-6 bg-border-strong'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* STEP 1: ACCOUNT CREDENTIALS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* First & Last Name Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      First Name
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="John"
                        {...register('first_name', { required: 'First name is required' })}
                        className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:outline-none focus:ring-2 bg-bg-surface text-slate-900 dark:text-white ${
                          errors.first_name ? 'border-rose-500' : 'border-border-strong focus:ring-primary-500/20'
                        }`}
                      />
                    </div>
                    {errors.first_name && <p className="text-[11px] text-rose-500">{errors.first_name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      {...register('last_name', { required: 'Last name is required' })}
                      className={`block w-full rounded-xl border py-2.5 px-3.5 text-sm transition-all focus:outline-none focus:ring-2 bg-bg-surface text-slate-900 dark:text-white ${
                        errors.last_name ? 'border-rose-500' : 'border-border-strong focus:ring-primary-500/20'
                      }`}
                    />
                    {errors.last_name && <p className="text-[11px] text-rose-500">{errors.last_name.message}</p>}
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm transition-all focus:outline-none focus:ring-2 bg-bg-surface text-slate-900 dark:text-white ${
                        errors.email ? 'border-rose-500' : 'border-border-strong focus:ring-primary-500/20'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
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
                    validate: () => passedCount === 5 || 'Password must satisfy all strength requirements',
                  }}
                />

                {/* Real-time Password Strength Meter */}
                {watchPassword && (
                  <div className="rounded-2xl border border-border-subtle bg-bg-elevated/60 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Password Strength</span>
                      <span className={passedCount === 5 ? 'text-emerald-500' : passedCount >= 3 ? 'text-amber-500' : 'text-rose-500'}>
                        {passedCount === 5 ? 'Strong ✨' : passedCount >= 3 ? 'Medium' : 'Weak'}
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
                                : passedCount >= 3
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                              : 'bg-border-strong'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-400">
                      <span className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-500" />} 8+ Characters
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.uppercase ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-500" />} Uppercase Letter
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.lowercase ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-500" />} Lowercase Letter
                      </span>
                      <span className={`flex items-center gap-1 ${passwordCriteria.number ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-500" />} Number (0-9)
                      </span>
                      <span className={`flex items-center gap-1 col-span-2 ${passwordCriteria.special ? 'text-emerald-500 font-bold' : ''}`}>
                        {passwordCriteria.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-slate-500" />} Special Character (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <PasswordInput
                  id="confirm_password"
                  name="confirm_password"
                  label="Confirm Password"
                  register={register}
                  error={errors.confirm_password}
                  validation={{
                    required: 'Please confirm your password',
                    validate: (val) => val === watchPassword || 'Passwords do not match',
                  }}
                />

                {/* Continue to Step 2 Button */}
                <button
                  type="button"
                  onClick={goToStep2}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  <span>Continue to Persona Setup</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <SocialLoginButtons />
              </motion.div>
            )}

            {/* STEP 2: PERSONA SELECTION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Your Financial Profile
                </p>

                <div className="space-y-3">
                  {PERSONAS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedPersona === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPersona(p.id);
                          setValue('monthly_income', p.defaultIncome);
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                            : 'border-border-strong bg-bg-elevated/60 hover:bg-bg-elevated'
                        }`}
                      >
                        <div className="flex items-start space-x-3.5">
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-primary-500 text-white' : 'bg-bg-surface text-slate-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{p.title}</p>
                              {isSelected && <Check className="w-4 h-4 text-primary-500" />}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Monthly Income Field */}
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Estimated Monthly Income (₹)
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="85000"
                      {...register('monthly_income')}
                      className="block w-full rounded-xl border border-border-strong bg-bg-surface py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Step 2 Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 rounded-2xl border border-border-strong bg-bg-elevated font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={goToStep3}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
                  >
                    Next: Bank Sync <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: BANK SYNC PROMPT */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-1">
                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Bank Account Aggregator Sync</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Select your primary accounts to enable instant automated transaction streaming.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {BANKS.map((b) => {
                    const isSelected = selectedBanks.includes(b.name);
                    return (
                      <div
                        key={b.name}
                        onClick={() => toggleBankSelect(b.name)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                            : 'border-border-strong bg-bg-elevated/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="flex items-center space-x-2 truncate">
                          <span>{b.logo}</span>
                          <span className="truncate">{b.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Final Submission Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 via-indigo-600 to-accent-500 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Completing Setup...
                      </>
                    ) : (
                      <>
                        <span>Connect & Complete Setup</span>
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Skip bank sync for now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="font-bold text-primary-500 hover:text-primary-400"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
