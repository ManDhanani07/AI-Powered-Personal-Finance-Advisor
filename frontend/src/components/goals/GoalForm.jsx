import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Target, Wallet, Calendar, TrendingUp,
  Flag, BookOpen, Save,
} from 'lucide-react';
import { toast } from 'react-toastify';

import goalService from '../../services/goalService.js';

const GOAL_TYPES = [
  'Emergency Fund', 'Vacation', 'Car', 'Bike', 'Laptop',
  'Education', 'House', 'Wedding', 'Investment', 'Retirement',
  'Mobile Phone', 'Business', 'Custom Goal',
];

// ── Shared field classes ──────────────────────────────────────────────────────
const INPUT_BASE =
  'w-full rounded-xl border bg-zinc-900 text-white placeholder-zinc-500 ' +
  'py-2.5 px-3.5 text-sm font-medium focus:outline-none focus:ring-2 ' +
  'focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-colors';
const INPUT_NORMAL  = `${INPUT_BASE} border-zinc-800 hover:border-zinc-700`;
const INPUT_ERROR   = `${INPUT_BASE} border-rose-500/60`;
const LABEL_CLASS   = 'block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5';
const SELECT_CLASS  = `${INPUT_NORMAL} cursor-pointer appearance-none`;

// ── Reusable field wrappers ───────────────────────────────────────────────────
const Field = ({ label, icon: Icon, accentColor = 'text-indigo-400', error, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1.5">
      {Icon && <Icon className={`w-3.5 h-3.5 ${accentColor}`} />}
      <label className={LABEL_CLASS}>{label}</label>
    </div>
    {children}
    {error && <p className="text-[11px] text-rose-400 mt-0.5">{error}</p>}
  </div>
);

export const GoalForm = ({ isOpen, onClose, initialData = null, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!initialData?.id;

  const getDefaultTargetDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      goal_name: '',
      goal_type: 'Emergency Fund',
      target_amount: '',
      current_amount: '0',
      monthly_contribution: '0',
      target_date: getDefaultTargetDate(),
      priority: 'MEDIUM',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        goal_name:            initialData.goal_name || '',
        goal_type:            initialData.goal_type || 'Emergency Fund',
        target_amount:        initialData.target_amount || '',
        current_amount:       initialData.current_amount || '0',
        monthly_contribution: initialData.monthly_contribution || '0',
        target_date:          initialData.target_date || getDefaultTargetDate(),
        priority:             initialData.priority || 'MEDIUM',
        description:          initialData.description || '',
      });
    } else {
      reset({
        goal_name: '', goal_type: 'Emergency Fund', target_amount: '',
        current_amount: '0', monthly_contribution: '0',
        target_date: getDefaultTargetDate(), priority: 'MEDIUM', description: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        goal_name:            data.goal_name,
        goal_type:            data.goal_type,
        target_amount:        parseFloat(data.target_amount),
        current_amount:       parseFloat(data.current_amount || 0),
        monthly_contribution: parseFloat(data.monthly_contribution || 0),
        target_date:          data.target_date,
        priority:             data.priority,
        description:          data.description || null,
      };

      if (isEdit) {
        await goalService.updateGoal(initialData.id, payload);
        toast.success('Savings goal updated!', { icon: '✏️' });
      } else {
        await goalService.createGoal(payload);
        toast.success('New savings goal created!', { icon: '🎯' });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden"
        >
          {/* ── Coloured Header Bar ── */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/25">
                <Target className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isEdit ? 'Edit Savings Goal' : 'New Savings Goal'}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {isEdit ? 'Update your vault details' : 'Create a new savings vault'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* Goal Name */}
            <Field label="Goal Title" icon={BookOpen} accentColor="text-indigo-400" error={errors.goal_name?.message}>
              <input
                type="text"
                placeholder="e.g. Emergency Fund, Europe Trip, MacBook…"
                {...register('goal_name', { required: 'Goal title is required' })}
                className={errors.goal_name ? INPUT_ERROR : INPUT_NORMAL}
              />
            </Field>

            {/* Type & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Goal Type" icon={Flag} accentColor="text-violet-400">
                <select {...register('goal_type')} className={SELECT_CLASS}>
                  {GOAL_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-zinc-900">{t}</option>
                  ))}
                </select>
              </Field>

              <Field label="Priority" icon={TrendingUp} accentColor="text-amber-400">
                <select {...register('priority')} className={SELECT_CLASS}>
                  <option value="LOW"      className="bg-zinc-900">Low</option>
                  <option value="MEDIUM"   className="bg-zinc-900">Medium</option>
                  <option value="HIGH"     className="bg-zinc-900">High</option>
                  <option value="CRITICAL" className="bg-zinc-900">Critical</option>
                </select>
              </Field>
            </div>

            {/* Target Amount & Current Saved */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Target Amount (₹)"
                icon={Target}
                accentColor="text-emerald-400"
                error={errors.target_amount?.message}
              >
                <input
                  type="number"
                  step="0.01"
                  placeholder="100000"
                  {...register('target_amount', {
                    required: 'Target amount is required',
                    min: { value: 1, message: 'Must be > 0' },
                  })}
                  className={errors.target_amount ? INPUT_ERROR : INPUT_NORMAL}
                />
              </Field>

              <Field label="Current Saved (₹)" icon={Wallet} accentColor="text-sky-400">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  {...register('current_amount')}
                  className={INPUT_NORMAL}
                />
              </Field>
            </div>

            {/* Monthly Contribution & Target Date */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Monthly Contrib (₹)" icon={TrendingUp} accentColor="text-rose-400">
                <input
                  type="number"
                  step="0.01"
                  placeholder="5000"
                  {...register('monthly_contribution')}
                  className={INPUT_NORMAL}
                />
              </Field>

              <Field label="Target Date" icon={Calendar} accentColor="text-teal-400" error={errors.target_date?.message}>
                <input
                  type="date"
                  {...register('target_date', { required: 'Target date is required' })}
                  className={`${INPUT_NORMAL} [color-scheme:dark]`}
                />
              </Field>
            </div>

          </form>

          {/* ── Footer Buttons ── */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-zinc-800 bg-zinc-950">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="goal-form-inner"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>Saving…</span></>
              ) : (
                <><Save className="h-4 w-4" /><span>{isEdit ? 'Save Changes' : 'Create Goal'}</span></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoalForm;
