import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Orbit, Menu, X, ArrowRight } from 'lucide-react';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';
import useAuth from '../../hooks/useAuth.js';

export const LandingNavbar = ({ onOpenLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleSignIn = () => {
    navigate(ROUTES.AUTH.LOGIN);
  };

  const handleGetStarted = () => {
    navigate(ROUTES.AUTH.REGISTER);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090B]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo & Project Name */}
        <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-sm group-hover:scale-105 transition-transform">
            <Orbit className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white tracking-tight font-outfit leading-none">
              FinTech<span className="text-emerald-400">.AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Personal Finance OS</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300 font-outfit">
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('why-us')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Security
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={handleSignIn}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>

          <button
            onClick={handleGetStarted}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#09090B] px-4 py-5 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
          <button
            onClick={() => scrollToSection('features')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-200"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-200"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('why-us')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-200"
          >
            Security
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-200"
          >
            Pricing
          </button>
          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2.5">
            <button
              onClick={handleSignIn}
              className="w-full py-3 rounded-xl bg-[#141418] border border-zinc-800 text-slate-200 font-bold text-xs uppercase"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="w-full py-3 rounded-xl bg-white text-slate-950 font-bold text-xs uppercase"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
