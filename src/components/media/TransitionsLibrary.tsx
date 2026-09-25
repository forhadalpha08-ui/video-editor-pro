import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { TransitionType } from '../../types';

interface TransitionsLibraryProps {
  onSelectTransition: (type: TransitionType) => void;
}

interface TransitionItem {
  id: TransitionType;
  name: string;
  category: 'Basic' | 'Cinematic' | 'Glitch' | 'Light';
  duration: number;
}

const TRANSITIONS: TransitionItem[] = [
  { id: 'cross_dissolve', name: 'Cross Dissolve', category: 'Basic', duration: 0.8 },
  { id: 'fade_black', name: 'Dip to Black', category: 'Basic', duration: 0.6 },
  { id: 'fade_white', name: 'Dip to White', category: 'Basic', duration: 0.5 },
  { id: 'slide_left', name: 'Slide Push Left', category: 'Cinematic', duration: 0.7 },
  { id: 'slide_right', name: 'Slide Push Right', category: 'Cinematic', duration: 0.7 },
  { id: 'zoom_blur', name: 'Cross Zoom Blur', category: 'Cinematic', duration: 0.6 },
  { id: 'glitch', name: 'Cyber Glitch Warp', category: 'Glitch', duration: 0.5 },
  { id: 'light_leak', name: 'Light Leak Flare', category: 'Light', duration: 0.9 },
  { id: 'clock_wipe', name: 'Clock Radial Wipe', category: 'Basic', duration: 0.8 },
  { id: 'ripple', name: 'Water Ripple', category: 'Cinematic', duration: 0.7 },
];

export default function TransitionsLibrary({ onSelectTransition }: TransitionsLibraryProps) {
  return (
    <div className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0">
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#A78BFA]" />
          <h2 className="text-sm font-bold text-white">Transitions</h2>
        </div>
      </div>

      <div className="p-3 text-[11px] text-slate-400 border-b border-white/8 bg-[#0D1224]/40">
        Click to apply transition to selected cut or drag between timeline clips.
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5">
        {TRANSITIONS.map((trans) => (
          <div
            key={trans.id}
            onClick={() => onSelectTransition(trans.id)}
            className="p-3 bg-[#0D1224] rounded-xl border border-white/8 hover:border-[#7C3AED]/60 hover:shadow-lg hover:shadow-purple-900/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group"
          >
            <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-[#7C3AED]/20 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
                {trans.name}
              </span>
              <span className="text-[10px] text-slate-500">{trans.duration}s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
