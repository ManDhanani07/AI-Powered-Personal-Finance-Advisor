import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';

import goalService from '../../services/goalService.js';

const GOAL_TYPES = [
  'Emergency Fund',
  'Vacation',
  'Car',
  'Bike',
  'Laptop',
  'Education',
  'House',
  'Wedding',
  'Investment',
  'Retirement',
  'Mobile Phone',
  'Business',
  'Custom Goal',
];

export const GoalForm = ({
  isOpen,
  onClose,
  initialData = null,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!initialData?.id;

  const getDefaultTargetDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
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
        goal_name: initialData.goal_name || '',
        goal_type: initialData.goal_type || 'Emergency Fund',
        target_amount: initialData.target_amount || '',
        current_amount: initialData.current_amount || '0',
        monthly_contribution: initialData.monthly_contribution || '0',
        target_date: initialData.target_date || getDefaultTargetDate(),
        priority: initialData.priority || 'MEDIUM',
        description: initialData.description || '',
      });
    } else {
      reset({
        goal_name: '',
        goal_type: 'Emergency Fund',
        target_amount: '',
        current_amount: '0',
        monthly_contribution: '0',
        target_date: getDefaultTargetDate(),
        priority: 'MEDIUM',
        description: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        goal_name: data.goal_name,
        goal_type: data.goal_type,
        target_amount: parseFloat(data.target_amount),
        current_amount: parseFloat(data.current_amount || 0),
        monthly_contribution: parseFloat(data.monthly_contribution || 0),
        target_date: data.target_date,
        priority: data.priority,
        description: data.description || null,
      };

      if (isEdit) {
        await goalService.updateGoal(initialData.id, payload);
        toast.success('Savings goal updated successfully!', { icon: '✏️' });
      } else {
        await goalService.createGoal(payload);
        toast.success('New Savings Goal created successfully!', { icon: '🎯' });
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Goal Title */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Goal Title
              </label>
              <input
                type="text"
                placeholder="Emergency Reserve, Europe Trip, New Laptop..."
                {...register('goal_name', { required: 'Goal title is required' })}
                className={`w-full rounded-xl border py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                  errors.goal_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20'
                }`}
              />
              {errors.goal_name && <p className="text-[11px] text-red-500">{errors.goal_name.message}</p>}
            </div>

            {/* Goal Type & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Goal Type
                </label>
                <select
                  {...register('goal_type')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
                >
                  {GOAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Target Amount & Initial Saved */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="100000.00"
                  {...register('target_amount', {
                    required: 'Target amount is required',
                    min: { value: 1, message: 'Amount must be > 0' },
                  })}
                  className={`w-full rounded-xl border py-2 px-3 text-xs font-extrabold focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                    errors.target_amount ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.target_amount && <p className="text-[11px] text-red-500">{errors.target_amount.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Current Saved (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="25000.00"
                  {...register('current_amount')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Monthly Contribution & Target Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Monthly Contrib (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  {...register('monthly_contribution')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Target Date
                </label>
                <input
                  type="date"
                  {...register('target_date', { required: 'Target date is required' })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Submit & Cancel */}
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
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEdit ? 'Save Changes' : 'Create Goal'}
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

export default GoalForm;
