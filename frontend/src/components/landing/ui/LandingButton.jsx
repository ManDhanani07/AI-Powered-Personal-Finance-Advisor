import React from 'react';
import { motion } from 'framer-motion';

export const LandingButton = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'right',
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold font-outfit rounded-2xl transition-all duration-300 select-none overflow-hidden';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'text-white bg-gradient-to-r from-primary-500 via-blue-600 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.03] active:scale-[0.98]',
    secondary:
      'text-slate-100 bg-bg-surface/80 border border-border-strong backdrop-blur-md hover:bg-bg-elevated hover:border-primary-500/50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
    outline:
      'text-primary-400 border-2 border-primary-500/40 bg-primary-500/10 hover:bg-primary-500/20 hover:border-primary-500 hover:scale-[1.02] active:scale-[0.98]',
    ghost:
      'text-slate-300 hover:text-white hover:bg-bg-elevated/60 active:scale-[0.98]',
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} transition-transform group-hover:-translate-x-0.5`} />
      )}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} transition-transform group-hover:translate-x-1`} />
      )}
    </motion.button>
  );
};

export default LandingButton;
