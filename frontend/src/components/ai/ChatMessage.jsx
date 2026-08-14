import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  Wallet,
  Tag,
  CreditCard,
  Building2,
  Layers,
  AlertTriangle,
  Activity,
  ArrowRight,
  ThumbsUp,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';
import { toast } from 'react-toastify';
import AIInteractiveChart from './AIInteractiveChart.jsx';

/**
 * Strips markdown tags (**, *, `, _)
 */
const stripMarkdown = (str) => {
  if (!str) return '';
  return str
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .trim();
};

/**
 * Parses raw text to check if it's a structured Transaction creation/update response
 */
const parseTransactionData = (text) => {
  if (!text) return null;
  const isTxCreated =
    text.includes('Transaction Created') ||
    text.includes('Saved to PostgreSQL') ||
    text.includes('Saved to Ledger') ||
    text.includes('Recorded Successfully');
  if (!isTxCreated) return null;

  const lines = text.split('\n');
  const fields = {};
  let updatedTotals = {};

  lines.forEach((line) => {
    const clean = line.replace(/^[•\-\*]\s*/, '').trim();
    if (clean.includes(':')) {
      const [key, ...val] = clean.split(':');
      const k = stripMarkdown(key).toLowerCase();
      const v = stripMarkdown(val.join(':'))
        .replace(/\*\(Linked to PostgreSQL\)\*/gi, '')
        .trim();

      if (k.includes('title')) fields.title = v;
      if (k.includes('type')) fields.type = v;
      if (k.includes('amount')) fields.amount = v;
      if (k.includes('category')) fields.category = v;
      if (k.includes('merchant')) fields.merchant = v;
      if (k.includes('payment') || k.includes('method')) fields.method = v;
      if (k.includes('transaction number') || k.includes('tx') || k.includes('reference')) fields.txNum = v;
      if (k.includes('total monthly income')) updatedTotals.income = v;
      if (k.includes('total monthly expenses')) updatedTotals.expenses = v;
    }
  });

  return { fields, updatedTotals };
};

/**
 * Renders inline bold (**text**), inline code (`code`), and currency/metrics emphasis
 */
const renderInlineFormatting = (textStr) => {
  if (!textStr) return null;
  const cleanStr = textStr
    .replace(/live postgresql ledger/gi, 'live ledger')
    .replace(/postgresql/gi, 'ledger');

  const parts = cleanStr.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const content = part.slice(2, -2);
      const isPercent = /^\d+(\.\d+)?%$/.test(content.trim());
      const isCurrency = /^₹?\s*[\d,]+(\.\d+)?([LKCrk])?$/i.test(content.trim());

      if (isPercent || isCurrency) {
        return (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black font-outfit text-xs"
          >
            {content}
          </span>
        );
      }

      return (
        <strong key={idx} className="font-black text-white font-outfit">
          {content}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const content = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]"
        >
          {content}
        </code>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const content = part.slice(1, -1);
      return (
        <span key={idx} className="font-semibold text-emerald-300">
          {content}
        </span>
      );
    }

    return part;
  });
};

/**
 * Checks for table blocks in text lines
 */
const renderMarkdownTable = (tableLines, tableKey) => {
  if (!tableLines || tableLines.length < 2) return null;

  const rows = tableLines
    .filter((line) => !line.includes('---'))
    .map((line) =>
      line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell, i, arr) => i > 0 && i < arr.length - 1)
    );

  if (rows.length === 0) return null;
  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  return (
    <div key={tableKey} className="my-3 overflow-x-auto rounded-2xl border border-zinc-800 bg-[#0B0C10] shadow-glass">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#12131A] text-slate-300 font-outfit uppercase text-[10px] tracking-wider border-b border-zinc-800">
          <tr>
            {headerRow.map((col, idx) => (
              <th key={idx} className="px-3.5 py-2.5 font-black text-white">
                {stripMarkdown(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-zinc-800/40 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2 text-slate-200 font-sans">
                  {renderInlineFormatting(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Render structured section headers
 */
const renderSectionHeader = (title, key) => {
  const cleanTitle = title.toLowerCase();

  let icon = <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
  let badgeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';

  if (cleanTitle.includes('summary')) {
    icon = <Activity className="w-3.5 h-3.5 text-emerald-400" />;
    badgeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  } else if (cleanTitle.includes('risk') || cleanTitle.includes('warning')) {
    icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    badgeColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  } else if (cleanTitle.includes('going well') || cleanTitle.includes('positive')) {
    icon = <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />;
    badgeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  } else if (cleanTitle.includes('recommend') || cleanTitle.includes('action')) {
    icon = <ArrowRight className="w-3.5 h-3.5 text-purple-400" />;
    badgeColor = 'text-purple-400 border-purple-500/30 bg-purple-500/10';
  }

  return (
    <div key={key} className="pt-3 pb-1 flex items-center space-x-2">
      <span className={`p-1 rounded-lg border ${badgeColor} flex items-center justify-center shrink-0`}>
        {icon}
      </span>
      <h4 className="text-xs font-black uppercase tracking-wider text-white font-outfit">
        {renderInlineFormatting(title)}
      </h4>
    </div>
  );
};

/**
 * Main Formatted Content Renderer
 */
const renderFormattedContent = (text) => {
  if (!text) return null;

  const txData = parseTransactionData(text);
  if (txData && txData.fields.title) {
    const { fields, updatedTotals } = txData;
    return (
      <div className="space-y-3 pt-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-black shadow-sm font-outfit">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Transaction Recorded Successfully</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#09090B] p-4 space-y-3 shadow-glass relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-500" />
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
            <div>
              <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider font-outfit">Title</p>
              <h4 className="text-sm font-black text-white font-outfit mt-0.5">{fields.title}</h4>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider font-outfit">Amount</p>
              <p className="text-lg font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent font-outfit tracking-tight mt-0.5">{fields.amount}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {fields.category && (
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center space-x-1 font-outfit">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span>Category</span>
                </span>
                <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] font-outfit">
                  {fields.category}
                </span>
              </div>
            )}

            {fields.type && (
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center space-x-1 font-outfit">
                  <Layers className="w-3 h-3 text-rose-400" />
                  <span>Type</span>
                </span>
                <span className="inline-block px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px] font-outfit">
                  {fields.type}
                </span>
              </div>
            )}

            {fields.merchant && (
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center space-x-1 font-outfit">
                  <Building2 className="w-3 h-3 text-cyan-400" />
                  <span>Merchant</span>
                </span>
                <span className="inline-block px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] font-outfit">
                  {fields.merchant}
                </span>
              </div>
            )}

            {fields.method && (
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center space-x-1 font-outfit">
                  <CreditCard className="w-3 h-3 text-purple-400" />
                  <span>Payment</span>
                </span>
                <span className="inline-block px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-[10px] font-outfit">
                  {fields.method}
                </span>
              </div>
            )}
          </div>
        </div>

        {(updatedTotals.income || updatedTotals.expenses) && (
          <div className="rounded-xl bg-[#141418] border border-zinc-800 p-2.5 flex flex-wrap items-center justify-between text-xs font-outfit gap-2">
            <span className="text-slate-300 font-bold flex items-center space-x-2 text-[11px]">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Updated Ledger Totals</span>
            </span>
            <div className="flex items-center space-x-3 text-[11px]">
              {updatedTotals.income && <span className="text-white font-extrabold">Income: <span className="text-emerald-400">{updatedTotals.income}</span></span>}
              {updatedTotals.expenses && <span className="text-white font-extrabold">Expenses: <span className="text-rose-400">{updatedTotals.expenses}</span></span>}
            </div>
          </div>
        )}
      </div>
    );
  }

  const lines = text.split('\n');
  const elements = [];
  let tableBuffer = [];
  let chartBuffer = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for chart block start
    if (line.trim().startsWith('```chart') || line.trim().startsWith('```json:chart')) {
      chartBuffer = [];
      continue;
    }

    if (chartBuffer !== null) {
      if (line.trim().startsWith('```')) {
        try {
          const parsed = JSON.parse(chartBuffer.join('\n'));
          elements.push(<AIInteractiveChart key={`chart-${i}`} chartData={parsed} />);
        } catch (err) {
          console.warn('Failed to parse AI chart data JSON:', err);
        }
        chartBuffer = null;
      } else {
        chartBuffer.push(line);
      }
      continue;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      tableBuffer.push(line.trim());
      continue;
    } else if (tableBuffer.length > 0) {
      elements.push(renderMarkdownTable(tableBuffer, `table-${i}`));
      tableBuffer = [];
    }

    if (line.startsWith('### ')) {
      elements.push(renderSectionHeader(line.replace('### ', ''), `h3-${i}`));
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-sm font-black text-white pt-3 pb-1 font-outfit border-b border-zinc-800 mb-1">
          {renderInlineFormatting(line.replace('## ', ''))}
        </h3>
      );
      continue;
    }

    if (line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const cleanLine = line.trim().replace(/^([•\-\*])\s*/, '');
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start space-x-2 py-0.5 pl-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="flex-1 text-slate-200 leading-relaxed text-xs">{renderInlineFormatting(cleanLine)}</span>
        </div>
      );
      continue;
    }

    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start space-x-2 py-0.5 pl-1">
          <span className="text-cyan-400 font-bold font-outfit text-xs shrink-0">{numMatch[1]}.</span>
          <span className="flex-1 text-slate-200 leading-relaxed text-xs">{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    if (!line.trim()) {
      elements.push(<div key={`blank-${i}`} className="h-1" />);
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="py-0.5 text-slate-200 leading-relaxed text-xs font-normal break-words">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  if (tableBuffer.length > 0) {
    elements.push(renderMarkdownTable(tableBuffer, `table-end`));
  }

  return elements;
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
      id={`msg-${message.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start space-x-2.5 my-2.5 w-full ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar Icon Badge */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold'
            : 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
        }`}
      >
        {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-slate-950" />}
      </div>

      {/* Message Card Body with Strict Max-Width Bounds */}
      <div
        className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-2xl backdrop-blur-md space-y-1.5 overflow-hidden break-words ${
          isUser
            ? 'rounded-tr-xs bg-[#12131A] border border-zinc-800 text-white font-medium ml-auto'
            : 'rounded-tl-xs border border-zinc-800/90 bg-[#101117] text-slate-100 mr-auto'
        }`}
      >
        {/* AI Top Accent Glow */}
        {!isUser && (
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 opacity-60" />
        )}

        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-3 text-[10px] font-extrabold uppercase text-slate-400 pb-1 border-b border-zinc-800/60 font-outfit">
          <span className="tracking-wider flex items-center space-x-1.5">
            <span className={isUser ? 'text-cyan-400' : 'text-emerald-400 font-black'}>
              {isUser ? 'YOU' : 'GEMINI AI ADVISOR'}
            </span>
          </span>
          <span className="font-mono text-slate-400">{timeFormatted}</span>
        </div>

        {/* Content Stream */}
        <div className="text-xs leading-relaxed font-sans space-y-0.5 break-words">
          {isUser ? <p className="break-words">{textContent}</p> : renderFormattedContent(textContent)}
        </div>

        {/* Copy Action Button */}
        {!isUser && (
          <div className="pt-1.5 flex justify-end border-t border-zinc-800/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="px-2 py-0.5 rounded-lg bg-[#141418] hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
