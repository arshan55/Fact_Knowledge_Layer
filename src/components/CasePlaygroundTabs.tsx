import React from 'react';
import { FactRelationship } from '../types/fact';
import { CheckCircle2, AlertTriangle, Scale, ShieldAlert, Sparkles } from 'lucide-react';

interface CasePlaygroundTabsProps {
  relationships: FactRelationship[];
  activeCaseId: string | null;
  onSelectCase: (caseId: string) => void;
}

export const CasePlaygroundTabs: React.FC<CasePlaygroundTabsProps> = ({
  relationships,
  activeCaseId,
  onSelectCase
}) => {
  // Pick representative relationship for each case type from active workspace
  const case1 = relationships.find(r => r.relationshipType === 'CORROBORATED') ?? relationships[0];
  const case2 = relationships.find(r => r.relationshipType === 'CONTRADICTION') ?? relationships[1];
  const case3 = relationships.find(r => r.relationshipType === 'RECONCILED_BY_CONTEXT') ?? relationships[2];
  const case4 = relationships.find(r => r.relationshipType === 'FAILURE_HANDLED') ?? relationships[3];

  const cards = [
    { num: 1, label: 'Corroboration', rel: case1, icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { num: 2, label: 'Contradiction', rel: case2, icon: <AlertTriangle className="w-4 h-4 text-rose-600" />, badge: 'bg-rose-50 text-rose-700 border-rose-200' },
    { num: 3, label: 'Context Reconciled', rel: case3, icon: <Scale className="w-4 h-4 text-amber-500" />, badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { num: 4, label: 'Handled Failure', rel: case4, icon: <ShieldAlert className="w-4 h-4 text-sky-600" />, badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  ].filter(c => Boolean(c.rel));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h2 className="text-[14px] font-bold text-[#374151]">
            Featured Workspace Cases ({relationships.length} Total)
          </h2>
        </div>
        <span className="text-[12px] text-[#9CA3AF]">Click a card to inspect evidence</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const rel = card.rel!;
          const isSelected = activeCaseId === rel.id;

          return (
            <button
              key={rel.id}
              onClick={() => onSelectCase(rel.id)}
              className={`text-left p-4 rounded-xl transition-all border-[1.6px] bg-white ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/15 shadow-md shadow-emerald-600/5'
                  : 'border-[#E5E5E9] hover:border-emerald-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full border ${card.badge}`}>
                  Case {card.num}: {card.label}
                </span>
                {card.icon}
              </div>

              {/* Title */}
              <h3 className="text-[14px] font-bold text-[#111111] mb-1.5 line-clamp-1">
                {rel.title}
              </h3>

              {/* Description */}
              <p className="text-[13px] text-[#6B7280] line-clamp-2 leading-relaxed">
                {rel.reasoning}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
