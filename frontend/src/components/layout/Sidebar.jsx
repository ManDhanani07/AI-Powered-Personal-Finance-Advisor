import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Activity,
  FileBarChart,
  LineChart,
  Bell,
  Bot,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';
import useAuth from '../../hooks/useAuth.js';

const ADMIN_EMAIL = 'mandhanani536@gmail.com';

const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Transactions', path: ROUTES.TRANSACTIONS, icon: Receipt },
  { label: 'Budgets', path: ROUTES.BUDGETS, icon: PieChart },
  { label: 'Goals', path: ROUTES.GOALS, icon: Target },
  { label: 'Health Score', path: ROUTES.FINANCIAL_HEALTH, icon: Activity },
  { label: 'Reports', path: ROUTES.REPORTS, icon: FileBarChart },
  { label: 'Forecast', path: ROUTES.FORECAST, icon: LineChart },
  { label: 'Notifications', path: ROUTES.NOTIFICATIONS || '/notifications', icon: Bell },
  { label: 'AI Advisor', path: ROUTES.AI_ADVISOR, icon: Bot },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
];

const MOBILE_NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Transactions', path: ROUTES.TRANSACTIONS, icon: Receipt },
  { label: 'Health', path: ROUTES.FINANCIAL_HEALTH, icon: Activity },
  { label: 'Budgets', path: ROUTES.BUDGETS, icon: PieChart },
  { label: 'AI Advisor', path: ROUTES.AI_ADVISOR, icon: Bot },
];

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const isAdmin = user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <>
      {/* Desktop & Tablet Sidebar (≥ 768px) */}
      <aside
        className={`hidden md:flex flex-col sticky top-[72px] h-[calc(100vh-72px)] bg-[#000000] border-r border-zinc-900 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-[80px]' : 'w-[250px]'
        }`}
      >
        {/* Navigation Item List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {isAdmin && (
            <NavLink
              to="/admin/overview"
              className={({ isActive }) =>
                `group relative flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20'
                }`
              }
            >
              <ShieldCheck className={`w-4.5 h-4.5 flex-shrink-0 text-indigo-400 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span className="truncate">Admin Portal</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 hidden group-hover:block z-50 px-2.5 py-1 rounded-lg bg-[#09090B] border border-zinc-800 text-indigo-300 text-xs font-semibold whitespace-nowrap shadow-lg">
                  Admin Portal
                </div>
              )}
            </NavLink>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-sm'
                      : 'text-slate-400 hover:bg-[#09090B] hover:text-white border border-transparent'
                  }`
                }
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />

                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}

                {/* Collapsed Tooltip Hover */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 hidden group-hover:block z-50 px-2.5 py-1 rounded-lg bg-[#09090B] border border-zinc-800 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#000000] border-t border-zinc-900 z-40 flex items-center justify-around px-2 shadow-2xl">
        {isAdmin && (
          <NavLink
            to="/admin/overview"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
                isActive ? 'text-indigo-400 font-bold scale-105' : 'text-indigo-400/80 hover:text-indigo-300'
              }`
            }
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] truncate max-w-full font-bold">Admin</span>
          </NavLink>
        )}

        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-400 font-bold scale-105'
                    : 'text-slate-500 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] truncate max-w-full">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
