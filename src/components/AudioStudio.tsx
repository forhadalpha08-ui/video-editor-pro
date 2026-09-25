import React, { useState } from 'react';
import { 
  Sliders, 
  Volume2, 
  Mic, 
  Sparkles, 
  Activity, 
  Music, 
  Radio, 
  Disc, 
  VolumeX, 
  Play, 
  Check, 
  Flame, 
  RotateCcw,
  Zap,
  Layers,
  Plus
} from 'lucide-react';
import { AudioClip, AudioStyleType } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface AudioStudioProps {
  activeAudioClip?: AudioClip | null;
  onUpdateAudioClip?: (clip: AudioClip) => void;
  onAddSoundEffect?: (sfx: { name: string; style: AudioStyleType; duration: number }) => void;
  globalVolume: number;
  onVolumeChange: (val: number) => void;
}

const EQ_FREQUENCIES = [
  { label: '32Hz', freq: 32, desc: 'Sub Bass' },
  { label: '64Hz', freq: 64, desc: 'Bass' },
  { label: '125Hz', freq: 125, desc: 'Punch' },
  { label: '250Hz', freq: 250, desc: 'Low Mid' },
  { label: '500Hz', freq: 500, desc: 'Warmth' },
  { label: '1kHz', freq: 1000, desc: 'Presence' },
  { label: '2kHz', freq: 2000, desc: 'Clarity' },
  { label: '4kHz', freq: 4000, desc: 'Vocal Pop' },
  { label: '8kHz', freq: 8000, desc: 'Treble' },
  { label: '16kHz', freq: 16000, desc: 'Air Sparkle' },
];

const EQ_PRESETS: { id: string; name: string; gains: number[] }[] = [
  { id: 'flat', name: 'Flat Reference', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'bass_boost', name: 'Bass Heavy Drop', gains: [8, 7, 5, 2, 0, -1, 0, 2, 3, 4] },
  { id: 'vocal_punch', name: 'Vocal Clarity & Pop', gains: [-4, -2, 0, 2, 4, 6, 7, 6, 4, 2] },
  { id: 'edm_master', name: 'EDM / Club Master', gains: [6, 5, 4, -1, -2, 2, 4, 5, 6, 7] },
  { id: 'podcast', name: 'Podcast / Dialogue', gains: [-6, -4, 0, 3, 5, 5, 4, 2, 0, -2] },
  { id: 'cinema_trailer', name: 'Cinematic Sub Rumbler', gains: [9, 8, 4, 0, -2, 1, 3, 4, 5, 6] },
  { id: 'lofi_tape', name: 'Muffled Lo-Fi Cassette', gains: [-3, -1, 3, 5, 4, 1, -4, -7, -10, -12] },
];

const SFX_FOLEY_LIBRARY = [
  { id: 'whoosh_fast', name: 'Cinematic Whoosh Transition', style: 'riser' as AudioStyleType, duration: 1.5, icon: Zap },
  { id: 'bass_drop', name: 'Heavy 808 Sub Boom', style: '808_bass' as AudioStyleType, duration: 3.0, icon: Flame },
  { id: 'synth_riser', name: 'Cyberpunk Tension Riser', style: 'riser' as AudioStyleType, duration: 4.0, icon: Sparkles },
  { id: 'lofi_snare', name: 'Lo-Fi Chill Beat Loop', style: 'lofi_chill' as AudioStyleType, duration: 6.0, icon: Disc },
  { id: 'synth_wave', name: 'Retro Neon Synthwave Theme', style: 'synth_wave' as AudioStyleType, duration: 8.0, icon: Radio },
  { id: 'tech_house', name: 'Club Velocity House Groove', style: 'tech_house' as AudioStyleType, duration: 8.0, icon: Activity },
  { id: 'ambient_space', name: 'Deep Space Drone Ambient', style: 'ambient_drone' as AudioStyleType, duration: 8.0, icon: Music },
  { id: 'beat_loop', name: 'Street Hip Hop Drum Break', style: 'beat_loop' as AudioStyleType, duration: 6.0, icon: Sliders },
];

export default function AudioStudio({
  activeAudioClip,
  onUpdateAudioClip,
  onAddSoundEffect,
  globalVolume,
  onVolumeChange,
}: AudioStudioProps) {
  const [activeTab, setActiveTab] = useState<'eq' | 'ducking' | 'voice_fx' | 'foley'>('eq');
  
  // 10-Band EQ Gains (-12dB to +12dB)
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [selectedPreset, setSelectedPreset] = useState('flat');

  // Smart Ducking
  const [duckingEnabled, setDuckingEnabled] = useState(true);
  const [duckAmount, setDuckAmount] = useState(-18); // dB
  const [duckThreshold, setDuckThreshold] = useState(-24); // dB

  // Voice FX & Pitch
  const [pitchShift, setPitchShift] = useState(0); // -12 to +12 semitones
  const [reverbAmount, setReverbAmount] = useState(25); // 0 to 100%
  const [noiseGateAmount, setNoiseGateAmount] = useState(40); // 0 to 100%
  const [stereoPan, setStereoPan] = useState(activeAudioClip?.pan || 0);

  // Apply EQ Preset
  const handleSelectPreset = (presetId: string) => {
    const preset = EQ_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset.id);
      setEqGains([...preset.gains]);
    }
  };

  const handleGainChange = (index: number, val: number) => {
    const next = [...eqGains];
    next[index] = val;
    setEqGains(next);
    setSelectedPreset('custom');
  };

  // Preview SFX
  const handlePreviewSFX = (style: AudioStyleType) => {
    audioSynth.start(style, globalVolume);
    setTimeout(() => {
      audioSynth.stop();
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Music className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-white flex items-center gap-1.5">
              <span>Pro Audio Engineering Suite</span>
              <span className="px-1.5 py-0.2 bg-gradient-to-r from-blue-500 to-cyan-500 text-[8px] font-black rounded-md text-white uppercase tracking-normal">
                Fairlight & Audition
              </span>
            </span>
            <span className="text-[9.5px] text-slate-400">
              10-Band parametric EQ, auto-ducking, pitch shifting, studio reverb & SFX library.
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tool Selection Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-indigo-500/20 shadow-inner">
        {[
          { id: 'eq', label: '10-Band EQ', icon: Sliders },
          { id: 'ducking', label: 'Auto Ducking', icon: Volume2 },
          { id: 'voice_fx', label: 'Voice Pitch/FX', icon: Mic },
          { id: 'foley', label: 'SFX Library', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 10-BAND GRAPHIC EQUALIZER */}
      {activeTab === 'eq' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive 10-Band Graphic EQ</span>
            </span>
            <button
              onClick={() => handleSelectPreset('flat')}
              className="text-[9px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset Flat</span>
            </button>
          </div>

          {/* Real-time Frequency Spectrum Visualizer Curve */}
          <div className="h-20 bg-slate-900/90 border border-slate-800 rounded-xl p-2 relative overflow-hidden flex items-end">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,182,212,0.05)_0%,rgba(0,0,0,0.6)_100%)]" />
            
            {/* Horizontal 0dB Reference line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-700/60 border-t border-dashed border-slate-600" />
            
            <svg className="w-full h-full relative z-10 overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="eqCurveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ffea" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {/* Spline path representing current 10-band gains */}
              <path
                d={`M 0,${25 - eqGains[0] * 1.8} ${eqGains
                  .map((g, i) => `L ${(i / 9) * 100},${25 - g * 1.8}`)
                  .join(' ')} L 100,50 L 0,50 Z`}
                fill="url(#eqCurveGrad)"
              />
              <path
                d={`M 0,${25 - eqGains[0] * 1.8} ${eqGains
                  .map((g, i) => `L ${(i / 9) * 100},${25 - g * 1.8}`)
                  .join(' ')}`}
                fill="none"
                stroke="#00ffea"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* EQ Preset Chips */}
          <div className="flex flex-wrap gap-1.5">
            {EQ_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold border transition-all cursor-pointer ${
                  selectedPreset === p.id
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* 10 Vertical Sliders */}
          <div className="grid grid-cols-10 gap-1.5 pt-2 border-t border-slate-900">
            {EQ_FREQUENCIES.map((band, idx) => {
              const gain = eqGains[idx];
              return (
                <div key={band.label} className="flex flex-col items-center gap-1.5">
                  <span className="text-[8px] font-mono font-bold text-cyan-400">{gain > 0 ? `+${gain}` : gain}</span>
                  <div className="h-28 flex items-center justify-center">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      value={gain}
                      onChange={(e) => handleGainChange(idx, Number(e.target.value))}
                      className="w-24 h-1 accent-cyan-400 -rotate-90 origin-center cursor-pointer"
                    />
                  </div>
                  <span className="text-[8.5px] font-mono font-bold text-slate-300">{band.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SMART AUDIO DUCKING */}
      {activeTab === 'ducking' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Intelligent Audio Ducking</span>
            </span>
            <button
              onClick={() => setDuckingEnabled(!duckingEnabled)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                duckingEnabled ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${duckingEnabled ? 'left-4.5' : 'left-0.75'}`} />
            </button>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Automatically lowers background music volume whenever a voiceover, dialog track, or talking head clip is active on track A2.
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10.5px] font-bold text-white">Ducking Attenuation</span>
                <span className="text-[9px] text-slate-400">How much background music is attenuated</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={-30}
                  max={-6}
                  value={duckAmount}
                  onChange={(e) => setDuckAmount(Number(e.target.value))}
                  className="w-24 accent-blue-500"
                />
                <span className="font-mono text-[10px] text-blue-400 w-10 text-right">{duckAmount} dB</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10.5px] font-bold text-white">Voice Detection Sensitivity</span>
                <span className="text-[9px] text-slate-400">Audio gate threshold trigger</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={-40}
                  max={-10}
                  value={duckThreshold}
                  onChange={(e) => setDuckThreshold(Number(e.target.value))}
                  className="w-24 accent-blue-500"
                />
                <span className="font-mono text-[10px] text-blue-400 w-10 text-right">{duckThreshold} dB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VOICE PITCH & STUDIO FX */}
      {activeTab === 'voice_fx' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-pink-400" />
              <span>Voice Pitch Shifter & Acoustic Spaces</span>
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Pitch Shifter */}
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10.5px] font-bold text-white">Pitch Shift (Semitones)</span>
                <span className="text-[9px] text-slate-400">Deep movie trailer / Chipmunk voice</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={-12}
                  max={12}
                  value={pitchShift}
                  onChange={(e) => setPitchShift(Number(e.target.value))}
                  className="w-24 accent-pink-500"
                />
                <span className="font-mono text-[10px] text-pink-400 w-8 text-right">{pitchShift > 0 ? `+${pitchShift}` : pitchShift}</span>
              </div>
            </div>

            {/* Studio Reverb */}
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10.5px] font-bold text-white">Studio Reverb Wet/Dry</span>
                <span className="text-[9px] text-slate-400">Simulates concert hall & studio acoustic space</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={reverbAmount}
                  onChange={(e) => setReverbAmount(Number(e.target.value))}
                  className="w-24 accent-pink-500"
                />
                <span className="font-mono text-[10px] text-pink-400 w-8 text-right">{reverbAmount}%</span>
              </div>
            </div>

            {/* AI Noise Reduction */}
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10.5px] font-bold text-white">AI Noise Gate & De-Esser</span>
                <span className="text-[9px] text-slate-400">Removes background fan hum & room echo</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={noiseGateAmount}
                  onChange={(e) => setNoiseGateAmount(Number(e.target.value))}
                  className="w-24 accent-pink-500"
                />
                <span className="font-mono text-[10px] text-pink-400 w-8 text-right">{noiseGateAmount}%</span>
              </div>
            </div>

            {/* Stereo Pan */}
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10.5px] font-bold text-white">Stereo Pan (L / R)</span>
                <span className="text-[9px] text-slate-400">Spatial positioning</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={stereoPan}
                  onChange={(e) => {
                    setStereoPan(Number(e.target.value));
                    if (activeAudioClip && onUpdateAudioClip) {
                      onUpdateAudioClip({ ...activeAudioClip, pan: Number(e.target.value) });
                    }
                  }}
                  className="w-24 accent-cyan-400"
                />
                <span className="font-mono text-[10px] text-cyan-400 w-8 text-right">
                  {stereoPan === 0 ? 'C' : stereoPan < 0 ? `L${Math.abs(stereoPan)}` : `R${stereoPan}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SFX & FOLEY SOUNDBOARD */}
      {activeTab === 'foley' && (
        <div className="flex flex-col gap-3 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Sound Effects & Foley Library</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SFX_FOLEY_LIBRARY.map((sfx) => {
              const Icon = sfx.icon;
              return (
                <div
                  key={sfx.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 p-2.5 rounded-xl flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => handlePreviewSFX(sfx.style)}
                      className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Preview Sound"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[10px] text-white truncate">{sfx.name}</span>
                      <span className="text-[8px] text-slate-400 font-mono">{sfx.duration}s</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onAddSoundEffect) {
                        onAddSoundEffect(sfx);
                      }
                    }}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-black text-slate-300 transition-all cursor-pointer shrink-0 ml-1"
                    title="Add to Timeline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
