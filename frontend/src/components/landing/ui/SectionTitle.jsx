import React from 'react';
import { motion } from 'framer-motion';

export const SectionTitle = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  highlightText,
  subtitle,
  align = 'center', // 'center' | 'left'
  className = '',
}) => {
  const alignStyles = align === 'center' ? 'text-center max-w-3xl mx-auto' : 'text-left max-w-3xl';

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`${alignStyles} ${className}`}
    >
      {badge && (
        <div
          className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-extrabold uppercase tracking-widest mb-4 shadow-sm ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 animate-pulse" />}
          <span>{badge}</span>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] font-outfit">
        {title}{' '}
        {highlightText && (
          <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-emerald-400 bg-clip-text text-transparent">
            {highlightText}
          </span>
        )}
      </h2>

      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionTitle;
