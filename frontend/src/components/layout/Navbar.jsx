import React from 'react';
import { Link } from 'react-router-dom';
import { Orbit, Menu } from 'lucide-react';
import { DateFilterDropdown } from './DateFilterDropdown.jsx';
import { NotificationBadge } from '../notifications/NotificationBadge.jsx';
import { ProfileDropdown } from './ProfileDropdown.jsx';
import { ROUTES } from '../../constants/index.js';

export const Navbar = ({ onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-40 h-[72px] bg-[#000000] border-b border-zinc-900 transition-colors duration-200">
      <div className="h-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#09090B] border border-transparent hover:border-zinc-800 transition-all"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-sm group-hover:scale-105 transition-transform">
              <Orbit className="w-4.5 h-4.5" />
            </div>
            <span className="font-black text-base sm:text-lg text-white tracking-tight font-outfit">
              FinTech<span className="text-emerald-400">.AI</span>
            </span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Date Filter Dropdown */}
          <div className="hidden sm:block">
            <DateFilterDropdown />
          </div>

          {/* Notification Badge & Popover */}
          <NotificationBadge />

          <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block" />

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
