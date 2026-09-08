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
  <div className="bg-white border-b border-[#E5E5E9] px-6 py-4 flex items-center justify-between gap-4">
    <div>
      <h1 className="text-[16px] font-bold text-[#111111] leading-tight">{title}</h1>
      <p className="text-[13px] text-[#6B7280] mt-0.5 leading-snug">{subtitle}</p>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={onResetStarterData}
        className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl text-[#4B5563] bg-[#F4F4FB] hover:bg-[#EBEBEB] transition border border-[#E5E5E9]"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reset Demo
      </button>

      <button
        onClick={onExportJson}
        className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl text-[#4B5563] bg-[#F4F4FB] hover:bg-[#EBEBEB] transition border border-[#E5E5E9]"
      >
        <Download className="w-3.5 h-3.5" />
        Export JSON
      </button>

      <button
        onClick={onOpenSettings}
        className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl transition border ${
          isCustomKeyActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-[#F4F4FB] text-[#4B5563] border-[#E5E5E9] hover:bg-[#EBEBEB]'
        }`}
      >
        {isCustomKeyActive
          ? <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          : <Key className="w-3.5 h-3.5" />}
        {isCustomKeyActive ? 'API Active' : 'API Key'}
      </button>

      <div className="relative ml-1">
        <button className="p-2 rounded-xl bg-[#F4F4FB] hover:bg-[#EBEBEB] border border-[#E5E5E9] transition text-[#6B7280]">
          <Bell className="w-4 h-4" />
        </button>
        {relationshipCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {relationshipCount > 9 ? '9+' : relationshipCount}
          </span>
        )}
      </div>
    </div>
  </div>
);
