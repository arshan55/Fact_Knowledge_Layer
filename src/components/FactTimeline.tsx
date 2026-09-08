import React, { useState } from 'react';
import { GroundedFact } from '../types/fact';
import { Calendar, ChevronRight } from 'lucide-react';

interface FactTimelineProps {
  facts: GroundedFact[];
}

export const FactTimeline: React.FC<FactTimelineProps> = ({ facts }) => {
  const timelineFacts = facts
    .filter((f) => f.timePeriod || f.entity.includes('Jane'))
    .sort((a, b) => (a.timePeriod || '').localeCompare(b.timePeriod || ''));

  const [activeIndex, setActiveIndex] = useState(0);

  if (timelineFacts.length === 0) return null;

  const currentFact = timelineFacts[activeIndex] || timelineFacts[0];

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
        
        <div className="relative flex items-center justify-between max-w-xl mx-auto">
          {timelineFacts.map((fact, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={fact.id}
                onClick={() => setActiveIndex(idx)}
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
                  {fact.timePeriod || 'Event'}
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
                {currentFact.evidence.documentName} (Page {currentFact.evidence.pageNumber})
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#2B2B2B]">
              {currentFact.entity}: <span className="text-emerald-700">{currentFact.value}</span>
            </h4>
            <p className="text-xs text-[#717077] italic mt-0.5">"{currentFact.evidence.verbatimQuote}"</p>
          </div>

          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % timelineFacts.length)}
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
