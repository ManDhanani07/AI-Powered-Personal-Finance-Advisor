import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, HelpCircle } from 'lucide-react';

const SUGGESTIONS = [
  'Where did I spend the most this month?',
  'How can I save ₹5000?',
  'What is my Financial Health Score status?',
  'Which category budget should I reduce?',
  'Am I following my envelope budget limits?',
  'How close am I to my savings goals?',
];

export const SuggestedQuestions = ({ onSelectQuestion, disabled }) => {
  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-400 font-outfit px-1">
        <Sparkles className="w-3.5 h-3.5 text-primary-400" />
        <span>Suggested AI Prompts</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((q, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
            onClick={() => onSelectQuestion(q)}
            className="px-3.5 py-2 rounded-2xl bg-bg-elevated/80 hover:bg-primary-500/15 border border-border-subtle hover:border-primary-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all text-left flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary-400 shrink-0" />
            <span>{q}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
