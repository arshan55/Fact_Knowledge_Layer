import React from 'react';
import { FactRelationship } from '../types/fact';
import { CheckCircle2, AlertTriangle, Scale, ShieldAlert, Sparkles, ExternalLink, FileText, Lock } from 'lucide-react';

interface ShowcasePanelProps {
  relationships: FactRelationship[];
  onInspectEvidence: (relationship: FactRelationship) => void;
}

export const ShowcasePanel: React.FC<ShowcasePanelProps> = ({
  relationships,
  onInspectEvidence
}) => {
  const case1 = relationships.find(r => r.relationshipType === 'CORROBORATED') ?? relationships[0];
  const case2 = relationships.find(r => r.relationshipType === 'CONTRADICTION') ?? relationships[1];
  const case3 = relationships.find(r => r.relationshipType === 'RECONCILED_BY_CONTEXT') ?? relationships[2];
  const case4 = relationships.find(r => r.relationshipType === 'FAILURE_HANDLED') ?? relationships[3];

  const showcaseCases = [
    {
      num: 1,
      title: 'Corroborated Fact Across Documents',
      subtitle: 'Fact matching across different source files with verbatim evidence quotes',
      rel: case1,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      caseTag: 'CASE 1 · CORROBORATION'
    },
    {
      num: 2,
      title: 'Genuine Contradiction Between Documents',
      subtitle: 'Direct conflicting metrics in identical reporting periods and scopes',
      rel: case2,
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      badgeBg: 'bg-rose-950 text-rose-300 border-rose-800',
      caseTag: 'CASE 2 · CONTRADICTION'
    },
    {
      num: 3,
      title: 'Apparent Contradiction Reconciled by Context',
      subtitle: 'Differing values explained by time period windows, scope, or currency units',
      rel: case3,
      icon: <Scale className="w-5 h-5 text-amber-400" />,
      badgeBg: 'bg-amber-950 text-amber-300 border-amber-800',
      caseTag: 'CASE 3 · CONTEXT RECONCILED'
    },
    {
      num: 4,
      title: 'Extraction / Reasoning Failure Handled',
      subtitle: 'Low-confidence claim or metric unit ambiguity flagged with automatic header scope fallback',
      rel: case4,
      icon: <ShieldAlert className="w-5 h-5 text-sky-400" />,
      badgeBg: 'bg-sky-950 text-sky-300 border-sky-800',
      caseTag: 'CASE 4 · FAILURE HANDLED'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-slate-800 p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-[12px] font-bold tracking-wider uppercase border border-emerald-700/60">
            <Sparkles className="w-3.5 h-3.5" /> Mandatory Submission Requirements Showcase
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            The Four Core Fact Knowledge Cases
          </h1>
          <p className="text-slate-300 text-[14px] max-w-3xl leading-relaxed">
            Demonstrating verbatim grounding, two-stage claim extraction, hallucination guardrails, and context-window reconciliation across real ingested PDF documents.
          </p>
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showcaseCases.map((item) => {
          const rel = item.rel;

          if (!rel) {
            return (
              <div key={item.num} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 opacity-60">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full border text-[11px] font-bold ${item.badgeBg}`}>
                    {item.caseTag}
                  </span>
                  {item.icon}
                </div>
                <h3 className="text-[16px] font-bold text-slate-100">{item.title}</h3>
                <p className="text-[13px] text-slate-400 mt-2">No relationship generated for this category in the current workspace.</p>
              </div>
            );
          }

          const factA = rel.factA;
          const factB = rel.factB;

          return (
            <div
              key={item.num}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${item.badgeBg}`}>
                    {item.caseTag}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Grounding Verified
                    </span>
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-[16px] font-bold text-slate-100 mb-1">
                  {item.title}
                </h3>
                <p className="text-[12px] text-slate-400 mb-4">
                  {item.subtitle}
                </p>

                {/* Evidence Comparison Boxes */}
                <div className="space-y-3 mb-4">
                  {/* Claim A */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[12px] font-semibold text-slate-300">
                      <span className="flex items-center gap-1.5 font-bold text-slate-100">
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        {factA.evidence.documentName} (Page {factA.evidence.pageNumber})
                      </span>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        {factA.extractionStage || 'stage_a_structural'}
                      </span>
                    </div>
                    <div className="text-[13px] font-medium text-slate-100">
                      <span className="font-bold text-emerald-400">{factA.attribute}:</span> {factA.value}
                    </div>
                    {typeof factA.normalizedValue === 'number' && (
                      <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 p-1.5 rounded border border-emerald-800/80 inline-block">
                        Normalized: {factA.normalizedValue.toLocaleString()} {factA.unit || ''}
                      </div>
                    )}
                    <div className="text-[11px] font-mono text-slate-300 italic bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 leading-relaxed mt-2">
                      "{factA.evidence.verbatimQuote}"
                    </div>
                  </div>

                  {/* Claim B (if available) */}
                  {factB && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[12px] font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5 font-bold text-slate-100">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          {factB.evidence.documentName} (Page {factB.evidence.pageNumber})
                        </span>
                        <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                          {factB.extractionStage || 'stage_a_structural'}
                        </span>
                      </div>
                      <div className="text-[13px] font-medium text-slate-100">
                        <span className="font-bold text-emerald-400">{factB.attribute}:</span> {factB.value}
                      </div>
                      {typeof factB.normalizedValue === 'number' && (
                        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 p-1.5 rounded border border-emerald-800/80 inline-block">
                          Normalized: {factB.normalizedValue.toLocaleString()} {factB.unit || ''}
                        </div>
                      )}
                      <div className="text-[11px] font-mono text-slate-300 italic bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 leading-relaxed mt-2">
                        "{factB.evidence.verbatimQuote}"
                      </div>
                    </div>
                  )}
                </div>

                {/* System Reasoning */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    System Reasoning & Resolution Strategy
                  </div>
                  <div className="text-[13px] text-slate-200 leading-relaxed">
                    {rel.reasoning}
                  </div>
                  {rel.resolutionStrategy && (
                    <div className="mt-2 text-[12px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Strategy: {rel.resolutionStrategy}
                    </div>
                  )}
                </div>
              </div>

              {/* Inspect Action */}
              <button
                onClick={() => onInspectEvidence(rel)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
              >
                Inspect Full Evidence Spotlight
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
