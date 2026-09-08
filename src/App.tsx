import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload } from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewPanel } from './components/OverviewPanel';
import { FactMatrix } from './components/FactMatrix';
import { FactTimeline } from './components/FactTimeline';
import { PdfUploadZone } from './components/PdfUploadZone';
import { EvidenceSpotlightModal } from './components/EvidenceSpotlightModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { NewWorkspaceModal } from './components/NewWorkspaceModal';
import { ShowcasePanel } from './components/ShowcasePanel';
import { DocumentView } from './components/DocumentView';

import { ParsedDocument, GroundedFact, FactRelationship, Workspace } from './types/fact';
import { extractFactsFromDocument } from './lib/factExtractor';
import { reconcileFacts, reconcileIncremental } from './lib/reconciler';
import { STARTER_WORKSPACES, CASE_PRESETS } from './data/starterData';

type Tab = 'overview' | 'document_view' | 'showcase' | 'ingestion' | 'matrix' | 'timeline';

const TAB_META: Record<Tab, { title: string; subtitle: string }> = {
  overview:      { title: 'Dashboard Overview',           subtitle: 'Cross-document grounding, fact discovery & contextual reconciliation' },
  document_view: { title: 'Document & Evidence Viewer',   subtitle: 'Interactive PDF text reader with highlighted verbatim claim spans' },
  showcase:      { title: 'The Four Required Cases',      subtitle: 'Mandatory submission showcase: Corroboration, Contradiction, Context Reconciled, and Handled Failures' },
  ingestion:     { title: 'PDF Document Hub',             subtitle: 'Upload PDFs to dynamically extract and ground facts' },
  matrix:        { title: 'Cross-Document Fact Matrix',   subtitle: 'Searchable grounded facts, verbatim source quotes, and reconciliation relationships' },
  timeline:      { title: 'Fact Evolution Timeline',      subtitle: 'Trace how facts and entity states change across document dates' }
};

const BLANK_WORKSPACE = (id: string, name: string, emoji: string): Workspace => ({
  id, name, emoji, createdAt: new Date().toISOString().split('T')[0],
  documents: [], facts: [], relationships: []
});

export function App() {
  const [workspaces, setWorkspaces]               = useState<Workspace[]>(STARTER_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(STARTER_WORKSPACES[0]?.id ?? '');
  const [activeTab, setActiveTab]                 = useState<Tab>('overview');
  const [spotlightRel, setSpotlightRel]           = useState<FactRelationship | null>(null);
  const [isSettingsOpen, setIsSettingsOpen]       = useState(false);
  const [isNewWsOpen, setIsNewWsOpen]             = useState(false);
  const [apiKey, setApiKey]                       = useState('');
  const [apiProvider, setApiProvider]             = useState<'openai' | 'gemini'>('openai');
  const [isProcessing, setIsProcessing]           = useState(false);
  const [processingMsg, setProcessingMsg]         = useState('');
  const [activeRelationshipId, setActiveRelationshipId] = useState<string>(STARTER_WORKSPACES[0]?.relationships[0]?.id ?? '');

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) ?? workspaces[0];
  const { documents, facts, relationships } = activeWorkspace;
  const activeRelationship = relationships.find(r => r.id === activeRelationshipId) ?? relationships[0];

  const updateWorkspace = (id: string, patch: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
  };

  const handleSwitchWorkspace = (id: string) => {
    const ws = workspaces.find(w => w.id === id);
    if (!ws) return;
    setActiveWorkspaceId(id);
    setActiveRelationshipId(ws.relationships[0]?.id ?? '');
    setActiveTab('overview');
  };

  const handleCreateWorkspace = (name: string, emoji: string) => {
    const ws = BLANK_WORKSPACE(`ws-${Date.now()}`, name, emoji);
    setWorkspaces(prev => [...prev, ws]);
    setActiveWorkspaceId(ws.id);
    setActiveRelationshipId('');
    setActiveTab('ingestion');
  };

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    if (activeWorkspaceId === id) {
      const rem = workspaces.filter(w => w.id !== id);
      setActiveWorkspaceId(rem[0]?.id ?? '');
      setActiveRelationshipId(rem[0]?.relationships[0]?.id ?? '');
    }
  };

  const handleDocumentUploaded = async (newDoc: ParsedDocument) => {
    setIsProcessing(true);
    setProcessingMsg(`Extracting & verifying claims from ${newDoc.name}…`);
    try {
      const newFacts = await extractFactsFromDocument(newDoc, apiKey, apiProvider);
      newDoc.extractedFacts = newFacts;
      const updatedFacts = [...facts, ...newFacts];
      // Incremental Ingestion — reconcile ONLY new claims against existing claims
      const updatedRels = reconcileIncremental(newFacts, facts, relationships);
      updateWorkspace(activeWorkspaceId, {
        documents: [...documents, newDoc],
        facts: updatedFacts,
        relationships: updatedRels
      });
      const latest = updatedRels[updatedRels.length - 1];
      if (latest) setActiveRelationshipId(latest.id);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
    }
  };

  const handleExportJson = () => {
    const a = document.createElement('a');
    a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ workspace: activeWorkspace }, null, 2));
    a.download = `${activeWorkspace.name.replace(/\s+/g, '_')}_export.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const tabMeta = TAB_META[activeTab];
  const isEmpty = documents.length === 0;

  return (
    <div className="flex min-h-screen bg-[#FAFBFB] text-[#2B2B2B]">
      <Sidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSwitchWorkspace={handleSwitchWorkspace}
        onCreateWorkspace={() => setIsNewWsOpen(true)}
        onDeleteWorkspace={handleDeleteWorkspace}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUploadClick={() => setActiveTab('ingestion')}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={`${activeWorkspace.emoji} ${activeWorkspace.name} — ${tabMeta.title}`}
          subtitle={tabMeta.subtitle}
          onExportJson={handleExportJson}
          onResetStarterData={() => {}}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isCustomKeyActive={apiKey.trim().length > 5}
          relationshipCount={relationships.length}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Global processing overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
              >
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <div className="text-[15px] font-semibold text-[#374151] text-center max-w-sm">
                  {processingMsg || 'Processing…'}
                </div>
                <div className="text-[13px] text-[#9CA3AF]">This may take a moment for large PDFs</div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Overview */}
            {activeTab === 'overview' && (
              <motion.div key={`ov-${activeWorkspaceId}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                {isEmpty
                  ? <EmptyWorkspacePrompt
                      workspaceName={activeWorkspace.name}
                      emoji={activeWorkspace.emoji}
                      onGoToUpload={() => setActiveTab('ingestion')}
                    />
                  : <OverviewPanel
                      documents={documents} facts={facts} relationships={relationships}
                      activeRelationship={activeRelationship ?? relationships[0]}
                      onSelectCase={id => setActiveRelationshipId(id)}
                      onInspectEvidence={rel => setSpotlightRel(rel)}
                      onSelectRelationship={rel => { setActiveRelationshipId(rel.id); setSpotlightRel(rel); }}
                    />
                }
              </motion.div>
            )}

            {/* Document View */}
            {activeTab === 'document_view' && (
              <motion.div key={`dv-${activeWorkspaceId}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <DocumentView
                  documents={documents}
                  facts={facts}
                />
              </motion.div>
            )}

            {/* Showcase */}
            {activeTab === 'showcase' && (
              <motion.div key={`sc-${activeWorkspaceId}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <ShowcasePanel
                  relationships={relationships}
                  onInspectEvidence={rel => setSpotlightRel(rel)}
                />
              </motion.div>
            )}

            {/* Ingestion */}
            {activeTab === 'ingestion' && (
              <motion.div key={`in-${activeWorkspaceId}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
                className="p-6 space-y-5">
                {documents.length > 0 && (
                  <div className="rounded-2xl border border-[#E5E5E9] bg-white p-5 shadow-sm">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">
                      Documents in {activeWorkspace.emoji} {activeWorkspace.name} ({documents.length})
                    </h2>
                    <div className="space-y-2">
                      {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E5E9]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-emerald-700">PDF</span>
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[#111111]">{doc.name}</div>
                              <div className="text-[12px] text-[#9CA3AF]">
                                {doc.pageCount} pages · {doc.extractedFacts.length} facts · {doc.uploadedAt}
                              </div>
                            </div>
                          </div>
                          {doc.fileSize && (
                            <span className="text-[12px] font-mono text-[#6B7280] bg-white px-2.5 py-1 rounded-full border border-[#E5E5E9]">
                              {doc.fileSize}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <PdfUploadZone onDocumentUploaded={handleDocumentUploaded} isProcessing={isProcessing} />
              </motion.div>
            )}

            {/* Matrix */}
            {activeTab === 'matrix' && (
              <motion.div key={`mx-${activeWorkspaceId}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
                className="p-6">
                <FactMatrix facts={facts} relationships={relationships}
                  onSelectRelationship={rel => { setActiveRelationshipId(rel.id); setSpotlightRel(rel); }} />
              </motion.div>
            )}

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <motion.div key={`tl-${activeWorkspaceId}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
                className="p-6">
                <FactTimeline facts={facts} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="border-t border-[#E5E5E9] bg-white px-6 py-3 text-[11px] text-[#9CA3AF] font-medium">
          Fact Knowledge Layer · Superjoin Engineering Intern Assignment · Vite + React + TypeScript
        </footer>
      </div>

      <EvidenceSpotlightModal relationship={spotlightRel} onClose={() => setSpotlightRel(null)} />
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKey={(key, provider) => { setApiKey(key); setApiProvider(provider); }}
        currentKey={apiKey}
        currentProvider={apiProvider}
      />
      <NewWorkspaceModal
        isOpen={isNewWsOpen}
        onClose={() => setIsNewWsOpen(false)}
        onCreate={handleCreateWorkspace}
      />
    </div>
  );
}

// ---------- Empty state prompt ----------
const EmptyWorkspacePrompt: React.FC<{
  workspaceName: string;
  emoji: string;
  onGoToUpload: () => void;
}> = ({ workspaceName, emoji, onGoToUpload }) => (
  <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
    <div className="text-6xl mb-5">{emoji}</div>
    <h2 className="text-[20px] font-bold text-[#111111] mb-2">{workspaceName}</h2>
    <p className="text-[14px] text-[#6B7280] max-w-sm mb-8 leading-relaxed">
      This workspace is currently empty. Upload PDF documents to extract, ground, and reconcile financial facts.
    </p>

    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      <button
        onClick={onGoToUpload}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-semibold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition"
      >
        <Upload className="w-4 h-4" />
        Upload PDF Documents
      </button>
    </div>
  </div>
);

export default App;
