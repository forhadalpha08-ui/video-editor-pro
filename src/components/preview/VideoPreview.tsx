import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Project, VideoClip, AudioClip, TextClip, interpolateKeyframes } from '../../types';

interface VideoPreviewProps {
  project: Project;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: (playing: boolean) => void;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5' | '4:3';
  onChangeAspectRatio: (ratio: '16:9' | '9:16' | '1:1' | '4:5' | '4:3') => void;
}

export default function VideoPreview({
  project,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onTogglePlay,
  aspectRatio,
  onChangeAspectRatio,
}: VideoPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const imageElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<'fit' | '100%' | '150%'>('fit');

  const aspectRatios: ('16:9' | '9:16' | '1:1' | '4:5' | '4:3')[] = ['16:9', '9:16', '1:1', '4:5', '4:3'];

  // Current time ref for smooth animation loop
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Format seconds to HH:MM:SS / MM:SS
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get Aspect ratio dimensions
  const getAspectRatioDimensions = () => {
    switch (aspectRatio) {
      case '9:16': return { width: 1080, height: 1920, cssAspect: '9/16' };
      case '1:1': return { width: 1080, height: 1080, cssAspect: '1/1' };
      case '4:5': return { width: 1080, height: 1350, cssAspect: '4/5' };
      case '4:3': return { width: 1440, height: 1080, cssAspect: '4/3' };
      case '16:9':
      default:
        return { width: 1920, height: 1080, cssAspect: '16/9' };
    }
  };

  // Render current frame to canvas
  const renderCanvasFrame = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: targetW, height: targetH } = getAspectRatioDimensions();
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    // Clear background
    ctx.fillStyle = '#050712';
    ctx.fillRect(0, 0, targetW, targetH);

    // 1. Render Video Tracks (v1 base, v2 overlay)
    const activeClips = project.videoClips.filter(
      c => time >= c.startTime && time < c.startTime + c.duration
    );

    activeClips.forEach(clip => {
      const localTime = (time - clip.startTime) * clip.speed + clip.sourceStart;

      // Keyframed transforms
      const kf = interpolateKeyframes(clip.keyframes, time - clip.startTime, {
        opacity: clip.opacity ?? 100,
        scale: clip.scale ?? 100,
        positionX: clip.positionX ?? 50,
        positionY: clip.positionY ?? 50,
        rotation: clip.rotation ?? 0,
      });

      ctx.save();

      // Apply opacity & blend mode
      ctx.globalAlpha = Math.max(0, Math.min(1, kf.opacity / 100));
      if (clip.blendMode && clip.blendMode !== 'normal') {
        ctx.globalCompositeOperation = clip.blendMode as GlobalCompositeOperation;
      }

      // Apply Color Grading Filters
      const cg = clip.colorGrading || {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        exposure: 0,
        highlights: 0,
        shadows: 0,
        sharpness: 0,
        vignette: 0,
        filterPreset: 'none',
        filterIntensity: 100
      };

      const brightnessVal = 100 + (cg.brightness || 0) + (cg.exposure || 0);
      const contrastVal = 100 + (cg.contrast || 0);
      const saturateVal = 100 + (cg.saturation || 0);
      const sepiaVal = cg.filterPreset === 'vintage_70s' ? 40 : 0;
      const invertVal = clip.effect === 'invert' ? 100 : 0;
      const blurVal = clip.effect === 'blur' ? 4 : 0;

      ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturateVal}%) sepia(${sepiaVal}%) invert(${invertVal}%) blur(${blurVal}px)`;

      // Handle Real Video vs Real Image vs Procedural
      if (clip.videoUrl) {
        let videoEl = videoElementsRef.current.get(clip.id);
        if (!videoEl) {
          videoEl = document.createElement('video');
          videoEl.src = clip.videoUrl;
          videoEl.crossOrigin = 'anonymous';
          videoEl.playsInline = true;
          videoEl.muted = isMuted || volume === 0;
          videoElementsRef.current.set(clip.id, videoEl);
        }

        // Seek sync
        if (Math.abs(videoEl.currentTime - localTime) > 0.25) {
          videoEl.currentTime = localTime;
        }

        if (isPlayingRef.current && videoEl.paused) {
          videoEl.play().catch(() => {});
        } else if (!isPlayingRef.current && !videoEl.paused) {
          videoEl.pause();
        }

        const posX = (kf.positionX / 100) * targetW;
        const posY = (kf.positionY / 100) * targetH;
        const scaleVal = kf.scale / 100;

        ctx.translate(posX, posY);
        if (kf.rotation) {
          ctx.rotate((kf.rotation * Math.PI) / 180);
        }
        ctx.scale(scaleVal, scaleVal);

        const drawW = targetW;
        const drawH = targetH;

        if (videoEl.readyState >= 2) {
          ctx.drawImage(videoEl, -drawW / 2, -drawH / 2, drawW, drawH);
        } else if (clip.thumbnailUrl) {
          let img = imageElementsRef.current.get(clip.thumbnailUrl);
          if (!img) {
            img = new Image();
            img.src = clip.thumbnailUrl;
            imageElementsRef.current.set(clip.thumbnailUrl, img);
          }
          if (img.complete) {
            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          }
        }
      } else if (clip.thumbnailUrl) {
        let img = imageElementsRef.current.get(clip.thumbnailUrl);
        if (!img) {
          img = new Image();
          img.src = clip.thumbnailUrl;
          imageElementsRef.current.set(clip.thumbnailUrl, img);
        }
        if (img.complete) {
          const posX = (kf.positionX / 100) * targetW;
          const posY = (kf.positionY / 100) * targetH;
          const scaleVal = kf.scale / 100;

          ctx.translate(posX, posY);
          if (kf.rotation) {
            ctx.rotate((kf.rotation * Math.PI) / 180);
          }
          ctx.scale(scaleVal, scaleVal);
          ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
        }
      }

      ctx.restore();

      // Vignette effect overlay
      if (cg.vignette > 0) {
        ctx.save();
        const vigGrad = ctx.createRadialGradient(
          targetW / 2, targetH / 2, targetW * 0.25,
          targetW / 2, targetH / 2, targetW * 0.75
        );
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, `rgba(0,0,0,${(cg.vignette / 100) * 0.85})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.restore();
      }
    });

    // 2. Render Text Overlays
    const activeTextClips = project.textClips.filter(
      t => time >= t.startTime && time < t.startTime + t.duration
    );

    activeTextClips.forEach(tc => {
      ctx.save();
      const posX = (tc.positionX / 100) * targetW;
      const posY = (tc.positionY / 100) * targetH;

      ctx.font = `bold ${tc.fontSize * 1.5}px "${tc.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (tc.backgroundColor) {
        const metrics = ctx.measureText(tc.text);
        const padding = 20;
        ctx.fillStyle = tc.backgroundColor;
        ctx.beginPath();
        ctx.roundRect(
          posX - metrics.width / 2 - padding,
          posY - tc.fontSize - padding / 2,
          metrics.width + padding * 2,
          tc.fontSize * 2 + padding,
          16
        );
        ctx.fill();
      }

      if (tc.style === 'neon') {
        ctx.shadowColor = tc.color;
        ctx.shadowBlur = 25;
      }

      ctx.fillStyle = tc.color || '#FFFFFF';
      ctx.fillText(tc.text, posX, posY);
      ctx.restore();
    });

    // 3. Render Captions
    if (project.captions) {
      const activeCaption = project.captions.find(
        c => time >= c.startTime && time <= c.endTime
      );
      if (activeCaption) {
        ctx.save();
        ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const capX = targetW / 2;
        const capY = targetH * 0.88;
        const metrics = ctx.measureText(activeCaption.text);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.roundRect(capX - metrics.width / 2 - 16, capY - 24, metrics.width + 32, 48, 12);
        ctx.fill();

        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(activeCaption.text, capX, capY);
        ctx.restore();
      }
    }
  }, [project, aspectRatio, volume, isMuted]);

  // 60FPS Animation RAF Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastStamp = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastStamp) / 1000;
      lastStamp = timestamp;

      if (isPlayingRef.current) {
        const nextTime = currentTimeRef.current + delta;
        if (nextTime >= project.duration) {
          onTogglePlay(false);
          onTimeUpdate(0);
        } else {
          onTimeUpdate(nextTime);
        }
      }

      renderCanvasFrame(currentTimeRef.current);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [project.duration, onTimeUpdate, onTogglePlay, renderCanvasFrame]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onTimeUpdate(val);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const { cssAspect } = getAspectRatioDimensions();

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-[#090D1C] rounded-2xl border border-white/8 flex flex-col overflow-hidden relative shadow-2xl"
    >
      {/* Top Preview Bar: Project Title on Left, Aspect Ratio on Right */}
      <div className="h-10 bg-[#0D1224]/80 px-4 flex items-center justify-between border-b border-white/8 select-none z-10">
        <span className="text-xs font-bold text-slate-300 truncate">
          {project.name}
        </span>

        {/* Aspect Ratio Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAspectMenu(!showAspectMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white bg-[#090D1C] hover:bg-white/5 rounded-lg border border-white/8 transition-colors cursor-pointer"
          >
            <span>{aspectRatio}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showAspectMenu && (
            <div className="absolute top-full right-0 mt-1 w-28 bg-[#090D1C] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in">
              <div className="text-[10px] uppercase font-bold text-slate-500 px-2.5 py-1">Aspect Ratio</div>
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => {
                    onChangeAspectRatio(ratio);
                    setShowAspectMenu(false);
                  }}
                  className={`w-full px-2.5 py-1 text-xs text-left cursor-pointer ${
                    aspectRatio === ratio ? 'text-[#A78BFA] font-bold bg-[#7C3AED]/20' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Player Area */}
      <div className="flex-1 bg-[#050712] flex items-center justify-center p-3 relative overflow-hidden">
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/5"
          style={{ aspectRatio: cssAspect }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => onTogglePlay(!isPlaying)}
          />
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="p-3 bg-[#0D1224] border-t border-white/8 flex flex-col gap-2 select-none">
        
        {/* Scrubber Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-bold text-slate-300 min-w-[55px]">
            {formatTimecode(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={project.duration}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />

          <span className="text-[11px] font-mono font-medium text-slate-500 min-w-[55px] text-right">
            {formatTimecode(project.duration)}
          </span>
        </div>

        {/* Playback Buttons & Utility Controls */}
        <div className="flex items-center justify-between">
          
          {/* Volume Control */}
          <div className="flex items-center gap-1.5 min-w-[120px]">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Center Transport: Skip Back, Play/Pause, Skip Forward */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTimeUpdate(Math.max(0, currentTime - 5))}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              title="Jump Back 5s"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => onTogglePlay(!isPlaying)}
              className="w-10 h-10 rounded-full btn-vedit-primary flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => onTimeUpdate(Math.min(project.duration, currentTime + 5))}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              title="Jump Forward 5s"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right Extras: Zoom & Fullscreen */}
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
