import React from 'react';

interface HealthGaugeProps {
  score: number; // 0 to 100
  size?: number;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ score = 80, size = 180 }) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Gauge parameters
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = Math.PI * radius; // Half-circle
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return '#4E8A57'; // healthy green
    if (s >= 50) return '#C88A1E'; // cautionary ochre
    if (s >= 25) return '#B4532A'; // rust
    return '#7A2E1B'; // deep critical brick
  };

  const getLabel = (s: number) => {
    if (s >= 85) return 'Optimal Vigor';
    if (s >= 70) return 'Mild Stress';
    if (s >= 50) return 'Moderate Damage';
    if (s >= 25) return 'Severe Infection';
    return 'Critical Decline';
  };

  const scoreColor = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size * 0.6 }}>
        <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
          {/* Background arc */}
          <path
            d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${center}`}
            fill="none"
            stroke="#E8DEC5"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Colored progress arc */}
          <path
            d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${center}`}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="font-serif text-3xl font-bold text-soil-900 leading-none">
            {clampedScore}
          </span>
          <span className="text-[11px] font-medium text-soil-500 uppercase tracking-wider mt-0.5">
            / 100 Health
          </span>
        </div>
      </div>

      <span
        className="mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{
          color: scoreColor,
          backgroundColor: `${scoreColor}18`,
        }}
      >
        {getLabel(clampedScore)}
      </span>
    </div>
  );
};
