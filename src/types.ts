export type ClipType = 'video' | 'audio' | 'text';

export type ProceduralType = 'cyberpunk_grid' | 'nebula_ocean' | 'geometric_warp' | 'vaporwave_sunset';

export type VideoEffectType = 'none' | 'vhs' | 'glitch' | 'cinema_glow' | 'film_grain' | 'rgb_split' | 'invert' | 'duotone' | 'bloom' | 'anamorphic';

export type TextAnimationStyle = 'none' | 'typewriter' | 'neon_pulse' | 'glitch_shake' | 'fade_slide' | 'bounce';

export interface Keyframe {
  id: string;
  time: number; // relative time inside the clip, 0 to clip.duration
  opacity: number; // 0 to 100 (percentage)
  scale: number; // 10 to 300 (percentage, e.g. 100 is original)
  positionX: number; // 0 to 100 (percentage from left)
  positionY: number; // 0 to 100 (percentage from top)
  rotation?: number; // -180 to 180 degrees
}

export function interpolateKeyframes(
  keyframes: Keyframe[] | undefined,
  localTime: number,
  defaults: { opacity: number; scale: number; positionX: number; positionY: number; rotation?: number }
): { opacity: number; scale: number; positionX: number; positionY: number; rotation: number } {
  const defaultWithRot = { ...defaults, rotation: defaults.rotation ?? 0 };
  if (!keyframes || keyframes.length === 0) {
    return defaultWithRot;
  }
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  
  if (localTime <= sorted[0].time) {
    return {
      opacity: sorted[0].opacity,
      scale: sorted[0].scale,
      positionX: sorted[0].positionX,
      positionY: sorted[0].positionY,
      rotation: sorted[0].rotation ?? 0
    };
  }
  
  if (localTime >= sorted[sorted.length - 1].time) {
    return {
      opacity: sorted[sorted.length - 1].opacity,
      scale: sorted[sorted.length - 1].scale,
      positionX: sorted[sorted.length - 1].positionX,
      positionY: sorted[sorted.length - 1].positionY,
      rotation: sorted[sorted.length - 1].rotation ?? 0
    };
  }
  
  // Find the interval
  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];
    if (localTime >= k1.time && localTime <= k2.time) {
      if (Math.abs(k2.time - k1.time) < 0.001) {
        return {
          opacity: k2.opacity,
          scale: k2.scale,
          positionX: k2.positionX,
          positionY: k2.positionY,
          rotation: k2.rotation ?? 0
        };
      }
      const t = (localTime - k1.time) / (k2.time - k1.time);
      const r1 = k1.rotation ?? 0;
      const r2 = k2.rotation ?? 0;
      return {
        opacity: Math.round(k1.opacity + (k2.opacity - k1.opacity) * t),
        scale: Math.round(k1.scale + (k2.scale - k1.scale) * t),
        positionX: Math.round(k1.positionX + (k2.positionX - k1.positionX) * t),
        positionY: Math.round(k1.positionY + (k2.positionY - k1.positionY) * t),
        rotation: Math.round(r1 + (r2 - r1) * t)
      };
    }
  }
  
  return defaultWithRot;
}

export interface ColorGradingParams {
  brightness: number; // -100 to 100 (default 0)
  contrast: number; // -100 to 100 (default 0)
  saturation: number; // -100 to 100 (default 0)
  temperature: number; // -100 to 100 (default 0)
  tint: number; // -100 to 100 (default 0)
  vignette: number; // 0 to 100 (default 0)
  sharpness: number; // 0 to 100 (default 0)
  motionBlur: number; // 0 to 100 (default 0)
  lut: string; // 'none' | 'teal_orange' | 'monochrome' | 'vintage' | 'cyberpunk' | 'warm_gold' | 'cinematic_log' | 'kodak_chrome'
  lift: { r: number; g: number; b: number }; // Lift (Shadows) RGB offsets (-50 to 50)
  gamma: { r: number; g: number; b: number }; // Gamma (Midtones) RGB offsets (-50 to 50)
  gain: { r: number; g: number; b: number }; // Gain (Highlights) RGB offsets (-50 to 50)
}

export type TransitionType = 'none' | 'cross_dissolve' | 'slide_left' | 'slide_up' | 'dip_black' | 'dip_white' | 'zoom_blur' | 'clock_wipe' | 'ripple';

export interface SpeedKeyframe {
  id: string;
  time: number; // relative time inside the clip, 0 to clip.duration
  speed: number; // playback speed factor, e.g. 0.25 to 4.0
}

export function interpolateSpeedKeyframes(
  keyframes: SpeedKeyframe[] | undefined,
  localTime: number,
  defaultSpeed: number
): number {
  if (!keyframes || keyframes.length === 0) {
    return defaultSpeed;
  }
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  
  if (localTime <= sorted[0].time) {
    return sorted[0].speed;
  }
  
  if (localTime >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1].speed;
  }
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];
    if (localTime >= k1.time && localTime <= k2.time) {
      if (Math.abs(k2.time - k1.time) < 0.001) {
        return k2.speed;
      }
      const t = (localTime - k1.time) / (k2.time - k1.time);
      // Smooth cosine interpolation for elegant, smooth speed ramping deceleration/acceleration
      const smoothT = (1 - Math.cos(t * Math.PI)) / 2;
      return parseFloat((k1.speed + (k2.speed - k1.speed) * smoothT).toFixed(3));
    }
  }
  
  return defaultSpeed;
}

export interface ChromaKeySettings {
  enabled: boolean;
  keyColor: string; // e.g. '#00ff00' for green screen
  similarity: number; // 0 to 100
  smoothness: number; // 0 to 100
}

export interface VideoClip {
  id: string;
  name: string;
  type: 'video';
  proceduralType: ProceduralType;
  startTime: number; // Start time on the absolute timeline (seconds)
  duration: number;  // Current duration (seconds)
  sourceStart: number; // Offset inside the source media (seconds)
  sourceDuration: number; // Maximum duration of source clip (seconds)
  speed: number;     // Playback speed (0.5x, 1x, 2x etc)
  colorGrading: ColorGradingParams;
  volume: number; // Clip-specific volume (0 to 100)
  trackId?: 'v1' | 'v2'; // Track layer (v1: base, v2: overlay / PiP)
  
  // Real media resources
  videoUrl?: string;
  thumbnailUrl?: string;
  youtubeId?: string;
  
  // Effects & Filters
  effect?: VideoEffectType;
  chromaKey?: ChromaKeySettings;
  
  // Transform and Keyframing overrides
  keyframes?: Keyframe[];
  opacity?: number; // 0 to 100, default 100
  scale?: number; // 10 to 300, default 100
  positionX?: number; // 0 to 100, default 50
  positionY?: number; // 0 to 100, default 50
  rotation?: number; // -180 to 180 degrees, default 0
  flipH?: boolean;
  flipV?: boolean;
  
  speedKeyframes?: SpeedKeyframe[];
  cropX?: number; // 0 to 100, default 0
  cropY?: number; // 0 to 100, default 0
  cropWidth?: number; // 10 to 100, default 100
  cropHeight?: number; // 10 to 100, default 100
  aspectRatio?: 'free' | '16:9' | '9:16' | '1:1' | '4:3' | '2.39:1';
  blendMode?: 'normal' | 'screen' | 'multiply' | 'overlay';
}

export type AudioStyleType = 
  | 'synth_wave' 
  | 'ambient_drone' 
  | 'beat_loop' 
  | '808_bass' 
  | 'riser' 
  | 'lofi_chill' 
  | 'tech_house'
  | 'custom_recorded';

export interface AudioClip {
  id: string;
  name: string;
  type: 'audio';
  startTime: number;
  duration: number;
  sourceStart: number;
  volume: number; // 0 to 100
  pan?: number; // -100 (left) to 100 (right)
  audioStyle: AudioStyleType;
  audioUrl?: string; // For recorded voiceovers or uploaded audio tracks
}

export interface TextClip {
  id: string;
  name: string;
  type: 'text';
  startTime: number;
  duration: number;
  text: string;
  color: string;
  fontSize: number;
  positionY: number; // percentage from top (10-90)
  style: 'regular' | 'neon' | 'bordered' | 'glitch' | 'cinematic_lower_third' | 'badge';
  animation?: TextAnimationStyle;
  fontFamily?: string;
  backgroundColor?: string;
  letterSpacing?: number;
  
  // Transform and Keyframing overrides
  keyframes?: Keyframe[];
  opacity?: number; // 0 to 100, default 100
  scale?: number; // 10 to 300, default 100
  positionX?: number; // 0 to 100, default 50
  rotation?: number; // -180 to 180
}

export type TrackId = 'v2' | 'v1' | 't1' | 'a1' | 'a2';

export interface TimelineTransition {
  id: string;
  atTime: number; // Timing boundary
  type: TransitionType;
  duration: number; // Default e.g. 0.8 seconds
  fromClipId: string;
  toClipId: string;
}

export interface TimelineMarker {
  id: string;
  time: number; // 0 to project.duration
  color: string; // Hex color or Tailwind class
  label: string; // e.g. "Beat Drop", "Scene Cut", "Voice In"
}

export interface Project {
  id: string;
  name: string;
  category?: 'Cinematic' | 'Gaming' | 'Vlog' | 'Lifestyle';
  description?: string;
  videoClips: VideoClip[];
  audioClips: AudioClip[];
  textClips: TextClip[];
  transitions: TimelineTransition[];
  duration: number; // total duration
  markers?: TimelineMarker[];
}
