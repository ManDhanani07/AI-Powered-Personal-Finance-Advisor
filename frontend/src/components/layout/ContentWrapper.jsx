import React from 'react';
import { motion } from 'framer-motion';

export const ContentWrapper = ({ children, className = '' }) => {
  return (
    <main className="flex-1 p-3 sm:p-6 pb-20 md:pb-6 min-w-0 max-w-screen-2xl w-full mx-auto transition-all duration-200">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`rounded-3xl border border-border-subtle bg-bg-surface/60 dark:bg-bg-surface/40 backdrop-blur-md p-4 sm:p-6 shadow-glass min-h-[calc(100vh-120px)] ${className}`}
      >
        {children}
      </motion.div>
    </main>
  );
};

export default ContentWrapper;
