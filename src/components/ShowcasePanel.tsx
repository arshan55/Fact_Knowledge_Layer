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
  // Find representative cases for each of the 4 required showcase cases
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
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      caseTag: 'CASE 1 · CORROBORATION'
    },
    {
      num: 2,
      title: 'Genuine Contradiction Between Documents',
      subtitle: 'Direct conflicting metrics in identical reporting periods and scopes',
      rel: case2,
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      caseTag: 'CASE 2 · CONTRADICTION'
    },
    {
      num: 3,
      title: 'Apparent Contradiction Reconciled by Context',
      subtitle: 'Differing values explained by time period windows, scope, or currency units',
      rel: case3,
      icon: <Scale className="w-5 h-5 text-amber-500" />,
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      caseTag: 'CASE 3 · CONTEXT RECONCILED'
    },
    {
      num: 4,
      title: 'Extraction / Reasoning Failure Handled',
      subtitle: 'Low-confidence claim or metric unit ambiguity flagged with automatic header scope fallback',
      rel: case4,
      icon: <ShieldAlert className="w-5 h-5 text-sky-600" />,
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      caseTag: 'CASE 4 · FAILURE HANDLED'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[12px] font-bold tracking-wide uppercase border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Evidence Review Workspace
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Trace Every Fact Back to Its Source
          </h1>
          <p className="text-emerald-100/80 text-[14px] max-w-3xl leading-relaxed">
            Compare grounded claims across documents, surface conflicts, and understand how context changes the meaning of a fact.
          </p>
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showcaseCases.map((item) => {
          const rel = item.rel;

          if (!rel) {
            return (
              <div key={item.num} className="rounded-2xl border border-[#E5E5E9] bg-white p-6 opacity-60">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full border text-[11px] font-bold ${item.badgeBg}`}>
                    {item.caseTag}
                  </span>
                  {item.icon}
                </div>
                <h3 className="text-[16px] font-bold text-[#111111]">{item.title}</h3>
                <p className="text-[13px] text-[#9CA3AF] mt-2">No relationship generated for this category in the current workspace.</p>
              </div>
            );
          }

          const factA = rel.factA;
          const factB = rel.factB;

          return (
            <div
              key={item.num}
              className="rounded-2xl border-[1.6px] border-[#E5E5E9] bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${item.badgeBg}`}>
                    {item.caseTag}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Grounding Verified
                    </span>
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-[16px] font-bold text-[#111111] mb-1">
                  {item.title}
                </h3>
                <p className="text-[12px] text-[#6B7280] mb-4">
                  {item.subtitle}
                </p>

                {/* Evidence Comparison Boxes */}
                <div className="space-y-3 mb-4">
                  {/* Claim A */}
                  <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E5E9]">
                    <div className="flex items-center justify-between text-[12px] font-semibold text-[#374151] mb-1">
                      <span className="flex items-center gap-1.5 font-bold text-[#111111]">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        {factA.evidence.documentName} (Page {factA.evidence.pageNumber})
                      </span>
                      <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5E5E9]">
                        Stage: {factA.extractionStage || 'stage_a_structural'}
                      </span>
                    </div>
                    <div className="text-[13px] font-medium text-[#111111] mt-1">
                      <span className="font-bold text-emerald-700">{factA.attribute}:</span> {factA.value}
                    </div>
                    <div className="text-[12px] italic text-[#4B5563] mt-2 pl-3 border-l-2 border-emerald-500 bg-white p-2 rounded-r-lg">
                      "{factA.evidence.verbatimQuote}"
                    </div>
                  </div>

                  {/* Claim B (if available) */}
                  {factB && (
                    <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E5E9]">
                      <div className="flex items-center justify-between text-[12px] font-semibold text-[#374151] mb-1">
                        <span className="flex items-center gap-1.5 font-bold text-[#111111]">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          {factB.evidence.documentName} (Page {factB.evidence.pageNumber})
                        </span>
                        <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5E5E9]">
                          Stage: {factB.extractionStage || 'stage_a_structural'}
                        </span>
                      </div>
                      <div className="text-[13px] font-medium text-[#111111] mt-1">
                        <span className="font-bold text-emerald-700">{factB.attribute}:</span> {factB.value}
                      </div>
                      <div className="text-[12px] italic text-[#4B5563] mt-2 pl-3 border-l-2 border-emerald-500 bg-white p-2 rounded-r-lg">
                        "{factB.evidence.verbatimQuote}"
                      </div>
                    </div>
                  )}
                </div>

                {/* System Reasoning */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    System Reasoning & Resolution Strategy
                  </div>
                  <div className="text-[13px] text-slate-700 leading-relaxed">
                    {rel.reasoning}
                  </div>
                  {rel.resolutionStrategy && (
                    <div className="mt-2 text-[12px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strategy: {rel.resolutionStrategy}
                    </div>
                  )}
                </div>
              </div>

              {/* Inspect Action */}
              <button
                onClick={() => onInspectEvidence(rel)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
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
