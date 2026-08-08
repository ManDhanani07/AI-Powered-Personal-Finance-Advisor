import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationBell = ({ unreadCount = 0, onClick, isOpen = false }) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-2.5 rounded-xl transition-all duration-200 ${
        isOpen
          ? 'bg-primary-500/20 text-white shadow-lg shadow-primary-500/10'
          : 'text-slate-400 hover:text-white hover:bg-bg-elevated'
      }`}
      aria-label="Toggle notifications menu"
      aria-expanded={isOpen}
    >
      <Bell className="w-5 h-5 stroke-[1.75]" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-black text-white items-center justify-center leading-none shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
