import React from 'react';
import { Type, Plus, Sparkles } from 'lucide-react';
import { TextClip, TextAnimationStyle } from '../../types';

interface TextLibraryProps {
  onAddTextClip: (clip: Omit<TextClip, 'id'>) => void;
}

interface TextPreset {
  id: string;
  name: string;
  text: string;
  category: 'Cinematic' | 'Titles' | 'Lower Thirds' | 'Neon' | 'Subtitles';
  color: string;
  fontSize: number;
  fontFamily: string;
  style: 'regular' | 'neon' | 'bordered' | 'glitch' | 'cinematic_lower_third' | 'badge';
  animation: TextAnimationStyle;
  backgroundColor?: string;
  previewClass: string;
}

const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'cinematic_title',
    name: 'Cinematic Journey',
    text: 'CINEMATIC JOURNEY',
    category: 'Cinematic',
    color: '#F8FAFC',
    fontSize: 48,
    fontFamily: 'Plus Jakarta Sans',
    style: 'regular',
    animation: 'cinematic',
    previewClass: 'font-extrabold tracking-widest text-white uppercase',
  },
  {
    id: 'cyber_neon',
    name: 'Cyberpunk Neon',
    text: 'NEO TOKYO 2099',
    category: 'Neon',
    color: '#00FFFF',
    fontSize: 44,
    fontFamily: 'JetBrains Mono',
    style: 'neon',
    animation: 'pop',
    previewClass: 'font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_#00ffff]',
  },
  {
    id: 'lower_third',
    name: 'Broadcast Lower Third',
    text: 'DIRECTOR / PRODUCER',
    category: 'Lower Thirds',
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Plus Jakarta Sans',
    style: 'cinematic_lower_third',
    animation: 'slide',
    backgroundColor: 'rgba(124, 58, 237, 0.75)',
    previewClass: 'text-xs font-bold text-white bg-purple-600/80 px-2 py-0.5 rounded',
  },
  {
    id: 'typewriter',
    name: 'Typewriter Minimal',
    text: 'The story begins here...',
    category: 'Titles',
    color: '#F8FAFC',
    fontSize: 32,
    fontFamily: 'JetBrains Mono',
    style: 'regular',
    animation: 'typewriter',
    previewClass: 'font-mono text-sm text-slate-300',
  },
  {
    id: 'gold_glitch',
    name: 'Glitch Impact',
    text: 'VELOCITY DROP',
    category: 'Titles',
    color: '#F59E0B',
    fontSize: 46,
    fontFamily: 'Plus Jakarta Sans',
    style: 'glitch',
    animation: 'scale',
    previewClass: 'font-black text-amber-400 tracking-wider',
  },
  {
    id: 'subtitle_badge',
    name: 'Social Subtitle Pill',
    text: 'Subscribe for weekly episodes',
    category: 'Subtitles',
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Plus Jakarta Sans',
    style: 'badge',
    animation: 'fade',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    previewClass: 'text-xs font-semibold text-white bg-slate-900/90 px-3 py-1 rounded-full border border-white/10',
  },
];

export default function TextLibrary({ onAddTextClip }: TextLibraryProps) {
  const handleAdd = (preset: TextPreset) => {
    onAddTextClip({
      name: preset.name,
      type: 'text',
      startTime: 0,
      duration: 5,
      text: preset.text,
      color: preset.color,
      fontSize: preset.fontSize,
      fontFamily: preset.fontFamily,
      positionX: 50,
      positionY: preset.category === 'Lower Thirds' ? 80 : 50,
      opacity: 100,
      style: preset.style,
      animation: preset.animation,
      backgroundColor: preset.backgroundColor,
      trackId: 't1',
    });
  };

  return (
    <div className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0">
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-[#A78BFA]" />
          <h2 className="text-sm font-bold text-white">Text & Titles</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {TEXT_PRESETS.map((preset) => (
          <div
            key={preset.id}
            onClick={() => handleAdd(preset)}
            className="p-3 bg-[#0D1224] rounded-xl border border-white/8 hover:border-[#7C3AED]/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all cursor-pointer flex flex-col gap-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {preset.name}
              </span>
              <button 
                className="p-1 rounded-md bg-white/5 group-hover:bg-[#7C3AED] text-slate-400 group-hover:text-white transition-all"
                title="Add Text to Timeline"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-12 bg-black/40 rounded-lg flex items-center justify-center p-2 border border-white/5">
              <span className={preset.previewClass}>{preset.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
