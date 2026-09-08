import React, { useState } from 'react';
import { ParsedDocument, GroundedFact } from '../types/fact';
import { FileText, Search, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface DocumentViewProps {
  documents: ParsedDocument[];
  facts: GroundedFact[];
  onInspectFact?: (fact: GroundedFact) => void;
}

export const DocumentView: React.FC<DocumentViewProps> = ({
  documents,
  facts
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id ?? '');
  const [activePage, setActivePage] = useState<number>(1);

  const doc = documents.find(d => d.id === selectedDocId) ?? documents[0];
  if (!doc) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
        No documents available in this workspace.
      </div>
    );
  }

  const docFacts = facts.filter(f => f.evidence.documentId === doc.id);
  const currentPageObj = doc.pages.find(p => p.pageNumber === activePage) ?? doc.pages[0];
  const pageFacts = docFacts.filter(f => f.evidence.pageNumber === activePage);

  // Function to highlight verbatim claims within page text
  const renderHighlightedPageText = (pageText: string) => {
    if (!pageText) return <div className="italic text-slate-400">No text content available on page {activePage}.</div>;

    const quotes = pageFacts
      .map(f => f.evidence.verbatimQuote)
      .filter(q => q && q.length > 5);

    if (quotes.length === 0) {
      return (
        <pre className="font-mono text-[13px] leading-relaxed text-slate-300 whitespace-pre-wrap break-words">
          {pageText}
        </pre>
      );
    }

    let parts: { text: string; isClaim: boolean; fact?: GroundedFact }[] = [{ text: pageText, isClaim: false }];

    pageFacts.forEach(fact => {
      const q = fact.evidence.verbatimQuote;
      if (!q || q.length < 5) return;

      const nextParts: typeof parts = [];
      parts.forEach(part => {
        if (part.isClaim) {
          nextParts.push(part);
          return;
        }
        const idx = part.text.toLowerCase().indexOf(q.toLowerCase());
        if (idx !== -1) {
          const before = part.text.substring(0, idx);
          const match  = part.text.substring(idx, idx + q.length);
          const after  = part.text.substring(idx + q.length);
          if (before) nextParts.push({ text: before, isClaim: false });
          nextParts.push({ text: match, isClaim: true, fact });
          if (after) nextParts.push({ text: after, isClaim: false });
        } else {
          nextParts.push(part);
        }
      });
      parts = nextParts;
    });

    return (
      <div className="font-mono text-[13px] leading-relaxed text-slate-300 whitespace-pre-wrap break-words">
        {parts.map((p, i) =>
          p.isClaim ? (
            <mark
              key={i}
              className="bg-emerald-950 text-emerald-300 border-b-2 border-emerald-400 px-1 py-0.5 rounded font-semibold cursor-pointer hover:bg-emerald-900 transition"
              title={`Fact: ${p.fact?.attribute} = ${p.fact?.value} (${p.fact?.extractionStage})`}
            >
              {p.text}
            </mark>
          ) : (
            <span key={i}>{p.text}</span>
          )
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
            PDF
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-slate-100 flex items-center gap-2">
              {doc.name}
            </h2>
            <p className="text-[12px] text-slate-400">
              {doc.pageCount} pages · {docFacts.length} extracted & verified claims · Grounded PDF Inspector
            </p>
          </div>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              setActivePage(1);
            }}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[13px] font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            {documents.map(d => (
              <option key={d.id} value={d.id}>
                📄 {d.name} ({d.extractedFacts.length} claims)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main View: Document Reader + Claims Margin Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Page Text Inspector */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-col min-h-[600px]">
          {/* Page Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <button
                disabled={activePage <= 1}
                onClick={() => setActivePage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[13px] font-bold font-mono text-slate-300">
                Page {activePage} of {doc.pageCount}
              </span>
              <button
                disabled={activePage >= doc.pageCount}
                onClick={() => setActivePage(p => Math.min(doc.pageCount, p + 1))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="text-[12px] font-semibold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
              {pageFacts.length} Claim{pageFacts.length !== 1 ? 's' : ''} Grounded on Page {activePage}
            </span>
          </div>

          {/* Document Content View */}
          <div className="p-6 flex-1 overflow-y-auto max-h-[650px] bg-slate-950">
            {currentPageObj ? (
              renderHighlightedPageText(currentPageObj.text)
            ) : (
              <div className="text-slate-400 italic">Page text not loaded.</div>
            )}
          </div>
        </div>

        {/* Right Col: Extracted Claims Margin */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4 max-h-[700px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-[14px] font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Grounded Claims on Page {activePage}
            </h3>
            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {pageFacts.length} Total
            </span>
          </div>

          {pageFacts.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-[13px] leading-relaxed">
              No claims were extracted from page {activePage}. Switch pages using the toolbar above to view grounded claims across this PDF.
            </div>
          ) : (
            <div className="space-y-3">
              {pageFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/40 transition shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                      {fact.attribute}
                    </span>
                    <span className="font-mono text-slate-400">
                      {fact.extractionStage || 'stage_a_structural'}
                    </span>
                  </div>

                  <div className="text-[14px] font-mono font-bold text-slate-100">
                    Raw: {fact.value}
                  </div>

                  {typeof fact.normalizedValue === 'number' && (
                    <div className="text-[11px] font-mono text-emerald-400 bg-slate-900 p-1.5 rounded border border-slate-800">
                      Norm: {fact.normalizedValue.toLocaleString()} {fact.unit || ''}
                    </div>
                  )}

                  {/* Byte-for-Byte Monospace Verbatim Quote */}
                  <div className="text-[11px] font-mono text-slate-300 italic bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                    "{fact.evidence.verbatimQuote}"
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      {(fact.evidence.confidenceScore * 100).toFixed(0)}% Conf.
                    </span>
                    <span className="font-mono">Page {fact.evidence.pageNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
