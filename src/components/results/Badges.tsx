import React from 'react';

interface SeverityBadgeProps {
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical' | string;
  className?: string;
}

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  none: { label: 'Healthy (None)', bg: 'bg-leaf-100', text: 'text-leaf-800', dot: 'bg-leaf-500' },
  low: { label: 'Low Severity', bg: 'bg-leaf-100', text: 'text-leaf-800', dot: 'bg-leaf-400' },
  medium: { label: 'Medium Severity', bg: 'bg-ochre-100', text: 'text-ochre-700', dot: 'bg-ochre-500' },
  high: { label: 'High Severity', bg: 'bg-rust-100', text: 'text-rust-700', dot: 'bg-rust-500' },
  critical: { label: 'Critical Severity', bg: 'bg-critical/15', text: 'text-critical font-semibold', dot: 'bg-critical' },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

interface UrgencyBadgeProps {
  urgency: 'monitor' | 'act_this_week' | 'act_within_48h' | 'act_today' | string;
  className?: string;
}

const URGENCY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  monitor: { label: 'Monitor Routine', bg: 'bg-leaf-100 text-leaf-800', text: 'text-leaf-800' },
  act_this_week: { label: 'Act This Week', bg: 'bg-wheat-100 text-soil-800', text: 'text-soil-800' },
  act_within_48h: { label: 'Act Within 48 Hours', bg: 'bg-ochre-100 text-ochre-700 font-medium', text: 'text-ochre-700' },
  act_today: { label: 'Urgent: Act Today', bg: 'bg-rust-100 text-rust-700 font-semibold', text: 'text-rust-700' },
};

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, className = '' }) => {
  const config = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.monitor;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs ${config.bg} ${className}`}
    >
      {config.label}
    </span>
  );
};

interface CategoryChipProps {
  category: string;
  className?: string;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ category, className = '' }) => {
  return (
    <span className={`text-xs text-soil-600 capitalize ${className}`}>
      {category.replace(/_/g, ' ')}
    </span>
  );
};
