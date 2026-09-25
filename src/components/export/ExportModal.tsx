import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  Check, 
  Sparkles, 
  HardDrive, 
  Clock, 
  FileVideo, 
  ShieldCheck,
  Play
} from 'lucide-react';
import { Project } from '../../types';

interface ExportModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ project, isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'MP4' | 'WebM' | 'MOV'>('MP4');
  const [codec, setCodec] = useState<'H.264' | 'H.265' | 'VP9'>('H.264');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '1440p' | '4K'>('1080p');
  const [fps, setFps] = useState<24 | 25 | 30 | 50 | 60>(60);
  const [quality, setQuality] = useState<'Low' | 'Medium' | 'High' | 'Custom'>('High');
  const [audioFormat, setAudioFormat] = useState<'AAC' | 'WAV'>('AAC');
  
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRendering) {
      interval = setInterval(() => {
        setRenderProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRendering(false);
            setIsFinished(true);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isRendering]);

  if (!isOpen) return null;

  // Calculate estimated file size
  const getEstimatedSize = () => {
    let mbPerMin = 45;
    if (resolution === '720p') mbPerMin = 25;
    if (resolution === '1440p') mbPerMin = 90;
    if (resolution === '4K') mbPerMin = 220;
    if (quality === 'Low') mbPerMin *= 0.6;
    if (quality === 'Medium') mbPerMin *= 0.85;
    const durationMin = project.duration / 60;
    return (durationMin * mbPerMin).toFixed(1);
  };

  const handleStartRender = () => {
    setIsRendering(true);
    setRenderProgress(0);
    setIsFinished(false);
  };

  const handleDownload = () => {
    // Generate a dummy blob or trigger download
    const filename = `${project.name.replace(/\s+/g, '_')}_${resolution}_${fps}fps.${format.toLowerCase()}`;
    const blob = new Blob(['VEdit Pro Master Export Rendered Output'], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-[#090D1C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-white/8 flex items-center justify-between bg-[#0D1224]/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-white">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Export Master Video</h2>
              <p className="text-[10px] text-slate-400">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 text-xs text-slate-300">
          
          {isFinished ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white">Export Completed Successfully!</h3>
              <p className="text-[11px] text-slate-400">Master video rendered in {resolution} @ {fps}fps ({getEstimatedSize()} MB).</p>
              
              <button
                onClick={handleDownload}
                className="mt-2 btn-vedit-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span>Download Video File</span>
              </button>
            </div>
          ) : isRendering ? (
            <div className="py-8 flex flex-col items-center justify-center gap-4">
              <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>Encoding Frames (GPU Accelerated)...</span>
                <span className="font-mono text-[#A78BFA]">{renderProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] rounded-full transition-all duration-200"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
              <button
                onClick={() => {
                  setIsRendering(false);
                  setRenderProgress(0);
                }}
                className="text-[11px] text-rose-400 hover:underline cursor-pointer"
              >
                Cancel Render
              </button>
            </div>
          ) : (
            <>
              {/* Format & Codec */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Container Format</span>
                  <div className="grid grid-cols-3 gap-1 bg-[#0D1224] p-1 rounded-xl border border-white/8">
                    {(['MP4', 'WebM', 'MOV'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          format === f ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Video Codec</span>
                  <div className="grid grid-cols-3 gap-1 bg-[#0D1224] p-1 rounded-xl border border-white/8">
                    {(['H.264', 'H.265', 'VP9'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCodec(c)}
                        className={`py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          codec === c ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resolution & FPS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Master Resolution</span>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full bg-[#0D1224] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="720p">720p (HD - 1280x720)</option>
                    <option value="1080p">1080p (Full HD - 1920x1080)</option>
                    <option value="1440p">1440p (2K - 2560x1440)</option>
                    <option value="4K">4K (Ultra HD - 3840x2160)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Frame Rate (FPS)</span>
                  <select
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value) as any)}
                    className="w-full bg-[#0D1224] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value={24}>24 fps (Cinematic Film)</option>
                    <option value={25}>25 fps (PAL Broadcast)</option>
                    <option value={30}>30 fps (Standard Web)</option>
                    <option value={50}>50 fps (European High Motion)</option>
                    <option value={60}>60 fps (Smooth 60FPS Pro)</option>
                  </select>
                </div>
              </div>

              {/* Estimated details card */}
              <div className="p-3 bg-[#0D1224] rounded-xl border border-white/8 flex items-center justify-around text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500">Est. File Size</span>
                  <span className="text-xs font-bold text-white font-mono">{getEstimatedSize()} MB</span>
                </div>
                <div className="w-[1px] h-6 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500">Duration</span>
                  <span className="text-xs font-bold text-white font-mono">
                    {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="w-[1px] h-6 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500">Audio Codec</span>
                  <span className="text-xs font-bold text-white font-mono">{audioFormat} (320kbps)</span>
                </div>
              </div>

              {/* Start Export Button */}
              <button
                onClick={handleStartRender}
                className="btn-vedit-primary w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl mt-1"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Export Rendering</span>
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
