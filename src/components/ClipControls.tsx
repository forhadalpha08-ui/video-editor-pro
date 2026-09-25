import React, { useState } from 'react';
import {
  VideoClip,
  AudioClip,
  TextClip,
  ProceduralType,
  Keyframe,
  VideoEffectType,
  TextAnimationStyle,
  interpolateKeyframes,
  interpolateSpeedKeyframes
} from '../types';
import { getAssetUrl } from '../utils/assetUrl';
import {
  Sliders,
  Video,
  Volume2,
  Type,
  Paintbrush,
  Move,
  Plus,
  Trash2,
  Key,
  Clock,
  HelpCircle,
  Activity,
  Wand2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Volume1,
  Sparkles,
  Zap,
  Play
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynthesizer';

interface ClipControlsProps {
  selectedClip: VideoClip | AudioClip | TextClip;
  currentTime: number;
  onUpdateVideoClip: (clip: VideoClip) => void;
  onUpdateAudioClip: (clip: AudioClip) => void;
  onUpdateTextClip: (clip: TextClip) => void;
}

const TEMPLATE_VIDEOS = [
  { id: getAssetUrl('1.mp4'), label: '1.mp4 (Tokyo)' },
  { id: getAssetUrl('2.mp4'), label: '2.mp4 (Alps)' },
  { id: getAssetUrl('3.mp4'), label: '3.mp4 (Drift)' },
  { id: getAssetUrl('4.mp4'), label: '4.mp4 (Tech)' },
  { id: getAssetUrl('5.mp4'), label: '5.mp4 (Sunset)' },
  { id: getAssetUrl('6.mp4'), label: '6.mp4 (Street)' },
  { id: getAssetUrl('7.mp4'), label: '7.mp4 (Studio)' },
  { id: getAssetUrl('8.mp4'), label: '8.mp4 (Action)' },
  { id: getAssetUrl('9.mp4'), label: '9.mp4 (Retro)' },
  { id: getAssetUrl('10.mp4'), label: '10.mp4 (Noir)' },
  { id: getAssetUrl('11.mp4'), label: '11.mp4 (City)' },
  { id: getAssetUrl('12.mp4'), label: '12.mp4 (Space)' },
];

const VIDEO_EFFECTS: { id: VideoEffectType; name: string }[] = [
  { id: 'none', name: 'None' },
  { id: 'cinema_glow', name: 'Cinema Glow' },
  { id: 'vhs', name: 'VHS Tape' },
  { id: 'glitch', name: 'RGB Glitch' },
  { id: 'film_grain', name: 'Film Grain' },
  { id: 'rgb_split', name: 'Chromatic Split' },
  { id: 'anamorphic', name: 'Anamorphic Flare' },
  { id: 'bloom', name: 'Bloom Glow' },
];

const TEXT_ANIMATIONS: { id: TextAnimationStyle; name: string }[] = [
  { id: 'none', name: 'None' },
  { id: 'typewriter', name: 'Typewriter' },
  { id: 'glitch_shake', name: 'Glitch Shake' },
  { id: 'neon_pulse', name: 'Neon Pulse' },
  { id: 'fade_slide', name: 'Fade Slide' },
  { id: 'bounce', name: 'Bounce Pop' },
];

const COLORS = [
  { hex: '#ffffff', name: 'White' },
  { hex: '#ff0099', name: 'Hot Pink' },
  { hex: '#00ffea', name: 'Neon Cyan' },
  { hex: '#ffff00', name: 'Neon Yellow' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#a855f7', name: 'Violet' },
];

export default function ClipControls({
  selectedClip,
  currentTime,
  onUpdateVideoClip,
  onUpdateAudioClip,
  onUpdateTextClip,
}: ClipControlsProps) {
  const [activeKeyframeId, setActiveKeyframeId] = useState<string | null>(null);
  const [selectedParamForGraph, setSelectedParamForGraph] = useState<'opacity' | 'scale' | 'positionX' | 'positionY'>('opacity');
  const [easeMode, setEaseMode] = useState<'linear' | 'ease_in' | 'ease_out' | 'smooth_s'>('smooth_s');

  const handleKeyframeController = (
    clip: VideoClip | TextClip,
    onUpdate: (updated: any) => void
  ) => {
    const localTime = Math.max(0, Math.min(clip.duration, currentTime - clip.startTime));
    const keyframes = clip.keyframes || [];

    const handleAddKeyframe = () => {
      const existing = keyframes.find((k) => Math.abs(k.time - localTime) < 0.15);
      if (existing) {
        setActiveKeyframeId(existing.id);
        return;
      }

      const animVal = interpolateKeyframes(keyframes, localTime, {
        opacity: clip.opacity !== undefined ? clip.opacity : 100,
        scale: clip.scale !== undefined ? clip.scale : 100,
        positionX: clip.positionX !== undefined ? clip.positionX : 50,
        positionY: clip.positionY !== undefined ? clip.positionY : 50,
        rotation: clip.rotation !== undefined ? clip.rotation : 0,
      });

      const newKf: Keyframe = {
        id: `kf_${Date.now()}`,
        time: parseFloat(localTime.toFixed(2)),
        opacity: animVal.opacity,
        scale: animVal.scale,
        positionX: animVal.positionX,
        positionY: animVal.positionY,
        rotation: animVal.rotation,
      };

      const sorted = [...keyframes, newKf].sort((a, b) => a.time - b.time);
      onUpdate({ ...clip, keyframes: sorted });
      setActiveKeyframeId(newKf.id);
    };

    const handleUpdateKeyframeField = (kfId: string, fields: Partial<Keyframe>) => {
      const updated = keyframes.map((k) => (k.id === kfId ? { ...k, ...fields } : k));
      onUpdate({ ...clip, keyframes: updated });
    };

    const handleDeleteKeyframe = (kfId: string) => {
      const filtered = keyframes.filter((k) => k.id !== kfId);
      onUpdate({ ...clip, keyframes: filtered });
      if (activeKeyframeId === kfId) {
        setActiveKeyframeId(null);
      }
    };

    const selectedKeyframe = keyframes.find((k) => k.id === activeKeyframeId);

    const liveValues = interpolateKeyframes(keyframes, localTime, {
      opacity: clip.opacity !== undefined ? clip.opacity : 100,
      scale: clip.scale !== undefined ? clip.scale : 100,
      positionX: clip.positionX !== undefined ? clip.positionX : 50,
      positionY: clip.positionY !== undefined ? clip.positionY : 50,
      rotation: clip.rotation !== undefined ? clip.rotation : 0,
    });

    return (
      <div className="mt-4 pt-4 border-t border-slate-900/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
            <Key className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>Keyframe Spline Graph Editor</span>
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            Loc: {localTime.toFixed(2)}s / {clip.duration.toFixed(2)}s
          </span>
        </div>

        {/* Keyframe Action Button */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleAddKeyframe}
            className="flex-1 py-2 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Keyframe Node @ Playhead</span>
          </button>
        </div>

        {/* Selected Keyframe Inspector */}
        {selectedKeyframe && (
          <div className="bg-[#050711] border border-indigo-500/20 p-3 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>Editing Node ({selectedKeyframe.time.toFixed(2)}s)</span>
              <button
                onClick={() => handleDeleteKeyframe(selectedKeyframe.id)}
                className="text-rose-400 hover:text-rose-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold">Scale: {selectedKeyframe.scale}%</span>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={selectedKeyframe.scale}
                  onChange={(e) => handleUpdateKeyframeField(selectedKeyframe.id, { scale: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold">Opacity: {selectedKeyframe.opacity}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedKeyframe.opacity}
                  onChange={(e) => handleUpdateKeyframeField(selectedKeyframe.id, { opacity: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold">Position X: {selectedKeyframe.positionX}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedKeyframe.positionX}
                  onChange={(e) => handleUpdateKeyframeField(selectedKeyframe.id, { positionX: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold">Position Y: {selectedKeyframe.positionY}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedKeyframe.positionY}
                  onChange={(e) => handleUpdateKeyframeField(selectedKeyframe.id, { positionY: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (selectedClip.type === 'video') {
    const clip = selectedClip as VideoClip;
    return (
      <div className="flex flex-col gap-4 pb-6">
        
        {/* Title Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[200px]">{clip.name}</span>
          </div>
          <span className="text-[9.5px] font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded">
            {clip.duration.toFixed(1)}s
          </span>
        </div>

        {/* 1. Quick Video Source Selector (1-12.mp4 or Custom Upload) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Selected Media Source
            </span>
            <span className="text-cyan-400 font-mono text-[9.5px] truncate max-w-[150px]">
              {clip.videoUrl || clip.name}
            </span>
          </div>

          {/* Upload / Replace with Local File */}
          <label className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-indigo-500/40 hover:border-cyan-400 rounded-xl text-xs font-bold text-cyan-300 transition-all cursor-pointer shadow-md">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Upload / Replace with My Media File</span>
            <input
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  onUpdateVideoClip({
                    ...clip,
                    videoUrl: url,
                    name: file.name,
                  });
                }
              }}
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase">Or Choose Template Video (1-12.mp4)</span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {TEMPLATE_VIDEOS.map((item) => {
                const isSelected = clip.videoUrl === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onUpdateVideoClip({ ...clip, videoUrl: item.id, name: `Video ${item.label}` })}
                    className={`py-2 px-1 text-[9.5px] font-bold rounded-xl border text-center transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Visual Effects Panel */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-900">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Creative Video Effects</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {VIDEO_EFFECTS.map((fx) => {
              const isCurrent = (clip.effect || 'none') === fx.id;
              return (
                <button
                  key={fx.id}
                  onClick={() => onUpdateVideoClip({ ...clip, effect: fx.id })}
                  className={`py-2 px-2 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-pink-950/40 border-pink-500 text-pink-300 shadow'
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  {fx.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Chroma Key / Green Screen Removal Tool */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chroma Key (Green Screen)</span>
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={clip.chromaKey?.enabled || false}
                onChange={(e) => {
                  onUpdateVideoClip({
                    ...clip,
                    chromaKey: {
                      enabled: e.target.checked,
                      keyColor: clip.chromaKey?.keyColor || '#00ff00',
                      similarity: clip.chromaKey?.similarity || 45,
                      smoothness: clip.chromaKey?.smoothness || 15,
                    }
                  });
                }}
                className="w-3.5 h-3.5 rounded accent-emerald-500"
              />
              <span className="text-[9px] text-slate-400 font-bold">Enabled</span>
            </label>
          </div>

          {clip.chromaKey?.enabled && (
            <div className="bg-[#03050a] border border-emerald-500/20 p-3 rounded-2xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-bold">Key Background Color</span>
                <input
                  type="color"
                  value={clip.chromaKey.keyColor}
                  onChange={(e) => {
                    onUpdateVideoClip({
                      ...clip,
                      chromaKey: { ...clip.chromaKey!, keyColor: e.target.value }
                    });
                  }}
                  className="w-8 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Color Tolerance</span>
                  <span className="font-mono text-emerald-400">{clip.chromaKey.similarity}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={clip.chromaKey.similarity}
                  onChange={(e) => {
                    onUpdateVideoClip({
                      ...clip,
                      chromaKey: { ...clip.chromaKey!, similarity: Number(e.target.value) }
                    });
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Edge Softness</span>
                  <span className="font-mono text-emerald-400">{clip.chromaKey.smoothness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={clip.chromaKey.smoothness}
                  onChange={(e) => {
                    onUpdateVideoClip({
                      ...clip,
                      chromaKey: { ...clip.chromaKey!, smoothness: Number(e.target.value) }
                    });
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Transform & Orientation */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Transform & Orientation</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateVideoClip({ ...clip, flipH: !clip.flipH })}
                className={`p-1.5 rounded-lg border text-[9px] font-bold flex items-center gap-1 cursor-pointer ${
                  clip.flipH ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Flip Horizontal"
              >
                <FlipHorizontal className="w-3 h-3" />
                <span>Flip H</span>
              </button>
              <button
                onClick={() => onUpdateVideoClip({ ...clip, flipV: !clip.flipV })}
                className={`p-1.5 rounded-lg border text-[9px] font-bold flex items-center gap-1 cursor-pointer ${
                  clip.flipV ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Flip Vertical"
              >
                <FlipVertical className="w-3 h-3" />
                <span>Flip V</span>
              </button>
            </div>
          </span>

          <div className="grid grid-cols-2 gap-3 bg-[#03050a] p-3 rounded-2xl border border-slate-900">
            {/* Scale */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Scale Zoom</span>
                <span className="font-mono text-indigo-400">{clip.scale || 100}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                value={clip.scale || 100}
                onChange={(e) => onUpdateVideoClip({ ...clip, scale: Number(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Rotation */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Rotation</span>
                <span className="font-mono text-indigo-400">{clip.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={clip.rotation || 0}
                onChange={(e) => onUpdateVideoClip({ ...clip, rotation: Number(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 5. Aspect Ratio Presets */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-900">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aspect Ratio Mask</span>
          <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-900">
            {[
              { id: 'free', label: 'Free' },
              { id: '16:9', label: '16:9 Wide' },
              { id: '9:16', label: '9:16 Reel' },
              { id: '1:1', label: '1:1 Square' },
              { id: '4:3', label: '4:3 Noir' },
              { id: '2.39:1', label: '2.39:1 Cinema' }
            ].map((ratio) => {
              const isCurrent = (clip.aspectRatio || 'free') === ratio.id;
              return (
                <button
                  key={ratio.id}
                  onClick={() => onUpdateVideoClip({ ...clip, aspectRatio: ratio.id as any })}
                  className={`py-1.5 text-[9.5px] font-semibold rounded-lg text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-bold shadow'
                      : 'bg-slate-900/30 border border-slate-850 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {ratio.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Keyframe Controller */}
        {handleKeyframeController(clip, onUpdateVideoClip)}

      </div>
    );
  }

  if (selectedClip.type === 'audio') {
    const clip = selectedClip as AudioClip;
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audio & Sound Design</span>
          </div>
        </div>

        {/* Synthesizer Style */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Soundtrack Style</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {[
              { id: 'synth_wave', name: 'Synthwave' },
              { id: 'ambient_drone', name: 'Ambient Drone' },
              { id: 'beat_loop', name: 'Electro Beat' },
              { id: '808_bass', name: '808 Trap Bass' },
              { id: 'tech_house', name: 'Tech House' },
              { id: 'lofi_chill', name: 'Lo-Fi Chill' },
              { id: 'riser', name: 'Cinematic Riser' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  onUpdateAudioClip({ ...clip, audioStyle: st.id as any, name: st.name });
                  audioSynth.start(st.id as any, clip.volume);
                }}
                className={`px-2 py-2 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  clip.audioStyle === st.id
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow'
                    : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Instant Sound Effects Library Trigger */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-900">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Sound Effects (SFX Library)</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'whoosh', label: '💨 Whoosh' },
              { id: 'impact', label: '💥 Impact' },
              { id: 'glitch', label: '⚡ Glitch' },
              { id: 'laser', label: '✨ Laser' },
              { id: 'shutter', label: '📸 Shutter' },
              { id: 'click', label: '🔘 Click' },
            ].map((sfx) => (
              <button
                key={sfx.id}
                onClick={() => audioSynth.playSFX(sfx.id as any)}
                className="py-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer active:scale-95"
              >
                {sfx.label}
              </button>
            ))}
          </div>
        </div>

        {/* Volume & Pan */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Volume</span>
              <span className="font-mono text-emerald-400">{clip.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={clip.volume}
              onChange={(e) => onUpdateAudioClip({ ...clip, volume: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Stereo Pan</span>
              <span className="font-mono text-emerald-400">{clip.pan || 0}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={clip.pan || 0}
              onChange={(e) => onUpdateAudioClip({ ...clip, pan: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>
    );
  }

  if (selectedClip.type === 'text') {
    const clip = selectedClip as TextClip;
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span>Title & Typography Settings</span>
          </div>
        </div>

        {/* Content text */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Title Content</span>
          <input
            type="text"
            value={clip.text}
            onChange={(e) => onUpdateTextClip({ ...clip, text: e.target.value })}
            placeholder="Type captions here..."
            className="w-full bg-[#030408] hover:bg-slate-950 focus:bg-slate-950 text-white rounded-xl border border-slate-850 px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>

        {/* Text Animation Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Title Animation Effect</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {TEXT_ANIMATIONS.map((anim) => {
              const isCurrent = (clip.animation || 'none') === anim.id;
              return (
                <button
                  key={anim.id}
                  onClick={() => onUpdateTextClip({ ...clip, animation: anim.id })}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-950/50 border-indigo-500 text-indigo-300 shadow'
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  {anim.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography Styles */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Visual Style Preset</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'regular', name: 'Regular' },
              { id: 'neon', name: 'Glow Neon' },
              { id: 'bordered', name: 'Outline Shadow' },
              { id: 'glitch', name: 'Chroma Glitch' },
              { id: 'cinematic_lower_third', name: 'Cinematic Glass Bar' },
              { id: 'badge', name: 'Solid Badge' },
            ].map((sty) => (
              <button
                key={sty.id}
                onClick={() => onUpdateTextClip({ ...clip, style: sty.id as any })}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  clip.style === sty.id
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow'
                    : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                {sty.name}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Paintbrush className="w-3 h-3 text-slate-400" />
            <span>Accent Color</span>
          </span>
          <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-850 justify-around">
            {COLORS.map((col) => (
              <button
                key={col.hex}
                onClick={() => onUpdateTextClip({ ...clip, color: col.hex })}
                className="w-6 h-6 rounded-full border border-slate-800 transition-transform active:scale-90 relative cursor-pointer"
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                {clip.color.toLowerCase() === col.hex.toLowerCase() && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-slate-950 bg-black/10 rounded-full">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size & Position */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Font Size</span>
              <span className="font-mono text-amber-400">{clip.fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="64"
              value={clip.fontSize}
              onChange={(e) => onUpdateTextClip({ ...clip, fontSize: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Vertical Position</span>
              <span className="font-mono text-amber-400">{clip.positionY}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={clip.positionY}
              onChange={(e) => onUpdateTextClip({ ...clip, positionY: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        {handleKeyframeController(clip, onUpdateTextClip)}
      </div>
    );
  }

  return null;
}
