import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { Wallet } from 'lucide-react';
import { APP_CONSTANTS } from '../constants/index.js';

export const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-200">
      <header className="flex items-center justify-between max-w-7xl mx-auto w-full py-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            {APP_CONSTANTS.APP_NAME}
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full">
          {children || <Outlet />}
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4 bg-[#000000] border-t border-zinc-900/60">
        © {new Date().getFullYear()} {APP_CONSTANTS.APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicLayout;
