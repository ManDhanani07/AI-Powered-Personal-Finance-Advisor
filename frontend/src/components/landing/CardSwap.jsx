import React, { Children, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';

// Math helper to calculate card stacked coordinates in 3D perspective space
const makeSlot = (i, cardDistance, verticalDistance, total) => {
  return {
    x: i * cardDistance,
    y: -i * verticalDistance,
    z: -i * 25,
    zIndex: total - i
  };
};

// Immediate GSAP placement helper with GPU acceleration
const placeNow = (el, slot, skew) => {
  if (!el) return;
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
    rotationZ: 0.01 // Trigger GPU layer promotion
  });
};

export const CardSwap = ({
  width = 460,
  height = 520,
  cardDistance = 22,
  verticalDistance = 22,
  delay = 3000,
  pauseOnHover = true,
  onCardClick,
  onCardChange,
  targetIndex = null,
  skewAmount = 2,
  easing = 'smooth',
  children
}) => {
  // Ultra responsive, zero-lag 60fps GSAP configuration (0.45s animation + 2.55s rest)
  const config = {
    ease: 'power2.out',
    durDrop: 0.45,
    durMove: 0.45,
    durReturn: 0.45,
    promoteOverlap: 0.5,
    returnDelay: 0.08
  };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const intervalRef = useRef();
  const container = useRef(null);
  const isInteracting = useRef(false);

  // Initialize initial card positions
  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount));
  }, [refs, cardDistance, verticalDistance, skewAmount]);

  // Main automatic swap loop (3000ms delay, 0.45s swap transition)
  useEffect(() => {
    const swap = () => {
      if (order.current.length < 2 || isInteracting.current) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front]?.current;
      if (!elFront) return;

      // Notify parent component of the new front card index (rest[0])
      const newFrontIndex = rest[0];
      if (onCardChange) {
        onCardChange(newFrontIndex);
      }

      const tl = gsap.timeline();
      tlRef.current = tl;

      // 1. Drop front card quickly & cleanly
      tl.to(elFront, {
        y: '+=380',
        duration: config.durDrop,
        ease: config.ease,
        force3D: true
      });

      // 2. Promote rest of the cards up the stack
      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx]?.current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
            force3D: true
          },
          `promote+=${i * 0.04}`
        );
      });

      // 3. Return front card seamlessly to the back slot
      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          if (elFront) gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease,
          force3D: true
        },
        'return'
      );

      order.current = [...rest, front];
    };

    intervalRef.current = setInterval(swap, delay);
    return () => clearInterval(intervalRef.current);
  }, [delay, cardDistance, verticalDistance, refs, config, onCardChange]);

  // Programmatically jump to target index when left selector tab is clicked
  useEffect(() => {
    if (targetIndex === null || targetIndex === undefined) return;
    const currentFront = order.current[0];
    if (currentFront === targetIndex) return;

    const targetPos = order.current.indexOf(targetIndex);
    if (targetPos === -1) return;

    const newOrder = [
      ...order.current.slice(targetPos),
      ...order.current.slice(0, targetPos)
    ];

    order.current = newOrder;

    newOrder.forEach((cardIdx, slotIdx) => {
      const el = refs[cardIdx]?.current;
      if (!el) return;
      const slot = makeSlot(slotIdx, cardDistance, verticalDistance, newOrder.length);
      gsap.to(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        zIndex: slot.zIndex,
        duration: 0.45,
        ease: 'power2.out',
        force3D: true
      });
    });
  }, [targetIndex, cardDistance, verticalDistance, refs]);

  // Hover pause handlers
  const handleMouseEnter = () => {
    if (pauseOnHover) isInteracting.current = true;
  };
  const handleMouseLeave = () => {
    if (pauseOnHover) isInteracting.current = false;
  };

  return (
    <div
      ref={container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative select-none"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        perspective: '1200px',
        transformStyle: 'preserve-3d'
      }}
    >
      {childArr.map((child, i) => (
        <div
          key={i}
          ref={refs[i]}
          onClick={() => onCardClick && onCardClick(i)}
          className="absolute inset-0 cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Re-export Card sub-component helper
export const Card = ({ children, className = '' }) => (
  <div
    className={`w-full h-full rounded-3xl bg-[#09090B] border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 ${className}`}
  >
    {children}
  </div>
);

export default CardSwap;
