import React, { useState } from 'react';
import { GroundedFact } from '../types/fact';
import { Calendar, Clock, ChevronRight, FileText, CheckCircle2, Lock, TrendingUp } from 'lucide-react';

interface FactTimelineProps {
  facts: GroundedFact[];
}

export const FactTimeline: React.FC<FactTimelineProps> = ({ facts }) => {
  // Extract and group facts by valid time period
  const factsWithTime = facts.filter(f => f.timePeriod && f.timePeriod !== 'Not specified');

  // Group by timePeriod string
  const groupedMap = new Map<string, GroundedFact[]>();

  (factsWithTime.length > 0 ? factsWithTime : facts).forEach(fact => {
    const key = fact.timePeriod || 'General / Unspecified';
    if (!groupedMap.has(key)) {
      groupedMap.set(key, []);
    }
    groupedMap.get(key)!.push(fact);
  });

  // Sort time period keys chronologically
  const sortedPeriods = Array.from(groupedMap.keys()).sort((a, b) => {
    const aYr = (a.match(/\d{4}/) || ['0'])[0];
    const bYr = (b.match(/\d{4}/) || ['0'])[0];
    return aYr.localeCompare(bYr);
  });

  const [selectedPeriod, setSelectedPeriod] = useState<string>(sortedPeriods[0] || '');

  const currentPeriod = selectedPeriod || sortedPeriods[0] || '';
  const currentFacts = groupedMap.get(currentPeriod) || [];

  if (sortedPeriods.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
        No time-bound facts extracted in this workspace. Upload annual reports or financial releases with reporting dates to view temporal timeline evolution.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl mb-8 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Fact Evolution & Temporal State Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Trace how metrics, financial figures, and entity states change across reporting periods
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80">
          {sortedPeriods.length} Time Period Window{sortedPeriods.length !== 1 ? 's' : ''} Identified
        </span>
      </div>

      {/* Horizontal Scrollable Time Period Bar */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
          Select Reporting Period:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {sortedPeriods.map((period) => {
            const isSelected = (selectedPeriod || sortedPeriods[0]) === period;
            const count = groupedMap.get(period)?.length || 0;

            return (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{period}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Period Claims Inspector */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Claims Grounded in <span className="text-emerald-400">{currentPeriod}</span> ({currentFacts.length})
          </h3>
          <span className="text-xs text-slate-400">
            Byte-for-byte verbatim quotes & document provenance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentFacts.map((fact) => (
            <div
              key={fact.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 transition space-y-3"
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-100 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  {fact.entity}
                </span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {fact.extractionStage || 'stage_a_structural'}
                </span>
              </div>

              {/* Metric & Values */}
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-semibold">{fact.attribute}</div>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  {fact.value}
                </div>
                {typeof fact.normalizedValue === 'number' && (
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800">
                    Normalized: {fact.normalizedValue.toLocaleString()} {fact.unit || ''}
                  </div>
                )}
              </div>

              {/* Byte-for-Byte Verbatim Quote */}
              <div className="font-mono text-[11px] text-slate-300 italic bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                "{fact.evidence.verbatimQuote}"
              </div>

              {/* Bottom Provenance Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-400" />
                  {fact.evidence.documentName} (Page {fact.evidence.pageNumber})
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Lock className="w-2.5 h-2.5" /> {(fact.evidence.confidenceScore * 100).toFixed(0)}% Conf.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
