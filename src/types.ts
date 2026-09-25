export type ClipType = 'video' | 'audio' | 'text' | 'element' | 'caption';

export type ProceduralType = 'cyberpunk_grid' | 'nebula_ocean' | 'geometric_warp' | 'vaporwave_sunset';

export type VideoEffectType = 
  | 'none' 
  | 'vhs' 
  | 'glitch' 
  | 'cinema_glow' 
  | 'film_grain' 
  | 'rgb_split' 
  | 'invert' 
  | 'duotone' 
  | 'bloom' 
  | 'anamorphic'
  | 'blur'
  | 'distortion'
  | 'light_leak'
  | 'retro';

export type FilterPresetType = 
  | 'none'
  | 'cinematic_teal_orange'
  | 'moody_dark'
  | 'vintage_70s'
  | 'bw_high_contrast'
  | 'warm_sunset'
  | 'cool_arctic'
  | 'cyberpunk_neon'
  | 'film_noir'
  | 'portrait_soft';

export type TextAnimationStyle = 
  | 'none' 
  | 'fade' 
  | 'slide' 
  | 'typewriter' 
  | 'scale' 
  | 'blur' 
  | 'pop' 
  | 'cinematic';

export type TransitionType = 
  | 'none' 
  | 'cross_dissolve' 
  | 'fade_black' 
  | 'fade_white' 
  | 'slide_left' 
  | 'slide_right' 
  | 'slide_up' 
  | 'zoom_blur' 
  | 'glitch' 
  | 'light_leak' 
  | 'clock_wipe' 
  | 'ripple';

export interface Keyframe {
  id: string;
  time: number; // relative time inside the clip, 0 to clip.duration
  opacity: number; // 0 to 100
  scale: number; // 10 to 300
  positionX: number; // 0 to 100
  positionY: number; // 0 to 100
  rotation?: number; // -180 to 180
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
  exposure: number; // -100 to 100 (default 0)
  brightness: number; // -100 to 100 (default 0)
  contrast: number; // -100 to 100 (default 0)
  highlights: number; // -100 to 100 (default 0)
  shadows: number; // -100 to 100 (default 0)
  saturation: number; // -100 to 100 (default 0)
  temperature: number; // -100 to 100 (default 0)
  tint: number; // -100 to 100 (default 0)
  sharpness: number; // 0 to 100 (default 0)
  vignette: number; // 0 to 100 (default 0)
  filterPreset: FilterPresetType;
  filterIntensity: number; // 0 to 100 (default 100)
}

export interface SpeedKeyframe {
  id: string;
  time: number;
  speed: number;
}

export interface VideoClip {
  id: string;
  name: string;
  type: 'video';
  proceduralType?: ProceduralType;
  startTime: number;
  duration: number;
  sourceStart: number;
  sourceDuration: number;
  speed: number;
  volume: number;
  trackId: 'v1' | 'v2' | 'v3';
  
  // Media source
  videoUrl?: string;
  thumbnailUrl?: string;
  
  // Transform properties
  scale: number; // 10 to 300, default 100
  positionX: number; // 0 to 100, default 50
  positionY: number; // 0 to 100, default 50
  rotation: number; // -180 to 180, default 0
  anchorX?: number; // 0 to 100, default 50
  anchorY?: number; // 0 to 100, default 50
  
  // Crop properties (percentage from edges)
  cropTop?: number; // 0 to 50
  cropBottom?: number; // 0 to 50
  cropLeft?: number; // 0 to 50
  cropRight?: number; // 0 to 50
  
  // Blend & Compositing
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'darken' | 'lighten';
  opacity: number; // 0 to 100, default 100
  
  // Professional toggles
  stabilization?: boolean;
  motionBlur?: boolean;
  lensCorrection?: boolean;
  reverse?: boolean;
  
  // Color & Effects
  colorGrading: ColorGradingParams;
  effect?: VideoEffectType;
  effectIntensity?: number;
  
  keyframes?: Keyframe[];
  speedKeyframes?: SpeedKeyframe[];
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5' | '4:3' | '2.39:1' | 'free';
}

export type AudioStyleType = 
  | 'synth_wave' 
  | 'ambient_drone' 
  | 'beat_loop' 
  | 'voiceover' 
  | 'cinematic_score' 
  | 'lofi_chill' 
  | 'sound_effect' 
  | 'custom_recorded';

export interface AudioClip {
  id: string;
  name: string;
  type: 'audio';
  startTime: number;
  duration: number;
  sourceStart: number;
  volume: number; // 0 to 200, default 100
  pan: number; // -100 to 100, default 0
  fadeIn?: number; // seconds, 0 to 5
  fadeOut?: number; // seconds, 0 to 5
  noiseReduction?: boolean;
  equalizerPreset?: 'flat' | 'bass_boost' | 'vocal_enhance' | 'treble_boost' | 'cinematic';
  audioStyle: AudioStyleType;
  audioUrl?: string;
  trackId: 'a1' | 'a2';
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
  fontFamily: string;
  fontWeight?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  backgroundColor?: string;
  positionX: number; // 0 to 100
  positionY: number; // 0 to 100
  rotation?: number;
  scale?: number;
  opacity: number;
  style?: 'regular' | 'neon' | 'bordered' | 'glitch' | 'cinematic_lower_third' | 'badge';
  animation: TextAnimationStyle;
  keyframes?: Keyframe[];
  trackId: 't1' | 'captions';
}

export interface CaptionItem {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export type TrackId = 'v3' | 'v2' | 'v1' | 't1' | 'captions' | 'a1' | 'a2';

export interface TimelineTransition {
  id: string;
  atTime: number;
  type: TransitionType;
  duration: number;
  fromClipId: string;
  toClipId: string;
}

export interface TimelineMarker {
  id: string;
  time: number;
  color: string;
  label: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  thumbnailUrl: string;
  duration: number;
  format: string;
  size?: string;
  resolution?: string;
  favorite?: boolean;
  dateAdded?: string;
}

export interface Project {
  id: string;
  name: string;
  category?: 'Cinematic' | 'Gaming' | 'Vlog' | 'Lifestyle';
  description?: string;
  resolution: '720p' | '1080p' | '1440p' | '4K';
  fps: 24 | 25 | 30 | 50 | 60;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5' | '4:3';
  videoClips: VideoClip[];
  audioClips: AudioClip[];
  textClips: TextClip[];
  captions?: CaptionItem[];
  transitions: TimelineTransition[];
  duration: number;
  markers?: TimelineMarker[];
  lastSaved?: string;
}
