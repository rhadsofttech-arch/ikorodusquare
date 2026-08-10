import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Star,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { uploadProductImageToSupabase } from '../lib/supabaseDb';

interface ProductImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  vendorId: string;
  maxImages?: number;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images,
  onChange,
  vendorId,
  maxImages = 8,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileValidationAndUpload = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    if (images.length + fileArray.length > maxImages) {
      setErrorMessage(`You can upload a maximum of ${maxImages} images per product.`);
      return;
    }

    // Validate all files first
    for (const file of fileArray) {
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        setErrorMessage(`Invalid file format "${file.name}". Please select JPG, JPEG, PNG, or WEBP images.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`File "${file.name}" exceeds the 10MB limit. Please choose smaller images.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: fileArray.length });

    const newUploadedUrls: string[] = [];
    let uploadFailures = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress({ current: i + 1, total: fileArray.length });

      const { url, error } = await uploadProductImageToSupabase(file, vendorId);

      if (url) {
        newUploadedUrls.push(url);
      } else {
        uploadFailures++;
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    setUploadProgress(null);

    if (newUploadedUrls.length > 0) {
      onChange([...images, ...newUploadedUrls]);
    }

    if (uploadFailures > 0) {
      if (newUploadedUrls.length === 0) {
        setErrorMessage('Failed to upload images to storage. Please check your network and try again.');
      } else {
        setErrorMessage(`Uploaded ${newUploadedUrls.length} image(s), but ${uploadFailures} image(s) failed.`);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileValidationAndUpload(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileValidationAndUpload(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetMainCover = (indexToMakeMain: number) => {
    if (indexToMakeMain === 0) return;
    const item = images[indexToMakeMain];
    const remaining = images.filter((_, idx) => idx !== indexToMakeMain);
    onChange([item, ...remaining]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800">
            Product Photos <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-slate-500">
            Upload up to {maxImages} high-quality product images. The first image will be the primary cover photo on product cards.
          </p>
        </div>
        <span className="text-xs font-bold font-mono px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
          {images.length} / {maxImages}
        </span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-600 bg-emerald-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/80 hover:bg-emerald-50/30'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-3 py-2">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-800">
                Uploading to Supabase Storage...
              </p>
              {uploadProgress && (
                <p className="text-[11px] font-mono text-emerald-800 mt-1">
                  Processing file {uploadProgress.current} of {uploadProgress.total}
                </p>
              )}
            </div>
            <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{
                  width: uploadProgress
                    ? `${(uploadProgress.current / uploadProgress.total) * 100}%`
                    : '10%',
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drag & drop product photos
              </p>
              <p className="text-[11px] text-slate-500">
                Supports JPG, JPEG, PNG, WEBP (Max 10MB per image)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Image Gallery & Display Order
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={`${imgUrl}-${idx}`}
                className={`relative group rounded-2xl overflow-hidden border bg-white shadow-xs transition-all ${
                  idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-200'
                }`}
              >
                <div className="h-28 w-full bg-slate-100 relative overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`Product preview ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Primary Cover Badge */}
                  {idx === 0 ? (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950 font-extrabold text-[10px] shadow flex items-center gap-1">
                      <Star className="w-3 h-3 fill-emerald-950 text-emerald-950" /> Cover Photo
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetMainCover(idx);
                      }}
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-emerald-800 text-white font-bold text-[10px] backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Set as primary cover photo"
                    >
                      Make Cover
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow transition-all hover:scale-110"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Photo #{idx + 1}</span>
                  {idx === 0 ? (
                    <span className="text-amber-700 font-bold">Main Image</span>
                  ) : (
                    <span className="text-slate-400">Gallery</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
