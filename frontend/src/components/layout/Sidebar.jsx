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
  BrainCircuit,
  Bell,
  Bot,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';
import useAuth from '../../hooks/useAuth.js';

const ADMIN_EMAIL = 'fintech0707@gmail.com';

const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Transactions', path: ROUTES.TRANSACTIONS, icon: Receipt },
  { label: 'Budgets', path: ROUTES.BUDGETS, icon: PieChart },
  { label: 'Goals', path: ROUTES.GOALS, icon: Target },
  { label: 'Health Score', path: ROUTES.FINANCIAL_HEALTH, icon: Activity },
  { label: 'Expense Prediction', path: ROUTES.EXPENSE_PREDICTION, icon: BrainCircuit },
  { label: 'Reports', path: ROUTES.REPORTS, icon: FileBarChart },
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
        className={`hidden md:flex flex-col h-full bg-[#000000] border-r border-[#18181b] transition-all duration-200 z-30 ${
          isCollapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        {/* Navigation Item List */}
        <nav
          className={`flex-1 overflow-y-auto ${
            isCollapsed
              ? 'py-3 flex flex-col items-center space-y-1.5 w-full'
              : 'p-3 space-y-1.5'
          }`}
        >
          {isAdmin && (
            <NavLink
              to="/admin/overview"
              className={({ isActive }) =>
                `group relative flex items-center transition-all duration-150 ${
                  isCollapsed
                    ? 'w-10 h-10 justify-center rounded-xl'
                    : 'w-full px-3.5 py-2.5 rounded-xl text-xs font-bold'
                } ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#121214] border border-transparent font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ShieldCheck
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-black' : 'text-[#a1a1aa] group-hover:text-white'
                    } ${isCollapsed ? '' : 'mr-3'}`}
                  />
                  {!isCollapsed && <span className="truncate">Admin Portal</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 hidden group-hover:block z-50 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold whitespace-nowrap shadow-xl">
                      Admin Portal
                    </div>
                  )}
                </>
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
                  `group relative flex items-center transition-all duration-150 ${
                    isCollapsed
                      ? 'w-10 h-10 justify-center rounded-xl'
                      : 'w-full px-3.5 py-2.5 rounded-xl text-xs'
                  } ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#121214] border border-transparent font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isActive ? 'text-black' : 'text-[#a1a1aa] group-hover:text-white'
                      } ${isCollapsed ? '' : 'mr-3'}`}
                    />

                    {!isCollapsed && (
                      <span
                        className={`truncate transition-colors ${
                          isActive ? 'text-black font-bold' : 'text-[#a1a1aa] group-hover:text-white'
                        }`}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Collapsed Tooltip Hover */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 hidden group-hover:block z-50 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold whitespace-nowrap shadow-xl">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#000000] border-t border-[#18181b] z-40 flex items-center justify-around px-2 shadow-2xl">
        {isAdmin && (
          <NavLink
            to="/admin/overview"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
                isActive ? 'text-white font-bold scale-105' : 'text-[#a1a1aa] hover:text-white'
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
                    ? 'text-white font-bold scale-105'
                    : 'text-[#a1a1aa] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-white' : 'text-[#a1a1aa]'}`} />
                  <span className={`text-[10px] truncate max-w-full ${isActive ? 'text-white font-bold' : 'text-[#a1a1aa]'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="w-1 h-1 rounded-full bg-white mt-0.5 shadow-[0_0_6px_rgba(255,255,255,0.8)]"
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
