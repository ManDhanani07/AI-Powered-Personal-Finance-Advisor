import React from 'react';
import { APP_CONSTANTS } from '../../constants/index.js';

export const Footer = () => {
  return (
    <footer className="bg-[#000000] border-t border-zinc-900 py-6 mt-auto">
      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} {APP_CONSTANTS.APP_NAME}. All rights reserved.</p>
        <div className="flex items-center space-x-6">
          <a href="#privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#security" className="hover:text-white transition-colors">
            Security Standard
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
