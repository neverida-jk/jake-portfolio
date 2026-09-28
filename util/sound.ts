// Web Audio API tactile feedback synthesizer (zero external audio file dependencies)

const SUMMIT_KEY = "jake_portfolio_summit_played";

class SoundSystem {
  private audioCtx: AudioContext | null = null;
  // Default muted (ASCENT_MASTERPLAN.md §5.4) — sound never auto-plays.
  private isMuted: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jake_portfolio_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jake_portfolio_muted', String(this.isMuted));
      window.dispatchEvent(new CustomEvent('sound-changed', { detail: this.isMuted }));
    }
    if (!this.isMuted) {
      this.playClick();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private tone(freq: number, type: OscillatorType, duration: number, gain: number, startAt = 0) {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      const now = ctx.currentTime + startAt;
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  public playClick(freq = 800, type: OscillatorType = 'sine', duration = 0.04) {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  public playKey() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const randomPitch = 500 + Math.random() * 200;
      osc.frequency.setValueAtTime(randomPitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore
    }
  }

  public playSuccess() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.08);

        gain.gain.setValueAtTime(0.06, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  /** Waypoint crossed on the altimeter rail (§5.3/§5.4) — a short ping. */
  public tick() {
    this.tone(1200, 'sine', 0.06, 0.05);
  }

  /** Summit reached (§5.4/§6.7) — a soft major triad, once per session. */
  public summit() {
    if (this.isMuted) return;
    if (typeof window !== 'undefined' && sessionStorage.getItem(SUMMIT_KEY) === '1') return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => { // C5, E5, G5
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        g.gain.setValueAtTime(0.0001, now + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.1, now + i * 0.05 + 0.15);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 1.4);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 1.4);
      });
      if (typeof window !== 'undefined') sessionStorage.setItem(SUMMIT_KEY, '1');
    } catch {
      // Ignore
    }
  }
}

export const soundFx = new SoundSystem();
