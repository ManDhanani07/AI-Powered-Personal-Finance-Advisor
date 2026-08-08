import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth.js';
import userService from '../../services/userService.js';
import PasswordInput from '../auth/PasswordInput.jsx';
import { ROUTES } from '../../constants/index.js';

export const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmation_text: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await userService.deleteAccount(data.password, data.confirmation_text);
      toast.info('Your account has been permanently deleted.', { icon: '🗑️' });
      await logout();
      onClose();
      navigate(ROUTES.HOME);
    } catch (error) {
      toast.error(error.message || 'Failed to delete account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900/50 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between pb-4 border-b border-red-100 dark:border-red-950">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Account</h3>
                <p className="text-[11px] text-red-500 font-medium">Permanent & Irreversible Action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="py-3 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              This will permanently delete your account, transaction histories, budgets, goals, and AI forecasts from our servers.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <PasswordInput
              id="password"
              name="password"
              label="Confirm Your Password"
              register={register}
              error={errors.password}
              validation={{ required: 'Password is required to confirm deletion' }}
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
              </label>
              <input
                type="text"
                placeholder="DELETE"
                {...register('confirmation_text', {
                  required: "You must type 'DELETE' to confirm",
                  validate: (val) => val === 'DELETE' || "Must equal 'DELETE'",
                })}
                className={`w-full rounded-xl border py-2.5 px-3.5 text-xs font-mono transition-all focus:outline-none focus:ring-2 dark:bg-slate-900/60 dark:text-white ${
                  errors.confirmation_text ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-red-500/20'
                }`}
              />
              {errors.confirmation_text && <p className="text-[11px] text-red-500">{errors.confirmation_text.message}</p>}
            </div>

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
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Permanently Delete
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

export default DeleteAccountModal;
