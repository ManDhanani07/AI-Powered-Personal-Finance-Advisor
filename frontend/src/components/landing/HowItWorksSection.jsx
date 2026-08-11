import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ReceiptText,
  Bot,
  Target,
  HeartPulse,
  BarChart2,
  Wallet,
  Sparkles,
  Tag,
  CalendarDays,
  CreditCard,
  Bell,
  TrendingUp,
  CheckCircle2,
  Sliders,
  Clock,
  MessageCircle,
  Send,
  SlidersHorizontal,
  Activity,
  ArrowDownLeft,
  PlusCircle,
  FolderOpen,
  Zap,
} from 'lucide-react';
import CardSwap, { Card } from './CardSwap.jsx';

const NODES = [
  {
    id: 'transactions',
    icon: ReceiptText,
    title: 'Add Transactions',
    tag: 'Step 1',
    badge: { text: 'Instant Categorization', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    desc: 'Log every financial event in seconds. Track income, expenses, and transfers with full metadata for a complete picture.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    steps: [
      { icon: PlusCircle,    label: 'Create an entry',      sub: 'Choose income, expense or transfer',  color: 'text-emerald-400' },
      { icon: Tag,           label: 'Select category',      sub: 'Food, Travel, Salary, EMI, and more', color: 'text-emerald-400' },
      { icon: CreditCard,    label: 'Add payment details',  sub: 'Method, merchant, account link',      color: 'text-slate-300' },
      { icon: MessageCircle, label: 'Write a note',         sub: 'Optional memo for context',           color: 'text-slate-300' },
      { icon: FolderOpen,    label: 'Filter & search',      sub: 'By date, category, or keyword',       color: 'text-slate-400' },
      { icon: TrendingUp,    label: 'View category stats',  sub: 'Spending trends per tag',             color: 'text-slate-400' },
    ],
  },
  {
    id: 'budgets',
    icon: Wallet,
    title: 'Budget Tracking',
    tag: 'Step 2',
    badge: { text: 'Real-Time Utilization', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    desc: 'Set monthly spending limits per category and watch them update live as every transaction flows in automatically.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/20',
    steps: [
      { icon: FolderOpen,       label: 'Create a budget',     sub: 'Pick any spending category',         color: 'text-teal-400' },
      { icon: Sliders,          label: 'Set monthly limit',   sub: 'Custom cap amount per period',       color: 'text-teal-400' },
      { icon: TrendingUp,       label: 'Live utilization bar', sub: 'Spend vs limit updates instantly',  color: 'text-slate-300' },
      { icon: Bell,             label: 'Threshold alerts',    sub: 'Warned at 80% & 100% spend',        color: 'text-slate-300' },
      { icon: Activity,         label: 'Month-over-month',    sub: 'Compare spending across months',     color: 'text-slate-400' },
      { icon: CheckCircle2,     label: 'Budget health badge', sub: 'Green / Amber / Red status',        color: 'text-slate-400' },
    ],
  },
  {
    id: 'goals',
    icon: Target,
    title: 'Savings Goals',
    tag: 'Step 3',
    badge: { text: 'AI Completion ETA', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    desc: 'Define saving milestones, contribute regularly, and let the AI forecast exactly when you will hit your target.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    steps: [
      { icon: PlusCircle,   label: 'Name your goal',         sub: 'Emergency fund, car, vacation…',    color: 'text-cyan-400' },
      { icon: CalendarDays, label: 'Set deadline & priority', sub: 'High, medium or low urgency',      color: 'text-cyan-400' },
      { icon: Sliders,      label: 'Define target amount',   sub: 'Enter the total needed',             color: 'text-slate-300' },
      { icon: CheckCircle2, label: 'Log contributions',      sub: 'Manual top-ups tracked over time',  color: 'text-slate-300' },
      { icon: TrendingUp,   label: 'Progress ring view',     sub: 'Visualize % complete at a glance',  color: 'text-slate-400' },
      { icon: Zap,          label: 'AI completion forecast', sub: 'Projected finish date from savings', color: 'text-slate-400' },
    ],
  },
  {
    id: 'forecast',
    icon: BarChart2,
    title: 'Prophet ML Forecasting',
    tag: 'Step 4',
    badge: { text: 'Meta Prophet Time-Series', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    desc: "Meta's Prophet engine trains on your real history to project expenses, income, and savings up to 12 months ahead.",
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    steps: [
      { icon: SlidersHorizontal, label: 'Choose forecast type',  sub: 'Expense, income, savings or balance', color: 'text-emerald-400' },
      { icon: Clock,             label: 'Select time horizon',   sub: '30, 90, 180, or 365 days ahead',     color: 'text-emerald-400' },
      { icon: Activity,          label: 'Prophet ML trains',     sub: 'Learns seasonality from your data',   color: 'text-slate-300' },
      { icon: TrendingUp,        label: 'View projected curve',  sub: 'Smooth trend line with confidence',   color: 'text-slate-300' },
      { icon: BarChart2,         label: 'Scenario comparison',   sub: 'Best / Base / Worst case view',       color: 'text-slate-400' },
      { icon: Zap,               label: 'Anomaly detection',     sub: 'Flags unusual spending patterns',     color: 'text-slate-400' },
    ],
  },
  {
    id: 'health',
    icon: HeartPulse,
    title: 'Financial Health Score',
    tag: 'Step 5',
    badge: { text: 'Composite Score Grade', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    desc: 'A single live score calculated from five weighted financial parameters, refreshing after every transaction.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/20',
    steps: [
      { icon: Activity,     label: 'Savings rate scored',    sub: 'What % of income do you save?',      color: 'text-teal-400' },
      { icon: Wallet,       label: 'Budget adherence',       sub: 'How well you stay within limits',    color: 'text-teal-400' },
      { icon: Target,       label: 'Goal progress rate',     sub: 'On-track or behind on milestones',   color: 'text-slate-300' },
      { icon: TrendingUp,   label: 'Spending stability',     sub: 'Variance in month-to-month spend',   color: 'text-slate-300' },
      { icon: BarChart2,    label: 'Composite grade issued', sub: 'Weighted A to F letter grade',       color: 'text-slate-400' },
      { icon: CheckCircle2, label: 'Improvement action list', sub: 'Exact steps to raise your grade',  color: 'text-slate-400' },
    ],
  },
  {
    id: 'ai',
    icon: Bot,
    title: 'Gemini AI Copilot',
    tag: 'Step 6',
    badge: { text: 'Google Gemini 1.5 Pro', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    desc: 'Chat naturally with Gemini. It reads your live transactions, budgets, goals, and health score before every reply.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    steps: [
      { icon: MessageCircle, label: 'Type in plain language', sub: 'No jargon or commands required',    color: 'text-emerald-400' },
      { icon: ArrowDownLeft, label: 'Live context loaded',    sub: 'All your data sent with query',     color: 'text-emerald-400' },
      { icon: Bot,           label: 'Gemini 1.5 reasons',    sub: 'Personalised financial analysis',   color: 'text-slate-300' },
      { icon: Send,          label: 'Actionable reply given', sub: 'Concrete steps, not generic tips', color: 'text-slate-300' },
      { icon: Clock,         label: 'History persisted',      sub: 'Full chat thread saved per session', color: 'text-slate-400' },
    ],
  },
];

export const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 bg-[#000000] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[180px]" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#09090B] border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Sequential Workflow Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-outfit leading-tight">
            How Your Financial OS Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            A seamless six-step 3D workflow from transaction entry to Gemini AI advisory.
          </p>
        </motion.div>

        {/* Dual Layout: Left Step Navigation + Right 3D CardSwap Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Interactive Workflow Step List */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">
              Select Pipeline Stage:
            </p>
            {NODES.map((node, i) => {
              const Icon = node.icon;
              const isActive = activeStep === i;
              return (
                <button
                  key={node.id}
                  onClick={() => setActiveStep(i)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? 'bg-[#09090B] border-emerald-500/40 text-white shadow-lg'
                      : 'bg-transparent border-zinc-900 text-slate-400 hover:border-zinc-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                      isActive ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 scale-105' : 'bg-zinc-900 border-zinc-800 text-slate-400'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">{node.tag}</span>
                        <h4 className="text-sm font-bold font-outfit truncate">{node.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{node.badge.text}</p>
                    </div>
                  </div>

                  <div className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-emerald-400 scale-125 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-800'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: 3D GSAP CardSwap Component Container */}
          <div className="lg:col-span-7 flex justify-center items-center py-6 min-h-[600px] relative overflow-visible">
            <div className="w-full h-[560px] relative flex items-center justify-center pt-4">
              <CardSwap
                width={420}
                height={520}
                cardDistance={20}
                verticalDistance={20}
                delay={3500}
                pauseOnHover={true}
                skewAmount={2}
                targetIndex={activeStep}
                onCardChange={(newIdx) => setActiveStep(newIdx)}
                onCardClick={(index) => setActiveStep(index % NODES.length)}
              >
                {NODES.map((node) => {
                  const Icon = node.icon;
                  return (
                    <Card key={node.id} className="p-5 sm:p-6 overflow-y-auto [scrollbar-width:none] [::-webkit-scrollbar]:hidden flex flex-col justify-between space-y-3">
                      {/* Card Header */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-zinc-900 text-slate-400 border border-zinc-800">
                            {node.tag}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${node.badge.color}`}>
                            {node.badge.text}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 pt-0.5">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${node.bgColor} ${node.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-extrabold text-white font-outfit">{node.title}</h3>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed font-normal">{node.desc}</p>

                        {/* Pipeline Checklist */}
                        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Pipeline Flow</p>
                          {node.steps.map(({ icon: StepIcon, label, sub, color }, i) => (
                            <div key={i} className="flex items-center space-x-2.5 p-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/50">
                              <div className={`p-1 rounded-lg bg-zinc-800 ${color}`}>
                                <StepIcon className="w-3 h-3" />
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

export default HowItWorksSection;
