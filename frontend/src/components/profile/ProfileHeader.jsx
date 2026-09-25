import React from 'react';
import { ShieldCheck, Calendar, MapPin, Briefcase, Sparkles, Edit3, Phone, Mail } from 'lucide-react';
import UserAvatar from './UserAvatar.jsx';

export const ProfileHeader = ({
  user,
  avatarSrc,
  onFileSelect,
  onPhotoRemove,
  onEditClick,
  isEditing,
  isSaving = false,
}) => {
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User Profile';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  const isVerified = Boolean(user?.is_verified || user?.email_verified);
  const locationStr = [user?.city, user?.state, user?.country].filter(Boolean).join(', ');

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-[#0d111a] to-zinc-950 p-6 sm:p-8 text-white shadow-2xl">
      {/* Background Decorative Blur Glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <UserAvatar
            src={avatarSrc !== undefined ? avatarSrc : user?.profile_picture}
            name={fullName}
            showControls={isEditing}
            onFileSelect={onFileSelect}
            onPhotoRemove={onPhotoRemove}
            size="lg"
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-outfit">
                {fullName}
              </h1>

              {/* Dynamic Membership Badge */}
              {user?.membership_tier === 'business' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-indigo-500/20 px-3 py-1 text-xs font-bold text-violet-300 border border-violet-500/30 shadow-sm">
                  <Sparkles className="h-3 w-3 text-violet-400" />
                  Business HNI
                </span>
              ) : user?.membership_tier === 'starter' || user?.membership_tier === 'free' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 shadow-sm">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  Starter Plan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-violet-500/20 to-indigo-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30 shadow-sm">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  Pro Member
                </span>
              )}

              {/* Verified Pill */}
              {isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                  Unverified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                <span className="font-mono text-slate-300">{user?.email || 'N/A'}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-mono text-slate-300">{user.phone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-400">
              {user?.occupation && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-rose-400" />
                  <span>{user.occupation}</span>
                </div>
              )}
              {locationStr && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{locationStr}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-violet-400" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Action Button */}
        {onEditClick && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={onEditClick}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95 ${
                isEditing
                  ? 'bg-zinc-800 text-slate-300 hover:bg-zinc-700 border border-zinc-700'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-indigo-500/25'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
