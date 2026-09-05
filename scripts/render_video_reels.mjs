import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

/**
 * Chromasync Studio Reel Synthesizer
 * Generates 330 sequential frames (30 fps for 11 seconds = 1 complete 0.10 Hz cycle)
 * accurately reflecting the Chromasync UI, WebGL aura, and 432 Hz binaural audio.
 */

const OUT_DIR = path.resolve('media-reels');
const FRAMES_DIR = path.join(OUT_DIR, 'frames');
const MP4_DIR = path.join(OUT_DIR, 'mp4');

[OUT_DIR, FRAMES_DIR, MP4_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

console.log('--- Chromasync Studio Reel Synthesizer ---');

// 1. Synthesize 11.0 seconds of 432 Hz + 5.5 Hz Theta Binaural Audio (16-bit PCM WAV)
function generate432HzAudio(outputPath, duration = 11.0) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(16, 34); // 16-bit
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);

  const baseFreq = 432.0;
  const beatFreq = 5.5; // Theta

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // Dynamic swell matching breath cycle (5.5s in, 5.5s out)
    const cyclePhase = (t % 11.0) / 11.0;
    const breathEnvelope = 0.45 + 0.40 * (0.5 - 0.5 * Math.cos(2 * Math.PI * cyclePhase));

    // Left channel: 432.0 Hz + subtle sub-harmonic
    const leftSample = (Math.sin(2 * Math.PI * baseFreq * t) * 0.75 + Math.sin(2 * Math.PI * (baseFreq / 2) * t) * 0.25) * breathEnvelope;

    // Right channel: 437.5 Hz (432 + 5.5Hz Theta binaural beat)
    const rightFreq = baseFreq + beatFreq;
    const rightSample = (Math.sin(2 * Math.PI * rightFreq * t) * 0.75 + Math.sin(2 * Math.PI * (rightFreq / 2) * t) * 0.25) * breathEnvelope;

    const left16 = Math.max(-32767, Math.min(32767, Math.floor(leftSample * 22000)));
    const right16 = Math.max(-32767, Math.min(32767, Math.floor(rightSample * 22000)));

    buf.writeInt16LE(left16, 44 + i * 4);
    buf.writeInt16LE(right16, 44 + i * 4 + 2);
  }

  fs.writeFileSync(outputPath, buf);
  console.log(`✓ Synthesized 432 Hz / 5.5 Hz Theta audio: ${outputPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

const audioPath = path.join(OUT_DIR, 'audio_432hz.wav');
generate432HzAudio(audioPath, 11.0);

// 2. Generate 330 sequential frames (30 fps for 11 seconds)
console.log('Synthesizing 330 high-fidelity video frames...');
const fps = 30;
const totalFrames = fps * 11; // 330 frames
const totalCircumference = 2 * Math.PI * 260; // radius 260 => ~1633.628

for (let i = 0; i < totalFrames; i++) {
  const t = i / fps;
  const isInhale = t < 5.5;
  const phaseProgress = isInhale ? (t / 5.5) : ((t - 5.5) / 5.5);

  // Smooth sinusoidal breath scale: 0.85 (empty) to 1.25 (full)
  const breathScale = isInhale
    ? 0.85 + 0.40 * (0.5 - 0.5 * Math.cos(Math.PI * phaseProgress))
    : 1.25 - 0.40 * (0.5 - 0.5 * Math.cos(Math.PI * phaseProgress));

  // Circular progress ring offset
  const progressRatio = isInhale ? phaseProgress : (1.0 - phaseProgress);
  const strokeDashOffset = totalCircumference * (1.0 - progressRatio);

  const phaseTitle = isInhale ? 'Inhale' : 'Exhale';
  const phaseSubtext = isInhale ? 'Breathe with the light' : 'Release and surrender';

  // Dynamic fluid aura radii
  const auraR1 = 440 * breathScale;
  const auraR2 = 300 * breathScale;
  const rotAngle = (t * 15).toFixed(1);

  const frameSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <radialGradient id="bgDark" cx="50%" cy="46%" r="65%">
      <stop offset="0%" stop-color="#14182b" />
      <stop offset="60%" stop-color="#090b10" />
      <stop offset="100%" stop-color="#040508" />
    </radialGradient>

    <!-- Living Aurora Watercolor Core -->
    <radialGradient id="auroraPeach" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffb38a" stop-opacity="${(0.55 * breathScale).toFixed(2)}" />
      <stop offset="40%" stop-color="#705df2" stop-opacity="${(0.35 * breathScale).toFixed(2)}" />
      <stop offset="75%" stop-color="#38bdf8" stop-opacity="${(0.15 * breathScale).toFixed(2)}" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="auroraViolet" cx="45%" cy="55%" r="50%">
      <stop offset="0%" stop-color="#705df2" stop-opacity="${(0.45 * breathScale).toFixed(2)}" />
      <stop offset="60%" stop-color="#38bdf8" stop-opacity="${(0.20 * breathScale).toFixed(2)}" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <filter id="auraGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="35" />
    </filter>

    <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="1080" height="1920" fill="url(#bgDark)" />

  <!-- Flowing Fluid Watercolor Aurora -->
  <g transform="translate(540, 880) rotate(${rotAngle})">
    <ellipse cx="0" cy="0" rx="${auraR1.toFixed(1)}" ry="${(auraR1 * 0.75).toFixed(1)}" fill="url(#auroraPeach)" filter="url(#auraGlow)" />
    <ellipse cx="20" cy="-20" rx="${auraR2.toFixed(1)}" ry="${(auraR2 * 0.85).toFixed(1)}" fill="url(#auroraViolet)" filter="url(#auraGlow)" />
  </g>

  <!-- Central Breath Guidance Ring -->
  <g transform="translate(540, 880)">
    <!-- Base track ring -->
    <circle cx="0" cy="0" r="260" fill="rgba(19, 23, 34, 0.45)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="4" />
    
    <!-- Active filling/emptying progress ring -->
    <circle cx="0" cy="0" r="260" fill="none" stroke="#ffb38a" stroke-width="7" stroke-linecap="round"
            stroke-dasharray="${totalCircumference.toFixed(1)}" stroke-dashoffset="${strokeDashOffset.toFixed(1)}"
            transform="rotate(-90)" filter="url(#ringGlow)" />

    <!-- Center glowing bead -->
    <circle cx="0" cy="0" r="8" fill="#ffffff" filter="url(#ringGlow)" />

    <!-- Central Labels (matching real app typography) -->
    <text x="0" y="-12" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="64" font-weight="600" fill="#ffffff" letter-spacing="1">${phaseTitle}</text>
    <text x="0" y="44" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="400" fill="#94a3b8" letter-spacing="0.5">${phaseSubtext}</text>
  </g>

  <!-- Top Real HUD Bar -->
  <g transform="translate(60, 110)">
    <!-- Brand -->
    <circle cx="20" cy="20" r="8" fill="#ffb38a" filter="url(#ringGlow)" />
    <text x="40" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="700" fill="#ffffff" letter-spacing="1">Chromasync</text>

    <!-- Duration indicator -->
    <rect x="360" y="0" width="240" height="42" rx="21" fill="rgba(19, 23, 34, 0.75)" stroke="#222838" stroke-width="1.5" />
    <text x="420" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" fill="#94a3b8">DURATION</text>
    <rect x="520" y="6" width="30" height="30" rx="15" fill="#705df2" />
    <text x="535" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="700" fill="#ffffff">∞</text>

    <!-- Tuning Badge -->
    <rect x="700" y="0" width="260" height="42" rx="21" fill="rgba(19, 23, 34, 0.85)" stroke="rgba(255, 179, 138, 0.4)" stroke-width="1.5" />
    <text x="730" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="600" fill="#ffb38a">✨ 432 Hz</text>
    <rect x="830" y="8" width="115" height="26" rx="13" fill="rgba(255, 179, 138, 0.15)" />
    <text x="887" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#ffb38a">Harmonisé</text>
  </g>

  <!-- Bottom Real Zen Dock -->
  <g transform="translate(60, 1660)">
    <rect x="0" y="0" width="960" height="110" rx="55" fill="rgba(19, 23, 34, 0.88)" stroke="#222838" stroke-width="1.5" filter="url(#ringGlow)" />
    
    <!-- Rhythm Pill -->
    <text x="50" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" fill="#94a3b8">RHYTHM</text>
    <rect x="130" y="28" width="180" height="54" rx="27" fill="#705df2" />
    <text x="220" y="61" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600" fill="#ffffff">Coherence 5.5s</text>

    <!-- Divider -->
    <line x1="340" y1="30" x2="340" y2="80" stroke="#334155" stroke-width="1.5" />

    <!-- Atmosphere -->
    <text x="375" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" fill="#94a3b8">ATMOSPHERE</text>
    <rect x="500" y="28" width="220" height="54" rx="27" fill="rgba(255, 255, 255, 0.08)" stroke="#ffb38a" stroke-width="1.5" />
    <text x="610" y="61" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="500" fill="#ffffff">🌌 Celestial Aurora</text>

    <!-- Divider -->
    <line x1="750" y1="30" x2="750" y2="80" stroke="#334155" stroke-width="1.5" />

    <!-- Pause Button -->
    <rect x="785" y="28" width="135" height="54" rx="27" fill="rgba(255, 255, 255, 0.12)" />
    <text x="852" y="61" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600" fill="#ffffff">⏸ Pause</text>
  </g>

  <!-- Scientific Quality Footer -->
  <text x="540" y="1840" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', monospace" font-size="16" font-weight="500" fill="#38bdf8" letter-spacing="2">
    0.10 Hz BAROREFLEX COHERENCE • 18.5 KB • ZERO EXTERNAL AUDIO
  </text>
</svg>`;

  const frameNum = String(i + 1).padStart(4, '0');
  fs.writeFileSync(path.join(FRAMES_DIR, `frame_${frameNum}.svg`), frameSvg, 'utf-8');
}

console.log(`✓ 330 frames generated successfully in ${FRAMES_DIR}`);

// 3. If ffmpeg is present, compile immediately to MP4 with 432 Hz audio
const ffmpegTest = spawnSync('ffmpeg', ['-version']);
if (ffmpegTest.status === 0) {
  console.log('Encoding MP4 video with ffmpeg & 432 Hz audio...');
  const mp4Out = path.join(MP4_DIR, 'chromasync-reel-vertical.mp4');
  const ffmpegArgs = [
    '-y',
    '-r', '30',
    '-i', path.join(FRAMES_DIR, 'frame_%04d.svg'),
    '-i', audioPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    mp4Out
  ];
  const res = spawnSync('ffmpeg', ffmpegArgs, { stdio: 'inherit' });
  if (res.status === 0) {
    console.log(`✓ High-fidelity video generated: ${mp4Out}`);
  }
} else {
  console.log('ffmpeg not found on this machine (frames are ready for GitHub Actions CI encoding).');
}
