import React from 'react';
import { motion } from 'framer-motion';

export const LiquidProgressGauge = ({ percentage = 45, color = '#6366F1' }) => {
  const safePct = Math.min(100, Math.max(0, percentage));
  // Y offset for wave fill (100% -> y=0, 0% -> y=100)
  const waveY = 100 - safePct;

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-border-strong bg-bg-elevated/80 shadow-inner overflow-hidden flex items-center justify-center flex-shrink-0">
      {/* SVG Liquid Fill Container */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`liquid-grad-${safePct}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Animated Wave Path */}
        <motion.path
          animate={{
            d: [
              `M 0 ${waveY} Q 25 ${waveY - 4} 50 ${waveY} T 100 ${waveY} L 100 100 L 0 100 Z`,
              `M 0 ${waveY} Q 25 ${waveY + 4} 50 ${waveY} T 100 ${waveY} L 100 100 L 0 100 Z`,
              `M 0 ${waveY} Q 25 ${waveY - 4} 50 ${waveY} T 100 ${waveY} L 100 100 L 0 100 Z`,
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
          }}
          fill={`url(#liquid-grad-${safePct})`}
        />
      </svg>

      {/* Percentage Center Overlay */}
      <div className="relative z-10 text-center drop-shadow-md">
        <span className="text-xl font-black text-white font-outfit">
          {safePct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default LiquidProgressGauge;
