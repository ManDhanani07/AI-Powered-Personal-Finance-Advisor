import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Cpu,
  ShieldAlert,
  Database,
  Tag,
  LifeBuoy,
  Server,
  ShieldCheck,
  LogOut,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import NotificationPopover from '../../components/layout/NotificationPopover.jsx';

const ADMIN_EMAIL = 'fintech0707@gmail.com';

const NAV_GROUPS = [
  {
    group: 'OVERVIEW',
    items: [
      { path: '/admin/overview', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'USERS',
    items: [
      { path: '/admin/users', label: 'Users Directory', icon: Users },
    ],
  },
  {
    group: 'FINANCIAL DATA',
    items: [
      { path: '/admin/transactions', label: 'Transactions', icon: Receipt },
      { path: '/admin/data-management', label: 'Categorization Rules', icon: Tag },
    ],
  },
  {
    group: 'AI & ML',
    items: [
      { path: '/admin/ai-ml', label: 'Model Control Center', icon: Cpu, badge: 'v4.0' },
    ],
  },
  {
    group: 'SECURITY',
    items: [
      { path: '/admin/risk-security', label: 'Security Events', icon: ShieldAlert },
    ],
  },
  {
    group: 'SYSTEM',
    items: [
      { path: '/admin/system', label: 'System Health', icon: Server },
      { path: '/admin/support', label: 'Problem Reports', icon: LifeBuoy },
    ],
  },
];

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Flatten items for current header title
  const allItems = NAV_GROUPS.flatMap((g) => g.items);
  const currentNav = allItems.find((item) => location.pathname.startsWith(item.path)) || allItems[0];

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
        <div className="overflow-y-auto">
          {/* Admin Header / Brand */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950 sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-xs shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-black text-sm text-white tracking-tight font-outfit">
                  FinTech AI
                </span>
                <span className="block text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 font-mono">
                  Platform Admin
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

          {/* Grouped Navigation Links */}
          <nav className="p-4 space-y-5">
            {NAV_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <p className="px-3 text-[9px] font-extrabold uppercase tracking-wider text-slate-500 font-outfit">
                  {group.group}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-white text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-zinc-200 text-slate-950' : 'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.alert && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div className="flex items-center space-x-2.5 min-w-0">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:8000${user.profile_picture}`}
                  alt="Admin"
                  className="w-8 h-8 rounded-lg object-cover border border-indigo-500/30 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'SA'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate font-outfit">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Super Admin'}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {user?.email || ADMIN_EMAIL}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout from console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Main Operations View Area ── */}
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
            {/* System Status Indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-outfit">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>All Systems Operational</span>
            </div>

            {/* Notifications Popover */}
            <NotificationPopover />

            {/* Super Admin Badge */}
            <div className="hidden md:flex items-center space-x-2 border border-zinc-800 bg-zinc-900 px-3 py-1 rounded-xl text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-slate-300 font-bold">PRO CONSOLE</span>
            </div>
          </div>
        </header>

        {/* Main Routed View */}
        <main className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
};

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Console Uncaught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto text-center space-y-4 rounded-3xl border border-rose-500/30 bg-rose-950/10 shadow-2xl mt-12">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">Console View Recovered</h3>
            <p className="text-xs text-slate-400 mt-1">
              A runtime anomaly occurred in this administrative component. The console environment has been protected.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset View</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AdminLayout;
