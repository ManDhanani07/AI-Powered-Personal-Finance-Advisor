import React, { useRef } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export const UserAvatar = ({
  src,
  name = 'User',
  size = 'lg',
  className = '',
  showControls = false,
  onFileSelect,
  onPhotoRemove,
}) => {
  const fileInputRef = useRef(null);

  const sizeClasses = {
    xs: 'h-8 w-8 text-xs font-bold',
    sm: 'h-9 w-9 text-xs font-bold',
    md: 'h-20 w-20 text-xl font-bold',
    lg: 'h-28 w-28 text-3xl font-black',
  }[size] || 'h-28 w-28 text-3xl font-black';

  const handleInputChange = (e) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    // Validate image format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(rawFile.type)) {
      toast.error('Invalid image type. Only JPEG, PNG, and WEBP are supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (rawFile.size > 15 * 1024 * 1024) {
      toast.error('Image size exceeds maximum limit of 15MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (onFileSelect) {
      onFileSelect(rawFile);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return fullName.trim()[0]?.toUpperCase() || 'U';
  };

  const hasPhoto = Boolean(src);
  const currentAvatarUrl = src
    ? (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')
        ? src
        : `http://localhost:8000${src}`)
    : null;

  const avatarCircle = (
    <div
      className={`relative overflow-hidden rounded-full border-2 bg-zinc-900 shadow-xl transition-all duration-200 border-indigo-500/40 shadow-indigo-500/15 shrink-0 ${sizeClasses} ${className}`}
    >
      {currentAvatarUrl ? (
        <img
          src={currentAvatarUrl}
          alt={name}
          className="h-full w-full object-cover"
          loading="eager"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/30 via-zinc-900 to-violet-600/30 font-black text-indigo-300 font-outfit select-none">
          {getInitials(name)}
        </div>
      )}
    </div>
  );

  // If not in edit mode (controls disabled), return only the avatar circle directly
  if (!showControls) {
    return avatarCircle;
  }

  return (
    <div className="flex flex-col items-center sm:items-start gap-3">
      <div className="relative inline-block group">
        {avatarCircle}

        {/* Floating Camera Button - ONLY displayed when showControls is true */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg transition-all cursor-pointer border border-white/20 active:scale-95 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:scale-105 shadow-indigo-500/30"
          title="Upload new profile picture"
        >
          <Camera className="h-4 w-4 stroke-[2.5]" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
      </div>

      {/* Remove Photo Action - ONLY displayed when showControls is true AND a photo exists */}
      {hasPhoto && (
        <button
          type="button"
          onClick={onPhotoRemove}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Photo</span>
        </button>
      )}
    </div>
  );
};

export default UserAvatar;
