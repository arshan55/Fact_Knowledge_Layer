import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, LayoutDashboard, FileText, Table, Clock,
  Plus, Trash2, CheckCircle2, Upload, Sparkles
} from 'lucide-react';
import { Workspace } from '../types/fact';

interface SidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (id: string) => void;
  onCreateWorkspace: () => void;
  onDeleteWorkspace: (id: string) => void;
  activeTab: 'overview' | 'document_view' | 'showcase' | 'ingestion' | 'matrix' | 'timeline';
  setActiveTab: (tab: 'overview' | 'document_view' | 'showcase' | 'ingestion' | 'matrix' | 'timeline') => void;
  onUploadClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspaces, activeWorkspaceId, onSwitchWorkspace, onCreateWorkspace,
  onDeleteWorkspace, activeTab, setActiveTab, onUploadClick
}) => {
  const [hoveredWs, setHoveredWs] = useState<string | null>(null);
  const activeWs = workspaces.find(w => w.id === activeWorkspaceId)!;

  const navItems = [
    { id: 'overview',      label: 'Dashboard',      icon: LayoutDashboard },
    { id: 'document_view', label: 'Document View',  icon: FileText, badge: `${activeWs?.documents.length ?? 0}` },
    { id: 'showcase',      label: '4 Showcase Cases', icon: Sparkles },
    { id: 'ingestion',     label: 'Document Hub',   icon: Upload },
    { id: 'matrix',        label: 'Fact Matrix',    icon: Table, badge: `${activeWs?.facts.length ?? 0}` },
    { id: 'timeline',      label: 'Timeline',       icon: Clock },
  ];

  return (
    <aside className="w-[240px] bg-[#0F172A] border-r border-[#1E293B] flex flex-col shrink-0 min-h-screen text-slate-200">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-[#1E293B] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950 shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-slate-100 leading-tight">Fact Layer</div>
          <div className="text-[11px] text-slate-400 leading-tight">Knowledge Grounding</div>
        </div>
      </div>

      {/* Upload button */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onUploadClick}
          className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-950 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload PDF
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 py-2 border-b border-[#1E293B]">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Views</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-0.5 ${
                isActive
                  ? 'bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-800/60'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {item.label}
              </div>
              {item.badge && (
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Workspaces */}
      <div className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workspaces</span>
          <button
            onClick={onCreateWorkspace}
            className="w-5 h-5 rounded-full bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 flex items-center justify-center transition"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-0.5">
          <AnimatePresence>
            {workspaces.map(ws => {
              const isActive = ws.id === activeWorkspaceId;
              return (
                <motion.div
                  key={ws.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  onMouseEnter={() => setHoveredWs(ws.id)}
                  onMouseLeave={() => setHoveredWs(null)}
                  onClick={() => onSwitchWorkspace(ws.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{ws.emoji}</span>
                    <div className="min-w-0">
                      <div className={`text-[13px] font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                        {ws.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ws.documents.length} doc{ws.documents.length !== 1 ? 's' : ''} · {ws.facts.length} facts
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {!ws.isDemo && hoveredWs === ws.id && !isActive && (
                      <button
                        onClick={e => { e.stopPropagation(); onDeleteWorkspace(ws.id); }}
                        className="p-1 rounded-lg hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Engine Status */}
      <div className="p-3">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Engine</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Active
            </span>
          </div>
          <div className="text-[12px] text-slate-400">Offline heuristic AI engine</div>
        </div>
      </div>
    </aside>
  );
};
