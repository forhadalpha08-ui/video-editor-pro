import React from 'react';
import { Settings, Shield, HardDrive, Cpu, RefreshCw } from 'lucide-react';
import { Project } from '../../types';

interface SettingsPanelProps {
  project: Project;
  onClearCache: () => void;
}

export default function SettingsPanel({ project, onClearCache }: SettingsPanelProps) {
  return (
    <div className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0">
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-white">Project Settings</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-4 text-xs text-slate-300">
        
        {/* Playback & GPU */}
        <div className="flex flex-col gap-2 p-3 bg-[#0D1224] rounded-xl border border-white/8">
          <div className="flex items-center gap-2 text-white font-bold text-[11px] uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Hardware Acceleration</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-400">WebGL 2.0 / GPU Canvas</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">Active</span>
          </div>
        </div>

        {/* Cache Management */}
        <div className="flex flex-col gap-2 p-3 bg-[#0D1224] rounded-xl border border-white/8">
          <div className="flex items-center gap-2 text-white font-bold text-[11px] uppercase tracking-wider">
            <HardDrive className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Media Cache</span>
          </div>
          <p className="text-[11px] text-slate-400">In-memory buffer size: 124.8 MB</p>
          <button
            onClick={onClearCache}
            className="mt-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear Timeline Cache</span>
          </button>
        </div>

      </div>
    </div>
  );
}
