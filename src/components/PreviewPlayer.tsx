import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sun, SkipBack, SkipForward, Sparkles } from 'lucide-react';
import { Project, VideoClip, TextClip, TimelineTransition, interpolateKeyframes, interpolateSpeedKeyframes } from '../types';
import { drawClipFrame, drawTextOverlay, drawTransitionFrame, applyVideoEffects, applyChromaKey } from '../utils/proceduralRenderer';
import { audioSynth } from '../utils/audioSynthesizer';
import { getAssetUrl } from '../utils/assetUrl';

interface PreviewPlayerProps {
  project: Project;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: (playState: boolean) => void;
  brightnessOverride: number; // Controlled by vertical swipe on right side
  onBrightnessChange: (val: number) => void;
  onVolumeChange: (val: number) => void;
  globalVolume: number; // 0 to 100
  onSelectProject?: (id: string) => void;
  mutedTracks?: Record<string, boolean>;
  globalMotionBlur?: boolean;
  onUpdateClipAspectRatio?: (aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '2.39:1' | 'free') => void;
  onUpdateClipSpeed?: (speed: number) => void;
  onSplitClip?: () => void;
}

export default function PreviewPlayer({
  project,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onTogglePlay,
  brightnessOverride,
  onBrightnessChange,
  onVolumeChange,
  globalVolume,
  onSelectProject,
  mutedTracks = { v1: false, a1: false, t1: false },
  globalMotionBlur = true,
  onUpdateClipAspectRatio,
  onUpdateClipSpeed,
  onSplitClip,
}: PreviewPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const videoCacheRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const lastRenderedCanvasRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Refs to allow 60FPS RAF loop without re-instantiation stutter
  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;
  const projectRef = useRef<Project>(project);
  projectRef.current = project;

  // 3D Preview Mode: '2d' | '3d_anaglyph' | '3d_cinema' | '3d_globe'
  const [preview3DMode, setPreview3DMode] = useState<'2d' | '3d_anaglyph' | '3d_cinema' | '3d_globe'>('2d');
  const [orbitAngleX, setOrbitAngleX] = useState<number>(0.2); // vertical pitch angle
  const [orbitAngleY, setOrbitAngleY] = useState<number>(-0.4); // horizontal yaw angle
  const [isOrbitDragging, setIsOrbitDragging] = useState<boolean>(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Interactive gestural state overlay indicators
  const [gestureIndicator, setGestureIndicator] = useState<{
    type: 'volume' | 'brightness' | 'play_pause' | null;
    value?: number;
    text?: string;
  }>({ type: null });

  // Swipe start state
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const initialBrightnessRef = useRef<number>(0);
  const initialVolumeRef = useRef<number>(50);

  const isImageMedia = (url?: string): boolean => {
    if (!url) return false;
    return (
      url.startsWith('data:image') ||
      url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.webp') ||
      url.endsWith('.gif') ||
      url.endsWith('.svg')
    );
  };

  // Preload and cache all project media (videos and images)
  useEffect(() => {
    project.videoClips.forEach((clip) => {
      if (!clip.videoUrl) return;
      const mediaSrc = getAssetUrl(clip.videoUrl);

      if (isImageMedia(clip.videoUrl)) {
        if (!imageCacheRef.current.has(clip.videoUrl)) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = mediaSrc;
          img.onload = () => {
            drawFrame();
          };
          imageCacheRef.current.set(clip.videoUrl, img);
        }
      } else {
        if (!videoCacheRef.current.has(clip.videoUrl)) {
          const v = document.createElement('video');
          v.crossOrigin = 'anonymous';
          v.playsInline = true;
          v.preload = 'auto';
          v.muted = true;
          v.src = mediaSrc;
          v.addEventListener('loadedmetadata', () => {
            if (v.currentTime === 0) v.currentTime = 0.001;
            drawFrame();
          });
          v.addEventListener('loadeddata', () => {
            if (v.currentTime === 0) v.currentTime = 0.001;
            drawFrame();
          });
          v.addEventListener('canplay', () => drawFrame());
          v.addEventListener('canplaythrough', () => drawFrame());
          v.addEventListener('timeupdate', () => drawFrame());
          v.addEventListener('seeked', () => drawFrame());
          v.load();
          videoCacheRef.current.set(clip.videoUrl, v);
        }
      }
    });
  }, [project.videoClips]);

  // Find active video clip
  const activeClipForSync = project.videoClips.find(
    (clip) => currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration
  );

  // Synchronize playback speed, play/pause state and playhead across cached video elements
  useEffect(() => {
    const activeVideo = activeClipForSync?.videoUrl && !isImageMedia(activeClipForSync.videoUrl)
      ? videoCacheRef.current.get(activeClipForSync.videoUrl)
      : null;

    // Pause all non-active videos to prevent background audio or unnecessary CPU load
    videoCacheRef.current.forEach((v, url) => {
      if (url !== activeClipForSync?.videoUrl) {
        if (!v.paused) v.pause();
      }
    });

    if (!activeVideo || !activeClipForSync) return;

    // Volume & Muting
    const clipVol = activeClipForSync.volume !== undefined ? activeClipForSync.volume : 100;
    const isMuted = mutedTracks.v1 || mutedTracks.a1 || globalVolume === 0;
    activeVideo.volume = isMuted ? 0 : Math.max(0, Math.min(1, (globalVolume / 100) * (clipVol / 100)));
    activeVideo.muted = isMuted;

    // Speed Keyframing
    const interpolatedSpeed = interpolateSpeedKeyframes(
      activeClipForSync.speedKeyframes,
      (currentTime - activeClipForSync.startTime) * activeClipForSync.speed,
      activeClipForSync.speed
    );

    if (activeVideo.playbackRate !== interpolatedSpeed) {
      activeVideo.playbackRate = interpolatedSpeed;
    }

    const localTime = (currentTime - activeClipForSync.startTime) * (activeClipForSync.speed || 1.0);

    if (isPlaying) {
      if (activeVideo.paused) {
        activeVideo.play().catch(() => {});
      }
      if (Math.abs(activeVideo.currentTime - localTime) > 0.45) {
        activeVideo.currentTime = localTime;
      }
    } else {
      if (!activeVideo.paused) {
        activeVideo.pause();
      }
      if (Math.abs(activeVideo.currentTime - localTime) > 0.03) {
        activeVideo.currentTime = localTime;
      }
    }
  }, [activeClipForSync?.id, activeClipForSync?.videoUrl, activeClipForSync?.speed, isPlaying, globalVolume, mutedTracks]);

  // Synchronize audio playback with playing state and currentTime changes
  useEffect(() => {
    const activeAudio = project.audioClips.find(
      (a) => currentTime >= a.startTime && currentTime <= a.startTime + a.duration
    );

    const isAudioMuted = mutedTracks.a1 || false;

    if (isPlaying && !isAudioMuted) {
      if (activeAudio) {
        audioSynth.start(activeAudio.audioStyle, globalVolume);
      } else {
        audioSynth.stop();
      }
    } else {
      audioSynth.stop();
    }

    return () => {
      audioSynth.stop();
    };
  }, [isPlaying, project.audioClips, globalVolume, mutedTracks.a1]);

  // Redraw when currentTime changes
  useEffect(() => {
    drawFrame();
  }, [currentTime, project, brightnessOverride]);

  const apply3DAndDraw = (ctx: CanvasRenderingContext2D, offscreenCanvas: HTMLCanvasElement) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    if (preview3DMode === '2d') {
      ctx.drawImage(offscreenCanvas, 0, 0, w, h);
      return;
    }

    if (preview3DMode === '3d_anaglyph') {
      ctx.clearRect(0, 0, w, h);
      
      // Left eye - Red channel (shifted left by 6px)
      ctx.save();
      ctx.drawImage(offscreenCanvas, -6, 0, w, h);
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = '#00ffff'; // cyan tint
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Right eye - Cyan channel (shifted right by 6px)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(offscreenCanvas, 6, 0, w, h);
      ctx.restore();
      return;
    }

    if (preview3DMode === '3d_cinema') {
      // Clear background with dark theater gradient
      ctx.fillStyle = '#020308';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Draw subtle ambient theater wall grids
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Wall boundaries converging to center
      ctx.moveTo(0, 0); ctx.lineTo(cx - 150, cy - 80);
      ctx.moveTo(0, h); ctx.lineTo(cx - 150, cy + 80);
      ctx.moveTo(w, 0); ctx.lineTo(cx + 150, cy - 80);
      ctx.moveTo(w, h); ctx.lineTo(cx + 150, cy + 80);
      ctx.stroke();

      // Floor row seats projection lines
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.08)';
      for (let i = 0.2; i <= 1.0; i += 0.2) {
        const wRow = w * i;
        ctx.beginPath();
        ctx.moveTo(cx - wRow/2, h - (h - cy)*i);
        ctx.lineTo(cx + wRow/2, h - (h - cy)*i);
        ctx.stroke();
      }

      // Projection screen coordinates in 3D perspective with yaw (orbitAngleY) and pitch (orbitAngleX)
      const slices = 64;
      const sliceWidth = w / slices;
      const screenW = 320; // 3D Width of the cinema screen
      const screenH = 180; // 3D Height of the cinema screen
      const dist = 300;   // Focal length

      for (let i = 0; i < slices; i++) {
        const t = (i / slices) - 0.5;
        const x3d = t * screenW;

        // Yaw rotation around Y axis
        const rotX = x3d * Math.cos(orbitAngleY);
        const rotZ = -x3d * Math.sin(orbitAngleY);

        // Focal projection factor
        const depth = dist + rotZ;
        const scale = dist / depth;

        const px = cx + rotX * scale;
        // Pitch rotation affects vertical projection height
        const py_top = cy + (-screenH / 2) * scale * Math.cos(orbitAngleX);
        const py_bottom = cy + (screenH / 2) * scale * Math.cos(orbitAngleX);
        
        const sh = py_bottom - py_top;
        const sw = sliceWidth * scale * 1.1; // Prevent sliver gaps

        ctx.drawImage(
          offscreenCanvas,
          i * sliceWidth, 0, sliceWidth, h,
          px - sw/2, py_top, sw, sh
        );
      }

      // Add a nice sleek neon cyan border around the screen
      ctx.strokeStyle = '#00ffea';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00ffea';
      ctx.shadowBlur = 4;
      // Draw screen outline based on the four projected corners
      const corners = [
        { x: -screenW/2, y: -screenH/2 },
        { x: screenW/2, y: -screenH/2 },
        { x: screenW/2, y: screenH/2 },
        { x: -screenW/2, y: screenH/2 }
      ].map(pt => {
        const rotX = pt.x * Math.cos(orbitAngleY);
        const rotZ = -pt.x * Math.sin(orbitAngleY);
        const scale = dist / (dist + rotZ);
        return {
          x: cx + rotX * scale,
          y: cy + pt.y * scale * Math.cos(orbitAngleX)
        };
      });

      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      ctx.lineTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[2].x, corners[2].y);
      ctx.lineTo(corners[3].x, corners[3].y);
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    if (preview3DMode === '3d_globe') {
      const radius = 120;
      const gcx = w / 2;
      const gcy = h / 2;

      // Draw starry galaxy space backdrop
      const spaceGrad = ctx.createRadialGradient(gcx, gcy, 5, gcx, gcy, radius * 1.8);
      spaceGrad.addColorStop(0, '#050714');
      spaceGrad.addColorStop(1, '#020204');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw glowing blue/pink atmospheric limb glow behind the earth globe sphere
      const atmosphere = ctx.createRadialGradient(gcx, gcy, radius * 0.9, gcx, gcy, radius * 1.15);
      atmosphere.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
      atmosphere.addColorStop(0.5, 'rgba(236, 72, 153, 0.15)');
      atmosphere.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmosphere;
      ctx.beginPath();
      ctx.arc(gcx, gcy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Draw Earth globe main wireframe sphere
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(gcx, gcy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Earth rotation factor linked to currentTime and orbit drag
      const rotation = (currentTime * 0.12) + orbitAngleY;

      // Draw rotating dynamic 3D latitude grid lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      const numLats = 8;
      for (let j = 1; j < numLats; j++) {
        const latAngle = (j / numLats) * Math.PI;
        const latRadius = radius * Math.sin(latAngle);
        const latY = gcy + radius * Math.cos(latAngle) * Math.cos(orbitAngleX);
        
        ctx.beginPath();
        ctx.ellipse(gcx, latY, latRadius, latRadius * Math.sin(orbitAngleX), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw rotating dynamic 3D longitude grid lines
      const numLons = 12;
      for (let j = 0; j < numLons; j++) {
        const lonAngle = (j / numLons) * Math.PI * 2 + rotation;
        const lonW = radius * Math.cos(lonAngle);
        
        ctx.beginPath();
        ctx.ellipse(gcx, gcy, Math.abs(lonW), radius, -orbitAngleX, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw a mini texture-mapped preview box inside the rotating globe representing the actively graded video!
      ctx.save();
      ctx.beginPath();
      ctx.arc(gcx, gcy, radius * 0.7, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.65;
      ctx.drawImage(offscreenCanvas, gcx - radius * 0.7, gcy - radius * 0.7, radius * 1.4, radius * 1.4);
      ctx.restore();

      // Render glowing 3D project locator markers for each travel vlog / movie region
      const locations = [
        { name: 'Amsterdam Fight', lat: 52.37, lon: 4.89, projectId: 'tokyo_cyberpunk', color: '#ff0099' },
        { name: 'Swiss Alps Vlog', lat: 46.81, lon: 8.22, projectId: 'sunset_journey', color: '#38bdf8' },
        { name: 'California Joyride', lat: 36.77, lon: -119.41, projectId: 'gaming_arena', color: '#10b981' },
        { name: 'Australian Outback', lat: -25.27, lon: 133.77, projectId: 'fashion_showcase', color: '#fbbf24' }
      ];

      locations.forEach((loc) => {
        const latRad = (loc.lat * Math.PI) / 180;
        const lonRad = (loc.lon * Math.PI) / 180 + rotation;

        // Convert spherical lat/lon coordinates to cartesian (3D Space)
        const x = radius * Math.cos(latRad) * Math.sin(lonRad);
        const y = -radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.cos(lonRad);

        // Apply pitch vertical tilt (orbitAngleX) to vertical & depth axis
        const rotY = y * Math.cos(orbitAngleX) - z * Math.sin(orbitAngleX);
        const rotZ = y * Math.sin(orbitAngleX) + z * Math.cos(orbitAngleX);

        // Marker is on the front facing side of the 3D sphere globe (positive rotZ depth)
        if (rotZ > -10) {
          const px = gcx + x;
          const py = gcy + rotY;

          // Draw neon glowing marker pin core
          ctx.fillStyle = loc.color;
          ctx.shadowColor = loc.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Outer pulsing ripple ring
          ctx.strokeStyle = loc.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, 8 + Math.sin(currentTime * 6) * 3, 0, Math.PI * 2);
          ctx.stroke();

          // Text location indicator tag container
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(px - 45, py - 26, 90, 14, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(loc.name, px, py - 16);
        }
      });
    }
  };

  const drawCroppedFrame = (
    oCtx: CanvasRenderingContext2D,
    clip: VideoClip,
    localTime: number,
    gradedParams: any
  ) => {
    const cropX = clip.cropX !== undefined ? clip.cropX : 0;
    const cropY = clip.cropY !== undefined ? clip.cropY : 0;
    const cropW = clip.cropWidth !== undefined ? clip.cropWidth : 100;
    const cropH = clip.cropHeight !== undefined ? clip.cropHeight : 100;

    const speedAtPlayhead = interpolateSpeedKeyframes(clip.speedKeyframes, currentTime - clip.startTime, clip.speed);

    // Color grading & visual adjustment filters
    const grading = gradedParams;
    const b = 100 + grading.brightness;
    const c = 100 + grading.contrast;
    const sVal = 100 + grading.saturation;
    
    let customFilter = `brightness(${b}%) contrast(${c}%) saturate(${sVal}%)`;
    if (grading.lut === 'monochrome') {
      customFilter += ' grayscale(100%)';
    } else if (grading.lut === 'vintage') {
      customFilter += ' sepia(40%) hue-rotate(-10deg)';
    } else if (grading.lut === 'cyberpunk') {
      customFilter += ' saturate(170%) hue-rotate(50deg)';
    } else if (grading.lut === 'teal_orange') {
      customFilter += ' saturate(140%) contrast(110%) hue-rotate(-20deg)';
    } else if (grading.lut === 'warm_gold') {
      customFilter += ' sepia(20%) saturate(130%) hue-rotate(10deg)';
    }
    if (grading.motionBlur > 0) {
      customFilter += ` blur(${grading.motionBlur * 0.1}px)`;
    }
    if (globalMotionBlur && speedAtPlayhead > 1.0) {
      const globalBlurAmount = parseFloat(((speedAtPlayhead - 1.0) * 3.5).toFixed(1));
      customFilter += ` blur(${globalBlurAmount}px)`;
    }

    if (clip.videoUrl && isImageMedia(clip.videoUrl)) {
      const img = imageCacheRef.current.get(clip.videoUrl);
      if (img && img.complete && img.naturalWidth > 0) {
        oCtx.filter = customFilter;
        const iW = img.naturalWidth;
        const iH = img.naturalHeight;
        const sx = (cropX / 100) * iW;
        const sy = (cropY / 100) * iH;
        const sw = (cropW / 100) * iW;
        const sh = (cropH / 100) * iH;
        oCtx.drawImage(img, sx, sy, sw, sh, 0, 0, 640, 360);
        oCtx.filter = 'none';
      } else {
        oCtx.fillStyle = '#04060f';
        oCtx.fillRect(0, 0, 640, 360);
      }
    } else if (clip.videoUrl) {
      const video = videoCacheRef.current.get(clip.videoUrl);
      if (video && (video.readyState >= 1 || video.videoWidth > 0)) {
        oCtx.filter = customFilter;
        const vW = video.videoWidth || 640;
        const vH = video.videoHeight || 360;

        const sx = (cropX / 100) * vW;
        const sy = (cropY / 100) * vH;
        const sw = (cropW / 100) * vW;
        const sh = (cropH / 100) * vH;

        oCtx.drawImage(video, sx, sy, sw, sh, 0, 0, 640, 360);
        oCtx.filter = 'none';

        // Cache last valid frame for this clip
        let snap = lastRenderedCanvasRef.current.get(clip.id);
        if (!snap) {
          snap = document.createElement('canvas');
          snap.width = 640;
          snap.height = 360;
          lastRenderedCanvasRef.current.set(clip.id, snap);
        }
        const snapCtx = snap.getContext('2d');
        if (snapCtx) {
          snapCtx.clearRect(0, 0, 640, 360);
          snapCtx.drawImage(video, sx, sy, sw, sh, 0, 0, 640, 360);
        }
      } else if (lastRenderedCanvasRef.current.has(clip.id)) {
        oCtx.filter = customFilter;
        oCtx.drawImage(lastRenderedCanvasRef.current.get(clip.id)!, 0, 0, 640, 360);
        oCtx.filter = 'none';
      } else {
        // Sleek dark placeholder showing only the selected video title — NEVER random procedural scenes
        oCtx.fillStyle = '#050711';
        oCtx.fillRect(0, 0, 640, 360);
        oCtx.fillStyle = '#00ffea';
        oCtx.font = 'bold 12px Inter, sans-serif';
        oCtx.textAlign = 'center';
        oCtx.fillText(`🎬 ${clip.name}`, 320, 172);
        oCtx.fillStyle = '#64748b';
        oCtx.font = '10px Inter, sans-serif';
        oCtx.fillText('Loading media stream...', 320, 195);
      }
    } else {
      oCtx.fillStyle = '#050711';
      oCtx.fillRect(0, 0, 640, 360);
    }

    // Apply Video Effects (VHS, Glitch, Cinema Glow, Film Grain, etc.)
    if (clip.effect) {
      applyVideoEffects(oCtx, clip.effect, currentTime);
    }

    // Apply Chroma Key (Green Screen)
    if (clip.chromaKey?.enabled) {
      applyChromaKey(oCtx, clip.chromaKey);
    }

    // Draw Aspect Ratio matte/letterboxes
    const aspectRatio = clip.aspectRatio || 'free';
    if (aspectRatio !== 'free') {
      oCtx.fillStyle = 'rgba(5, 5, 8, 0.98)';
      if (aspectRatio === '9:16') {
        const visibleW = 360 * (9 / 16);
        const colW = (640 - visibleW) / 2;
        oCtx.fillRect(0, 0, colW, 360);
        oCtx.fillRect(640 - colW, 0, colW, 360);
      } else if (aspectRatio === '1:1') {
        const colW = (640 - 360) / 2;
        oCtx.fillRect(0, 0, colW, 360);
        oCtx.fillRect(640 - colW, 0, colW, 360);
      } else if (aspectRatio === '4:3') {
        const colW = (640 - 480) / 2;
        oCtx.fillRect(0, 0, colW, 360);
        oCtx.fillRect(640 - colW, 0, colW, 360);
      } else if (aspectRatio === '2.39:1') {
        const visibleH = 640 / 2.39;
        const barH = (360 - visibleH) / 2;
        oCtx.fillRect(0, 0, 640, barH);
        oCtx.fillRect(0, 360 - barH, 640, barH);
      }
    }
  };

  const drawClipWithTransform = (
    targetCtx: CanvasRenderingContext2D,
    clip: VideoClip,
    localTime: number,
    gradedParams: any,
    anim?: { opacity: number; scale: number; positionX: number; positionY: number; rotation?: number }
  ) => {
    targetCtx.save();
    if (anim) {
      targetCtx.globalAlpha = (anim.opacity !== undefined ? anim.opacity : 100) / 100;
      const cx = 640 / 2;
      const cy = 360 / 2;
      const dx = (((anim.positionX !== undefined ? anim.positionX : 50) - 50) / 100) * 640;
      const dy = (((anim.positionY !== undefined ? anim.positionY : 50) - 50) / 100) * 360;
      const s = (anim.scale !== undefined ? anim.scale : 100) / 100;

      targetCtx.translate(cx + dx, cy + dy);
      if (anim.rotation) targetCtx.rotate((anim.rotation * Math.PI) / 180);
      targetCtx.scale(s, s);
      targetCtx.translate(-cx, -cy);
    }
    drawCroppedFrame(targetCtx, clip, localTime, gradedParams);
    targetCtx.restore();
  };

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a temporary offscreen canvas to pre-render the active video/effects frame
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 640;
    offscreenCanvas.height = 360;
    const oCtx = offscreenCanvas.getContext('2d');
    if (!oCtx) return;

    // 1. Find active video clip or transition
    const activeClip = project.videoClips.find(
      (clip) => currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration
    );

    // Look for active transitions
    const activeTransition = project.transitions.find(
      (t) => currentTime >= t.atTime - t.duration / 2 && currentTime < t.atTime + t.duration / 2
    );

    const isVideoMuted = mutedTracks.v1 || false;

    if (isVideoMuted) {
      oCtx.clearRect(0, 0, 640, 360);
      oCtx.fillStyle = '#020306';
      oCtx.fillRect(0, 0, 640, 360);
    } else if (activeTransition) {
      const fromClip = project.videoClips.find((c) => c.id === activeTransition.fromClipId);
      const toClip = project.videoClips.find((c) => c.id === activeTransition.toClipId);

      if (fromClip && toClip) {
        const transStart = activeTransition.atTime - activeTransition.duration / 2;
        const progress = (currentTime - transStart) / activeTransition.duration;

        // Apply brightness override to both clip params for grading
        const gradedFrom = { ...fromClip.colorGrading, brightness: fromClip.colorGrading.brightness + brightnessOverride };
        const gradedTo = { ...toClip.colorGrading, brightness: toClip.colorGrading.brightness + brightnessOverride };

        // Relative timelines for clip frames
        const clipTimeFrom = (currentTime - fromClip.startTime) * fromClip.speed;
        const clipTimeTo = (currentTime - toClip.startTime) * toClip.speed;

        const fromAnim = interpolateKeyframes(fromClip.keyframes, clipTimeFrom / fromClip.speed, {
          opacity: fromClip.opacity !== undefined ? fromClip.opacity : 100,
          scale: fromClip.scale !== undefined ? fromClip.scale : 100,
          positionX: fromClip.positionX !== undefined ? fromClip.positionX : 50,
          positionY: fromClip.positionY !== undefined ? fromClip.positionY : 50,
        });

        const toAnim = interpolateKeyframes(toClip.keyframes, clipTimeTo / toClip.speed, {
          opacity: toClip.opacity !== undefined ? toClip.opacity : 100,
          scale: toClip.scale !== undefined ? toClip.scale : 100,
          positionX: toClip.positionX !== undefined ? toClip.positionX : 50,
          positionY: toClip.positionY !== undefined ? toClip.positionY : 50,
        });

        drawTransitionFrame(
          oCtx,
          fromClip.proceduralType,
          gradedFrom,
          toClip.proceduralType,
          gradedTo,
          clipTimeFrom,
          clipTimeTo,
          Math.max(0, Math.min(1, progress)),
          activeTransition.type,
          fromAnim,
          toAnim,
          (ctxA) => drawClipWithTransform(ctxA, fromClip, clipTimeFrom, gradedFrom, fromAnim),
          (ctxB) => drawClipWithTransform(ctxB, toClip, clipTimeTo, gradedTo, toAnim)
        );
      } else if (activeClip) {
        const gradedParams = { ...activeClip.colorGrading, brightness: activeClip.colorGrading.brightness + brightnessOverride };
        const speedAtPlayhead = interpolateSpeedKeyframes(activeClip.speedKeyframes, currentTime - activeClip.startTime, activeClip.speed);
        const localTime = (currentTime - activeClip.startTime) * speedAtPlayhead;

        const anim = interpolateKeyframes(activeClip.keyframes, localTime / speedAtPlayhead, {
          opacity: activeClip.opacity !== undefined ? activeClip.opacity : 100,
          scale: activeClip.scale !== undefined ? activeClip.scale : 100,
          positionX: activeClip.positionX !== undefined ? activeClip.positionX : 50,
          positionY: activeClip.positionY !== undefined ? activeClip.positionY : 50,
        });

        drawClipWithTransform(oCtx, activeClip, localTime, gradedParams, anim);
      }
    } else if (activeClip) {
      // Normal clip rendering with speed ramping
      const gradedParams = { ...activeClip.colorGrading, brightness: activeClip.colorGrading.brightness + brightnessOverride };
      const speedAtPlayhead = interpolateSpeedKeyframes(activeClip.speedKeyframes, currentTime - activeClip.startTime, activeClip.speed);
      const localTime = (currentTime - activeClip.startTime) * speedAtPlayhead;

      const anim = interpolateKeyframes(activeClip.keyframes, localTime / speedAtPlayhead, {
        opacity: activeClip.opacity !== undefined ? activeClip.opacity : 100,
        scale: activeClip.scale !== undefined ? activeClip.scale : 100,
        positionX: activeClip.positionX !== undefined ? activeClip.positionX : 50,
        positionY: activeClip.positionY !== undefined ? activeClip.positionY : 50,
      });

      drawClipWithTransform(oCtx, activeClip, localTime, gradedParams, anim);
    } else {
      // Clean empty dark studio canvas
      oCtx.clearRect(0, 0, 640, 360);
      oCtx.fillStyle = '#04060f';
      oCtx.fillRect(0, 0, 640, 360);

      oCtx.font = '500 13px Inter, sans-serif';
      oCtx.fillStyle = '#475569';
      oCtx.textAlign = 'center';
      oCtx.fillText('No video track active at this playhead position.', 640 / 2, 360 / 2);
    }

    // Apply the 3D Mode transformation and projection onto the visible context!
    apply3DAndDraw(ctx, offscreenCanvas);

    // 2. Render active text overlays on top of the final rendered frame
    const isTextMuted = mutedTracks.t1 || false;
    const activeTexts = isTextMuted ? [] : project.textClips.filter(
      (text) => currentTime >= text.startTime && currentTime < text.startTime + text.duration
    );

    activeTexts.forEach((textClip) => {
      const localTime = currentTime - textClip.startTime;
      const anim = interpolateKeyframes(textClip.keyframes, localTime, {
        opacity: textClip.opacity !== undefined ? textClip.opacity : 100,
        scale: textClip.scale !== undefined ? textClip.scale : 100,
        positionX: textClip.positionX !== undefined ? textClip.positionX : 50,
        positionY: textClip.positionY, // default
      });

      ctx.save();
      ctx.globalAlpha = anim.opacity / 100;

      const tx = canvas.width * (anim.positionX / 100);
      const ty = canvas.height * (anim.positionY / 100);
      const s = anim.scale / 100;

      ctx.translate(tx, ty);
      ctx.scale(s, s);
      ctx.translate(-tx, -ty);

      drawTextOverlay(
        ctx,
        textClip.text,
        textClip.color,
        textClip.fontSize,
        anim.positionY,
        textClip.style,
        currentTime - textClip.startTime,
        textClip.animation || 'none',
        textClip.fontFamily || 'Inter, sans-serif'
      );
      ctx.restore();
    });
  };

  // 60FPS fluid animation runner synchronized with active video playback
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (isPlayingRef.current) {
        const curProject = projectRef.current;
        const curTime = currentTimeRef.current;
        const activeClip = curProject.videoClips.find(
          (c) => curTime >= c.startTime && curTime < c.startTime + c.duration
        );

        const activeVideo = activeClip?.videoUrl && !isImageMedia(activeClip.videoUrl)
          ? videoCacheRef.current.get(activeClip.videoUrl)
          : null;

        let nextTime = curTime;

        if (activeVideo && !activeVideo.paused && !activeVideo.seeking && activeVideo.readyState >= 2) {
          const clipSpeed = activeClip.speed || 1.0;
          nextTime = activeClip.startTime + (activeVideo.currentTime / clipSpeed);
        } else {
          const delta = (timestamp - lastTimeRef.current) / 1000;
          nextTime = curTime + (delta > 0 && delta < 0.1 ? delta : 0.016);
        }

        lastTimeRef.current = timestamp;

        if (nextTime >= curProject.duration) {
          nextTime = 0;
          onTogglePlay(false);
        }

        currentTimeRef.current = nextTime;
        onTimeUpdate(nextTime);
        drawFrame();
      } else {
        lastTimeRef.current = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // When paused and seeking, seek the active video precisely
  useEffect(() => {
    if (!isPlaying && activeClipForSync && activeClipForSync.videoUrl && !isImageMedia(activeClipForSync.videoUrl)) {
      const activeVideo = videoCacheRef.current.get(activeClipForSync.videoUrl);
      if (activeVideo) {
        const localTime = (currentTime - activeClipForSync.startTime) * (activeClipForSync.speed || 1.0);
        if (Math.abs(activeVideo.currentTime - localTime) > 0.02) {
          activeVideo.currentTime = localTime;
        }
      }
    }
    drawFrame();
  }, [currentTime, isPlaying]);

  // Handle Swipe/Tap controls
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    if (preview3DMode !== '2d') {
      setIsOrbitDragging(true);
      dragStartPos.current = { x: clientX, y: clientY };

      // Check if we tapped/clicked on any 3D City pin on our 3D Travel Globe
      if (preview3DMode === '3d_globe' && canvasRef.current) {
        const bounds = canvasRef.current.getBoundingClientRect();
        const clickX = clientX - bounds.left;
        const clickY = clientY - bounds.top;

        // Coordinates scale
        const scaleX = 640 / bounds.width;
        const scaleY = 360 / bounds.height;
        const canvasClickX = clickX * scaleX;
        const canvasClickY = clickY * scaleY;

        const radius = 120;
        const gcx = 640 / 2;
        const gcy = 360 / 2;
        const rotation = (currentTime * 0.12) + orbitAngleY;

        const locations = [
          { name: 'Amsterdam Fight', lat: 52.37, lon: 4.89, projectId: 'tokyo_cyberpunk' },
          { name: 'Swiss Alps Vlog', lat: 46.81, lon: 8.22, projectId: 'sunset_journey' },
          { name: 'California Joyride', lat: 36.77, lon: -119.41, projectId: 'gaming_arena' },
          { name: 'Australian Outback', lat: -25.27, lon: 133.77, projectId: 'fashion_showcase' }
        ];

        for (const loc of locations) {
          const latRad = (loc.lat * Math.PI) / 180;
          const lonRad = (loc.lon * Math.PI) / 180 + rotation;

          const x = radius * Math.cos(latRad) * Math.sin(lonRad);
          const y = -radius * Math.sin(latRad);
          const z = radius * Math.cos(latRad) * Math.cos(lonRad);

          const rotY = y * Math.cos(orbitAngleX) - z * Math.sin(orbitAngleX);
          const rotZ = y * Math.sin(orbitAngleX) + z * Math.cos(orbitAngleX);

          if (rotZ > -10) {
            const px = gcx + x;
            const py = gcy + rotY;

            const dist = Math.hypot(canvasClickX - px, canvasClickY - py);
            if (dist < 18 && onSelectProject) {
              onSelectProject(loc.projectId);
              setIsOrbitDragging(false);
              return;
            }
          }
        }
      }
    }

    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    initialBrightnessRef.current = brightnessOverride;
    initialVolumeRef.current = globalVolume;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    if (preview3DMode !== '2d' && isOrbitDragging) {
      const dx = clientX - dragStartPos.current.x;
      const dy = clientY - dragStartPos.current.y;

      setOrbitAngleY((prev) => prev + dx * 0.015);
      setOrbitAngleX((prev) => Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev - dy * 0.015)));

      dragStartPos.current = { x: clientX, y: clientY };
      return;
    }

    if (!touchStartRef.current) return;

    const deltaX = clientX - touchStartRef.current.x;
    const deltaY = touchStartRef.current.y - clientY; // inverted for traditional scroll feels

    // Determine swipe behavior based on where touch initiated (left side vs right side of preview)
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const relativeStartX = touchStartRef.current.x - bounds.left;
    const halfWidth = bounds.width / 2;

    if (Math.abs(deltaY) > 15) {
      if (relativeStartX < halfWidth) {
        // Left side = Volume adjust
        const volumeDelta = Math.round(deltaY * 0.5);
        const newVolume = Math.max(0, Math.min(100, initialVolumeRef.current + volumeDelta));
        onVolumeChange(newVolume);
        setGestureIndicator({ type: 'volume', value: newVolume });
      } else {
        // Right side = Exposure/Brightness adjust
        const brightnessDelta = Math.round(deltaY * 0.4);
        const newBrightness = Math.max(-50, Math.min(50, initialBrightnessRef.current + brightnessDelta));
        onBrightnessChange(newBrightness);
        setGestureIndicator({ type: 'brightness', value: newBrightness });
      }
    }
  };

  const handleTouchEnd = () => {
    if (preview3DMode !== '2d' && isOrbitDragging) {
      setIsOrbitDragging(false);
      return;
    }

    if (!touchStartRef.current) return;
    const duration = Date.now() - touchStartRef.current.time;
    
    // Tap or Double Tap checking
    if (duration < 250) {
      // Single Tap gesture to play/pause
      onTogglePlay(!isPlaying);
      setGestureIndicator({
        type: 'play_pause',
        text: !isPlaying ? 'Play' : 'Pause',
      });
    }

    touchStartRef.current = null;
    setTimeout(() => {
      setGestureIndicator({ type: null });
    }, 1000);
  };

  // Fast forward/backward utilities
  const handleSeek = (direction: 'forward' | 'backward') => {
    let nextTime = currentTime + (direction === 'forward' ? 3 : -3);
    nextTime = Math.max(0, Math.min(project.duration, nextTime));
    onTimeUpdate(nextTime);
  };

  // Formatting utility
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 shadow-xl backdrop-blur-md">
      
      {/* CapCut Pro Edit & View Mode Toolbar */}
      <div className="flex flex-col gap-2 pb-2.5 border-b border-slate-800/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Aspect Ratio Selector (CapCut style) */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850 shadow-inner">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 pl-1">Ratio:</span>
            {(['16:9', '9:16', '1:1', '4:3', '2.39:1'] as const).map((ratio) => {
              const activeRatio = activeClipForSync?.aspectRatio || 'free';
              const isSelected = activeRatio === ratio;
              return (
                <button
                  key={ratio}
                  onClick={() => onUpdateClipAspectRatio && onUpdateClipAspectRatio(ratio)}
                  className={`px-2 py-0.5 text-[8.5px] font-bold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title={`Set Aspect Ratio to ${ratio}`}
                >
                  {ratio}
                </button>
              );
            })}
          </div>

          {/* Quick Speed Controls (CapCut style) */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850 shadow-inner">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 pl-1">Speed:</span>
            {[0.5, 1.0, 1.5, 2.0, 4.0].map((spd) => {
              const currentSpeed = activeClipForSync?.speed || 1.0;
              const isSelected = Math.abs(currentSpeed - spd) < 0.05;
              return (
                <button
                  key={spd}
                  onClick={() => onUpdateClipSpeed && onUpdateClipSpeed(spd)}
                  className={`px-2 py-0.5 text-[8.5px] font-bold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title={`Set Speed to ${spd}x`}
                >
                  {spd}x
                </button>
              );
            })}
          </div>

          {/* Quick Split Button */}
          {onSplitClip && (
            <button
              onClick={onSplitClip}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 hover:border-indigo-400 text-indigo-300 hover:text-white text-[9px] font-extrabold rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Split active clip at playhead (Ctrl+B / S)"
            >
              <span>✂️ Split</span>
            </button>
          )}
        </div>

        {/* 3D Real-World Space View Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
          <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 animate-pulse text-indigo-400" />
            <span>3D View Mode</span>
          </span>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850 shadow-inner flex-wrap gap-0.5">
            <button
              onClick={() => setPreview3DMode('2d')}
              className={`px-2 py-0.5 text-[8.5px] font-bold rounded transition-all cursor-pointer ${
                preview3DMode === '2d' ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              2D Flat
            </button>
            <button
              onClick={() => setPreview3DMode('3d_anaglyph')}
              className={`px-2 py-0.5 text-[8.5px] font-bold rounded transition-all cursor-pointer ${
                preview3DMode === '3d_anaglyph' ? 'bg-pink-900/40 text-pink-400 border border-pink-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Real stereoscopic 3D red-cyan channel shift"
            >
              3D Glasses
            </button>
            <button
              onClick={() => setPreview3DMode('3d_cinema')}
              className={`px-2 py-0.5 text-[8.5px] font-bold rounded transition-all cursor-pointer ${
                preview3DMode === '3d_cinema' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Rotating 3D cinema screen"
            >
              3D Cinema
            </button>
            <button
              onClick={() => setPreview3DMode('3d_globe')}
              className={`px-2 py-0.5 text-[8.5px] font-bold rounded transition-all cursor-pointer ${
                preview3DMode === '3d_globe' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Interactive 3D travel globe"
            >
              3D Globe
            </button>
          </div>
        </div>
      </div>
      
      {/* Side-by-side: Video Player Frame (left) and Vertical DB Master VU Meter (right) */}
      <div className="flex gap-2.5 items-stretch w-full">
        
        {/* Aspect ratio frame containing Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={() => { touchStartRef.current = null; }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative aspect-video flex-1 rounded-xl overflow-hidden bg-black shadow-inner cursor-pointer group"
        >
          {activeClipForSync && activeClipForSync.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${activeClipForSync.youtubeId}?autoplay=${isPlaying ? 1 : 0}&mute=1&controls=0&modestbranding=1&rel=0`}
              title="YouTube Ad / Promo Content"
              className="absolute inset-0 w-full h-full object-cover pointer-events-auto border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              className="w-full h-full object-contain pointer-events-none"
            />
          )}

          {/* Gestural HUD Overlays */}
          {gestureIndicator.type && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none transition-opacity duration-200">
              <div className="bg-slate-950/90 text-white rounded-full px-5 py-3 flex items-center gap-3 border border-slate-800 shadow-xl">
                {gestureIndicator.type === 'volume' && (
                  <>
                    <Volume2 className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold font-mono w-12 text-left">
                      {gestureIndicator.value}%
                    </span>
                  </>
                )}
                {gestureIndicator.type === 'brightness' && (
                  <>
                    <Sun className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-semibold font-mono w-12 text-left">
                      {gestureIndicator.value! > 0 ? `+${gestureIndicator.value}` : gestureIndicator.value}
                    </span>
                  </>
                )}
                {gestureIndicator.type === 'play_pause' && (
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    {gestureIndicator.text}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Floating gesture hints inside player */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/75 border border-slate-900 px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {preview3DMode !== '2d' ? (
              <span className="text-indigo-400 font-bold animate-pulse mx-auto">🖱️ Click and drag the player to rotate and spin in 3D!</span>
            ) : (
              <>
                <span>← Swipe Left side: Vol</span>
                <span>Tap: Play/Pause</span>
                <span>Swipe Right side: Exp →</span>
              </>
            )}
          </div>
        </div>

        {/* Professional Vertical Master VU DB Meter */}
        <div className="w-10 shrink-0 bg-slate-950 rounded-xl border border-slate-850 p-1.5 flex flex-col justify-between items-center select-none font-mono">
          <span className="text-[7.5px] font-bold text-slate-500 leading-none">dB</span>
          
          {/* Dynamic bouncing LED column */}
          <div className="flex-1 w-2.5 bg-slate-900 rounded-md relative my-1 overflow-hidden flex flex-col justify-end gap-[2px] p-[1px]">
            {Array.from({ length: 16 }).map((_, index) => {
              // 0 is top (red/clip), 15 is bottom (green/quiet)
              const ledIndex = 15 - index;
              const threshold = ledIndex / 15;
              
              // Simulate dynamic bouncing frequency heights when playing
              const dynamicVolume = isPlaying 
                ? (globalVolume / 100) * (0.6 + Math.sin(currentTime * 10) * 0.25 + Math.cos(currentTime * 4) * 0.15) 
                : 0;

              const active = dynamicVolume > threshold;
              
              let ledColor = 'bg-emerald-500/10';
              if (active) {
                if (ledIndex > 13) {
                  ledColor = 'bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]'; // red zone
                } else if (ledIndex > 10) {
                  ledColor = 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]'; // amber zone
                } else {
                  ledColor = 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]'; // green zone
                }
              }

              return (
                <div 
                  key={index} 
                  className={`w-full h-[3px] rounded-[1px] transition-all duration-75 ${ledColor}`} 
                />
              );
            })}
          </div>

          {/* Indicators */}
          <div className="flex flex-col gap-1 text-[6.5px] text-slate-500 text-center select-none leading-none scale-90">
            <span>0</span>
            <span>-12</span>
            <span>-24</span>
          </div>
        </div>

      </div>

      {/* Controller Area */}
      <div className="flex flex-col gap-2">
        {/* Playback time indicators */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="text-indigo-400 font-semibold">{formatTime(currentTime)}</span>
          <span className="text-slate-500">/</span>
          <span>{formatTime(project.duration)}</span>
        </div>

        {/* Media Buttons */}
        <div className="flex items-center justify-between p-1 bg-slate-950/40 rounded-xl border border-slate-800/40">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onTimeUpdate(0)}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/30"
              title="Reset Playhead"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSeek('backward')}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/30"
              title="Rewind 3s"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onTogglePlay(!isPlaying)}
            className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-transform active:scale-95 shadow-md shadow-indigo-600/20"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white translate-x-0.5" />
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSeek('forward')}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/30"
              title="Forward 3s"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Visual volume micro control */}
            <div className="flex items-center gap-2 px-2 border-l border-slate-800/80 ml-1">
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={globalVolume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
