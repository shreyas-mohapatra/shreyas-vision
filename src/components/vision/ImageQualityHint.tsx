import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Sun, Focus, Eye } from 'lucide-react';

export interface QualityAssessment {
  imageIndex: number;
  usable: boolean;
  blur: 'none' | 'mild' | 'severe';
  lighting: 'good' | 'too_dark' | 'too_bright' | 'uneven';
  framing: 'good' | 'too_far' | 'too_close' | 'partial';
  retakeTips: string[];
}

interface ImageQualityHintProps {
  assessments?: QualityAssessment[];
  onRetake?: () => void;
}

export const ImageQualityHint: React.FC<ImageQualityHintProps> = ({
  assessments = [],
  onRetake,
}) => {
  if (!assessments || assessments.length === 0) return null;

  const hasUnusable = assessments.some((a) => !a.usable);

  return (
    <div
      className={`rounded-xl p-4 border transition-all ${
        hasUnusable
          ? 'bg-ochre-500/10 border-ochre-500/40 text-soil-900'
          : 'bg-leaf-500/10 border-leaf-500/30 text-soil-900'
      }`}
    >
      <div className="flex items-start gap-3">
        {hasUnusable ? (
          <AlertCircle className="w-5 h-5 text-ochre-600 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-leaf-600 shrink-0 mt-0.5" />
        )}

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-semibold">
              {hasUnusable
                ? 'Image Quality Caution: Retake Recommended'
                : 'Computer Vision Image Quality: Clear & Diagnostic'}
            </h4>
            {hasUnusable && onRetake && (
              <button
                type="button"
                onClick={onRetake}
                className="inline-flex items-center gap-1 text-xs font-medium text-ochre-700 hover:text-ochre-800 underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Retake Photo
              </button>
            )}
          </div>

          <p className="text-xs text-soil-600">
            {hasUnusable
              ? 'Certain regions exhibit lighting, blur, or distance conditions that limit diagnostic certainty.'
              : 'Lighting, sharpness, and framing meet agronomic visual pathology standards.'}
          </p>

          {/* Individual image assessment details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {assessments.map((item, idx) => (
              <div
                key={idx}
                className="text-xs bg-cream-50/80 rounded-lg p-2.5 border border-soil-600/10 space-y-1"
              >
                <div className="flex items-center justify-between font-medium">
                  <span>Photo #{item.imageIndex + 1}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                      item.usable ? 'bg-leaf-100 text-leaf-800' : 'bg-rust-100 text-rust-700'
                    }`}
                  >
                    {item.usable ? 'Usable' : 'Sub-optimal'}
                  </span>
                </div>
                <div className="text-[11px] text-soil-600 flex items-center gap-2">
                  <span>Blur: {item.blur}</span>
                  <span>·</span>
                  <span>Light: {item.lighting.replace('_', ' ')}</span>
                  <span>·</span>
                  <span>Frame: {item.framing.replace('_', ' ')}</span>
                </div>
                {item.retakeTips && item.retakeTips.length > 0 && (
                  <ul className="text-[11px] text-soil-700 list-disc list-inside space-y-0.5 pt-1">
                    {item.retakeTips.map((tip, tIdx) => (
                      <li key={tIdx}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
