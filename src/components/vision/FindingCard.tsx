import React, { useState } from 'react';
import {
  AlertTriangle,
  Bug,
  Droplets,
  Sprout,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { ScanFinding } from '../../api/scans.js';

interface FindingCardProps {
  finding: ScanFinding;
  differentials?: Array<{ name: string; howToTellApart: string }>;
  isSelected: boolean;
  onSelect: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  fungal_disease: <ShieldAlert className="w-4 h-4 text-rust-500" />,
  bacterial_disease: <AlertTriangle className="w-4 h-4 text-rust-600" />,
  viral_disease: <AlertTriangle className="w-4 h-4 text-critical" />,
  insect_pest: <Bug className="w-4 h-4 text-ochre-500" />,
  mite_pest: <Bug className="w-4 h-4 text-ochre-600" />,
  nutrient_deficiency: <Sprout className="w-4 h-4 text-clay-400" />,
  water_stress: <Droplets className="w-4 h-4 text-soil-600" />,
  heat_or_cold_stress: <AlertTriangle className="w-4 h-4 text-ochre-500" />,
  weed_pressure: <Sprout className="w-4 h-4 text-leaf-700" />,
  physical_damage: <HelpCircle className="w-4 h-4 text-soil-600" />,
  healthy: <CheckCircle className="w-4 h-4 text-leaf-500" />,
  unclear: <HelpCircle className="w-4 h-4 text-soil-600" />,
};

const SEVERITY_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  none: { bg: 'bg-leaf-100', text: 'text-leaf-800', label: 'Healthy' },
  low: { bg: 'bg-leaf-200/60', text: 'text-leaf-800', label: 'Low Severity' },
  medium: { bg: 'bg-ochre-100', text: 'text-ochre-700', label: 'Medium Severity' },
  high: { bg: 'bg-rust-100', text: 'text-rust-700', label: 'High Severity' },
  critical: { bg: 'bg-critical/15', text: 'text-critical font-semibold', label: 'Critical' },
};

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  differentials = [],
  isSelected,
  onSelect,
}) => {
  const [showDifferentials, setShowDifferentials] = useState(false);

  const icon = CATEGORY_ICONS[finding.category] || <AlertTriangle className="w-4 h-4 text-soil-600" />;
  const severityStyle = SEVERITY_BADGES[finding.severity] || SEVERITY_BADGES.medium;
  const confidencePercent = Math.round(finding.confidence * 100);

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl p-4 transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'bg-cream-100 border-leaf-700 shadow-md ring-1 ring-leaf-700/50'
          : 'bg-cream-50 hover:bg-cream-100/70 border-soil-600/15 warm-shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cream-100 border border-soil-600/10">
            {icon}
          </div>
          <div>
            <h4 className="font-serif text-base font-semibold text-soil-900 leading-snug">
              {finding.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-soil-600 mt-0.5">
              <span className="capitalize">{finding.category.replace(/_/g, ' ')}</span>
              <span>·</span>
              <span>Photo #{finding.image_position + 1}</span>
            </div>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${severityStyle.bg} ${severityStyle.text}`}
        >
          {severityStyle.label}
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-xs text-soil-600">
          <span>AI Diagnostic Confidence</span>
          <span className="font-medium text-soil-800">{confidencePercent}%</span>
        </div>
        <div className="w-full bg-cream-200 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              finding.severity === 'critical' || finding.severity === 'high'
                ? 'bg-rust-500'
                : finding.severity === 'medium'
                ? 'bg-ochre-500'
                : 'bg-leaf-500'
            }`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Evidence description */}
      <div className="mt-3 text-xs text-soil-700 leading-relaxed bg-cream-100/50 p-2.5 rounded-lg border border-soil-600/10">
        <span className="font-medium text-soil-800">Visual Evidence: </span>
        {finding.evidence}
      </div>

      {/* Expandable Differentials (Look-alikes) */}
      {differentials.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-soil-600/10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDifferentials(!showDifferentials);
            }}
            className="flex items-center justify-between w-full text-xs font-medium text-soil-700 hover:text-soil-950 cursor-pointer"
          >
            <span>Differential Diagnoses & Look-Alikes ({differentials.length})</span>
            {showDifferentials ? (
              <ChevronUp className="w-3.5 h-3.5 text-soil-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-soil-500" />
            )}
          </button>

          {showDifferentials && (
            <div className="mt-2 space-y-2 text-xs">
              {differentials.map((diff, dIdx) => (
                <div
                  key={dIdx}
                  className="bg-cream-50 p-2 rounded-lg border border-soil-600/10 space-y-0.5"
                >
                  <p className="font-semibold text-soil-800 font-serif">{diff.name}</p>
                  <p className="text-[11px] text-soil-600 leading-snug">
                    <span className="font-medium text-soil-700">How to tell apart: </span>
                    {diff.howToTellApart}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
