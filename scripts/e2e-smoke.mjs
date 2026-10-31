// End-to-end smoke test against the production build.
// Usage: npm run build && npm run test:e2e   (starts `vite preview` on its own)
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4179;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const results = [];

function check(name, ok, details = '') {
  results.push({ name, ok });
  console.log(`${ok ? '✅' : '❌'} ${name}${details ? ` (${details})` : ''}`);
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`Preview server did not start at ${url}`);
}

/**
 * Runs in the page. Box-counting dimension of the iso-luminance contours of a PNG frame,
 * averaged over the 40th/50th/60th luminance percentiles, on box sizes 8–128 px.
 * Validated on reference images: a circle measures 1.04, spectral fBm with H = 0.8 / 0.6 / 0.4
 * measures 1.27 / 1.40 / 1.57 (theory: 1.2 / 1.4 / 1.6).
 */
async function boxCountingDimension(pngBase64) {
  const img = new Image();
  img.src = `data:image/png;base64,${pngBase64}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx2d = canvas.getContext('2d');
  ctx2d.drawImage(img, 0, 0);
  const { data } = ctx2d.getImageData(0, 0, img.width, img.height);

  // Drop a 64px border (vignette), then compute luminance
  const border = 64;
  const w = img.width - 2 * border;
  const h = img.height - 2 * border;
  const lum = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = ((y + border) * img.width + (x + border)) * 4;
      lum[y * w + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
  }
  const sorted = Float32Array.from(lum).sort();
  const sizes = [8, 16, 32, 64, 128];
  const slopes = [];

  for (const percentile of [0.4, 0.5, 0.6]) {
    const threshold = sorted[Math.floor(percentile * sorted.length)];
    const edge = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const above = lum[y * w + x] > threshold;
        if ((x + 1 < w && above !== (lum[y * w + x + 1] > threshold)) ||
            (y + 1 < h && above !== (lum[(y + 1) * w + x] > threshold))) {
          edge[y * w + x] = 1;
        }
      }
    }
    // Least-squares slope of log(count) against log(size)
    const points = sizes.map(s => {
      const occupied = new Set();
      for (let y = 0; y < Math.floor(h / s) * s; y++) {
        for (let x = 0; x < Math.floor(w / s) * s; x++) {
          if (edge[y * w + x]) occupied.add(Math.floor(y / s) * 10000 + Math.floor(x / s));
        }
      }
      return [Math.log(s), Math.log(Math.max(occupied.size, 1))];
    });
    const mx = points.reduce((a, p) => a + p[0], 0) / points.length;
    const my = points.reduce((a, p) => a + p[1], 0) / points.length;
    const slope = points.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) /
      points.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
    slopes.push(-slope);
  }
  return slopes.reduce((a, b) => a + b, 0) / slopes.length;
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
  stdio: 'ignore'
});

let browser;
try {
  await waitForServer(BASE_URL);
  browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

  const phaseText = page => page.evaluate(() => ({
    label: document.getElementById('phase-label')?.textContent ?? '',
    subtext: document.getElementById('phase-subtext')?.textContent ?? ''
  }));

  // --- Phone viewport, French locale ---
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
  const page = await ctx.newPage();
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { if (!r.url().startsWith(BASE_URL)) externalRequests.push(r.url()); });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const idle = await phaseText(page);
  check('French locale is detected', idle.label === 'Respirez avec la lumière', idle.label);
  check('<html lang> follows the locale', await page.evaluate(() => document.documentElement.lang) === 'fr');

  await page.mouse.click(195, 420);
  await page.waitForTimeout(1200);
  const afterTap = await phaseText(page);
  check('A single tap starts the session', afterTap.label !== 'En pause' && afterTap.label !== idle.label, afterTap.label);

  await page.mouse.click(195, 420);
  await page.waitForTimeout(400);
  check('A second tap pauses it', (await phaseText(page)).label === 'En pause');

  const overflow = await page.evaluate(() => {
    const header = document.querySelector('.hud-top');
    return [...(header?.querySelectorAll('button') ?? [])]
      .filter(b => b.offsetParent !== null)
      .some(b => b.getBoundingClientRect().right > window.innerWidth);
  });
  check('Header buttons fit a 390px wide screen', !overflow);

  // Double-tap toggles OLED mode without changing playback
  await page.mouse.click(195, 420);
  await page.waitForTimeout(1000);
  const playingBefore = (await phaseText(page)).label !== 'En pause';
  await page.mouse.click(195, 420);
  await page.waitForTimeout(80);
  await page.mouse.click(195, 420);
  await page.waitForTimeout(400);
  const oled = await page.evaluate(() => document.body.classList.contains('oled-black-active'));
  const playingAfter = (await phaseText(page)).label !== 'En pause';
  check('Double-tap enables OLED mode and keeps playback', oled && playingBefore && playingAfter);
  await page.keyboard.press('Escape');

  await page.click('#btn-info');
  await page.waitForTimeout(300);
  check('Info drawer shows the medical disclaimer', await page.isVisible('.drawer-disclaimer'));
  await page.keyboard.press('Escape');

  // Preferences survive a reload
  await page.click('#atmosphere-swatches .atmosphere-btn:nth-child(2)');
  await page.reload({ waitUntil: 'networkidle' });
  const activeAtmosphere = await page.evaluate(() =>
    [...document.querySelectorAll('#atmosphere-swatches .atmosphere-btn')].findIndex(b => b.classList.contains('active')));
  check('Selected atmosphere is restored after reload', activeAtmosphere === 1, `index ${activeAtmosphere}`);

  // Offline support via the service worker
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  await ctx.setOffline(true);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(500);
  check('App loads offline after the first visit', (await phaseText(page)).label.length > 0);
  await ctx.setOffline(false);

  check('No external network requests', externalRequests.length === 0, externalRequests.join(', '));
  check('No runtime errors', errors.length === 0, errors.join(' | '));
  await ctx.close();

  // --- English locale ---
  const enCtx = await browser.newContext({ locale: 'en-US' });
  const enPage = await enCtx.newPage();
  await enPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  check('English locale is detected', (await phaseText(enPage)).label === 'Breathe with the light');
  await enPage.keyboard.press('Space');
  await enPage.waitForTimeout(800);
  check('Space starts the session on first press', (await phaseText(enPage)).label !== 'Paused');
  await enCtx.close();

  // --- Science pages: load cleanly and their launch buttons open the matching atmosphere ---
  const sciCtx = await browser.newContext({ locale: 'en-US' });
  const sciPage = await sciCtx.newPage();
  const sciErrors = [];
  sciPage.on('pageerror', e => sciErrors.push(e.message));
  sciPage.on('console', m => { if (m.type() === 'error') sciErrors.push(m.text()); });
  const sciencePages = {
    'baroreflex-resonance-0-10hz': 'Celestial Aurora',
    'box-breathing-autonomic-regulation': 'Oceanic Tide',
    'vagus-nerve-acetylcholine': 'Warm Hearth',
    'binaural-beats-theta-entrainment': 'Astral Void',
    '432hz-vs-440hz-acoustic-physics': null
  };
  for (const [slug, atmosphere] of Object.entries(sciencePages)) {
    await sciPage.goto(`${BASE_URL}science/${slug}.html`, { waitUntil: 'networkidle' });
    const hasRawMath = await sciPage.evaluate(() => /\$[^$\s][^$]*\$/.test(document.body.innerText));
    check(`Science page ${slug} renders without raw LaTeX`, !hasRawMath);
    await sciPage.click('.launch-btn');
    await sciPage.waitForLoadState('networkidle');
    if (atmosphere) {
      const active = await sciPage.evaluate(() => document.querySelector('#atmosphere-swatches .atmosphere-btn.active')?.textContent ?? '');
      check(`Launch link from ${slug} opens ${atmosphere}`, active.includes(atmosphere), active.trim());
    } else {
      const tuning = await sciPage.evaluate(() => document.getElementById('tuning-text')?.textContent);
      check(`Launch link from ${slug} sets 432 Hz`, tuning === '432 Hz', tuning);
    }
  }
  check('Science pages have no runtime errors', sciErrors.length === 0, sciErrors.join(' | '));
  await sciCtx.close();

  // --- Fractal dimension of the rendered visuals (the "fractal fluency" claim, D in 1.3–1.5) ---
  const fdCtx = await browser.newContext({ viewport: { width: 1024, height: 1024 } });
  const fdPage = await fdCtx.newPage();
  await fdPage.goto(`${BASE_URL}?nograin`, { waitUntil: 'networkidle' });
  await fdPage.addStyleTag({ content: '.hud-top, .hud-bottom, .breath-guide { display: none !important; }' });
  const atmosphereCount = await fdPage.locator('#atmosphere-swatches .atmosphere-btn').count();
  for (let i = 0; i < atmosphereCount; i++) {
    await fdPage.evaluate(i => document.querySelectorAll('#atmosphere-swatches .atmosphere-btn')[i].click(), i);
    await fdPage.waitForTimeout(1200);
    const png = (await fdPage.locator('#gl-canvas').screenshot()).toString('base64');
    const dimension = await fdPage.evaluate(boxCountingDimension, png);
    check(`Atmosphere ${i + 1} renders a fractal of dimension 1.3–1.5`, dimension >= 1.3 && dimension <= 1.5, `D = ${dimension.toFixed(2)}`);
  }
  await fdCtx.close();
} finally {
  await browser?.close();
  server.kill();
}

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
