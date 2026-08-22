import React, { useState, useRef } from 'react';
import { Camera, User as UserIcon, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '../../services/userService.js';

export const UserAvatar = ({ src, name = 'User', onAvatarChange, size = 'lg', showControls = true }) => {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'h-12 w-12 text-sm',
    md: 'h-20 w-20 text-xl',
    lg: 'h-28 w-28 text-3xl',
  }[size];

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid image type. Only JPEG, PNG, and WEBP are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds maximum limit of 5MB.');
      return;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);

    setUploading(true);
    try {
      const res = await userService.uploadProfilePicture(file);
      if (res?.data?.profile_picture) {
        toast.success('Profile picture updated successfully!', { icon: '📸' });
        if (onAvatarChange) {
          onAvatarChange(res.data.profile_picture);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload profile picture.');
      setPreviewSrc(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setRemoving(true);
    try {
      await userService.removeProfilePicture();
      setPreviewSrc(null);
      toast.success('Profile picture removed successfully');
      if (onAvatarChange) {
        onAvatarChange(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to remove profile picture.');
    } finally {
      setRemoving(false);
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return fullName[0].toUpperCase();
  };

  const hasPhoto = Boolean(previewSrc || src);
  const currentAvatarUrl = previewSrc || (src ? (src.startsWith('http') ? src : `http://localhost:8000${src}`) : null);

  return (
    <div className="flex flex-col items-center sm:items-start gap-3">
      <div className="relative inline-block group">
        <div className={`relative overflow-hidden rounded-full border-2 border-indigo-500/40 bg-zinc-900 shadow-xl shadow-indigo-500/15 ${sizeClasses}`}>
          {currentAvatarUrl ? (
            <img src={currentAvatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/30 via-zinc-900 to-violet-600/30 font-black text-indigo-300 font-outfit">
              {getInitials(name)}
            </div>
          )}

          {/* Upload Spinner Overlay */}
          {(uploading || removing) && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70 backdrop-blur-xs">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          )}
        </div>

        {/* Floating Camera Button on Avatar */}
        {showControls && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || removing}
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer border border-white/20"
            title="Upload new profile picture (Max 5MB)"
          >
            <Camera className="h-4 w-4 stroke-[2.5]" />
          </button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
      </div>

      {showControls && hasPhoto && (
        <button
          type="button"
          onClick={handleRemovePhoto}
          disabled={uploading || removing}
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
