import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import apiClient from '../../api/client.js';
import { ROUTES, API_URLS } from '../../constants/index.js';

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveAuthState, isAuthenticated } = useAuth();

  // Extract email & purpose from location state, search params, or sessionStorage
  const stateData = location.state || {};
  const queryParams = new URLSearchParams(location.search);
  const email =
    stateData.email ||
    queryParams.get('email') ||
    sessionStorage.getItem('pending_verify_email') ||
    '';
  const maskedEmailProp = stateData.maskedEmail || '';
  const purpose =
    stateData.purpose ||
    queryParams.get('purpose') ||
    sessionStorage.getItem('pending_verify_purpose') ||
    'SIGNUP';

  // Persist email in sessionStorage for refresh resiliency
  useEffect(() => {
    if (email) {
      sessionStorage.setItem('pending_verify_email', email);
      sessionStorage.setItem('pending_verify_purpose', purpose);
    }
  }, [email, purpose]);

  // State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Timers
  const [expirySeconds, setExpirySeconds] = useState(600); // 10 minutes
  const [cooldownSeconds, setCooldownSeconds] = useState(60); // 60s resend cooldown

  const inputRefs = useRef([]);

  // Redirect if already authenticated and verified
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Expiry Timer countdown
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const interval = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [expirySeconds]);

  // Cooldown Timer countdown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Helper to format MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mask email fallback helper
  const getDisplayEmail = () => {
    if (maskedEmailProp) return maskedEmailProp;
    if (!email) return 'your email';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [local, domain] = parts;
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    return `${local[0]}${'•'.repeat(Math.min(6, local.length - 2))}${local.slice(-1)}@${domain}`;
  };

  // Handle Input Changes
  const handleOtpChange = (index, value) => {
    // Only accept numeric single characters
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanVal.slice(-1); // Take the last entered digit
    setOtp(newOtp);
    setError('');

    // Auto advance focus if a digit was entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits are entered, trigger verification
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && !newOtp.includes('')) {
      submitVerification(fullCode);
    }
  };

  // Handle Key Down (Backspace, Arrow keys)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous box and clear
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    const numericData = pastedData.replace(/\D/g, '').slice(0, 6);

    if (numericData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = numericData[i] || '';
      }
      setOtp(newOtp);
      setError('');

      // Focus appropriate input
      const targetIndex = Math.min(numericData.length, 5);
      inputRefs.current[targetIndex]?.focus();

      if (numericData.length === 6) {
        submitVerification(numericData);
      }
    }
  };

  // Submit OTP Verification
  const submitVerification = async (codeToVerify) => {
    const code = codeToVerify || otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please go back to registration.');
      return;
    }

    if (expirySeconds <= 0) {
      setError('This verification code has expired. Please click Resend Code below.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (purpose === 'PASSWORD_RESET') {
        const response = await apiClient.post(API_URLS.AUTH.VERIFY_RESET_OTP, {
          email: email.trim().toLowerCase(),
          otp: code,
        });

        if (response?.success) {
          setSuccessMsg('Code verified successfully! Redirecting to set new password...');
          const resetToken = response.data?.reset_token;
          setTimeout(() => {
            navigate(ROUTES.AUTH.RESET_PASSWORD, {
              replace: true,
              state: { email, resetToken },
            });
          }, 1000);
        } else {
          setError(response?.message || 'Invalid verification code.');
        }
      } else {
        // Sign-up email verification
        const response = await apiClient.post(API_URLS.AUTH.VERIFY_EMAIL, {
          email: email.trim().toLowerCase(),
          otp: code,
        });

        if (response?.success) {
          const authData = response.data;
          setSuccessMsg('Email verified successfully! Welcome to your AI Financial Workspace.');
          
          if (authData?.tokens && authData?.user) {
            saveAuthState(authData.tokens, authData.user);
          }

          sessionStorage.removeItem('pending_verify_email');
          sessionStorage.removeItem('pending_verify_purpose');

          setTimeout(() => {
            navigate(ROUTES.DASHBOARD, { replace: true });
          }, 1200);
        } else {
          setError(response?.message || 'Invalid verification code.');
        }
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        'Failed to verify code. Please double-check the digits and try again.';
      setError(msg);
      // Auto-clear OTP inputs on invalid attempt for smooth re-entry
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (cooldownSeconds > 0 || resending) return;
    if (!email) {
      setError('Email address is missing. Please return to registration.');
      return;
    }

    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await apiClient.post(API_URLS.AUTH.RESEND_CODE, {
        email: email.trim().toLowerCase(),
        purpose: purpose || 'SIGNUP',
      });

      if (response?.success) {
        setSuccessMsg('A fresh 6-digit verification code has been dispatched to your inbox.');
        setExpirySeconds(600); // Reset 10m countdown
        setCooldownSeconds(60); // Reset 60s cooldown
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(response?.message || 'Failed to resend code.');
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        'Unable to resend code right now. Please wait a moment and try again.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="relative w-full max-w-lg z-10">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80">
          
          {/* Top Brand & Badge */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to={purpose === 'PASSWORD_RESET' ? ROUTES.AUTH.FORGOT_PASSWORD : ROUTES.AUTH.REGISTER}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>{purpose === 'PASSWORD_RESET' ? 'Back to Forgot Password' : 'Change Email'}</span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>256-Bit SSL Secured</span>
            </div>
          </div>

          {/* Header Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
              <Mail className="w-8 h-8 animate-pulse" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              {purpose === 'PASSWORD_RESET' ? 'Reset Code Verification' : 'Verify Your Email'}
            </h1>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              We have sent a secure 6-digit verification code to:
            </p>
            <div className="mt-1.5 inline-block font-mono text-sm font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-lg">
              {getDisplayEmail()}
            </div>
          </div>

          {/* Alerts Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{successMsg}</div>
            </div>
          )}

          {/* 6-Digit OTP Inputs */}
          <form onSubmit={(e) => { e.preventDefault(); submitVerification(); }} className="space-y-6">
            <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{1}"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black font-mono rounded-xl bg-slate-950/80 border transition-all duration-200 outline-none
                    ${
                      digit
                        ? 'border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/15 bg-emerald-950/20'
                        : 'border-slate-800 text-white hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }
                    ${error ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''}
                  `}
                />
              ))}
            </div>

            {/* Expiry Countdown Tracker */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Code expires in:</span>
              </div>
              <span className={`font-mono font-bold ${expirySeconds < 60 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                {formatTime(expirySeconds)}
              </span>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6 || expirySeconds <= 0}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Code Section with 60s Cooldown */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400">
              <span>Didn't receive the verification code?</span>
              {cooldownSeconds > 0 ? (
                <span className="font-semibold text-slate-500 flex items-center gap-1.5 font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin text-slate-600" />
                  Resend code in {cooldownSeconds}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                </button>
              )}
            </div>

            <p className="mt-4 text-[11px] text-slate-500 leading-relaxed">
              Check your spam or promotions folder if you don't see the email in your inbox.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
