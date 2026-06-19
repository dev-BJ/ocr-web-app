'use client';

import { useState } from 'react';
import { Copy, Download, X, ChevronDown, ChevronUp } from 'lucide-react';

interface PageResult {
  page: number;
  text: string;
  confidence: number;
}

interface ResultsViewerProps {
  fileName: string;
  fileType: string;
  pages: PageResult[];
  extractedText: string;
  onReset: () => void;
}

export function ResultsViewer({
  fileName,
  fileType,
  pages,
  extractedText,
  onReset,
}: ResultsViewerProps) {
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set([1]));
  const [copied, setCopied] = useState(false);

  const togglePage = (pageNum: number) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageNum)) {
      newExpanded.delete(pageNum);
    } else {
      newExpanded.add(pageNum);
    }
    setExpandedPages(newExpanded);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsText = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(extractedText));
    element.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, '')}_extracted.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAsJson = () => {
    const jsonData = {
      fileName,
      fileType,
      extractedAt: new Date().toISOString(),
      pages: pages.map((p) => ({
        page: p.page,
        text: p.text,
        confidence: p.confidence,
      })),
    };
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonData, null, 2)));
    element.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, '')}_extracted.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary-foreground">{fileName}</h2>
          <p className="text-sm text-muted-foreground">{pages.length} page(s) processed</p>
        </div>
        <button
          onClick={onReset}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          title="Start over"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
        <button
          onClick={downloadAsText}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="h-4 w-4" />
          Download TXT
        </button>
        <button
          onClick={downloadAsJson}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="h-4 w-4" />
          Download JSON
        </button>
      </div>

      {/* Pages */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {pages.map((pageData) => (
          <div
            key={pageData.page}
            className="rounded-lg border border-gray-200 overflow-hidden bg-white"
          >
            <button
              onClick={() => togglePage(pageData.page)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div>
                <p className="font-medium text-slate-950">Page {pageData.page}</p>
                <p className="text-xs text-muted-foreground">
                  {pageData.text.length} characters • Confidence: {Math.round(pageData.confidence)}%
                </p>
              </div>
              {expandedPages.has(pageData.page) ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedPages.has(pageData.page) && (
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                <p className="text-sm text-teal-950 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                  {pageData.text || '(No text detected)'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
