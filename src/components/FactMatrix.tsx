import React, { useState } from 'react';
import { GroundedFact, FactRelationship } from '../types/fact';
import { Search, Filter, FileText, CheckCircle2, AlertTriangle, Scale, ShieldAlert, Sparkles, Layers, Lock } from 'lucide-react';

interface FactMatrixProps {
  facts: GroundedFact[];
  relationships: FactRelationship[];
  onSelectRelationship: (rel: FactRelationship) => void;
}

export const FactMatrix: React.FC<FactMatrixProps> = ({
  facts,
  relationships,
  onSelectRelationship
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CORROBORATED' | 'CONTRADICTION' | 'RECONCILED' | 'FAILURE'>('ALL');
  const [stageFilter, setStageFilter] = useState<'ALL' | 'stage_a_structural' | 'stage_b_llm'>('ALL');

  const filteredRelationships = relationships.filter((rel) => {
    const matchesSearch =
      rel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rel.factA.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rel.factA.attribute.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rel.reasoning.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'CORROBORATED') if (rel.relationshipType !== 'CORROBORATED') return false;
    if (statusFilter === 'CONTRADICTION') if (rel.relationshipType !== 'CONTRADICTION') return false;
    if (statusFilter === 'RECONCILED') if (rel.relationshipType !== 'RECONCILED_BY_CONTEXT') return false;
    if (statusFilter === 'FAILURE') if (rel.relationshipType !== 'FAILURE_HANDLED') return false;

    if (stageFilter !== 'ALL') {
      const stageA = rel.factA.extractionStage || 'stage_a_structural';
      if (stageA !== stageFilter) return false;
    }

    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto rounded-[2rem] border-[1.6px] border-[#E5E5E9] bg-white p-6 shadow-xl mb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-[#2B2B2B] flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            Cross-Document Fact Knowledge Matrix
          </h2>
          <p className="text-xs text-[#838385] mt-0.5">
            Searchable grounded claims, raw vs. normalized values, stage tags, and verbatim quotes
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#F4F4FB] border border-[#E5E5E9] rounded-xl text-xs font-semibold text-[#2B2B2B] focus:outline-none focus:border-emerald-600 transition"
          >
            <option value="ALL">All Stages</option>
            <option value="stage_a_structural">Stage A: Structural Regex</option>
            <option value="stage_b_llm">Stage B: Semantic LLM</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#838385]" />
            <input
              type="text"
              placeholder="Search metric, entity, or quote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F4F4FB] border border-[#E5E5E9] rounded-full text-xs text-[#2B2B2B] placeholder-[#838385] focus:outline-none focus:border-emerald-600 transition"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'ALL', label: 'All Matches' },
          { id: 'CORROBORATED', label: '🟢 Corroborated' },
          { id: 'CONTRADICTION', label: '🔴 Contradiction' },
          { id: 'RECONCILED', label: '🟡 Context Reconciled' },
          { id: 'FAILURE', label: '🔵 Handled Failure' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition border ${
              statusFilter === tab.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10'
                : 'bg-[#F4F4FB] text-[#717077] border-[#E5E5E9] hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Relationships Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E5E5E9]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F4F4FB] text-[#717077] font-bold border-b border-[#E5E5E9] uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Status & Stage</th>
              <th className="p-3.5">Entity & Metric</th>
              <th className="p-3.5">Raw vs Normalized Values</th>
              <th className="p-3.5">Confidence & Grounding</th>
              <th className="p-3.5">Verbatim Source Quote</th>
              <th className="p-3.5 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E9] bg-white">
            {filteredRelationships.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[#717077]">
                  No matching claims found for current filter.
                </td>
              </tr>
            ) : (
              filteredRelationships.map((rel) => {
                const { factA, factB, relationshipType } = rel;

                let statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Corroborated
                  </span>
                );

                if (relationshipType === 'CONTRADICTION') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Contradiction
                    </span>
                  );
                } else if (relationshipType === 'RECONCILED_BY_CONTEXT') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Scale className="w-3 h-3 text-amber-600" /> Reconciled
                    </span>
                  );
                } else if (relationshipType === 'FAILURE_HANDLED') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      <ShieldAlert className="w-3 h-3 text-sky-600" /> Handled
                    </span>
                  );
                }

                const confidencePct = (factA.evidence.confidenceScore * 100).toFixed(0);
                const confidenceLabel =
                  factA.evidence.confidenceScore >= 0.90
                    ? 'High'
                    : factA.evidence.confidenceScore >= 0.75
                    ? 'Medium'
                    : 'Low / Flagged';

                return (
                  <tr
                    key={rel.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => onSelectRelationship(rel)}
                  >
                    {/* Status & Stage */}
                    <td className="p-3.5 space-y-1.5">
                      <div>{statusBadge}</div>
                      <div className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                        {factA.extractionStage || 'stage_a_structural'}
                      </div>
                    </td>

                    {/* Entity & Metric */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#2B2B2B]">{factA.attribute}</div>
                      <div className="text-[11px] text-[#717077]">{factA.entity}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {factA.timePeriod || 'No time bound'}
                      </div>
                    </td>

                    {/* Dual Values: Raw vs Normalized */}
                    <td className="p-3.5 space-y-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Raw:</span>
                        <span className="font-bold text-[#111111]">{factA.value}</span>
                      </div>
                      {typeof factA.normalizedValue === 'number' && (
                        <div className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          Norm: {factA.normalizedValue.toLocaleString()} {factA.unit || ''}
                        </div>
                      )}
                      {factB && (
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">vs Raw B:</span>
                          <span className="font-bold text-[#111111]">{factB.value}</span>
                        </div>
                      )}
                    </td>

                    {/* Confidence & Grounding */}
                    <td className="p-3.5 space-y-1">
                      <div className="font-semibold text-[11px] text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {confidencePct}% ({confidenceLabel})
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-emerald-600" /> Grounding Verified
                      </div>
                    </td>

                    {/* Byte-for-Byte Monospace Verbatim Quote */}
                    <td className="p-3.5 max-w-sm">
                      <div className="font-mono text-[11px] text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-200 line-clamp-2">
                        "{factA.evidence.verbatimQuote}"
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRelationship(rel);
                        }}
                        className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition text-[11px] font-bold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
