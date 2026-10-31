import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

export const ParallaxLayers: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [scrollY, setScrollY] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReduced]);

  const offset1 = prefersReduced ? 0 : scrollY * 0.12;
  const offset2 = prefersReduced ? 0 : scrollY * 0.22;

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none opacity-40 ${className}`}
    >
      {/* Distant Hills Layer */}
      <svg
        className="absolute bottom-0 w-full"
        style={{ transform: `translateY(${offset1}px)` }}
        viewBox="0 0 1440 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 C320,80 540,220 880,120 C1200,40 1360,180 1440,160 L1440,280 L0,280 Z"
          fill="#D6E2CF"
        />
      </svg>

      {/* Near Rolling Fields Layer */}
      <svg
        className="absolute bottom-0 w-full"
        style={{ transform: `translateY(${offset2}px)` }}
        viewBox="0 0 1440 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,90 C360,140 720,50 1080,110 C1280,140 1380,80 1440,100 L1440,200 L0,200 Z"
          fill="#9CC29B"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};
