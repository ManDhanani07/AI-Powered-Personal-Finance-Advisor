import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const MouseGlow = () => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isHovered) setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, isHovered]);

  return (
    <motion.div
      style={{
        left: smoothX,
        top: smoothY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        opacity: isHovered ? 0.35 : 0,
      }}
      transition={{ duration: 0.3 }}
      className="pointer-events-none fixed z-0 w-[450px] h-[450px] rounded-full bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-blue-500/20 blur-[120px]"
    />
  );
};

export default MouseGlow;
