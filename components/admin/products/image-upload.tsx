'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadProductImage, deleteProductImage } from '@/app/(dashboard)/admin/products/actions';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProductImage(formData);

      if (result.success && result.data?.url) {
        onChange(result.data.url);
      } else {
        setError(result.error || 'Error al subir la imagen');
      }
    } catch (err) {
      setError('Error inesperado al subir');
    } finally {
      setIsUploading(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (value) {
      // Optionally delete from storage
      await deleteProductImage(value);
    }
    onChange('');
  };

  return (
    <div className="space-y-3">
      {/* Preview or Upload Area */}
      {value ? (
        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 group">
          <img
            src={value}
            alt="Producto"
            className="w-full h-full object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <label className="block aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-violet-500/50 bg-slate-800/30 cursor-pointer transition-colors">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-3" />
                <p className="text-sm text-slate-400">Subiendo...</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  Arrastra o haz clic
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG hasta 5MB
                </p>
              </>
            )}
          </div>
        </label>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* URL Input as fallback */}
      <div className="relative">
        <input
          type="url"
          placeholder="O pega una URL de imagen..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
      </div>
    </div>
  );
}

