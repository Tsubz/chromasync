# CHROMASYNC — THE MASTER SPECIFICATION (v1.0)
## Complete Functional, Mathematical, Technical, and Architectural Blueprint

> **Application Name:** Chromasync — The Chromatic Breathing Companion  
> **Bundle / Application ID:** `com.chromasync.app`  
> **Platform Targets:** Modern Web (PWA), Android (APK/AAB), iOS (Xcode/IPA)  
> **Design Philosophy:** Single-purpose, artful, zero external media files, zero bloat, pure algorithmic visual and audio synthesis (~18.5 KB gzipped production web footprint).

---

# Table of Contents
1. [Product Identity & Core Philosophy](#1-product-identity--core-philosophy)
2. [Scientific Foundations & Multi-Sensory Matrix](#2-scientific-foundations--multi-sensory-matrix)
3. [The 5 Unified Atmospheres (Data & Constants)](#3-the-5-unified-atmospheres-data--constants)
4. [Breathing Patterns & Physiological Guidance](#4-breathing-patterns--physiological-guidance)
5. [GPU Visual Shaders & Graphics Engine](#5-gpu-visual-shaders--graphics-engine)
6. [Web Audio Synthesis Engine (Exact DSP Math)](#6-web-audio-synthesis-engine-exact-dsp-math)
7. [Hardware Haptics & Screen Wake Lock Systems](#7-hardware-haptics--screen-wake-lock-systems)
8. [Session Timer & Harmonious Cycle-Complete Finishing](#8-session-timer--harmonious-cycle-complete-finishing)
9. [UI/UX Design System, CSS Tokens & Layout](#9-uiux-design-system-css-tokens--layout)
10. [Architecture, Modules & State Flow](#10-architecture-modules--state-flow)
11. [Native Mobile Packaging (Capacitor Android & iOS)](#11-native-mobile-packaging-capacitor-android--ios)
12. [Complete Verification, Build & Deployment Guide](#12-complete-verification-build--deployment-guide)

---

# 1. Product Identity & Core Philosophy

### 1.1 Purpose
*Chromasync* is an artful, distraction-free breathing companion designed to guide autonomic nervous system regulation through **multi-sensory resonance**:
- **Visuals:** Living watercolor fluid fields, caustics, and particle fields generated entirely via WebGL GLSL shaders with zero video or raster assets.
- **Audio:** 100% procedural synthetic soundscapes (nature sound generators, polyphonic chord drones, binaural beats, and physical modeling Tibetan singing bowl) generated in real time via Web Audio API.
- **Haptics:** Tactile pulses synced to breath phase transitions for eyes-closed use.
- **Autonomic Rebalancing:** Aligned with $0.10\text{ Hz}$ cardiorespiratory baroreflex resonance, $432\text{ Hz} / 528\text{ Hz}$ acoustic tuning, and $D \approx 1.4$ visual fractal fluency.

### 1.2 Zero-Bloat Mandate
* **Zero External Audio Files:** No `.mp3`, `.wav`, or `.ogg` files. Every tone, wave swell, rain droplet, and fire crackle is computed mathematically in real time.
* **Zero External Image Files:** No background `.jpg` or `.png` textures. All visuals are procedurally synthesized on the GPU.
* **Zero Heavy Frameworks:** Written in pure TypeScript with zero UI framework overhead (no React, no Vue, no Angular bundle weight).

---

# 2. Scientific Foundations & Multi-Sensory Matrix

### 2.1 Multi-Sensory Alignment Table

| Atmosphere | Target State | Respiration Pattern | Carrier & Binaural Beat | Dominant Wavelengths | Shader Neuroaesthetics |
|---|---|---|---|---|---|
| **🌌 Celestial Aurora** | Autonomic Balance | Coherence ($5.5\text{s}$ In / $5.5\text{s}$ Out) | $432\text{ Hz}$ Carrier · $5.5\text{ Hz}$ Theta | $590-640\text{ nm}$ (Peach/Gold) | $D=1.4$ fBm Domain Warping |
| **🌊 Oceanic Tide** | Cognitive Focus | Box ($4\text{s}$ In / $4\text{s}$ Hold / $4\text{s}$ Out / $4\text{s}$ Hold) | $528\text{ Hz}$ Carrier · $10.0\text{ Hz}$ Alpha | $470-510\text{ nm}$ (Cyan/Sapphire) | Liquid Voronoi Caustics |
| **🌧️ Forest Rain** | Stress Recovery | Coherence ($5.5\text{s}$ In / $5.5\text{s}$ Out) | $432\text{ Hz}$ Carrier · $5.5\text{ Hz}$ Theta | $520-550\text{ nm}$ (Canopy Green) | Dappled Rain Ripple Rings |
| **🕯️ Warm Hearth** | Pre-Sleep Calm | 4-7-8 Relax ($4\text{s}$ In / $7\text{s}$ Hold / $8\text{s}$ Out) | $432\text{ Hz}$ Carrier · $4.0\text{ Hz}$ Theta | $620-700\text{ nm}$ (Amber/Terracotta) | Rising Incandescent Embers |
| **✨ Astral Void** | Deep Meditation | Deep Unwind ($4\text{s}$ In / $2\text{s}$ Hold / $6\text{s}$ Out) | $528\text{ Hz}$ Carrier · $5.5\text{ Hz}$ Theta | $400-450\text{ nm}$ + $650\text{ nm}$ | Cosmic Nebula + Star Glints |

### 2.2 Core Physiological Principles
1. **0.10 Hz Baroreflex Resonance:** Inhaling for $5.5\text{s}$ and exhaling for $5.5\text{s}$ ($\sim 5.5 - 6.0\text{ breaths/min}$) matches the natural 10-second delay of the human baroreflex loop, maximizing Heart Rate Variability (HRV) and vagal stimulation (*Lehrer et al., 2020*).
2. **Vagal Tone Stimulation via Extended Exhalation:** Exhalation activates the parasympathetic vagus nerve, releasing acetylcholine onto the sinoatrial node to decelerate heart rate.
3. **Curvature vs. Angularity (Bar & Neta):** Sharp corners trigger amygdala fear/threat circuits; smooth organic curves selectively engage the orbitofrontal cortex (safety & aesthetic pleasure).
4. **Fractal Fluency (Richard Taylor):** Statistical natural fractals with fractal dimension $D \in [1.3, 1.5]$ reduce physiological stress by up to $60\%$ and elevate frontal EEG Alpha waves.

---

# 3. The 5 Unified Atmospheres (Data & Constants)

### 3.1 Type Definitions
```typescript
export type AtmosphereId = 'aurora' | 'ocean' | 'rain' | 'hearth' | 'astral';

export interface RGBColor {
  r: number; // 0.0 .. 1.0
  g: number; // 0.0 .. 1.0
  b: number; // 0.0 .. 1.0
}

export interface Atmosphere {
  id: AtmosphereId;
  name: string;
  tagline: string;
  icon: string;
  shaderMode: number; // 0: Aurora, 1: Ocean, 2: Rain, 3: Hearth, 4: Astral
  swatchGradient: string;
  bgBase: RGBColor;
  inhaleGlow: RGBColor;
  holdLuster: RGBColor;
  exhaleCool: RGBColor;
  accent: RGBColor;
  recommendedTuning: 432 | 440 | 528;
  recommendedBinauralBeat: number; // in Hz
  binauralLabel: string;
  recommendedPatternId: string;
  scientificTarget: string;
}
```

### 3.2 Exact Constants Data Array
```typescript
export const ATMOSPHERES: Atmosphere[] = [
  {
    id: 'aurora',
    name: 'Celestial Aurora',
    tagline: 'Fluid watercolor bleeds & light bloom',
    icon: '🌌',
    shaderMode: 0,
    swatchGradient: 'linear-gradient(135deg, #ff9a8b 0%, #ff6a88 50%, #ff99ac 100%)',
    bgBase: { r: 0.07, g: 0.04, b: 0.09 },
    inhaleGlow: { r: 1.0, g: 0.62, b: 0.45 },
    holdLuster: { r: 1.0, g: 0.88, b: 0.65 },
    exhaleCool: { r: 0.45, g: 0.25, b: 0.58 },
    accent: { r: 0.98, g: 0.42, b: 0.52 },
    recommendedTuning: 432,
    recommendedBinauralBeat: 5.5,
    binauralLabel: 'Theta 5.5Hz',
    recommendedPatternId: 'coherence_55',
    scientificTarget: 'Autonomic balance & vagal tone'
  },
  {
    id: 'ocean',
    name: 'Oceanic Tide',
    tagline: 'Liquid caustics & tidal surges',
    icon: '🌊',
    shaderMode: 1,
    swatchGradient: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    bgBase: { r: 0.02, g: 0.05, b: 0.12 },
    inhaleGlow: { r: 0.12, g: 0.85, b: 0.95 },
    holdLuster: { r: 0.58, g: 0.96, b: 1.0 },
    exhaleCool: { r: 0.06, g: 0.16, b: 0.45 },
    accent: { r: 0.32, g: 0.42, b: 0.92 },
    recommendedTuning: 528,
    recommendedBinauralBeat: 10.0,
    binauralLabel: 'Alpha 10Hz Focus',
    recommendedPatternId: 'box_4444',
    scientificTarget: 'Cognitive focus & mental clarity'
  },
  {
    id: 'rain',
    name: 'Forest Rain',
    tagline: 'Dappled canopy & water ripples',
    icon: '🌧️',
    shaderMode: 2,
    swatchGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    bgBase: { r: 0.03, g: 0.07, b: 0.06 },
    inhaleGlow: { r: 0.42, g: 0.90, b: 0.65 },
    holdLuster: { r: 0.86, g: 0.98, b: 0.72 },
    exhaleCool: { r: 0.10, g: 0.32, b: 0.26 },
    accent: { r: 0.22, g: 0.72, b: 0.65 },
    recommendedTuning: 432,
    recommendedBinauralBeat: 5.5,
    binauralLabel: 'Theta 5.5Hz',
    recommendedPatternId: 'coherence_55',
    scientificTarget: 'Biophilic mental fatigue relief'
  },
  {
    id: 'hearth',
    name: 'Warm Hearth',
    tagline: 'Charcoal void & dancing embers',
    icon: '🕯️',
    shaderMode: 3,
    swatchGradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    bgBase: { r: 0.09, g: 0.05, b: 0.03 },
    inhaleGlow: { r: 0.98, g: 0.72, b: 0.25 },
    holdLuster: { r: 1.0, g: 0.90, b: 0.62 },
    exhaleCool: { r: 0.58, g: 0.28, b: 0.18 },
    accent: { r: 0.92, g: 0.48, b: 0.22 },
    recommendedTuning: 432,
    recommendedBinauralBeat: 4.0,
    binauralLabel: 'Theta 4Hz Sleep',
    recommendedPatternId: 'relax_478',
    scientificTarget: 'Pre-sleep parasympathetic calm'
  },
  {
    id: 'astral',
    name: 'Astral Void',
    tagline: 'Cosmic nebula & twinkling stardust',
    icon: '✨',
    shaderMode: 4,
    swatchGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    bgBase: { r: 0.05, g: 0.04, b: 0.10 },
    inhaleGlow: { r: 0.82, g: 0.62, b: 0.96 },
    holdLuster: { r: 0.96, g: 0.85, b: 1.0 },
    exhaleCool: { r: 0.30, g: 0.22, b: 0.52 },
    accent: { r: 0.62, g: 0.75, b: 0.96 },
    recommendedTuning: 528,
    recommendedBinauralBeat: 5.5,
    binauralLabel: 'Theta 5.5Hz',
    recommendedPatternId: 'sleep_426',
    scientificTarget: 'Deep meditative transcendence'
  }
];
```

---

# 4. Breathing Patterns & Physiological Guidance

### 4.1 Type Definitions
```typescript
export type BreathPhaseType = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

export interface BreathPhase {
  type: BreathPhaseType;
  duration: number; // in seconds
  label: string;
  subtext: string;
  targetScale: number; // 0.0 to 1.0
}

export interface BreathingPattern {
  id: string;
  name: string;
  tagline: string;
  phases: BreathPhase[];
  totalCycleDuration: number;
}
```

### 4.2 Exact Breathing Pattern Presets
```typescript
export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'sigh_huberman',
    name: 'Soupir Physiologique',
    tagline: 'Chute immédiate du cortisol et du rythme cardiaque (Stanford 2023)',
    totalCycleDuration: 10.2,
    phases: [
      {
        type: 'inhale',
        duration: 3.0,
        label: 'Inspiration (Nez)',
        subtext: 'Première inspiration profonde par le nez',
        targetScale: 0.78
      },
      {
        type: 'hold-in',
        duration: 1.2,
        label: 'Complément (Nez)',
        subtext: 'Seconde micro-inspiration d\'appoint pour déplisser les alvéoles',
        targetScale: 1.00
      },
      {
        type: 'exhale',
        duration: 6.0,
        label: 'Expiration (Bouche)',
        subtext: 'Long et doux soupir libérateur par la bouche',
        targetScale: 0.00
      }
    ]
  },
  {
    id: 'coherence_55',
    name: 'Coherence 5.5s',
    tagline: 'Heart Rate Variability (HRV) sync & nervous system balance',
    totalCycleDuration: 11.0,
    phases: [
      {
        type: 'inhale',
        duration: 5.5,
        label: 'Inhale',
        subtext: 'Breathe in slowly through your nose',
        targetScale: 1.0
      },
      {
        type: 'exhale',
        duration: 5.5,
        label: 'Exhale',
        subtext: 'Release gently through mouth or nose',
        targetScale: 0.0
      }
    ]
  },
  {
    id: 'box_4444',
    name: 'Box 4-4-4-4',
    tagline: 'Tactical calm, focus & acute stress regulation',
    totalCycleDuration: 16.0,
    phases: [
      {
        type: 'inhale',
        duration: 4.0,
        label: 'Inhale',
        subtext: 'Draw air in deeply through your nose',
        targetScale: 1.0
      },
      {
        type: 'hold-in',
        duration: 4.0,
        label: 'Hold',
        subtext: 'Retain the breath with soft throat',
        targetScale: 1.0
      },
      {
        type: 'exhale',
        duration: 4.0,
        label: 'Exhale',
        subtext: 'Smoothly release through your mouth',
        targetScale: 0.0
      },
      {
        type: 'hold-out',
        duration: 4.0,
        label: 'Rest',
        subtext: 'Rest in the stillness before the next breath',
        targetScale: 0.0
      }
    ]
  },
  {
    id: 'relax_478',
    name: '4-7-8 Relax',
    tagline: 'Deep vagal tone stimulation, anxiety relief & sleep onset',
    totalCycleDuration: 19.0,
    phases: [
      {
        type: 'inhale',
        duration: 4.0,
        label: 'Inhale',
        subtext: 'Inhale quietly through your nose',
        targetScale: 1.0
      },
      {
        type: 'hold-in',
        duration: 7.0,
        label: 'Hold',
        subtext: 'Gently retain breath & steady your mind',
        targetScale: 1.0
      },
      {
        type: 'exhale',
        duration: 8.0,
        label: 'Exhale',
        subtext: 'Whoosh out completely through your mouth',
        targetScale: 0.0
      }
    ]
  },
  {
    id: 'sleep_426',
    name: 'Deep Unwind',
    tagline: 'Extended exhalation parasympathetic reset',
    totalCycleDuration: 12.0,
    phases: [
      {
        type: 'inhale',
        duration: 4.0,
        label: 'Inhale',
        subtext: 'Gentle inhale through your nose',
        targetScale: 1.0
      },
      {
        type: 'hold-in',
        duration: 2.0,
        label: 'Hold',
        subtext: 'Brief pause in fullness',
        targetScale: 1.0
      },
      {
        type: 'exhale',
        duration: 6.0,
        label: 'Exhale',
        subtext: 'Slow soothing exhale through mouth',
        targetScale: 0.0
      }
    ]
  },
  {
    id: 'free_flow',
    name: 'Souffle Libre (Tactile Free Flow)',
    tagline: 'Interoceptive Autonomic Self-Regulation & Tactile Biofeedback',
    totalCycleDuration: 0.0, // Open-ended
    phases: [
      {
        type: 'inhale',
        duration: 4.5,
        label: 'Inspiration Libre',
        subtext: 'Maintenez le doigt posé pour déployer le souffle',
        targetScale: 1.0
      },
      {
        type: 'exhale',
        duration: 5.5,
        label: 'Expiration Libre',
        subtext: 'Relâchez pour laisser l\'air s\'échapper paisiblement',
        targetScale: 0.0
      }
    ]
  }
];
```

### 4.3 Organic Sinusoidal Easing Curve
```typescript
export function calculateBreathScale(phaseProgress: number, fromScale: number, toScale: number): number {
  const ease = (1.0 - Math.cos(Math.PI * phaseProgress)) / 2.0;
  return fromScale + (toScale - fromScale) * ease;
}
```

---

# 5. GPU Visual Shaders & Graphics Engine

### 5.1 Vertex Shader (`src/graphics/shaders/vertex.glsl`)
```glsl
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

### 5.2 Multi-Mode Fragment Shader (`src/graphics/shaders/fragment.glsl`)
```glsl
#ifdef GL_ES
precision highp float;
#endif

varying vec2 v_uv;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_breathScale;     // 0.0 (empty lungs) to 1.0 (full lungs)
uniform float u_phaseProgress;   // 0.0 to 1.0 within current phase
uniform int u_phaseType;         // 0: inhale, 1: hold-in, 2: exhale, 3: hold-out
uniform int u_atmosphereMode;    // 0: Aurora, 1: Ocean, 2: Rain, 3: Hearth, 4: Astral

// Active Color Palette Uniforms
uniform vec3 u_bgBase;
uniform vec3 u_inhaleGlow;
uniform vec3 u_holdLuster;
uniform vec3 u_exhaleCool;
uniform vec3 u_accent;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i + vec2(0.0, 0.0));
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.05 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

float caustics(vec2 uv, float t) {
  vec2 p = uv * 4.0;
  float c = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 shift = vec2(sin(t * 0.4 + fi * 1.5), cos(t * 0.3 + fi * 2.1)) * 0.4;
    c += sin(p.x * 2.0 + shift.x * 3.0 + t) * cos(p.y * 2.0 + shift.y * 3.0 + t * 0.8);
    p *= 1.4;
  }
  return clamp(pow(abs(c) * 0.4, 1.8), 0.0, 1.0);
}

float rainRipples(vec2 uv, float t) {
  float ripples = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 center = vec2(hash(vec2(fi, 1.23)), hash(vec2(fi, 4.56))) * 0.8 + 0.1;
    float dist = length(uv - center);
    float ringPhase = fract(t * 0.35 + fi * 0.25);
    float ringRadius = ringPhase * 0.45;
    float ring = smoothstep(0.02, 0.0, abs(dist - ringRadius)) * (1.0 - ringPhase);
    ripples += ring * 0.35;
  }
  return ripples;
}

float embers(vec2 uv, float t) {
  float e = 0.0;
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    float speed = 0.12 + hash(vec2(fi, 9.87)) * 0.18;
    float xOffset = hash(vec2(fi, 2.34)) * 1.2 - 0.1 + sin(t * 0.8 + fi) * 0.04;
    float yPos = fract(1.0 - (t * speed + hash(vec2(fi, 5.67))));
    vec2 emberPos = vec2(xOffset, yPos);
    float d = length(uv - emberPos);
    float intensity = smoothstep(0.035, 0.0, d) * (0.4 + 0.6 * sin(t * 4.0 + fi * 3.0));
    e += intensity;
  }
  return e;
}

float starGlints(vec2 uv, float t) {
  float stars = 0.0;
  for (int i = 0; i < 20; i++) {
    float fi = float(i);
    vec2 starPos = vec2(hash(vec2(fi, 7.89)), hash(vec2(fi, 3.21)));
    float d = length(uv - starPos);
    float twinkle = 0.5 + 0.5 * sin(t * 2.5 + hash(vec2(fi, 1.11)) * 6.28);
    stars += smoothstep(0.015, 0.0, d) * twinkle * 0.6;
  }
  return stars;
}

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;
  float dist = length(p);

  float t = u_time * 0.22;
  float expansion = 0.35 + 0.65 * u_breathScale;

  vec2 q = vec2(
    fbm(p * 2.2 + vec2(t * 0.3, -t * 0.2)),
    fbm(p * 2.2 + vec2(-t * 0.2, t * 0.35))
  );

  vec2 r = vec2(
    fbm(p * 2.8 + 3.0 * q + vec2(1.7, 9.2) + t * 0.15),
    fbm(p * 2.8 + 3.0 * q + vec2(8.3, 2.8) - t * 0.12)
  );

  float f = fbm(p * 2.4 + 3.5 * r);

  float aura = smoothstep(0.72 * expansion, 0.05, dist);
  float internalFlow = smoothstep(0.2, 0.8, f) * aura;

  vec3 col = u_bgBase;

  if (u_atmosphereMode == 0) {
    vec3 bleed1 = mix(u_bgBase, u_inhaleGlow, smoothstep(0.0, 0.85, aura * u_breathScale));
    vec3 bleed2 = mix(bleed1, u_holdLuster, smoothstep(0.3, 0.9, internalFlow));
    vec3 bleed3 = mix(bleed2, u_exhaleCool, smoothstep(0.6, 0.1, dist * (1.2 - u_breathScale * 0.4)));
    col = mix(bleed3, u_accent, internalFlow * 0.35 * u_breathScale);
  } else if (u_atmosphereMode == 1) {
    float c = caustics(uv, u_time);
    vec3 oceanDeep = mix(u_bgBase, u_exhaleCool, dist * 1.2);
    vec3 oceanSurface = mix(oceanDeep, u_inhaleGlow, aura * u_breathScale);
    col = mix(oceanSurface, u_holdLuster, c * (0.3 + 0.5 * u_breathScale));
  } else if (u_atmosphereMode == 2) {
    float ripples = rainRipples(uv, u_time);
    vec3 canopy = mix(u_bgBase, u_inhaleGlow, aura * (0.4 + 0.6 * u_breathScale));
    col = mix(canopy, u_holdLuster, ripples);
  } else if (u_atmosphereMode == 3) {
    float e = embers(uv, u_time);
    vec3 emberGlow = mix(u_bgBase, u_inhaleGlow, aura * (0.2 + 0.8 * u_breathScale));
    col = mix(emberGlow, u_holdLuster, e);
  } else if (u_atmosphereMode == 4) {
    float stars = starGlints(uv, u_time);
    vec3 nebula = mix(u_bgBase, u_inhaleGlow, internalFlow * (0.3 + 0.7 * u_breathScale));
    col = mix(nebula, vec3(1.0), stars);
  }

  float vignette = smoothstep(1.3, 0.45, dist);
  col *= vignette;

  gl_FragColor = vec4(col, 1.0);
}
```

---

# 6. Web Audio Synthesis Engine (Exact DSP Math)

### 6.1 `SynthChord`: 5-Voice Polyphonic Ethereal Drone
* **Chord Multipliers (Major 9th / Sus2 stack):**
  $$r = [0.25, 0.375, 0.50, 0.5625, 0.625]$$
* **Binaural Detuning:**
  $$f_{\text{left}} = (f_0 \cdot r_i) - \frac{\Delta f}{2},\quad f_{\text{right}} = (f_0 \cdot r_i) + \frac{\Delta f}{2}$$
* **Low-Pass Filter Modulation:**
  $$\text{Cutoff Frequency} = 180\text{ Hz} + 1300 \times (\text{breathScale})^{1.4},\quad Q = 1.8$$
* **Brownian Analog Pitch Drift:**
  $$f_{\text{drift}, i}(t) = 0.12 \times \sin(0.07t + i \cdot 1.618)\text{ Hz}$$
  Golden-ratio phase offsets prevent synchronous beating and simulate the living warmth of acoustic acoustic ensemble playing.

### 6.2 `AtmosphereSounds`: Physical Modeling Soundscapes
* **Oceanic Tide (`ocean`):**
  - **Groundswell:** Sub-bass resonant filter ($55-150\text{ Hz}, Q=3.2$) sweeping with breath scale to model tidal water mass.
  - **Wave-breaker:** Bandpass filtered pink noise ($220-970\text{ Hz}, Q=1.4$) simulating turbulent crest collapse.
  - **Minnaert Foam Bubbles:** Stochastic decaying chirps during wave recession:
    $$f = \frac{3000}{r\text{ (mm)}}\text{ Hz},\quad r \in [1.2, 3.4]\text{ mm},\quad \tau \approx 30\text{ms}$$
* **Forest Rain (`rain`):**
  - **Canopy Moisture Bed:** Stereo Voss-McCartney $1/f$ pink noise with $1400\text{ Hz}$ bandpass filtering.
  - **Poisson Leaf Droplets:** Dual-mode randomized droplet generator:
    - Leaf plops: $520-900\text{ Hz}$ ($\tau \approx 55\text{ms}$).
    - Mist pings: $1800-3200\text{ Hz}$ ($\tau \approx 35\text{ms}$).
    - Droplet chirp: $f(t) = f_0 \cdot (1 + 0.35 e^{-t/0.008})$.
* **Warm Hearth (`hearth`):**
  - **Thermal Convection:** Low $110\text{ Hz}$ muffle drone.
  - **Wood Steam Sizzle:** High-frequency bandpass ($4.2\text{ kHz}, Q=1.8$) modulated by breath oxygenation.
  - **Wood Fissure Snaps:** Poisson impulse micro-explosions ($<0.4\text{ms}$ attack) exciting resonant wood acoustic cavities ($1.2-3.2\text{ kHz}$).
* **Astral Void (`astral`):**
  - **Quartz Crystal Singing Bowl Modal Synthesis:**
    $$\text{Modes: } [1.00 f_0, 2.76 f_0, 5.40 f_0]$$
  - Quadrature friction LFO ($0.08\text{ Hz}$) modeling rotating mallet contact.

### 6.3 `ProceduralReverb`: 0 kB Algorithmic Impulse Response Synthesis
* **Impulse Response Formula:**
  $$\text{IR}_L(t) = \left[\text{Filter}_L(\text{noise}_L(t)) + \text{EarlyRef}_L(t)\right] \cdot e^{-2.8 t}$$
  $$\text{IR}_R(t) = \left[\text{Filter}_R(\text{noise}_R(t)) + \text{EarlyRef}_R(t)\right] \cdot e^{-2.8 t}$$
* **Rayleigh Air Absorption Damping:**
  $$\alpha(t) = \max\left(0.08,\, 0.92 - 0.75 \frac{t}{T}\right)$$
  Smooths high frequencies over the $2.5\text{s}$ reverberation tail, preventing digital sibilance and creating silky, warm acoustic space.

### 6.4 `TibetanBowl`: Inharmonic Modal Synthesis
$$\text{Partials: } f = f_0 \times [1.00, 2.76, 5.40, 8.93, 13.34]$$
$$\text{Decay Times: } \tau = [7.0\text{s}, 5.2\text{s}, 3.8\text{s}, 2.4\text{s}, 1.6\text{s}]$$
$$\text{Gains: } A = [0.85, 0.42, 0.24, 0.12, 0.06]$$

### 6.5 3D Spatial Audio & Rebalanced Sound Mix
* **Master Drone Gain:** Calibrated to $0.38$ so physical nature generators take center stage.
* **Dynamic Stereo Elevation:** Web Audio `StereoPannerNode` modulation on all 5 voices:
  $$\text{panSpread} = 0.50 + 0.42 \times \text{breathScale}$$
  - Inhale expands the sound field outward, evoking chest elevation and lightness.
  - Exhale gently converges inwards towards the center, evoking grounded stability.

---

# 7. Hardware Haptics, Screen Wake Lock & Touch-Pacer

### 7.1 Native Hardware Haptic Protocol (`@capacitor/haptics`)
The application implements high-fidelity tactile feedback utilizing native Apple CoreHaptics and Android Vibrator engines via `@capacitor/haptics`, with seamless fallback to the W3C Vibration API:
* **`inhale` (Inspiration Start):** `ImpactStyle.Light` ($28\text{ms}$ crisp pulse).
* **`hold-in` (Cardiac Systolic Notch):** `ImpactStyle.Medium` followed by `ImpactStyle.Light` at $+80\text{ms}$ to replicate the aortic dicrotic notch sensation of cardiopulmonary fullness.
* **`exhale` (Expiration Release):** `ImpactStyle.Light` ($[20, 45, 22]\text{ms}$ descending release).
* **`hold-out` (Resting Stillness):** `ImpactStyle.Light` ($14\text{ms}$ stillness tick).
* **`session complete` (Resolution):** `NotificationType.Success` ($[40, 80, 50, 100, 70]\text{ms}$ harmonious chord).
* **`touch pace` (Free Flow Contact):** Instant tactile engagement on finger touchdown and liftoff.

### 7.2 Screen Wake Lock
* `navigator.wakeLock.request('screen')` acquired on respiration play.
* Released on pause, blur (`visibilitychange`), or session conclusion.

### 7.3 Mode "OLED Noir Absolu / Yeux Fermés"
* **Trigger:** `#btn-oled`, double-tap on canvas, or shortcut <kbd>O</kbd>.
* **Behavior:** Renders `#000000` pure black pixels off.
* **Audio & Haptics:** Full haptics and 3D spatial audio remain active to guide eyes-closed meditation.
* **Exit:** Any single tap anywhere on screen instantly wakes the visualizer.

### 7.4 "Souffle Libre" Tactile Touch-Pacer
* **Trigger:** Press and hold canvas $> 220\text{ms}$.
* **Holding:** Inhales at $+0.22/\text{sec}$ with tactile feedback.
* **Releasing:** Exhales at $-0.16/\text{sec}$ with release haptics.
* **Resumption:** Inactivity of $4\text{s}$ smoothly returns to preset rhythmic cycles.

---

# 8. Session Timer & Harmonious Cycle-Complete Finishing

1. Durations: $\infty, 3\text{m}, 5\text{m}, 10\text{m}$.
2. When countdown hits $0\text{s}$, enters `isFinishingCycle = true`.
3. Subtitle displays: `"[Phase Subtext] · Completing final breath..."`.
4. On transition to `phaseIndex === 0` (end of full cycle exhalation), `isComplete = true`, Tibetan bowl strikes, and Night Stand Sleep Dimmer mode activates ($\approx 5\%$ ambient brightness).

---

# 9. UI/UX Design System, CSS Tokens & Native Mobile Suite

* **Glassmorphism:** `background: rgba(18, 14, 24, 0.75); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);`
* **Safe-Area Insets:** `bottom: max(1.1rem, env(safe-area-inset-bottom, 1.1rem)); padding-top: max(0.75rem, env(safe-area-inset-top));`
* **Viewport Units:** Strict dynamic viewport units (`100dvh`, `100dvw`).
* **Progress Ring:** $r = 54\text{px}$, Circumference $= 339.292\text{px}$, $\text{offset} = 339.292 \times (1 - \text{progress})$.
* **Mobile Header Purification:**
  - `#btn-fullscreen` is automatically hidden on mobile viewports ($\le 768\text{px}$) via `display: none !important;` to eliminate desktop clutter on fullscreen native apps.
  - Dedicated mobile timer button (`#btn-timer-modal`) is dynamically surfaced in `.top-actions` (`display: inline-flex !important;`), cycling through durations ($\infty \rightarrow 3\text{m} \rightarrow 5\text{m} \rightarrow 10\text{m}$) with real-time scientific toasts and pill synchronicity.
* **Native Mobile Gestures:**
  - **Interactive Drag-to-Dismiss Bottom Sheets:** Both `#info-drawer` and `#tuning-drawer` support pointer/touch drag-down gestures with real-time translation physics and dynamic backdrop opacity fading. Dragging $> 70\text{px}$ downward smoothly dismisses the sheet; otherwise it springs back with a cubic-bezier ease.
  - **Horizontal Canvas Atmosphere Swiping:** Quick horizontal flicks across the WebGL canvas ($|dx| > 65\text{px}$, $|dx| > 1.6|dy|$, $t < 400\text{ms}$) cycle to the next or previous atmosphere and auto-harmonize the entire multi-sensory stack.
* **Dual-Token Responsive Nomenclature:**
  - Full desktop names vs. compact mobile tokens (`.name-full` vs `.name-short`).
  - Mobile Atmospheres: `🌌 Aurora`, `🌊 Ocean`, `🌧️ Rain`, `🕯️ Hearth`, `✨ Astral`.
  - Mobile Rhythms: `Soupir 2+1`, `5.5s Coherence`, `Box 4s`, `4-7-8 Relax`, `4-2-6 Unwind`.
* **2-Tier Mobile Grid Console ($\le 768\text{px}$):**
  - Uses CSS Grid (`grid-template-areas: "atmospheres atmospheres" "patterns actions"`).
  - Tier 1: Horizontally scrollable edge-masked Atmosphere track.
  - Tier 2: Scrollable Rhythm track (left) paired with primary Play/Pause action button (right).
  - Total dock height capped under $85\text{px}$ preserving over $80\%$ of screen real estate.
* **Minimalist Scientific Info Drawer:**
  - Triggered via `#btn-info` or shortcut <kbd>I</kbd>.
  - Glassmorphic bottom sheet detailing active Atmosphere neuroaesthetics and active Breathing Rhythm cardiopulmonary mechanics with primary clinical citations.
  - Dynamically displays a fast restore action when the session departs from the atmosphere's optimal pairing.
* **Smart Frequency Harmony System & Bi-Directional Auto-Tuning (`#btn-tuning` & `#tuning-drawer`):**
  - **Bi-Directional Auto-Harmonization:**
    - **Atmosphere Switch:** Automatically aligns the breathing pattern, carrier frequency ($432\text{ Hz}$ or $528\text{ Hz}$), and binaural entrainment beat ($5.5\text{ Hz}$, $10\text{ Hz}$, or $4\text{ Hz}$).
    - **Breathing Mode Switch:** Automatically aligns the paired atmosphere shader, nature sound generator, carrier frequency, and binaural beat.
    - **1-to-1 Bijective Pairings:**
      - `🌌 Aurora` $\leftrightarrow$ `5.5s Coherence` ($432\text{ Hz}$ · Theta $5.5\text{ Hz}$)
      - `🌊 Ocean` $\leftrightarrow$ `Box 4s` ($528\text{ Hz}$ · Alpha $10.0\text{ Hz}$)
      - `🌧️ Rain` $\leftrightarrow$ `4-2-6 Unwind` ($432\text{ Hz}$ · Theta $5.5\text{ Hz}$)
      - `🕯️ Hearth` $\leftrightarrow$ `4-7-8 Relax` ($432\text{ Hz}$ · Theta $4.0\text{ Hz}$)
      - `✨ Astral` $\leftrightarrow$ `Soupir 2+1` ($528\text{ Hz}$ · Theta $5.5\text{ Hz}$)
  - **Dynamic State Badge:**
    - Harmonized: `✨ [Freq] Hz · Harmonisé` with green glow ring (`.is-harmonized`).
    - Custom: `∿ [Freq] Hz · Manuel` with amber indicator (`.is-custom`).
    - Always visible in header on both mobile and desktop screens.
  - **Dedicated Harmony Drawer:**
    - Triggered via `#btn-tuning` or shortcut <kbd>T</kbd>.
    - Allows direct selection of 432 Hz, 528 Hz, 440 Hz carrier frequencies and Theta 5.5 Hz, Alpha 10 Hz, Theta 4 Hz binaural entrainment waves.
    - Dynamically badges the recommended frequency for the active atmosphere.
  - **One-Tap Re-Harmonization Action:**
    - Instantly re-aligns carrier frequency, binaural beat, and breathing pattern to the active atmosphere's scientific optimum in one smooth transition.
* **Free Flow 2.0 ("Souffle Libre") Architecture:**
  - **First-Class 6th Dock Mode:** Dedicated `✋ Libre` pill in the primary dock for immediate discoverability.
  - **Elastic Sigmoidal Compliance:** Non-linear thoracic expansion $v_{\text{in}} = 0.32 \times (1.02 - \text{scale})^{0.68}$ and passive recoil $v_{\text{ex}} = 0.26 \times (\text{scale} + 0.04)^{0.72}$.
  - **Bioluminescent Tactile Bloom:** Screen touch injects normalized coordinates `(u_touchPos, u_touchActive)` into WebGL shaders, radiating an ink bloom directly beneath the finger contact point.
  - **Zero-Timeout Stillness:** Eliminates the forced 4-second exit; users can inhabit empty-lung apneas without temporal pressure.
  - **Vasomotor Auditory Pulse:** Web Audio filter introduces a subtle $0.12\text{ Hz}$ Mayer-wave micro-pulse during prolonged holds, preventing acoustic stagnation.

---

# 10. Native Mobile Packaging & System Integration (Capacitor Android & iOS)

### 10.1 Native Navigation & Hardware Back Button Hierarchy
Native Android back-button signals are intercepted via `@capacitor/app` (`App.addListener('backButton')`), executing a strictly ordered, non-destructive navigation hierarchy:
1. Close Tuning Drawer (if open)
2. Close Scientific Info Drawer (if open)
3. Exit OLED Noir Mode (if active)
4. Pause Respiration Session (if actively running)
5. Minimize / Exit Application (`App.exitApp()`)

### 10.2 `capacitor.config.ts`
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chromasync.app',
  appName: 'Chromasync',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: {
    StatusBar: { overlaysWebView: true, style: 'DARK' }
  }
};

export default config;
```

### 10.3 Android Permissions (`AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### 10.4 Gradle Build Toolchain
* **Android Gradle Plugin (AGP):** `com.android.tools.build:gradle:9.4.0`
* **Google Services Plugin:** `com.google.gms:google-services:4.4.4`
* **Daemon JVM Toolchain:** JetBrains Java 21 LTS (`gradle-daemon-jvm.properties`)
* **Compiled Debug Package:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

# 11. Complete Verification, Build & Deployment Guide

```powershell
# Web dev server:
npm.cmd run dev

# Web production build:
npm.cmd run build

# Capacitor sync:
npm.cmd run cap:sync

# Android debug APK build:
cd android
.\gradlew.bat assembleDebug
# Generated APK: android/app/build/outputs/apk/debug/app-debug.apk

# Native IDEs:
npm.cmd run cap:android
npm.cmd run cap:ios
```
