import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';
import { toast } from 'react-toastify';

/**
 * Format markdown text with bold (**text**), bullet points, and headers
 */
const renderFormattedMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Process Headers (### Header)
    if (line.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className="text-sm font-extrabold text-white pt-2 pb-1 font-outfit">
          {renderInlineFormatting(line.replace('### ', ''))}
        </h4>
      );
    }

    if (line.startsWith('## ')) {
      return (
        <h3 key={lineIdx} className="text-base font-extrabold text-white pt-2 pb-1 font-outfit">
          {renderInlineFormatting(line.replace('## ', ''))}
        </h3>
      );
    }

    // Process Bullet Points (• or - or *)
    if (line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const cleanLine = line.trim().replace(/^([•\-\*])\s*/, '');
      return (
        <div key={lineIdx} className="flex items-start space-x-2 py-0.5 pl-1">
          <span className="text-primary-400 font-bold select-none">•</span>
          <span className="flex-1">{renderInlineFormatting(cleanLine)}</span>
        </div>
      );
    }

    // Process Numbered Lists (1. 2. 3.)
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex items-start space-x-2 py-0.5 pl-1">
          <span className="text-indigo-400 font-extrabold select-none">{numMatch[1]}.</span>
          <span className="flex-1">{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
    }

    // Empty lines
    if (!line.trim()) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    // Regular paragraphs
    return (
      <p key={lineIdx} className="py-0.5">
        {renderInlineFormatting(line)}
      </p>
    );
  });
};

/**
 * Parse inline bold (**bold**) and inline code (`code`)
 */
const renderInlineFormatting = (textStr) => {
  if (!textStr) return null;
  // First handle **bold**, then `code`, then *italic/merchant*
  const parts = textStr.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const content = part.slice(2, -2);
      return (
        <strong key={idx} className="font-extrabold text-white dark:text-slate-100 font-outfit">
          {content}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const content = part.slice(1, -1);
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300 font-mono text-[11px]">
          {content}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const content = part.slice(1, -1);
      return (
        <span key={idx} className="font-bold text-slate-200">
          {content}
        </span>
      );
    }
    // Remove any leftover isolated asterisks
    return part.replace(/\*/g, '');
  });
};

export const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user' || message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text || message.answer || '');
    setCopied(true);
    toast.success('Copied to clipboard!', { icon: '📋' });
    setTimeout(() => setCopied(false), 2000);
  };

  const textContent = message.text || message.answer || '';
  const timeFormatted = message.created_at
    ? formatDate(message.created_at, { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
            : 'bg-gradient-to-br from-primary-500 to-teal-500'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content Bubble */}
      <div
        className={`group relative max-w-xl rounded-3xl p-4 shadow-glass backdrop-blur-md space-y-2 ${
          isUser
            ? 'rounded-tr-none bg-primary-600 text-white font-medium'
            : 'rounded-tl-none border border-border-subtle bg-bg-surface text-slate-200 dark:text-slate-100'
        }`}
      >
        {/* Header meta */}
        <div className="flex items-center justify-between gap-4 text-[10px] font-bold opacity-75">
          <span className="uppercase tracking-wider font-outfit">
            {isUser ? 'You' : 'Gemini AI Advisor'}
          </span>
          <span className="font-mono">{timeFormatted}</span>
        </div>

        {/* Formatted Content */}
        <div className="text-xs leading-relaxed font-sans space-y-1">
          {isUser ? textContent : renderFormattedMarkdown(textContent)}
        </div>

        {/* Copy Button for AI Messages */}
        {!isUser && (
          <div className="pt-2 flex justify-end border-t border-border-subtle/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="px-2 py-1 rounded-lg bg-bg-elevated hover:bg-border-strong text-[10px] font-bold text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
