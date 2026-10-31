import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Camera,
  GitCompare,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { getScan, reanalyzeScan, ScanDetailResponse } from '../api/scans.js';
import { AnnotatedImageViewer } from '../components/vision/AnnotatedImageViewer.js';
import { FindingCard } from '../components/vision/FindingCard.js';
import { ImageQualityHint } from '../components/vision/ImageQualityHint.js';
import { HealthGauge } from '../components/results/HealthGauge.js';
import { SeverityBadge, UrgencyBadge } from '../components/results/Badges.js';
import { TreatmentTabs } from '../components/results/TreatmentTabs.js';
import { ScanChatPanel } from '../components/results/ScanChatPanel.js';
import { DisclaimerBanner } from '../components/results/DisclaimerBanner.js';
import { ExportReportButton } from '../components/results/ExportReportButton.js';
import { LeafInspector3D } from '../components/three/LeafInspector3D.js';
import { ScanLoader3D } from '../components/three/ScanLoader3D.js';
import toast from 'react-hot-toast';

export const ScanResult: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [data, setData] = useState<ScanDetailResponse | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'vision' | '3d'>('vision');

  const loadScanData = () => {
    if (!scanId) return;
    setIsLoading(true);
    getScan(scanId)
      .then((res) => {
        setData(res);
        if (res.findings && res.findings.length > 0) {
          setSelectedFindingId(res.findings[0].id);
        }
      })
      .catch((err) => {
        toast.error('Failed to load scan pathology report');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadScanData();
  }, [scanId]);

  const handleReanalyze = async () => {
    if (!scanId || isReanalyzing) return;
    setIsReanalyzing(true);
    try {
      await reanalyzeScan(scanId);
      toast.success('Diagnosis recomputed with latest Gemini vision rules');
      loadScanData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to reanalyze scan');
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (isReanalyzing) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <ScanLoader3D />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-cream-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-cream-200 rounded-2xl" />
          <div className="lg:col-span-5 h-96 bg-cream-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data || !data.scan) {
    return (
      <div className="p-12 text-center bg-cream-100 rounded-2xl space-y-4">
        <h3 className="font-serif text-lg font-bold text-soil-900">Scan Report Not Found</h3>
        <Link to="/scans" className="text-xs text-leaf-700 underline font-medium">
          Return to Scan History
        </Link>
      </div>
    );
  }

  const { scan, images, findings } = data;
  const diagnosis = scan.diagnosis_json || {};
  const treatment = scan.treatment_json || {};

  return (
    <div className="space-y-8">
      {/* Top Header & Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3 no-print">
          <Link
            to={`/fields/${scan.field_id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-soil-600 hover:text-soil-900"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Field Timeline</span>
          </Link>

          <div className="flex items-center gap-2">
            <ExportReportButton
              scanId={scan.id}
              cropName={scan.crop_name}
              fieldName={scan.field_name}
            />
            <Link
              to={`/compare/${scan.field_id}?current=${scan.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-soil-800 text-xs font-medium border border-soil-600/15 warm-shadow-sm transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 text-soil-600" />
              <span>Compare Progression</span>
            </Link>
          </div>
        </div>

        {/* Scan Title & Meta Bar */}
        <div className="p-5 sm:p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-serif tracking-wider font-semibold text-clay-400">
                Diagnostic Report
              </span>
              <span>·</span>
              <span className="text-xs text-soil-500">
                {new Date(scan.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-soil-950">
              {scan.field_name || 'Agricultural Field Plot'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-soil-600 pt-0.5">
              <span className="font-semibold text-leaf-800 capitalize">{scan.crop_name}</span>
              <span>·</span>
              <span className="capitalize">{scan.growth_stage?.replace('_', ' ')} stage</span>
              <span>·</span>
              <span>{scan.location}</span>
              {scan.days_since_planting && <span>· {scan.days_since_planting} DAS</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="space-y-1 text-right">
              <SeverityBadge severity={scan.overall_severity} />
              <div>
                <UrgencyBadge urgency={scan.urgency} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleReanalyze}
              className="p-2 rounded-xl bg-cream-50 hover:bg-cream-200 text-soil-700 border border-soil-600/20 text-xs transition-colors cursor-pointer no-print"
              title="Re-run AI diagnosis"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Optical Pathology Image Quality Notice */}
      {diagnosis.imageQuality && (
        <ImageQualityHint
          assessments={diagnosis.imageQuality}
          onRetake={() => (window.location.href = `/scan/new?fieldId=${scan.field_id}`)}
        />
      )}

      {/* Primary Section: 2D Annotated Image / 3D Leaf Inspector alongside Health Score & Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Pathology Display (Tabs for 2D vs 3D) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-cream-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('vision')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  activeTab === 'vision'
                    ? 'bg-soil-950 text-cream-50 shadow-xs'
                    : 'text-soil-700 hover:text-soil-950'
                }`}
              >
                2D Localized Boxes ({findings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('3d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  activeTab === '3d'
                    ? 'bg-soil-950 text-cream-50 shadow-xs'
                    : 'text-soil-700 hover:text-soil-950'
                }`}
              >
                3D Foliage Inspector
              </button>
            </div>
            <span className="text-xs text-soil-500 font-serif">
              Click any finding or box to focus
            </span>
          </div>

          {activeTab === 'vision' ? (
            <AnnotatedImageViewer
              images={images}
              findings={findings}
              selectedFindingId={selectedFindingId}
              onSelectFinding={setSelectedFindingId}
            />
          ) : (
            <LeafInspector3D
              findings={findings.map((f) => ({
                id: f.id,
                name: f.name,
                category: f.category,
                severity: f.severity,
                confidence: f.confidence,
                box_x: f.box_x,
                box_y: f.box_y,
              }))}
              selectedFindingId={selectedFindingId}
              onSelectFinding={setSelectedFindingId}
            />
          )}

          {/* AI Clinical Summary Banner */}
          {diagnosis.summary && (
            <div className="p-4 rounded-xl bg-cream-100 border border-soil-600/15 space-y-1.5">
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-soil-800">
                Diagnostic Agronomic Summary
              </span>
              <p className="text-xs text-soil-700 leading-relaxed">{diagnosis.summary}</p>
            </div>
          )}

          {/* Anomaly Flags */}
          {diagnosis.anomalyFlags && diagnosis.anomalyFlags.length > 0 && (
            <div className="p-4 rounded-xl bg-wheat-100/60 border border-wheat-400 space-y-1.5">
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-soil-900">
                Field Pattern & Anomaly Flags
              </span>
              <ul className="text-xs text-soil-800 list-disc list-inside space-y-0.5">
                {diagnosis.anomalyFlags.map((flag: string, fIdx: number) => (
                  <li key={fIdx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Health Gauge & Synchronized Findings List */}
        <div className="lg:col-span-5 space-y-5">
          {/* Health Gauge Box */}
          <div className="p-5 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow flex flex-col items-center justify-center">
            <span className="font-serif text-xs font-bold text-soil-600 uppercase tracking-wider mb-2">
              Overall Canopy Vigor Score
            </span>
            <HealthGauge score={scan.health_score} size={190} />

            <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-3 border-t border-soil-600/10 text-center text-xs">
              <div>
                <span className="text-soil-500">Spread Risk:</span>
                <p className="font-serif font-bold text-soil-900 capitalize">
                  {diagnosis.spreadRisk || 'Low'}
                </p>
              </div>
              <div>
                <span className="text-soil-500">Crop Match:</span>
                <p className="font-serif font-bold text-soil-900">
                  {diagnosis.crop?.matchesDeclared ? 'Verified' : 'Look-alike'}
                </p>
              </div>
            </div>
          </div>

          {/* Findings List (Synced with viewer) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-soil-900">
                Localized Pathology Findings ({findings.length})
              </h3>
              <span className="text-[11px] text-soil-500">Sorted by Severity</span>
            </div>

            {findings.length === 0 ? (
              <div className="p-6 rounded-xl bg-cream-100 text-center text-xs text-soil-600 space-y-1">
                <ShieldCheck className="w-6 h-6 text-leaf-600 mx-auto" />
                <p className="font-serif font-bold text-soil-900">No severe pathologies detected</p>
                <p>The analyzed foliage exhibits healthy vigor with no acute visual lesions.</p>
              </div>
            ) : (
              findings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  differentials={diagnosis.differentials || []}
                  isSelected={selectedFindingId === finding.id}
                  onSelect={() => setSelectedFindingId(finding.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Prioritized Treatment Plan */}
      <div className="p-6 sm:p-8 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-6">
        <div>
          <span className="text-xs uppercase font-serif tracking-wider font-bold text-leaf-700">
            Actionable Field Protocol
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-soil-950">
            Prioritized Treatment & Prevention Plan
          </h2>
          <p className="text-xs text-soil-600 mt-1 max-w-2xl">
            Structured into immediate, short-term, season-long, and cultural prevention measures. Organic & mechanical options precede chemical inputs.
          </p>
        </div>

        <TreatmentTabs plan={treatment} />
      </div>

      {/* Section 3: Grounded Agronomy Follow-up Chat */}
      <div className="p-6 sm:p-8 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-4 no-print">
        <div>
          <span className="text-xs uppercase font-serif tracking-wider font-bold text-clay-400">
            Contextual Q&A
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-soil-950">
            Follow-Up Agronomy Consultation
          </h2>
          <p className="text-xs text-soil-600 mt-1">
            Ask specific follow-up questions about weather timing, active ingredient classifications, or sanitary practices.
          </p>
        </div>

        <ScanChatPanel scanId={scan.id} />
      </div>

      {/* Persistent Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
