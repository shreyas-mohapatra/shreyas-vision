import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Tag, Eye } from 'lucide-react';
import { ScanImageMeta, ScanFinding } from '../../api/scans.js';

interface AnnotatedImageViewerProps {
  images: ScanImageMeta[];
  findings: ScanFinding[];
  selectedFindingId?: string | null;
  onSelectFinding?: (id: string) => void;
}

const SEVERITY_STROKES: Record<string, string> = {
  none: '#4E8A57',
  low: '#74A87C',
  medium: '#C88A1E',
  high: '#B4532A',
  critical: '#7A2E1B',
};

const SEVERITY_FILLS: Record<string, string> = {
  none: 'rgba(78, 138, 87, 0.15)',
  low: 'rgba(116, 168, 124, 0.2)',
  medium: 'rgba(200, 138, 30, 0.25)',
  high: 'rgba(180, 83, 42, 0.3)',
  critical: 'rgba(122, 46, 27, 0.35)',
};

export const AnnotatedImageViewer: React.FC<AnnotatedImageViewerProps> = ({
  images,
  findings,
  selectedFindingId,
  onSelectFinding,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 rounded-2xl bg-cream-100 flex items-center justify-center text-soil-500 font-serif">
        No crop images available for this scan.
      </div>
    );
  }

  const currentImage = images[activeImageIndex] || images[0];

  // Filter findings appearing on the active image
  const activeFindings = findings.filter(
    (f) => f.image_position === (currentImage.position ?? activeImageIndex)
  );

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.3, 1));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="flex flex-col bg-cream-100 rounded-2xl border border-soil-600/15 overflow-hidden warm-shadow">
      {/* Top Controls Toolbar */}
      <div className="px-4 py-2.5 bg-cream-200/60 border-b border-soil-600/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Multi-image selection tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveImageIndex(idx);
                handleResetZoom();
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeImageIndex === idx
                  ? 'bg-soil-950 text-cream-50 shadow-xs'
                  : 'bg-cream-50/80 text-soil-700 hover:bg-cream-50'
              }`}
            >
              Photo #{idx + 1}
              {findings.some((f) => f.image_position === img.position) && (
                <span className="ml-1.5 w-1.5 h-1.5 inline-block rounded-full bg-rust-500" />
              )}
            </button>
          ))}
        </div>

        {/* View Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              showLabels
                ? 'bg-wheat-300/40 border-wheat-500 text-soil-900 font-medium'
                : 'bg-cream-50 border-soil-600/20 text-soil-600'
            }`}
            title="Toggle bounding box labels"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Labels</span>
          </button>

          <div className="flex items-center bg-cream-50 border border-soil-600/20 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1 hover:bg-cream-200 text-soil-700 disabled:opacity-40 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] text-soil-600 select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.5}
              className="p-1 hover:bg-cream-200 text-soil-700 disabled:opacity-40 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel > 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 border-l border-soil-600/10 hover:bg-cream-200 text-soil-700 cursor-pointer"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Image Display Area with SVG Overlays */}
      <div className="relative w-full overflow-auto max-h-[560px] bg-soil-950/5 flex items-center justify-center p-2 sm:p-4 select-none">
        <div
          className="relative inline-block transition-transform duration-150 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Crop Photo */}
          <img
            src={currentImage.url}
            alt="Analyzed crop specimen"
            className="block max-w-full h-auto max-h-[480px] rounded-xl object-contain warm-shadow"
            style={{ maxWidth: '100%' }}
          />

          {/* SVG Normalized Bounding Boxes Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-auto"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
          >
            {activeFindings.map((finding) => {
              const isSelected = selectedFindingId === finding.id;
              const isHovered = hoveredFindingId === finding.id;
              const strokeColor = SEVERITY_STROKES[finding.severity] || '#B4532A';
              const fillColor = SEVERITY_FILLS[finding.severity] || 'rgba(180, 83, 42, 0.2)';

              // Normalized coordinates (0..1)
              const x = finding.box_x;
              const y = finding.box_y;
              const w = finding.box_w;
              const h = finding.box_h;

              return (
                <g
                  key={finding.id}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredFindingId(finding.id)}
                  onMouseLeave={() => setHoveredFindingId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFinding?.(finding.id);
                  }}
                >
                  {/* Bounding Box Rectangle */}
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={isSelected || isHovered ? fillColor : 'transparent'}
                    stroke={strokeColor}
                    strokeWidth={isSelected || isHovered ? 0.007 : 0.004}
                    strokeDasharray={isSelected ? '0.02 0.01' : 'none'}
                    rx={0.005}
                  />

                  {/* Corner Accent Grips */}
                  <circle cx={x} cy={y} r={0.006} fill={strokeColor} />
                  <circle cx={x + w} cy={y} r={0.006} fill={strokeColor} />
                  <circle cx={x} cy={y + h} r={0.006} fill={strokeColor} />
                  <circle cx={x + w} cy={y + h} r={0.006} fill={strokeColor} />
                </g>
              );
            })}
          </svg>

          {/* HTML Overlay Badges for crisp text above SVG */}
          {showLabels &&
            activeFindings.map((finding) => {
              const isSelected = selectedFindingId === finding.id;
              const isHovered = hoveredFindingId === finding.id;
              const strokeColor = SEVERITY_STROKES[finding.severity] || '#B4532A';

              // Convert normalized coordinates to percentages
              const leftPercent = `${finding.box_x * 100}%`;
              const topPercent = `${Math.max(0, finding.box_y * 100 - 4)}%`;

              return (
                <div
                  key={`label-${finding.id}`}
                  style={{ left: leftPercent, top: topPercent, borderLeft: `3px solid ${strokeColor}` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFinding?.(finding.id);
                  }}
                  onMouseEnter={() => setHoveredFindingId(finding.id)}
                  onMouseLeave={() => setHoveredFindingId(null)}
                  className={`absolute z-20 -translate-y-full transform transition-all cursor-pointer pointer-events-auto px-2 py-0.5 rounded text-[11px] font-medium font-serif flex items-center gap-1 shadow-sm ${
                    isSelected || isHovered
                      ? 'bg-soil-950 text-cream-50 scale-105 ring-1 ring-wheat-300'
                      : 'bg-cream-50/95 text-soil-900'
                  }`}
                >
                  <span>{finding.name}</span>
                  <span className="text-[10px] text-soil-500 font-sans">
                    ({Math.round(finding.confidence * 100)}%)
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Legend / Status Footer */}
      <div className="px-4 py-2 bg-cream-50 border-t border-soil-600/10 flex flex-wrap items-center justify-between gap-3 text-xs text-soil-600">
        <div className="flex items-center gap-3">
          <span className="font-medium text-soil-700">Severity:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-leaf-500" /> Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-ochre-500" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rust-500" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-critical" /> Critical
          </span>
        </div>
        <span>
          {activeFindings.length} pathology {activeFindings.length === 1 ? 'region' : 'regions'}{' '}
          localized
        </span>
      </div>
    </div>
  );
};
