import React from 'react';
import { Download, RefreshCw, Key, FileCheck, Bell } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle: string;
  onExportJson: () => void;
  onResetStarterData: () => void;
  onOpenSettings: () => void;
  isCustomKeyActive: boolean;
  relationshipCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  title, subtitle, onExportJson, onResetStarterData, onOpenSettings,
  isCustomKeyActive, relationshipCount
}) => (
  <div className="bg-[#0F172A] border-b border-[#1E293B] px-6 py-4 flex items-center justify-between gap-4 text-slate-100">
    <div>
      <h1 className="text-[16px] font-bold text-slate-100 leading-tight">{title}</h1>
      <p className="text-[13px] text-slate-400 mt-0.5 leading-snug">{subtitle}</p>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={onResetStarterData}
        className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
      >
        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
        Reset Demo
      </button>

      <button
        onClick={onExportJson}
        className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
      >
        <Download className="w-3.5 h-3.5 text-slate-400" />
        Export JSON
      </button>

      <button
        onClick={onOpenSettings}
        className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl transition border ${
          isCustomKeyActive
            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
        }`}
      >
        {isCustomKeyActive
          ? <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          : <Key className="w-3.5 h-3.5 text-slate-400" />}
        {isCustomKeyActive ? 'API Active' : 'API Key'}
      </button>

      <div className="relative ml-1">
        <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-slate-300">
          <Bell className="w-4 h-4" />
        </button>
        {relationshipCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
            {relationshipCount > 9 ? '9+' : relationshipCount}
          </span>
        )}
      </div>
    </div>
  </div>
);
