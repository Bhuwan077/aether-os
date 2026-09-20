// Procedural Web Audio Sound Synthesizer Engine
// Generates cyberpunk UI audio and musical tones in real time without external assets.

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private muted = false;
  private volume = 0.3;

  private initCtx(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this environment', e);
    }
  }

  public resume(): void {
    this.initCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    this.setVolume(this.volume);
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getAnalyser(): AnalyserNode | null {
    this.initCtx();
    return this.analyser;
  }

  public playTone(freq: number, duration = 0.1, type: OscillatorType = 'sine', volumeScale = 1): void {
    if (this.muted) return;
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0.01, now);
      noteGain.gain.exponentialRampToValueAtTime(0.5 * volumeScale, now + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // Audio node cleanup safeguard
    }
  }

  public playClick(): void {
    this.playTone(1200, 0.025, 'triangle', 0.2);
  }

  public playOpen(): void {
    if (this.muted) return;
    const notes = [330, 440, 554, 659];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.08, 'sine', 0.25);
      }, idx * 45);
    });
  }

  public playClose(): void {
    if (this.muted) return;
    const notes = [587, 440, 330];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.06, 'triangle', 0.2);
      }, idx * 40);
    });
  }

  public playSuccess(): void {
    if (this.muted) return;
    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', 0.3);
      }, idx * 60);
    });
  }

  public playError(): void {
    if (this.muted) return;
    this.playTone(150, 0.15, 'sawtooth', 0.4);
    setTimeout(() => {
      this.playTone(120, 0.25, 'sawtooth', 0.4);
    }, 80);
  }

  public playNotification(): void {
    if (this.muted) return;
    this.playTone(880, 0.06, 'sine', 0.25);
    setTimeout(() => {
      this.playTone(1320, 0.1, 'sine', 0.25);
    }, 70);
  }
}

export const sound = new SoundEngine();
