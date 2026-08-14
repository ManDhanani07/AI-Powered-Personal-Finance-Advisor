import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils.js";

export const SparklesCore = ({
  id,
  className,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1.4,
  speed = 0.8,
  particleColor = ["#10B981", "#34D399", "#2DD4BF", "#00F2FE", "#FFFFFF"],
  particleDensity = 300,
  isFullSection = false,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let clientWidth = canvas.parentElement?.clientWidth || 640;
    let clientHeight = canvas.parentElement?.clientHeight || 160;

    // Retina High-DPI Canvas Setup
    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        clientWidth = canvas.parentElement.clientWidth;
        clientHeight = canvas.parentElement.clientHeight;
        canvas.width = clientWidth * dpr;
        canvas.height = clientHeight * dpr;
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener("resize", handleResize);

    const colors = Array.isArray(particleColor)
      ? particleColor
      : [particleColor || "#10B981", "#34D399", "#00F2FE", "#FFFFFF"];

    // Particle field generation
    const particles = Array.from({ length: particleDensity }, () => {
      let x = Math.random() * clientWidth;
      let y = Math.random() * clientHeight;

      if (!isFullSection) {
        // Top-weighted Y for Hero title light beam
        const biasY = Math.pow(Math.random(), 1.3);
        y = biasY * clientHeight;
      }

      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        x,
        y,
        color,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * speed * 0.35,
        speedY: (Math.random() - 0.5) * speed * 0.35,
        opacity: Math.random() * 0.8 + 0.2,
        opacitySpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, clientWidth, clientHeight);

      if (background !== "transparent") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, clientWidth, clientHeight);
      }

      particles.forEach((p) => {
        // Move particle
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap canvas edges
        if (p.x < 0) p.x = clientWidth;
        if (p.x > clientWidth) p.x = 0;
        if (p.y < 0) p.y = clientHeight;
        if (p.y > clientHeight) p.y = 0;

        // Twinkle opacity
        p.opacity += p.opacitySpeed;
        if (p.opacity >= 1 || p.opacity <= 0.2) {
          p.opacitySpeed = -p.opacitySpeed;
        }

        let finalAlpha = p.opacity;

        if (!isFullSection) {
          // Mathematical radial edge fade for Hero beam title container
          const dx = (p.x - clientWidth / 2) / (clientWidth * 0.48);
          const dy = p.y / (clientHeight * 0.95);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radialAlpha = Math.max(0, 1 - Math.pow(dist, 1.8));
          finalAlpha = Math.max(0, Math.min(1, p.opacity * radialAlpha));
        }

        if (finalAlpha > 0.02) {
          ctx.save();
          ctx.globalAlpha = finalAlpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [background, minSize, maxSize, speed, particleColor, particleDensity, isFullSection]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn("w-full h-full block pointer-events-none relative z-10", className)}
    />
  );
};

export default SparklesCore;
