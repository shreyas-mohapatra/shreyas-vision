import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Layers,
  Camera,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Leaf,
  Plus,
} from 'lucide-react';
import { listFields, Field } from '../api/fields.js';
import { createScan } from '../api/scans.js';
import { ImageDropzone, UploadedCropImage } from '../components/vision/ImageDropzone.js';
import { ScanLoader3D } from '../components/three/ScanLoader3D.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import toast from 'react-hot-toast';

const newScanFormSchema = z.object({
  fieldId: z.string().uuid('Please select an active field parcel'),
  cropName: z.string().trim().min(1, 'Crop name is required'),
  growthStage: z.enum([
    'germination',
    'seedling',
    'vegetative',
    'flowering',
    'fruiting',
    'maturity',
    'post_harvest',
    'unknown',
  ]),
  daysSincePlanting: z.coerce.number().int().min(0).max(400).optional(),
  location: z.string().trim().min(2, 'Location is required'),
  soilType: z.string().optional(),
  irrigationMethod: z.string().optional(),
  season: z.enum(['kharif', 'rabi', 'zaid', 'perennial', 'unknown']).optional(),
  recentWeather: z
    .enum(['dry', 'humid', 'rainy', 'heatwave', 'cold_spell', 'stormy', 'normal'])
    .optional(),
  affectedAreaPercent: z.coerce.number().int().min(0).max(100).optional(),
  symptomNotes: z.string().trim().max(1000).optional(),
  previousTreatments: z.string().trim().max(500).optional(),
  preferOrganic: z.boolean().default(true),
  language: z.enum(['en', 'hi', 'bn', 'te', 'ta', 'mr']).default('en'),
});

type NewScanFormData = z.infer<typeof newScanFormSchema>;

export const NewScan: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultFieldId = searchParams.get('fieldId') || '';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fields, setFields] = useState<Field[]>([]);
  const [images, setImages] = useState<UploadedCropImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewScanFormData>({
    resolver: zodResolver(newScanFormSchema) as any,
    defaultValues: {
      fieldId: defaultFieldId,
      cropName: '',
      growthStage: 'vegetative',
      daysSincePlanting: 35,
      location: '',
      soilType: 'alluvial',
      irrigationMethod: 'sprinkler',
      season: 'rabi',
      recentWeather: 'normal',
      affectedAreaPercent: 15,
      symptomNotes: '',
      previousTreatments: '',
      preferOrganic: true,
      language: 'en',
    },
  });

  const selectedFieldId = watch('fieldId');

  useEffect(() => {
    listFields()
      .then((res) => {
        setFields(res.fields || []);
        if (defaultFieldId) {
          const match = res.fields.find((f) => f.id === defaultFieldId);
          if (match) {
            setValue('fieldId', match.id);
            setValue('cropName', match.crop_name);
            setValue('location', match.location);
            setValue('soilType', match.soil_type || 'alluvial');
            setValue('irrigationMethod', match.irrigation_method || 'sprinkler');
          }
        } else if (res.fields.length > 0) {
          const first = res.fields[0];
          setValue('fieldId', first.id);
          setValue('cropName', first.crop_name);
          setValue('location', first.location);
          setValue('soilType', first.soil_type || 'alluvial');
          setValue('irrigationMethod', first.irrigation_method || 'sprinkler');
        }
      })
      .catch(() => {
        toast.error('Failed to load fields');
      })
      .finally(() => setIsLoadingFields(false));
  }, [defaultFieldId, setValue]);

  const handleFieldChange = (fId: string) => {
    setValue('fieldId', fId);
    const chosen = fields.find((f) => f.id === fId);
    if (chosen) {
      setValue('cropName', chosen.crop_name);
      setValue('location', chosen.location);
      if (chosen.soil_type) setValue('soilType', chosen.soil_type);
      if (chosen.irrigation_method) setValue('irrigationMethod', chosen.irrigation_method);
    }
  };

  const executeAnalysis = async (formData: NewScanFormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least 1 photo for visual diagnosis');
      setStep(2);
      return;
    }

    setIsAnalyzing(true);
    try {
      const form = new FormData();
      images.forEach((img) => {
        form.append('images', img.file);
      });
      form.append('payload', JSON.stringify(formData));

      const res = await createScan(form);
      toast.success('Visual pathology diagnosis complete!');
      navigate(`/scans/${res.scan.scan.id}`);
    } catch (err: any) {
      setIsAnalyzing(false);
      const msg = err.response?.data?.error?.message || 'Failed to complete visual scan diagnosis';
      toast.error(msg);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <ScanLoader3D />
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'Choose Field' },
    { num: 2, title: 'Upload Photos' },
    { num: 3, title: 'Field Advisory' },
    { num: 4, title: 'Review & Analyze' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="New Visual Crop Diagnosis"
        kicker="Pathology Inspection Wizard"
        description="Submit high-resolution canopy, leaf, or fruit photos for computer vision pathology detection, severity scoring, and sustainable treatment formulation."
      />

      {/* 4-Step Indicator */}
      <div className="flex items-center justify-between p-3 bg-cream-100 rounded-2xl border border-soil-600/15 overflow-x-auto gap-2">
        {stepsList.map((s, idx) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${
              step === s.num
                ? 'text-soil-950 font-bold'
                : step > s.num
                ? 'text-leaf-700 font-medium'
                : 'text-soil-400'
            }`}
            onClick={() => {
              if (s.num < step) setStep(s.num as any);
            }}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-serif ${
                step === s.num
                  ? 'bg-soil-950 text-cream-50'
                  : step > s.num
                  ? 'bg-leaf-700 text-cream-50'
                  : 'bg-cream-200 text-soil-600'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span className="text-xs whitespace-nowrap">{s.title}</span>
            {idx < stepsList.length - 1 && (
              <span className="text-soil-400 text-xs hidden sm:inline ml-2">›</span>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(executeAnalysis)} className="space-y-6">
        {/* Step 1: Select Field */}
        {step === 1 && (
          <div className="p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-soil-950">
                  Step 1: Select Field Parcel
                </h3>
                <p className="text-xs text-soil-600">
                  Associate this diagnostic inspection with an active field plot.
                </p>
              </div>
              <Link
                to="/fields"
                className="inline-flex items-center gap-1 text-xs text-leaf-700 hover:text-leaf-800 font-medium underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Plot</span>
              </Link>
            </div>

            {isLoadingFields ? (
              <div className="h-32 bg-cream-200 rounded-xl animate-pulse" />
            ) : fields.length === 0 ? (
              <div className="p-8 text-center bg-cream-50 rounded-xl border border-soil-600/10 space-y-3">
                <Layers className="w-6 h-6 text-soil-400 mx-auto" />
                <p className="text-xs text-soil-700 font-medium">
                  You haven’t registered any agricultural fields yet.
                </p>
                <Link
                  to="/fields"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-leaf-700 text-cream-50 text-xs rounded-xl font-semibold btn-press"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register a Field First</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleFieldChange(f.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedFieldId === f.id
                        ? 'bg-cream-50 border-leaf-700 ring-2 ring-leaf-700/40 shadow-xs'
                        : 'bg-cream-50 hover:bg-cream-200/50 border-soil-600/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-soil-900 text-sm">{f.name}</h4>
                      <input
                        type="radio"
                        name="fieldSelection"
                        checked={selectedFieldId === f.id}
                        onChange={() => handleFieldChange(f.id)}
                        className="text-leaf-700 focus:ring-leaf-600"
                      />
                    </div>
                    <p className="text-xs text-leaf-800 font-medium capitalize mt-1">
                      {f.crop_name} ({f.crop_category})
                    </p>
                    <p className="text-[11px] text-soil-500 mt-0.5">{f.location}</p>
                  </div>
                ))}
              </div>
            )}

            {errors.fieldId && (
              <p className="text-xs text-rust-600">{errors.fieldId.message}</p>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => {
                  if (!selectedFieldId) {
                    toast.error('Please choose a field');
                    return;
                  }
                  setStep(2);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold btn-press cursor-pointer"
              >
                <span>Continue to Upload Photos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload Images */}
        {step === 2 && (
          <div className="p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-5">
            <div>
              <h3 className="font-serif text-lg font-bold text-soil-950">
                Step 2: Upload Crop Photos (1–4 Images)
              </h3>
              <p className="text-xs text-soil-600">
                Capture leaves, stems, fruit, or affected canopy in natural daylight. Images are client-compressed and stripped of EXIF metadata.
              </p>
            </div>

            <ImageDropzone images={images} onChange={setImages} maxFiles={4} />

            <div className="flex items-center justify-between pt-4 border-t border-soil-600/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-50 hover:bg-cream-200 text-soil-800 text-xs font-medium border border-soil-600/15 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (images.length === 0) {
                    toast.error('Please upload at least 1 image before continuing');
                    return;
                  }
                  setStep(3);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold btn-press cursor-pointer"
              >
                <span>Continue to Advisory Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Advisory Form Context */}
        {step === 3 && (
          <div className="p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-5 text-xs">
            <div>
              <h3 className="font-serif text-lg font-bold text-soil-950">
                Step 3: Field Context & Symptoms
              </h3>
              <p className="text-soil-600">
                Grounded context helps Gemini accurately score look-alike pathologies and avoid contraindicated interventions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-soil-700 mb-1">Declared Crop</label>
                <input
                  type="text"
                  {...register('cropName')}
                  className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                />
                {errors.cropName && <p className="text-rust-600 mt-1">{errors.cropName.message}</p>}
              </div>

              <div>
                <label className="block font-medium text-soil-700 mb-1">Growth Stage</label>
                <select
                  {...register('growthStage')}
                  className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                >
                  <option value="germination">Germination</option>
                  <option value="seedling">Seedling</option>
                  <option value="vegetative">Vegetative Growth</option>
                  <option value="flowering">Flowering / Bloom</option>
                  <option value="fruiting">Fruiting / Grain Fill</option>
                  <option value="maturity">Maturity / Ripening</option>
                  <option value="post_harvest">Post-Harvest</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-soil-700 mb-1">Days Since Planting</label>
                <input
                  type="number"
                  {...register('daysSincePlanting')}
                  placeholder="e.g. 45"
                  className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-soil-700 mb-1">Location / State</label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                />
                {errors.location && <p className="text-rust-600 mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block font-medium text-soil-700 mb-1">Season</label>
                <select
                  {...register('season')}
                  className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                >
                  <option value="kharif">Kharif (Monsoon)</option>
                  <option value="rabi">Rabi (Winter)</option>
                  <option value="zaid">Zaid (Spring/Summer)</option>
                  <option value="perennial">Perennial</option>
                  <option value="unknown">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-soil-700 mb-1">Recent Weather Pattern</label>
                <select
                  {...register('recentWeather')}
                  className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
                >
                  <option value="normal">Normal / Seasonal</option>
                  <option value="dry">Dry / Drought</option>
                  <option value="humid">High Humidity / Fog</option>
                  <option value="rainy">Heavy Continuous Rain</option>
                  <option value="heatwave">Heatwave</option>
                  <option value="cold_spell">Cold Spell / Frost</option>
                  <option value="stormy">Stormy</option>
                </select>
              </div>
            </div>

            {/* Affected Area Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-soil-700">
                  Estimated Field Area Affected:
                </label>
                <span className="font-serif font-bold text-soil-900">
                  {watch('affectedAreaPercent') ?? 15}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                {...register('affectedAreaPercent')}
                className="w-full accent-leaf-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-soil-500">
                <span>0% (Isolated plant)</span>
                <span>50% (Half plot)</span>
                <span>100% (Field-wide)</span>
              </div>
            </div>

            {/* Symptom Notes */}
            <div>
              <label className="block font-medium text-soil-700 mb-1">
                Free-text Symptom Observations (under 1000 characters)
              </label>
              <textarea
                rows={3}
                {...register('symptomNotes')}
                placeholder="e.g. Yellowing on lower leaves with dark brown concentric rings; observed after heavy fog last Tuesday..."
                maxLength={1000}
                className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl p-3 text-soil-900 focus:outline-none"
              />
            </div>

            {/* Previous Treatments */}
            <div>
              <label className="block font-medium text-soil-700 mb-1">
                Previous Treatments Applied (under 500 characters)
              </label>
              <input
                type="text"
                {...register('previousTreatments')}
                placeholder="e.g. Neem oil spray 5 days ago, urea top-dress at 20 DAS"
                maxLength={500}
                className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-2 text-soil-900 focus:outline-none"
              />
            </div>

            {/* Preferences & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-soil-600/10">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="preferOrganic"
                  {...register('preferOrganic')}
                  className="w-4 h-4 text-leaf-700 rounded focus:ring-leaf-600"
                />
                <label htmlFor="preferOrganic" className="font-medium text-soil-800 cursor-pointer">
                  Prioritize Organic & Cultural Treatments First
                </label>
              </div>

              <div>
                <label className="block font-medium text-soil-700 mb-1">Output Advisory Language</label>
                <select
                  {...register('language')}
                  className="w-full bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3 py-1.5 text-soil-900 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-soil-600/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-50 hover:bg-cream-200 text-soil-800 text-xs font-medium border border-soil-600/15 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold btn-press cursor-pointer"
              >
                <span>Review & Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review and Submit */}
        {step === 4 && (
          <div className="p-6 rounded-2xl bg-cream-100 border border-soil-600/15 warm-shadow space-y-6 text-xs">
            <div>
              <h3 className="font-serif text-lg font-bold text-soil-950">
                Step 4: Review & Run Computer Vision Diagnosis
              </h3>
              <p className="text-soil-600">
                Confirm your parameters before triggering server-side Gemini visual inspection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-cream-50 border border-soil-600/10 space-y-2">
                <span className="font-serif font-bold text-soil-900 text-sm">
                  Field & Crop Summary
                </span>
                <p>
                  <strong>Plot ID: </strong>
                  {fields.find((f) => f.id === selectedFieldId)?.name || 'Custom plot'}
                </p>
                <p>
                  <strong>Crop: </strong>
                  {watch('cropName')} · Stage: {watch('growthStage')}
                </p>
                <p>
                  <strong>Location: </strong>
                  {watch('location')} · Season: {watch('season')}
                </p>
                <p>
                  <strong>Weather: </strong>
                  {watch('recentWeather')} · Area Affected: {watch('affectedAreaPercent')}%
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cream-50 border border-soil-600/10 space-y-2">
                <span className="font-serif font-bold text-soil-900 text-sm">
                  Attached Specimen Images ({images.length})
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pt-1">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img.previewUrl}
                      alt={`Upload preview ${i + 1}`}
                      className="w-14 h-14 object-cover rounded-lg border border-soil-600/20 shrink-0"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-soil-500 pt-1">
                  Organic First: {watch('preferOrganic') ? 'Yes' : 'No'} · Language: {watch('language')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-soil-600/10">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-50 hover:bg-cream-200 text-soil-800 text-xs font-medium border border-soil-600/15 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-sm font-semibold warm-shadow-md btn-press cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-wheat-300" />
                <span>Launch Computer Vision Diagnosis</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
