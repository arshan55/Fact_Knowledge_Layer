import React, { useEffect, useMemo, useState } from 'react';
import { GroundedFact } from '../types/fact';
import { Calendar, ChevronRight } from 'lucide-react';

interface FactTimelineProps {
  facts: GroundedFact[];
}

export const FactTimeline: React.FC<FactTimelineProps> = ({ facts }) => {
  const timelineGroups = useMemo(() => {
    const groups = new Map<string, GroundedFact[]>();

    facts.forEach((fact) => {
      const period = fact.timePeriod?.trim();
      if (!period || period.toLowerCase() === 'not specified') return;
      const group = groups.get(period) || [];
      group.push(fact);
      groups.set(period, group);
    });

    return [...groups.entries()]
      .map(([period, group]) => ({ period, facts: group }))
      .sort((a, b) => {
        const year = (period: string) => Number(period.match(/\b(19|20)\d{2}\b/)?.[0] || Number.POSITIVE_INFINITY);
        const quarter = (period: string) => Number(period.match(/Q([1-4])/i)?.[1] || 0);
        return year(a.period) - year(b.period) || quarter(a.period) - quarter(b.period) || a.period.localeCompare(b.period);
      });
  }, [facts]);

  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = Math.min(activeIndex, Math.max(timelineGroups.length - 1, 0));

  useEffect(() => {
    if (activeIndex !== safeActiveIndex) setActiveIndex(safeActiveIndex);
  }, [activeIndex, safeActiveIndex]);

  if (timelineGroups.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto rounded-[2rem] border-[1.6px] border-[#E5E5E9] bg-white p-8 shadow-xl mb-8 text-center">
        <Calendar className="w-6 h-6 text-[#9CA3AF] mx-auto mb-3" />
        <h2 className="text-sm font-bold text-[#2B2B2B]">No timeline data yet</h2>
        <p className="text-xs text-[#717077] mt-1">Upload a document with dated facts to build the timeline.</p>
      </div>
    );
  }

  const currentGroup = timelineGroups[safeActiveIndex];
  const currentFact = currentGroup.facts[0];

  return (
    <div className="w-full max-w-7xl mx-auto rounded-[2rem] border-[1.6px] border-[#E5E5E9] bg-white p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-[#838385] uppercase tracking-wider">
            Interactive Fact Evolution Timeline
          </h2>
        </div>
        <span className="text-xs text-[#717077]">
          Trace state transitions across publication dates
        </span>
      </div>

      {/* Timeline Nodes */}
      <div className="relative mb-5 pt-3 pb-1">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E5E5E9] -translate-y-1/2" />

        <div className="relative flex items-center justify-between w-full mx-auto">
          {timelineGroups.map((group, idx) => {
            const isActive = idx === safeActiveIndex;
            return (
              <button
                key={group.period}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Show facts for ${group.period}`}
                aria-current={isActive ? 'step' : undefined}
                className={`relative z-10 flex flex-col items-center focus:outline-none transition`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-md shadow-emerald-600/20'
                      : 'bg-white text-[#717077] hover:bg-slate-50 border border-[#E5E5E9]'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[11px] font-medium mt-1.5 transition ${isActive ? 'text-emerald-700 font-bold' : 'text-[#838385]'}`}>
                  {group.period}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Fact Card */}
      {currentFact && (
        <div className="p-4 rounded-2xl bg-[#F4F4FB] border border-[#E5E5E9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {currentFact.timePeriod || 'Time Marker'}
              </span>
              <span className="text-[11px] text-[#717077] font-mono">
                {currentFact.evidence.documentName} (Page {currentFact.evidence.pageNumber}) · {currentGroup.facts.length} fact{currentGroup.facts.length === 1 ? '' : 's'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#2B2B2B]">
              {currentFact.entity}: <span className="text-emerald-700">{currentFact.value}</span>
            </h4>
            <p className="text-xs text-[#717077] italic mt-0.5">"{currentFact.evidence.verbatimQuote}"</p>
          </div>

          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % timelineGroups.length)}
            aria-label="Show the next timeline period"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full border border-emerald-200 transition shrink-0"
          >
            <span>Next State</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
