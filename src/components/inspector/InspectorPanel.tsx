import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Crop, 
  Layers, 
  Volume2, 
  Gauge, 
  Palette, 
  ShieldCheck, 
  Sparkles, 
  Type, 
  Eye, 
  Activity,
  Check
} from 'lucide-react';
import { VideoClip, AudioClip, TextClip, ColorGradingParams, VideoEffectType, FilterPresetType } from '../../types';

interface InspectorPanelProps {
  selectedVideoClip?: VideoClip | null;
  selectedAudioClip?: AudioClip | null;
  selectedTextClip?: TextClip | null;
  onUpdateVideoClip: (clip: VideoClip) => void;
  onUpdateAudioClip: (clip: AudioClip) => void;
  onUpdateTextClip: (clip: TextClip) => void;
}

export default function InspectorPanel({
  selectedVideoClip,
  selectedAudioClip,
  selectedTextClip,
  onUpdateVideoClip,
  onUpdateAudioClip,
  onUpdateTextClip,
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'color' | 'speed' | 'text'>('video');

  // If text clip is selected, default to text tab
  const showTextTab = Boolean(selectedTextClip);

  return (
    <div className="w-84 bg-[#090D1C] border-l border-white/8 flex flex-col h-full select-none shrink-0">
      
      {/* Top Inspector Tabs */}
      <div className="h-11 border-b border-white/8 px-2 flex items-center justify-between bg-[#0D1224]/60">
        <div className="flex items-center gap-1 w-full overflow-x-auto no-scrollbar">
          {(['video', 'audio', 'color', 'speed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1 px-2 text-xs font-semibold capitalize rounded-lg transition-all text-center cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
          {showTextTab && (
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-1 px-2 text-xs font-semibold capitalize rounded-lg transition-all text-center cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Text
            </button>
          )}
        </div>
      </div>

      {/* Inspector Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 text-xs text-slate-300">
        
        {/* ======================= VIDEO TAB ======================= */}
        {activeTab === 'video' && (
          selectedVideoClip ? (
            <>
              {/* Transform Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Transform</span>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateVideoClip({
                        ...selectedVideoClip,
                        scale: 100,
                        positionX: 50,
                        positionY: 50,
                        rotation: 0,
                      });
                    }}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded"
                    title="Reset Transform"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {/* Scale */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 w-16">Scale</span>
                  <input
                    type="range"
                    min={20}
                    max={250}
                    value={selectedVideoClip.scale ?? 100}
                    onChange={(e) => onUpdateVideoClip({ ...selectedVideoClip, scale: parseInt(e.target.value) })}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                    {selectedVideoClip.scale ?? 100}%
                  </span>
                </div>

                {/* Position X / Y */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 w-16">Position</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center bg-[#0D1224] border border-white/8 rounded-lg px-2 py-1 flex-1">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">X</span>
                      <input
                        type="number"
                        value={Math.round((selectedVideoClip.positionX ?? 50) - 50)}
                        onChange={(e) => onUpdateVideoClip({ ...selectedVideoClip, positionX: 50 + parseInt(e.target.value || '0') })}
                        className="w-full bg-transparent text-white text-[11px] font-mono outline-none"
                      />
                    </div>
                    <div className="flex items-center bg-[#0D1224] border border-white/8 rounded-lg px-2 py-1 flex-1">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">Y</span>
                      <input
                        type="number"
                        value={Math.round((selectedVideoClip.positionY ?? 50) - 50)}
                        onChange={(e) => onUpdateVideoClip({ ...selectedVideoClip, positionY: 50 + parseInt(e.target.value || '0') })}
                        className="w-full bg-transparent text-white text-[11px] font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Rotation */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 w-16">Rotation</span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selectedVideoClip.rotation ?? 0}
                    onChange={(e) => onUpdateVideoClip({ ...selectedVideoClip, rotation: parseInt(e.target.value) })}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                    {selectedVideoClip.rotation ?? 0}°
                  </span>
                </div>
              </div>

              {/* Crop Section */}
              <div className="flex flex-col gap-3 pt-3 border-t border-white/8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Crop className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Crop</span>
                  </div>
                  <button
                    onClick={() => onUpdateVideoClip({ ...selectedVideoClip, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 })}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded"
                    title="Reset Crop"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {(['Top', 'Bottom', 'Left', 'Right'] as const).map((side) => {
                  const key = `crop${side}` as keyof VideoClip;
                  const val = (selectedVideoClip[key] as number) || 0;
                  return (
                    <div key={side} className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-400 w-16">{side}</span>
                      <input
                        type="range"
                        min={0}
                        max={45}
                        value={val}
                        onChange={(e) => onUpdateVideoClip({ ...selectedVideoClip, [key]: parseInt(e.target.value) })}
                        className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-slate-300 w-10 text-right">{val}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Blend Mode & Opacity */}
              <div className="flex flex-col gap-3 pt-3 border-t border-white/8">
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compositing</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400">Blend Mode</span>
                  <select
                    value={selectedVideoClip.blendMode || 'normal'}
                    onChange={(e) => onUpdateVideoClip({ ...selectedVideoClip, blendMode: e.target.value as any })}
                    className="w-full bg-[#0D1224] border border-white/8 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="soft-light">Soft Light</option>
                    <option value="hard-light">Hard Light</option>
                    <option value="color-dodge">Color Dodge</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 w-16">Opacity</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedVideoClip.opacity ?? 100}
                    onChange={(e) => onUpdateVideoClip({ ...selectedVideoClip, opacity: parseInt(e.target.value) })}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                    {selectedVideoClip.opacity ?? 100}%
                  </span>
                </div>
              </div>

              {/* Pro Toggles */}
              <div className="flex flex-col gap-2 pt-3 border-t border-white/8">
                {[
                  { key: 'stabilization', label: 'Stabilization' },
                  { key: 'motionBlur', label: 'Motion Blur' },
                  { key: 'lensCorrection', label: 'Lens Correction' },
                ].map((item) => {
                  const isChecked = Boolean((selectedVideoClip as any)[item.key]);
                  return (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <span className="text-[11px] font-medium text-slate-300">{item.label}</span>
                      <button
                        onClick={() => onUpdateVideoClip({ ...selectedVideoClip, [item.key]: !isChecked })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          isChecked ? 'bg-[#7C3AED]' : 'bg-slate-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isChecked ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Select a video clip on the timeline to inspect transform & properties.
            </div>
          )
        )}

        {/* ======================= AUDIO TAB ======================= */}
        {activeTab === 'audio' && (
          selectedAudioClip || selectedVideoClip ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Volume & Pan</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 w-16">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={selectedAudioClip ? selectedAudioClip.volume : selectedVideoClip?.volume ?? 100}
                  onChange={(e) => {
                    const vol = parseInt(e.target.value);
                    if (selectedAudioClip) onUpdateAudioClip({ ...selectedAudioClip, volume: vol });
                    else if (selectedVideoClip) onUpdateVideoClip({ ...selectedVideoClip, volume: vol });
                  }}
                  className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                  {(selectedAudioClip ? selectedAudioClip.volume : selectedVideoClip?.volume ?? 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 w-16">Pan</span>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={selectedAudioClip?.pan ?? 0}
                  onChange={(e) => {
                    if (selectedAudioClip) onUpdateAudioClip({ ...selectedAudioClip, pan: parseInt(e.target.value) });
                  }}
                  className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                  {selectedAudioClip?.pan ?? 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Select an audio or video clip to adjust volume levels.
            </div>
          )
        )}

        {/* ======================= COLOR TAB ======================= */}
        {activeTab === 'color' && (
          selectedVideoClip ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <Palette className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Color Grading</span>
                </div>
                <button
                  onClick={() => {
                    onUpdateVideoClip({
                      ...selectedVideoClip,
                      colorGrading: {
                        exposure: 0,
                        brightness: 0,
                        contrast: 0,
                        highlights: 0,
                        shadows: 0,
                        saturation: 0,
                        temperature: 0,
                        tint: 0,
                        sharpness: 0,
                        vignette: 0,
                        filterPreset: 'none',
                        filterIntensity: 100,
                      },
                    });
                  }}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded"
                  title="Reset Color Grading"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {[
                { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
                { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
                { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
                { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
                { key: 'temperature', label: 'Temperature', min: -100, max: 100 },
                { key: 'tint', label: 'Tint', min: -100, max: 100 },
                { key: 'vignette', label: 'Vignette', min: 0, max: 100 },
              ].map((item) => {
                const cg = selectedVideoClip.colorGrading || {} as ColorGradingParams;
                const val = (cg as any)[item.key] || 0;
                return (
                  <div key={item.key} className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 w-20">{item.label}</span>
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      value={val}
                      onChange={(e) => {
                        const newCg = { ...cg, [item.key]: parseInt(e.target.value) };
                        onUpdateVideoClip({ ...selectedVideoClip, colorGrading: newCg });
                      }}
                      className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-slate-300 w-10 text-right">{val}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Select a video clip to grade exposure, contrast, saturation, and temperature.
            </div>
          )
        )}

        {/* ======================= SPEED TAB ======================= */}
        {activeTab === 'speed' && (
          selectedVideoClip ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Speed Ramping</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 w-16">Speed</span>
                <input
                  type="range"
                  min={0.25}
                  max={4.0}
                  step={0.25}
                  value={selectedVideoClip.speed || 1.0}
                  onChange={(e) => onUpdateVideoClip({ ...selectedVideoClip, speed: parseFloat(e.target.value) })}
                  className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                  {selectedVideoClip.speed || 1.0}x
                </span>
              </div>

              {/* Speed Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[0.5, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdateVideoClip({ ...selectedVideoClip, speed: s })}
                    className={`py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      selectedVideoClip.speed === s 
                        ? 'bg-[#7C3AED] text-white' 
                        : 'bg-[#0D1224] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Select a video clip to adjust playback velocity.
            </div>
          )
        )}

        {/* ======================= TEXT TAB ======================= */}
        {activeTab === 'text' && (
          selectedTextClip ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <Type className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Text Properties</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400">Content</span>
                <input
                  type="text"
                  value={selectedTextClip.text}
                  onChange={(e) => onUpdateTextClip({ ...selectedTextClip, text: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#0D1224] border border-white/8 rounded-lg text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 w-16">Size</span>
                <input
                  type="range"
                  min={14}
                  max={96}
                  value={selectedTextClip.fontSize}
                  onChange={(e) => onUpdateTextClip({ ...selectedTextClip, fontSize: parseInt(e.target.value) })}
                  className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                  {selectedTextClip.fontSize}px
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Select a text title on the timeline to edit font and layout.
            </div>
          )
        )}

      </div>

    </div>
  );
}
