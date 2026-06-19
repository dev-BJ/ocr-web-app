'use client';

import { useState } from 'react';
import { FileUploadZone } from '@/components/file-upload-zone';
import { ProgressDisplay } from '@/components/progress-display';
import { ResultsViewer } from '@/components/results-viewer';
import Tesseract from 'tesseract.js';

interface PageResult {
  page: number;
  text: string;
  confidence: number;
}

interface OCRResult {
  success: boolean;
  fileName: string;
  fileType: string;
  pages: PageResult[];
  totalPages: number;
  extractedText: string;
  error?: string;
}

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // const handleFileSelect = async (file: File, fileType: 'image' | 'pdf') => {
  //   setError(null);
  //   setIsUploading(true);
  //   setUploadProgress(0);

  //   try {
  //     // Simulate upload progress
  //     const uploadInterval = setInterval(() => {
  //       setUploadProgress((prev) => {
  //         const next = Math.min(Number(prev) + Math.random() * 30, 90);
  //         return Number(next.toFixed(2));
  //       });
  //     }, 50);

  //     // Read file as base64
  //     const fileBuffer = await new Promise<string>((resolve) => {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         const result = reader.result as string;
  //         resolve(result.split(',')[1] || '');
  //       };
  //       reader.readAsDataURL(file);
  //     });

  //     clearInterval(uploadInterval);
  //     setUploadProgress(100);

  //     // Validate file with backend
  //     const formData = new FormData();
  //     formData.append('file', file);

  //     const uploadRes = await fetch('/api/upload', {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (!uploadRes.ok) {
  //       const uploadData = await uploadRes.json();
  //       throw new Error(uploadData.error || 'File validation failed');
  //     }

  //     setIsUploading(false);
  //     setIsProcessing(true);
  //     setOcrProgress(0);
  //     setCurrentPage(0);

  //     // Determine pages to process
  //     let pagesToProcess = undefined;
  //     if (fileType === 'pdf') {
  //       // For PDFs, we'll process all pages but Tesseract will handle them
  //       // The backend will determine total pages
  //     }

  //     // Process with OCR
  //     const ocrInterval = setInterval(() => {
  //       setOcrProgress((prev) => {
  //         const next = Math.min(Number(prev) + Math.random() * 15, 95);
  //         return Number(next.toFixed(2));
  //       });
  //     }, 50);

  //     const ocrRes = await fetch('/api/process-ocr', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         fileType,
  //         fileName: file.name,
  //         fileBuffer,
  //         pageNumbers: pagesToProcess,
  //       }),
  //     });

  //     clearInterval(ocrInterval);
  //     setOcrProgress(100);

  //     if (!ocrRes.ok) {
  //       const ocrData = await ocrRes.json();
  //       throw new Error(ocrData.error || 'OCR processing failed');
  //     }

  //     const ocrData: OCRResult = await ocrRes.json();

  //     if (!ocrData.success) {
  //       throw new Error(ocrData.error || 'OCR processing failed');
  //     }

  //     setTotalPages(ocrData.totalPages);
  //     setResult(ocrData);
  //   } catch (err) {
  //     console.error('[Error]', err);
  //     setError(err instanceof Error ? err.message : 'An error occurred');
  //   } finally {
  //     setIsUploading(false);
  //     setIsProcessing(false);
  //     setUploadProgress(0);
  //     setOcrProgress(0);
  //   }
  // };

  const handleFileSelect = async (file: File, fileType: "image" | "pdf") => {
    try {
      setError(null);

      setIsProcessing(true);
      setOcrProgress(0);
      setCurrentPage(0);

      // Determine pages to process
      let pagesToProcess = undefined;
      if (fileType === "pdf") {
        // For PDFs, we'll process all pages but Tesseract will handle them
        // The backend will determine total pages
      }

      const result = await Tesseract.recognize(
        URL.createObjectURL(file),
        "eng",
        {
          logger: (log) => {
            setOcrProgress(25);
            // console.log(`[Tesseract] ${log.status} (${Math.round(log.progress * 100)}%)`);
            if (log.status === "recognizing text") {
              const percent = Number((log.progress * 100).toFixed(2));
              setOcrProgress(percent);
            }
          },
        },
      );

      if (!result.data.text) {
        throw new Error("OCR processing failed");
      }

      setTotalPages(result.data.blocks?.length || 1);
      const results = [];
      results.push({
        page: 1,
        text: result.data.text,
        confidence: result.data.confidence,
      });
      setResult({
        success: true,
        fileName: file.name,
        fileType,
        pages: results,
        totalPages: 1,
        extractedText: result.data.text,
      });
    } catch (err) {
      console.error("[Error]", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
      setOcrProgress(0);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setUploadProgress(0);
    setOcrProgress(0);
    setCurrentPage(0);
    setTotalPages(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Document OCR</h1>
          <p className="text-gray-600">Extract text from images and PDFs instantly</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!result ? (
            <div className="space-y-6">
              {/* File Upload Zone */}
              <FileUploadZone
                onFileSelect={handleFileSelect}
                isProcessing={isUploading || isProcessing}
              />

              {/* Progress Display */}
              {(isUploading || isProcessing) && (
                <ProgressDisplay
                  uploadProgress={uploadProgress}
                  ocrProgress={ocrProgress}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  isUploading={isUploading}
                  isProcessing={isProcessing}
                />
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <ResultsViewer
              fileName={result.fileName}
              fileType={result.fileType}
              pages={result.pages}
              extractedText={result.extractedText}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Supported formats: JPEG, PNG, WebP, TIFF, PDF</p>
          <p>Maximum file size: 50MB</p>
        </div>
      </div>
    </div>
  );
}
