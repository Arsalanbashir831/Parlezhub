'use client';

import { useCallback, useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  className,
  accept = 'image/*',
  maxSize = 5, // 5MB default
  placeholder = 'Upload thumbnail image',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Create preview URL when file changes
  const updatePreview = useCallback(
    (file: File | null) => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      if (file) {
        const newPreview = URL.createObjectURL(file);
        setPreview(newPreview);
      } else {
        setPreview(null);
      }
    },
    [preview]
  );

  // Handle file selection
  const handleFile = useCallback(
    (file: File) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File size must be less than ${maxSize}MB`);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      onChange(file);
      updatePreview(file);
      toast.success('Image uploaded successfully');
    },
    [maxSize, onChange, updatePreview]
  );

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  // Remove file
  const removeFile = useCallback(() => {
    onChange(null);
    updatePreview(null);
  }, [onChange, updatePreview]);

  // Initialize preview for existing value
  useState(() => {
    if (value) {
      updatePreview(value);
    }
  });

  return (
    <div className={cn('w-full', className)}>
      {value && preview ? (
        // Preview mode
        <div className="relative">
          <div className="relative aspect-video max-h-[300px] w-full overflow-hidden rounded-lg border bg-gray-50">
            <img
              src={preview}
              alt="Thumbnail preview"
              className="h-full w-full object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute right-2 top-2"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      ) : (
        // Upload mode
        <div
          className={cn(
            'relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors',
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <input
            id="image-upload"
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              {dragActive ? (
                <Upload className="h-6 w-6 text-blue-500" />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>

            <p className="mb-1 text-sm font-medium text-gray-900">
              {dragActive ? 'Drop image here' : placeholder}
            </p>

            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxSize}MB
            </p>

            <Button type="button" variant="outline" size="sm" className="mt-4">
              Choose File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
