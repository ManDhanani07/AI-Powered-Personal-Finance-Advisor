import { APP_CONSTANTS } from '../../constants/index.js';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} {APP_CONSTANTS.APP_NAME}. All rights reserved.</p>
        <div className="flex items-center space-x-6">
          <a href="#privacy" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Terms of Service
          </a>
          <a href="#security" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Security Standard
          </a>
        </div>
      </div>
    </footer>
  );
};
