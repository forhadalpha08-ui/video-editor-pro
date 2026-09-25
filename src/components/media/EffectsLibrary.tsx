import React from 'react';
import { Wand2, Sparkles, Plus } from 'lucide-react';
import { VideoEffectType } from '../../types';

interface EffectsLibraryProps {
  onApplyEffect: (effect: VideoEffectType) => void;
}

interface EffectItem {
  id: VideoEffectType;
  name: string;
  category: 'Cinematic' | 'Retro' | 'Glitch' | 'Lens';
  iconColor: string;
}

const EFFECTS: EffectItem[] = [
  { id: 'cinema_glow', name: 'Cinematic Anamorphic Glow', category: 'Cinematic', iconColor: '#38BDF8' },
  { id: 'glitch', name: 'RGB Cyber Glitch', category: 'Glitch', iconColor: '#EC4899' },
  { id: 'vhs', name: '1980s Retro VHS Tape', category: 'Retro', iconColor: '#A855F7' },
  { id: 'film_grain', name: '35mm Film Grain', category: 'Cinematic', iconColor: '#F59E0B' },
  { id: 'rgb_split', name: 'Chromatic Aberration', category: 'Glitch', iconColor: '#06B6D4' },
  { id: 'bloom', name: 'HDR Soft Bloom', category: 'Cinematic', iconColor: '#60A5FA' },
  { id: 'light_leak', name: 'Golden Hour Flare', category: 'Lens', iconColor: '#FBBF24' },
  { id: 'blur', name: 'Motion Speed Blur', category: 'Lens', iconColor: '#A78BFA' },
];

export default function EffectsLibrary({ onApplyEffect }: EffectsLibraryProps) {
  return (
    <div className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0">
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-[#A78BFA]" />
          <h2 className="text-sm font-bold text-white">Visual Effects</h2>
        </div>
      </div>

      <div className="p-3 text-[11px] text-slate-400 border-b border-white/8 bg-[#0D1224]/40">
        Click to apply visual FX to the currently selected video clip.
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5">
        {EFFECTS.map((effect) => (
          <div
            key={effect.id}
            onClick={() => onApplyEffect(effect.id)}
            className="p-3 bg-[#0D1224] rounded-xl border border-white/8 hover:border-[#7C3AED]/60 hover:shadow-lg hover:shadow-purple-900/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group"
          >
            <div 
              className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all"
              style={{ color: effect.iconColor }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
                {effect.name}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{effect.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
