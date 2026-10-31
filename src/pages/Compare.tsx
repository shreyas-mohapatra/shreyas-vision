import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { getField, FieldDetailResponse } from '../api/fields.js';
import { compareScans, ComparisonData } from '../api/compare.js';
import { CompareSlider } from '../components/vision/CompareSlider.js';
import { ProgressionReport } from '../components/results/ProgressionReport.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import toast from 'react-hot-toast';

export const Compare: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const [searchParams] = useSearchParams();
  const currentParam = searchParams.get('current');

  const [fieldData, setFieldData] = useState<FieldDetailResponse | null>(null);
  const [prevScanId, setPrevScanId] = useState('');
  const [currScanId, setCurrScanId] = useState('');
  const [treatmentsBetween, setTreatmentsBetween] = useState('');

  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [isLoadingField, setIsLoadingField] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (!fieldId) return;
    setIsLoadingField(true);
    getField(fieldId)
      .then((res) => {
        setFieldData(res);
        const scans = res.trend || [];
        if (scans.length >= 2) {
          // Default latest scan as currScan, previous as prevScan
          const latest = scans[scans.length - 1];
          const previous = scans[scans.length - 2];

          setCurrScanId(currentParam || latest.id);
          setPrevScanId(previous.id === currentParam ? scans[scans.length - 1].id : previous.id);
        }
      })
      .catch(() => {
        toast.error('Failed to load field timeline for comparison');
      })
      .finally(() => setIsLoadingField(false));
  }, [fieldId, currentParam]);

  const handleRunComparison = async () => {
    if (!fieldId || !prevScanId || !currScanId) {
      toast.error('Please choose two different scans to compare');
      return;
    }
    if (prevScanId === currScanId) {
      toast.error('Please select two distinct scans taken at different times');
      return;
    }

    setIsComparing(true);
    try {
      const res = await compareScans(fieldId, {
        previousScanId: prevScanId,
        currentScanId: currScanId,
        treatmentsBetween: treatmentsBetween || undefined,
      });
      setComparison(res.comparison);
      toast.success('Visual progression comparison completed');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to compare scans');
    } finally {
      setIsComparing(false);
    }
  };

  if (isLoadingField) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-cream-200 rounded-xl w-1/3" />
        <div className="h-72 bg-cream-200 rounded-2xl" />
      </div>
    );
  }

  const scans = fieldData?.trend || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <Link
          to={`/fields/${fieldId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soil-600 hover:text-soil-900 mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to {fieldData?.field.name || 'Field'}</span>
        </Link>

        <PageHeader
          title="Scan-over-Scan Progression Comparison"
          kicker="Visual Anomaly & Recovery Tracking"
          description={`Contrast two temporal inspections of "${fieldData?.field.name}" to detect symptom remission, spread velocity, or new pathology pressures.`}
        />
      </div>

      {scans.length < 2 ? (
        <div className="p-12 text-center bg-cream-100 rounded-2xl border-2 border-dashed border-soil-600/20 max-w-md mx-auto space-y-3">
          <GitCompare className="w-8 h-8 text-soil-400 mx-auto" />
          <h4 className="font-serif text-base font-bold text-soil-900">
            At Least 2 Scans Needed for Comparison
          </h4>
          <p className="text-xs text-soil-600">
            Progression tracking requires an earlier baseline scan and a subsequent re-scan of the same plot.
          </p>
          <Link
            to={`/scan/new?fieldId=${fieldId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-leaf-700 text-cream-50 text-xs font-semibold btn-press"
          >
            <Camera className="w-4 h-4 text-wheat-300" />
            <span>Take Second Scan</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Comparison Selection Controls */}
          <div className="p-5 sm:p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-4">
            <h3 className="font-serif text-base font-bold text-soil-950">
              Select Scans to Compare
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-soil-700 font-medium mb-1">
                  Baseline / Previous Scan (Image A)
                </label>
                <select
                  value={prevScanId}
                  onChange={(e) => setPrevScanId(e.target.value)}
                  className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                >
                  {scans.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      Scan #{scans.length - idx} · {new Date(s.created_at).toLocaleDateString()} (Score: {s.health_score})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-soil-700 font-medium mb-1">
                  Follow-Up / Current Scan (Image B)
                </label>
                <select
                  value={currScanId}
                  onChange={(e) => setCurrScanId(e.target.value)}
                  className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                >
                  {scans.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      Scan #{scans.length - idx} · {new Date(s.created_at).toLocaleDateString()} (Score: {s.health_score})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-soil-700 mb-1">
                Treatments or Interventions Applied in Between (Optional Context)
              </label>
              <input
                type="text"
                value={treatmentsBetween}
                onChange={(e) => setTreatmentsBetween(e.target.value)}
                placeholder="e.g. Copper fungicide spray 6 days ago; irrigation reduced by 30%"
                maxLength={500}
                className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-xs text-soil-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleRunComparison}
                disabled={isComparing || prevScanId === currScanId}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-leaf-700 hover:bg-leaf-800 disabled:opacity-50 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors cursor-pointer"
              >
                {isComparing ? (
                  <div className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-wheat-300" />
                )}
                <span>{isComparing ? 'Comparing Images with Gemini…' : 'Run Progression Analysis'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Split Before/After Slider */}
          {prevScanId && currScanId && prevScanId !== currScanId && (
            <div className="p-5 sm:p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-4">
              <h3 className="font-serif text-base font-bold text-soil-950">
                Interactive Before / After Split Inspection
              </h3>
              <CompareSlider
                beforeUrl={`/api/v1/scans/${prevScanId}/images/0`}
                afterUrl={`/api/v1/scans/${currScanId}/images/0`}
                beforeLabel="Baseline Scan"
                afterLabel="Follow-up Scan"
              />
            </div>
          )}

          {/* AI Progression Report Output */}
          {comparison && (
            <div className="p-5 sm:p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-6">
              <div className="border-b border-soil-600/10 pb-3">
                <span className="text-xs uppercase font-serif tracking-wider font-bold text-leaf-700">
                  Visual Intelligence Report
                </span>
                <h3 className="font-serif text-xl font-bold text-soil-950">
                  Field Progression Assessment
                </h3>
              </div>

              <ProgressionReport comparison={comparison} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
