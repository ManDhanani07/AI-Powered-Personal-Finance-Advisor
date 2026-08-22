import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Orbit, ArrowLeft } from 'lucide-react';
import { NotificationBadge } from '../components/notifications/NotificationBadge.jsx';
import { ProfileDropdown } from '../components/layout/ProfileDropdown.jsx';
import { ROUTES } from '../constants/index.js';

export const AccountLayout = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#000000] text-slate-100 font-sans overflow-hidden">
      {/* Top Header */}
      <header className="shrink-0 z-40 h-[72px] bg-[#000000] border-b border-[#18181b]">
        <div className="h-full w-full flex items-center justify-between px-4 sm:px-6">
          {/* Left: Brand Logo & Back to Dashboard */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link to={ROUTES.DASHBOARD} className="flex items-center space-x-3 group">
              {/* Luminous Emblem */}
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-cyan-400 via-emerald-400 to-rose-400 p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#09090B] flex items-center justify-center backdrop-blur-xl">
                  <Orbit className="w-5 h-5 text-cyan-300 animate-[spin_12s_linear_infinite]" />
                </div>
              </div>

              {/* Dynamic Typography */}
              <div className="flex items-center">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white font-outfit">
                  Fin
                </span>
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight font-outfit bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Tech
                </span>
                <span className="ml-1.5 px-2 py-0.5 text-xs font-black tracking-wider uppercase rounded-lg bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  AI
                </span>
              </div>
            </Link>

            <div className="h-6 w-[1px] bg-[#27272a] hidden sm:block" />

            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-slate-300 hover:text-white text-xs font-bold transition-all group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Right: Notifications & Profile Dropdown */}
          <div className="flex items-center space-x-3">
            <NotificationBadge />
            <div className="h-6 w-[1px] bg-[#27272a] hidden sm:block" />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Dedicated Full-Width Content Canvas (NO SIDEBAR & NO SUB-HEADER TABS) */}
      <main className="flex-1 w-full overflow-y-auto min-h-0 bg-[#000000]">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
