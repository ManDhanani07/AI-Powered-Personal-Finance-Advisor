import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Star,
  DatabaseZap,
  Lock,
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';

export const CTASection = ({ onOpenLogin }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(ROUTES.AUTH.REGISTER);
  };

  const handleSignIn = () => {
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <section className="py-16 bg-transparent relative overflow-hidden">
      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-zinc-800 bg-[#09090B] p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl"
        >
          {/* 2-Column Side-by-Side Split Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12">
            
            {/* LEFT COLUMN: Content, Rating, Text, Buttons, Badges */}
            <div className="lg:col-span-6 text-left space-y-6">
              {/* Rating Pill */}
              <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#141418] border border-zinc-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-xs font-bold text-slate-300 font-mono">
                  4.9/5 · 50,000+ Smart Investors
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-outfit leading-[1.12]">
                Supercharge Your Wealth with{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Artificial Intelligence
                </span>
              </h2>

              <p className="text-base text-slate-300 max-w-xl font-normal leading-relaxed">
                Join 50,000+ Indians automating their finances, optimizing category budgets, and forecasting net worth with institutional accuracy.
              </p>

              {/* Trust Highlights */}
              <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-400 pt-1">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-300" />
                  <span>256-Bit Bank Encryption</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <DatabaseZap className="w-4 h-4 text-slate-300" />
                  <span>Bank Aggregator Sync</span>
                </div>
              </div>

              {/* MNC Enterprise High-Contrast Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 group active:scale-[0.98]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-950" />
                </button>

                <button
                  onClick={handleSignIn}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#141418] hover:bg-zinc-800 text-slate-200 font-semibold text-sm border border-zinc-800 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                  <span>Login to Workspace</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Image 1.png Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl bg-[#09090B] p-2 overflow-hidden border border-zinc-800 shadow-2xl">
                {/* Image 1.png */}
                <img
                  src="/images/1.png"
                  alt="AI Personal Finance Advisor Analytics Interface"
                  className="w-full h-auto rounded-xl object-cover transition-transform hover:scale-[1.01] duration-500"
                />
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
