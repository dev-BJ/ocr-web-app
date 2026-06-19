'use client';

interface ProgressDisplayProps {
  uploadProgress: number;
  ocrProgress: number;
  currentPage?: number;
  totalPages?: number;
  isUploading: boolean;
  isProcessing: boolean;
}

export function ProgressDisplay({
  uploadProgress,
  ocrProgress,
  currentPage,
  totalPages,
  isUploading,
  isProcessing,
}: ProgressDisplayProps) {
  if (!isUploading && !isProcessing) return null;

  return (
    <div className="space-y-6">
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Uploading file</p>
            <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-amber-900 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {currentPage && totalPages ? `Processing page ${currentPage} of ${totalPages}` : 'Processing with OCR'}
            </p>
            <span className="text-xs text-muted-foreground">{ocrProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-amber-900 transition-all duration-300"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
