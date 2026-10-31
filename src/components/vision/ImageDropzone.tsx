import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, X, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export interface UploadedCropImage {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  width?: number;
  height?: number;
}

interface ImageDropzoneProps {
  images: UploadedCropImage[];
  onChange: (images: UploadedCropImage[]) => void;
  maxFiles?: number;
}

// Client-side lightweight image optimizer before upload
async function compressImageClient(file: File): Promise<UploadedCropImage> {
  const previewUrl = URL.createObjectURL(file);

  return new Promise((resolve) => {
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const maxDim = 1600;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
              });
              resolve({
                file: compressedFile,
                previewUrl: URL.createObjectURL(compressedFile),
                originalSize: file.size,
                compressedSize: compressedFile.size,
                width,
                height,
              });
            } else {
              resolve({
                file,
                previewUrl,
                originalSize: file.size,
                compressedSize: file.size,
                width,
                height,
              });
            }
          },
          'image/webp',
          0.85
        );
      } else {
        resolve({
          file,
          previewUrl,
          originalSize: file.size,
          compressedSize: file.size,
          width,
          height,
        });
      }
    };
    img.onerror = () => {
      resolve({
        file,
        previewUrl,
        originalSize: file.size,
        compressedSize: file.size,
      });
    };
  });
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  images,
  onChange,
  maxFiles = 4,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxFiles} images reached`);
      return;
    }

    const filesToProcess = Array.from(fileList).slice(0, remainingSlots);
    setIsProcessing(true);

    try {
      const processed: UploadedCropImage[] = [];
      for (const f of filesToProcess) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type.toLowerCase())) {
          toast.error(`${f.name} is not a supported format (JPEG, PNG, WebP)`);
          continue;
        }
        if (f.size > 8 * 1024 * 1024) {
          toast.error(`${f.name} exceeds 8MB limit`);
          continue;
        }
        const item = await compressImageClient(f);
        processed.push(item);
      }
      onChange([...images, ...processed]);
    } catch {
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const formatKB = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

  return (
    <div className="space-y-4">
      {/* Drop Target Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-leaf-600 bg-leaf-100/50 scale-[1.01]'
            : 'border-soil-600/30 bg-cream-100 hover:border-leaf-600/60 hover:bg-cream-200/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {/* Mobile Camera Input with capture="environment" */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-cream-50 flex items-center justify-center text-leaf-700 warm-shadow-sm border border-soil-600/10">
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-leaf-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <p className="font-serif text-base font-semibold text-soil-800">
              Drag & drop crop photos here, or click to browse
            </p>
            <p className="text-xs text-soil-600">
              1–4 clear photos of leaves, stems, fruit, or canopy · JPEG, PNG, WebP · Max 8MB
            </p>
          </div>

          {/* Mobile Camera Capture Button */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-cream-200 text-soil-800 text-xs font-medium rounded-lg border border-soil-600/20 btn-press warm-shadow-sm"
            >
              <Camera className="w-3.5 h-3.5 text-leaf-700" />
              Capture with Camera
            </button>
            <span className="text-[11px] text-soil-500">
              {images.length}/{maxFiles} selected
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnails List */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden border border-soil-600/20 bg-cream-100 warm-shadow-sm aspect-4/3 flex flex-col justify-end"
            >
              <img
                src={img.previewUrl}
                alt={`Crop photo upload ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Position indicator */}
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-soil-950/75 text-wheat-300 backdrop-blur-xs">
                #{idx + 1} {idx === 0 ? '(Primary)' : ''}
              </span>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-soil-950/80 hover:bg-rust-500 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* File details bar */}
              <div className="relative z-10 bg-soil-950/80 backdrop-blur-xs px-2 py-1 text-[10px] text-cream-100 flex items-center justify-between">
                <span>{formatKB(img.compressedSize)}</span>
                {img.width && img.height && (
                  <span>
                    {img.width}×{img.height}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
