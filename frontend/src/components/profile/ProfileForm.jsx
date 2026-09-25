import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save, X, User, Phone, Briefcase, IndianRupee, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '../../services/userService.js';

export const ProfileForm = ({ user, onCancel, onSuccess, onSave, isSaving = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      occupation: user?.occupation || '',
      monthly_income: user?.monthly_income || '0.00',
      city: user?.city || '',
      state: user?.state || '',
      country: user?.country || 'India',
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      phone: data.phone?.trim() || null,
      occupation: data.occupation?.trim() || null,
      monthly_income: parseFloat(data.monthly_income) || 0.0,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      country: data.country?.trim() || 'India',
    };

    if (onSave) {
      await onSave(payload);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await userService.updateProfile(payload);
      toast.success('Profile details updated successfully! ✨');
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-outfit">Edit Personal Information</h3>
            <p className="text-xs text-slate-400">Update your name, contact details, occupation, and location</p>
          </div>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              First Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('first_name', { required: 'First name is required' })}
                placeholder="Man"
                className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />
            </div>
            {errors.first_name && <p className="text-[11px] text-rose-400">{errors.first_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Last Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('last_name', { required: 'Last name is required' })}
                placeholder="Dhanani"
                className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />
            </div>
            {errors.last_name && <p className="text-[11px] text-rose-400">{errors.last_name.message}</p>}
          </div>
        </div>

        {/* Phone & Occupation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              {...register('phone')}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Occupation
            </label>
            <input
              type="text"
              placeholder="Software Engineer / Financial Analyst"
              {...register('occupation')}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Monthly Income */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Monthly Income
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="150000"
              {...register('monthly_income', { min: { value: 0, message: 'Income cannot be negative' } })}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3.5 text-sm text-emerald-400 font-mono font-bold placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>
          {errors.monthly_income && <p className="text-[11px] text-rose-400">{errors.monthly_income.message}</p>}
        </div>

        {/* City, State, Country */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              City
            </label>
            <input
              type="text"
              placeholder="Ahmedabad"
              {...register('city')}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              State
            </label>
            <input
              type="text"
              placeholder="Gujarat"
              {...register('state')}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Country
            </label>
            <input
              type="text"
              placeholder="India"
              {...register('country')}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isSaving}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-zinc-900 cursor-pointer transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isSaving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting || isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
