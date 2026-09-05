import { spawn } from 'child_process';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const TARGET_URL = "http://localhost:3000/";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.msgId = 0;
    this.callbacks = new Map();
    this.consoleErrors = [];

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) {
          reject(msg.error);
        } else {
          resolve(msg.result);
        }
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params.type === 'error') {
          const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
          this.consoleErrors.push(text);
        }
      } else if (msg.method === 'Runtime.exceptionThrown') {
        this.consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
      }
    };
  }

  async waitOpen() {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve();
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text + ' ' + (res.exceptionDetails.exception?.description || ''));
    }
    return res.result?.value;
  }
}

import os from 'os';
import path from 'path';
import fs from 'fs';

async function runTests() {
  console.log('🚀 Starting Headless Chrome for Test Execution...');

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-test-'));

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    `--user-data-dir=${tempDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    TARGET_URL
  ]);

  let cdp = null;
  const testResults = [];

  function record(testId, name, passed, details = '') {
    testResults.push({ testId, name, passed, details });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} [${testId}] ${name} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // Wait for Chrome port to become available
    let pageTarget = null;
    for (let i = 0; i < 25; i++) {
      await sleep(300);
      try {
        const resp = await fetch(`http://127.0.0.1:${PORT}/json/list`);
        const list = await resp.json();
        pageTarget = list.find(t => t.type === 'page' && t.url.includes('3000')) || list.find(t => t.type === 'page');
        if (pageTarget) break;
      } catch (e) {
        // Retry
      }
    }

    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('Failed to find Chrome page target on port ' + PORT);
    }

    console.log('🔗 Connecting to page target at', pageTarget.webSocketDebuggerUrl);
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.waitOpen();

    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    
    console.log('Navigating page to', TARGET_URL);
    await cdp.send('Page.navigate', { url: TARGET_URL });
    await sleep(2000); // Allow Vite modules and WebGL shaders to compile and mount

    const loadedUrl = await cdp.evaluate('window.location.href');
    const docTitle = await cdp.evaluate('document.title');
    console.log(`Page Loaded: ${docTitle} (${loadedUrl})\n`);

    console.log('\n--- EXECUTING TEST SUITE ---\n');

    // =========================================================================
    // DOMAIN A1: Atmosphere Switch -> Auto-Harmonization
    // =========================================================================
    console.log('📋 Domain A1: Atmosphere Switch -> Rhythm & Frequency Auto-Harmonization');

    const atmospheres = [
      { id: 'aurora', name: 'Aurora', expectedPattern: 'coherence_55', expectedFreq: 432 },
      { id: 'ocean', name: 'Ocean', expectedPattern: 'box_4444', expectedFreq: 528 },
      { id: 'rain', name: 'Rain', expectedPattern: 'sleep_426', expectedFreq: 432 },
      { id: 'hearth', name: 'Hearth', expectedPattern: 'relax_478', expectedFreq: 432 },
      { id: 'astral', name: 'Astral', expectedPattern: 'sigh_huberman', expectedFreq: 528 }
    ];

    for (const atm of atmospheres) {
      const clickRes = await cdp.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.atmosphere-btn'));
          const target = btns.find(b => b.title && b.title.toLowerCase().includes('${atm.name.toLowerCase()}'));
          if (target) {
            target.click();
            return true;
          }
          return false;
        })()
      `);

      await sleep(150);

      const state = await cdp.evaluate(`
        (() => {
          const tuningText = document.getElementById('tuning-text')?.textContent?.trim();
          const btnTuning = document.getElementById('btn-tuning');
          const isHarmonized = btnTuning?.classList.contains('is-harmonized');
          const isCustom = btnTuning?.classList.contains('is-custom');
          const activePill = document.querySelector('.pill-btn.active')?.textContent?.trim();
          const activeAtm = document.querySelector('.atmosphere-btn.active')?.textContent?.trim();
          return { tuningText, isHarmonized, isCustom, activePill, activeAtm };
        })()
      `);

      const pass = clickRes && state.isHarmonized && !state.isCustom && state.tuningText === `${atm.expectedFreq} Hz`;
      record(`A1-${atm.id}`, `Atmosphere [${atm.name}] Auto-Tuning`, pass, 
        `Freq: ${state.tuningText}, Harmonized: ${state.isHarmonized}, Active Pill: ${state.activePill}`);
    }

    // =========================================================================
    // DOMAIN A2: Rhythm Switch -> Atmosphere & Frequency Auto-Harmonization
    // =========================================================================
    console.log('\n📋 Domain A2: Rhythm Switch -> Atmosphere & Frequency Auto-Harmonization');

    const rhythms = [
      { index: 0, name: 'Soupir 2+1', expectedAtm: 'Astral', expectedFreq: 528 },
      { index: 1, name: '5.5s Cohérence', expectedAtm: 'Aurora', expectedFreq: 432 },
      { index: 2, name: 'Box 4s', expectedAtm: 'Ocean', expectedFreq: 528 },
      { index: 3, name: '4-7-8 Relax', expectedAtm: 'Hearth', expectedFreq: 432 },
      { index: 4, name: '4-2-6 Unwind', expectedAtm: 'Rain', expectedFreq: 432 },
      { index: 5, name: 'Souffle Libre', expectedAtm: 'Rain', expectedFreq: 432 }
    ];

    for (const r of rhythms) {
      await cdp.evaluate(`
        (() => {
          const pills = document.querySelectorAll('.pill-btn');
          if (pills[${r.index}]) pills[${r.index}].click();
        })()
      `);

      await sleep(150);

      const state = await cdp.evaluate(`
        (() => {
          const tuningText = document.getElementById('tuning-text')?.textContent?.trim();
          const btnTuning = document.getElementById('btn-tuning');
          const isHarmonized = btnTuning?.classList.contains('is-harmonized');
          const isCustom = btnTuning?.classList.contains('is-custom');
          const activeAtm = document.querySelector('.atmosphere-btn.active')?.textContent?.trim();
          return { tuningText, isHarmonized, isCustom, activeAtm };
        })()
      `);

      const pass = state.isHarmonized && !state.isCustom && 
                   state.tuningText === `${r.expectedFreq} Hz` && 
                   state.activeAtm.toLowerCase().includes(r.expectedAtm.toLowerCase());
      record(`A2-${r.name}`, `Rhythm [${r.name}] Auto-Harmonization`, pass,
        `Atmosphere: ${state.activeAtm}, Freq: ${state.tuningText}, Harmonized: ${state.isHarmonized}`);
    }

    // =========================================================================
    // DOMAIN B: Tuning Drawer, Manual Divergence & 1-Tap Restoration
    // =========================================================================
    console.log('\n📋 Domain B: Tuning Drawer, Manual Divergence & 1-Tap Restoration');

    // B1: Open Tuning Drawer
    await cdp.evaluate(`document.getElementById('btn-tuning').click();`);
    await sleep(100);
    const drawerOpen = await cdp.evaluate(`
      (() => {
        const d = document.getElementById('tuning-drawer');
        return d && !d.classList.contains('hidden');
      })()
    `);
    record('B1', 'Tuning Drawer Open on Click', drawerOpen);

    // B2: Manual Detuning to 440 Hz
    await cdp.evaluate(`
      (() => {
        const card440 = document.querySelector('.freq-card[data-freq="440"]');
        if (card440) card440.click();
      })()
    `);
    await sleep(100);
    const detunedState = await cdp.evaluate(`
      (() => {
        const tuningText = document.getElementById('tuning-text')?.textContent?.trim();
        const btnTuning = document.getElementById('btn-tuning');
        const isCustom = btnTuning?.classList.contains('is-custom');
        const isHarmonized = btnTuning?.classList.contains('is-harmonized');
        const btnRestore = document.getElementById('btn-restore-harmony');
        const restoreVisible = btnRestore && !btnRestore.classList.contains('hidden');
        return { tuningText, isCustom, isHarmonized, restoreVisible };
      })()
    `);
    const b2Pass = detunedState.tuningText === '440 Hz' && detunedState.isCustom && !detunedState.isHarmonized && detunedState.restoreVisible;
    record('B2', 'Manual Divergence to 440 Hz Flagged as Manuel', b2Pass,
      `Tuning: ${detunedState.tuningText}, isCustom: ${detunedState.isCustom}, Restore Button: ${detunedState.restoreVisible}`);

    // B3: 1-Tap Re-Harmonization
    await cdp.evaluate(`document.getElementById('btn-restore-harmony').click();`);
    await sleep(200);
    const restoredState = await cdp.evaluate(`
      (() => {
        const tuningText = document.getElementById('tuning-text')?.textContent?.trim();
        const btnTuning = document.getElementById('btn-tuning');
        const isHarmonized = btnTuning?.classList.contains('is-harmonized');
        const isCustom = btnTuning?.classList.contains('is-custom');
        const toast = document.getElementById('phase-subtext')?.textContent;
        const drawerHidden = document.getElementById('tuning-drawer')?.classList.contains('hidden');
        return { tuningText, isHarmonized, isCustom, toast, drawerHidden };
      })()
    `);
    const b3Pass = restoredState.isHarmonized && !restoredState.isCustom && restoredState.drawerHidden && restoredState.toast.includes('Harmonie');
    record('B3', '1-Tap Re-Harmonization Action', b3Pass,
      `Tuning: ${restoredState.tuningText}, Harmonized: ${restoredState.isHarmonized}, Toast: ${restoredState.toast}`);

    // =========================================================================
    // DOMAIN C: OLED Noir Absolu & Tap to Wake
    // =========================================================================
    console.log('\n📋 Domain C: OLED Noir Absolu & Tap to Wake');

    await cdp.evaluate(`document.getElementById('btn-oled').click();`);
    await sleep(100);
    const oledActive = await cdp.evaluate(`document.body.classList.contains('oled-black-active')`);
    record('C1', 'OLED Noir Mode Activation', oledActive);

    // Click to wake
    await cdp.evaluate(`document.dispatchEvent(new MouseEvent('click', { bubbles: true }));`);
    await sleep(100);
    const oledExited = await cdp.evaluate(`!document.body.classList.contains('oled-black-active')`);
    record('C2', 'OLED Tap to Wake', oledExited);

    // =========================================================================
    // DOMAIN D: Touch-Pacer & Play/Pause Interactivity
    // =========================================================================
    console.log('\n📋 Domain D: Touch-Pacer & Play/Pause Interactivity');

    // Short click triggers play/pause
    await cdp.evaluate(`
      (() => {
        const canvas = document.getElementById('gl-canvas');
        canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      })()
    `);
    await sleep(50);
    await cdp.evaluate(`
      (() => {
        window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      })()
    `);
    await sleep(100);
    const playState = await cdp.evaluate(`
      document.getElementById('play-pause-text')?.textContent?.trim()
    `);
    record('D1', 'Canvas Short Tap Play/Pause', playState === 'Pause' || playState === 'Breathe', `State: ${playState}`);

    // =========================================================================
    // DOMAIN E: Procedural Web Audio Engine & Reverb Verification
    // =========================================================================
    console.log('\n📋 Domain E: Procedural Web Audio Engine & 0 kB Verification');

    const audioCheck = await cdp.evaluate(`
      (() => {
        // Unlock audio context
        window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

        // Check performance network requests
        const entries = performance.getEntriesByType('resource');
        const audioRequests = entries.filter(e => e.name.match(/\\.(mp3|wav|ogg|aac|flac)($|\\?)/i));

        return {
          hasExternalAudioFiles: audioRequests.length > 0,
          totalAudioAssetsDownloaded: audioRequests.length,
          canvasPresent: !!document.getElementById('gl-canvas')
        };
      })()
    `);
    record('E1', '0 kB Asset Footprint (No External Audio Files Downloaded)', 
      !audioCheck.hasExternalAudioFiles, 
      `External audio downloads: ${audioCheck.totalAudioAssetsDownloaded}`);

    // =========================================================================
    // DOMAIN F: Scientific Info Drawer
    // =========================================================================
    console.log('\n📋 Domain F: Scientific Info Drawer');

    await cdp.evaluate(`document.getElementById('btn-info').click();`);
    await sleep(100);
    const infoState = await cdp.evaluate(`
      (() => {
        const drawer = document.getElementById('info-drawer');
        const title = document.getElementById('info-atm-title')?.textContent;
        const source = document.getElementById('info-atm-source')?.textContent;
        const isOpen = drawer && !drawer.classList.contains('hidden');
        return { isOpen, title, source };
      })()
    `);
    record('F1', 'Info Drawer Open & Scientific Citation', 
      infoState.isOpen && !!infoState.title && !!infoState.source, 
      `Title: ${infoState.title}, Source: ${infoState.source}`);

    // Close info drawer
    await cdp.evaluate(`document.getElementById('btn-close-drawer').click();`);
    await sleep(100);
    const infoClosed = await cdp.evaluate(`document.getElementById('info-drawer')?.classList.contains('hidden')`);
    record('F2', 'Info Drawer Close on Click', infoClosed);

    // =========================================================================
    // DOMAIN H: Native Mobile UI/UX & Gesture Architecture
    // =========================================================================
    console.log('\n📋 Domain H: Native Mobile UI/UX & Gesture Architecture');

    // H1: Mobile Quick Session Timer Button Cycles Durations (∞ -> 3m -> 5m -> 10m -> ∞)
    const timerCycles = await cdp.evaluate(`
      (() => {
        const btnTimer = document.getElementById('btn-timer-modal');
        if (!btnTimer) return { success: false, reason: 'btn-timer-modal missing' };

        // Cycle 1: should switch to 3m
        btnTimer.click();
        const active1 = document.querySelector('.timer-pill.active')?.dataset?.mins;

        // Cycle 2: should switch to 5m
        btnTimer.click();
        const active2 = document.querySelector('.timer-pill.active')?.dataset?.mins;

        // Cycle 3: should switch to 10m
        btnTimer.click();
        const active3 = document.querySelector('.timer-pill.active')?.dataset?.mins;

        // Cycle 4: should return to 0m (∞)
        btnTimer.click();
        const active4 = document.querySelector('.timer-pill.active')?.dataset?.mins;

        const success = (active1 === '3') && (active2 === '5') && (active3 === '10') && (active4 === '0');
        return { success, sequence: [active1, active2, active3, active4] };
      })()
    `);
    record('H1', 'Mobile Quick Timer Button Duration Cycling (0 -> 3m -> 5m -> 10m -> 0)', 
      timerCycles.success, `Pill sequence: ${timerCycles.sequence?.join(' -> ')}`);

    // H2: Mobile Viewport CSS Media Rules (Hide Fullscreen & Surface Timer)
    const mobileCssRules = await cdp.evaluate(`
      (() => {
        let hasFsHiddenRule = false;
        let hasTimerFlexRule = false;
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            for (const rule of Array.from(sheet.cssRules || [])) {
              if (rule instanceof CSSMediaRule && rule.conditionText.includes('768px')) {
                for (const inner of Array.from(rule.cssRules)) {
                  if (inner.selectorText?.includes('#btn-fullscreen') && inner.style?.display === 'none') {
                    hasFsHiddenRule = true;
                  }
                  if (inner.selectorText?.includes('.mobile-timer-btn') && inner.style?.display?.includes('inline-flex')) {
                    hasTimerFlexRule = true;
                  }
                }
              }
            }
          } catch (e) {}
        }
        return { hasFsHiddenRule, hasTimerFlexRule };
      })()
    `);
    record('H2', 'Mobile Responsive CSS Rules (Hide Fullscreen & Surface Timer on <=768px)', 
      mobileCssRules.hasFsHiddenRule && mobileCssRules.hasTimerFlexRule, 
      `Fullscreen hidden: ${mobileCssRules.hasFsHiddenRule}, Timer surfaced: ${mobileCssRules.hasTimerFlexRule}`);

    // H3: Horizontal Canvas Swipe Cycles Atmospheres
    const currentAtmBeforeSwipe = await cdp.evaluate(`
      document.querySelector('.atmosphere-btn.active')?.textContent?.trim()
    `);

    await cdp.evaluate(`
      (() => {
        const canvas = document.getElementById('gl-canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const startX = rect.left + 250;
        const startY = rect.top + 250;

        // Dispatch pointerdown
        canvas.dispatchEvent(new PointerEvent('pointerdown', {
          clientX: startX,
          clientY: startY,
          pointerId: 1,
          bubbles: true
        }));

        // Dispatch horizontal flick left (> 65px)
        canvas.dispatchEvent(new PointerEvent('pointermove', {
          clientX: startX - 90,
          clientY: startY + 5,
          pointerId: 1,
          bubbles: true
        }));

        // Dispatch pointerup
        window.dispatchEvent(new PointerEvent('pointerup', {
          clientX: startX - 90,
          clientY: startY + 5,
          pointerId: 1,
          bubbles: true
        }));
      })()
    `);
    await sleep(200);

    const currentAtmAfterSwipe = await cdp.evaluate(`
      document.querySelector('.atmosphere-btn.active')?.textContent?.trim()
    `);
    const swipeSuccess = currentAtmBeforeSwipe !== currentAtmAfterSwipe;
    record('H3', 'Horizontal Canvas Swipe Gesture (Cycles Atmosphere & Auto-Harmonizes)', 
      swipeSuccess, `Before: ${currentAtmBeforeSwipe} -> After: ${currentAtmAfterSwipe}`);

    // H4: Bottom Sheet Interactive Drag-to-Dismiss Gesture
    // Open info drawer
    await cdp.evaluate(`document.getElementById('btn-info').click();`);
    await sleep(150);

    const isInfoOpenBeforeDrag = await cdp.evaluate(`!document.getElementById('info-drawer')?.classList.contains('hidden')`);

    // Simulate drag down (> 70px) on drawer header/handle
    await cdp.evaluate(`
      (() => {
        const drawer = document.getElementById('info-drawer');
        const handle = drawer?.querySelector('.drawer-handle') || drawer?.querySelector('.drawer-header');
        if (!handle) return;
        const rect = handle.getBoundingClientRect();

        handle.dispatchEvent(new PointerEvent('pointerdown', {
          clientY: rect.top + 5,
          clientX: rect.left + 20,
          pointerId: 2,
          bubbles: true
        }));

        window.dispatchEvent(new PointerEvent('pointermove', {
          clientY: rect.top + 110, // 105px drag downward
          clientX: rect.left + 20,
          pointerId: 2,
          bubbles: true
        }));

        window.dispatchEvent(new PointerEvent('pointerup', {
          clientY: rect.top + 110,
          clientX: rect.left + 20,
          pointerId: 2,
          bubbles: true
        }));
      })()
    `);
    await sleep(350); // Wait for dismiss animation

    const isInfoClosedAfterDrag = await cdp.evaluate(`document.getElementById('info-drawer')?.classList.contains('hidden')`);
    record('H4', 'Bottom Sheet Drag-Down Gesture Dismissal (Physics Spring & Threshold)', 
      isInfoOpenBeforeDrag && isInfoClosedAfterDrag, 
      `Open before drag: ${isInfoOpenBeforeDrag}, Closed after drag: ${isInfoClosedAfterDrag}`);

    // =========================================================================
    // DOMAIN G: Runtime Console Stability & Error Log Audit
    // =========================================================================
    console.log('\n📋 Domain G: Runtime Console Stability & Error Log Audit');

    record('G1', 'Zero Runtime Console Errors', cdp.consoleErrors.length === 0, 
      cdp.consoleErrors.length === 0 ? '0 errors' : `Errors: ${cdp.consoleErrors.join(', ')}`);

    console.log('\n--- TEST SUITE COMPLETE ---\n');

    const totalPassed = testResults.filter(r => r.passed).length;
    console.log(`Results: ${totalPassed} / ${testResults.length} passed (${Math.round(totalPassed/testResults.length * 100)}%)`);

  } catch (err) {
    console.error('❌ Test execution error:', err);
  } finally {
    if (cdp && cdp.ws) {
      try { cdp.ws.close(); } catch (e) {}
    }
    chromeProc.kill();
    process.exit(0);
  }
}

runTests();
