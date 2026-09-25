import React, { useState } from 'react';
import { Music, Mic, Volume2, Plus, Play, Pause, Sparkles } from 'lucide-react';
import { AudioClip, AudioStyleType } from '../../types';

interface AudioLibraryProps {
  onAddAudioClip: (clip: Omit<AudioClip, 'id'>) => void;
}

interface AudioTrackPreset {
  id: string;
  name: string;
  category: 'Music' | 'SFX' | 'Ambient';
  duration: number;
  style: AudioStyleType;
  bpm?: number;
}

const PRESETS: AudioTrackPreset[] = [
  { id: 'bg_music', name: 'Cinematic Journey Theme', category: 'Music', duration: 165, style: 'cinematic_score', bpm: 120 },
  { id: 'synth_wave', name: 'Cyber Neon Pulse', category: 'Music', duration: 120, style: 'synth_wave', bpm: 128 },
  { id: 'lofi_chill', name: 'Late Night Coffee Beat', category: 'Music', duration: 180, style: 'lofi_chill', bpm: 85 },
  { id: 'ambient_drone', name: 'Deep Space Atmosphere', category: 'Ambient', duration: 200, style: 'ambient_drone' },
  { id: 'woosh_sfx', name: 'Cinematic Camera Whoosh', category: 'SFX', duration: 2, style: 'sound_effect' },
  { id: 'sub_drop', name: 'Epic Bass Sub Impact', category: 'SFX', duration: 3, style: 'sound_effect' },
  { id: 'riser_sfx', name: 'Tension Build Riser', category: 'SFX', duration: 5, style: 'sound_effect' },
  { id: 'glitch_sfx', name: 'Digital Glitch Burst', category: 'SFX', duration: 1.5, style: 'sound_effect' },
];

export default function AudioLibrary({ onAddAudioClip }: AudioLibraryProps) {
  const [activeTab, setActiveTab] = useState<'Music' | 'SFX' | 'Ambient' | 'Voiceover'>('Music');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);

  const filtered = PRESETS.filter(p => p.category === activeTab);

  const handleAdd = (preset: AudioTrackPreset) => {
    onAddAudioClip({
      name: preset.name,
      type: 'audio',
      startTime: 0,
      duration: preset.duration,
      sourceStart: 0,
      volume: 100,
      pan: 0,
      audioStyle: preset.style,
      trackId: preset.category === 'Music' ? 'a1' : 'a2',
    });
  };

  return (
    <div className="w-80 bg-[#090D1C] border-r border-white/8 flex flex-col h-full select-none shrink-0">
      <div className="p-3.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#38BDF8]" />
          <h2 className="text-sm font-bold text-white">Audio Library</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-3 border-b border-white/8 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {(['Music', 'SFX', 'Ambient', 'Voiceover'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                : 'bg-[#0D1224] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {activeTab === 'Voiceover' ? (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-4 bg-[#0D1224] rounded-xl border border-white/8">
            <div className="w-14 h-14 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA]">
              <Mic className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Record Live Voiceover</h3>
              <p className="text-[11px] text-slate-400 mt-1">Speak into your microphone to add a synchronized vocal track.</p>
            </div>
            <button
              onClick={() => {
                if (isRecording) {
                  setIsRecording(false);
                  onAddAudioClip({
                    name: `Voiceover Recording (${recordTimer}s)`,
                    type: 'audio',
                    startTime: 0,
                    duration: Math.max(3, recordTimer),
                    sourceStart: 0,
                    volume: 100,
                    pan: 0,
                    audioStyle: 'voiceover',
                    trackId: 'a2',
                  });
                  setRecordTimer(0);
                } else {
                  setIsRecording(true);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isRecording 
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/50' 
                  : 'btn-vedit-primary'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isRecording ? `Recording... (${recordTimer}s) Stop` : 'Start Recording'}</span>
            </button>
          </div>
        ) : (
          filtered.map((preset) => (
            <div
              key={preset.id}
              className="p-2.5 bg-[#0D1224] rounded-xl border border-white/8 hover:border-[#38BDF8]/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setPlayingId(playingId === preset.id ? null : preset.id)}
                  className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                >
                  {playingId === preset.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate max-w-[150px]">
                    {preset.name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{Math.floor(preset.duration / 60)}:{(preset.duration % 60).toString().padStart(2, '0')}</span>
                    {preset.bpm && <span>• {preset.bpm} BPM</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAdd(preset)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-[#38BDF8]/20 text-slate-400 hover:text-[#38BDF8] transition-all cursor-pointer"
                title="Add to Timeline"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
