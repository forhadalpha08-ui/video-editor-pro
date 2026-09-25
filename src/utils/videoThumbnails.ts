/**
 * High-performance Video Preview Poster & Real-Frame Snapshot Engine.
 * 
 * Provides:
 * 1. Instant 0ms HD Thematic SVG Poster Data URLs (renders instantly with zero network delay).
 * 2. Background Real-Frame Capture (extracts exact video frame onto canvas as soon as loaded).
 * 3. Memory & SessionStorage caching for instant subsequent loads.
 */

const realPosterCache = new Map<string, string>();

// Initialize from sessionStorage if available
if (typeof window !== 'undefined') {
  try {
    for (let i = 1; i <= 12; i++) {
      const saved = sessionStorage.getItem(`vido_poster_${i}.mp4`);
      if (saved) {
        realPosterCache.set(`${i}.mp4`, saved);
      }
    }
  } catch {
    // Ignore storage restrictions
  }
}

// Crisp Thematic SVG Posters that render in 0.0ms with no network delay
const THEMATIC_POSTER_SVGS: Record<string, { bg: string; accent1: string; accent2: string; icon: string; title: string }> = {
  '1.mp4': {
    bg: '#05071a',
    accent1: '#ec4899',
    accent2: '#06b6d4',
    icon: '⚡ NEON CYBERPUNK',
    title: 'Tokyo Night Drive'
  },
  '2.mp4': {
    bg: '#04101e',
    accent1: '#38bdf8',
    accent2: '#6366f1',
    icon: '🏔️ ALPINE DRONE',
    title: 'Alpine Summit 4K'
  },
  '3.mp4': {
    bg: '#140505',
    accent1: '#ef4444',
    accent2: '#f59e0b',
    icon: '🏎️ SPEED DRIFT',
    title: 'Racetrack Drift'
  },
  '4.mp4': {
    bg: '#080811',
    accent1: '#a855f7',
    accent2: '#3b82f6',
    icon: '📱 TECH PRODUCT',
    title: 'Minimal Hardware'
  },
  '5.mp4': {
    bg: '#180a04',
    accent1: '#f97316',
    accent2: '#ec4899',
    icon: '🌅 GOLDEN SUNSET',
    title: 'Horizon Glow'
  },
  '6.mp4': {
    bg: '#0d091a',
    accent1: '#8b5cf6',
    accent2: '#06b6d4',
    icon: '🧥 URBAN STREET',
    title: 'Street Fashion'
  },
  '7.mp4': {
    bg: '#080d1a',
    accent1: '#3b82f6',
    accent2: '#10b981',
    icon: '🎙️ STUDIO CREATOR',
    title: 'Studio Lighting'
  },
  '8.mp4': {
    bg: '#140905',
    accent1: '#f43f5e',
    accent2: '#fb923c',
    icon: '🎬 ACTION CINEMA',
    title: 'Cinematic Action'
  },
  '9.mp4': {
    bg: '#15051c',
    accent1: '#d946ef',
    accent2: '#8b5cf6',
    icon: '📼 RETRO SYNTHWAVE',
    title: 'VHS 1984 Vibe'
  },
  '10.mp4': {
    bg: '#0a0a0c',
    accent1: '#94a3b8',
    accent2: '#475569',
    icon: '🕵️ FILM NOIR',
    title: 'Monochrome Shadows'
  },
  '11.mp4': {
    bg: '#050c18',
    accent1: '#0ea5e9',
    accent2: '#a855f7',
    icon: '🌃 CITY HYPERLAPSE',
    title: 'Metropolis Lights'
  },
  '12.mp4': {
    bg: '#070314',
    accent1: '#8b5cf6',
    accent2: '#ec4899',
    icon: '🌌 DEEP COSMOS',
    title: 'Nebula Galaxy'
  }
};

function generateSvgPosterDataUrl(videoKey: string): string {
  const meta = THEMATIC_POSTER_SVGS[videoKey] || {
    bg: '#060a1d',
    accent1: '#6366f1',
    accent2: '#38bdf8',
    icon: '🎬 PRO VIDEO',
    title: 'VidoEdit Preview'
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${meta.bg}"/>
      <stop offset="50%" stop-color="#020308"/>
      <stop offset="100%" stop-color="${meta.bg}"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${meta.accent1}"/>
      <stop offset="100%" stop-color="${meta.accent2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${meta.accent1}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${meta.accent2}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blurFilter">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="640" height="360" fill="url(#bgGrad)"/>
  <circle cx="320" cy="180" r="160" fill="url(#glow)"/>
  
  <!-- Grid Lines -->
  <path d="M0 60 H640 M0 120 H640 M0 180 H640 M0 240 H640 M0 300 H640" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <path d="M106 0 V360 M213 0 V360 M320 0 V360 M426 0 V360 M533 0 V360" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>

  <!-- Glowing Center Play Shape -->
  <circle cx="320" cy="170" r="38" fill="rgba(6,10,25,0.85)" stroke="url(#accentGrad)" stroke-width="2"/>
  <polygon points="314,156 332,170 314,184" fill="#ffffff"/>

  <!-- Badge Header -->
  <rect x="24" y="24" width="140" height="24" rx="12" fill="rgba(0,0,0,0.6)" stroke="${meta.accent1}" stroke-width="1"/>
  <text x="36" y="40" fill="${meta.accent1}" font-family="system-ui, sans-serif" font-size="10" font-weight="900" letter-spacing="1">${meta.icon}</text>

  <!-- Video File Tag -->
  <rect x="546" y="24" width="70" height="24" rx="6" fill="rgba(0,0,0,0.7)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="581" y="40" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold">${videoKey}</text>

  <!-- Bottom Title -->
  <text x="32" y="320" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="800">${meta.title}</text>
  <text x="32" y="340" fill="rgba(148,163,184,0.8)" font-family="system-ui, sans-serif" font-size="11">Real-time GPU Stream • 60 FPS • 4K HDR</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Returns instant poster URL (real frame if captured, or instant SVG poster).
 */
export function getVideoPoster(videoFile: string): string {
  const normalized = videoFile.replace(/^.*[\\/]/, '');
  if (realPosterCache.has(normalized)) {
    return realPosterCache.get(normalized)!;
  }
  return generateSvgPosterDataUrl(normalized);
}

/**
 * Captures a real video frame from an active HTMLVideoElement and caches it.
 */
export function captureRealVideoPoster(video: HTMLVideoElement, videoFile: string): string | null {
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
    return null;
  }

  const normalized = videoFile.replace(/^.*[\\/]/, '');
  if (realPosterCache.has(normalized)) {
    return realPosterCache.get(normalized)!;
  }

  try {
    const canvas = document.createElement('canvas');
    const maxW = 480;
    const scale = Math.min(1, maxW / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

    realPosterCache.set(normalized, dataUrl);
    try {
      sessionStorage.setItem(`vido_poster_${normalized}`, dataUrl);
    } catch {
      // Storage quota safety
    }

    // Broadcast event for active UI subscribers
    window.dispatchEvent(new CustomEvent('vido_poster_updated', { detail: { videoFile: normalized, posterUrl: dataUrl } }));
    return dataUrl;
  } catch {
    return null;
  }
}
