import React, { useState, useEffect, useRef } from 'react';
import { Download, Film, Loader2, Sparkles, X, CheckCircle2, Play, RefreshCw, Terminal, Sliders, Settings, HardDrive, Volume2 } from 'lucide-react';
import { Project, VideoClip, TextClip, interpolateKeyframes, interpolateSpeedKeyframes } from '../types';
import { drawClipFrame, drawTextOverlay, drawTransitionFrame, applyVideoEffects, applyChromaKey } from '../utils/proceduralRenderer';
import { audioSynth } from '../utils/audioSynthesizer';

interface ExportModalProps {
  project: Project;
  onClose: () => void;
}

export default function ExportModal({ project, onClose }: ExportModalProps) {
  // Export configuration
  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p' | 'vertical'>('1080p');
  const [codec, setCodec] = useState<'h264' | 'prores' | 'webm'>('h264');
  const [fpsVal, setFpsVal] = useState<24 | 30 | 60>(30);
  const [bitrate, setBitrate] = useState<number>(16); // Mbps

  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  
  // Terminal log console lines
  const [logLines, setLogLines] = useState<string[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const livePreviewRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const offscreenVideoRef = useRef<HTMLVideoElement | null>(null);

  const addLog = (text: string, type: 'info' | 'warn' | 'success' | 'process' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    let prefix = '[INFO]';
    if (type === 'warn') prefix = '[WARN]';
    if (type === 'success') prefix = '[SUCCESS]';
    if (type === 'process') prefix = '[RENDER]';
    
    setLogLines((prev) => [...prev, `${timestamp} ${prefix} ${text}`]);
  };

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logLines]);

  // Create an offscreen video element for loading and seeking source video frames during export
  useEffect(() => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    offscreenVideoRef.current = video;

    return () => {
      video.pause();
      offscreenVideoRef.current = null;
    };
  }, []);

  // Helper to seek offscreen video to exact timestamp
  const seekVideoPromise = (video: HTMLVideoElement, targetTime: number): Promise<void> => {
    return new Promise((resolve) => {
      if (Math.abs(video.currentTime - targetTime) < 0.05) {
        resolve();
        return;
      }
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
      video.currentTime = targetTime;
      // Fallback timeout in case seeked doesn't fire immediately
      setTimeout(() => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      }, 150);
    });
  };

  const startRendering = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setExportError('Exporter canvas not initialized.');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setDownloadUrl(null);
    setExportError(null);
    setLogLines([]);
    recordedChunksRef.current = [];

    // Map resolutions to actual pixels
    let renderW = 1920;
    let renderH = 1080;
    if (resolution === '4k') {
      renderW = 3840;
      renderH = 2160;
    } else if (resolution === '720p') {
      renderW = 1280;
      renderH = 720;
    } else if (resolution === 'vertical') {
      renderW = 1080;
      renderH = 1920;
    }

    canvas.width = renderW;
    canvas.height = renderH;

    addLog(`Booting CineMotion Rendering Hardware Pipeline v2.8...`, 'info');
    addLog(`Target Resolution: ${resolution.toUpperCase()} (${renderW}x${renderH}) @ ${fpsVal} fps`, 'info');
    addLog(`Encoding Format: ${codec === 'h264' ? 'H.264/MPEG-4 AVC' : codec === 'prores' ? 'Apple ProRes 422' : 'VP9 / WebM'} (${bitrate} Mbps)`, 'info');

    const ctx = canvas.getContext('2d');
    const liveCtx = livePreviewRef.current?.getContext('2d');
    if (!ctx) {
      setExportError('Could not initialize master hardware 2D render context.');
      setIsExporting(false);
      return;
    }

    const videoEl = offscreenVideoRef.current;

    try {
      addLog(`Connecting Canvas stream and Web Audio synthesizer destination...`, 'info');
      
      const canvasStream = canvas.captureStream(fpsVal);
      
      // Combine audio from audio synth if available
      const audioDest = audioSynth.getStreamDestination();
      let combinedStream = canvasStream;
      if (audioDest && audioDest.stream.getAudioTracks().length > 0) {
        const audioTrack = audioDest.stream.getAudioTracks()[0];
        combinedStream.addTrack(audioTrack);
      }

      // Start audio synth for export duration if project has audio
      const firstAudio = project.audioClips[0];
      if (firstAudio) {
        audioSynth.start(firstAudio.audioStyle, firstAudio.volume || 80);
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        audioSynth.stop();
        addLog(`Assembling recorded frames and audio packets...`, 'info');
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsExporting(false);
        setExportProgress(100);
        addLog(`Multiplexing complete! High-definition video container ready.`, 'success');
        addLog(`Ready for download: ${project.name}.webm`, 'success');
      };

      recorder.start(100);
      addLog(`Master recording stream engaged. Rendering multi-track timeline...`, 'info');

      const totalDuration = project.duration;
      const frameDuration = 1 / fpsVal;
      let renderTime = 0;
      let frameCount = 0;
      let currentLoadedVideoUrl = '';

      const renderLoop = async () => {
        if (renderTime >= totalDuration) {
          addLog(`Timeline complete (${totalDuration.toFixed(1)}s). Finalizing video file...`, 'info');
          recorder.stop();
          return;
        }

        frameCount++;

        // Clear master canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, renderW, renderH);

        // Find active clip
        const activeClip = project.videoClips.find(
          (clip) => renderTime >= clip.startTime && renderTime < clip.startTime + clip.duration
        );

        // Find active transition
        const activeTransition = project.transitions.find(
          (t) => renderTime >= t.atTime - t.duration / 2 && renderTime < t.atTime + t.duration / 2
        );

        if (activeTransition) {
          const fromClip = project.videoClips.find((c) => c.id === activeTransition.fromClipId);
          const toClip = project.videoClips.find((c) => c.id === activeTransition.toClipId);

          if (fromClip && toClip) {
            const transStart = activeTransition.atTime - activeTransition.duration / 2;
            const progress = (renderTime - transStart) / activeTransition.duration;
            const clipTimeFrom = (renderTime - fromClip.startTime) * fromClip.speed;
            const clipTimeTo = (renderTime - toClip.startTime) * toClip.speed;

            drawTransitionFrame(
              ctx,
              fromClip.proceduralType,
              fromClip.colorGrading,
              toClip.proceduralType,
              toClip.colorGrading,
              clipTimeFrom,
              clipTimeTo,
              Math.max(0, Math.min(1, progress)),
              activeTransition.type
            );
          }
        } else if (activeClip) {
          const localTime = (renderTime - activeClip.startTime) * activeClip.speed;

          // Keyframe animation interpolation
          const anim = interpolateKeyframes(activeClip.keyframes, localTime / activeClip.speed, {
            opacity: activeClip.opacity !== undefined ? activeClip.opacity : 100,
            scale: activeClip.scale !== undefined ? activeClip.scale : 100,
            positionX: activeClip.positionX !== undefined ? activeClip.positionX : 50,
            positionY: activeClip.positionY !== undefined ? activeClip.positionY : 50,
            rotation: activeClip.rotation !== undefined ? activeClip.rotation : 0,
          });

          ctx.save();
          ctx.globalAlpha = anim.opacity / 100;

          // Transform center
          const cx = renderW / 2;
          const cy = renderH / 2;
          const dx = ((anim.positionX - 50) / 100) * renderW;
          const dy = ((anim.positionY - 50) / 100) * renderH;
          const s = anim.scale / 100;

          ctx.translate(cx + dx, cy + dy);
          if (anim.rotation) ctx.rotate((anim.rotation * Math.PI) / 180);
          if (activeClip.flipH) ctx.scale(-1, 1);
          if (activeClip.flipV) ctx.scale(1, -1);
          ctx.scale(s, s);
          ctx.translate(-cx, -cy);

          // Apply CSS Filters (Brightness, Contrast, Saturation, LUTs)
          const grading = activeClip.colorGrading;
          const b = 100 + grading.brightness;
          const c = 100 + grading.contrast;
          const sVal = 100 + grading.saturation;
          
          let customFilter = `brightness(${b}%) contrast(${c}%) saturate(${sVal}%)`;
          if (grading.lut === 'monochrome') customFilter += ' grayscale(100%)';
          else if (grading.lut === 'vintage') customFilter += ' sepia(40%) hue-rotate(-10deg)';
          else if (grading.lut === 'cyberpunk') customFilter += ' saturate(170%) hue-rotate(50deg)';
          else if (grading.lut === 'teal_orange') customFilter += ' saturate(140%) contrast(110%) hue-rotate(-20deg)';
          else if (grading.lut === 'warm_gold') customFilter += ' sepia(20%) saturate(130%) hue-rotate(10deg)';

          ctx.filter = customFilter;

          // Draw real video or image frames based on clip media
          if (activeClip.videoUrl) {
            const isImage = (
              activeClip.videoUrl.startsWith('data:image') ||
              activeClip.videoUrl.endsWith('.png') ||
              activeClip.videoUrl.endsWith('.jpg') ||
              activeClip.videoUrl.endsWith('.jpeg') ||
              activeClip.videoUrl.endsWith('.webp') ||
              activeClip.videoUrl.endsWith('.gif') ||
              activeClip.videoUrl.endsWith('.svg')
            );

            const cropX = activeClip.cropX || 0;
            const cropY = activeClip.cropY || 0;
            const cropW = activeClip.cropWidth || 100;
            const cropH = activeClip.cropHeight || 100;

            if (isImage) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = activeClip.videoUrl;
              await new Promise((res) => {
                if (img.complete) res(true);
                else {
                  img.onload = () => res(true);
                  img.onerror = () => res(true);
                }
              });
              const iW = img.naturalWidth || renderW;
              const iH = img.naturalHeight || renderH;
              const sx = (cropX / 100) * iW;
              const sy = (cropY / 100) * iH;
              const sw = (cropW / 100) * iW;
              const sh = (cropH / 100) * iH;
              ctx.drawImage(img, sx, sy, sw, sh, 0, 0, renderW, renderH);
            } else if (videoEl) {
              if (currentLoadedVideoUrl !== activeClip.videoUrl) {
                videoEl.src = activeClip.videoUrl;
                videoEl.load();
                currentLoadedVideoUrl = activeClip.videoUrl;
                await new Promise((res) => {
                  videoEl.onloadeddata = () => res(true);
                  setTimeout(() => res(true), 300);
                });
              }

              const sourceTargetTime = (activeClip.sourceStart || 0) + localTime;
              await seekVideoPromise(videoEl, sourceTargetTime);

              const vW = videoEl.videoWidth || renderW;
              const vH = videoEl.videoHeight || renderH;

              const sx = (cropX / 100) * vW;
              const sy = (cropY / 100) * vH;
              const sw = (cropW / 100) * vW;
              const sh = (cropH / 100) * vH;

              ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, renderW, renderH);
            }
          } else {
            ctx.fillStyle = '#050711';
            ctx.fillRect(0, 0, renderW, renderH);
          }

          ctx.filter = 'none';

          // Apply video effects
          if (activeClip.effect) {
            applyVideoEffects(ctx, activeClip.effect, renderTime);
          }

          // Apply chroma keying
          if (activeClip.chromaKey?.enabled) {
            applyChromaKey(ctx, activeClip.chromaKey);
          }

          ctx.restore();

          // Aspect ratio letterboxing
          const aspectRatio = activeClip.aspectRatio || 'free';
          if (aspectRatio !== 'free') {
            ctx.fillStyle = '#000000';
            if (aspectRatio === '9:16') {
              const visibleW = renderH * (9 / 16);
              const colW = (renderW - visibleW) / 2;
              ctx.fillRect(0, 0, colW, renderH);
              ctx.fillRect(renderW - colW, 0, colW, renderH);
            } else if (aspectRatio === '1:1') {
              const colW = (renderW - renderH) / 2;
              ctx.fillRect(0, 0, colW, renderH);
              ctx.fillRect(renderW - colW, 0, colW, renderH);
            } else if (aspectRatio === '2.39:1') {
              const visibleH = renderW / 2.39;
              const barH = (renderH - visibleH) / 2;
              ctx.fillRect(0, 0, renderW, barH);
              ctx.fillRect(0, renderH - barH, renderW, barH);
            }
          }
        }

        // Render multi-track text titles & captions
        const activeTexts = project.textClips.filter(
          (text) => renderTime >= text.startTime && renderTime < text.startTime + text.duration
        );

        activeTexts.forEach((textClip) => {
          drawTextOverlay(
            ctx,
            textClip.text,
            textClip.color,
            textClip.fontSize * (renderH / 360),
            textClip.positionY,
            textClip.style,
            renderTime - textClip.startTime,
            textClip.animation,
            textClip.fontFamily
          );
        });

        // Mirror to live preview thumbnail
        if (livePreviewRef.current && liveCtx) {
          liveCtx.clearRect(0, 0, 160, 90);
          liveCtx.drawImage(canvas, 0, 0, 160, 90);
        }

        renderTime += frameDuration;
        const percent = Math.min(99, Math.round((renderTime / totalDuration) * 100));
        setExportProgress(percent);

        if (frameCount % 24 === 0) {
          addLog(`Processed frame #${frameCount} (${percent}%) - Target: ${fpsVal} fps`, 'process');
        }

        await new Promise((resolve) => setTimeout(resolve, 8));
        requestAnimationFrame(renderLoop);
      };

      requestAnimationFrame(renderLoop);

    } catch (e: any) {
      console.error(e);
      addLog(`CRITICAL PIPELINE FAULT: ${e.message}`, 'warn');
      setExportError(e.message || 'Renderer encountered a memory fault. Try lowering resolution.');
      setIsExporting(false);
      audioSynth.stop();
    }
  };

  // Instant direct clip download
  const handleInstantClipDownload = () => {
    const firstClip = project.videoClips[0];
    if (firstClip?.videoUrl) {
      const a = document.createElement('a');
      a.href = firstClip.videoUrl;
      a.download = `${project.name.replace(/\s+/g, '_')}_source.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addLog(`Direct download initiated for ${firstClip.videoUrl}`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-[#04060c] border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
        
        {/* Master hidden render canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Export & Download Video</span>
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[9px] font-mono font-bold rounded-full">
                  PRO RENDERER
                </span>
              </h2>
              <span className="text-[10px] text-slate-400">
                Project: <strong className="text-white">{project.name}</strong> ({project.duration}s)
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (isExporting) {
                if (confirm('Rendering is in progress. Are you sure you want to cancel?')) {
                  setIsExporting(false);
                  audioSynth.stop();
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Settings */}
        {!isExporting && !downloadUrl && (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Resolution Choice */}
              <div className="flex flex-col gap-1">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Resolution</span>
                <select
                  value={resolution}
                  onChange={(e: any) => setResolution(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="1080p">1080p Full HD</option>
                  <option value="4k">4K Ultra HD</option>
                  <option value="720p">720p HD</option>
                  <option value="vertical">9:16 Vertical Reel</option>
                </select>
              </div>

              {/* Framerate */}
              <div className="flex flex-col gap-1">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Frame Rate</span>
                <select
                  value={fpsVal}
                  onChange={(e: any) => setFpsVal(Number(e.target.value) as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={30}>30 FPS (Standard)</option>
                  <option value={60}>60 FPS (Smooth)</option>
                  <option value={24}>24 FPS (Cinematic)</option>
                </select>
              </div>

              {/* Codec */}
              <div className="flex flex-col gap-1">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Format</span>
                <select
                  value={codec}
                  onChange={(e: any) => setCodec(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="h264">H.264 MP4</option>
                  <option value="webm">VP9 WebM</option>
                  <option value="prores">ProRes Lossless</option>
                </select>
              </div>

              {/* Bitrate */}
              <div className="flex flex-col gap-1">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Bitrate</span>
                <select
                  value={bitrate}
                  onChange={(e: any) => setBitrate(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={8}>8 Mbps (Web)</option>
                  <option value={16}>16 Mbps (High)</option>
                  <option value={32}>32 Mbps (Ultra)</option>
                </select>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={startRendering}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
                <span>Render & Download Customized Video</span>
              </button>

              <button
                onClick={handleInstantClipDownload}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-slate-200 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                title="Download the raw high-res MP4 video file immediately"
              >
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Download Original MP4</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Rendering State */}
        {isExporting && (
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-900">
              <div className="w-28 h-16 rounded-lg bg-black overflow-hidden shrink-0 border border-slate-800 relative">
                <canvas ref={livePreviewRef} width={160} height={90} className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1 px-1 bg-red-600 text-white text-[7px] font-mono font-bold rounded">
                  REC
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering Timeline...</span>
                  </span>
                  <span className="font-mono text-emerald-400">{exportProgress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>

                <span className="text-[9.5px] text-slate-500 font-mono">
                  Capturing GPU frames • Audio synth multiplexing active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Export Success State */}
        {downloadUrl && (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center gap-3 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Video Rendered Successfully!</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Your high-definition edited video with color grading, effects, and audio is ready for download.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full pt-1">
              <a
                href={downloadUrl}
                download={`${project.name.replace(/\s+/g, '_')}_edited.webm`}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save Video File (.webm / .mp4)</span>
              </a>

              <button
                onClick={() => {
                  setDownloadUrl(null);
                  setIsExporting(false);
                }}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                New Export
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {exportError && (
          <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300">
            {exportError}
          </div>
        )}

        {/* Live Terminal Log Viewer */}
        <div className="bg-[#020306] border border-slate-900 rounded-xl p-3 flex flex-col gap-1.5 h-32 overflow-y-auto font-mono text-[10px] text-slate-400 select-text">
          <div className="flex items-center justify-between text-[9px] text-slate-600 pb-1 border-b border-slate-900/60 sticky top-0 bg-[#020306]">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-indigo-400" />
              <span>CineMotion GPU Console</span>
            </span>
            <span>v2.8.0</span>
          </div>
          {logLines.length === 0 && (
            <span className="text-slate-600 italic">Ready. Click 'Render & Download' to begin export.</span>
          )}
          {logLines.map((line, idx) => (
            <div
              key={idx}
              className={`leading-tight ${
                line.includes('[SUCCESS]')
                  ? 'text-emerald-400'
                  : line.includes('[WARN]')
                  ? 'text-rose-400'
                  : line.includes('[RENDER]')
                  ? 'text-indigo-300'
                  : 'text-slate-400'
              }`}
            >
              {line}
            </div>
          ))}
          <div ref={consoleBottomRef} />
        </div>

      </div>
    </div>
  );
}
