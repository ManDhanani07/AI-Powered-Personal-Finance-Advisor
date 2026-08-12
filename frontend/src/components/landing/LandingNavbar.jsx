import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Orbit, Menu, X, ArrowRight } from 'lucide-react';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

export const LandingNavbar = () => {
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

  const NAV_LINKS = [
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Security', id: 'why-us' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090B]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] py-3.5 border-b border-zinc-900/80'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 flex items-center justify-between">
        {/* Logo & Project Name */}
        <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Orbit className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white tracking-tight font-outfit leading-none">
              {APP_CONSTANTS.APP_NAME}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Personal Finance OS</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300 font-outfit">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={handleSignIn}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer font-outfit"
          >
            Sign In
          </button>

          <button
            onClick={handleGetStarted}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] font-outfit"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-slate-300 hover:text-white transition-colors"

          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#09090B] px-6 py-5 space-y-4 font-outfit">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="block w-full text-left text-sm font-semibold text-slate-300 hover:text-white py-1.5 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-zinc-800 flex flex-col space-y-2.5">
            <button
              onClick={handleSignIn}
              className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-slate-300 text-xs font-bold text-center"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="w-full py-2.5 rounded-xl bg-white text-slate-950 text-xs font-bold text-center flex items-center justify-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
