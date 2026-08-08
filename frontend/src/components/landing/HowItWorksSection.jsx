import React, { useState, useEffect } from 'react';
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
import SectionTitle from './ui/SectionTitle.jsx';

/* ─── Pipeline Node Data ──────────────────────────────────────────────── */
const NODES = [
  {
    id: 'transactions',
    stepIndex: 0,
    icon: ReceiptText,
    title: 'Add Transactions',
    tag: 'Step 1',
    color: 'from-blue-500 to-indigo-600',
    glow: '#6366f1',
    badge: { text: 'Instant categorization', color: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    desc: 'Log every financial event in seconds. Track income, expenses, and transfers with full metadata for a complete picture.',
    row: 0,
    steps: [
      { icon: PlusCircle,    label: 'Create an entry',      sub: 'Choose income, expense or transfer',  color: 'text-blue-400' },
      { icon: Tag,           label: 'Select category',      sub: 'Food, Travel, Salary, EMI, and more', color: 'text-indigo-400' },
      { icon: CreditCard,    label: 'Add payment details',  sub: 'Method, merchant, account link',      color: 'text-blue-300' },
      { icon: MessageCircle, label: 'Write a note',         sub: 'Optional memo for context',           color: 'text-indigo-300' },
      { icon: FolderOpen,    label: 'Filter & search',      sub: 'By date, category, or keyword',       color: 'text-blue-200' },
      { icon: TrendingUp,    label: 'View category stats',  sub: 'Spending trends per tag',             color: 'text-indigo-200' },
    ],
  },
  {
    id: 'budgets',
    stepIndex: 1,
    icon: Wallet,
    title: 'Budget Tracking',
    tag: 'Step 2',
    color: 'from-amber-500 to-orange-600',
    glow: '#f59e0b',
    badge: { text: 'Real-time utilization', color: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    desc: 'Set monthly spending limits per category and watch them update live as every transaction flows in automatically.',
    row: 0,
    steps: [
      { icon: FolderOpen,       label: 'Create a budget',     sub: 'Pick any spending category',         color: 'text-amber-400' },
      { icon: Sliders,          label: 'Set monthly limit',   sub: 'Custom cap amount per period',       color: 'text-orange-400' },
      { icon: TrendingUp,       label: 'Live utilization bar', sub: 'Spend vs limit updates instantly',  color: 'text-amber-300' },
      { icon: Bell,             label: 'Threshold alerts',    sub: 'Warned at 80% & 100% spend',        color: 'text-orange-300' },
      { icon: Activity,         label: 'Month-over-month',    sub: 'Compare spending across months',     color: 'text-amber-200' },
      { icon: CheckCircle2,     label: 'Budget health badge', sub: 'Green / Amber / Red status',        color: 'text-orange-200' },
    ],
  },
  {
    id: 'goals',
    stepIndex: 2,
    icon: Target,
    title: 'Savings Goals',
    tag: 'Step 3',
    color: 'from-emerald-500 to-teal-600',
    glow: '#10b981',
    badge: { text: 'AI-driven completion ETA', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    desc: 'Define saving milestones, contribute regularly, and let the AI forecast exactly when you will hit your target.',
    row: 0,
    steps: [
      { icon: PlusCircle,   label: 'Name your goal',         sub: 'Emergency fund, car, vacation…',    color: 'text-emerald-400' },
      { icon: CalendarDays, label: 'Set deadline & priority', sub: 'High, medium or low urgency',      color: 'text-teal-400' },
      { icon: Sliders,      label: 'Define target amount',   sub: 'Enter the total needed',             color: 'text-emerald-300' },
      { icon: CheckCircle2, label: 'Log contributions',      sub: 'Manual top-ups tracked over time',  color: 'text-teal-300' },
      { icon: TrendingUp,   label: 'Progress ring view',     sub: 'Visualize % complete at a glance',  color: 'text-emerald-200' },
      { icon: Zap,          label: 'AI completion forecast', sub: 'Projected finish date from savings', color: 'text-teal-200' },
    ],
  },
  {
    id: 'forecast',
    stepIndex: 3,
    icon: BarChart2,
    title: 'Prophet ML Forecasting',
    tag: 'Step 4',
    color: 'from-purple-500 to-violet-600',
    glow: '#8b5cf6',
    badge: { text: 'Meta Prophet time-series', color: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
    desc: "Meta's Prophet engine trains on your real history to project expenses, income, and savings up to 12 months ahead.",
    row: 1,
    steps: [
      { icon: SlidersHorizontal, label: 'Choose forecast type',  sub: 'Expense, income, savings or balance', color: 'text-purple-400' },
      { icon: Clock,             label: 'Select time horizon',   sub: '30, 90, 180, or 365 days ahead',     color: 'text-violet-400' },
      { icon: Activity,          label: 'Prophet ML trains',     sub: 'Learns seasonality from your data',   color: 'text-purple-300' },
      { icon: TrendingUp,        label: 'View projected curve',  sub: 'Smooth trend line with confidence',   color: 'text-violet-300' },
      { icon: BarChart2,         label: 'Scenario comparison',   sub: 'Best / Base / Worst case view',       color: 'text-purple-200' },
      { icon: Zap,               label: 'Anomaly detection',     sub: 'Flags unusual spending patterns',     color: 'text-violet-200' },
    ],
  },
  {
    id: 'health',
    stepIndex: 4,
    icon: HeartPulse,
    title: 'Financial Health Score',
    tag: 'Step 5',
    color: 'from-rose-500 to-pink-600',
    glow: '#f43f5e',
    badge: { text: 'A–F grade composite score', color: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
    desc: 'A single live grade (A–F) calculated from five weighted financial parameters, refreshing after every transaction.',
    row: 1,
    steps: [
      { icon: Activity,     label: 'Savings rate scored',    sub: 'What % of income do you save?',      color: 'text-rose-400' },
      { icon: Wallet,       label: 'Budget adherence',       sub: 'How well you stay within limits',    color: 'text-pink-400' },
      { icon: Target,       label: 'Goal progress rate',     sub: 'On-track or behind on milestones',   color: 'text-rose-300' },
      { icon: TrendingUp,   label: 'Spending stability',     sub: 'Variance in month-to-month spend',   color: 'text-pink-300' },
      { icon: BarChart2,    label: 'Composite grade issued', sub: 'Weighted A to F letter grade',       color: 'text-rose-200' },
      { icon: CheckCircle2, label: 'Improvement action list', sub: 'Exact steps to raise your grade',  color: 'text-pink-200' },
    ],
  },
  {
    id: 'ai',
    stepIndex: 5,
    icon: Bot,
    title: 'Gemini AI Copilot',
    tag: 'Step 6',
    color: 'from-cyan-500 to-blue-600',
    glow: '#06b6d4',
    badge: { text: 'Google Gemini 1.5 Flash', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
    desc: 'Chat naturally with Gemini. It reads your live transactions, budgets, goals, and health score before every reply.',
    row: 1,
    steps: [
      { icon: MessageCircle, label: 'Type in plain language', sub: 'No jargon or commands required',    color: 'text-cyan-400' },
      { icon: ArrowDownLeft, label: 'Live context loaded',    sub: 'All your data sent with query',     color: 'text-blue-400' },
      { icon: Bot,           label: 'Gemini 1.5 reasons',    sub: 'Personalised financial analysis',   color: 'text-cyan-300' },
      { icon: Send,          label: 'Actionable reply given', sub: 'Concrete steps, not generic tips', color: 'text-blue-300' },
      { icon: Clock,         label: 'History persisted',      sub: 'Full chat thread saved per session', color: 'text-cyan-200' },
      { icon: Zap,           label: 'Instant response',       sub: 'Streams response token-by-token',  color: 'text-blue-200' },
    ],
  },
];

/* ─── 3D Pipeline Node Card ───────────────────────────────────────────── */
const PipelineCard = ({ node, isVisible, isActive }) => {
  const Icon = node.icon;

  return (
    <motion.div
      initial={{ opacity: 0.25, scale: 0.96, y: 4 }}
      animate={{
        opacity: isVisible ? 1 : 0.25,
        scale: isActive ? 1.03 : isVisible ? 1 : 0.96,
        y: isActive ? -4 : isVisible ? 0 : 4,
      }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 18,
        mass: 0.8,
      }}
      className="relative rounded-2xl bg-bg-surface flex flex-col p-5 cursor-default border transition-all duration-350 ease-out"
      style={{
        flex: '1 1 0',
        minWidth: 0,
        borderColor: isActive
          ? `${node.glow}dd`
          : isVisible
          ? 'rgba(255,255,255,0.16)'
          : 'rgba(255,255,255,0.06)',
        boxShadow: isActive
          ? `0 20px 55px ${node.glow}45, 0 0 0 1.5px ${node.glow}60`
          : '0 4px 20px rgba(0,0,0,0.2)',
        transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
      }}
    >
      {/* Corner glow */}
      <motion.div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${node.color} blur-3xl pointer-events-none`}
        animate={{ opacity: isActive ? 0.35 : 0.05 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shimmer top line */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${node.glow}, transparent)`,
          opacity: isActive ? 1 : 0.2,
        }}
      />

      {/* ── Header row ── */}
      <div className="flex items-center justify-end relative z-10">
        <div
          className={`p-2.5 rounded-xl bg-gradient-to-br ${node.color} text-white shadow-lg transition-transform duration-300 ${
            isActive ? 'scale-110' : 'scale-100'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* ── Title ── */}
      <h4 className="mt-3 text-[15px] font-extrabold text-white leading-snug relative z-10">{node.title}</h4>

      {/* ── Description ── */}
      <p className="mt-1.5 text-[11px] text-white/50 leading-relaxed relative z-10">{node.desc}</p>

      {/* ── Divider ── */}
      <div className="my-3 h-px bg-white/5 relative z-10" />

      {/* ── Steps list ── */}
      <div className="space-y-1.5 relative z-10 flex-1">
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/25 mb-2">How it works</p>
        {node.steps.map(({ icon: StepIcon, label, sub, color }, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl bg-white/[0.03] transition-colors"
          >
            <div className={`mt-0.5 flex-shrink-0 p-1 rounded-lg bg-white/5 ${color}`}>
              <StepIcon className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-white/80 leading-none truncate">{label}</p>
              <p className="text-[9px] text-white/30 mt-0.5 leading-snug">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Capability badge ── */}
      <div className="mt-4 relative z-10 flex items-center justify-start">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold ${node.badge.color}`}>
          <Zap className="w-2.5 h-2.5" />
          {node.badge.text}
        </div>
      </div>
    </motion.div>
  );
};


/* ─── Animated Arrow Connector ────────────────────────────────────────── */
const ARROW_W = 56;

const HArrow = ({ color, isActive, reversed = false }) => (
  <div className="hidden lg:flex items-center justify-center relative flex-shrink-0" style={{ width: ARROW_W, marginTop: '48px' }}>
    <div className="relative w-full flex items-center" style={{ flexDirection: reversed ? 'row-reverse' : 'row' }}>
      {/* Moving line */}
      <div className="flex-1 h-px overflow-hidden relative" style={{ background: isActive ? `${color}80` : 'rgba(255,255,255,0.08)' }}>
        {isActive && (
          <motion.div
            className="absolute inset-0 h-full"
            style={{ background: `linear-gradient(${reversed ? '270deg' : '90deg'}, transparent, ${color}, transparent)` }}
            animate={{ x: reversed ? ['100%', '-100%'] : ['-100%', '100%'] }}
            transition={{ duration: 0.45, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
      {/* Arrowhead */}
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderLeft: !reversed ? `7px solid ${isActive ? color : 'rgba(255,255,255,0.15)'}` : undefined,
          borderRight: reversed ? `7px solid ${isActive ? color : 'rgba(255,255,255,0.15)'}` : undefined,
        }}
      />
    </div>

    {/* Flowing laser dot */}
    {isActive && (
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full pointer-events-none z-20"
        style={{ background: color, boxShadow: `0 0 10px ${color}, 0 0 16px ${color}`, top: '50%', transform: 'translateY(-50%)' }}
        animate={reversed
          ? { right: ['0%', '100%'], opacity: [0, 1, 1, 0] }
          : { left: ['0%', '100%'], opacity: [0, 1, 1, 0] }
        }
        transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
      />
    )}
  </div>
);

const VArrow = ({ color, isActive }) => (
  <div className="hidden lg:flex justify-end items-start w-full">
    <div className="flex flex-col items-center relative" style={{ width: `calc((100% - ${2 * ARROW_W}px) / 3)` }}>
      {/* Line */}
      <div className="w-px overflow-hidden relative" style={{ height: 44, background: isActive ? `${color}80` : 'rgba(255,255,255,0.08)' }}>
        {isActive && (
          <motion.div
            className="absolute inset-0 w-full"
            style={{ background: `linear-gradient(180deg, transparent, ${color}, transparent)` }}
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 0.45, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
      {/* Arrowhead pointing down */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `7px solid ${isActive ? color : 'rgba(255,255,255,0.15)'}`,
        }}
      />

      {/* Laser dot down */}
      {isActive && (
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full pointer-events-none z-20"
          style={{ background: color, boxShadow: `0 0 10px ${color}`, left: '50%', transform: 'translateX(-50%)' }}
          animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  </div>
);

/* ─── Main Section ─────────────────────────────────────────────────────── */
export const HowItWorksSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fast Progressive Step Sequence (550ms)
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % NODES.length);
    }, 550);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const row0 = NODES.filter(n => n.row === 0); // Step 1, 2, 3
  const row1 = [...NODES.filter(n => n.row === 1)].reverse(); // Step 4, 5, 6 (reversed for RTL flow)

  return (
    <section id="how-it-works" className="py-20 bg-bg-surface/50 border-t border-border-subtle relative overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary-500/8 blur-[160px]" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          badge="Sequential Workflow Engine"
          badgeIcon={Sparkles}
          title="Your Financial Data"
          highlightText="Pipeline"
          subtitle="Watch how every transaction automatically flows through six connected modules in real-time."
          className="mb-12"
        />

        {/* Pipeline canvas */}
        <div className="py-6 px-1">
          <div className="flex flex-col gap-0">

            {/* ROW 1: Step 1 (Transactions) → Step 2 (Budgets) → Step 3 (Goals) */}
            <div className="flex items-start w-full">
              {row0.map((node, i) => {
                const isVisible = currentStep >= node.stepIndex;
                const isActive = currentStep === node.stepIndex;
                const isArrowActive = currentStep > node.stepIndex;

                return (
                  <React.Fragment key={node.id}>
                    <PipelineCard node={node} isVisible={isVisible} isActive={isActive} />
                    {i < row0.length - 1 && (
                      <HArrow color={row0[i + 1].glow} isActive={isArrowActive} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Vertical drop arrow on right side (Step 3 → Step 4) */}
            <VArrow
              color={NODES.find(n => n.id === 'forecast').glow}
              isActive={currentStep > 2}
            />

            {/* ROW 2: Step 6 (AI Copilot) ← Step 5 (Health) ← Step 4 (Forecast) */}
            <div className="flex items-start w-full">
              {row1.map((node, i) => {
                const isVisible = currentStep >= node.stepIndex;
                const isActive = currentStep === node.stepIndex;
                const isArrowActive = currentStep > node.stepIndex;

                return (
                  <React.Fragment key={node.id}>
                    <PipelineCard node={node} isVisible={isVisible} isActive={isActive} />
                    {i < row1.length - 1 && (
                      <HArrow color={row1[i + 1].glow} isActive={isArrowActive} reversed />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
