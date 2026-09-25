import React, { useState } from 'react';
import {
  Film,
  Music,
  Type,
  Sparkles,
  Sliders,
  Scissors,
  Layers,
  Wand2,
  Plus,
  Play,
  Volume2,
  VolumeX,
  RotateCw,
  FlipHorizontal,
  Zap,
  Check,
  Download,
  Mic,
  Smile,
  Clock,
  Trash2,
  Copy,
  ChevronRight,
  Sun,
  Palette
} from 'lucide-react';
import {
  Project,
  VideoClip,
  AudioClip,
  TextClip,
  VideoEffectType,
  TextAnimationStyle,
  ProceduralType
} from '../types';
import { getAssetUrl } from '../utils/assetUrl';
import { audioSynth } from '../utils/audioSynthesizer';

interface CapCutEditorStudioProps {
  project: Project;
  currentTime: number;
  selectedClip: VideoClip | AudioClip | TextClip | null;
  onUpdateVideoClip: (clip: VideoClip) => void;
  onUpdateAudioClip: (clip: AudioClip) => void;
  onUpdateTextClip: (clip: TextClip) => void;
  onAddVideoClip: (type: ProceduralType, specificFile?: string) => void;
  onAddAudioClip: (clip: Omit<AudioClip, 'id'>) => void;
  onAddTextClip: (text: string, animation?: TextAnimationStyle, color?: string) => void;
  onUploadFile?: (file: File) => void;
  onSplitSelectedClip: () => void;
  onDeleteSelectedClip: () => void;
  onDuplicateSelectedClip: () => void;
  onOpenExportModal: () => void;
}

const STOCK_VIDEOS = [
  { id: '1.mp4', name: 'Tokyo Neon', category: 'Cyberpunk', duration: '18s', type: 'cyberpunk_grid' as ProceduralType },
  { id: '2.mp4', name: 'Alpine Ridge', category: 'Nature', duration: '24s', type: 'vaporwave_sunset' as ProceduralType },
  { id: '3.mp4', name: 'Speed Drift', category: 'Action', duration: '15s', type: 'geometric_warp' as ProceduralType },
  { id: '4.mp4', name: 'Tech Product', category: 'Commercial', duration: '20s', type: 'cyberpunk_grid' as ProceduralType },
  { id: '5.mp4', name: 'Golden Sunset', category: 'Vlog', duration: '22s', type: 'vaporwave_sunset' as ProceduralType },
  { id: '6.mp4', name: 'Street Fashion', category: 'Lifestyle', duration: '19s', type: 'geometric_warp' as ProceduralType },
  { id: '7.mp4', name: 'Studio Vlog', category: 'Creator', duration: '25s', type: 'nebula_ocean' as ProceduralType },
  { id: '8.mp4', name: 'Action Cinema', category: 'Cinematic', duration: '16s', type: 'geometric_warp' as ProceduralType },
  { id: '9.mp4', name: 'Retro 80s', category: 'Vintage', duration: '18s', type: 'cyberpunk_grid' as ProceduralType },
  { id: '10.mp4', name: 'Film Noir', category: 'Dramatic', duration: '21s', type: 'nebula_ocean' as ProceduralType },
  { id: '11.mp4', name: 'City Hyperlapse', category: 'Urban', duration: '17s', type: 'geometric_warp' as ProceduralType },
  { id: '12.mp4', name: 'Cosmos Space', category: 'Cosmic', duration: '28s', type: 'nebula_ocean' as ProceduralType },
];

const CAPCUT_AUDIO_PRESETS = [
  { id: 'beat_1', name: 'Viral TikTok Phonk Beat', style: 'beat_loop' as const, bpm: 130, duration: 18 },
  { id: 'synth_1', name: 'Retro Synthwave Drift', style: 'synth_wave' as const, bpm: 118, duration: 24 },
  { id: 'ambient_1', name: 'Deep Cinematic Ambient', style: 'ambient_drone' as const, bpm: 85, duration: 30 },
  { id: 'lofi_1', name: 'Cozy Lofi Study Beat', style: 'beat_loop' as const, bpm: 90, duration: 20 },
];

const CAPCUT_SFX_PRESETS = [
  { name: '💨 Camera Whoosh', freq: 440, type: 'whoosh' },
  { name: '📸 Shutter Click', freq: 880, type: 'click' },
  { name: '💥 Cinematic Impact', freq: 110, type: 'boom' },
  { name: '✨ Magical Ding', freq: 1200, type: 'bell' },
  { name: '🔫 Sci-Fi Laser', freq: 650, type: 'laser' },
  { name: '⚡ Vinyl Pop', freq: 320, type: 'pop' }
];

const CAPCUT_TEXT_TEMPLATES = [
  { text: 'VIRAL HOOK TITLE', anim: 'bounce' as TextAnimationStyle, color: '#facc15', bg: 'bg-yellow-400/20 text-yellow-300' },
  { text: '✨ Aesthetic Minimal', anim: 'fade_slide' as TextAnimationStyle, color: '#ffffff', bg: 'bg-white/10 text-white' },
  { text: '⚡ NEON CYBERPUNK', anim: 'neon_pulse' as TextAnimationStyle, color: '#38bdf8', bg: 'bg-cyan-500/20 text-cyan-300' },
  { text: '🔥 SPEED RAMP GLITCH', anim: 'glitch_shake' as TextAnimationStyle, color: '#f43f5e', bg: 'bg-pink-500/20 text-pink-300' },
  { text: '🎙️ Clean Subtitle Line', anim: 'typewriter' as TextAnimationStyle, color: '#34d399', bg: 'bg-emerald-500/20 text-emerald-300' },
];

const CAPCUT_LUTS = [
  { id: 'teal_orange', name: 'Teal & Orange (Blockbuster)', bg: 'from-amber-600 to-cyan-700' },
  { id: 'cyberpunk', name: 'Cyberpunk (Neon Glow)', bg: 'from-pink-600 to-purple-800' },
  { id: 'warm_gold', name: 'Golden Hour (Warm Glow)', bg: 'from-orange-500 to-yellow-600' },
  { id: 'vintage', name: 'Vintage 1970 Film', bg: 'from-yellow-700 to-amber-900' },
  { id: 'monochrome', name: 'Monochrome Noir', bg: 'from-slate-600 to-slate-900' },
  { id: 'none', name: 'Natural (No Filter)', bg: 'from-slate-700 to-slate-800' },
];

export default function CapCutEditorStudio({
  project,
  currentTime,
  selectedClip,
  onUpdateVideoClip,
  onUpdateAudioClip,
  onUpdateTextClip,
  onAddVideoClip,
  onAddAudioClip,
  onAddTextClip,
  onUploadFile,
  onSplitSelectedClip,
  onDeleteSelectedClip,
  onDuplicateSelectedClip,
  onOpenExportModal
}: CapCutEditorStudioProps) {
  const [activeCapCutTab, setActiveCapCutTab] = useState<'media' | 'audio' | 'text' | 'effects' | 'filters' | 'quick_edit'>('media');
  const [customText, setCustomText] = useState('My Awesome Video');
  const [customTextColor, setCustomTextColor] = useState('#ffffff');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const isVideoSelected = selectedClip && selectedClip.type === 'video';
  const isAudioSelected = selectedClip && selectedClip.type === 'audio';
  const isTextSelected = selectedClip && selectedClip.type === 'text';

  const activeVideoClip = isVideoSelected ? (selectedClip as VideoClip) : null;
  const activeAudioClip = isAudioSelected ? (selectedClip as AudioClip) : null;
  const activeTextClip = isTextSelected ? (selectedClip as TextClip) : null;

  return (
    <div className="flex flex-col bg-[#04081c]/90 border border-indigo-500/20 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl select-none animate-in fade-in">
      
      {/* 1. CapCut-Style Top Module Navigation Bar */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 bg-[#020410]/80 px-3 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'media', label: 'Media', icon: Film, count: '12 Stock' },
            { id: 'audio', label: 'Audio', icon: Music, count: 'Music/SFX' },
            { id: 'text', label: 'Text', icon: Type, count: 'Titles' },
            { id: 'effects', label: 'Effects', icon: Sparkles, count: 'VFX' },
            { id: 'filters', label: 'Filters', icon: Palette, count: 'LUTs' },
            { id: 'quick_edit', label: 'Edit Tools', icon: Sliders, count: selectedClip ? 'Active' : 'Clip' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCapCutTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCapCutTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/40 via-indigo-600/40 to-purple-600/40 border border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {selectedClip && (
            <button
              onClick={onSplitSelectedClip}
              className="p-1.5 bg-slate-900 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg text-slate-300 hover:text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Split Clip at Playhead"
            >
              <Scissors className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Split</span>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-[11px] font-extrabold shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 2. CapCut Tab Contents Area */}
      <div className="p-4 max-h-[380px] overflow-y-auto">
        
        {/* TAB 1: MEDIA (12 Stock Clips + Upload) */}
        {activeCapCutTab === 'media' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white">Stock Video Clips (1-12.mp4)</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-900/50 text-[10px] font-mono text-cyan-300 border border-indigo-500/30">
                  12 4K Assets
                </span>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#0a1030] hover:bg-[#101948] border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Custom</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="video/*,image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onUploadFile) onUploadFile(file);
                }}
              />
            </div>

            {/* 12 Video Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {STOCK_VIDEOS.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-[#060a1d] border border-slate-800 hover:border-indigo-500/60 rounded-xl overflow-hidden p-2 flex flex-col justify-between transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-1.5">
                    <video
                      src={getAssetUrl(item.id)}
                      muted
                      playsInline
                      loop
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[8px] font-mono text-slate-300">
                      {item.duration}
                    </span>
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-indigo-950/80 rounded text-[7.5px] font-bold text-cyan-300 uppercase">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white truncate max-w-[90px]">
                      {item.name}
                    </span>
                    
                    <button
                      onClick={() => onAddVideoClip(item.type, item.id)}
                      className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-transform active:scale-90 cursor-pointer"
                      title="Add to Timeline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIO & SOUND EFFECTS */}
        {activeCapCutTab === 'audio' && (
          <div className="flex flex-col gap-4">
            {/* Music Tracks */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
                <span>Trending Background Music</span>
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAPCUT_AUDIO_PRESETS.map((track) => (
                  <div
                    key={track.id}
                    className="p-3 bg-[#060a1d] border border-slate-850 hover:border-cyan-500/40 rounded-xl flex items-center justify-between gap-3 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{track.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{track.bpm} BPM • {track.duration}s</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onAddAudioClip({
                          name: track.name,
                          type: 'audio',
                          startTime: currentTime,
                          duration: track.duration,
                          sourceStart: 0,
                          volume: 75,
                          audioStyle: track.style
                        });
                      }}
                      className="px-2.5 py-1.5 bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-500/40 text-cyan-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Viral Sound Effects Board */}
            <div className="flex flex-col gap-2 pt-2 border-t border-indigo-500/20">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>1-Click Viral Soundboard FX</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CAPCUT_SFX_PRESETS.map((sfx) => (
                  <button
                    key={sfx.name}
                    onClick={() => {
                      audioSynth.playSFX('impact');
                      onAddAudioClip({
                        name: sfx.name,
                        type: 'audio',
                        startTime: currentTime,
                        duration: 3,
                        sourceStart: 0,
                        volume: 85,
                        audioStyle: 'beat_loop'
                      });
                    }}
                    className="p-2.5 bg-[#070b22] hover:bg-indigo-900/40 border border-indigo-500/20 hover:border-indigo-400 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>{sfx.name}</span>
                    <Plus className="w-3 h-3 text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEXT & VIRAL CAPTIONS */}
        {activeCapCutTab === 'text' && (
          <div className="flex flex-col gap-4">
            {/* Quick Caption Input */}
            <div className="p-3 bg-[#060a1d] rounded-xl border border-indigo-500/20 flex flex-col gap-2.5">
              <span className="text-xs font-extrabold text-indigo-300">Custom Title / Caption</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter title text..."
                  className="flex-1 bg-[#020410] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
                <input
                  type="color"
                  value={customTextColor}
                  onChange={(e) => setCustomTextColor(e.target.value)}
                  className="w-9 h-9 p-1 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
                  title="Text Color"
                />
                <button
                  onClick={() => onAddTextClip(customText, 'bounce', customTextColor)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Trending Template Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-extrabold text-white">Trending CapCut Text Styles</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAPCUT_TEXT_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.text}
                    onClick={() => onAddTextClip(tmpl.text, tmpl.anim, tmpl.color)}
                    className="p-3 bg-[#060a1d] border border-slate-850 hover:border-yellow-400/50 rounded-xl flex items-center justify-between cursor-pointer transition-all group shadow-sm"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-xs font-black tracking-wide ${tmpl.color}`}>
                        {tmpl.text}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Animation: {tmpl.anim}</span>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 group-hover:bg-indigo-600 group-hover:border-indigo-500 flex items-center justify-center text-white transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VISUAL EFFECTS (VFX) */}
        {activeCapCutTab === 'effects' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white">1-Click Trending Visual Effects</span>
              <span className="text-[10px] text-slate-400">Apply to selected clip</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {[
                { id: 'vhs' as VideoEffectType, name: '📼 90s VHS Tape', desc: 'Scanlines & color bleed' },
                { id: 'glitch' as VideoEffectType, name: '⚡ RGB Glitch', desc: 'Cyber displacement' },
                { id: 'cinema_glow' as VideoEffectType, name: '✨ Cinema Glow', desc: 'Soft dreamy bloom' },
                { id: 'film_grain' as VideoEffectType, name: '🎞️ 35mm Grain', desc: 'Authentic film look' },
                { id: 'rgb_split' as VideoEffectType, name: '🌈 Chromatic Split', desc: 'Prismatic refraction' },
                { id: 'bloom' as VideoEffectType, name: '🌟 Golden Bloom', desc: 'Highlights aura' },
                { id: 'anamorphic' as VideoEffectType, name: '🎬 Anamorphic Flare', desc: 'Hollywood blue streak' },
                { id: 'none' as VideoEffectType, name: '🚫 Remove Effect', desc: 'Clean original clip' },
              ].map((fx) => {
                const isCurrent = activeVideoClip?.effect === fx.id;
                return (
                  <button
                    key={fx.id}
                    onClick={() => {
                      if (activeVideoClip) {
                        onUpdateVideoClip({ ...activeVideoClip, effect: fx.id });
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-indigo-900/60 to-purple-900/60 border-indigo-400 text-white shadow-lg ring-1 ring-indigo-400'
                        : 'bg-[#060a1d] border-slate-850 hover:border-indigo-500/40 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{fx.name}</span>
                    <span className="text-[9px] text-slate-400 line-clamp-1">{fx.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: FILTERS & LUTS */}
        {activeCapCutTab === 'filters' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold text-white">1-Click Cinema Color Grading LUTs</span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CAPCUT_LUTS.map((lut) => {
                const isCurrent = activeVideoClip?.colorGrading.lut === lut.id;
                return (
                  <button
                    key={lut.id}
                    onClick={() => {
                      if (activeVideoClip) {
                        onUpdateVideoClip({
                          ...activeVideoClip,
                          colorGrading: {
                            ...activeVideoClip.colorGrading,
                            lut: lut.id
                          }
                        });
                      }
                    }}
                    className={`relative p-3 rounded-xl overflow-hidden border text-left flex flex-col justify-end h-20 transition-all cursor-pointer shadow-md ${
                      isCurrent
                        ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${lut.bg} opacity-50 group-hover:opacity-75`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-xs font-bold text-white leading-tight">{lut.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-300" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: QUICK EDIT TOOLS (For Active Clip) */}
        {activeCapCutTab === 'quick_edit' && (
          <div className="flex flex-col gap-4 text-xs text-slate-300">
            {activeVideoClip ? (
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
                  <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-indigo-400" />
                    <span>{activeVideoClip.name}</span>
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onDuplicateSelectedClip}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={onDeleteSelectedClip}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 rounded-lg text-rose-300 cursor-pointer"
                      title="Delete Clip"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 1-Click Speed Buttons */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Playback Speed</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0.5, 0.75, 1.0, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => onUpdateVideoClip({ ...activeVideoClip, speed: spd })}
                        className={`py-1.5 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                          activeVideoClip.speed === spd
                            ? 'bg-cyan-500 text-black shadow'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Transform Controls */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Opacity Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Opacity</span>
                      <span className="font-mono text-cyan-300">{activeVideoClip.opacity ?? 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeVideoClip.opacity ?? 100}
                      onChange={(e) => onUpdateVideoClip({ ...activeVideoClip, opacity: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Scale Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Scale</span>
                      <span className="font-mono text-cyan-300">{activeVideoClip.scale ?? 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={activeVideoClip.scale ?? 100}
                      onChange={(e) => onUpdateVideoClip({ ...activeVideoClip, scale: Number(e.target.value) })}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quick Rotation & Flip */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const curRot = activeVideoClip.rotation ?? 0;
                      onUpdateVideoClip({ ...activeVideoClip, rotation: (curRot + 90) % 360 });
                    }}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateVideoClip({ ...activeVideoClip, flipH: !activeVideoClip.flipH });
                    }}
                    className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer ${
                      activeVideoClip.flipH
                        ? 'bg-indigo-900/60 border-indigo-400 text-cyan-300'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Mirror Flip</span>
                  </button>
                </div>

              </div>
            ) : activeTextClip ? (
              <div className="flex flex-col gap-3">
                <span className="font-extrabold text-white text-sm">Edit Text Clip</span>
                <input
                  type="text"
                  value={activeTextClip.text}
                  onChange={(e) => onUpdateTextClip({ ...activeTextClip, text: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Font Size</span>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={activeTextClip.fontSize}
                      onChange={(e) => onUpdateTextClip({ ...activeTextClip, fontSize: Number(e.target.value) })}
                      className="accent-cyan-400 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Color</span>
                    <input
                      type="color"
                      value={activeTextClip.color}
                      onChange={(e) => onUpdateTextClip({ ...activeTextClip, color: e.target.value })}
                      className="w-full h-7 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer p-0.5"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center text-slate-500">
                <Sliders className="w-8 h-8 mb-2 text-slate-600" />
                <span>Select any video, audio or text clip on the timeline to edit.</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
