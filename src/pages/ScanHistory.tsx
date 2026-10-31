import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Filter,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  GitCompare,
  Trash2,
} from 'lucide-react';
import { listScans, deleteScan, ScanDetail } from '../api/scans.js';
import { listFields, Field } from '../api/fields.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { SeverityBadge, UrgencyBadge } from '../components/results/Badges.js';
import toast from 'react-hot-toast';

export const ScanHistory: React.FC = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadData = () => {
    setIsLoading(true);
    listScans({
      page,
      limit: 10,
      fieldId: selectedFieldId || undefined,
      severity: selectedSeverity || undefined,
      category: selectedCategory || undefined,
    })
      .then((res) => {
        setScans(res.scans || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => {
        toast.error('Failed to load scan history');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    listFields().then((res) => setFields(res.fields || []));
  }, []);

  useEffect(() => {
    loadData();
  }, [page, selectedFieldId, selectedSeverity, selectedCategory]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await deleteScan(id);
      toast.success('Scan deleted');
      loadData();
    } catch {
      toast.error('Failed to delete scan');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Visual Pathology Scan Archive"
        kicker="Historical Field Scouting"
        description="Search, filter, and inspect computer-vision diagnostic reports across your agricultural plots."
        actions={
          <Link
            to="/scan/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors"
          >
            <Camera className="w-4 h-4 text-wheat-300" />
            <span>New Crop Scan</span>
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Field Filter */}
        <div>
          <label className="block text-soil-700 font-medium mb-1">Filter by Field Plot</label>
          <select
            value={selectedFieldId}
            onChange={(e) => {
              setSelectedFieldId(e.target.value);
              setPage(1);
            }}
            className="w-full bg-cream-50 border border-soil-600/20 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
          >
            <option value="">All Registered Fields</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.crop_name})
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-soil-700 font-medium mb-1">Filter by Severity</label>
          <select
            value={selectedSeverity}
            onChange={(e) => {
              setSelectedSeverity(e.target.value);
              setPage(1);
            }}
            className="w-full bg-cream-50 border border-soil-600/20 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
          >
            <option value="">All Severity Levels</option>
            <option value="none">Healthy (None)</option>
            <option value="low">Low Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="high">High Severity</option>
            <option value="critical">Critical Severity</option>
          </select>
        </div>

        {/* Pathology Category Filter */}
        <div>
          <label className="block text-soil-700 font-medium mb-1">Filter by Finding Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full bg-cream-50 border border-soil-600/20 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
          >
            <option value="">All Pathologies & Stressors</option>
            <option value="fungal_disease">Fungal Diseases</option>
            <option value="bacterial_disease">Bacterial Diseases</option>
            <option value="viral_disease">Viral Diseases</option>
            <option value="insect_pest">Insect Pests</option>
            <option value="mite_pest">Mite Pests</option>
            <option value="nutrient_deficiency">Nutrient Deficiencies</option>
            <option value="water_stress">Water Stress</option>
            <option value="weed_pressure">Weed Pressures</option>
          </select>
        </div>
      </div>

      {/* Scans List / Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-4">
        <div className="flex items-center justify-between text-xs text-soil-600">
          <span className="font-medium font-serif text-soil-800">
            {total} {total === 1 ? 'Scan' : 'Scans'} Found
          </span>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-cream-200 rounded-xl" />
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="p-10 text-center text-xs text-soil-500 space-y-2">
            <Camera className="w-6 h-6 mx-auto text-soil-400" />
            <p>No scans match your current filter selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-soil-600/15 text-soil-600 font-serif">
                  <th className="py-2.5 px-3">Field Parcel</th>
                  <th className="py-2.5 px-3">Crop & Stage</th>
                  <th className="py-2.5 px-3">Health Score</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Findings Localized</th>
                  <th className="py-2.5 px-3">Inspection Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soil-600/10">
                {scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-cream-200/50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/scans/${scan.id}`)}
                  >
                    <td className="py-3 px-3">
                      <div className="font-serif font-semibold text-soil-900">
                        {scan.field_name}
                      </div>
                      <span className="text-[11px] text-soil-500">
                        {scan.image_count} {scan.image_count === 1 ? 'image' : 'images'}
                      </span>
                    </td>
                    <td className="py-3 px-3 capitalize text-soil-700">
                      <div>{scan.crop_name}</div>
                      <span className="text-[11px] text-soil-500">
                        {scan.growth_stage?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-serif font-bold text-soil-900 text-sm">
                        {scan.health_score ?? '—'}
                      </span>{' '}
                      <span className="text-[10px] text-soil-500">/100</span>
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={scan.overall_severity} />
                    </td>
                    <td className="py-3 px-3 text-soil-700">
                      {scan.finding_count || 0} findings
                    </td>
                    <td className="py-3 px-3 text-soil-600">
                      {new Date(scan.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <Link
                        to={`/scans/${scan.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-leaf-700 hover:text-leaf-900 font-semibold underline text-xs"
                      >
                        Report
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(scan.id);
                        }}
                        className="text-soil-400 hover:text-rust-600 text-xs cursor-pointer"
                        title="Delete scan"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-soil-600/10 text-xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-cream-50 hover:bg-cream-200 text-soil-800 disabled:opacity-40 border border-soil-600/15 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-soil-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-cream-50 hover:bg-cream-200 text-soil-800 disabled:opacity-40 border border-soil-600/15 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
