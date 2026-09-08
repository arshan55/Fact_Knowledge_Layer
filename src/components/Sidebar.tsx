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
    <aside className="w-[240px] bg-white border-r-[1.6px] border-[#E5E5E9] flex flex-col shrink-0 min-h-screen">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-[#E5E5E9] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-[#111111] leading-tight">Fact Layer</div>
          <div className="text-[11px] text-[#9CA3AF] leading-tight">Superjoin Assignment</div>
        </div>
      </div>

      {/* Upload button */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onUploadClick}
          className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload PDF
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 py-2 border-b border-[#E5E5E9]">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">Views</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-0.5 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-[#4B5563] hover:bg-[#F4F4FB] hover:text-[#111111]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-[#9CA3AF]'}`} />
                {item.label}
              </div>
              {item.badge && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-200/60 text-emerald-800' : 'bg-[#F0F0F0] text-[#6B7280]'
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
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">Workspaces</span>
          <button
            onClick={onCreateWorkspace}
            className="w-5 h-5 rounded-full bg-emerald-100 hover:bg-emerald-500 hover:text-white text-emerald-600 flex items-center justify-center transition"
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
                    isActive ? 'bg-[#F4F4FB] border border-[#E5E5E9]' : 'hover:bg-[#F9F9F9]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{ws.emoji}</span>
                    <div className="min-w-0">
                      <div className={`text-[13px] font-semibold truncate ${isActive ? 'text-[#111111]' : 'text-[#374151]'}`}>
                        {ws.name}
                      </div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        {ws.documents.length} doc{ws.documents.length !== 1 ? 's' : ''} · {ws.facts.length} facts
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {!ws.isDemo && hoveredWs === ws.id && !isActive && (
                      <button
                        onClick={e => { e.stopPropagation(); onDeleteWorkspace(ws.id); }}
                        className="p-1 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition"
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
        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E5E9]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">Engine</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Active
            </span>
          </div>
          <div className="text-[12px] text-[#6B7280]">Offline heuristic AI · 0 API calls</div>
        </div>
      </div>
    </aside>
  );
};
