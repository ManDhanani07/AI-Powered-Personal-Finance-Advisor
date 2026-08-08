import React from 'react';
import {
  MessageSquare,
  Plus,
  Sparkles,
  Calculator,
  TrendingUp,
  Target,
  Clock,
  ChevronRight,
} from 'lucide-react';

const HISTORICAL_THREADS = [
  { id: '1', title: 'Tax Optimization Strategy 80C', time: 'Today', active: true },
  { id: '2', title: 'Monthly Burn Rate Review', time: 'Yesterday', active: false },
  { id: '3', title: 'Emergency Vault Allocation', time: '3 days ago', active: false },
  { id: '4', title: 'Portfolio Rebalancing AY26', time: '1 week ago', active: false },
];

const PROMPT_TEMPLATES = [
  {
    icon: Calculator,
    title: 'Analyze Section 80C Tax Gap',
    prompt: 'How can I optimize my remaining Section 80C limit before March 31st?',
  },
  {
    icon: TrendingUp,
    title: 'Increase Savings Rate by 10%',
    prompt: 'Give me a 3-step action plan to increase my monthly savings rate to 35%.',
  },
  {
    icon: Target,
    title: 'Review Top Category Burn',
    prompt: 'Which spending categories have exceeded their monthly thresholds?',
  },
];

export const AIChatSidebar = ({
  onSelectPrompt,
  onNewChat,
}) => {
  return (
    <div className="flex flex-col h-full bg-bg-surface border-r border-border-subtle p-4 space-y-5 w-full">
      {/* Header & New Chat Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
              AI Copilot
            </h3>
            <p className="text-[11px] text-slate-400">GPT-4o Wealth Intelligence</p>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="p-2 rounded-xl border border-border-strong bg-bg-elevated hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="New Chat Thread"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompt Templates */}
      <div className="space-y-2">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Suggested Prompts
        </p>

        <div className="space-y-2">
          {PROMPT_TEMPLATES.map((tmpl, idx) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt(tmpl.prompt)}
                className="w-full p-2.5 rounded-2xl border border-border-subtle bg-bg-elevated/60 hover:bg-bg-elevated hover:border-primary-500/50 text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 truncate">
                    {tmpl.title}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation History Threads */}
      <div className="flex-1 overflow-y-auto space-y-2 pt-2 border-t border-border-subtle">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Recent Threads
        </p>

        <div className="space-y-1">
          {HISTORICAL_THREADS.map((thread) => (
            <div
              key={thread.id}
              className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center justify-between transition-colors ${
                thread.active
                  ? 'border-primary-500/50 bg-primary-500/10 text-primary-400 font-bold'
                  : 'border-transparent text-slate-400 hover:bg-bg-elevated hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{thread.title}</span>
              </div>
              <span className="text-[10px] text-slate-500">{thread.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIChatSidebar;
