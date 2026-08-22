import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, X, Loader2, Check, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/authService.js';
import PasswordInput from '../auth/PasswordInput.jsx';

export const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

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

  const strengthLabel = useMemo(() => {
    if (passedCount <= 2) return { text: 'Weak', color: 'text-rose-400', bg: 'bg-rose-500' };
    if (passedCount <= 4) return { text: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500' };
    return { text: 'Strong (Optimal)', color: 'text-emerald-400', bg: 'bg-emerald-500' };
  }, [passedCount]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.changePassword(data.old_password, data.new_password);
      toast.success('Password successfully changed! 🔐');
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-outfit">Change Account Password</h3>
                <p className="text-[11px] text-slate-400">Enter your current password and a secure new one</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <PasswordInput
              id="old_password"
              name="old_password"
              label="Current Password"
              register={register}
              error={errors.old_password}
              validation={{ required: 'Current password is required' }}
            />

            <PasswordInput
              id="new_password"
              name="new_password"
              label="New Password"
              register={register}
              error={errors.new_password}
              validation={{
                required: 'New password is required',
                validate: () => passedCount >= 3 || 'Password must be at least 8 characters with numbers and letters',
              }}
            />

            {watchPassword && (
              <div className="rounded-xl border border-zinc-800 bg-black/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-400">Password Strength</span>
                  <span className={`font-bold ${strengthLabel.color}`}>
                    {strengthLabel.text}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-full rounded-full transition-all ${
                        lvl <= passedCount ? strengthLabel.bg : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1">
                  <span className={passwordCriteria.length ? 'text-emerald-400' : 'text-zinc-500'}>
                    ✓ At least 8 characters
                  </span>
                  <span className={passwordCriteria.number ? 'text-emerald-400' : 'text-zinc-500'}>
                    ✓ Contains number
                  </span>
                  <span className={passwordCriteria.uppercase ? 'text-emerald-400' : 'text-zinc-500'}>
                    ✓ Uppercase letter
                  </span>
                  <span className={passwordCriteria.special ? 'text-emerald-400' : 'text-zinc-500'}>
                    ✓ Special character
                  </span>
                </div>
              </div>
            )}

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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-zinc-900 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChangePasswordModal;
