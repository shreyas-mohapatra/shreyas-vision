import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useWebGLSupport } from '../../hooks/useWebGLSupport.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { Scene3DFallback } from './Scene3DFallback.js';

interface LazyCanvasProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  className?: string;
  ariaLabel?: string;
}

export const LazyCanvas: React.FC<LazyCanvasProps> = ({
  children,
  fallbackTitle,
  fallbackSubtitle,
  className = 'w-full h-full min-h-[360px]',
  ariaLabel = '3D interactive scene',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const webglSupported = useWebGLSupport();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!webglSupported || prefersReducedMotion) {
    return (
      <div ref={containerRef} className={className}>
        <Scene3DFallback title={fallbackTitle} subtitle={fallbackSubtitle} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      {isVisible ? (
        <Suspense fallback={<Scene3DFallback title={fallbackTitle} subtitle="Rendering 3D models..." />}>
          {children}
        </Suspense>
      ) : (
        <div className="w-full h-full bg-cream-100 rounded-2xl animate-pulse" />
      )}
    </div>
  );
};
