import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { parsePdfFile } from '../lib/pdfParser';
import { ParsedDocument } from '../types/fact';

interface PdfUploadZoneProps {
  onDocumentUploaded: (doc: ParsedDocument) => void;
  isProcessing: boolean;
}

export const PdfUploadZone: React.FC<PdfUploadZoneProps> = ({
  onDocumentUploaded,
  isProcessing
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
        alert(`File "${file.name}" is not a valid PDF document.`);
        continue;
      }

      setUploadStatus(`Parsing ${file.name}...`);
      try {
        const parsedDoc = await parsePdfFile(file);
        onDocumentUploaded(parsedDoc);
        setUploadStatus(`Extracted facts from ${file.name}!`);
        setTimeout(() => setUploadStatus(null), 4000);
      } catch (err) {
        console.error('PDF Processing Error:', err);
        setUploadStatus('Extraction failed. Please try another PDF.');
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto rounded-[2rem] border-[1.6px] border-[#E5E5E9] bg-white p-6 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold text-[#2B2B2B] flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600" />
            Upload Custom PDF Documents
          </h2>
          <p className="text-xs text-[#838385] mt-0.5">
            Select or drag & drop PDFs to dynamically extract grounded facts and page quotes
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition border border-emerald-500"
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF Document</span>
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-[1.5rem] p-8 text-center transition flex flex-col items-center justify-center cursor-pointer ${
          dragActive
            ? 'border-emerald-600 bg-emerald-50/50'
            : 'border-[#D4D3DE] hover:border-emerald-600 bg-[#F4F4FB] hover:bg-white'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-xs font-bold text-[#2B2B2B]">
              {uploadStatus || 'Parsing PDF pages and extracting facts...'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="p-3.5 rounded-full bg-white text-emerald-600 border border-[#E5E5E9] shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#2B2B2B]">
              Click to select PDF or drag & drop file here
            </div>
            <span className="text-[11px] text-[#717077]">
              Extracts text, preserves page numbers, attaches verbatim quotes automatically
            </span>
          </div>
        )}
      </div>

      {uploadStatus && !isProcessing && (
        <div className="mt-4 text-xs text-emerald-800 flex items-center gap-2 font-bold bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {uploadStatus}
        </div>
      )}
    </div>
  );
};
