import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Menu, X, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';
import useAuth from '../../hooks/useAuth.js';
import LandingButton from './ui/LandingButton.jsx';

export const LandingNavbar = ({ onOpenLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-900/85 backdrop-blur-xl border-b border-border-subtle shadow-xl shadow-slate-950/20 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo & Project Name */}
        <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none font-outfit">
              {APP_CONSTANTS.APP_NAME}
            </span>
            <span className="text-[10px] font-semibold text-primary-500 uppercase tracking-widest mt-0.5 font-outfit">
              AI Wealth OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300 font-outfit">
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-primary-500 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="hover:text-primary-500 transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-primary-500 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-primary-500 transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="hover:text-primary-500 transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />

          <LandingButton
            variant="ghost"
            size="sm"
            onClick={onOpenLogin || (() => navigate(ROUTES.AUTH.LOGIN))}
          >
            Sign In
          </LandingButton>

          <LandingButton
            variant="primary"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate(ROUTES.AUTH.REGISTER)}
          >
            Sign Up
          </LandingButton>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-bg-elevated"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-subtle bg-dark-900/95 backdrop-blur-2xl px-4 py-5 space-y-4 shadow-2xl">
          <button
            onClick={() => scrollToSection('features')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 dark:text-slate-200"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 dark:text-slate-200"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 dark:text-slate-200"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 dark:text-slate-200"
          >
            FAQ
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 dark:text-slate-200"
          >
            Contact
          </button>
          <div className="pt-3 border-t border-border-subtle flex flex-col gap-2.5">
            <LandingButton
              variant="secondary"
              size="md"
              className="w-full"
              onClick={onOpenLogin || (() => navigate(ROUTES.AUTH.LOGIN))}
            >
              Sign In
            </LandingButton>
            <LandingButton
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate(ROUTES.AUTH.REGISTER)}
            >
              Sign Up
            </LandingButton>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
