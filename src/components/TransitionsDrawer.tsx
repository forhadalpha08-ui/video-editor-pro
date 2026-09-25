import React, { useState } from 'react';
import { Sparkles, Sliders, Search, X } from 'lucide-react';
import { TransitionType } from '../types';

interface TransitionsDrawerProps {
  transitionId: string;
  activeType: TransitionType;
  duration: number;
  onUpdateType: (type: TransitionType) => void;
  onUpdateDuration: (duration: number) => void;
  onClose: () => void;
}

interface TransitionItem {
  id: TransitionType;
  name: string;
  desc: string;
  icon: string;
  category: 'dissolve' | 'motion' | 'fade' | 'warp';
}

const TRANSITIONS: TransitionItem[] = [
  { id: 'none', name: 'Cut (None)', desc: 'Abrupt instantaneous cut', icon: '｜', category: 'dissolve' },
  { id: 'cross_dissolve', name: 'Cross Dissolve', desc: 'Graceful overlay fade transition', icon: '⋈', category: 'dissolve' },
  { id: 'slide_left', name: 'Slide Left', desc: 'Horizontal motion push transition', icon: '→', category: 'motion' },
  { id: 'slide_up', name: 'Slide Up', desc: 'Vertical motion sweep transition', icon: '↑', category: 'motion' },
  { id: 'dip_black', name: 'Dip to Black', desc: 'Fades out to black and back in', icon: '■', category: 'fade' },
  { id: 'dip_white', name: 'Dip to White', desc: 'Fades out to flash white and back in', icon: '□', category: 'fade' },
  { id: 'zoom_blur', name: 'Zoom Blur', desc: 'Dynamic focal zoom with motion blur', icon: '☉', category: 'warp' },
  { id: 'clock_wipe', name: 'Clock Wipe', desc: 'Clockwise rotational screen reveal', icon: '↻', category: 'warp' },
  { id: 'ripple', name: 'Ripple Warp', desc: 'Water ripple displacement wave effect', icon: '≋', category: 'warp' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Effects' },
  { id: 'dissolve', label: 'Dissolves' },
  { id: 'motion', label: 'Motion' },
  { id: 'fade', label: 'Fades' },
  { id: 'warp', label: 'Wipes / Warps' },
];

export default function TransitionsDrawer({
  transitionId,
  activeType,
  duration,
  onUpdateType,
  onUpdateDuration,
  onClose,
}: TransitionsDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter transitions based on Search Query and Category selection
  const filteredTransitions = TRANSITIONS.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        type="button"
      >
        <X className="w-4 h-4" />
      </button>

      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Transition Settings</span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">
          Apply professional cinematic transition styles at clip boundaries.
        </p>
      </div>

      {/* Transition Speed Config */}
      <div className="flex flex-col gap-1 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1 font-semibold">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Transition Duration</span>
          </span>
          <span className="font-mono text-indigo-400 font-semibold">{duration.toFixed(1)}s</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="3.0"
          step="0.1"
          value={duration}
          onChange={(e) => onUpdateDuration(Number(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-0.5">
          <span>0.2s (Fast)</span>
          <span>3.0s (Slow)</span>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter effects by name or keyword..."
          className="w-full bg-slate-950/70 border border-slate-850 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/35 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2 text-slate-500 hover:text-slate-350 text-[10px] font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-1.5 overflow-x-auto select-none scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 text-[9.5px] font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-850/45'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of options */}
      <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
        {filteredTransitions.map((t) => (
          <button
            key={t.id}
            onClick={() => onUpdateType(t.id)}
            className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
              activeType === t.id
                ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                : 'bg-slate-950/30 border-slate-800 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold font-mono text-indigo-400 shrink-0">
              {t.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-slate-200 truncate leading-tight">{t.name}</span>
              <span className="text-[9px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">{t.desc}</span>
            </div>
          </button>
        ))}
        {filteredTransitions.length === 0 && (
          <div className="col-span-2 text-center py-6 text-slate-500 text-[10.5px]">
            No transitions match your filters. Try resetting search or categories.
          </div>
        )}
      </div>
    </div>
  );
}
