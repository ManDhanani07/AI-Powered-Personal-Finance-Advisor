import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DATE_OPTIONS = [
  'This Month',
  'Last 30 Days',
  'Previous Month',
  'Q3 2026',
  'Year to Date',
  'Custom Range',
];

export const DateFilterDropdown = () => {
  const [selected, setSelected] = useState('This Month');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-elevated text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
      >
        <Calendar className="w-3.5 h-3.5 text-primary-500" />
        <span>{selected}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-2xl bg-bg-surface border border-border-strong shadow-xl z-50 p-1.5"
          >
            {DATE_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  selected === option
                    ? 'bg-primary-500/10 text-primary-500 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-bg-elevated'
                }`}
              >
                <span>{option}</span>
                {selected === option && <Check className="w-3.5 h-3.5 text-primary-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateFilterDropdown;
