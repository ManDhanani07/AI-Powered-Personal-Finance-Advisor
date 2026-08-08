import React from 'react';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/formatters.js';

export const DashboardHeader = ({ summary }) => {
  const today = new Date();
  const formattedDate = formatDate(today, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle"
    >
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
          {summary?.greeting || 'Welcome Back to Your Wealth Engine'}
        </h1>

        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-medium">
          <Calendar className="h-3.5 w-3.5 text-primary-400" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
