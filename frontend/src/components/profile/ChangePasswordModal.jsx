import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, X, Loader2, Check } from 'lucide-react';
import { toast } from 'react-toastify';

import useAuth from '../../hooks/useAuth.js';
import PasswordInput from '../auth/PasswordInput.jsx';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { changePassword } = useAuth();
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await changePassword(data.old_password, data.new_password);
      toast.success('Password updated successfully!', { icon: '🔐' });
      reset();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                validate: () => passedCount === 5 || 'Password must satisfy all strength criteria',
              }}
            />

            {watchPassword && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>Password Strength</span>
                  <span className={passedCount === 5 ? 'text-emerald-500' : 'text-amber-500'}>
                    {passedCount === 5 ? 'Strong' : 'Medium'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 h-1.5 w-full">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-full rounded-full transition-all ${
                        lvl <= passedCount ? (passedCount === 5 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-70"
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
