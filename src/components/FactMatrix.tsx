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
  const [viewMode, setViewMode] = useState<'CLAIMS' | 'RELATIONSHIPS'>('CLAIMS');
  const [stageFilter, setStageFilter] = useState<'ALL' | 'stage_a_structural' | 'stage_b_llm'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CORROBORATED' | 'CONTRADICTION' | 'RECONCILED' | 'FAILURE'>('ALL');

  // Filter individual claims
  const filteredFacts = facts.filter((fact) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      fact.attribute.toLowerCase().includes(q) ||
      fact.entity.toLowerCase().includes(q) ||
      fact.value.toLowerCase().includes(q) ||
      fact.evidence.verbatimQuote.toLowerCase().includes(q) ||
      fact.evidence.documentName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (stageFilter !== 'ALL') {
      const stage = fact.extractionStage || 'stage_a_structural';
      if (stage !== stageFilter) return false;
    }

    return true;
  });

  // Filter relationships
  const filteredRelationships = relationships.filter((rel) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      rel.title.toLowerCase().includes(q) ||
      rel.factA.entity.toLowerCase().includes(q) ||
      rel.factA.attribute.toLowerCase().includes(q) ||
      rel.reasoning.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'CORROBORATED') if (rel.relationshipType !== 'CORROBORATED') return false;
    if (statusFilter === 'CONTRADICTION') if (rel.relationshipType !== 'CONTRADICTION') return false;
    if (statusFilter === 'RECONCILED') if (rel.relationshipType !== 'RECONCILED_BY_CONTEXT') return false;
    if (statusFilter === 'FAILURE') if (rel.relationshipType !== 'FAILURE_HANDLED') return false;

    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl mb-8 text-slate-100 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            Grounded Fact Knowledge Matrix ({facts.length} Claims Total)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Searchable repository of all extracted claims, raw vs. normalized values, verbatim quotes, and provenance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('CLAIMS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'CLAIMS'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Extracted Claims ({facts.length})
            </button>
            <button
              onClick={() => setViewMode('RELATIONSHIPS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'RELATIONSHIPS'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reconciled Pairs ({relationships.length})
            </button>
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All Stages</option>
            <option value="stage_a_structural">Stage A: Structural Regex</option>
            <option value="stage_b_llm">Stage B: Semantic LLM</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search claim, value, or quote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-full text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* View 1: Extracted Claims Table */}
      {viewMode === 'CLAIMS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">ID & Stage</th>
                <th className="p-3.5">Entity & Attribute</th>
                <th className="p-3.5">Raw & Normalized Values</th>
                <th className="p-3.5">Scope & Time</th>
                <th className="p-3.5">Verbatim Source Quote</th>
                <th className="p-3.5 text-right">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950 text-slate-200">
              {filteredFacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No claims match current search query or stage filter.
                  </td>
                </tr>
              ) : (
                filteredFacts.map((fact) => {
                  const confPct = (fact.evidence.confidenceScore * 100).toFixed(0);

                  return (
                    <tr key={fact.id} className="hover:bg-slate-900/60 transition">
                      {/* ID & Stage */}
                      <td className="p-3.5 space-y-1">
                        <div className="font-mono text-[11px] font-bold text-emerald-400">{fact.id}</div>
                        <div className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block">
                          {fact.extractionStage || 'stage_a_structural'}
                        </div>
                      </td>

                      {/* Entity & Attribute */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{fact.attribute}</div>
                        <div className="text-[11px] text-slate-400">{fact.entity}</div>
                      </td>

                      {/* Raw vs Normalized */}
                      <td className="p-3.5 space-y-1">
                        <div className="font-mono font-bold text-slate-100">{fact.value}</div>
                        {typeof fact.normalizedValue === 'number' && (
                          <div className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80 inline-block">
                            Norm: {fact.normalizedValue.toLocaleString()} {fact.unit || ''}
                          </div>
                        )}
                      </td>

                      {/* Scope & Time */}
                      <td className="p-3.5 text-[11px] space-y-1">
                        <div className="text-slate-300 font-semibold">{fact.timePeriod || 'No time period'}</div>
                        <div className="text-slate-500 font-mono">{fact.scope || 'General'}</div>
                      </td>

                      {/* Byte-for-Byte Verbatim Quote */}
                      <td className="p-3.5 max-w-sm">
                        <div className="font-mono text-[11px] text-slate-300 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800 line-clamp-2">
                          "{fact.evidence.verbatimQuote}"
                        </div>
                      </td>

                      {/* Provenance */}
                      <td className="p-3.5 text-right font-mono text-[11px] space-y-1">
                        <div className="flex items-center justify-end gap-1 text-slate-300 font-semibold">
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span>P{fact.evidence.pageNumber}: {fact.evidence.documentName}</span>
                        </div>
                        <div className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                          <Lock className="w-2.5 h-2.5" /> {confPct}% Conf.
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View 2: Relationships Table */}
      {viewMode === 'RELATIONSHIPS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Metric & Entity</th>
                <th className="p-3.5">Raw Values Comparison</th>
                <th className="p-3.5">System Reasoning</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950 text-slate-200">
              {filteredRelationships.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No cross-document relationships match current query.
                  </td>
                </tr>
              ) : (
                filteredRelationships.map((rel) => {
                  const { factA, factB, relationshipType } = rel;

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Corroborated
                    </span>
                  );

                  if (relationshipType === 'CONTRADICTION') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> Contradiction
                      </span>
                    );
                  } else if (relationshipType === 'RECONCILED_BY_CONTEXT') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        <Scale className="w-3 h-3 text-amber-400" /> Reconciled
                      </span>
                    );
                  } else if (relationshipType === 'FAILURE_HANDLED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                        <ShieldAlert className="w-3 h-3 text-sky-400" /> Handled
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={rel.id}
                      className="hover:bg-slate-900/60 transition cursor-pointer"
                      onClick={() => onSelectRelationship(rel)}
                    >
                      <td className="p-3.5 whitespace-nowrap">{statusBadge}</td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{factA.attribute}</div>
                        <div className="text-[11px] text-slate-400">{factA.entity}</div>
                      </td>

                      <td className="p-3.5 font-mono space-y-1">
                        <div className="font-bold text-slate-100">Doc A: {factA.value}</div>
                        {factB && <div className="text-emerald-400">Doc B: {factB.value}</div>}
                      </td>

                      <td className="p-3.5 max-w-sm text-[11px] text-slate-300 line-clamp-2">
                        {rel.reasoning}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRelationship(rel);
                          }}
                          className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition text-[11px] font-bold"
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
      )}
    </div>
  );
};
