import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Scale, ShieldAlert, FileText, TrendingUp, Layers } from 'lucide-react';
import { FactRelationship, GroundedFact, ParsedDocument } from '../types/fact';
import { CasePlaygroundTabs } from './CasePlaygroundTabs';
import { ContextReconcilerCard } from './ContextReconcilerCard';

interface OverviewPanelProps {
  documents: ParsedDocument[];
  facts: GroundedFact[];
  relationships: FactRelationship[];
  activeRelationship: FactRelationship;
  onSelectCase: (id: string) => void;
  onInspectEvidence: (rel: FactRelationship) => void;
  onSelectRelationship: (rel: FactRelationship) => void;
}

const StatCard: React.FC<{
  label: string; value: number | string; icon: React.ReactNode; accent: string; bg: string;
}> = ({ label, value, icon, accent, bg }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-[#E5E5E9] bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
  >
    <div className="flex items-center justify-between mb-3">
      <span className={`text-[11px] font-bold uppercase tracking-[0.08em] ${accent}`}>{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
        {icon}
      </div>
    </div>
    <div className="text-[32px] font-extrabold text-[#111111] leading-none">{value}</div>
  </motion.div>
);

export const OverviewPanel: React.FC<OverviewPanelProps> = ({
  documents, facts, relationships, activeRelationship,
  onSelectCase, onInspectEvidence
}) => {
  const corroborated = relationships.filter(r => r.relationshipType === 'CORROBORATED').length;
  const contradictions = relationships.filter(r => r.relationshipType === 'CONTRADICTION').length;
  const reconciled = relationships.filter(r => r.relationshipType === 'RECONCILED_BY_CONTEXT').length;
  const failures = relationships.filter(r => r.relationshipType === 'FAILURE_HANDLED').length;

  return (
    <div className="p-6 space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Documents" value={documents.length}
          icon={<FileText className="w-4 h-4 text-emerald-600" />} accent="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Extracted Facts" value={facts.length}
          icon={<Layers className="w-4 h-4 text-indigo-500" />} accent="text-indigo-500" bg="bg-indigo-50" />
        <StatCard label="Relationships" value={relationships.length}
          icon={<TrendingUp className="w-4 h-4 text-violet-500" />} accent="text-violet-500" bg="bg-violet-50" />
        <StatCard label="Contradictions" value={contradictions}
          icon={<AlertTriangle className="w-4 h-4 text-rose-500" />} accent="text-rose-500" bg="bg-rose-50" />
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Corroborated',      val: corroborated,   icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
          { label: 'Contradictions',    val: contradictions, icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,   color: 'bg-rose-50 border-rose-200 text-rose-800' },
          { label: 'Context Reconciled',val: reconciled,     icon: <Scale className="w-4 h-4 text-amber-500" />,         color: 'bg-amber-50 border-amber-200 text-amber-800' },
          { label: 'Handled Failures',  val: failures,       icon: <ShieldAlert className="w-4 h-4 text-sky-500" />,     color: 'bg-sky-50 border-sky-200 text-sky-800' },
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${item.color}`}>
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              {item.icon} {item.label}
            </div>
            <span className="text-[18px] font-bold">{item.val}</span>
          </div>
        ))}
      </div>

      {/* Case tabs + reconciler */}
      <CasePlaygroundTabs
        relationships={relationships}
        activeCaseId={activeRelationship?.id ?? null}
        onSelectCase={onSelectCase}
      />

      <ContextReconcilerCard
        relationship={activeRelationship}
        onInspectEvidence={onInspectEvidence}
      />
    </div>
  );
};
