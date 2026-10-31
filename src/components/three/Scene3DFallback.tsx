import React from 'react';

interface Scene3DFallbackProps {
  title?: string;
  subtitle?: string;
}

export const Scene3DFallback: React.FC<Scene3DFallbackProps> = ({
  title = 'Terraced Farmland Monitoring',
  subtitle = 'Computer vision sensory intelligence observing crop vigor',
}) => {
  return (
    <div
      role="img"
      aria-label="Illustration of terraced agricultural fields under morning sun"
      className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden bg-gradient-to-b from-sky-mist-100 via-cream-100 to-cream-50 flex flex-col justify-end p-6 border border-soil-600/10 warm-shadow"
    >
      {/* Background mountains / hills */}
      <svg
        className="absolute inset-0 w-full h-full object-cover"
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Soft Sun */}
        <circle cx="640" cy="120" r="48" fill="#E3C98A" opacity="0.75" />
        <circle cx="640" cy="120" r="72" fill="#FAF6EC" opacity="0.3" />

        {/* Distant Hills */}
        <path
          d="M0 320 Q200 240 400 290 T800 280 L800 500 L0 500 Z"
          fill="#D6E2CF"
          opacity="0.8"
        />

        {/* Midground Terraces */}
        <path
          d="M0 360 Q260 300 520 350 T800 330 L800 500 L0 500 Z"
          fill="#9CC29B"
          opacity="0.9"
        />
        <path
          d="M0 410 Q240 370 480 400 T800 390 L800 500 L0 500 Z"
          fill="#4E8A57"
        />

        {/* Foreground Soil Ridge */}
        <path
          d="M0 460 Q300 440 600 455 T800 450 L800 500 L0 500 Z"
          fill="#3B2F22"
          opacity="0.9"
        />

        {/* Crop Stalk Silhouettes */}
        <g stroke="#2F5D3A" strokeWidth="2.5" strokeLinecap="round">
          <path d="M120 440 L120 400 M115 410 L120 400 L125 410" />
          <path d="M160 435 L160 395 M155 405 L160 395 L165 405" />
          <path d="M200 445 L200 405 M195 415 L200 405 L205 415" />
          <path d="M340 430 L340 390 M335 400 L340 390 L345 400" />
          <path d="M380 438 L380 398 M375 408 L380 398 L385 408" />
          <path d="M620 435 L620 395 M615 405 L620 395 L625 405" />
          <path d="M660 440 L660 400 M655 410 L660 400 L665 410" />
        </g>
      </svg>

      <div className="relative z-10 bg-cream-50/90 backdrop-blur-xs p-4 rounded-xl border border-soil-600/10 max-w-sm">
        <h4 className="font-serif text-base font-semibold text-soil-800">{title}</h4>
        <p className="text-xs text-soil-600 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
};
