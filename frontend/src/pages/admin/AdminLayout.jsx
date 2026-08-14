import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  Sparkles,
  Target,
  FileText,
  Activity,
  ShieldAlert,
  Settings,
  LogOut,
  Search,
  Calendar,
  CheckCircle2,
  Bell,
  UserCheck,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import NotificationPopover from '../../components/layout/NotificationPopover.jsx';

const ADMIN_EMAIL = 'mandhanani536@gmail.com';

const NAV_ITEMS = [
  { path: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/transactions', label: 'Transactions', icon: Receipt },
  { path: '/admin/financial-activity', label: 'Financial Activity', icon: BarChart3 },
  { path: '/admin/ai-usage', label: 'AI Usage', icon: Sparkles },
  { path: '/admin/budgets-goals', label: 'Budgets & Goals', icon: Target },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
  { path: '/admin/system-health', label: 'System Health', icon: Activity },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState('LAST_30');

  const currentNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path)) || NAV_ITEMS[0];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* ── Left Sidebar (Desktop & Mobile Drawer) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Admin Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-xs shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight font-outfit">
                  AI Finance Advisor
                </span>
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 font-mono">
                  Admin Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800/60">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate font-outfit">
                  System Admin
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {ADMIN_EMAIL}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-base sm:text-lg font-black text-white font-outfit tracking-tight truncate">
              {currentNav.label}
            </h1>
          </div>

          {/* Top Bar Controls */}
          <div className="flex items-center space-x-3">
            {/* System Status Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>All Systems Operational</span>
            </div>

            {/* Date Range Selector */}
            <div className="relative hidden md:block">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 py-1.5 pl-3 pr-7 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer"
              >
                <option value="TODAY">Today</option>
                <option value="LAST_7">Last 7 Days</option>
                <option value="LAST_30">Last 30 Days</option>
                <option value="THIS_YEAR">This Year</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            </div>

            {/* Notifications Popover */}
            <NotificationPopover />

            {/* Admin Avatar */}
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              M
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
