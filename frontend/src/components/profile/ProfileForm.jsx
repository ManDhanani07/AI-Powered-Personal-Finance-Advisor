import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save, X, Upload, DollarSign, User, Image } from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '../../services/userService.js';

export const ProfileForm = ({ user, onCancel, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);

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

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        toast.success('Avatar image uploaded preview!', { icon: '🖼️' });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null,
        occupation: data.occupation || null,
        monthly_income: parseFloat(data.monthly_income) || 0.0,
        city: data.city || null,
        state: data.state || null,
        country: data.country || 'India',
        currency: currency,
      };

      const res = await userService.updateProfile(payload);
      toast.success('Profile details updated successfully!', { icon: '✨' });
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
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-5">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">Edit Profile & Preferences</h3>
            <p className="text-xs text-slate-400">Update personal specifications, avatar, currency, and location</p>
          </div>
        </div>

        {/* Drag-and-Drop Avatar Uploader */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Profile Avatar Image
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleAvatarDrop}
            className="border-2 border-dashed border-border-strong rounded-3xl p-6 text-center bg-bg-elevated/40 hover:bg-bg-elevated/70 transition-colors cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20 flex items-center justify-center font-bold text-xl">
                {user?.first_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="text-left space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Drag & drop image here or click to browse
              </p>
              <p className="text-[11px] text-slate-400">Supports PNG, JPG, WEBP up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarDrop}
                className="hidden"
                id="avatar-input"
              />
              <label htmlFor="avatar-input" className="text-xs font-bold text-primary-500 hover:underline cursor-pointer">
                Upload New Image
              </label>
            </div>
          </div>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              First Name
            </label>
            <input
              type="text"
              {...register('first_name', { required: 'First name is required' })}
              className="w-full rounded-xl border border-border-strong bg-bg-surface py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
            />
            {errors.first_name && <p className="text-xs text-rose-500">{errors.first_name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Last Name
            </label>
            <input
              type="text"
              {...register('last_name', { required: 'Last name is required' })}
              className="w-full rounded-xl border border-border-strong bg-bg-surface py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
            />
            {errors.last_name && <p className="text-xs text-rose-500">{errors.last_name.message}</p>}
          </div>
        </div>

        {/* Primary Currency Switcher & Monthly Income */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Primary Currency Switcher
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-border-strong bg-bg-surface py-2.5 px-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
            >
              <option value="INR">INR (₹) — Indian Rupee</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Monthly Income
            </label>
            <input
              type="number"
              placeholder="150000"
              {...register('monthly_income', { min: { value: 0, message: 'Income cannot be negative' } })}
              className="w-full rounded-xl border border-border-strong bg-bg-surface py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-primary-500 font-bold"
            />
          </div>
        </div>

        {/* Phone & Occupation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              {...register('phone')}
              className="w-full rounded-xl border border-border-strong bg-bg-surface py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Occupation
            </label>
            <input
              type="text"
              placeholder="Software Engineer"
              {...register('occupation')}
              className="w-full rounded-xl border border-border-strong bg-bg-surface py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-xl border border-border-strong px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-bg-elevated"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
