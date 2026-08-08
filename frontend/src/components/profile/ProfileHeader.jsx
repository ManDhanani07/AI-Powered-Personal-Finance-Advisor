import React from 'react';
import { ShieldCheck, Calendar, MapPin, Briefcase } from 'lucide-react';
import UserAvatar from './UserAvatar.jsx';

export const ProfileHeader = ({ user, onAvatarChange }) => {
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User Profile';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  const locationStr = [user?.city, user?.state, user?.country].filter(Boolean).join(', ');

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl dark:border-slate-800">
      {/* Background Decorative Blur Rings */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <UserAvatar
          src={user?.profile_picture}
          name={fullName}
          onAvatarChange={onAvatarChange}
          size="lg"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
            {user?.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 font-medium">{user?.email}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-400">
            {user?.occupation && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                <span>{user.occupation}</span>
              </div>
            )}
            {locationStr && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                <span>{locationStr}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
