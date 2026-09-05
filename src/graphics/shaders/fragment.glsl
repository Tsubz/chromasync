#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

precision mediump int;

varying vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_breathScale;   // 0.0 to 1.0 (continuous breath expansion)
uniform float u_phaseProgress; // 0.0 to 1.0 within current phase
uniform int u_phaseType;       // 0: inhale, 1: hold_in, 2: exhale, 3: hold_out
uniform int u_atmosphereMode;  // 0: Aurora, 1: Ocean, 2: Rain, 3: Hearth, 4: Astral
uniform vec2 u_touchPos;       // Normalized aspect-corrected touch coordinate
uniform float u_touchActive;   // 0.0 to 1.0 smooth contact bloom

// Palette colors (RGB normalized 0..1)
uniform vec3 u_bgBase;
uniform vec3 u_inhaleGlow;
uniform vec3 u_holdLuster;
uniform vec3 u_exhaleCool;
uniform vec3 u_accent;

// Simplex-like 2D Noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractional Brownian Motion (fBm)
float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(st * frequency);
    st += vec2(1.7, 3.2);
    frequency *= 2.05;
    amplitude *= 0.5;
  }
  return value;
}

// Domain Warping for fluid watercolor / aurora
float warpedFbm(vec2 p, out vec2 q, out vec2 r) {
  float t = mod(u_time, 628.318) * 0.12;
  q = vec2(
    fbm(p + vec2(0.0, 0.0) + t * 0.4),
    fbm(p + vec2(5.2, 1.3) + t * 0.5)
  );
  r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.35),
    fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.3)
  );
  return fbm(p + 3.5 * r);
}

// Water Caustic Synthesis (Mode 1: Ocean)
float waterCaustics(vec2 p) {
  vec2 p2 = p * 4.0;
  float t = mod(u_time, 628.318) * 0.45;
  float c1 = sin(p2.x + sin(p2.y + t) + sin(p2.x * 0.8 + t * 0.7));
  float c2 = cos(p2.y + cos(p2.x + t * 0.8) + cos(p2.y * 0.7 + t * 0.6));
  float c = (c1 + c2) * 0.5;
  return pow(abs(c), 2.5);
}

// Raindrop Ripples Synthesis (Mode 2: Rain)
float rainRipples(vec2 p) {
  float ripples = 0.0;
  float t = mod(u_time, 628.318);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 center = vec2(sin(fi * 3.7 + t * 0.2) * 0.7, cos(fi * 2.3 + t * 0.15) * 0.6);
    float d = length(p - center);
    float wave = sin(d * 24.0 - t * 3.5 + fi * 1.5) * exp(-d * 3.5);
    ripples += max(0.0, wave);
  }
  return ripples * 0.25;
}

// Rising Ember Particles Synthesis (Mode 3: Hearth)
float risingEmbers(vec2 p) {
  float embers = 0.0;
  vec2 uv = p;
  float t = mod(u_time, 628.318);
  uv.y += t * 0.35; // rising drift
  
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 seed = floor(uv * (4.0 + fi * 2.0));
    vec2 safeSeed = mod(seed, 64.0);
    float rnd = fract(sin(dot(safeSeed, vec2(12.9898, 78.233)) + fi) * 437.5854);
    if (rnd > 0.88) {
      vec2 local = fract(uv * (4.0 + fi * 2.0)) - 0.5;
      float d = length(local);
      embers += smoothstep(0.18, 0.0, d) * (0.6 + 0.4 * sin(mod(t * 5.0 + rnd * 10.0, 62.83)));
    }
  }
  return embers;
}

// Cosmic Star Sparkles (Mode 4: Astral)
float astralStars(vec2 p) {
  vec2 grid = fract(p * 8.0) - 0.5;
  vec2 id = floor(p * 8.0);
  vec2 safeId = mod(id, 64.0);
  float rnd = fract(sin(dot(safeId, vec2(93.123, 47.654))) * 437.5854);
  float star = 0.0;
  if (rnd > 0.91) {
    float d = length(grid);
    float twinkle = 0.5 + 0.5 * sin(mod(u_time * 4.0 + rnd * 20.0, 62.83));
    star = smoothstep(0.15, 0.0, d) * twinkle;
  }
  return star;
}

void main() {
  vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  float dist = length(st);

  // Dynamic coordinates warped by breathing cycle
  vec2 p = st * (1.2 - 0.3 * u_breathScale);
  
  vec2 q, r;
  float n = warpedFbm(p, q, r);

  // Base breath radius
  float baseRadius = 0.35 + 0.65 * u_breathScale;
  float organicDist = dist + 0.25 * n;
  float glowMask = smoothstep(baseRadius + 0.65, baseRadius - 0.25, organicDist);

  // Core base palette
  vec3 col = u_bgBase;

  // Layer 1: Ambient deep field
  col = mix(col, u_exhaleCool, clamp(r.x * 0.5 + 0.5, 0.0, 1.0) * (0.4 + 0.3 * (1.0 - u_breathScale)));

  // Layer 2: Main luminous body
  col = mix(col, u_inhaleGlow, glowMask * (0.65 + 0.35 * u_breathScale));

  // Layer 3: Central incandescent core
  float coreMask = smoothstep(baseRadius * 0.6, 0.0, organicDist);
  col = mix(col, u_holdLuster, coreMask * (0.4 + 0.6 * u_breathScale));

  // Layer 4: Chromatic accent swirls
  float accentMask = smoothstep(0.3, 0.8, abs(q.y));
  col = mix(col, u_accent, accentMask * glowMask * 0.45);

  // Apply Atmosphere-specific Shader Dynamics
  if (u_atmosphereMode == 1) {
    // Mode 1: Oceanic Tide caustics
    float caustic = waterCaustics(p * 0.7);
    col += u_holdLuster * caustic * (0.3 + 0.4 * u_breathScale);
  } else if (u_atmosphereMode == 2) {
    // Mode 2: Forest Rain ripples
    float ripple = rainRipples(p);
    col += u_inhaleGlow * ripple * (0.5 + 0.5 * u_breathScale);
  } else if (u_atmosphereMode == 3) {
    // Mode 3: Warm Hearth embers
    float ember = risingEmbers(p);
    col += u_holdLuster * ember * 0.8;
  } else if (u_atmosphereMode == 4) {
    // Mode 4: Astral Void stars & stardust
    float stars = astralStars(p);
    col += vec3(1.0, 0.95, 1.0) * stars * 0.9;
  }

  // Bioluminescent Tactile Bloom (Free Flow tactile feedback directly under thumb)
  if (u_touchActive > 0.001) {
    float touchDist = length(p - u_touchPos);
    float touchBloom = exp(-touchDist * 3.8) * u_touchActive;
    float touchRing = exp(-abs(touchDist - 0.12) * 14.0) * u_touchActive * 0.45;
    col += (u_inhaleGlow * 0.75 + u_accent * 0.25) * (touchBloom * 0.65 + touchRing * 0.35);
  }

  // Subtle chromatic aberration toward edges
  float caOffset = 0.0035 * (1.0 + 0.5 * u_breathScale);
  float rNoise = fbm(p + vec2(caOffset, 0.0));
  float bNoise = fbm(p - vec2(caOffset, 0.0));
  col.r += 0.04 * (rNoise - n);
  col.b += 0.04 * (bNoise - n);

  // Gentle vignette
  float vignette = smoothstep(1.8, 0.45, dist);
  col *= vignette;

  // Film grain to prevent banding (safe bounded coordinates for mobile GPUs)
  vec2 grainCoord = mod(gl_FragCoord.xy, 128.0);
  float grain = fract(sin(dot(grainCoord, vec2(12.9898, 78.233)) + mod(u_time, 10.0)) * 437.5854);
  col += (grain - 0.5) * 0.022;

  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
