<div align="center">

# CHROMASYNC
### The Chromatic Breathing Sanctuary

[![Live Demo](https://img.shields.io/badge/Live%20Web-Sanctuary-705df2?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chromasync-app.web.app)
[![Download APK](https://img.shields.io/badge/Direct%20Download-Android%20APK-38bdf8?style=for-the-badge&logo=android&logoColor=white)](https://github.com/Tsubz/chromasync/releases)
[![Zero Bloat](https://img.shields.io/badge/Code%20Footprint-~41%20KB%20gzip-10b981?style=for-the-badge)](https://chromasync-app.web.app)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A single-purpose, distraction-free breathing companion engineered for autonomic nervous system regulation.</b><br>
  <i>100% Algorithmic Synthesis • Zero External Audio Files • Zero Image Textures • Zero Trackers • Zero Subscriptions</i>
</p>

---

[**Launch Web Sanctuary (PWA)**](https://chromasync-app.web.app) • [**Download Android APK**](https://github.com/Tsubz/chromasync/releases) • [**Scientific Foundations**](#scientific-foundations) • [**Architecture**](#zero-bloat-architecture)

---

</div>

<br>

## 🌌 The Anti-Bloat Manifesto

In an era saturated with noisy AI wrappers, 500 MB wellness downloads, intrusive tracking telemetry, and mandatory monthly subscriptions, **Chromasync** was built on a radically different philosophy: **Radical Craftsmanship & Mathematical Purity**.

- 🚫 **Zero External Audio Files:** No `.mp3`, `.wav`, or `.ogg` downloads. Every oceanic wave swell, forest rain droplet, singing bowl strike, and binaural beat is generated dynamically in real time via the **Web Audio API**.
- 🚫 **Zero External Textures:** No background `.jpg` or `.png` images. Every living watercolor fluid field, caustic shimmer, and ember particle is computed on your GPU via **WebGL GLSL Shaders**.
- 🚫 **Zero Framework Bloat:** Crafted in pure, high-performance TypeScript with zero heavy UI frameworks (No React, Vue, or Angular bundle overhead).
- 🚫 **Zero Tracking or Accounts:** No sign-in wall, no analytics, no third-party requests (fonts are self-hosted). Runs 100% client-side, and offline after the first visit (PWA with a precached app shell).
- 📦 **~41 KB of Code (gzip):** JavaScript, CSS and HTML combined, in two languages. Self-hosted fonts add ~100 KB (woff2, latin subset), cached once.
- 🫁 **Your rhythm:** resonance pace adjustable from 4.5 to 7 breaths per minute, and an option to shorten breath holds for beginners (info drawer).
- 🔋 **Battery-aware:** rendering pauses in eyes-closed (OLED) mode and slows down while the session is paused.
- 🌍 **English & French:** The interface follows the device language and can be switched from the info drawer. Your last atmosphere, rhythm, duration and mute choice are remembered on the device.

---

## 🔬 Scientific Foundations

Chromasync combines paced breathing, generative visuals and sound. Each claim below links to a page with its references; the [health notice](#️-health-notice) applies throughout.

```
       ┌─────────────────────────────────────────────────────────┐
       │      Resonance breathing, 5.5 breaths/min (~0.1 Hz)     │
       │     (5.5s Inhalation  ───►  5.5s Exhalation)            │
       └───────────────────────────┬─────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Visual Shaders  │     │ Web Audio Engine │     │ Hardware Haptics │
│ Fractal visuals  │     │ 432/440/528 Hz   │     │ Tactile Pulses   │
│ (measured D≈1.4) │     │ Binaural beats   │     │  (Eyes-Closed)   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

> 📚 **Science pages:**
> - [Resonance Breathing (~0.1 Hz) & Heart Rate Variability](https://chromasync-app.web.app/science/baroreflex-resonance-0-10hz)
> - [The Vagus Nerve and the Long Exhale](https://chromasync-app.web.app/science/vagus-nerve-acetylcholine)
> - [Box Breathing (4-4-4-4): What It Does and What It Does Not](https://chromasync-app.web.app/science/box-breathing-autonomic-regulation)
> - [432 Hz vs 440 Hz: Physics, Myths and Studies](https://chromasync-app.web.app/science/432hz-vs-440hz-acoustic-physics)
> - [Binaural Beats: How They Work and What the Evidence Says](https://chromasync-app.web.app/science/binaural-beats-theta-entrainment)

### 1. Resonance breathing
The arterial baroreflex reacts with a delay of about 5 seconds, so it resonates near 0.1 Hz. Breathing close to that rate (4.5–7 breaths per minute, about 5.5 on average) makes the heart-rate swings of breathing and of the baroreflex reinforce each other, which maximises heart rate variability (Vaschillo et al., 2006; Lehrer & Gevirtz, 2014). Chromasync paces 5.5 s in / 5.5 s out. HRV biofeedback built on this breathing shows small-to-moderate benefits in a meta-analysis (Lehrer et al., 2020).

### 2. Long exhalation
The vagus nerve slows the heart mainly during exhalation (Eckberg, 2003). **4-7-8 Relax** and **Deep Unwind** lengthen the out-breath to lean on this effect. They are popular for winding down, but direct evidence for 4-7-8 is limited to small studies.

### 3. Fractal visuals (measured, not assumed)
Richard Taylor's research links natural fractals with a dimension of D ≈ 1.3–1.5 to easier visual processing and lower stress. Chromasync's shader parameters are calibrated so the rendered contours measure **D ≈ 1.37–1.42 by box-counting** in all five atmospheres, and the end-to-end test fails if any mode leaves that range. Before this calibration the visuals measured D ≈ 1.7.

### 4. Sound
The 432/528 Hz tunings and binaural beats are offered as preferences: the studies behind them are small pilots, and evidence that binaural beats entrain brainwaves is mixed (Ingendoh et al., 2023). Binaural beats need headphones; Chromasync keeps left and right strictly separated so they are real binaural beats.

---

## 🎨 The 5 Unified Atmospheres

| Atmosphere | Breathing Pattern | Tuning & Binaural Beat | Palette | Shader |
|:---|:---|:---|:---|:---|
| **🌌 Celestial Aurora** | **Resonance** (5.5s In / 5.5s Out) | 432 Hz · 5.5 Hz | Peach / gold | Domain-warped fBm fluid |
| **🌊 Oceanic Tide** | **Box** (4s In / 4s Hold / 4s Out / 4s Hold) | 528 Hz · 10 Hz | Cyan / sapphire | Liquid caustics |
| **🌧️ Forest Rain** | **Deep Unwind** (4s In / 2s Hold / 6s Out) | 432 Hz · 5.5 Hz | Canopy green | Rain ripple rings |
| **🕯️ Warm Hearth** | **4-7-8 Relax** (4s In / 7s Hold / 8s Out) | 432 Hz · 4 Hz | Amber, <1% of a white screen's blue light | Rising embers |
| **✨ Astral Void** | **Physiological Sigh** (3s In / 1.2s Top-up / 6s Out) | 528 Hz · 5.5 Hz | Violet / indigo | Nebula & star glints |

---

## ⌨️ Ambient Controls & Keyboard Shortcuts

Chromasync is designed to get out of the way. All on-screen HUD controls fade into darkness automatically during your session:

| Key | Function | Key | Function |
|:---|:---|:---|:---|
| <kbd>Space</kbd> | Pause / Resume Breath Guide | <kbd>M</kbd> | Toggle Procedural Soundscapes |
| <kbd>1</kbd> - <kbd>6</kbd> | Switch Breathing Rhythm | <kbd>A</kbd> | Cycle Atmospheric Soundscape |
| <kbd>T</kbd> | Open Frequency Tuning Drawer | <kbd>O</kbd> | Toggle OLED Pure Black Mode |
| <kbd>I</kbd> | Open Scientific Foundations Drawer | <kbd>F</kbd> | Toggle Fullscreen Immersion |
| <kbd>R</kbd> | Record an 11s video reel | <kbd>Esc</kbd> | Close drawers / exit OLED mode |

On touch screens: tap to start or pause, hold to breathe at your own pace, swipe sideways to change atmosphere, double-tap for OLED black mode.

---

## 📱 Mobile App (Android & iOS)

Chromasync is packaged natively with **Capacitor 8**:

- **Direct Android APK:** Download the signed `.apk` directly from the [Releases](https://github.com/Tsubz/chromasync/releases) section.
- **Web App (PWA):** Open [chromasync-app.web.app](https://chromasync-app.web.app) in Safari (iOS) or Chrome (Android) and tap **"Add to Home Screen"** for a full offline app experience.
- **Google Play Store:** Production release pipeline configured.

---

## 🛠️ Local Development & Build

```bash
# Clone the repository
git clone https://github.com/Tsubz/chromasync.git
cd chromasync

# Install dependencies
npm install

# Start local development server
npm run dev

# Quality checks (also run in CI on every pull request)
npm run typecheck
npm test            # unit tests (Vitest)
npm run build       # production build in dist/
npm run test:e2e    # end-to-end smoke test on the build (Playwright + Chromium)

# Sync web assets to Capacitor native Android/iOS
npm run cap:sync
```

---

## ⚕️ Health Notice

Chromasync is a relaxation tool, not a medical device. It does not diagnose, treat or prevent any condition. The research cited above describes general effects observed in studies, not guaranteed outcomes. Stop if you feel dizzy, and ask a doctor before breath-holding exercises if you are pregnant or have a cardiac or respiratory condition.

---

## 📄 License & Attribution

Designed and engineered with an obsession for zero-bloat digital craftsmanship. Released under the [MIT License](LICENSE). [Privacy policy](https://chromasync-app.web.app/privacy): no data collected.
