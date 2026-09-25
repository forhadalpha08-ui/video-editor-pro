import React, { useRef, useEffect, useState } from 'react';
import { 
  Activity, 
  Eye, 
  Layers, 
  Sliders, 
  Grid, 
  Sun, 
  Check, 
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { ColorGradingParams } from '../types';

interface ScopesMonitorProps {
  colorGrading?: ColorGradingParams;
  isPlaying?: boolean;
}

export default function ScopesMonitor({ colorGrading, isPlaying }: ScopesMonitorProps) {
  const [activeScope, setActiveScope] = useState<'vectorscope' | 'rgb_parade' | 'waveform' | 'audio_vu'>('vectorscope');
  const [showSafeMargins, setShowSafeMargins] = useState(true);
  const [showRuleOfThirds, setShowRuleOfThirds] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animate scopes simulation based on active color grading params and playing tick
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const grading = colorGrading || {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      vignette: 0,
      sharpness: 0,
      motionBlur: 0,
      lut: 'none',
      lift: { r: 0, g: 0, b: 0 },
      gamma: { r: 0, g: 0, b: 0 },
      gain: { r: 0, g: 0, b: 0 },
    };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#03050c';
    ctx.fillRect(0, 0, w, h);

    // 1. VECTORSCOPE
    if (activeScope === 'vectorscope') {
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;

      // Draw graticule circles
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.arc(cx, cy, radius * 0.75, 0, Math.PI * 2);
      ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Color targets: Red, Magenta, Blue, Cyan, Green, Yellow
      const targets = [
        { label: 'R', angle: 104, color: '#ef4444' },
        { label: 'Mg', angle: 61, color: '#ec4899' },
        { label: 'B', angle: 347, color: '#3b82f6' },
        { label: 'Cy', angle: 284, color: '#06b6d4' },
        { label: 'G', angle: 241, color: '#10b981' },
        { label: 'Yl', angle: 167, color: '#eab308' },
      ];

      targets.forEach((t) => {
        const rad = (t.angle * Math.PI) / 180;
        const tx = cx + Math.cos(rad) * radius * 0.75;
        const ty = cy + Math.sin(rad) * radius * 0.75;

        ctx.strokeStyle = t.color;
        ctx.strokeRect(tx - 3, ty - 3, 6, 6);

        ctx.fillStyle = t.color;
        ctx.font = 'bold 8px monospace';
        ctx.fillText(t.label, tx + 6, ty + 3);
      });

      // Scatter cloud of color points
      const satFactor = Math.max(0.2, 1 + grading.saturation / 100);
      const tempRad = (grading.temperature / 100) * 0.6;
      const tintRad = (grading.tint / 100) * 0.6;

      ctx.fillStyle = '#00ffea';
      ctx.shadowColor = '#00ffea';
      ctx.shadowBlur = 4;

      const numPoints = 120;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2 + tempRad;
        const dist = (Math.sin(i * 3.7) * 0.5 + 0.5) * radius * 0.65 * satFactor;
        const px = cx + Math.cos(angle) * dist + tintRad * 15;
        const py = cy + Math.sin(angle) * dist;

        ctx.fillRect(px, py, 1.5, 1.5);
      }
      ctx.shadowBlur = 0;
    }

    // 2. RGB PARADE
    if (activeScope === 'rgb_parade') {
      const colW = w / 3;
      const channels = [
        { label: 'RED', color: '#ef4444', boost: grading.gain.r + grading.temperature * 0.4 },
        { label: 'GREEN', color: '#10b981', boost: grading.gamma.g + grading.tint * 0.3 },
        { label: 'BLUE', color: '#3b82f6', boost: grading.gain.b - grading.temperature * 0.4 },
      ];

      channels.forEach((ch, idx) => {
        const ox = idx * colW;

        // Channel boundary line
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(ox, 0, colW, h);

        ctx.fillStyle = ch.color;
        ctx.font = 'bold 9px monospace';
        ctx.fillText(ch.label, ox + 6, 14);

        // Draw intensity columns
        const points = 40;
        const step = colW / points;
        ctx.fillStyle = ch.color;

        for (let i = 0; i < points; i++) {
          const sample = (Math.sin(i * 0.4 + idx) * 0.3 + 0.5) * (h * 0.6) + ch.boost;
          const barH = Math.max(10, Math.min(h - 20, sample + grading.contrast * 0.3));
          ctx.fillRect(ox + i * step + 2, h - barH - 8, step * 0.8, barH);
        }
      });
    }

    // 3. LUMINANCE WAVEFORM (0-100 IRE)
    if (activeScope === 'waveform') {
      // Draw horizontal IRE reference grid
      const ireLevels = [100, 75, 50, 25, 0];
      ireLevels.forEach((ire) => {
        const y = h - (ire / 100) * (h - 20) - 10;
        ctx.strokeStyle = ire === 100 || ire === 0 ? '#475569' : '#1e293b';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '7.5px monospace';
        ctx.fillText(`${ire} IRE`, 4, y - 2);
      });

      // Draw Luminance waveform trace
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 3;

      const samples = 80;
      const step = w / samples;
      for (let i = 0; i < samples; i++) {
        const baseLum = (Math.sin(i * 0.25) * 0.3 + 0.5) * 60 + grading.brightness * 0.3;
        const ire = Math.max(0, Math.min(100, baseLum + grading.contrast * 0.25));
        const y = h - (ire / 100) * (h - 20) - 10;
        ctx.fillRect(i * step, y, step * 0.85, (Math.sin(i * 1.2) * 0.5 + 0.5) * 25 + 4);
      }
      ctx.shadowBlur = 0;
    }

    // 4. STEREO AUDIO VU METER
    if (activeScope === 'audio_vu') {
      const barW = 28;
      const leftX = w / 2 - barW - 10;
      const rightX = w / 2 + 10;

      const dbValues = [
        { label: 'L', x: leftX, level: isPlaying ? 78 + Math.random() * 15 : 45 },
        { label: 'R', x: rightX, level: isPlaying ? 75 + Math.random() * 18 : 42 },
      ];

      dbValues.forEach((ch) => {
        // Meter frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ch.x, 15, barW, h - 30);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(ch.x, 15, barW, h - 30);

        // Gradient filled level
        const levelH = ((ch.level / 100) * (h - 30));
        const vuGrad = ctx.createLinearGradient(0, h - 15, 0, 15);
        vuGrad.addColorStop(0, '#10b981');
        vuGrad.addColorStop(0.7, '#eab308');
        vuGrad.addColorStop(1, '#ef4444');

        ctx.fillStyle = vuGrad;
        ctx.fillRect(ch.x + 2, h - 15 - levelH, barW - 4, levelH);

        // Peak line
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ch.x + 2, h - 15 - levelH - 2, barW - 4, 2);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(ch.label, ch.x + barW / 2 - 3, h - 3);
      });
    }

  }, [activeScope, colorGrading, isPlaying]);

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-white flex items-center gap-1.5">
              <span>Pro Color Scopes & Video Analysis</span>
              <span className="px-1.5 py-0.2 bg-gradient-to-r from-emerald-500 to-teal-500 text-[8px] font-black rounded-md text-white uppercase tracking-normal">
                DaVinci Resolve Pro
              </span>
            </span>
            <span className="text-[9.5px] text-slate-400">
              Live Vectorscope, RGB Parade, Luminance Waveform 0–100 IRE & Stereo Audio VU meters.
            </span>
          </div>
        </div>
      </div>

      {/* Scope Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-indigo-500/20 shadow-inner">
        {[
          { id: 'vectorscope', label: 'Vectorscope', icon: Activity },
          { id: 'rgb_parade', label: 'RGB Parade', icon: Sliders },
          { id: 'waveform', label: 'Waveform', icon: Sun },
          { id: 'audio_vu', label: 'Audio VU dB', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScope === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveScope(tab.id as any)}
              className={`py-2 px-1.5 rounded-lg font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Real-time Visual Scope Canvas Monitor */}
      <div className="bg-slate-950/80 border border-indigo-500/20 rounded-2xl p-3 flex flex-col gap-2.5 shadow-2xl">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>REAL-TIME COLOR METRICS</span>
          <span className="text-cyan-400 font-bold uppercase">{activeScope.replace('_', ' ')}</span>
        </div>

        <div className="w-full h-44 bg-[#03050c] rounded-xl overflow-hidden border border-slate-900 relative flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={340}
            height={176}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Composition Safe Margins & Framing Overlays */}
      <div className="flex flex-col gap-2 bg-slate-950/60 border border-indigo-500/15 p-3.5 rounded-2xl">
        <span className="font-bold text-white text-[10.5px]">Broadcast Safe Areas & Framing Guides</span>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowSafeMargins(!showSafeMargins)}
            className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
              showSafeMargins
                ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col text-left">
              <span className="font-bold text-[10px]">90% Action / 80% Title Safe</span>
              <span className="text-[8px] text-slate-400">SMPTE Broadcast Guides</span>
            </div>
            {showSafeMargins && <Check className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          <button
            onClick={() => setShowRuleOfThirds(!showRuleOfThirds)}
            className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
              showRuleOfThirds
                ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col text-left">
              <span className="font-bold text-[10px]">Rule of Thirds Grid (3x3)</span>
              <span className="text-[8px] text-slate-400">Cinematic Framing Grid</span>
            </div>
            {showRuleOfThirds && <Check className="w-3.5 h-3.5 text-indigo-400" />}
          </button>
        </div>
      </div>

    </div>
  );
}
