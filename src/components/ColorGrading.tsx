import React, { useRef, useEffect, useState } from 'react';
import { Sun, Sparkles, Contrast, Droplets, Thermometer, EyeOff, Activity } from 'lucide-react';
import { ColorGradingParams } from '../types';

interface ColorGradingProps {
  params: ColorGradingParams;
  onChange: (updated: ColorGradingParams) => void;
}

const LUTS = [
  { id: 'none', name: 'Log (Raw)', desc: 'Flat cinematic layout', originalSplit: '#475569', gradedSplit: '#64748b' },
  { id: 'teal_orange', name: 'Teal & Orange', desc: 'Hollywood blockbusters', originalSplit: '#ea580c', gradedSplit: '#06b6d4' },
  { id: 'cyberpunk', name: 'Neon Cyber', desc: 'Vibrant neon purple highlights', originalSplit: '#d946ef', gradedSplit: '#06b6d4' },
  { id: 'vintage', name: 'Retro Film', desc: 'Warm shadows and skin tones', originalSplit: '#d97706', gradedSplit: '#15803d' },
  { id: 'warm_gold', name: 'Golden Hour', desc: 'Cozy warm sunset colors', originalSplit: '#ea580c', gradedSplit: '#eab308' },
  { id: 'monochrome', name: 'Classic Noir', desc: 'Washed high-contrast black & white', originalSplit: '#334155', gradedSplit: '#0f172a' },
];

const ScopesMonitor = ({ params }: { params: ColorGradingParams }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scopeMode, setScopeMode] = useState<'luma' | 'rgb_parade'>('rgb_parade');
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw dark background grid (IRE scale)
      ctx.fillStyle = '#030408';
      ctx.fillRect(0, 0, w, h);

      // Draw horizontal reference lines (0, 20, 40, 60, 80, 100 IRE)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.font = '6px monospace';

      const ireLines = [100, 80, 60, 40, 20, 0];
      ireLines.forEach((ire) => {
        const y = h * (1 - ire / 100) * 0.83 + h * 0.08;
        ctx.beginPath();
        if (ire === 0 || ire === 100) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        }
        ctx.moveTo(28, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
        ctx.fillText(`${ire} IRE`, 2, y + 2);
      });

      // Calculate grading adjustments to draw reactive waveform
      const brightness = params.brightness;
      const contrast = params.contrast;
      const saturation = params.saturation;
      const temp = params.temperature;
      const tint = params.tint;

      const liftR = params.lift.r;
      const liftG = params.lift.g;
      const liftB = params.lift.b;
      const gammaR = params.gamma.r;
      const gammaG = params.gamma.g;
      const gammaB = params.gamma.b;
      const gainR = params.gain.r;
      const gainG = params.gain.g;
      const gainB = params.gain.b;

      const startX = 35;
      const endX = w - 12;
      const width = endX - startX;

      const time = performance.now() * 0.0035;

      if (scopeMode === 'luma') {
        // Draw single glowing cyan/green waveform
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.9)';
        ctx.shadowBlur = 4;

        ctx.beginPath();
        for (let x = startX; x <= endX; x += 1.5) {
          const pct = (x - startX) / width;
          
          let signal = 0.5 + Math.sin(pct * Math.PI * 2.5) * 0.16 + Math.cos(pct * Math.PI * 6.5) * 0.07;
          signal += Math.sin(pct * Math.PI * 18 + time) * 0.025;
          signal += (Math.random() - 0.5) * 0.022;

          // Apply contrast
          const cFactor = 1 + contrast / 100;
          signal = (signal - 0.5) * cFactor + 0.5;

          // Apply exposure / brightness
          signal += (brightness / 120);

          // Apply Lift (shadows), Gamma (midtones), Gain (highlights) rough weights
          const shadowsWeight = Math.max(0, 1 - signal * 2);
          const highlightsWeight = Math.max(0, (signal - 0.5) * 2);
          const midtonesWeight = Math.max(0, 1 - shadowsWeight - highlightsWeight);

          const liftAvg = (liftR + liftG + liftB) / 3;
          const gammaAvg = (gammaR + gammaG + gammaB) / 3;
          const gainAvg = (gainR + gainG + gainB) / 3;

          signal += (liftAvg * shadowsWeight + gammaAvg * midtonesWeight + gainAvg * highlightsWeight) / 100;

          // Apply LUT corrections
          if (params.lut === 'teal_orange') {
            signal = signal > 0.5 ? signal * 1.06 : signal * 0.93;
          } else if (params.lut === 'vintage') {
            signal = signal * 0.88 + 0.06;
          } else if (params.lut === 'monochrome') {
            signal = signal * 1.02;
          }

          signal = Math.max(0.01, Math.min(0.99, signal));

          const y = h * (1 - signal) * 0.83 + h * 0.08;
          if (x === startX) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      } else {
        // RGB Parade: Red, Green, Blue columns
        const panelWidth = width / 3;
        const channels = [
          { name: 'Red', color: 'rgba(244, 63, 94, 0.72)', glow: 'rgba(244, 63, 94, 0.9)', tempMul: 0.65, tintMul: 0.3, lift: liftR, gamma: gammaR, gain: gainR },
          { name: 'Green', color: 'rgba(16, 185, 129, 0.72)', glow: 'rgba(16, 185, 129, 0.9)', tempMul: 0.1, tintMul: -0.65, lift: liftG, gamma: gammaG, gain: gainG },
          { name: 'Blue', color: 'rgba(59, 130, 246, 0.72)', glow: 'rgba(59, 130, 246, 0.9)', tempMul: -0.65, tintMul: 0.3, lift: liftB, gamma: gammaB, gain: gainB }
        ];

        channels.forEach((ch, cIdx) => {
          ctx.strokeStyle = ch.color;
          ctx.lineWidth = 1.1;
          ctx.shadowColor = ch.glow;
          ctx.shadowBlur = 3;

          const pStartX = startX + cIdx * panelWidth;
          const pEndX = pStartX + panelWidth - 4;

          // Draw panel label
          ctx.fillStyle = ch.color;
          ctx.font = 'bold 6px monospace';
          ctx.fillText(ch.name, pStartX + 1, h * 0.07);

          ctx.beginPath();
          for (let x = pStartX; x <= pEndX; x += 1.5) {
            const pct = (x - pStartX) / panelWidth;

            let signal = 0.5 + Math.sin(pct * Math.PI * 2.1 + cIdx) * 0.15 + Math.cos(pct * Math.PI * 4.8 + cIdx) * 0.06;
            signal += Math.sin(pct * Math.PI * 13 + time + cIdx) * 0.022;
            signal += (Math.random() - 0.5) * 0.022;

            // Temperature / Tint offsets
            signal += (temp * ch.tempMul + tint * ch.tintMul) / 140;

            // Contrast
            const cFactor = 1 + contrast / 100;
            signal = (signal - 0.5) * cFactor + 0.5;

            // Exposure / Brightness
            signal += (brightness / 120);

            // Lift, Gamma, Gain
            const shadowsWeight = Math.max(0, 1 - signal * 2);
            const highlightsWeight = Math.max(0, (signal - 0.5) * 2);
            const midtonesWeight = Math.max(0, 1 - shadowsWeight - highlightsWeight);

            signal += (ch.lift * shadowsWeight + ch.gamma * midtonesWeight + ch.gain * highlightsWeight) / 100;

            // LUT modifications
            if (params.lut === 'teal_orange') {
              if (cIdx === 0) {
                signal = signal > 0.5 ? signal * 1.14 : signal * 0.85;
              } else if (cIdx === 1) {
                signal = signal > 0.5 ? signal * 0.95 : signal * 1.05;
              } else {
                signal = signal > 0.5 ? signal * 0.85 : signal * 1.25;
              }
            } else if (params.lut === 'cyberpunk') {
              if (cIdx === 0) {
                signal = signal > 0.5 ? signal * 1.18 : signal * 0.78;
              } else if (cIdx === 1) {
                signal = signal * 0.82;
              } else {
                signal = signal > 0.5 ? signal * 1.25 : signal * 1.35;
              }
            } else if (params.lut === 'vintage') {
              if (cIdx === 0) signal = signal * 0.94 + 0.05;
              if (cIdx === 1) signal = signal * 0.91 + 0.03;
              if (cIdx === 2) signal = signal * 0.84 + 0.09;
            } else if (params.lut === 'warm_gold') {
              if (cIdx === 0) signal = signal * 1.15 + 0.05;
              if (cIdx === 1) signal = signal * 1.05 + 0.02;
              if (cIdx === 2) signal = signal * 0.82;
            } else if (params.lut === 'monochrome') {
              signal = (signal * 0.96 + (0.5 + Math.sin(pct * Math.PI * 2.2) * 0.16) * 0.04);
            }

            // Saturation separates
            const avgSignal = 0.5;
            const satFactor = 1 + saturation / 100;
            signal = avgSignal + (signal - avgSignal) * satFactor;

            signal = Math.max(0.01, Math.min(0.99, signal));

            const y = h * (1 - signal) * 0.83 + h * 0.08;
            if (x === pStartX) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        });
      }

      ctx.shadowBlur = 0;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [params, scopeMode]);

  return (
    <div className="bg-[#04060c] p-3 rounded-xl border border-slate-900 shadow-inner flex flex-col gap-2 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Real-time Hardware Scopes Monitor</span>
        </span>
        <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => setScopeMode('rgb_parade')}
            className={`px-2 py-0.5 text-[8px] font-bold rounded transition-colors cursor-pointer ${
              scopeMode === 'rgb_parade' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            RGB Parade
          </button>
          <button
            onClick={() => setScopeMode('luma')}
            className={`px-2 py-0.5 text-[8px] font-bold rounded transition-colors cursor-pointer ${
              scopeMode === 'luma' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Luma
          </button>
        </div>
      </div>

      <div className="relative h-28 w-full rounded bg-slate-950 overflow-hidden border border-slate-900/40">
        <canvas ref={canvasRef} width={320} height={112} className="w-full h-full" />
      </div>

      <span className="text-[7.5px] text-slate-500 font-mono text-center block">
        Analytic Feed: CineMotion Scope Engine v1.2 · 100% reactive to lift, gamma, gain and LUT nodes.
      </span>
    </div>
  );
};

export default function ColorGrading({ params, onChange }: ColorGradingProps) {
  // Reset individual slider to default
  const handleSliderReset = (key: keyof ColorGradingParams, defaultValue: any) => {
    onChange({ ...params, [key]: defaultValue });
  };

  const updateParam = (key: keyof ColorGradingParams, value: any) => {
    onChange({ ...params, [key]: value });
  };

  // Mini Interactive Color Wheel Renderer & Logic
  const ColorWheel = ({
    label,
    value,
    onWheelChange,
  }: {
    label: string;
    value: { r: number; g: number; b: number };
    onWheelChange: (offset: { r: number; g: number; b: number }) => void;
  }) => {
    const wheelRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Calculate cursor position from RGB values
    const maxOffset = 25;
    const x = ((value.r - value.b) / 100) * maxOffset;
    const y = ((value.g - (value.r + value.b) / 2) / 100) * maxOffset;

    const handlePointerDown = (e: React.PointerEvent) => {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    const updatePosition = (e: React.PointerEvent) => {
      const wheel = wheelRef.current;
      if (!wheel) return;
      const rect = wheel.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate vector from center
      let dx = e.clientX - centerX;
      let dy = e.clientY - centerY;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const limit = rect.width / 2;

      if (distance > limit) {
        dx = (dx / distance) * limit;
        dy = (dy / distance) * limit;
      }

      // Convert DX, DY coordinates back into R, G, B offsets (-35 to 35)
      const normX = dx / limit; // -1 to 1
      const normY = dy / limit; // -1 to 1

      const rOffset = Math.round(normX * 25 - normY * 12);
      const gOffset = Math.round(normY * 30);
      const bOffset = Math.round(-normX * 25 - normY * 12);

      onWheelChange({
        r: Math.max(-35, Math.min(35, rOffset)),
        g: Math.max(-35, Math.min(35, gOffset)),
        b: Math.max(-35, Math.min(35, bOffset)),
      });
    };

    const handleReset = () => {
      onWheelChange({ r: 0, g: 0, b: 0 });
    };

    return (
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{label}</span>
        
        {/* Interactive spectrum circle */}
        <div
          ref={wheelRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleReset}
          className="relative w-16 h-16 rounded-full border border-slate-850 shadow-md cursor-crosshair overflow-hidden group/wheel"
          style={{
            background: 'conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red)',
          }}
        >
          {/* Subtle brightness gradient overlay */}
          <div className="absolute inset-0 bg-radial-gradient from-white/20 via-transparent to-black/50" />

          {/* Draggable cursor knob */}
          <div
            className="absolute w-3.5 h-3.5 bg-slate-950 border-2 border-white rounded-full shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-shadow group-hover/wheel:shadow-indigo-500/50"
            style={{
              left: `${50 + (x / maxOffset) * 40}%`,
              top: `${50 + (y / maxOffset) * 40}%`,
            }}
          />
        </div>
        
        <button
          onClick={handleReset}
          className="text-[8px] font-bold text-slate-500 hover:text-indigo-400 active:scale-95 transition-all"
        >
          Reset
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Real-time scopes at the top for professional immediate visual feedback */}
      <ScopesMonitor params={params} />

      {/* 1. LUT Preset Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span>Cinematic LUT / Color Nodes</span>
        </label>
        
        {/* Gallery container */}
        <div className="grid grid-cols-3 gap-2">
          {LUTS.map((lut) => (
            <button
              key={lut.id}
              onClick={() => updateParam('lut', lut.id)}
              className={`flex flex-col p-2 rounded-xl border text-left transition-all relative overflow-hidden group ${
                params.lut === lut.id
                  ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                  : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/30 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-extrabold text-white block truncate leading-none">{lut.name}</span>
                {params.lut === lut.id && (
                  <span className="text-[9px] text-indigo-400 font-extrabold leading-none">✓</span>
                )}
              </div>

              {/* Graphic Split Preview representing before / after split */}
              <div className="w-full h-1.5 rounded bg-slate-900 my-1.5 flex overflow-hidden border border-slate-900/80">
                <div className="h-full flex-1" style={{ backgroundColor: lut.originalSplit }} />
                <div className="h-full flex-1" style={{ backgroundColor: lut.gradedSplit }} />
              </div>

              <span className="text-[8px] text-slate-500 block leading-tight truncate">{lut.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Three-Way Color Wheels (Lift, Gamma, Gain) */}
      <div className="flex flex-col gap-2 border-t border-slate-900/80 pt-3.5">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Droplets className="w-3.5 h-3.5 text-indigo-400" />
          <span>Three-Way Color Wheels</span>
        </label>
        <div className="grid grid-cols-3 gap-1 py-2 bg-slate-950/40 rounded-2xl border border-slate-900/60 shadow-inner">
          <ColorWheel
            label="Lift (Shadow)"
            value={params.lift}
            onWheelChange={(val) => updateParam('lift', val)}
          />
          <ColorWheel
            label="Gamma (Mid)"
            value={params.gamma}
            onWheelChange={(val) => updateParam('gamma', val)}
          />
          <ColorWheel
            label="Gain (Highlight)"
            value={params.gain}
            onWheelChange={(val) => updateParam('gain', val)}
          />
        </div>
      </div>

      {/* 3. Detailed Parameter Sliders */}
      <div className="flex flex-col gap-3 border-t border-slate-900/80 pt-3.5">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Primary Grading Sliders
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 bg-[#04060c] p-3 rounded-xl border border-slate-900">
          
          {/* Exposure Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Exposure</span>
              </span>
              <span className="font-mono tabular-nums text-indigo-400 font-bold">{params.brightness > 0 ? `+${params.brightness}` : params.brightness}</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              value={params.brightness}
              onChange={(e) => updateParam('brightness', Number(e.target.value))}
              onDoubleClick={() => handleSliderReset('brightness', 0)}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Contrast Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                <Contrast className="w-3 h-3 text-purple-400" />
                <span>Contrast</span>
              </span>
              <span className="font-mono tabular-nums text-indigo-400 font-bold">{params.contrast > 0 ? `+${params.contrast}` : params.contrast}%</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              value={params.contrast}
              onChange={(e) => updateParam('contrast', Number(e.target.value))}
              onDoubleClick={() => handleSliderReset('contrast', 0)}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Saturation Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>Saturation</span>
              </span>
              <span className="font-mono tabular-nums text-indigo-400 font-bold">{params.saturation > 0 ? `+${params.saturation}` : params.saturation}%</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              value={params.saturation}
              onChange={(e) => updateParam('saturation', Number(e.target.value))}
              onDoubleClick={() => handleSliderReset('saturation', 0)}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Temp (Warmth) Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                <Thermometer className="w-3 h-3 text-orange-400" />
                <span>Temperature</span>
              </span>
              <span className="font-mono tabular-nums text-indigo-400 font-bold">{params.temperature > 0 ? `+${params.temperature}` : params.temperature}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={params.temperature}
              onChange={(e) => updateParam('temperature', Number(e.target.value))}
              onDoubleClick={() => handleSliderReset('temperature', 0)}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Tint Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Tint (G/M)</span>
              </span>
              <span className="font-mono tabular-nums text-indigo-400 font-bold">{params.tint > 0 ? `+${params.tint}` : params.tint}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={params.tint}
              onChange={(e) => updateParam('tint', Number(e.target.value))}
              onDoubleClick={() => handleSliderReset('tint', 0)}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Vignette Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                <EyeOff className="w-3 h-3 text-slate-400" />
                <span>Vignette</span>
              </span>
              <span className="font-mono tabular-nums text-indigo-400 font-bold">{params.vignette}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.vignette}
              onChange={(e) => updateParam('vignette', Number(e.target.value))}
              onDoubleClick={() => handleSliderReset('vignette', 0)}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Motion Blur Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                <Activity className="w-3 h-3 text-pink-400 animate-pulse" />
                <span>Motion Blur (Shutter)</span>
              </span>
              <span className="font-mono tabular-nums text-indigo-400 font-bold">{params.motionBlur}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.motionBlur}
              onChange={(e) => updateParam('motionBlur', Number(e.target.value))}
              onDoubleClick={() => handleSliderReset('motionBlur', 0)}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
