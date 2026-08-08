import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Star,
  Zap,
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';
import LandingButton from './ui/LandingButton.jsx';

export const CTASection = ({ onOpenLogin }) => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-bg-surface/50 border-t border-border-subtle relative overflow-hidden">
      {/* Radial Glow Center Background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[850px] h-[450px] rounded-full bg-primary-500/15 blur-[140px]" />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="rounded-[2.5rem] border border-primary-500/30 bg-gradient-to-br from-primary-500/10 via-accent-500/8 to-emerald-500/5 p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl shadow-primary-500/15 backdrop-blur-xl"
        >
          {/* Decorative Sparkles */}
          <Sparkles className="absolute top-6 left-8 w-6 h-6 text-primary-400/40 animate-pulse" />
          <Sparkles className="absolute bottom-6 right-8 w-5 h-5 text-accent-400/40 animate-pulse" style={{ animationDelay: '1s' }} />

          {/* Stars Pill */}
          <div className="flex items-center justify-center space-x-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-3 text-xs font-bold text-slate-300 font-mono">
              4.9/5 · 50,000+ Smart Investors Across India
            </span>
          </div>

          {/* Large Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-outfit mb-5">
            Ready to Supercharge Your Wealth with{' '}
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-emerald-400 bg-clip-text text-transparent">
              Artificial Intelligence?
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Join 50,000+ Indians automating their finances, optimizing taxes, and forecasting net worth. Connect your first account in 2 minutes.
          </p>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-xs font-semibold text-slate-400">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-primary-400" />
              <span>256-Bit Bank Encryption</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Bank Aggregator Sync</span>
            </div>
          </div>

          {/* Two Buttons: Get Started & Login */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LandingButton
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate(ROUTES.AUTH.REGISTER)}
            >
              Get Started Free
            </LandingButton>

            <LandingButton
              variant="secondary"
              size="lg"
              onClick={onOpenLogin || (() => navigate(ROUTES.AUTH.LOGIN))}
            >
              Login to Workspace
            </LandingButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
