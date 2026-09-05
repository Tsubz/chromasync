import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// 1. Generate ultra-high-definition SVG vector card
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#2a2040" stop-opacity="0.95" />
      <stop offset="40%" stop-color="#14182b" stop-opacity="0.98" />
      <stop offset="100%" stop-color="#090b10" stop-opacity="1" />
    </radialGradient>
    <radialGradient id="auroraCore" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#ffb38a" stop-opacity="0.45" />
      <stop offset="35%" stop-color="#705df2" stop-opacity="0.3" />
      <stop offset="70%" stop-color="#38bdf8" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGlow)" />

  <!-- Aurora Fluid Glow -->
  <ellipse cx="600" cy="270" rx="420" ry="240" fill="url(#auroraCore)" />

  <!-- Ambient Guide Rings -->
  <circle cx="600" cy="270" r="140" fill="none" stroke="#705df2" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="6 6" />
  <circle cx="600" cy="270" r="110" fill="none" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="2" />
  <circle cx="600" cy="270" r="85" fill="none" stroke="#ffb38a" stroke-opacity="0.8" stroke-width="3" filter="url(#glow)" />
  <circle cx="600" cy="270" r="6" fill="#ffb38a" filter="url(#glow)" />

  <!-- App Title & Philosophy -->
  <g text-anchor="middle">
    <text x="600" y="460" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Playfair Display', serif" font-size="44" font-weight="600" fill="#ffffff" letter-spacing="4">CHROMASYNC</text>
    <text x="600" y="500" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="300" fill="#94a3b8" letter-spacing="2">THE CHROMATIC BREATHING COMPANION</text>
    
    <!-- Pills Badge -->
    <rect x="360" y="535" width="480" height="36" rx="18" fill="#1e2433" fill-opacity="0.8" stroke="#334155" stroke-width="1" />
    <text x="600" y="559" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace" font-size="14" font-weight="400" fill="#38bdf8" letter-spacing="1.5">0.10 Hz BAROREFLEX RESONANCE • 18 KB ZERO-BLOAT • PROCEDURAL DSP</text>
  </g>
</svg>`;

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'og-preview.svg'), svgContent, 'utf-8');
console.log('Created public/og-preview.svg');

// 2. Generate a valid, genuine 1200x630 PNG bitmap using Node standard zlib
function generatePng(width, height, outputPath) {
  // Precompute CRC table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  // Generate image buffer: 1 filter byte (0) + 4 bytes per pixel (RGBA) per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    const dy = (y - cy);
    const dy2 = dy * dy;

    for (let x = 0; x < width; x++) {
      const dx = (x - cx);
      const dist = Math.sqrt(dx * dx + dy2);
      const pxOffset = rowOffset + 1 + x * 4;

      // Base atmospheric dark radial background
      const baseDistNorm = Math.min(1.0, dist / 700);
      let r = Math.floor(13 * (1 - baseDistNorm) + 9 * baseDistNorm);
      let g = Math.floor(16 * (1 - baseDistNorm) + 11 * baseDistNorm);
      let b = Math.floor(28 * (1 - baseDistNorm) + 16 * baseDistNorm);

      // Aurora nebula glow (warm peach & amethyst)
      if (dist < 380) {
        const glow = Math.pow(1 - dist / 380, 2.2);
        r = Math.min(255, Math.floor(r + 180 * glow * 0.65));
        g = Math.min(255, Math.floor(g + 110 * glow * 0.45));
        b = Math.min(255, Math.floor(b + 220 * glow * 0.85));
      }

      // Breath guide circle ring (radius ~ 95px)
      const ringDist = Math.abs(dist - 95);
      if (ringDist < 6) {
        const ringIntensity = (1 - ringDist / 6);
        r = Math.min(255, Math.floor(r + 255 * ringIntensity * 0.9));
        g = Math.min(255, Math.floor(g + 180 * ringIntensity * 0.75));
        b = Math.min(255, Math.floor(b + 140 * ringIntensity * 0.6));
      }

      // Outer delicate guide ring (radius ~ 125px)
      const outerRingDist = Math.abs(dist - 125);
      if (outerRingDist < 3) {
        const outerIntensity = (1 - outerRingDist / 3);
        r = Math.min(255, Math.floor(r + 80 * outerIntensity * 0.5));
        g = Math.min(255, Math.floor(g + 160 * outerIntensity * 0.7));
        b = Math.min(255, Math.floor(b + 240 * outerIntensity * 0.9));
      }

      // Center glowing bead (radius ~ 8px)
      if (dist < 8) {
        const bead = (1 - dist / 8);
        r = Math.min(255, Math.floor(r + 255 * bead));
        g = Math.min(255, Math.floor(g + 220 * bead));
        b = Math.min(255, Math.floor(b + 200 * bead));
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = 255; // Alpha
    }
  }

  // Compress with zlib
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // Build PNG chunks
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngFile = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, pngFile);
  console.log(`Created ${outputPath} (${(pngFile.length / 1024).toFixed(1)} KB)`);
}

generatePng(1200, 630, path.join(publicDir, 'og-preview.png'));
