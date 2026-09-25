import { getAssetUrl } from './assetUrl';

/**
 * High-performance background media preloader.
 * Preloads primary videos and images as soon as the DOM boots
 * so that video clips, thumbnails, and editor playback render instantly.
 */
export function preloadCoreMedia() {
  if (typeof window === 'undefined') return;

  const keyImages = ['logo.png', 'logomax.png', 'bg2.png', 'bg99.png', 'bg2-1.png'];
  const primaryVideos = ['1.mp4', '2.mp4', '3.mp4', '4.mp4', '5.mp4', '6.mp4', '7.mp4', '8.mp4', '9.mp4', '10.mp4', '11.mp4', '12.mp4'];

  // 1. Preload key background images
  keyImages.forEach((imgName) => {
    const img = new Image();
    img.src = getAssetUrl(imgName);
  });

  // 2. Preload first tier video files immediately for instant video display
  primaryVideos.forEach((vidName, idx) => {
    // Stagger slightly after first 3 to prevent network congestion while keeping initial playback instant
    const delay = idx < 3 ? 0 : idx * 120;
    setTimeout(() => {
      try {
        const v = document.createElement('video');
        v.preload = 'auto';
        v.muted = true;
        v.playsInline = true;
        v.crossOrigin = 'anonymous';
        v.src = getAssetUrl(vidName);
        v.addEventListener('loadeddata', () => {
          if (v.currentTime === 0) {
            v.currentTime = 0.001; // Forces initial video frame decode
          }
        }, { once: true });
        v.load();
      } catch (err) {
        // Silently ignore background preload errors
      }
    }, delay);
  });
}
