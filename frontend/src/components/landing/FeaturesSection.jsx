import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Workflow,
  Layers,
  Crosshair,
  Binary,
  Activity,
  FileSpreadsheet,
  BrainCircuit,
  Orbit,
  CheckCircle2,
  Zap,
  SlidersHorizontal,
  ShieldCheck,
  TrendingUp,
  Tag,
  Bell,
  Sliders,
  CalendarDays,
  Clock,
  BarChart2,
  HeartPulse,
} from 'lucide-react';
import CardSwap, { Card } from './CardSwap.jsx';

const PILLARS = [
  {
    id: 'expense-tracking',
    icon: Workflow,
    title: 'Expense Tracking',
    tag: 'Pillar 1',
    badge: { text: '99.4% Auto Tagging', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    desc: 'Deep multi-currency transaction parser with instant merchant regex categorization, recurring debit detection, and CSV auto-sync.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    activeBorder: 'border-emerald-500/50 shadow-emerald-500/10',
    activeDot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]',
    steps: [
      { icon: Tag,          label: 'Smart Category Regex', sub: 'Zero manual tagging' },
      { icon: Bell,         label: 'Overspend Triggers',   sub: 'Push, web & in-app alerts' },
      { icon: TrendingUp,   label: 'Income vs Burn Velocity', sub: 'Daily pace metric' },
      { icon: CheckCircle2, label: 'Multi-Format CSV Import', sub: 'Instant statement ingestion' },
    ],
  },
  {
    id: 'envelope-budgeting',
    icon: Layers,
    title: 'Envelope Budgeting',
    tag: 'Pillar 2',
    badge: { text: 'Zero-Based Dynamic', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    desc: 'Strict zero-based spending limit allocation per category with 80% & 100% threshold sirens, real-time burn gauges, and surplus re-routing.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/20',
    activeBorder: 'border-teal-500/50 shadow-teal-500/10',
    activeDot: 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.9)]',
    steps: [
      { icon: Sliders,      label: 'Dynamic Thresholds',   sub: '80% & 100% siren triggers' },
      { icon: Zap,          label: 'Surplus Re-Routing',   sub: 'Auto-sweeps unused cash' },
      { icon: BarChart2,    label: 'Category Pace Gauge',  sub: 'Burn velocity indicator' },
      { icon: CheckCircle2, label: 'Rollover Balances',    sub: 'Multi-month carryover' },
    ],
  },
  {
    id: 'savings-goals',
    icon: Crosshair,
    title: 'Savings Goals',
    tag: 'Pillar 3',
    badge: { text: 'Target Milestone ETA', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    desc: 'Target date projection engines with dedicated emergency fund reserves, interactive progress rings, and automated micro-savings sweep.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    activeBorder: 'border-purple-500/50 shadow-purple-500/10',
    activeDot: 'bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.9)]',
    steps: [
      { icon: CalendarDays, label: 'Milestone Deadlines', sub: 'Priority vault creation' },
      { icon: Zap,          label: 'Smart ETA Calculator', sub: 'Projected finish date' },
      { icon: CheckCircle2, label: 'Top-Up Tracking',     sub: 'Manual & auto contributions' },
      { icon: TrendingUp,   label: 'Progress Rings',      sub: 'Visual % completion gauge' },
    ],
  },
  {
    id: 'ai-expense-prediction',
    icon: BrainCircuit,
    title: 'AI Expense Prediction',
    tag: 'Pillar 4',
    badge: { text: 'Multi-Scale Adaptive ML', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    desc: 'Multi-scale adaptive machine learning forecasting next-month spending, 3-tier expense breakdown, P10–P90 quantile intervals, and safe budget ceilings.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    activeBorder: 'border-emerald-500/50 shadow-emerald-500/10',
    activeDot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]',
    steps: [
      { icon: Binary,           label: 'Adaptive Multi-Scale', sub: 'Fast, medium & slow EMAs' },
      { icon: ShieldCheck,      label: 'Quantile Pinball Bounds', sub: 'P10 minimum to P90 ceiling' },
      { icon: SlidersHorizontal, label: 'Scenario Simulator', sub: 'Income & discretionary shifts' },
      { icon: Zap,              label: 'Safe Budget Buffer',   sub: 'Adaptive variance coverage' },
    ],
  },
  {
    id: 'health-score',
    icon: Activity,
    title: 'Financial Health Score',
    tag: 'Pillar 5',
    badge: { text: 'Composite Score Grade', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    desc: 'Real-time liquidity risk alerts, emergency fund readiness metrics, and vendor concentration dependency matrix.',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10 border-sky-500/20',
    activeBorder: 'border-sky-500/50 shadow-sky-500/10',
    activeDot: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]',
    steps: [
      { icon: HeartPulse,   label: 'Weighted Composite', sub: 'A to F financial grade' },
      { icon: ShieldCheck,  label: 'Emergency Cushion',  sub: 'Months of expense runway' },
      { icon: BarChart2,    label: 'Vendor Risk Matrix', sub: 'Concentration warnings' },
      { icon: CheckCircle2, label: 'Actionable Advice', sub: 'Step-by-step grade fixes' },
    ],
  },
  {
    id: 'reports-tax',
    icon: FileSpreadsheet,
    title: 'Reports & Tax Planning',
    tag: 'Pillar 6',
    badge: { text: '1-Click PDF Export', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    desc: 'Visual reports with category breakdown, spending trends, income vs expense comparison, and 1-click executive PDF exports.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    activeBorder: 'border-amber-500/50 shadow-amber-500/10',
    activeDot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]',
    steps: [
      { icon: FileSpreadsheet, label: 'Executive PDF Digest', sub: 'Comprehensive financial report' },
      { icon: TrendingUp,      label: 'Income vs Expense',    sub: 'Net margin analytics' },
      { icon: Tag,             label: 'Tax Tagging (80C)',    sub: 'Sec 80C & GST classification' },
      { icon: ShieldCheck,     label: 'Audit Trail',          sub: 'Verified ledger history' },
    ],
  },
];

export const FeaturesSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="features" className="py-20 bg-transparent relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-purple-500/5 blur-[180px]" />

      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20 sm:mb-24 relative z-10"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141418] border border-purple-500/20 text-purple-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            <Orbit className="w-4 h-4 text-purple-400" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-outfit">
            6 Intelligent Pillars of <span className="bg-gradient-to-r from-[#FF5A5F] via-[#A855F7] to-[#00F2FE] bg-clip-text text-transparent">Wealth OS</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Everything you need to organize, protect, and grow your wealth in one unified platform.
          </p>
        </motion.div>

        {/* Dual Layout: Tightly Aligned Left Selector + Right 3D CardSwap Deck */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start relative z-10">
          
          {/* Left Column: Interactive Pillar List */}
          <div className="lg:col-span-5 space-y-2.5 pt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
              Explore Wealth OS Pillar:
            </p>
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              const isActive = activeStep === i;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActiveStep(i)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? `bg-[#09090B] ${pillar.activeBorder} text-white shadow-lg`
                      : 'bg-[#09090B]/60 border-zinc-900 text-slate-400 hover:border-zinc-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
                      isActive ? `${pillar.bgColor} ${pillar.color} scale-105` : 'bg-zinc-900 border-zinc-800 text-slate-400'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="truncate min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 shrink-0">{pillar.tag}</span>
                        <h4 className="text-sm font-bold font-outfit truncate">{pillar.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{pillar.badge.text}</p>
                    </div>
                  </div>

                  <div className={`w-2.5 h-2.5 rounded-full transition-all shrink-0 ml-2 ${isActive ? `${pillar.activeDot} scale-125` : 'bg-zinc-800'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: 3D GSAP CardSwap Component Container */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start items-center h-[520px] relative overflow-visible pl-0 lg:pl-4 pt-10 sm:pt-14">
            <div className="w-full h-full relative flex items-center justify-center lg:justify-start">
              <CardSwap
                width={480}
                height={480}
                cardDistance={16}
                verticalDistance={14}
                delay={3000}
                pauseOnHover={true}
                skewAmount={2}
                targetIndex={activeStep}
                onCardChange={(newIdx) => setActiveStep(newIdx)}
                onCardClick={(index) => setActiveStep(index % PILLARS.length)}
              >
                {PILLARS.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <Card key={pillar.id} className="p-6 overflow-y-auto [scrollbar-width:none] [::-webkit-scrollbar]:hidden flex flex-col justify-between space-y-3">
                      {/* Card Header */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-zinc-900 text-slate-400 border border-zinc-800">
                            {pillar.tag}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${pillar.badge.color}`}>
                            {pillar.badge.text}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 pt-0.5">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${pillar.bgColor} ${pillar.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-extrabold text-white font-outfit">{pillar.title}</h3>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed font-normal">{pillar.desc}</p>

                        {/* Pillar Feature Checklist */}
                        <div className="space-y-2 pt-2.5 border-t border-zinc-800/80">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Module Capabilities</p>
                          {pillar.steps.map(({ icon: StepIcon, label, sub }, i) => (
                            <div key={i} className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/60">
                              <div className={`p-1.5 rounded-lg bg-zinc-800 ${pillar.color}`}>
                                <StepIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-200 truncate leading-none">{label}</p>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">{sub}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </CardSwap>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
