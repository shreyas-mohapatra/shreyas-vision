import React, { useState, useRef } from 'react';

interface CompareSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Previous Scan',
  afterLabel = 'Current Scan',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[360px] md:h-[440px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-soil-600/15 warm-shadow bg-soil-950/5"
      >
        {/* 'After' Image (Current Scan) - Full Width Background */}
        <img
          src={afterUrl}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 'Before' Image (Previous Scan) - Clipped by Slider */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeUrl}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Split Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-wheat-300 shadow-md"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Grab Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-soil-950 border-2 border-wheat-300 flex items-center justify-center text-wheat-300 shadow-lg text-xs font-bold pointer-events-none">
            ⬌
          </div>
        </div>

        {/* Labels in Corners */}
        <span className="absolute top-3 left-3 px-2 py-1 rounded bg-soil-950/80 backdrop-blur-xs text-cream-100 text-xs font-medium font-serif pointer-events-none">
          {beforeLabel}
        </span>
        <span className="absolute top-3 right-3 px-2 py-1 rounded bg-soil-950/80 backdrop-blur-xs text-cream-100 text-xs font-medium font-serif pointer-events-none">
          {afterLabel}
        </span>
      </div>

      <p className="text-center text-xs text-soil-500">
        Drag the split handle horizontally to visually compare symptom progression
      </p>
    </div>
  );
};
