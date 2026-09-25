import { ColorGradingParams, ProceduralType, TransitionType, VideoEffectType, TextAnimationStyle, ChromaKeySettings } from '../types';

// Convert RGB offsets (-50 to 50) into color adjustments
export function applyGrading(
  baseHex: string,
  params: ColorGradingParams,
  luminanceClass: 'shadow' | 'midtone' | 'highlight' = 'midtone'
): string {
  let r = 128;
  let g = 128;
  let b = 128;

  if (baseHex.startsWith('#')) {
    const hex = baseHex.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  } else if (baseHex.startsWith('rgb')) {
    const match = baseHex.match(/\d+/g);
    if (match && match.length >= 3) {
      r = parseInt(match[0]);
      g = parseInt(match[1]);
      b = parseInt(match[2]);
    }
  }

  // 1. Temperature & Tint
  const tempOffset = params.temperature * 0.6;
  r += tempOffset;
  g += tempOffset * 0.2;
  b -= tempOffset;

  const tintOffset = params.tint * 0.5;
  r += tintOffset * 0.4;
  g -= tintOffset;
  b += tintOffset * 0.4;

  // 2. Shadows/Midtones/Highlights
  if (luminanceClass === 'shadow') {
    r += params.lift.r;
    g += params.lift.g;
    b += params.lift.b;
  } else if (luminanceClass === 'highlight') {
    r += params.gain.r;
    g += params.gain.g;
    b += params.gain.b;
  } else {
    r += params.gamma.r;
    g += params.gamma.g;
    b += params.gamma.b;
  }

  // 3. Brightness
  const brightnessOffset = params.brightness * 1.5;
  r += brightnessOffset;
  g += brightnessOffset;
  b += brightnessOffset;

  // 4. Contrast
  const contrastFactor = 1 + params.contrast / 100;
  r = (r - 128) * contrastFactor + 128;
  g = (g - 128) * contrastFactor + 128;
  b = (b - 128) * contrastFactor + 128;

  // 5. Saturation
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const satFactor = 1 + params.saturation / 100;
  r = gray + (r - gray) * satFactor;
  g = gray + (g - gray) * satFactor;
  b = gray + (g - gray) * satFactor;

  // 6. LUT Presets
  if (params.lut === 'teal_orange') {
    r = r > 120 ? r * 1.1 + 10 : r * 0.85;
    g = g > 120 ? g * 0.95 : g * 1.05 + 10;
    b = b > 120 ? b * 0.8 : b * 1.2 + 15;
  } else if (params.lut === 'monochrome') {
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    r = luma * 1.05;
    g = luma;
    b = luma * 0.95;
  } else if (params.lut === 'vintage') {
    r = r * 0.95 + 15;
    g = g * 0.9 + 10;
    b = b * 0.8 + 25;
  } else if (params.lut === 'cyberpunk') {
    const luma = (r + g + b) / 3;
    if (luma > 150) {
      r = Math.max(r, 220);
      g = Math.min(g, 100);
      b = Math.max(b, 220);
    } else {
      r = Math.min(r, 60);
      g = Math.max(g, 160);
      b = Math.max(b, 200);
    }
  } else if (params.lut === 'warm_gold') {
    r = r * 1.15 + 10;
    g = g * 1.05 + 5;
    b = b * 0.85;
  }

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Render Cyberpunk Grid scene
function drawCyberpunkGrid(ctx: CanvasRenderingContext2D, time: number, params: ColorGradingParams) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  skyGrad.addColorStop(0, applyGrading('#04020a', params, 'shadow'));
  skyGrad.addColorStop(0.5, applyGrading('#0c0721', params, 'shadow'));
  skyGrad.addColorStop(1, applyGrading('#220c38', params, 'midtone'));
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.65);

  const sunRadius = Math.min(w, h) * 0.25;
  const sunX = w / 2;
  const sunY = h * 0.42;

  const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.2, sunX, sunY, sunRadius * 1.8);
  sunGlow.addColorStop(0, applyGrading('rgba(255, 30, 110, 0.4)', params, 'highlight'));
  sunGlow.addColorStop(0.5, applyGrading('rgba(255, 110, 20, 0.1)', params, 'midtone'));
  sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
  sunGrad.addColorStop(0, applyGrading('#ffea00', params, 'highlight'));
  sunGrad.addColorStop(0.6, applyGrading('#ff0055', params, 'highlight'));
  sunGrad.addColorStop(1, applyGrading('#7a00ff', params, 'midtone'));
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  const numStripes = 8;
  ctx.fillStyle = applyGrading('#0c0721', params, 'shadow');
  for (let i = 0; i < numStripes; i++) {
    const yRatio = 0.1 + (i / numStripes) * 0.85;
    const stripeY = sunY + (yRatio - 0.5) * sunRadius * 1.8;
    const stripeHeight = 2 + i * 1.8;
    if (stripeY > sunY - sunRadius && stripeY < sunY + sunRadius) {
      ctx.fillRect(sunX - sunRadius, stripeY, sunRadius * 2, stripeHeight);
    }
  }

  const gridTop = h * 0.65;
  const groundGrad = ctx.createLinearGradient(0, gridTop, 0, h);
  groundGrad.addColorStop(0, applyGrading('#0d051c', params, 'shadow'));
  groundGrad.addColorStop(1, applyGrading('#020108', params, 'shadow'));
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, gridTop, w, h - gridTop);

  ctx.strokeStyle = applyGrading('rgba(0, 255, 234, 0.45)', params, 'highlight');
  ctx.lineWidth = 1.5;

  const vpX = w / 2;
  const vpY = gridTop;
  const numPerspLines = 18;
  for (let i = -numPerspLines; i <= numPerspLines; i++) {
    const bottomX = vpX + (i * w) / 6;
    ctx.beginPath();
    ctx.moveTo(vpX, vpY);
    ctx.lineTo(bottomX, h);
    ctx.stroke();
  }

  const speed = (time * 0.8) % 1;
  const numHorizLines = 14;
  for (let i = 0; i < numHorizLines; i++) {
    const t = (i + speed) / numHorizLines;
    const y = vpY + Math.pow(t, 2.2) * (h - vpY);
    const alpha = Math.min(1, t * 1.5);
    ctx.strokeStyle = applyGrading(`rgba(255, 0, 153, ${alpha * 0.6})`, params, 'midtone');
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

// Render Nebula Ocean scene
function drawNebulaOcean(ctx: CanvasRenderingContext2D, time: number, params: ColorGradingParams) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, applyGrading('#020412', params, 'shadow'));
  bgGrad.addColorStop(0.6, applyGrading('#061838', params, 'shadow'));
  bgGrad.addColorStop(1, applyGrading('#0a0d24', params, 'shadow'));
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const numClouds = 4;
  for (let i = 0; i < numClouds; i++) {
    const cx = (w * 0.3 * i + Math.sin(time * 0.2 + i) * 60) % (w * 1.2);
    const cy = h * 0.35 + Math.cos(time * 0.15 + i * 2) * 50;
    const r = Math.min(w, h) * (0.35 + i * 0.1);

    const cloudGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
    if (i % 2 === 0) {
      cloudGrad.addColorStop(0, applyGrading('rgba(0, 220, 255, 0.25)', params, 'highlight'));
      cloudGrad.addColorStop(0.5, applyGrading('rgba(110, 0, 255, 0.15)', params, 'midtone'));
    } else {
      cloudGrad.addColorStop(0, applyGrading('rgba(255, 50, 180, 0.22)', params, 'highlight'));
      cloudGrad.addColorStop(0.5, applyGrading('rgba(0, 80, 255, 0.12)', params, 'midtone'));
    }
    cloudGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const numStars = 40;
  for (let i = 0; i < numStars; i++) {
    const sx = (Math.sin(i * 99 + 1) * 0.5 + 0.5) * w;
    const sy = (Math.cos(i * 33 + 1) * 0.5 + 0.5) * h * 0.7;
    const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5;
    ctx.fillStyle = applyGrading(`rgba(255, 255, 255, ${twinkle * 0.8 + 0.2})`, params, 'highlight');
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(1, (i % 3) * 0.8), 0, Math.PI * 2);
    ctx.fill();
  }
}

// Render Geometric Warp scene
function drawGeometricWarp(ctx: CanvasRenderingContext2D, time: number, params: ColorGradingParams) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  ctx.fillStyle = applyGrading('#030308', params, 'shadow');
  ctx.fillRect(0, 0, w, h);

  const numRings = 14;
  for (let i = 0; i < numRings; i++) {
    const ringProgress = (i + (time * 0.8) % 1) / numRings;
    const radius = Math.pow(ringProgress, 2) * Math.min(w, h) * 0.75;
    const rot = time * 0.5 + ringProgress * Math.PI;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.strokeStyle = applyGrading(
      i % 2 === 0 ? 'rgba(0, 255, 170, 0.7)' : 'rgba(255, 0, 120, 0.7)',
      params,
      i % 2 === 0 ? 'highlight' : 'midtone'
    );
    ctx.lineWidth = 2 + ringProgress * 3;

    ctx.beginPath();
    const sides = 6;
    for (let s = 0; s <= sides; s++) {
      const angle = (s / sides) * Math.PI * 2;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// Render Vaporwave Sunset scene
function drawVaporwaveSunset(ctx: CanvasRenderingContext2D, time: number, params: ColorGradingParams) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, applyGrading('#1f083d', params, 'shadow'));
  grad.addColorStop(0.4, applyGrading('#541154', params, 'shadow'));
  grad.addColorStop(0.7, applyGrading('#a62456', params, 'midtone'));
  grad.addColorStop(0.9, applyGrading('#f26938', params, 'highlight'));
  grad.addColorStop(1, applyGrading('#ffc44d', params, 'highlight'));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const sunRadius = Math.min(w, h) * 0.22;
  const sunX = w / 2;
  const sunY = h * 0.52;

  ctx.fillStyle = applyGrading('#fffa75', params, 'highlight');
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, Math.PI, 0);
  ctx.fill();

  const numWaves = 5;
  for (let i = 0; i < numWaves; i++) {
    const y = h * 0.65 + i * (h * 0.08);
    const alpha = 0.4 + (i / numWaves) * 0.6;
    ctx.fillStyle = applyGrading(`rgba(20, 8, 48, ${alpha})`, params, 'shadow');
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, y);
    for (let x = 0; x <= w; x += 20) {
      const wave = Math.sin(x * 0.015 + time * 2 + i) * 8;
      ctx.lineTo(x, y + wave);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawClipFrame(
  ctx: CanvasRenderingContext2D,
  type: ProceduralType,
  time: number,
  params: ColorGradingParams
) {
  switch (type) {
    case 'cyberpunk_grid':
      drawCyberpunkGrid(ctx, time, params);
      break;
    case 'nebula_ocean':
      drawNebulaOcean(ctx, time, params);
      break;
    case 'geometric_warp':
      drawGeometricWarp(ctx, time, params);
      break;
    case 'vaporwave_sunset':
      drawVaporwaveSunset(ctx, time, params);
      break;
  }
}

// Visual Effects Renderer (VHS, Glitch, Cinema Glow, Film Grain, RGB Split, Anamorphic, etc.)
export function applyVideoEffects(
  ctx: CanvasRenderingContext2D,
  effect: VideoEffectType = 'none',
  time: number
) {
  if (!effect || effect === 'none') return;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  if (effect === 'vhs') {
    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
    // VHS noise bar
    const noiseY = (time * 180) % h;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(0, noiseY, w, 6);
    // Subtle color bleed
    ctx.fillStyle = 'rgba(255, 0, 100, 0.04)';
    ctx.fillRect(0, 0, w, h);
  } else if (effect === 'glitch') {
    // Random glitch slices
    const slices = 3;
    for (let i = 0; i < slices; i++) {
      if (Math.sin(time * 30 + i * 10) > 0.4) {
        const sy = (Math.abs(Math.sin(time * 15 + i)) * (h - 30));
        const sh = 10 + Math.random() * 20;
        const dx = (Math.random() - 0.5) * 25;
        ctx.drawImage(ctx.canvas, 0, sy, w, sh, dx, sy, w, sh);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.fillRect(0, sy, w, sh);
      }
    }
  } else if (effect === 'cinema_glow') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else if (effect === 'film_grain') {
    // Procedural noise
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 80; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      ctx.fillRect(gx, gy, 2, 2);
    }
  } else if (effect === 'rgb_split') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 0, 80, 0.06)';
    ctx.fillRect(-4, 0, w, h);
    ctx.fillStyle = 'rgba(0, 255, 220, 0.06)';
    ctx.fillRect(4, 0, w, h);
    ctx.restore();
  } else if (effect === 'anamorphic') {
    // Anamorphic horizontal blue flare
    const flareY = h * 0.45;
    const flareGrad = ctx.createLinearGradient(0, flareY, w, flareY);
    flareGrad.addColorStop(0, 'rgba(0, 200, 255, 0)');
    flareGrad.addColorStop(0.5, 'rgba(0, 220, 255, 0.25)');
    flareGrad.addColorStop(1, 'rgba(0, 200, 255, 0)');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, flareY - 2, w, 4);
  } else if (effect === 'bloom') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255, 220, 150, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// Chroma Key Green Screen Extraction
export function applyChromaKey(
  ctx: CanvasRenderingContext2D,
  chromaKey?: ChromaKeySettings
) {
  if (!chromaKey || !chromaKey.enabled) return;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  
  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let targetR = 0;
    let targetG = 255;
    let targetB = 0;

    if (chromaKey.keyColor.startsWith('#')) {
      const hex = chromaKey.keyColor.slice(1);
      if (hex.length === 6) {
        targetR = parseInt(hex.slice(0, 2), 16);
        targetG = parseInt(hex.slice(2, 4), 16);
        targetB = parseInt(hex.slice(4, 6), 16);
      }
    }

    const maxDist = (chromaKey.similarity / 100) * 441;
    const smooth = (chromaKey.smoothness / 100) * 50;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt(
        (r - targetR) * (r - targetR) +
        (g - targetG) * (g - targetG) +
        (b - targetB) * (b - targetB)
      );

      if (dist < maxDist) {
        if (smooth > 0 && dist > maxDist - smooth) {
          const alphaFactor = (dist - (maxDist - smooth)) / smooth;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        } else {
          data[i + 3] = 0;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    // Cross-origin fallback safety
  }
}

// Draw Rich Text Overlays with Animations & Styles
export function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  text: string,
  color: string,
  fontSize: number,
  positionY: number,
  style: 'regular' | 'neon' | 'bordered' | 'glitch' | 'cinematic_lower_third' | 'badge' = 'regular',
  time: number = 0,
  animation: TextAnimationStyle = 'none',
  fontFamily: string = 'Inter, sans-serif'
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;
  const cy = (positionY / 100) * h;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Handle Animations
  let displayText = text;
  let animScale = 1.0;
  let animAlpha = 1.0;
  let animOffsetX = 0;
  let animOffsetY = 0;

  if (animation === 'typewriter') {
    const charCount = Math.min(text.length, Math.floor(time * 12));
    displayText = text.slice(0, charCount);
    if (Math.sin(time * 8) > 0 && charCount < text.length) {
      displayText += '|';
    }
  } else if (animation === 'glitch_shake') {
    animOffsetX = Math.sin(time * 25) * 3;
    animOffsetY = Math.cos(time * 25) * 1.5;
  } else if (animation === 'neon_pulse') {
    animAlpha = 0.75 + Math.sin(time * 6) * 0.25;
  } else if (animation === 'bounce') {
    animScale = 1.0 + Math.abs(Math.sin(time * 4)) * 0.12;
  } else if (animation === 'fade_slide') {
    animOffsetY = Math.sin(time * 2) * 4;
  }

  ctx.globalAlpha = animAlpha;
  ctx.translate(cx + animOffsetX, cy + animOffsetY);
  ctx.scale(animScale, animScale);

  if (style === 'cinematic_lower_third') {
    ctx.font = `600 ${Math.round(fontSize * 0.9)}px ${fontFamily}`;
    const metrics = ctx.measureText(displayText);
    const boxW = metrics.width + 40;
    const boxH = fontSize * 1.6;

    // Dark sleek glass pill
    ctx.fillStyle = 'rgba(5, 7, 15, 0.85)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = color;
    ctx.fillText(displayText, 0, 0);
  } else if (style === 'badge') {
    ctx.font = `800 ${Math.round(fontSize * 0.8)}px ${fontFamily}`;
    const metrics = ctx.measureText(displayText);
    const boxW = metrics.width + 24;
    const boxH = fontSize * 1.4;

    ctx.fillStyle = 'rgba(99, 102, 241, 0.9)';
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(displayText, 0, 0);
  } else if (style === 'neon') {
    ctx.font = `800 ${fontSize}px ${fontFamily}`;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeText(displayText, 0, 0);
    ctx.fillText(displayText, 0, 0);
    ctx.shadowBlur = 0;
  } else if (style === 'bordered') {
    ctx.font = `800 ${fontSize}px ${fontFamily}`;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, fontSize * 0.15);
    ctx.fillStyle = color;
    ctx.strokeText(displayText, 0, 0);
    ctx.fillText(displayText, 0, 0);
  } else if (style === 'glitch') {
    ctx.font = `900 ${fontSize}px ${fontFamily}`;
    const shiftX = Math.sin(time * 20) * 3;
    const shiftY = Math.cos(time * 20) * 2;

    ctx.fillStyle = '#ff0055';
    ctx.fillText(displayText, -shiftX, -shiftY);
    ctx.fillStyle = '#00ffff';
    ctx.fillText(displayText, shiftX, shiftY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(displayText, 0, 0);
  } else {
    // regular
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.fillText(displayText, 0, 0);
  }

  ctx.restore();
}

// Blend transition frame
export function drawTransitionFrame(
  ctx: CanvasRenderingContext2D,
  fromType: ProceduralType,
  fromGrading: ColorGradingParams,
  toType: ProceduralType,
  toGrading: ColorGradingParams,
  timeFrom: number,
  timeTo: number,
  progress: number,
  type: TransitionType,
  fromAnim?: { opacity: number; scale: number; positionX: number; positionY: number; rotation?: number },
  toAnim?: { opacity: number; scale: number; positionX: number; positionY: number; rotation?: number },
  customDrawA?: (ctxA: CanvasRenderingContext2D) => void,
  customDrawB?: (ctxB: CanvasRenderingContext2D) => void
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const canvasA = document.createElement('canvas');
  canvasA.width = w;
  canvasA.height = h;
  const ctxA = canvasA.getContext('2d')!;

  const canvasB = document.createElement('canvas');
  canvasB.width = w;
  canvasB.height = h;
  const ctxB = canvasB.getContext('2d')!;

  if (customDrawA) {
    customDrawA(ctxA);
  } else {
    if (fromAnim) {
      ctxA.save();
      ctxA.globalAlpha = fromAnim.opacity / 100;
      const cx = w / 2;
      const cy = h / 2;
      const dx = ((fromAnim.positionX - 50) / 100) * w;
      const dy = ((fromAnim.positionY - 50) / 100) * h;
      const s = fromAnim.scale / 100;
      ctxA.translate(cx + dx, cy + dy);
      if (fromAnim.rotation) ctxA.rotate((fromAnim.rotation * Math.PI) / 180);
      ctxA.scale(s, s);
      ctxA.translate(-cx, -cy);
    }
    drawClipFrame(ctxA, fromType, timeFrom, fromGrading);
    if (fromAnim) ctxA.restore();
  }

  if (customDrawB) {
    customDrawB(ctxB);
  } else {
    if (toAnim) {
      ctxB.save();
      ctxB.globalAlpha = toAnim.opacity / 100;
      const cx = w / 2;
      const cy = h / 2;
      const dx = ((toAnim.positionX - 50) / 100) * w;
      const dy = ((toAnim.positionY - 50) / 100) * h;
      const s = toAnim.scale / 100;
      ctxB.translate(cx + dx, cy + dy);
      if (toAnim.rotation) ctxB.rotate((toAnim.rotation * Math.PI) / 180);
      ctxB.scale(s, s);
      ctxB.translate(-cx, -cy);
    }
    drawClipFrame(ctxB, toType, timeTo, toGrading);
    if (toAnim) ctxB.restore();
  }

  ctx.clearRect(0, 0, w, h);

  if (type === 'cross_dissolve') {
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.drawImage(canvasA, 0, 0);
    ctx.globalAlpha = progress;
    ctx.drawImage(canvasB, 0, 0);
    ctx.restore();
  } else if (type === 'slide_left') {
    ctx.save();
    const xOffset = progress * w;
    ctx.drawImage(canvasA, -xOffset, 0);
    ctx.drawImage(canvasB, w - xOffset, 0);
    ctx.restore();
  } else if (type === 'slide_up') {
    ctx.save();
    const yOffset = progress * h;
    ctx.drawImage(canvasA, 0, -yOffset);
    ctx.drawImage(canvasB, 0, h - yOffset);
    ctx.restore();
  } else if (type === 'dip_black') {
    ctx.save();
    if (progress < 0.5) {
      const alpha = 1 - progress * 2;
      ctx.globalAlpha = alpha;
      ctx.drawImage(canvasA, 0, 0);
      ctx.globalAlpha = 1 - alpha;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
    } else {
      const alpha = (progress - 0.5) * 2;
      ctx.globalAlpha = alpha;
      ctx.drawImage(canvasB, 0, 0);
      ctx.globalAlpha = 1 - alpha;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  } else if (type === 'dip_white') {
    ctx.save();
    if (progress < 0.5) {
      const alpha = 1 - progress * 2;
      ctx.globalAlpha = alpha;
      ctx.drawImage(canvasA, 0, 0);
      ctx.globalAlpha = 1 - alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    } else {
      const alpha = (progress - 0.5) * 2;
      ctx.globalAlpha = alpha;
      ctx.drawImage(canvasB, 0, 0);
      ctx.globalAlpha = 1 - alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  } else if (type === 'zoom_blur') {
    ctx.save();
    if (progress < 0.5) {
      const p = progress * 2;
      const scale = 1 + p * 0.8;
      ctx.globalAlpha = 1 - p;
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2, -h / 2);
      ctx.drawImage(canvasA, 0, 0);
    } else {
      const p = (progress - 0.5) * 2;
      const scale = 1.8 - p * 0.8;
      ctx.globalAlpha = p;
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2, -h / 2);
      ctx.drawImage(canvasB, 0, 0);
    }
    ctx.restore();
  } else if (type === 'clock_wipe') {
    ctx.save();
    ctx.drawImage(canvasA, 0, 0);
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    const radius = Math.max(w, h);
    const angle = progress * Math.PI * 2 - Math.PI / 2;
    ctx.arc(w / 2, h / 2, radius, -Math.PI / 2, angle);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(canvasB, 0, 0);
    ctx.restore();
  } else if (type === 'ripple') {
    ctx.save();
    if (progress < 0.5) {
      const p = progress * 2;
      ctx.globalAlpha = 1 - p * 0.3;
      const amplitude = p * 20;
      const frequency = 0.06;
      const speed = p * 15;
      for (let y = 0; y < h; y += 2) {
        const offset = Math.sin(y * frequency - speed) * amplitude;
        ctx.drawImage(canvasA, 0, y, w, 2, offset, y, w, 2);
      }
    } else {
      const p = (progress - 0.5) * 2;
      ctx.globalAlpha = p;
      const amplitude = (1 - p) * 20;
      const frequency = 0.06;
      const speed = (1 - p) * 15;
      for (let y = 0; y < h; y += 2) {
        const offset = Math.sin(y * frequency - speed) * amplitude;
        ctx.drawImage(canvasB, 0, y, w, 2, offset, y, w, 2);
      }
    }
    ctx.restore();
  } else {
    if (progress < 0.5) {
      ctx.drawImage(canvasA, 0, 0);
    } else {
      ctx.drawImage(canvasB, 0, 0);
    }
  }
}
