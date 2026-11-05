'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Keeps its children inside the available height without ever scrolling:
 * when the content is taller than the space, it is scaled down to fit.
 */
export default function FitToScreen({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const update = () => {
      const available = outer.clientHeight;
      const needed = inner.offsetHeight;
      setScale(needed > 0 && available > 0 ? Math.min(1, available / needed) : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} className={`relative min-h-0 flex-1 overflow-hidden ${className}`}>
      <div ref={innerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        {children}
      </div>
    </div>
  );
}
