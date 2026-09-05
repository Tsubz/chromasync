import { AudioEngine } from '../audio/AudioEngine';

export class StudioRecorder {
  private canvas: HTMLCanvasElement;
  private audio: AudioEngine;
  private isRecording: boolean = false;
  private recorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private toastElement: HTMLElement | null = null;

  constructor(canvas: HTMLCanvasElement, audio: AudioEngine) {
    this.canvas = canvas;
    this.audio = audio;
    this.createToast();
    this.checkUrlParams();
  }

  private createToast(): void {
    this.toastElement = document.createElement('div');
    this.toastElement.className = 'studio-record-toast hidden';
    this.toastElement.style.cssText = `
      position: fixed;
      top: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      background: rgba(19, 23, 34, 0.92);
      border: 1px solid rgba(255, 179, 138, 0.4);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px);
      padding: 0.6rem 1.4rem;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(this.toastElement);
  }

  private showToast(text: string, isDotPulsing = true): void {
    if (!this.toastElement) return;
    this.toastElement.innerHTML = `
      ${isDotPulsing ? '<span style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 10px #ef4444; display: inline-block;"></span>' : '✨'}
      <span>${text}</span>
    `;
    this.toastElement.classList.remove('hidden');
    this.toastElement.style.opacity = '1';
  }

  private hideToast(): void {
    if (!this.toastElement) return;
    this.toastElement.style.opacity = '0';
    setTimeout(() => {
      this.toastElement?.classList.add('hidden');
    }, 300);
  }

  private checkUrlParams(): void {
    const params = new URLSearchParams(window.location.search);
    if (params.get('record') === '1' || params.get('export') === 'reel') {
      window.addEventListener('load', () => {
        setTimeout(() => this.startRecording(11), 1000);
      });
    }
  }

  public async startRecording(durationSeconds = 11): Promise<void> {
    if (this.isRecording) return;
    this.isRecording = true;
    this.recordedChunks = [];

    // Ensure audio is running
    this.audio.unlock();

    // 1. Create 1080x1920 (9:16 vertical) or high-res capture
    const captureWidth = 1080;
    const captureHeight = 1920;
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = captureWidth;
    compositeCanvas.height = captureHeight;
    const ctx = compositeCanvas.getContext('2d');

    if (!ctx) {
      this.isRecording = false;
      return;
    }

    // 2. Capture Video Stream
    let isDrawing = true;
    const drawFrame = () => {
      if (!isDrawing) return;

      // Draw WebGL canvas scaled to cover
      const srcW = this.canvas.width;
      const srcH = this.canvas.height;
      const scale = Math.max(captureWidth / srcW, captureHeight / srcH);
      const drawW = srcW * scale;
      const drawH = srcH * scale;
      const drawX = (captureWidth - drawW) / 2;
      const drawY = (captureHeight - drawH) / 2;

      ctx.fillStyle = '#090b10';
      ctx.fillRect(0, 0, captureWidth, captureHeight);
      ctx.drawImage(this.canvas, drawX, drawY, drawW, drawH);

      // Render Overlay Breath Ring and Phase Text
      const phaseLabel = document.getElementById('phase-label');
      const phaseSubtext = document.getElementById('phase-subtext');
      const ringProgress = document.getElementById('ring-progress') as unknown as SVGCircleElement;

      // Draw Center HUD
      const cx = captureWidth / 2;
      const cy = captureHeight * 0.45;
      const radius = 220;

      // Ring Track
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Progress Arc
      if (ringProgress) {
        const offsetStr = ringProgress.getAttribute('stroke-dashoffset') || '0';
        const offset = parseFloat(offsetStr);
        const total = 339.292;
        const progress = Math.max(0, Math.min(1, 1 - (offset / total)));
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + progress * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.strokeStyle = '#ffb38a';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 179, 138, 0.6)';
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Phase Text
      if (phaseLabel && phaseLabel.textContent) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 52px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(phaseLabel.textContent, cx, cy - 10);
      }

      if (phaseSubtext && phaseSubtext.textContent) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(phaseSubtext.textContent, cx, cy + 45);
      }

      // Top Brand Header
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chromasync', cx, 140);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '500 18px "Plus Jakarta Sans", monospace';
      ctx.fillText('0.10 Hz BAROREFLEX RESONANCE • 432 Hz', cx, 185);

      requestAnimationFrame(drawFrame);
    };

    drawFrame();

    // 3. Audio & Video Stream Muxing
    const stream = compositeCanvas.captureStream(60);
    const audioDest = this.audio.getMediaStreamDestination();
    if (audioDest) {
      const audioTracks = audioDest.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        stream.addTrack(audioTracks[0]);
      }
    }

    // 4. MediaRecorder
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
    }

    this.recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.recorder.onstop = () => {
      isDrawing = false;
      const blob = new Blob(this.recordedChunks, { type: mimeType });
      this.showToast('✓ Video Reel Export Complete!', false);
      setTimeout(() => this.hideToast(), 3000);

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chromasync-reel-1080x1920-${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.isRecording = false;
    };

    this.recorder.start();
    this.showToast(`🔴 Recording Reel (11s Coherence)...`);

    setTimeout(() => {
      if (this.recorder && this.recorder.state !== 'inactive') {
        this.recorder.stop();
      }
    }, durationSeconds * 1000);
  }
}
