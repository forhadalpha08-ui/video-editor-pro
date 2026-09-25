import React, { useState } from 'react';
import { 
  Move, 
  Layers, 
  Sparkles, 
  Sliders, 
  RotateCcw, 
  Activity, 
  LayoutGrid, 
  SplitSquareVertical, 
  Check, 
  Zap, 
  Key, 
  Plus, 
  Trash2,
  Maximize2
} from 'lucide-react';
import { VideoClip, Keyframe } from '../types';

interface MotionStudioProps {
  selectedClip?: VideoClip | null;
  onUpdateVideoClip?: (clip: VideoClip) => void;
  currentTime: number;
}

const BLEND_MODES = [
  { id: 'normal', name: 'Normal', desc: 'Standard opaque alpha layer' },
  { id: 'screen', name: 'Screen', desc: 'Lightens & blends glowing elements, neon and lasers' },
  { id: 'multiply', name: 'Multiply', desc: 'Darkens and combines shadow textures' },
  { id: 'overlay', name: 'Overlay', desc: 'Preserves highlights & shadows with boosted contrast' },
  { id: 'color_dodge', name: 'Color Dodge', desc: 'Vibrant saturated cinematic flare bloom' },
  { id: 'difference', name: 'Difference', desc: 'Inverts matching tones for psychedelic glitch art' },
];

const BEZIER_CURVES = [
  { id: 'linear', name: 'Linear (Constant)', d: 'M 0 50 L 100 0' },
  { id: 'ease_in', name: 'Ease In (Accelerate)', d: 'M 0 50 Q 70 50 100 0' },
  { id: 'ease_out', name: 'Ease Out (Decelerate)', d: 'M 0 50 Q 30 0 100 0' },
  { id: 'ease_in_out', name: 'Ease In-Out (Smooth S-Curve)', d: 'M 0 50 C 45 50 55 0 100 0' },
  { id: 'bounce', name: 'Bounce / Elastic', d: 'M 0 50 C 40 10 50 60 70 -5 C 80 15 90 0 100 0' },
];

const PIP_LAYOUTS = [
  { id: 'side_by_side', name: 'Side-by-Side (50/50 Split)', scale: 50, posX: 25, posY: 50 },
  { id: 'corner_pip', name: 'Reaction Cam (Bottom Right)', scale: 35, posX: 80, posY: 78 },
  { id: 'top_left_pip', name: 'Facecam (Top Left)', scale: 35, posX: 20, posY: 22 },
  { id: 'cinema_scope', name: 'Centered Feature Box', scale: 75, posX: 50, posY: 50 },
];

export default function MotionStudio({
  selectedClip,
  onUpdateVideoClip,
  currentTime,
}: MotionStudioProps) {
  const [activeTab, setActiveTab] = useState<'curves' | 'blend' | 'pip' | 'keyframes'>('curves');
  const [selectedCurve, setSelectedCurve] = useState('ease_in_out');
  const [selectedBlendMode, setSelectedBlendMode] = useState('normal');

  if (!selectedClip || !onUpdateVideoClip) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-900">
        <Move className="w-8 h-8 text-slate-650 mb-3" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">No Video Clip Selected</span>
        <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 leading-relaxed">
          Select any video clip from the timeline to configure Bezier velocity curves, blending modes, and Picture-in-Picture multi-layer layout framing.
        </p>
      </div>
    );
  }

  // Handle PIP Preset Application
  const handleApplyPip = (pip: typeof PIP_LAYOUTS[0]) => {
    onUpdateVideoClip({
      ...selectedClip,
      scale: pip.scale,
      positionX: pip.posX,
      positionY: pip.posY,
      trackId: 'v2', // Put in PiP track
    });
  };

  // Add Keyframe at Current Time
  const handleAddKeyframeAtPlayhead = () => {
    const relTime = Math.max(0, Math.min(selectedClip.duration, currentTime - selectedClip.startTime));
    const currentKf = selectedClip.keyframes || [];
    const newKf: Keyframe = {
      id: `kf_${Date.now()}`,
      time: parseFloat(relTime.toFixed(2)),
      opacity: selectedClip.opacity !== undefined ? selectedClip.opacity : 100,
      scale: selectedClip.scale !== undefined ? selectedClip.scale : 100,
      positionX: selectedClip.positionX !== undefined ? selectedClip.positionX : 50,
      positionY: selectedClip.positionY !== undefined ? selectedClip.positionY : 50,
      rotation: selectedClip.rotation || 0,
    };

    onUpdateVideoClip({
      ...selectedClip,
      keyframes: [...currentKf.filter((k) => Math.abs(k.time - relTime) > 0.1), newKf],
    });
  };

  const handleRemoveKeyframe = (kfId: string) => {
    onUpdateVideoClip({
      ...selectedClip,
      keyframes: (selectedClip.keyframes || []).filter((k) => k.id !== kfId),
    });
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
            <Move className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-white flex items-center gap-1.5">
              <span>Motion Curves & Composite Studio</span>
              <span className="px-1.5 py-0.2 bg-gradient-to-r from-purple-500 to-pink-500 text-[8px] font-black rounded-md text-white uppercase tracking-normal">
                After Effects Style
              </span>
            </span>
            <span className="text-[9.5px] text-slate-400">
              Bezier curve acceleration, layer blend modes, multi-cam PiP & keyframe interpolation.
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tool Selection Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-indigo-500/20 shadow-inner">
        {[
          { id: 'curves', label: 'Velocity Curves', icon: Activity },
          { id: 'blend', label: 'Blend Modes', icon: Layers },
          { id: 'pip', label: 'PiP Multi-Cam', icon: LayoutGrid },
          { id: 'keyframes', label: 'Keyframes', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BEZIER VELOCITY CURVES */}
      {activeTab === 'curves' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Keyframe Interpolation Curves</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {BEZIER_CURVES.map((curve) => {
              const isSelected = selectedCurve === curve.id;
              return (
                <button
                  key={curve.id}
                  onClick={() => setSelectedCurve(curve.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/50 border-purple-500 text-white ring-1 ring-purple-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Mini SVG Curve preview */}
                    <div className="w-12 h-8 bg-slate-950 rounded-lg p-1 border border-slate-800 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <path d={curve.d} fill="none" stroke={isSelected ? '#c084fc' : '#64748b'} strokeWidth="4" />
                      </svg>
                    </div>
                    <span className="font-bold text-[11px]">{curve.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMPOSITING BLEND MODES */}
      {activeTab === 'blend' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Layer Blending Mode (V2 / V1 Composite)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {BLEND_MODES.map((mode) => {
              const isSelected = selectedBlendMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedBlendMode(mode.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 text-white ring-1 ring-cyan-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-extrabold text-[11px] text-cyan-400">{mode.name}</span>
                  <span className="text-[8.5px] text-slate-400">{mode.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PICTURE-IN-PICTURE (PIP) LAYOUTS */}
      {activeTab === 'pip' && (
        <div className="flex flex-col gap-3.5 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-pink-400" />
              <span>Multi-Cam & PiP Split Layout Presets</span>
            </span>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Instantly scale and frame footage into reaction boxes, podcast side-by-side splits, or talking head avatars.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {PIP_LAYOUTS.map((pip) => (
              <button
                key={pip.id}
                onClick={() => handleApplyPip(pip)}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/60 text-left flex flex-col gap-1 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10.5px] text-white group-hover:text-pink-400 transition-colors">{pip.name}</span>
                  <Maximize2 className="w-3 h-3 text-slate-500 group-hover:text-pink-400" />
                </div>
                <span className="text-[8.5px] text-slate-400 font-mono">Scale: {pip.scale}% • Pos: ({pip.posX}%, {pip.posY}%)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KEYFRAME MANAGEMENT */}
      {activeTab === 'keyframes' && (
        <div className="flex flex-col gap-3 bg-slate-950/60 border border-indigo-500/15 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-yellow-400" />
              <span>Active Motion Keyframes ({selectedClip.keyframes?.length || 0})</span>
            </span>
            <button
              onClick={handleAddKeyframeAtPlayhead}
              className="px-2.5 py-1 bg-yellow-500/20 border border-yellow-500/40 hover:bg-yellow-500/30 text-yellow-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Keyframe @ Playhead</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {(!selectedClip.keyframes || selectedClip.keyframes.length === 0) ? (
              <div className="py-6 text-center text-slate-500 text-[10px]">
                No keyframes added yet. Click above to add a transform keyframe at playhead position.
              </div>
            ) : (
              selectedClip.keyframes.map((kf, i) => (
                <div
                  key={kf.id}
                  className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center justify-between text-[10px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-[8.5px]">
                      {i + 1}
                    </span>
                    <span className="font-mono text-slate-300">{kf.time.toFixed(2)}s</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Scale: {kf.scale}%</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Opacity: {kf.opacity}%</span>
                  </div>
                  <button
                    onClick={() => handleRemoveKeyframe(kf.id)}
                    className="p-1 hover:bg-red-900/40 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    title="Delete Keyframe"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
