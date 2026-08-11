import React from 'react';
import { User, Phone, Briefcase, IndianRupee, MapPin, Edit3 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const ProfileCard = ({ user, onEditClick }) => {
  const infoItems = [
    {
      icon: User,
      label: 'Full Name',
      value: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'N/A',
    },
    {
      icon: Phone,
      label: 'Phone Number',
      value: user?.phone || 'Not provided',
    },
    {
      icon: Briefcase,
      label: 'Occupation',
      value: user?.occupation || 'Not specified',
    },
    {
      icon: IndianRupee,
      label: 'Monthly Income',
      value: formatCurrency(user?.monthly_income || 0, user?.currency || 'INR'),
      highlight: true,
    },
    {
      icon: MapPin,
      label: 'City & State',
      value: [user?.city, user?.state].filter(Boolean).join(', ') || 'Not specified',
    },
    {
      icon: MapPin,
      label: 'Country',
      value: user?.country || 'India',
    },
  ];

  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your profile details and income specifications</p>
        </div>
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2 text-xs font-semibold text-indigo-600 transition-all hover:bg-indigo-100 hover:border-indigo-300 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {infoItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-800/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {item.label}
                </p>
                <p className={`mt-0.5 text-sm font-semibold ${item.highlight ? 'text-indigo-600 dark:text-indigo-400 text-base' : 'text-slate-800 dark:text-slate-200'}`}>
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileCard;
