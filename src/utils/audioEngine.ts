/**
 * Web Audio API V8 Muscle Car Engine Synthesizer
 * Simulates a high-displacement Coyote 5.0L / Supercharged V8 with idle rumble,
 * throttle response, supercharger whine, exhaust valve control, and deceleration backfires.
 */

class MustangAudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isRunning = false;
  private currentRpm = 850;
  private targetRpm = 850;
  private maxRpm = 7500;
  private idleRpm = 850;

  // Nodes
  private masterGain: GainNode | null = null;
  private exhaustFilter: BiquadFilterNode | null = null;
  private bassBoost: BiquadFilterNode | null = null;
  private distortionNode: WaveShaperNode | null = null;

  // Oscillators for V8 harmonics
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private osc3: OscillatorNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private superchargerOsc: OscillatorNode | null = null;
  private superchargerGain: GainNode | null = null;

  // Gains
  private osc1Gain: GainNode | null = null;
  private osc2Gain: GainNode | null = null;
  private osc3Gain: GainNode | null = null;
  private oscSubGain: GainNode | null = null;

  // Noise for intake/exhaust rush
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;

  // Mode settings
  private exhaustMode: 'quiet' | 'normal' | 'sport' | 'track' = 'track';
  private hasSupercharger = false;
  private animationFrameId: number | null = null;
  private onRpmChangeCallback?: (rpm: number) => void;
  private onBackfireCallback?: () => void;
  private lastBackfireTime = 0;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.isInitialized = true;
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  public setExhaustMode(mode: 'quiet' | 'normal' | 'sport' | 'track') {
    this.exhaustMode = mode;
    this.updateFilterParams();
  }

  public setHasSupercharger(enabled: boolean) {
    this.hasSupercharger = enabled;
  }

  public setOnRpmChange(cb: (rpm: number) => void) {
    this.onRpmChangeCallback = cb;
  }

  public setOnBackfire(cb: () => void) {
    this.onBackfireCallback = cb;
  }

  private makeDistortionCurve(amount = 20) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public start() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isRunning) return;

    this.isRunning = true;
    this.currentRpm = this.idleRpm;
    this.targetRpm = this.idleRpm;

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.45, this.ctx.currentTime + 0.3);

    // Distortion
    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(18);
    this.distortionNode.oversample = '2x';

    // Filters
    this.exhaustFilter = this.ctx.createBiquadFilter();
    this.exhaustFilter.type = 'lowpass';
    this.updateFilterParams();

    this.bassBoost = this.ctx.createBiquadFilter();
    this.bassBoost.type = 'peaking';
    this.bassBoost.frequency.value = 65;
    this.bassBoost.gain.value = 8;
    this.bassBoost.Q.value = 1.4;

    // V8 fundamental: 8 cylinders / 2 rotations = 4 firing pulses per rev
    // Idle 850 RPM = (850/60) * 4 ≈ 56.6 Hz
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1Gain = this.ctx.createGain();
    this.osc1Gain.gain.value = 0.35;

    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2Gain = this.ctx.createGain();
    this.osc2Gain.gain.value = 0.28;

    this.osc3 = this.ctx.createOscillator();
    this.osc3.type = 'square';
    this.osc3Gain = this.ctx.createGain();
    this.osc3Gain.gain.value = 0.12;

    this.oscSub = this.ctx.createOscillator();
    this.oscSub.type = 'sine';
    this.oscSubGain = this.ctx.createGain();
    this.oscSubGain.gain.value = 0.45;

    // Supercharger
    this.superchargerOsc = this.ctx.createOscillator();
    this.superchargerOsc.type = 'sine';
    this.superchargerGain = this.ctx.createGain();
    this.superchargerGain.gain.value = 0;

    // Air flow noise
    const noiseBuffer = this.createNoiseBuffer();
    if (noiseBuffer) {
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;
      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.value = 0.04;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 450;
      noiseFilter.Q.value = 2.0;

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.masterGain);
      this.noiseNode.start();
    }

    // Connect oscillators
    this.osc1.connect(this.osc1Gain);
    this.osc2.connect(this.osc2Gain);
    this.osc3.connect(this.osc3Gain);
    this.oscSub.connect(this.oscSubGain);
    this.superchargerOsc.connect(this.superchargerGain);

    this.osc1Gain.connect(this.distortionNode);
    this.osc2Gain.connect(this.distortionNode);
    this.osc3Gain.connect(this.distortionNode);
    this.oscSubGain.connect(this.distortionNode);
    this.superchargerGain.connect(this.masterGain);

    this.distortionNode.connect(this.exhaustFilter);
    this.exhaustFilter.connect(this.bassBoost);
    this.bassBoost.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.osc1.start();
    this.osc2.start();
    this.osc3.start();
    this.oscSub.start();
    this.superchargerOsc.start();

    this.updateAudioLoop();
  }

  private updateFilterParams() {
    if (!this.exhaustFilter || !this.bassBoost || !this.distortionNode) return;
    switch (this.exhaustMode) {
      case 'quiet':
        this.exhaustFilter.frequency.value = 750;
        this.exhaustFilter.Q.value = 1.0;
        this.bassBoost.gain.value = 2;
        this.distortionNode.curve = this.makeDistortionCurve(5);
        break;
      case 'normal':
        this.exhaustFilter.frequency.value = 1300;
        this.exhaustFilter.Q.value = 1.6;
        this.bassBoost.gain.value = 5;
        this.distortionNode.curve = this.makeDistortionCurve(12);
        break;
      case 'sport':
        this.exhaustFilter.frequency.value = 2400;
        this.exhaustFilter.Q.value = 2.4;
        this.bassBoost.gain.value = 8;
        this.distortionNode.curve = this.makeDistortionCurve(22);
        break;
      case 'track':
        this.exhaustFilter.frequency.value = 4200;
        this.exhaustFilter.Q.value = 3.2;
        this.bassBoost.gain.value = 10;
        this.distortionNode.curve = this.makeDistortionCurve(35);
        break;
    }
  }

  public revTo(rpm: number) {
    if (!this.isRunning) {
      this.start();
    }
    this.targetRpm = Math.min(Math.max(rpm, this.idleRpm), this.maxRpm);
  }

  public triggerBackfire() {
    if (!this.ctx || !this.isRunning) return;
    const now = performance.now();
    if (now - this.lastBackfireTime < 180) return;
    this.lastBackfireTime = now;

    // Synthesize sudden crackle pop
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    const popFilter = this.ctx.createBiquadFilter();

    popOsc.type = 'sawtooth';
    popOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
    popOsc.frequency.exponentialRampToValueAtTime(28, this.ctx.currentTime + 0.12);

    popFilter.type = 'lowpass';
    popFilter.frequency.value = this.exhaustMode === 'track' ? 3800 : 2000;

    popGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    popOsc.connect(popFilter);
    popFilter.connect(popGain);
    if (this.masterGain) {
      popGain.connect(this.masterGain);
    }

    popOsc.start();
    popOsc.stop(this.ctx.currentTime + 0.15);

    if (this.onBackfireCallback) {
      this.onBackfireCallback();
    }
  }

  public launchStutter() {
    // 2-Step launch control rev stutter at 4500 RPM
    if (!this.isRunning) this.start();
    this.targetRpm = 4600 + Math.sin(Date.now() * 0.05) * 400;
    if (Math.random() > 0.4) {
      this.triggerBackfire();
    }
  }

  private updateAudioLoop = () => {
    if (!this.isRunning) return;

    const previousRpm = this.currentRpm;
    // Smooth RPM interpolation with crisp throttle response
    const speed = this.targetRpm > this.currentRpm ? 0.18 : 0.07;
    this.currentRpm += (this.targetRpm - this.currentRpm) * speed;

    // Detect rapid drop in RPM to trigger exhaust pops / overrun
    if (previousRpm > 3800 && previousRpm - this.currentRpm > 80 && Math.random() < 0.35) {
      this.triggerBackfire();
    }

    if (this.ctx && this.osc1 && this.osc2 && this.osc3 && this.oscSub) {
      // V8 fundamental calculation:
      const fundamentalHz = (this.currentRpm / 60) * 4;
      const t = this.ctx.currentTime;

      this.osc1.frequency.setTargetAtTime(fundamentalHz, t, 0.03);
      this.osc2.frequency.setTargetAtTime(fundamentalHz * 1.5, t, 0.03);
      this.osc3.frequency.setTargetAtTime(fundamentalHz * 2.0, t, 0.03);
      this.oscSub.frequency.setTargetAtTime(fundamentalHz * 0.5, t, 0.03);

      if (this.superchargerOsc && this.superchargerGain) {
        if (this.hasSupercharger) {
          // High pitch whine proportional to RPM (e.g. 800 Hz to 3500 Hz)
          const whineFreq = (this.currentRpm / this.maxRpm) * 3200 + 400;
          this.superchargerOsc.frequency.setTargetAtTime(whineFreq, t, 0.04);
          const whineVol = Math.max(0, (this.currentRpm - 1800) / this.maxRpm) * 0.18;
          this.superchargerGain.gain.setTargetAtTime(whineVol, t, 0.04);
        } else {
          this.superchargerGain.gain.setTargetAtTime(0, t, 0.05);
        }
      }

      if (this.noiseGain) {
        const noiseVol = 0.02 + (this.currentRpm / this.maxRpm) * 0.08;
        this.noiseGain.gain.setTargetAtTime(noiseVol, t, 0.05);
      }
    }

    if (this.onRpmChangeCallback) {
      this.onRpmChangeCallback(this.currentRpm);
    }

    this.animationFrameId = requestAnimationFrame(this.updateAudioLoop);
  };

  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      setTimeout(() => {
        try {
          this.osc1?.stop();
          this.osc2?.stop();
          this.osc3?.stop();
          this.oscSub?.stop();
          this.superchargerOsc?.stop();
          this.noiseNode?.stop();
        } catch {
          // ignore
        }
      }, 250);
    }
  }

  public getIsRunning() {
    return this.isRunning;
  }

  public getRpm() {
    return this.currentRpm;
  }
}

export const audioEngine = new MustangAudioEngine();
