import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Orbit, Menu, X, ArrowRight } from 'lucide-react';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

export const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Auto-hide navbar smoothly when scrolled down past hero section
      if (currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse position near the top of the viewport (top 75px) to reveal navbar on hover
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientY <= 75) {
        setIsHovered(true);
      } else if (e.clientY > 120 && !mobileMenuOpen) {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mobileMenuOpen]);

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

  const showNavbar = isVisible || isHovered || mobileMenuOpen || !scrolled;

  return (
    <>
      {/* Invisible Top Viewport Sensor Area to catch mouse hover when navbar is hidden */}
      <div
        className="fixed top-0 left-0 right-0 h-6 z-50 pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
      />

      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (scrolled && window.scrollY > 100 && !mobileMenuOpen) {
            setIsHovered(false);
          }
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out transform border-none outline-none ${
          showNavbar
            ? 'translate-y-0 opacity-100 blur-0 backdrop-blur-xl scale-100 pointer-events-auto'
            : '-translate-y-3 opacity-0 blur-md backdrop-blur-none scale-[0.99] pointer-events-none'
        } ${
          scrolled
            ? 'bg-[#09090B]/90 shadow-[0_10px_30px_rgba(0,0,0,0.85)] py-3.5'
            : 'bg-transparent py-4'
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
          <div className="md:hidden bg-[#09090B] px-6 py-5 space-y-4 font-outfit">
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
    </>
  );
};

export default LandingNavbar;
