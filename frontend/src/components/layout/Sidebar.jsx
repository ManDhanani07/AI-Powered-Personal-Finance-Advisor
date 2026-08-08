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
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';

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

// Key mobile bottom bar navigation items
const MOBILE_NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Transactions', path: ROUTES.TRANSACTIONS, icon: Receipt },
  { label: 'Health', path: ROUTES.FINANCIAL_HEALTH, icon: Activity },
  { label: 'Budgets', path: ROUTES.BUDGETS, icon: PieChart },
  { label: 'AI Advisor', path: ROUTES.AI_ADVISOR, icon: Bot },
];

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  return (
    <>
      {/* Desktop & Tablet Sidebar (≥ 768px) */}
      <aside
        className={`hidden md:flex flex-col sticky top-[72px] h-[calc(100vh-72px)] bg-bg-surface border-r border-border-subtle transition-all duration-300 z-30 ${
          isCollapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
      >
        {/* Navigation Item List */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-500 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-bg-elevated hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3.5'}`} />

                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}

                {/* Collapsed Tooltip Hover */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 hidden group-hover:block z-50 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-surface/90 backdrop-blur-lg border-t border-border-subtle z-40 flex items-center justify-around px-2 shadow-2xl">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-primary-500 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                      className="w-1 h-1 rounded-full bg-primary-500 mt-0.5"
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
