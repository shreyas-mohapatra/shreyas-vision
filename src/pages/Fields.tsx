import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Layers,
  Plus,
  MapPin,
  Sprout,
  Activity,
  Trash2,
  Edit2,
  X,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { listFields, createField, deleteField, Field } from '../api/fields.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { SeverityBadge } from '../components/results/Badges.js';
import { TiltCard } from '../components/three/TiltCard.js';
import toast from 'react-hot-toast';

const newFieldSchema = z.object({
  name: z.string().trim().min(1, 'Field name is required').max(100),
  cropName: z.string().trim().min(1, 'Crop name is required').max(60),
  cropCategory: z.enum([
    'cereals',
    'pulses',
    'oilseeds',
    'vegetables',
    'fruits',
    'cash_plantation',
    'other',
  ]),
  areaValue: z.coerce.number().positive('Must be greater than 0').optional(),
  areaUnit: z.enum(['acre', 'hectare']).default('acre'),
  location: z.string().trim().min(2, 'Location is required').max(120),
  soilType: z
    .enum(['alluvial', 'black', 'red', 'laterite', 'sandy', 'loamy', 'clayey', 'unknown'])
    .optional(),
  irrigationMethod: z
    .enum(['rainfed', 'drip', 'sprinkler', 'flood', 'furrow', 'unknown'])
    .optional(),
});

type NewFieldFormData = z.infer<typeof newFieldSchema>;

export const Fields: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewFieldFormData>({
    resolver: zodResolver(newFieldSchema) as any,
    defaultValues: {
      name: '',
      cropName: 'wheat',
      cropCategory: 'cereals',
      areaValue: 5,
      areaUnit: 'acre',
      location: '',
      soilType: 'alluvial',
      irrigationMethod: 'sprinkler',
    },
  });

  const loadFields = async () => {
    setIsLoading(true);
    try {
      const res = await listFields();
      setFields(res.fields || []);
    } catch {
      toast.error('Failed to load fields list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleCreate = async (data: NewFieldFormData) => {
    setIsSubmitting(true);
    try {
      await createField(data);
      toast.success(`Field "${data.name}" created successfully`);
      setIsModalOpen(false);
      reset();
      loadFields();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create field');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? All associated scan history will be permanently deleted.`)) {
      return;
    }
    try {
      await deleteField(id);
      toast.success(`Field "${name}" deleted`);
      setFields((prev) => prev.filter((f) => f.id !== id));
    } catch {
      toast.error('Failed to delete field');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agricultural Fields & Parcels"
        kicker="Land Management"
        description="Organize your acreage, crop types, and soil characteristics to group visual scans and monitor progression."
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-wheat-300" />
            <span>Create New Field</span>
          </button>
        }
      />

      {/* Fields List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-cream-200 rounded-2xl" />
          ))}
        </div>
      ) : fields.length === 0 ? (
        <div className="p-12 text-center bg-cream-100 rounded-2xl border-2 border-dashed border-soil-600/20 max-w-md mx-auto space-y-3">
          <Layers className="w-8 h-8 text-soil-400 mx-auto" />
          <h4 className="font-serif text-base font-bold text-soil-900">
            No fields created yet
          </h4>
          <p className="text-xs text-soil-600">
            Define your first agricultural plot to start recording visual pathology scans.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-leaf-700 text-cream-50 text-xs font-semibold btn-press cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Field</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <TiltCard
              key={field.id}
              className="p-5 bg-cream-100 border border-soil-600/15 warm-shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-soil-950 leading-tight">
                      {field.name}
                    </h3>
                    <p className="text-xs font-medium text-leaf-800 capitalize flex items-center gap-1.5 mt-0.5">
                      <Sprout className="w-3.5 h-3.5 text-leaf-600" />
                      <span>
                        {field.crop_name} ({field.crop_category})
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(field.id, field.name)}
                    className="p-1.5 rounded-lg text-soil-400 hover:text-rust-600 hover:bg-rust-50 transition-colors cursor-pointer"
                    title="Delete field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-soil-600 space-y-1 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-soil-500" />
                    <span className="truncate">{field.location}</span>
                  </div>
                  {field.area_value && (
                    <div className="text-[11px] text-soil-500">
                      Area: {field.area_value} {field.area_unit}s · Soil: {field.soil_type || 'unspecified'}
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Actions Footer */}
              <div className="pt-3 border-t border-soil-600/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-soil-500">
                    {field.scan_count || 0} {field.scan_count === 1 ? 'scan' : 'scans'} recorded
                  </span>
                  {field.latest_severity && (
                    <SeverityBadge severity={field.latest_severity} />
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/fields/${field.id}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-cream-50 hover:bg-cream-200 text-soil-800 text-xs font-medium border border-soil-600/15 transition-colors"
                  >
                    Timeline & History
                  </Link>
                  <Link
                    to={`/scan/new?fieldId=${field.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold btn-press transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-wheat-300" />
                    <span>Scan Now</span>
                  </Link>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      {/* Modal: Create Field */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soil-950/40 backdrop-blur-xs">
          <div className="bg-cream-50 rounded-2xl border border-soil-600/20 max-w-lg w-full p-6 space-y-5 warm-shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-soil-600/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-leaf-700 text-wheat-300 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-soil-950">
                  Register Agricultural Field
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-soil-500 hover:text-soil-800 hover:bg-cream-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-soil-700 mb-1">Field Name / Plot Title</label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. North Orchard, Plot 3B"
                  className="w-full bg-cream-100 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-soil-900 focus:outline-none"
                />
                {errors.name && <p className="text-rust-600 mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-soil-700 mb-1">Crop Category</label>
                  <select
                    {...register('cropCategory')}
                    className="w-full bg-cream-100 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                  >
                    <option value="cereals">Cereals & Grains</option>
                    <option value="pulses">Pulses & Legumes</option>
                    <option value="oilseeds">Oilseeds</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits & Orchards</option>
                    <option value="cash_plantation">Cash & Plantation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-soil-700 mb-1">Primary Crop</label>
                  <input
                    type="text"
                    {...register('cropName')}
                    placeholder="e.g. wheat, tomato, cotton"
                    className="w-full bg-cream-100 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-soil-900 focus:outline-none"
                  />
                  {errors.cropName && <p className="text-rust-600 mt-1">{errors.cropName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-soil-700 mb-1">Area Value</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('areaValue')}
                    placeholder="e.g. 4.5"
                    className="w-full bg-cream-100 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-soil-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-soil-700 mb-1">Area Unit</label>
                  <select
                    {...register('areaUnit')}
                    className="w-full bg-cream-100 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                  >
                    <option value="acre">Acres</option>
                    <option value="hectare">Hectares</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-soil-700 mb-1">Location / District / State</label>
                <input
                  type="text"
                  {...register('location')}
                  placeholder="e.g. Ludhiana, Punjab"
                  className="w-full bg-cream-100 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-soil-900 focus:outline-none"
                />
                {errors.location && <p className="text-rust-600 mt-1">{errors.location.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-soil-700 mb-1">Soil Type</label>
                  <select
                    {...register('soilType')}
                    className="w-full bg-cream-100 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                  >
                    <option value="alluvial">Alluvial Soil</option>
                    <option value="black">Black / Regur Soil</option>
                    <option value="red">Red Soil</option>
                    <option value="laterite">Laterite Soil</option>
                    <option value="sandy">Sandy Soil</option>
                    <option value="loamy">Loamy Soil</option>
                    <option value="clayey">Clayey Soil</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-soil-700 mb-1">Irrigation Method</label>
                  <select
                    {...register('irrigationMethod')}
                    className="w-full bg-cream-100 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                  >
                    <option value="sprinkler">Sprinkler</option>
                    <option value="drip">Drip</option>
                    <option value="rainfed">Rainfed</option>
                    <option value="flood">Flood</option>
                    <option value="furrow">Furrow</option>
                    <option value="unknown">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-soil-600/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-soil-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 font-semibold cursor-pointer btn-press"
                >
                  {isSubmitting ? 'Saving…' : 'Save Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
