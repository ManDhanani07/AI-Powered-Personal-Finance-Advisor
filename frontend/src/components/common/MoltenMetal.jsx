import React, { useEffect, useRef } from 'react';

export const MoltenMetal = ({
  color1 = '#18181b',
  color2 = '#000000',
  color3 = '#6366f1',
  speed = 0.2,
  opacity = 0.4,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let step = 0;

    const render = () => {
      step += speed * 0.01;
      ctx.clearRect(0, 0, width, height);

      // Create rich fluid radial gradient background
      const centerX = width * 0.5 + Math.sin(step) * width * 0.2;
      const centerY = height * 0.5 + Math.cos(step * 0.8) * height * 0.2;
      const radius = Math.max(width, height) * 0.7;

      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      grad.addColorStop(0, color3);
      grad.addColorStop(0.5, color1);
      grad.addColorStop(1, color2);

      ctx.fillStyle = grad;
      ctx.globalAlpha = opacity;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color1, color2, color3, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default MoltenMetal;
