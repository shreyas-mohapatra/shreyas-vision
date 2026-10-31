import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertOctagon,
  CheckCircle,
  AlertTriangle,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { ComparisonData } from '../../api/compare.js';

interface ProgressionReportProps {
  comparison: ComparisonData;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode; desc: string }
> = {
  improved: {
    label: 'Field Condition Improved',
    bg: 'bg-leaf-100 border-leaf-600/30',
    text: 'text-leaf-800',
    icon: <TrendingUp className="w-5 h-5 text-leaf-600" />,
    desc: 'Visual pathology shows active reduction in lesion density or healthy regrowth.',
  },
  stable: {
    label: 'Condition Stable',
    bg: 'bg-cream-200 border-soil-600/20',
    text: 'text-soil-800',
    icon: <Minus className="w-5 h-5 text-soil-600" />,
    desc: 'Symptoms have stabilized without significant spread or rapid recovery.',
  },
  worsening: {
    label: 'Condition Worsening',
    bg: 'bg-rust-100 border-rust-500/40',
    text: 'text-rust-700',
    icon: <TrendingDown className="w-5 h-5 text-rust-600" />,
    desc: 'Lesions or chlorosis have spread to greater canopy area or higher severity.',
  },
  new_issue_detected: {
    label: 'New Anomaly / Pest Pressure Detected',
    bg: 'bg-ochre-100 border-ochre-500/40',
    text: 'text-ochre-800',
    icon: <AlertOctagon className="w-5 h-5 text-ochre-600" />,
    desc: 'A secondary pathogen, pest pressure, or environmental stress was identified.',
  },
  insufficient_data: {
    label: 'Inconclusive Comparison',
    bg: 'bg-cream-100 border-soil-600/20',
    text: 'text-soil-700',
    icon: <Activity className="w-5 h-5 text-soil-500" />,
    desc: 'Images differ significantly in framing, lighting, or angle for confident progression analysis.',
  },
};

const TREND_CONFIG: Record<string, { label: string; color: string }> = {
  resolved: { label: 'Resolved', color: 'text-leaf-700 bg-leaf-100' },
  improving: { label: 'Improving', color: 'text-leaf-700 bg-leaf-100' },
  unchanged: { label: 'Unchanged', color: 'text-soil-700 bg-cream-200' },
  worsening: { label: 'Worsening', color: 'text-rust-700 bg-rust-100' },
  new: { label: 'New Issue', color: 'text-ochre-800 bg-ochre-100 font-semibold' },
};

export const ProgressionReport: React.FC<ProgressionReportProps> = ({ comparison }) => {
  const statusCfg = STATUS_CONFIG[comparison.status] || STATUS_CONFIG.stable;
  const delta = comparison.healthScoreDelta;

  return (
    <div className="space-y-6">
      {/* Primary Status Banner */}
      <div className={`p-4 md:p-5 rounded-2xl border ${statusCfg.bg} space-y-2 warm-shadow-sm`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cream-50/80">{statusCfg.icon}</div>
            <div>
              <h3 className={`font-serif text-lg font-bold ${statusCfg.text}`}>
                {statusCfg.label}
              </h3>
              <p className="text-xs text-soil-600">{statusCfg.desc}</p>
            </div>
          </div>

          {/* Delta Indicator */}
          <div className="flex items-center gap-2 bg-cream-50/90 px-3 py-1.5 rounded-xl border border-soil-600/10">
            <span className="text-xs text-soil-600">Health Delta:</span>
            <span
              className={`font-serif text-base font-bold ${
                delta > 0 ? 'text-leaf-600' : delta < 0 ? 'text-rust-600' : 'text-soil-700'
              }`}
            >
              {delta > 0 ? `+${delta}` : delta} pts
            </span>
          </div>
        </div>

        {/* Comparison Summary Text */}
        {comparison.summary && (
          <p className="text-xs text-soil-800 pt-2 border-t border-soil-600/10 leading-relaxed">
            <span className="font-semibold font-serif">Agronomic Synthesis: </span>
            {comparison.summary}
          </p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-cream-50 border border-soil-600/15 space-y-1">
          <span className="text-soil-500 font-medium">Affected Area Trend</span>
          <p className="font-serif text-sm font-bold text-soil-900 capitalize">
            {comparison.affectedAreaTrend}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-cream-50 border border-soil-600/15 space-y-1">
          <span className="text-soil-500 font-medium">Previous Actions Effective</span>
          <p className="font-serif text-sm font-bold text-soil-900 capitalize">
            {comparison.actionsEffective}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-cream-50 border border-soil-600/15 space-y-1">
          <span className="text-soil-500 font-medium">Comparison Confidence</span>
          <p className="font-serif text-sm font-bold text-soil-900">
            {Math.round(comparison.confidence * 100)}%
          </p>
        </div>
      </div>

      {/* Issue Trends Table */}
      {comparison.issueTrends && comparison.issueTrends.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-semibold text-soil-900">
            Individual Pathogen & Stress Trends
          </h4>
          <div className="space-y-2">
            {comparison.issueTrends.map((issue, idx) => {
              const trendCfg = TREND_CONFIG[issue.trend] || TREND_CONFIG.unchanged;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-cream-50 border border-soil-600/15 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="font-serif text-sm font-semibold text-soil-900">
                      {issue.name}
                    </span>
                    <p className="text-xs text-soil-600">{issue.note}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-xs ${trendCfg.color}`}>
                    {trendCfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Anomaly Alerts */}
      {comparison.anomalyAlerts && comparison.anomalyAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-semibold text-soil-900">
            Early Anomaly & Spread Alerts
          </h4>
          <div className="space-y-2">
            {comparison.anomalyAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-rust-50/70 border border-rust-500/30 flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-rust-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-serif text-xs font-bold text-rust-900">
                    {alert.title}
                  </span>
                  <p className="text-xs text-soil-700 leading-relaxed">{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Adjustments */}
      {comparison.recommendedAdjustments && comparison.recommendedAdjustments.length > 0 && (
        <div className="p-4 rounded-xl bg-leaf-500/10 border border-leaf-500/30 space-y-2">
          <h4 className="font-serif text-xs font-bold text-leaf-900 uppercase tracking-wider">
            Recommended Management Adjustments
          </h4>
          <ul className="text-xs text-soil-800 list-disc list-inside space-y-1">
            {comparison.recommendedAdjustments.map((adj, aIdx) => (
              <li key={aIdx}>{adj}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
