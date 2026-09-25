import React, { useState } from 'react';
import { 
  RotateCcw, 
  RotateCw, 
  Cloud, 
  Upload, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Settings, 
  HelpCircle, 
  Keyboard, 
  User,
  Home,
  ArrowLeft
} from 'lucide-react';
import { Project } from '../../types';

interface TopNavProps {
  project: Project;
  onUpdateProjectName: (name: string) => void;
  onUpdateResolution: (res: '720p' | '1080p' | '1440p' | '4K') => void;
  onUpdateFps: (fps: 24 | 25 | 30 | 50 | 60) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  onGoHome?: () => void;
}

export default function TopNav({
  project,
  onUpdateProjectName,
  onUpdateResolution,
  onUpdateFps,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenExport,
  onOpenShortcuts,
  onGoHome,
}: TopNavProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.name);
  const [showResMenu, setShowResMenu] = useState(false);
  const [showFpsMenu, setShowFpsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const resolutions: ('720p' | '1080p' | '1440p' | '4K')[] = ['720p', '1080p', '1440p', '4K'];
  const frameRates: (24 | 25 | 30 | 50 | 60)[] = [24, 25, 30, 50, 60];

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onUpdateProjectName(tempTitle.trim());
    } else {
      setTempTitle(project.name);
    }
  };

  return (
    <header className="h-14 bg-[#090D1C] border-b border-white/8 px-4 flex items-center justify-between select-none z-30 shrink-0">
      
      {/* Left: Logo & Brand + Home Nav */}
      <div className="flex items-center gap-3 min-w-[200px]">
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-white/8"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span className="hidden sm:inline">Home</span>
          </button>
        )}

        <div onClick={onGoHome} className="flex items-center gap-2 cursor-pointer group">
          {/* Stylized Modern VEdit Vector Logo */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#3B82F6] p-[1.5px] shadow-lg shadow-purple-900/30 group-hover:shadow-purple-700/50 transition-all flex items-center justify-center">
            <div className="w-full h-full bg-[#090D1C] rounded-[7px] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current text-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l8 16 8-16" className="text-white" />
                <path d="M12 20l3-6h-6l3 6" className="text-[#38BDF8]" fill="#38BDF8" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-white">VEdit</span>
            <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40">
              Pro
            </span>
          </div>
        </div>
      </div>

      {/* Center: Editable Project Title & Autosave Status */}
      <div className="flex items-center gap-3">
        {isEditingTitle ? (
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
            className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0D1224] border border-[#7C3AED] rounded-md outline-none text-center min-w-[180px]"
          />
        ) : (
          <button
            onClick={() => {
              setTempTitle(project.name);
              setIsEditingTitle(true);
            }}
            className="text-xs font-semibold text-slate-200 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Click to rename project"
          >
            <span>{project.name}</span>
          </button>
        )}

        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-white/4 px-2 py-0.5 rounded-full border border-white/5">
          <Cloud className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-300 font-medium">Saved</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Right: History, Settings, Resolution, FPS, Export, Profile */}
      <div className="flex items-center gap-2.5 min-w-[280px] justify-end">
        
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#0D1224] rounded-lg p-0.5 border border-white/8 mr-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed rounded hover:bg-white/5 transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed rounded hover:bg-white/5 transition-colors cursor-pointer"
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shortcuts Cheat Sheet Icon */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          title="Keyboard Shortcuts (Press ?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Resolution Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowResMenu(!showResMenu);
              setShowFpsMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-[#0D1224] hover:bg-white/5 rounded-lg border border-white/8 transition-colors cursor-pointer"
          >
            <span>{project.resolution || '1080p'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showResMenu && (
            <div className="absolute top-full right-0 mt-1 w-28 bg-[#0D1224] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in">
              <div className="text-[10px] uppercase font-bold text-slate-500 px-2.5 py-1">Resolution</div>
              {resolutions.map((res) => (
                <button
                  key={res}
                  onClick={() => {
                    onUpdateResolution(res);
                    setShowResMenu(false);
                  }}
                  className={`w-full px-2.5 py-1 text-xs text-left flex items-center justify-between cursor-pointer ${
                    project.resolution === res ? 'text-[#A78BFA] font-bold bg-[#7C3AED]/15' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{res}</span>
                  {project.resolution === res && <Check className="w-3 h-3 text-[#A78BFA]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FPS Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFpsMenu(!showFpsMenu);
              setShowResMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-[#0D1224] hover:bg-white/5 rounded-lg border border-white/8 transition-colors cursor-pointer"
          >
            <span>{project.fps || 60} fps</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showFpsMenu && (
            <div className="absolute top-full right-0 mt-1 w-28 bg-[#0D1224] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in">
              <div className="text-[10px] uppercase font-bold text-slate-500 px-2.5 py-1">Frame Rate</div>
              {frameRates.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    onUpdateFps(f);
                    setShowFpsMenu(false);
                  }}
                  className={`w-full px-2.5 py-1 text-xs text-left flex items-center justify-between cursor-pointer ${
                    project.fps === f ? 'text-[#A78BFA] font-bold bg-[#7C3AED]/15' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{f} fps</span>
                  {project.fps === f && <Check className="w-3 h-3 text-[#A78BFA]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Export Button */}
        <button
          onClick={onOpenExport}
          className="btn-vedit-primary px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 p-[1.5px] cursor-pointer hover:ring-2 hover:ring-purple-400/50 transition-all"
          >
            <div className="w-full h-full rounded-full bg-[#0D1224] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                alt="User profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <User className="w-4 h-4 text-purple-300" />
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-48 bg-[#0D1224] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-300 animate-in fade-in">
              <div className="px-3 py-2 border-b border-white/8">
                <p className="font-bold text-white text-xs">VEdit Creator Pro</p>
                <p className="text-[11px] text-slate-400">creator@vedit.pro</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-3 py-1.5 text-left hover:bg-white/5 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Pro Cloud Storage (48.2 GB / 100 GB)</span>
                </button>
                <button 
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-3 py-1.5 text-left hover:bg-white/5 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Preferences</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
