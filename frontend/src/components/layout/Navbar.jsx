import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Search, Menu } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { DateFilterDropdown } from './DateFilterDropdown.jsx';
import { NotificationBadge } from '../notifications/NotificationBadge.jsx';
import { ProfileDropdown } from './ProfileDropdown.jsx';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

export const Navbar = ({ onOpenCommandPalette, onToggleSidebar, isSidebarCollapsed }) => {
  return (
    <header className="sticky top-0 z-40 h-[72px] bg-bg-surface/80 dark:bg-bg-surface/80 backdrop-blur-md border-b border-border-subtle transition-colors duration-200">
      <div className="h-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-bg-elevated transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={ROUTES.HOME} className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight font-outfit">
              {APP_CONSTANTS.APP_NAME}
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

          <div className="h-6 w-[1px] bg-border-subtle hidden sm:block" />

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
