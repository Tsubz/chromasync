import { Atmosphere, RGBColor } from '../core/Atmospheres';
import { BreathState } from '../core/BreathingEngine';
import { CanvasFallback } from './CanvasFallback';
import vertexSource from './shaders/vertex.glsl?raw';
import fragmentSource from './shaders/fragment.glsl?raw';

export class ShaderRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private fallback: CanvasFallback | null = null;
  private program: WebGLProgram | null = null;

  // Uniform locations
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uBreathScaleLoc: WebGLUniformLocation | null = null;
  private uPhaseProgressLoc: WebGLUniformLocation | null = null;
  private uPhaseTypeLoc: WebGLUniformLocation | null = null;
  private uAtmosphereModeLoc: WebGLUniformLocation | null = null;
  private uBgBaseLoc: WebGLUniformLocation | null = null;
  private uInhaleGlowLoc: WebGLUniformLocation | null = null;
  private uHoldLusterLoc: WebGLUniformLocation | null = null;
  private uExhaleCoolLoc: WebGLUniformLocation | null = null;
  private uAccentLoc: WebGLUniformLocation | null = null;
  private uTouchPosLoc: WebGLUniformLocation | null = null;
  private uTouchActiveLoc: WebGLUniformLocation | null = null;

  // Touch tracking state
  private touchPos: { x: number; y: number } = { x: 0, y: 0 };
  private touchActive: number = 0.0;
  private targetTouchActive: number = 0.0;

  // Smooth atmosphere transition state
  private currentAtmosphere: Atmosphere;
  private targetAtmosphere: Atmosphere;
  private transitionProgress: number = 1.0;

  // Interpolated color state
  private activeBg: RGBColor;
  private activeInhale: RGBColor;
  private activeHold: RGBColor;
  private activeExhale: RGBColor;
  private activeAccent: RGBColor;

  constructor(canvas: HTMLCanvasElement, initialAtmosphere: Atmosphere) {
    this.canvas = canvas;
    this.currentAtmosphere = initialAtmosphere;
    this.targetAtmosphere = initialAtmosphere;

    this.activeBg = { ...initialAtmosphere.bgBase };
    this.activeInhale = { ...initialAtmosphere.inhaleGlow };
    this.activeHold = { ...initialAtmosphere.holdLuster };
    this.activeExhale = { ...initialAtmosphere.exhaleCool };
    this.activeAccent = { ...initialAtmosphere.accent };

    this.init();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  private init(): void {
    try {
      const glAttrs: WebGLContextAttributes = {
        alpha: false,
        antialias: false,
        powerPreference: 'default',
        preserveDrawingBuffer: false
      };

      // Try WebGL2 first, then WebGL 1, then experimental-webgl
      const ctx = (this.canvas.getContext('webgl2', glAttrs) ||
                   this.canvas.getContext('webgl', glAttrs) ||
                   this.canvas.getContext('experimental-webgl', glAttrs)) as (WebGLRenderingContext | WebGL2RenderingContext | null);

      if (!ctx) {
        throw new Error('WebGL not available');
      }

      this.gl = ctx;
      this.setupContextLossListeners();
      this.setupShaders();
      this.setupGeometry();
      this.resize();

      // Immediate clear with active atmosphere base color so screen is never black on load
      this.gl.clearColor(this.activeBg.r, this.activeBg.g, this.activeBg.b, 1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    } catch (e) {
      console.warn('Falling back to 2D Canvas renderer:', e);
      this.initFallback();
    }
  }

  private initFallback(): void {
    this.gl = null;
    this.program = null;

    // A canvas that has attempted WebGL cannot acquire a 2D context per HTML spec.
    // Replace the canvas in the DOM with a fresh clone to ensure 2D context succeeds.
    try {
      const parent = this.canvas.parentNode;
      if (parent) {
        const freshCanvas = this.canvas.cloneNode(false) as HTMLCanvasElement;
        parent.replaceChild(freshCanvas, this.canvas);
        this.canvas = freshCanvas;
      }
      this.fallback = new CanvasFallback(this.canvas);
      this.resize();
    } catch (fallbackErr) {
      console.error('Failed to initialize 2D Canvas fallback:', fallbackErr);
    }
  }

  private setupContextLossListeners(): void {
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('WebGL context lost');
    }, { passive: false });

    this.canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      this.init();
    }, { passive: true });
  }

  private setupShaders(): void {
    if (!this.gl) return;

    const gl = this.gl;
    const vShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
    const fShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create WebGL program');

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error(`Shader linking failed: ${info}`);
    }

    this.program = program;
    gl.useProgram(program);

    // Cache uniform locations
    this.uTimeLoc = gl.getUniformLocation(program, 'u_time');
    this.uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    this.uBreathScaleLoc = gl.getUniformLocation(program, 'u_breathScale');
    this.uPhaseProgressLoc = gl.getUniformLocation(program, 'u_phaseProgress');
    this.uPhaseTypeLoc = gl.getUniformLocation(program, 'u_phaseType');
    this.uAtmosphereModeLoc = gl.getUniformLocation(program, 'u_atmosphereMode');
    this.uBgBaseLoc = gl.getUniformLocation(program, 'u_bgBase');
    this.uInhaleGlowLoc = gl.getUniformLocation(program, 'u_inhaleGlow');
    this.uHoldLusterLoc = gl.getUniformLocation(program, 'u_holdLuster');
    this.uExhaleCoolLoc = gl.getUniformLocation(program, 'u_exhaleCool');
    this.uAccentLoc = gl.getUniformLocation(program, 'u_accent');
    this.uTouchPosLoc = gl.getUniformLocation(program, 'u_touchPos');
    this.uTouchActiveLoc = gl.getUniformLocation(program, 'u_touchActive');
  }

  private compileShader(type: number, source: string): WebGLShader {
    if (!this.gl) throw new Error('WebGL not available');
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation failed: ${info}`);
    }

    return shader;
  }

  private setupGeometry(): void {
    if (!this.gl || !this.program) return;
    const gl = this.gl;

    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
  }

  public setAtmosphere(atmosphere: Atmosphere): void {
    if (this.targetAtmosphere.id === atmosphere.id) return;
    this.currentAtmosphere = { ...this.targetAtmosphere };
    this.targetAtmosphere = atmosphere;
    this.transitionProgress = 0.0;
  }

  public resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const clientW = this.canvas.clientWidth || window.innerWidth || 360;
    const clientH = this.canvas.clientHeight || window.innerHeight || 640;
    const width = Math.max(1, Math.floor(clientW * dpr));
    const height = Math.max(1, Math.floor(clientH * dpr));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      if (this.gl) {
        this.gl.viewport(0, 0, width, height);
      }
    }
  }

  public render(state: BreathState, timestamp: number): void {
    const timeInSeconds = timestamp * 0.001;

    // Update atmosphere color crossfade
    if (this.transitionProgress < 1.0) {
      this.transitionProgress = Math.min(1.0, this.transitionProgress + 0.025);
      const t = this.transitionProgress;
      this.activeBg = this.lerpColor(this.currentAtmosphere.bgBase, this.targetAtmosphere.bgBase, t);
      this.activeInhale = this.lerpColor(this.currentAtmosphere.inhaleGlow, this.targetAtmosphere.inhaleGlow, t);
      this.activeHold = this.lerpColor(this.currentAtmosphere.holdLuster, this.targetAtmosphere.holdLuster, t);
      this.activeExhale = this.lerpColor(this.currentAtmosphere.exhaleCool, this.targetAtmosphere.exhaleCool, t);
      this.activeAccent = this.lerpColor(this.currentAtmosphere.accent, this.targetAtmosphere.accent, t);
    }

    if (this.gl && this.program) {
      const gl = this.gl;
      gl.useProgram(this.program);

      // Pass uniforms
      gl.uniform1f(this.uTimeLoc, timeInSeconds);
      gl.uniform2f(this.uResolutionLoc, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uBreathScaleLoc, state.breathScale);
      gl.uniform1f(this.uPhaseProgressLoc, state.phaseProgress);

      const phaseTypeMap: Record<string, number> = {
        'inhale': 0,
        'hold_in': 1,
        'exhale': 2,
        'hold_out': 3
      };
      gl.uniform1i(this.uPhaseTypeLoc, phaseTypeMap[state.currentPhase.type] ?? 0);
      gl.uniform1i(this.uAtmosphereModeLoc, this.targetAtmosphere.shaderMode);

      // Colors
      gl.uniform3f(this.uBgBaseLoc, this.activeBg.r, this.activeBg.g, this.activeBg.b);
      gl.uniform3f(this.uInhaleGlowLoc, this.activeInhale.r, this.activeInhale.g, this.activeInhale.b);
      gl.uniform3f(this.uHoldLusterLoc, this.activeHold.r, this.activeHold.g, this.activeHold.b);
      gl.uniform3f(this.uExhaleCoolLoc, this.activeExhale.r, this.activeExhale.g, this.activeExhale.b);
      gl.uniform3f(this.uAccentLoc, this.activeAccent.r, this.activeAccent.g, this.activeAccent.b);
      // Smooth touch active bloom
      this.touchActive += (this.targetTouchActive - this.touchActive) * 0.18;
      gl.uniform2f(this.uTouchPosLoc, this.touchPos.x, this.touchPos.y);
      gl.uniform1f(this.uTouchActiveLoc, this.touchActive);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (this.fallback) {
      this.fallback.render(state, this.targetAtmosphere, timestamp);
    }
  }

  public setTouchContact(active: boolean, clientX?: number, clientY?: number): void {
    this.targetTouchActive = active ? 1.0 : 0.0;
    if (clientX !== undefined && clientY !== undefined) {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2.0 - 1.0;
      const y = -(((clientY - rect.top) / rect.height) * 2.0 - 1.0);
      const aspect = this.canvas.width / this.canvas.height;
      this.touchPos = { x: x * aspect, y: y };
    }
  }

  private lerpColor(a: RGBColor, b: RGBColor, t: number): RGBColor {
    return {
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t
    };
  }
}
