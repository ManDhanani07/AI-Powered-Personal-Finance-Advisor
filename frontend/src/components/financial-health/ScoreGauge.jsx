import React from 'react';
import { motion } from 'framer-motion';

export const ScoreGauge = ({ score = 0 }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  // SVG Gauge constants
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half-circle arc
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getColor = (val) => {
    if (val >= 90) return '#10B981'; // Emerald
    if (val >= 75) return '#2563EB'; // Primary Blue
    if (val >= 60) return '#F59E0B'; // Amber
    return '#EF4444'; // Rose
  };

  const currentColor = getColor(normalizedScore);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-52 h-32 overflow-visible" viewBox="0 0 200 110">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Background Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Animated Active Score Arc */}
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>

      {/* Score Number Display */}
      <div className="absolute top-14 flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-4xl sm:text-5xl font-black text-white font-outfit tracking-tight"
        >
          {normalizedScore.toFixed(1)}
        </motion.span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-outfit mt-0.5">
          Out of 100
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;
