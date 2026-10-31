import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Camera,
  Activity,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { getDashboardSummary, getWeeklyInsight, DashboardSummary, WeeklyInsightData } from '../api/dashboard.js';
import { SeverityDonut } from '../components/charts/SeverityDonut.js';
import { TopIssuesBar } from '../components/charts/TopIssuesBar.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { SeverityBadge, UrgencyBadge } from '../components/results/Badges.js';
import { TiltCard } from '../components/three/TiltCard.js';
import { DisclaimerBanner } from '../components/results/DisclaimerBanner.js';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insight, setInsight] = useState<WeeklyInsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardSummary(), getWeeklyInsight()])
      .then(([summaryRes, insightRes]) => {
        setSummary(summaryRes);
        setInsight(insightRes.insight);
      })
      .catch((err) => {
        toast.error('Failed to load dashboard overview data');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-cream-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-cream-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-48 bg-cream-200 rounded-2xl" />
      </div>
    );
  }

  const hasScans = summary && summary.totalScans > 0;
  const hasFields = summary && summary.totalFields > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Field Health Intelligence"
        kicker="Visual Monitoring Dashboard"
        description="Comprehensive overview of crop pathology, severity breakdown, and actionable weekly agronomic insights."
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              to="/fields"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-soil-800 text-xs font-medium border border-soil-600/15 warm-shadow-sm transition-colors"
            >
              <Layers className="w-4 h-4 text-soil-600" />
              <span>Manage Fields</span>
            </Link>
            <Link
              to="/scan/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors"
            >
              <Camera className="w-4 h-4 text-wheat-300" />
              <span>New Crop Scan</span>
            </Link>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <TiltCard className="p-5 bg-cream-100 border border-soil-600/15 warm-shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-soil-600">Registered Fields</span>
            <p className="font-serif text-2xl font-bold text-soil-950">
              {summary?.totalFields || 0}
            </p>
            <span className="text-[11px] text-soil-500">Active monitoring zones</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cream-50 border border-soil-600/10 flex items-center justify-center text-leaf-700">
            <Layers className="w-5 h-5" />
          </div>
        </TiltCard>

        {/* Metric 2 */}
        <TiltCard className="p-5 bg-cream-100 border border-soil-600/15 warm-shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-soil-600">Total Visual Scans</span>
            <p className="font-serif text-2xl font-bold text-soil-950">
              {summary?.totalScans || 0}
            </p>
            <span className="text-[11px] text-soil-500">Computer vision runs</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cream-50 border border-soil-600/10 flex items-center justify-center text-clay-400">
            <Camera className="w-5 h-5" />
          </div>
        </TiltCard>

        {/* Metric 3 */}
        <TiltCard className="p-5 bg-cream-100 border border-soil-600/15 warm-shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-soil-600">Average Crop Vigor</span>
            <p
              className={`font-serif text-2xl font-bold ${
                summary?.averageHealth && summary.averageHealth >= 70
                  ? 'text-leaf-600'
                  : summary?.averageHealth && summary.averageHealth >= 45
                  ? 'text-ochre-600'
                  : 'text-soil-700'
              }`}
            >
              {summary?.averageHealth ? `${summary.averageHealth} / 100` : '—'}
            </p>
            <span className="text-[11px] text-soil-500">Across all recent scans</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cream-50 border border-soil-600/10 flex items-center justify-center text-leaf-600">
            <Activity className="w-5 h-5" />
          </div>
        </TiltCard>

        {/* Metric 4 */}
        <TiltCard className="p-5 bg-cream-100 border border-soil-600/15 warm-shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-soil-600">Weekly Advisory</span>
            <p className="font-serif text-2xl font-bold text-leaf-800">Active</p>
            <span className="text-[11px] text-soil-500">AI field synthesis ready</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cream-50 border border-soil-600/10 flex items-center justify-center text-wheat-500">
            <Sparkles className="w-5 h-5 text-ochre-600" />
          </div>
        </TiltCard>
      </div>

      {/* First-Time Empty State Banner */}
      {!hasFields && (
        <div className="p-8 rounded-2xl bg-cream-100 border-2 border-dashed border-soil-600/20 text-center space-y-4 max-w-2xl mx-auto warm-shadow-sm">
          <div className="w-12 h-12 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-soil-900">
              Welcome to AgriLens! Create Your First Field
            </h3>
            <p className="text-xs text-soil-600 max-w-md mx-auto">
              Define your crop parcel (acreage, soil type, and location) to organize scans and enable multi-week anomaly tracking.
            </p>
          </div>
          <Link
            to="/fields"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Field</span>
          </Link>
        </div>
      )}

      {/* Weekly AI Insight Card */}
      {insight && (
        <div className="p-5 sm:p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soil-600/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-leaf-700 text-cream-50">
                <Sparkles className="w-4 h-4 text-wheat-300" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-serif font-bold text-clay-400">
                  AI Weekly Agronomy Synthesis
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-soil-950">
                  {insight.headline}
                </h3>
              </div>
            </div>
            <span className="text-[11px] font-medium text-soil-500 hidden sm:inline">
              Updated this week
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Best field */}
            <div className="p-3.5 rounded-xl bg-cream-50 border border-soil-600/10 space-y-1">
              <span className="text-soil-500 font-medium">Top Performing Parcel</span>
              <p className="font-serif text-sm font-bold text-leaf-800">
                {insight.bestField.name}
              </p>
              <p className="text-[11px] text-soil-600 leading-snug">{insight.bestField.note}</p>
            </div>

            {/* Attention field */}
            <div className="p-3.5 rounded-xl bg-cream-50 border border-soil-600/10 space-y-1">
              <span className="text-soil-500 font-medium">Attention Recommended</span>
              <p className="font-serif text-sm font-bold text-rust-700">
                {insight.attentionField.name}
              </p>
              <p className="text-[11px] text-soil-600 leading-snug">{insight.attentionField.note}</p>
            </div>

            {/* Recurring Issue Tip */}
            <div className="p-3.5 rounded-xl bg-cream-50 border border-soil-600/10 space-y-1">
              <span className="text-soil-500 font-medium">Key Issue & Prevention</span>
              <p className="font-serif text-sm font-bold text-soil-900">
                {insight.recurringIssue.name}
              </p>
              <p className="text-[11px] text-soil-600 leading-snug">{insight.recurringIssue.tip}</p>
            </div>
          </div>

          {/* Concrete Weekly Actions */}
          {insight.weeklyActions && insight.weeklyActions.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-soil-800 font-serif">
                Prioritized Actions for the Coming Week:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {insight.weeklyActions.map((action, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-cream-50 border border-soil-600/10 text-xs text-soil-800 flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-leaf-100 text-leaf-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insight.encouragement && (
            <p className="text-xs text-soil-600 italic pt-1 border-t border-soil-600/10">
              "{insight.encouragement}"
            </p>
          )}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Breakdown */}
        <div className="p-5 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-bold text-soil-900">
              Severity Distribution
            </h4>
            <span className="text-xs text-soil-500">Cumulative findings</span>
          </div>
          <SeverityDonut data={summary?.severityDistribution || []} />
        </div>

        {/* Top Recurring Pathogens & Pests */}
        <div className="p-5 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-bold text-soil-900">
              Top Recurring Field Pressures
            </h4>
            <span className="text-xs text-soil-500">Frequency count</span>
          </div>
          <TopIssuesBar data={summary?.topRecurringIssues || []} />
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="p-5 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-serif text-base font-bold text-soil-900">
              Recent Visual Pathology Scans
            </h4>
            <p className="text-xs text-soil-500">Latest localized computer vision reports</p>
          </div>
          <Link
            to="/scans"
            className="inline-flex items-center gap-1 text-xs font-semibold text-leaf-700 hover:text-leaf-800"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {summary?.recentScans && summary.recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-soil-600/15 text-soil-600 font-serif">
                  <th className="py-2.5 px-3">Field & Crop</th>
                  <th className="py-2.5 px-3">Growth Stage</th>
                  <th className="py-2.5 px-3">Health Score</th>
                  <th className="py-2.5 px-3">Overall Severity</th>
                  <th className="py-2.5 px-3">Urgency</th>
                  <th className="py-2.5 px-3">Scan Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soil-600/10">
                {summary.recentScans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-cream-200/50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/scans/${scan.id}`)}
                  >
                    <td className="py-3 px-3">
                      <div className="font-serif font-semibold text-soil-900">
                        {scan.field_name}
                      </div>
                      <div className="text-[11px] text-soil-500 capitalize">{scan.crop_name}</div>
                    </td>
                    <td className="py-3 px-3 capitalize text-soil-700">
                      {scan.growth_stage?.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-serif font-bold text-soil-900">
                        {scan.health_score ?? '—'}
                      </span>{' '}
                      <span className="text-[10px] text-soil-500">/100</span>
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={scan.overall_severity} />
                    </td>
                    <td className="py-3 px-3">
                      <UrgencyBadge urgency={scan.urgency} />
                    </td>
                    <td className="py-3 px-3 text-soil-600">
                      {new Date(scan.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/scans/${scan.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-leaf-700 hover:text-leaf-900 font-semibold underline text-xs"
                      >
                        Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-soil-500 space-y-2">
            <Camera className="w-6 h-6 mx-auto text-soil-400" />
            <p>No scans recorded yet. Upload your first crop photo to see results.</p>
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
};
