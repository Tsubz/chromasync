import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

/**
 * Headless Visual Reel Synthesizer for Chromasync
 * Generates vertical (1080x1920) and horizontal (1920x1080) video clips & animated assets
 * Designed to run locally or inside GitHub Actions (ubuntu-latest has pre-installed ffmpeg).
 */

const OUTPUT_DIR = path.resolve('media-reels');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('--- Chromasync Headless Media Reel Synthesizer ---');
console.log(`Target directory: ${OUTPUT_DIR}`);

// 1. Generate an animated SVG reel that renders smoothly in browsers, markdown, and websites
function generateAnimatedSvgReel(width, height, filename) {
  const durationSec = 11.0; // 5.5s Inhale + 5.5s Exhale (0.10 Hz Coherence)
  const isVertical = height > width;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      @keyframes breatheCycle {
        0% { transform: scale(0.65); opacity: 0.4; }
        50% { transform: scale(1.15); opacity: 0.95; }
        100% { transform: scale(0.65); opacity: 0.4; }
      }
      @keyframes auraGlow {
        0% { stop-color: #2a2040; }
        50% { stop-color: #ffb38a; }
        100% { stop-color: #2a2040; }
      }
      @keyframes phaseText {
        0%, 10% { opacity: 1; content: "Inhale (5.5s)"; }
        45%, 55% { opacity: 0.3; }
        56%, 95% { opacity: 1; content: "Exhale (5.5s)"; }
      }
      .breathing-group {
        transform-origin: ${width / 2}px ${height * 0.42}px;
        animation: breatheCycle ${durationSec}s ease-in-out infinite;
      }
    </style>
    <radialGradient id="reelBg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#191c2b" />
      <stop offset="60%" stop-color="#0c0e14" />
      <stop offset="100%" stop-color="#06070a" />
    </radialGradient>
    <radialGradient id="fluidAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffb38a" stop-opacity="0.65" />
      <stop offset="40%" stop-color="#705df2" stop-opacity="0.4" />
      <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <filter id="blurFilter" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="30" />
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#reelBg)" />

  <!-- Animated Fluid Breath Core -->
  <g class="breathing-group">
    <circle cx="${width / 2}" cy="${height * 0.42}" r="${isVertical ? 360 : 260}" fill="url(#fluidAura)" filter="url(#blurFilter)" />
    <circle cx="${width / 2}" cy="${height * 0.42}" r="${isVertical ? 220 : 160}" fill="none" stroke="#705df2" stroke-width="3" stroke-dasharray="8 8" opacity="0.6" />
    <circle cx="${width / 2}" cy="${height * 0.42}" r="${isVertical ? 180 : 130}" fill="none" stroke="#ffb38a" stroke-width="4" opacity="0.9" />
    <circle cx="${width / 2}" cy="${height * 0.42}" r="12" fill="#ffffff" />
  </g>

  <!-- Typography & Social Hook Text -->
  <g text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
    <text x="${width / 2}" y="${height * (isVertical ? 0.72 : 0.76)}" font-size="${isVertical ? 52 : 36}" font-weight="700" letter-spacing="4">CHROMASYNC</text>
    <text x="${width / 2}" y="${height * (isVertical ? 0.76 : 0.81)}" font-size="${isVertical ? 28 : 20}" font-weight="300" fill="#94a3b8" letter-spacing="2">0.10 Hz BAROREFLEX COHERENCE</text>
    <text x="${width / 2}" y="${height * (isVertical ? 0.80 : 0.86)}" font-size="${isVertical ? 24 : 16}" font-weight="400" fill="#38bdf8">18.5 KB • ZERO EXTERNAL AUDIO • PURE PROCEDURAL DSP</text>
  </g>
</svg>`;

  const outPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outPath, svgContent, 'utf-8');
  console.log(`✓ Created animated reel asset: ${outPath}`);
}

// Generate vertical reel (9:16 for TikTok / Shorts / Reels)
generateAnimatedSvgReel(1080, 1920, 'reel-vertical-coherence.svg');

// Generate horizontal reel (16:9 for X / YouTube / Web)
generateAnimatedSvgReel(1920, 1080, 'reel-horizontal-coherence.svg');

console.log('Media reel generation complete.');
