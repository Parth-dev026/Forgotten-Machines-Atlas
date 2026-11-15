import { MuseumAudioContextId } from '../types/theme';

interface VoicePreset {
  frequencies: number[];
  filterCutoff: number;
  pulseIntervalMs: number;
  chimeScale: number[];
  waveform: OscillatorType;
  windLevel: number;
  windCenterHz: number;
}

const TRACK_PRESETS: Record<MuseumAudioContextId, VoicePreset[]> = {
  'mission-control': [
    {
      frequencies: [110, 164.81, 220, 293.66], // A2, E3, A3, D4 open cosmic fifths
      filterCutoff: 420,
      pulseIntervalMs: 4200,
      chimeScale: [440, 523.25, 659.25, 783.99],
      waveform: 'sine',
      windLevel: 0,
      windCenterHz: 0
    },
    {
      frequencies: [123.47, 185.0, 246.94, 329.63], // B2, F#3, B3, E4 airy observatory drone
      filterCutoff: 480,
      pulseIntervalMs: 3800,
      chimeScale: [493.88, 587.33, 739.99, 987.77],
      waveform: 'sine',
      windLevel: 0,
      windCenterHz: 0
    }
  ],
  lunar: [
    {
      frequencies: [146.83, 220, 293.66, 369.99], // D3, A3, D4, F#4 serene lunar shimmer
      filterCutoff: 640,
      pulseIntervalMs: 3600,
      chimeScale: [587.33, 659.25, 880, 987.77, 1174.66],
      waveform: 'sine',
      windLevel: 0,
      windCenterHz: 0
    },
    {
      frequencies: [164.81, 246.94, 329.63, 415.3], // E3, B3, E4, G#4 futuristic crystalline pad
      filterCutoff: 590,
      pulseIntervalMs: 4100,
      chimeScale: [659.25, 783.99, 987.77, 1318.51],
      waveform: 'sine',
      windLevel: 0,
      windCenterHz: 0
    }
  ],
  mars: [
    {
      frequencies: [98.0, 146.83, 196.0, 233.08], // G2, D3, G3, Bb3 warm dusty fifth/minor
      filterCutoff: 340,
      pulseIntervalMs: 4800,
      chimeScale: [293.66, 349.23, 392.0, 466.16],
      waveform: 'triangle',
      windLevel: 0.032,
      windCenterHz: 320
    },
    {
      frequencies: [87.31, 130.81, 174.61, 261.63], // F2, C3, F3, C4 deep canyon dusk
      filterCutoff: 310,
      pulseIntervalMs: 5200,
      chimeScale: [261.63, 329.63, 392.0, 523.25],
      waveform: 'triangle',
      windLevel: 0.038,
      windCenterHz: 270
    }
  ],
  timeline: [
    {
      frequencies: [130.81, 196.0, 246.94, 329.63], // C3, G3, B3, E4 documentary maj7
      filterCutoff: 520,
      pulseIntervalMs: 2800,
      chimeScale: [523.25, 659.25, 783.99, 987.77],
      waveform: 'triangle',
      windLevel: 0,
      windCenterHz: 0
    },
    {
      frequencies: [146.83, 220.0, 261.63, 349.23], // D3, A3, C4, F4 archival pulse
      filterCutoff: 490,
      pulseIntervalMs: 3100,
      chimeScale: [440, 523.25, 659.25, 880],
      waveform: 'triangle',
      windLevel: 0,
      windCenterHz: 0
    }
  ],
  equipment: [
    {
      frequencies: [138.59, 207.65, 277.18, 349.23], // C#3, G#3, C#4, F4 technological gallery
      filterCutoff: 560,
      pulseIntervalMs: 3200,
      chimeScale: [554.37, 659.25, 830.61, 1108.73],
      waveform: 'sine',
      windLevel: 0,
      windCenterHz: 0
    },
    {
      frequencies: [110.0, 164.81, 246.94, 329.63], // A2, E3, B3, E4 clean engineering pad
      filterCutoff: 540,
      pulseIntervalMs: 3400,
      chimeScale: [440, 659.25, 739.99, 987.77],
      waveform: 'triangle',
      windLevel: 0,
      windCenterHz: 0
    }
  ],
  history: [
    {
      frequencies: [116.54, 174.61, 233.08, 293.66], // Bb2, F3, Bb3, D4 reflective archive
      filterCutoff: 430,
      pulseIntervalMs: 4400,
      chimeScale: [349.23, 466.16, 587.33, 698.46],
      waveform: 'sine',
      windLevel: 0,
      windCenterHz: 0
    },
    {
      frequencies: [130.81, 196.0, 261.63, 311.13], // C3, G3, C4, Eb4 quiet documentary strings
      filterCutoff: 400,
      pulseIntervalMs: 4700,
      chimeScale: [392.0, 466.16, 523.25, 783.99],
      waveform: 'triangle',
      windLevel: 0,
      windCenterHz: 0
    }
  ]
};

interface ActiveWindLayer {
  source: AudioBufferSourceNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  filter: BiquadFilterNode;
  gain: GainNode;
}

/**
 * Purely instrumental Web Audio API ambient museum soundscape engine.
 * - Zero external audio file requests; synthesizes only the active track on demand.
 * - Zero vocals, singing, speech, or lyrics.
 * - Smooth fade-out / fade-in crossfades with strict protection against overlapping tracks.
 * - Releases active oscillators and noise buffers whenever paused/stopped.
 */
class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private lfoGain: GainNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private windBuffer: AudioBuffer | null = null;

  private padOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private retiringGroups: {
    oscs: { osc: OscillatorNode; gain: GainNode }[];
    wind: ActiveWindLayer | null;
    cleanupTimer: number;
  }[] = [];
  private activeWind: ActiveWindLayer | null = null;

  private chimeTimer: number | null = null;
  private switchDebounceTimer: number | null = null;
  private pauseReleaseTimer: number | null = null;
  private chimeStep = 0;

  private activeContextId: MuseumAudioContextId = 'mission-control';
  private activeTrackIndex = 0;
  private playing = false;
  private muted = false;
  private volume = 0.32;

  private getPreset(contextId: MuseumAudioContextId, trackIndex: number): VoicePreset {
    const list = TRACK_PRESETS[contextId] ?? TRACK_PRESETS['mission-control'];
    return list[Math.abs(trackIndex) % list.length];
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0;

      this.padFilter = this.ctx.createBiquadFilter();
      this.padFilter.type = 'lowpass';
      this.padFilter.frequency.value = this.getPreset(
        this.activeContextId,
        this.activeTrackIndex
      ).filterCutoff;
      this.padFilter.Q.value = 0.85;

      // Subtle slow filter breathing LFO
      this.lfoOsc = this.ctx.createOscillator();
      this.lfoOsc.type = 'sine';
      this.lfoOsc.frequency.value = 0.08;
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.value = 85;
      this.lfoOsc.connect(this.lfoGain);
      this.lfoOsc.connect(this.lfoGain);
      this.lfoGain.connect(this.padFilter.frequency);
      this.lfoOsc.start();

      this.padFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    return this.ctx;
  }

  private getOrCreateWindBuffer(ctx: AudioContext): AudioBuffer {
    if (this.windBuffer && this.windBuffer.sampleRate === ctx.sampleRate) {
      return this.windBuffer;
    }
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Smooth pink-like filtered random noise for gentle Martian wind
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      data[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2) * 0.6));
    }
    this.windBuffer = buffer;
    return buffer;
  }

  private stopVoiceGroup(
    oscs: { osc: OscillatorNode; gain: GainNode }[],
    wind: ActiveWindLayer | null
  ) {
    for (const entry of oscs) {
      try {
        entry.osc.stop();
        entry.osc.disconnect();
        entry.gain.disconnect();
      } catch {
        // ignore already stopped nodes
      }
    }
    if (wind) {
      try {
        wind.source.stop();
        wind.source.disconnect();
        wind.lfo.stop();
        wind.lfo.disconnect();
        wind.lfoGain.disconnect();
        wind.filter.disconnect();
        wind.gain.disconnect();
      } catch {
        // ignore already stopped wind nodes
      }
    }
  }

  private flushRetiringGroups() {
    while (this.retiringGroups.length > 0) {
      const group = this.retiringGroups.shift();
      if (group) {
        window.clearTimeout(group.cleanupTimer);
        this.stopVoiceGroup(group.oscs, group.wind);
      }
    }
  }

  private retireActiveVoices() {
    if (!this.ctx) {
      this.padOscs = [];
      this.activeWind = null;
      return;
    }

    // Never keep more than 1 fading-out group so tracks cannot overlap during rapid switching
    this.flushRetiringGroups();

    const oldOscs = this.padOscs;
    const oldWind = this.activeWind;
    this.padOscs = [];
    this.activeWind = null;

    if (oldOscs.length === 0 && !oldWind) return;

    const now = this.ctx.currentTime;
    for (const entry of oldOscs) {
      try {
        entry.gain.gain.setTargetAtTime(0.0001, now, 0.28);
      } catch {
        // ignore
      }
    }
    if (oldWind) {
      try {
        oldWind.gain.gain.setTargetAtTime(0.0001, now, 0.25);
      } catch {
        // ignore
      }
    }

    const cleanupTimer = window.setTimeout(() => {
      this.stopVoiceGroup(oldOscs, oldWind);
      this.retiringGroups = this.retiringGroups.filter(
        (g) => g.cleanupTimer !== cleanupTimer
      );
    }, 1100);

    this.retiringGroups.push({
      oscs: oldOscs,
      wind: oldWind,
      cleanupTimer
    });
  }

  private buildVoicesForTrack(
    contextId: MuseumAudioContextId,
    trackIndex: number
  ) {
    if (!this.ctx || !this.padFilter || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const cfg = this.getPreset(contextId, trackIndex);

    this.retireActiveVoices();
    this.padFilter.frequency.setTargetAtTime(cfg.filterCutoff, now, 0.55);

    cfg.frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.padFilter) return;
      const osc = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();
      osc.type = idx === 0 ? 'sine' : cfg.waveform;
      osc.frequency.value = freq;
      osc.detune.value = idx % 2 === 0 ? -4 : 4;

      voiceGain.gain.setValueAtTime(0.0001, now);
      const targetVoiceGain = idx === 0 ? 0.22 : 0.11 / (idx * 0.65 + 0.5);
      voiceGain.gain.setTargetAtTime(targetVoiceGain, now, 0.65);

      osc.connect(voiceGain);
      voiceGain.connect(this.padFilter);
      osc.start(now);
      this.padOscs.push({ osc, gain: voiceGain });
    });

    if (cfg.windLevel > 0) {
      const buffer = this.getOrCreateWindBuffer(this.ctx);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = cfg.windCenterHz;
      filter.Q.value = 1.6;

      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.06;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 110;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.0001, now);
      windGain.gain.setTargetAtTime(cfg.windLevel, now, 0.9);

      source.connect(filter);
      filter.connect(windGain);
      windGain.connect(this.masterGain);
      source.start(now);

      this.activeWind = {
        source,
        lfo,
        lfoGain,
        filter,
        gain: windGain
      };
    }
  }

  private triggerGentleNote() {
    if (!this.ctx || !this.masterGain || !this.playing || this.muted) return;
    const cfg = this.getPreset(this.activeContextId, this.activeTrackIndex);
    const freq = cfg.chimeScale[this.chimeStep % cfg.chimeScale.length];
    this.chimeStep += 1;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1350, now);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.04, now + 0.16);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.9);
  }

  private restartChimeLoop() {
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    if (!this.playing) return;
    const cfg = this.getPreset(this.activeContextId, this.activeTrackIndex);
    this.chimeTimer = window.setInterval(() => {
      this.triggerGentleNote();
    }, cfg.pulseIntervalMs);
  }

  private applyOutputGain() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const target = this.playing && !this.muted ? this.volume : 0;
    this.masterGain.gain.setTargetAtTime(target, now, 0.25);
  }

  public async play(
    contextId: MuseumAudioContextId,
    trackIndex = 0
  ): Promise<boolean> {
    if (this.pauseReleaseTimer !== null) {
      window.clearTimeout(this.pauseReleaseTimer);
      this.pauseReleaseTimer = null;
    }
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const trackChanged =
      this.activeContextId !== contextId ||
      this.activeTrackIndex !== trackIndex;

    this.activeContextId = contextId;
    this.activeTrackIndex = trackIndex;
    this.playing = true;

    if (this.padOscs.length === 0 || trackChanged) {
      this.buildVoicesForTrack(contextId, trackIndex);
    }

    this.applyOutputGain();
    this.restartChimeLoop();
    this.triggerGentleNote();
    return true;
  }

  public pause() {
    this.playing = false;
    if (this.switchDebounceTimer !== null) {
      window.clearTimeout(this.switchDebounceTimer);
      this.switchDebounceTimer = null;
    }
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    this.applyOutputGain();

    // Release active voices after smooth fade-out so no unused nodes remain running
    if (this.pauseReleaseTimer !== null) {
      window.clearTimeout(this.pauseReleaseTimer);
    }
    this.pauseReleaseTimer = window.setTimeout(() => {
      this.pauseReleaseTimer = null;
      if (!this.playing) {
        this.flushRetiringGroups();
        this.stopVoiceGroup(this.padOscs, this.activeWind);
        this.padOscs = [];
        this.activeWind = null;
      }
    }, 650);
  }

  /**
   * Transitions to the appropriate context/track with debouncing to prevent overlapping
   * audio during fast scrolling. Never starts playback if paused or muted/off.
   */
  public setTrack(
    contextId: MuseumAudioContextId,
    trackIndex: number,
    immediate = false
  ) {
    if (
      this.activeContextId === contextId &&
      this.activeTrackIndex === trackIndex
    ) {
      return;
    }

    this.activeContextId = contextId;
    this.activeTrackIndex = trackIndex;

    if (this.switchDebounceTimer !== null) {
      window.clearTimeout(this.switchDebounceTimer);
      this.switchDebounceTimer = null;
    }

    if (!this.playing || !this.ctx) {
      return;
    }

    const applySwitch = () => {
      if (!this.playing || !this.ctx) return;
      this.buildVoicesForTrack(this.activeContextId, this.activeTrackIndex);
      this.restartChimeLoop();
    };

    if (immediate) {
      applySwitch();
    } else {
      this.switchDebounceTimer = window.setTimeout(() => {
        this.switchDebounceTimer = null;
        applySwitch();
      }, 180);
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    this.applyOutputGain();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.applyOutputGain();
  }

  public dispose() {
    if (this.switchDebounceTimer !== null) {
      window.clearTimeout(this.switchDebounceTimer);
      this.switchDebounceTimer = null;
    }
    if (this.pauseReleaseTimer !== null) {
      window.clearTimeout(this.pauseReleaseTimer);
      this.pauseReleaseTimer = null;
    }
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    this.flushRetiringGroups();
    this.stopVoiceGroup(this.padOscs, this.activeWind);
    this.padOscs = [];
    this.activeWind = null;
    this.windBuffer = null;

    if (this.lfoOsc) {
      try {
        this.lfoOsc.stop();
        this.lfoOsc.disconnect();
      } catch {
        // ignore
      }
      this.lfoOsc = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}

export const ambientAudioEngine = new AmbientAudioEngine();
