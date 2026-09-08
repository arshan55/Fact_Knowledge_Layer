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
  const case1 = relationships.find(r => r.relationshipType === 'CORROBORATED') ?? relationships[0];
  const case2 = relationships.find(r => r.relationshipType === 'CONTRADICTION') ?? relationships[1];
  const case3 = relationships.find(r => r.relationshipType === 'RECONCILED_BY_CONTEXT') ?? relationships[2];
  const case4 = relationships.find(r => r.relationshipType === 'FAILURE_HANDLED') ?? relationships[3];

  const cards = [
    { num: 1, label: 'Corroboration', rel: case1, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, badge: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    { num: 2, label: 'Contradiction', rel: case2, icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, badge: 'bg-rose-950 text-rose-300 border-rose-800' },
    { num: 3, label: 'Context Reconciled', rel: case3, icon: <Scale className="w-4 h-4 text-amber-400" />, badge: 'bg-amber-950 text-amber-300 border-amber-800' },
    { num: 4, label: 'Handled Failure', rel: case4, icon: <ShieldAlert className="w-4 h-4 text-sky-400" />, badge: 'bg-sky-950 text-sky-300 border-sky-800' },
  ].filter(c => Boolean(c.rel));

  return (
    <div className="w-full text-slate-100">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-[14px] font-bold text-slate-200">
            Featured Workspace Cases ({relationships.length} Total)
          </h2>
        </div>
        <span className="text-[12px] text-slate-400">Click a card to inspect evidence</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const rel = card.rel!;
          const isSelected = activeCaseId === rel.id;

          return (
            <button
              key={rel.id}
              onClick={() => onSelectCase(rel.id)}
              className={`text-left p-4 rounded-xl transition-all border bg-slate-900/90 ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950'
                  : 'border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full border ${card.badge}`}>
                  Case {card.num}: {card.label}
                </span>
                {card.icon}
              </div>

              {/* Title */}
              <h3 className="text-[14px] font-bold text-slate-100 mb-1.5 line-clamp-1">
                {rel.title}
              </h3>

              {/* Description */}
              <p className="text-[13px] text-slate-400 line-clamp-2 leading-relaxed">
                {rel.reasoning}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
