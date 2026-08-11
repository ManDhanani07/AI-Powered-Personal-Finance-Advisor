import React from 'react';
import { Link } from 'react-router-dom';
import { Orbit, ShieldCheck, Twitter, Linkedin, Github, Mail, Phone, MapPin } from 'lucide-react';
import { ROUTES, APP_CONSTANTS } from '../../constants/index.js';

export const LandingFooter = () => {
  return (
    <footer id="contact" className="bg-transparent pt-10 pb-8 text-slate-400 text-xs font-sans">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-zinc-900">
          {/* Logo & Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
                <Orbit className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-bold text-base text-white tracking-tight font-outfit">
                {APP_CONSTANTS.APP_NAME}
              </span>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              India's premier AI Wealth OS. Automate transaction tracking, analyze category budgets, and project real-time multi-asset net worth with institutional security.
            </p>

            {/* Live Status Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (Bank Synced)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-4 font-outfit">
              Navigation
            </p>
            <ul className="space-y-2.5 font-medium">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#about" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a></li>
              <li><a href="#why-us" className="hover:text-indigo-400 transition-colors">Why Choose Us</a></li>
              <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-4 font-outfit">
              Contact & Support
            </p>
            <ul className="space-y-3 font-medium">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>support@wealthos.ai</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>+91 (080) 4568-9000</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Indiranagar, Bangalore 560038</span>
              </li>
            </ul>
          </div>

          {/* Social Icons & Legal */}
          <div>
            <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-4 font-outfit">
              Connect With Us
            </p>
            <div className="flex space-x-3 mb-5">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#09090B] hover:text-indigo-400 transition-all shadow-md"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#09090B] hover:text-indigo-400 transition-all shadow-md"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#09090B] hover:text-indigo-400 transition-all shadow-md"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              256-bit AES Encryption · ISO 27001 Certified · SOC-2 Type II Verified Infrastructure
            </p>
          </div>
        </div>

        {/* Regulatory Disclaimers */}
        <div className="pt-8 space-y-2 text-[10px] text-slate-500 leading-relaxed border-b border-zinc-900 pb-6 mb-6">
          <p>
            <strong>Regulatory Disclosure:</strong> AI-Powered Personal Finance Advisor (Wealth OS) operates strictly as a financial organization and tracking technology SaaS platform. Financial data aggregation is conducted via RBI-regulated Account Aggregator (AA) frameworks.
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 AI-Powered Personal Finance Advisor Inc. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>RBI Account Aggregator Framework</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
