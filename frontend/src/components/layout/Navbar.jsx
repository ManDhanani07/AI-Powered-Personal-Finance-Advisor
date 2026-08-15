import React from 'react';
import { Link } from 'react-router-dom';
import { Orbit, Menu } from 'lucide-react';
import { DateFilterDropdown } from './DateFilterDropdown.jsx';
import { NotificationBadge } from '../notifications/NotificationBadge.jsx';
import { ProfileDropdown } from './ProfileDropdown.jsx';
import { ROUTES } from '../../constants/index.js';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  return (
    <header className="shrink-0 z-40 h-[72px] bg-[#000000] border-b border-[#18181b] transition-colors duration-200">
      <div className="h-full w-full flex items-center justify-between">
        {/* Left: Perfectly Aligned Toggle & Brand Area */}
        <div className="flex items-center h-full">
          {onToggleSidebar && (
            <div className="w-[68px] h-full flex items-center justify-center flex-shrink-0">
              <button
                onClick={onToggleSidebar}
                className="w-10 h-10 rounded-xl text-[#a1a1aa] hover:text-white hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition-all flex items-center justify-center cursor-pointer"
                aria-label="Toggle navigation menu"
                title="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          )}

          <Link to={ROUTES.HOME} className="flex items-center space-x-3.5 group pl-1 sm:pl-2 pr-4">
            {/* Multi-Color Luminous Spectrum Emblem (Violet ➔ Cyan ➔ Emerald ➔ Rose) */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-cyan-400 via-emerald-400 to-rose-400 p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.35),0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.6),0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#09090B] flex items-center justify-center backdrop-blur-xl">
                <Orbit className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] animate-[spin_12s_linear_infinite]" />
              </div>
            </div>

            {/* Dynamic Typography: Pure White 'Fin' + Electric Cyan 'Tech' + Cyan/Emerald Theme-Matched 'AI' Badge */}
            <div className="flex items-center">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white font-outfit">
                Fin
              </span>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight font-outfit bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                Tech
              </span>
              <span className="ml-1.5 px-2 py-0.5 text-xs font-black tracking-wider uppercase rounded-lg bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-mono">
                AI
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 pr-4 sm:pr-6">
          {/* Date Filter Dropdown */}
          <div className="hidden sm:block">
            <DateFilterDropdown />
          </div>

          {/* Notification Badge & Popover */}
          <NotificationBadge />

          <div className="h-6 w-[1px] bg-[#27272a] hidden sm:block" />

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
