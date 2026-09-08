import React from 'react';
import { FactRelationship } from '../types/fact';
import { FileText, CheckCircle2, AlertTriangle, Scale, ShieldAlert, Sparkles, ExternalLink, Lock } from 'lucide-react';

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
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
        No relationship selected or available for this workspace.
      </div>
    );
  }

  const { factA, factB, relationshipType, reasoning, title, conflictDimension, caseType } = relationship;

  let badge = {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    label: 'Corroborated Fact',
    bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
  };

  if (relationshipType === 'CONTRADICTION') {
    badge = { icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, label: 'Genuine Contradiction', bg: 'bg-rose-950/80 text-rose-300 border-rose-800' };
  } else if (relationshipType === 'RECONCILED_BY_CONTEXT') {
    badge = { icon: <Scale className="w-4 h-4 text-amber-400" />, label: 'Reconciled by Context', bg: 'bg-amber-950/80 text-amber-300 border-amber-800' };
  } else if (relationshipType === 'FAILURE_HANDLED') {
    badge = { icon: <ShieldAlert className="w-4 h-4 text-sky-400" />, label: 'Handled Extraction Failure', bg: 'bg-sky-950/80 text-sky-300 border-sky-800' };
  }

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-[13px] font-semibold ${badge.bg}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </div>
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {caseType.toUpperCase()}
          </span>
          {conflictDimension && (
            <span className="text-[12px] text-emerald-300 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full font-semibold">
              Dimension: {conflictDimension.replace('_', ' ')}
            </span>
          )}
        </div>

        <button
          onClick={() => onInspectEvidence(relationship)}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
        >
          Inspect Source Quotes
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Title */}
      <h2 className="text-[16px] font-bold text-slate-100 mb-5 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        {title}
      </h2>

      {/* Fact Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {[{ fact: factA, label: 'A' }, { fact: factB, label: 'B' }].map(({ fact, label }) =>
          fact ? (
            <div key={label} className="p-5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/40 transition-all space-y-3">
              {/* Doc + page */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  {fact.evidence.documentName}
                </span>
                <span className="text-[12px] font-mono font-bold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  pg. {fact.evidence.pageNumber}
                </span>
              </div>

              {/* Attribute label */}
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{fact.attribute}</div>
              
              {/* Values: Raw & Normalized */}
              <div>
                <div className="text-[20px] font-extrabold text-slate-100 leading-tight font-mono">{fact.value}</div>
                {typeof fact.normalizedValue === 'number' && (
                  <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80 inline-block mt-1">
                    Normalized: {fact.normalizedValue.toLocaleString()} {fact.unit || ''}
                  </div>
                )}
              </div>

              {/* Scope Pills */}
              <div className="flex flex-wrap gap-2">
                {fact.timePeriod && (
                  <span className="text-[11px] text-slate-300 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 font-medium">
                    📅 {fact.timePeriod}
                  </span>
                )}
                {fact.scope && (
                  <span className="text-[11px] text-slate-300 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 font-medium">
                    Scope: {fact.scope}
                  </span>
                )}
              </div>

              {/* Monospace Verbatim quote */}
              <blockquote className="text-[12px] font-mono text-slate-200 italic bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                "{fact.evidence.verbatimQuote}"
              </blockquote>
            </div>
          ) : (
            <div key={label} className="p-5 rounded-xl border border-dashed border-sky-800 bg-sky-950/30 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-sky-400">
                  <ShieldAlert className="w-4 h-4" />
                  Extraction Failure — Single Document Claim
                </span>
                <span className="text-[12px] font-mono font-bold text-rose-400 bg-rose-950 border border-rose-800 px-2.5 py-0.5 rounded-full">
                  Confidence: {Math.round(factA.evidence.confidenceScore * 100)}%
                </span>
              </div>

              {/* Extracted attribute */}
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {factA.attribute}
              </div>
              <div className="text-[20px] font-extrabold text-sky-300 font-mono">
                {factA.value}
              </div>

              {/* Unit ambiguity */}
              {factA.unit && (
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-300 bg-amber-950 border border-amber-800 px-3 py-1 rounded-full">
                    ⚠️ Unit: {factA.unit}
                  </span>
                </div>
              )}

              {/* Monospace quote */}
              <blockquote className="text-[12px] font-mono text-slate-200 italic bg-slate-900 border border-sky-800/60 p-3 rounded-xl leading-relaxed">
                "{factA.evidence.verbatimQuote}"
              </blockquote>

              <p className="text-[12px] text-slate-400 leading-relaxed">
                This claim has no second document for cross-reference. System flagged low confidence or unit ambiguity, triggering automatic header scope analysis fallback.
              </p>
            </div>
          )
        )}
      </div>

      {/* Reasoning trace */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          System Reasoning & Resolution Strategy
        </h4>
        <p className="text-[14px] text-slate-200 leading-relaxed">{reasoning}</p>

        {relationship.resolutionStrategy && (
          <div className="mt-3 text-[13px] text-emerald-400 font-semibold pt-3 border-t border-slate-900">
            Resolution Strategy: <span className="font-normal text-slate-300">{relationship.resolutionStrategy}</span>
          </div>
        )}
      </div>
    </div>
  );
};
