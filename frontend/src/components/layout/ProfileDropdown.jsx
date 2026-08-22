import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, Shield, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../constants/index.js';
import useAuth from '../../hooks/useAuth.js';
import { toast } from 'react-toastify';

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userEmail = user?.email || 'Account User';
  const userName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Personal Account';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
    } catch (err) {
      localStorage.clear();
    }
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-[#09090B] border border-transparent hover:border-zinc-800 transition-all"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
            {userName}
          </p>
          <p className="text-[10px] text-slate-400 truncate max-w-[100px]">Pro Member</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#09090B] border border-zinc-800 shadow-2xl z-50 p-1.5"
          >
            {/* Header info */}
            <div className="px-3 py-2.5 border-b border-zinc-800/80 mb-1">
              <p className="text-xs font-bold text-white">{userName}</p>
              <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
            </div>

            {/* Menu Links */}
            <div className="space-y-0.5">
              <Link
                to={ROUTES.PROFILE}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
              <Link
                to={ROUTES.SETTINGS}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Preferences & Settings</span>
              </Link>
              <Link
                to={ROUTES.SECURITY}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Security & Login</span>
              </Link>
            </div>

            <div className="pt-1 mt-1 border-t border-zinc-800/80">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
