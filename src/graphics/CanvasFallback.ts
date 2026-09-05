import { Atmosphere } from '../core/Atmospheres';
import { BreathState } from '../core/BreathingEngine';

export class CanvasFallback {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D Canvas not supported');
    this.ctx = ctx;
  }

  public render(state: BreathState, atmosphere: Atmosphere, time: number): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.45;

    // Clear background
    const bg = atmosphere.bgBase;
    this.ctx.fillStyle = `rgb(${bg.r * 255}, ${bg.g * 255}, ${bg.b * 255})`;
    this.ctx.fillRect(0, 0, width, height);

    // Current breath radius
    const currentRadius = maxRadius * (0.4 + 0.6 * (state.breathScale || 0));
    const wobble = Math.sin(time * 0.002) * 15;
    const outerRadius = Math.max(1, currentRadius + wobble);

    // Radial gradient glow
    const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, outerRadius);
    
    const hold = atmosphere.holdLuster;
    const glow = atmosphere.inhaleGlow;
    const cool = atmosphere.exhaleCool;

    grad.addColorStop(0, `rgba(${hold.r * 255}, ${hold.g * 255}, ${hold.b * 255}, 0.9)`);
    grad.addColorStop(0.5, `rgba(${glow.r * 255}, ${glow.g * 255}, ${glow.b * 255}, 0.7)`);
    grad.addColorStop(0.85, `rgba(${cool.r * 255}, ${cool.g * 255}, ${cool.b * 255}, 0.35)`);
    grad.addColorStop(1, 'transparent');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
