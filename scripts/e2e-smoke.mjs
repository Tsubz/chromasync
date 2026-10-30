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
} finally {
  await browser?.close();
  server.kill();
}

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
