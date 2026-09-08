import React, { useRef } from 'react';
import { Layers, Key, Download, RefreshCw, FileCheck, Upload, Sparkles } from 'lucide-react';
import { parsePdfFile } from '../lib/pdfParser';
import { ParsedDocument } from '../types/fact';

interface HeaderProps {
  documentCount: number;
  factCount: number;
  relationshipCount: number;
  onOpenSettings: () => void;
  onExportJson: () => void;
  onResetStarterData: () => void;
  onDocumentUploaded: (doc: ParsedDocument) => void;
  isCustomKeyActive: boolean;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  documentCount,
  factCount,
  relationshipCount,
  onOpenSettings,
  onExportJson,
  onResetStarterData,
  onDocumentUploaded,
  isCustomKeyActive,
  isProcessing
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const parsedDoc = await parsePdfFile(file);
        onDocumentUploaded(parsedDoc);
      } catch (err) {
        console.error('Error parsing PDF:', err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="bg-white border-b-[1.6px] border-[#E5E5E9] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#2B2B2B] tracking-tight">Fact Knowledge Layer</h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Superjoin Internship
              </span>
            </div>
            <p className="text-xs text-[#838385]">
              Cross-Document Grounding & Fact Reconciliation Engine
            </p>
          </div>
        </div>

        {/* Minimal Clean Stats Pills */}
        <div className="flex items-center gap-6 px-5 py-2 rounded-full bg-[#F4F4FB] border border-[#E5E5E9]">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#838385]">PDFs</div>
            <div className="text-sm font-bold text-[#2B2B2B]">{documentCount}</div>
          </div>
          <div className="h-5 w-[1.6px] bg-[#E5E5E9]" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#838385]">Facts</div>
            <div className="text-sm font-bold text-emerald-600">{factCount}</div>
          </div>
          <div className="h-5 w-[1.6px] bg-[#E5E5E9]" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#838385]">Matches</div>
            <div className="text-sm font-bold text-emerald-700">{relationshipCount}</div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2.5">
          {/* Prominent Emerald Upload PDF Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all border border-emerald-500"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>

          <button
            onClick={onResetStarterData}
            title="Reset Starter Examples"
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-full text-[#717077] bg-[#F4F4FB] hover:bg-[#E5E5E9] transition border border-[#E5E5E9]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={onExportJson}
            title="Export Facts JSON"
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-full text-[#717077] bg-[#F4F4FB] hover:bg-[#E5E5E9] transition border border-[#E5E5E9]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-full transition border ${
              isCustomKeyActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-[#F4F4FB] text-[#717077] border-[#E5E5E9] hover:bg-[#E5E5E9]'
            }`}
          >
            {isCustomKeyActive ? <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Key className="w-3.5 h-3.5" />}
            <span>{isCustomKeyActive ? 'API Key Active' : 'API Key'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
