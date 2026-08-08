import React, { useState, useRef } from 'react';
import { Camera, User as UserIcon, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '../../services/userService.js';

export const UserAvatar = ({ src, name = 'User', onAvatarChange, size = 'lg' }) => {
  const [uploading, setUploading] = useState(false);
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

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return fullName[0].toUpperCase();
  };

  const currentAvatarUrl = previewSrc || (src ? (src.startsWith('http') ? src : `http://localhost:8000${src}`) : null);

  return (
    <div className="relative inline-block group">
      <div className={`relative overflow-hidden rounded-full border-4 border-white shadow-xl shadow-indigo-500/10 dark:border-slate-800 ${sizeClasses}`}>
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white">
            {getInitials(name)}
          </div>
        )}

        {/* Upload Spinner Overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Upload Camera Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition-all hover:bg-indigo-500 hover:scale-105 focus:outline-none dark:bg-indigo-500"
        title="Upload new profile picture (Max 5MB)"
      >
        <Camera className="h-4 w-4" />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
    </div>
  );
};

export default UserAvatar;
