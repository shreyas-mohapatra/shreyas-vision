import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  Camera,
  GitCompare,
  MapPin,
  Calendar,
  Activity,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { getField, FieldDetailResponse } from '../api/fields.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { HealthTrendChart } from '../components/charts/HealthTrendChart.js';
import { SeverityBadge, UrgencyBadge } from '../components/results/Badges.js';
import toast from 'react-hot-toast';

export const FieldDetail: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const [data, setData] = useState<FieldDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!fieldId) return;
    setIsLoading(true);
    getField(fieldId)
      .then((res) => setData(res))
      .catch((err) => {
        toast.error('Failed to load field details');
      })
      .finally(() => setIsLoading(false));
  }, [fieldId]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-cream-200 rounded-xl w-1/3" />
        <div className="h-64 bg-cream-200 rounded-2xl" />
        <div className="h-48 bg-cream-200 rounded-2xl" />
      </div>
    );
  }

  if (!data || !data.field) {
    return (
      <div className="p-12 text-center bg-cream-100 rounded-2xl space-y-4">
        <h3 className="font-serif text-lg font-bold text-soil-900">Field Not Found</h3>
        <Link to="/fields" className="text-xs text-leaf-700 underline font-medium">
          Return to fields directory
        </Link>
      </div>
    );
  }

  const { field, trend } = data;

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/fields"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soil-600 hover:text-soil-900 mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Fields</span>
        </Link>

        <PageHeader
          title={field.name}
          kicker="Field Inspection Station"
          description={`Plot: ${field.crop_name} (${field.crop_category}) · Location: ${field.location}`}
          actions={
            <div className="flex items-center gap-2.5">
              {trend.length >= 2 && (
                <Link
                  to={`/compare/${field.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-soil-800 text-xs font-medium border border-soil-600/15 warm-shadow-sm transition-colors"
                >
                  <GitCompare className="w-4 h-4 text-soil-600" />
                  <span>Compare Scans</span>
                </Link>
              )}
              <Link
                to={`/scan/new?fieldId=${field.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors"
              >
                <Camera className="w-4 h-4 text-wheat-300" />
                <span>New Crop Scan</span>
              </Link>
            </div>
          }
        />
      </div>

      {/* Field Characteristics Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow text-xs">
        <div className="space-y-1">
          <span className="text-soil-500 font-medium">Acreage</span>
          <p className="font-serif font-bold text-soil-900 text-sm">
            {field.area_value ? `${field.area_value} ${field.area_unit}s` : 'Not specified'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-soil-500 font-medium">Soil Classification</span>
          <p className="font-serif font-bold text-soil-900 text-sm capitalize">
            {field.soil_type || 'Unknown'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-soil-500 font-medium">Irrigation Setup</span>
          <p className="font-serif font-bold text-soil-900 text-sm capitalize">
            {field.irrigation_method || 'Rainfed'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-soil-500 font-medium">Registered On</span>
          <p className="font-serif font-bold text-soil-900 text-sm">
            {new Date(field.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Health Progression Trend Line Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif text-base font-bold text-soil-900">
              Crop Vigor Progression Trend
            </h4>
            <p className="text-xs text-soil-500">
              Health score over time (0–100 scale, higher is healthier)
            </p>
          </div>
          <span className="text-xs font-semibold text-leaf-800 bg-leaf-100 px-2.5 py-0.5 rounded-lg">
            {trend.length} {trend.length === 1 ? 'Data Point' : 'Data Points'}
          </span>
        </div>

        <HealthTrendChart data={trend} />
      </div>

      {/* Scan Timeline */}
      <div className="p-5 sm:p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-base font-bold text-soil-900">
            Inspection Timeline & Scan Reports
          </h4>
          <span className="text-xs text-soil-500">{trend.length} visual inspections</span>
        </div>

        {trend.length === 0 ? (
          <div className="p-8 text-center text-xs text-soil-500 space-y-2">
            <Camera className="w-6 h-6 mx-auto text-soil-400" />
            <p>No scans recorded for this field yet. Take your first photo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trend.map((s, idx) => (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-cream-50 border border-soil-600/10 hover:border-soil-600/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 warm-shadow-sm cursor-pointer"
                onClick={() => (window.location.href = `/scans/${s.id}`)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-soil-900">
                      Scan #{trend.length - idx}
                    </span>
                    <span className="text-xs text-soil-500 capitalize">
                      · {s.growth_stage?.replace('_', ' ')} stage
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-soil-600">
                    <span>
                      {new Date(s.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span>{s.finding_count} pathology findings localized</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-serif font-bold text-base text-soil-900">
                      {s.health_score} <span className="text-xs font-normal text-soil-500">/100</span>
                    </div>
                    <SeverityBadge severity={s.overall_severity} />
                  </div>

                  <Link
                    to={`/scans/${s.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-soil-800 transition-colors"
                    title="View Full Diagnosis"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
