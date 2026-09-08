import React from 'react';
import { FactRelationship } from '../types/fact';
import { FileText, CheckCircle2, AlertTriangle, Scale, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

interface ContextReconcilerCardProps {
  relationship: FactRelationship;
  onInspectEvidence: (relationship: FactRelationship) => void;
}

export const ContextReconcilerCard: React.FC<ContextReconcilerCardProps> = ({
  relationship,
  onInspectEvidence
}) => {
  if (!relationship) {
    return (
      <div className="w-full rounded-2xl border border-[#E5E5E9] bg-white p-8 text-center text-[#9CA3AF]">
        No relationship selected or available for this workspace.
      </div>
    );
  }

  const { factA, factB, relationshipType, reasoning, title, conflictDimension, caseType } = relationship;

  let badge = {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    label: 'Corroborated Fact',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  if (relationshipType === 'CONTRADICTION') {
    badge = { icon: <AlertTriangle className="w-4 h-4 text-rose-600" />, label: 'Genuine Contradiction', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
  } else if (relationshipType === 'RECONCILED_BY_CONTEXT') {
    badge = { icon: <Scale className="w-4 h-4 text-amber-600" />, label: 'Reconciled by Context', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  } else if (relationshipType === 'FAILURE_HANDLED') {
    badge = { icon: <ShieldAlert className="w-4 h-4 text-sky-600" />, label: 'Handled Extraction Failure', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
  }

  return (
    <div className="w-full rounded-2xl border border-[#E5E5E9] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#E5E5E9]">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-[13px] font-semibold ${badge.bg}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </div>
          <span className="text-[12px] font-bold uppercase tracking-wide text-[#6B7280] bg-[#F4F4FB] px-3 py-1 rounded-full border border-[#E5E5E9]">
            {caseType.toUpperCase()}
          </span>
          {conflictDimension && (
            <span className="text-[12px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              Dimension: {conflictDimension.replace('_', ' ')}
            </span>
          )}
        </div>

        <button
          onClick={() => onInspectEvidence(relationship)}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition"
        >
          Inspect Source Quotes
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Title */}
      <h2 className="text-[16px] font-bold text-[#111111] mb-5 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
        {title}
      </h2>

      {/* Fact Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {[{ fact: factA, label: 'A' }, { fact: factB, label: 'B' }].map(({ fact, label }) =>
          fact ? (
            <div key={label} className="p-5 rounded-xl border border-[#E5E5E9] bg-[#F9FAFB] hover:border-emerald-200 transition-all">
              {/* Doc + page */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-[#4B5563] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  {fact.evidence.documentName}
                </span>
                <span className="text-[12px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  pg. {fact.evidence.pageNumber}
                </span>
              </div>

              {/* Attribute label */}
              <div className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">{fact.attribute}</div>
              {/* Value — big & readable */}
              <div className="text-[22px] font-extrabold text-[#111111] mb-3 leading-tight">{fact.value}</div>

              {/* Pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                {fact.timePeriod && (
                  <span className="text-[12px] text-[#4B5563] bg-white px-3 py-1 rounded-full border border-[#E5E5E9] font-medium">
                    📅 {fact.timePeriod}
                  </span>
                )}
                {fact.scope && (
                  <span className="text-[12px] text-[#4B5563] bg-white px-3 py-1 rounded-full border border-[#E5E5E9] font-medium">
                    🔭 {fact.scope}
                  </span>
                )}
              </div>

              {/* Verbatim quote */}
              <blockquote className="text-[13px] italic text-[#374151] bg-white p-3 rounded-xl border border-[#E5E5E9] leading-relaxed">
                "{fact.evidence.verbatimQuote}"
              </blockquote>
            </div>
          ) : (
            <div key={label} className="p-5 rounded-xl border border-dashed border-sky-300 bg-sky-50/40">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-sky-700">
                  <ShieldAlert className="w-4 h-4" />
                  Extraction Failure — No Comparison Document
                </span>
                <span className="text-[12px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  Confidence: {Math.round(factA.evidence.confidenceScore * 100)}%
                </span>
              </div>

              {/* What was extracted */}
              <div className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">
                {factA.attribute}
              </div>
              <div className="text-[22px] font-extrabold text-sky-800 mb-3 leading-tight">
                {factA.value}
              </div>

              {/* Unit ambiguity pill */}
              {factA.unit && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    ⚠️ Unit: {factA.unit}
                  </span>
                </div>
              )}

              {/* Verbatim source quote */}
              <blockquote className="text-[13px] italic text-[#374151] bg-white border border-sky-200 p-3 rounded-xl leading-relaxed mb-3">
                "{factA.evidence.verbatimQuote}"
              </blockquote>

              {/* Fallback explanation */}
              <p className="text-[12px] text-[#6B7280] leading-relaxed">
                This fact has no second document for cross-reference. The system flagged it due to low confidence and missing unit context.
                Resolution was attempted via surrounding header-scope analysis.
              </p>
            </div>
          )
        )}
      </div>

      {/* Reasoning trace */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-emerald-900 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Reasoning Trace
        </h4>
        <p className="text-[14px] text-[#1f2937] leading-relaxed">{reasoning}</p>

        {relationship.resolutionStrategy && (
          <div className="mt-3 text-[13px] text-emerald-900 font-semibold pt-3 border-t border-emerald-200">
            Resolution Strategy: <span className="font-normal text-[#374151]">{relationship.resolutionStrategy}</span>
          </div>
        )}
      </div>
    </div>
  );
};
