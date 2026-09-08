import React from 'react';
import { FactRelationship } from '../types/fact';
import { X, FileText, Quote, Layers } from 'lucide-react';

interface EvidenceSpotlightModalProps {
  relationship: FactRelationship | null;
  onClose: () => void;
}

export const EvidenceSpotlightModal: React.FC<EvidenceSpotlightModalProps> = ({
  relationship,
  onClose
}) => {
  if (!relationship) return null;

  const { factA, factB, reasoning, title } = relationship;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Grounded Evidence Inspector</h3>
              <p className="text-xs text-slate-500">Verbatim quotes & source page verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-1">{title}</h4>
            <p className="text-xs text-slate-600">{reasoning}</p>
          </div>

          {/* Side-by-Side Source Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Source A */}
            <div className="flex flex-col p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  {factA.evidence.documentName}
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Page {factA.evidence.pageNumber}
                </span>
              </div>

              <div className="mb-2.5">
                <span className="text-[11px] text-slate-500 font-medium">Extracted Fact:</span>
                <div className="text-sm font-bold text-slate-900">{factA.attribute}: {factA.value}</div>
              </div>

              <div className="flex-1 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 font-mono text-xs text-slate-800 relative">
                <Quote className="w-4 h-4 text-indigo-400 mb-1" />
                <span className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-950 font-semibold">
                  "{factA.evidence.verbatimQuote}"
                </span>
              </div>
            </div>

            {/* Source B */}
            {factB ? (
              <div className="flex flex-col p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    {factB.evidence.documentName}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Page {factB.evidence.pageNumber}
                  </span>
                </div>

                <div className="mb-2.5">
                  <span className="text-[11px] text-slate-500 font-medium">Extracted Fact:</span>
                  <div className="text-sm font-bold text-slate-900">{factB.attribute}: {factB.value}</div>
                </div>

                <div className="flex-1 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 font-mono text-xs text-slate-800 relative">
                  <Quote className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-950 font-semibold">
                    "{factB.evidence.verbatimQuote}"
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-center">
                <p className="text-xs text-slate-500">
                  Single document extraction failure. Flagged for review without second document link.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
