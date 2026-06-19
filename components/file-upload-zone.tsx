'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File, fileType: 'image' | 'pdf') => void;
  isProcessing: boolean;
}

export function FileUploadZone({ onFileSelect, isProcessing }: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image (JPEG, PNG, WebP, TIFF) or PDF file');
      return;
    }

    const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
    onFileSelect(file, fileType);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative w-full rounded-xl border-2 border-dashed transition-colors cursor-pointer p-8 ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : isProcessing
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleChange}
        accept="image/jpeg,image/png,image/webp,image/tiff,.pdf"
        className="hidden"
        disabled={isProcessing}
      />

      <div className="flex flex-col items-center justify-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isProcessing ? 'Processing...' : 'Drag and drop your file here'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isProcessing
              ? 'Do not close this page'
              : 'or click to browse (JPEG, PNG, WebP, TIFF, or PDF)'}
          </p>
        </div>
      </div>
    </div>
  );
}
