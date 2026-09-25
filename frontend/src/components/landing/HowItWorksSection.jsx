import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SparklesCore } from '../ui/SparklesCore.jsx';

const STEPS = [
  {
    id: 'transactions',
    stepNum: '1',
    title: 'Add Transactions',
    desc: 'Log income, expenses, and transfers in seconds with intelligent merchant auto-categorization and CSV file import.',
    gradient: 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent',
    dotColor: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',
  },
  {
    id: 'budgets',
    stepNum: '2',
    title: 'Budget Tracking',
    desc: 'Set monthly category limits and monitor real-time spend utilization bars, burn rates, and 80% & 100% threshold alerts.',
    gradient: 'bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent',
    dotColor: 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]',
  },
  {
    id: 'goals',
    stepNum: '3',
    title: 'Savings Goals',
    desc: 'Define milestone vaults, log contributions over time, and let AI project exact completion dates and progress rings.',
    gradient: 'bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent',
    dotColor: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]',
  },
  {
    id: 'expense-prediction',
    stepNum: '4',
    title: 'AI Expense Prediction',
    desc: 'Multi-scale adaptive ML forecasting next-month spending, P10–P90 quantile intervals, and safe budget ceilings.',
    gradient: 'bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent',
    dotColor: 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]',
  },
  {
    id: 'health',
    stepNum: '5',
    title: 'Health Score',
    desc: 'Calculate a composite financial grade from liquidity, savings rate, emergency cushions, and vendor risk matrix.',
    gradient: 'bg-gradient-to-r from-[#FF5A5F] via-rose-300 to-pink-400 bg-clip-text text-transparent',
    dotColor: 'bg-[#FF5A5F] shadow-[0_0_10px_rgba(255,90,95,0.8)]',
  },
  {
    id: 'ai',
    stepNum: '6',
    title: 'Gemini AI Copilot',
    desc: 'Chat naturally with Google Gemini 1.5 Pro using live financial context, budgets, and goals for personalized advice.',
    gradient: 'bg-gradient-to-r from-[#A855F7] via-[#00F2FE] to-[#A855F7] bg-clip-text text-transparent',
    dotColor: 'bg-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.8)]',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-transparent relative overflow-hidden">
      {/* Background Ambient Blur Glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-emerald-500/5 blur-[220px] z-0" />

      {/* Sparkling Star Particle Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-70 overflow-hidden">
        <SparklesCore
          id="howItWorksSectionSparkles"
          background="transparent"
          minSize={0.5}
          maxSize={1.6}
          particleDensity={200}
          isFullSection={true}
          className="w-full h-full"
          particleColor={["#10B981", "#00F2FE", "#C084FC", "#34D399", "#A855F7", "#FFFFFF"]}
          speed={0.6}
        />
      </div>

      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20 relative z-10"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#09090B] border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Sequential Workflow Engine</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-outfit leading-tight">
            How it works?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-medium">
            A 6-step automated workflow connecting your transactions, budgets, goals, and AI copilot.
          </p>
        </motion.div>

        {/* ── HORIZONTAL PROCESS FLOW (VIBRANT LANDING THEME COLOR NUMBERS) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6 relative max-w-full mx-auto z-10">
          {STEPS.map((step, idx) => {
            const isLast = idx === STEPS.length - 1;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center relative z-10"
              >
                {/* Horizontal Dotted Connecting Line with Glowing Dot Tracer */}
                {!isLast && (
                  <div className="hidden lg:flex items-center absolute top-8 left-[calc(50%+32px)] right-[-calc(50%-32px)] w-[calc(100%-64px)] z-0 pointer-events-none">
                    <div className="w-full border-t-2 border-dashed border-zinc-800/90" />
                    <div className={`w-2.5 h-2.5 rounded-full ${step.dotColor} shrink-0`} />
                  </div>
                )}

                {/* Big Vibrant Landing-Page Theme Gradient Number */}
                <div className="relative mb-3 z-10">
                  <span className={`text-6xl sm:text-7xl font-black font-outfit ${step.gradient} tracking-tight leading-none filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]`}>
                    {step.stepNum}
                  </span>
                </div>

                {/* Step Title */}
                <h3 className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tight mb-2 z-10">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-[240px] z-10">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
