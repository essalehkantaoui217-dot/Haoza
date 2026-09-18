import React, { useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SampleProductPhoto } from '../types';
import { SAMPLE_PRODUCT_PHOTOS } from '../data/samplePhotos';

interface SamplePickerProps {
  selectedSampleId: string | null;
  onSelectSample: (sample: SampleProductPhoto) => void;
  onUploadImage: (file: File) => void;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({
  selectedSampleId,
  onSelectSample,
  onUploadImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="sample-picker-strip" className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-neutral-500" />
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Choose or Upload Product Photo
          </h3>
        </div>
        <span className="text-[11px] text-neutral-400">
          Click a sample or drop your photo
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Custom Upload Tile */}
        <div
          id="btn-upload-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="h-28 rounded-xl border-2 border-dashed border-neutral-300 hover:border-indigo-500 bg-neutral-50 hover:bg-indigo-50/40 flex flex-col items-center justify-center cursor-pointer transition-all p-2 text-center group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 group-hover:border-indigo-300 flex items-center justify-center text-neutral-600 group-hover:text-indigo-600 mb-1.5 shadow-2xs transition-colors">
            <Upload className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-neutral-800 leading-tight">Upload Photo</p>
          <p className="text-[10px] text-neutral-400 leading-tight mt-0.5">PNG, JPG, WebP</p>
        </div>

        {/* Curated Sample Products */}
        {SAMPLE_PRODUCT_PHOTOS.map((sample) => {
          const isSelected = selectedSampleId === sample.id;
          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`group relative h-28 rounded-xl overflow-hidden border text-left transition-all flex flex-col justify-end p-2.5 ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-300 hover:shadow-2xs'
              }`}
            >
              {/* Background Product Image */}
              <img
                src={sample.url}
                alt={sample.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Tag & Title */}
              <div className="relative z-10">
                <span className="text-[9px] font-medium text-indigo-300 tracking-wide block uppercase truncate">
                  {sample.category}
                </span>
                <p className="text-[11px] font-semibold text-white leading-tight truncate drop-shadow-xs">
                  {sample.name}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center z-10">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
