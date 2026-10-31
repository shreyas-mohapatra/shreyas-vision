import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-xl p-3.5 bg-cream-100 border border-soil-600/15 text-soil-700 text-xs flex items-start gap-2.5 ${className}`}
    >
      <Info className="w-4 h-4 text-soil-500 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <span className="font-serif font-bold text-soil-900">
          AI-Assisted Visual Advisory Notice
        </span>
        <p className="text-[11px] text-soil-600 leading-relaxed">
          AgriLens delivers computer-vision assisted visual screening. Environmental variables, soil chemistry, and micro-climates affect crop health. Always verify serious or spreading pathologies with your local agriculture extension officer or licensed agronomist before purchasing or applying commercial chemical inputs.
        </p>
      </div>
    </div>
  );
};
