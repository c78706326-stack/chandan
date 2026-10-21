/**
 * Realistic Porsche Flat-Six Engine Sound Synthesizer using Web Audio API
 */
class EngineAudio {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private osc3: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private isRunning: boolean = false;
  private currentRpm: number = 900;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start() {
    try {
      this.initContext();
      if (!this.ctx || this.isRunning) return;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // 6-cylinder engine fundamental frequency = RPM * 6 / 120 = RPM * 0.05
      const baseFreq = 900 * 0.05; // 45Hz idle

      // Oscillator 1: Sawtooth (combustion pulses)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      // Oscillator 2: Triangle (body resonance)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(baseFreq * 2, this.ctx.currentTime);

      // Oscillator 3: Square with low gain (intake rasp)
      this.osc3 = this.ctx.createOscillator();
      this.osc3.type = 'sawtooth';
      this.osc3.frequency.setValueAtTime(baseFreq * 3, this.ctx.currentTime);

      // Sub Oscillator (deep mechanical thump)
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(baseFreq * 0.5, this.ctx.currentTime);

      const gain1 = this.ctx.createGain();
      gain1.gain.value = 0.5;
      const gain2 = this.ctx.createGain();
      gain2.gain.value = 0.35;
      const gain3 = this.ctx.createGain();
      gain3.gain.value = 0.2;
      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.4;

      this.osc1.connect(gain1);
      this.osc2.connect(gain2);
      this.osc3.connect(gain3);
      this.subOsc.connect(subGain);

      gain1.connect(this.filter);
      gain2.connect(this.filter);
      gain3.connect(this.filter);
      subGain.connect(this.filter);

      this.osc1.start();
      this.osc2.start();
      this.osc3.start();
      this.subOsc.start();

      this.isRunning = true;
      this.currentRpm = 900;
    } catch {
      // Audio autoplay policy handled quietly
    }
  }

  public setRpm(rpm: number) {
    if (!this.ctx || !this.isRunning) return;
    this.currentRpm = Math.max(900, Math.min(9000, rpm));
    const baseFreq = (this.currentRpm / 60) * 3; // 6-cylinder 4-stroke firing order

    const now = this.ctx.currentTime;
    if (this.osc1) this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.04);
    if (this.osc2) this.osc2.frequency.setTargetAtTime(baseFreq * 2, now, 0.04);
    if (this.osc3) this.osc3.frequency.setTargetAtTime(baseFreq * 3, now, 0.04);
    if (this.subOsc) this.subOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.04);

    if (this.filter) {
      // Filter opens up as RPM climbs for that iconic 9000 RPM GT3 screaming howl
      const cutoff = 600 + (this.currentRpm / 9000) * 4200;
      this.filter.frequency.setTargetAtTime(cutoff, now, 0.05);
    }

    if (this.masterGain) {
      const volume = 0.08 + (this.currentRpm / 9000) * 0.12;
      this.masterGain.gain.setTargetAtTime(volume, now, 0.05);
    }
  }

  public triggerRevBurst() {
    this.start();
    let current = 900;
    const target = 8600;
    const start = performance.now();
    const duration = 1200;

    const animateRev = (time: number) => {
      const elapsed = time - start;
      if (elapsed < duration * 0.45) {
        // Accelerating
        const progress = elapsed / (duration * 0.45);
        current = 900 + (target - 900) * Math.sin((progress * Math.PI) / 2);
      } else if (elapsed < duration) {
        // Decelerating with pops
        const progress = (elapsed - duration * 0.45) / (duration * 0.55);
        current = target - (target - 900) * progress;
      } else {
        current = 900;
      }
      this.setRpm(current);

      if (elapsed < duration) {
        requestAnimationFrame(animateRev);
      }
    };

    requestAnimationFrame(animateRev);
  }

  public playClickTone(type: 'radar' | 'tick' | 'shift') {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      if (type === 'radar') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(1280, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'shift') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.13);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch {
      // Ignored
    }
  }

  public stop() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.1);
      setTimeout(() => {
        try {
          this.osc1?.stop();
          this.osc2?.stop();
          this.osc3?.stop();
          this.subOsc?.stop();
          this.isRunning = false;
        } catch {
          // ignore
        }
      }, 150);
    }
  }

  public getIsRunning() {
    return this.isRunning;
  }
}

export const engineAudio = new EngineAudio();
