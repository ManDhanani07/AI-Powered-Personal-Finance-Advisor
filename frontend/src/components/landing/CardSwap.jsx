import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 rounded-3xl border border-zinc-800 bg-[#09090B] overflow-hidden [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] shadow-[0_20px_60px_rgba(0,0,0,0.9)] ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
  />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el, slot, skew) => {
  if (!el) return;
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });
};

export const CardSwap = ({
  width = 460,
  height = 520,
  cardDistance = 22,
  verticalDistance = 22,
  delay = 3500,
  pauseOnHover = true,
  onCardClick,
  onCardChange,
  targetIndex = null,
  skewAmount = 2,
  easing = 'elastic',
  children
}) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 1.4,
          durMove: 1.4,
          durReturn: 1.4,
          promoteOverlap: 0.8,
          returnDelay: 0.05
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2
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

  // Main automatic swap loop
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

      tl.to(elFront, {
        y: '+=450',
        duration: config.durDrop,
        ease: config.ease
      });

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
            ease: config.ease
          },
          `promote+=${i * 0.1}`
        );
      });

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
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    intervalRef.current = window.setInterval(swap, delay);

    if (pauseOnHover && container.current) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        clearInterval(intervalRef.current);
      };
    }
    return () => clearInterval(intervalRef.current);
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, refs, onCardChange, config]);

  // Handle external navigation (when user clicks a pipeline step on the left)
  useEffect(() => {
    if (targetIndex === null || targetIndex === undefined) return;
    const curFront = order.current[0];
    if (curFront === targetIndex) return;

    isInteracting.current = true;
    const pos = order.current.indexOf(targetIndex);
    if (pos !== -1) {
      const newOrder = [...order.current.slice(pos), ...order.current.slice(0, pos)];
      order.current = newOrder;

      const total = refs.length;
      newOrder.forEach((idx, slotIdx) => {
        const el = refs[idx]?.current;
        if (!el) return;
        const slot = makeSlot(slotIdx, cardDistance, verticalDistance, total);
        gsap.to(el, {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          xPercent: -50,
          yPercent: -50,
          skewY: skewAmount,
          zIndex: slot.zIndex,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    }

    const timer = setTimeout(() => {
      isInteracting.current = false;
    }, 600);
    return () => clearTimeout(timer);
  }, [targetIndex, cardDistance, verticalDistance, skewAmount, refs]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: e => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          }
        })
      : child
  );

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center perspective-[1000px] overflow-visible mx-auto"
      style={{ width, height }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
