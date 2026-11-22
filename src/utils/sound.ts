class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    delay: number = 0,
    volume: number = 0.08
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playCorrect(isStreak: boolean = false) {
    this.playTone(523.25, 0.12, 'triangle', 0, 0.09); // C5
    this.playTone(659.25, 0.14, 'triangle', 0.08, 0.09); // E5
    if (isStreak) {
      this.playTone(783.99, 0.2, 'triangle', 0.16, 0.1); // G5
    }
  }

  public playWrong() {
    this.playTone(260, 0.14, 'sine', 0, 0.07);
    this.playTone(210, 0.18, 'sine', 0.1, 0.07);
  }

  public playClick() {
    this.playTone(440, 0.05, 'sine', 0, 0.04);
  }

  public playClueFound() {
    this.playTone(587.33, 0.1, 'sine', 0, 0.07); // D5
    this.playTone(880, 0.18, 'sine', 0.09, 0.08); // A5
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.24, 'triangle', idx * 0.1, 0.09);
    });
  }
}

export const soundEngine = new SoundEngine();
