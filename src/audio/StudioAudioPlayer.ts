import type { MixerState, RenderedTrackAudio, StemKey } from '../types/studio';

const STEM_KEYS: StemKey[] = ['vocals', 'drums', 'bass', 'other'];

export class StudioAudioPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private stemGains: Partial<Record<StemKey, GainNode>> = {};
  private stemAnalysers: Partial<Record<StemKey, AnalyserNode>> = {};
  private activeSources: AudioBufferSourceNode[] = [];

  private currentAudio: RenderedTrackAudio | null = null;
  private useStemsMode = false;
  private isPlaying = false;
  private startCtxTime = 0;
  private offsetSec = 0;
  private masterVolume = 0.85;
  private mixerState: MixerState = {
    vocals: { volume: 0.9, muted: false, solo: false },
    drums: { volume: 0.9, muted: false, solo: false },
    bass: { volume: 0.85, muted: false, solo: false },
    other: { volume: 0.8, muted: false, solo: false },
  };

  private rafId: number | null = null;
  private onTimeUpdateCb?: (currentTime: number, playing: boolean) => void;
  private onMeterUpdateCb?: (levels: { master: number } & Record<StemKey, number>) => void;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;

      this.masterAnalyser = this.ctx.createAnalyser();
      this.masterAnalyser.fftSize = 256;

      this.masterGain.connect(this.masterAnalyser);
      this.masterAnalyser.connect(this.ctx.destination);

      for (const key of STEM_KEYS) {
        const g = this.ctx.createGain();
        const a = this.ctx.createAnalyser();
        a.fftSize = 256;
        g.connect(a);
        a.connect(this.masterGain);
        this.stemGains[key] = g;
        this.stemAnalysers[key] = a;
      }
      this.applyMixerGains();
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setCallbacks(
    onTimeUpdate: (currentTime: number, playing: boolean) => void,
    onMeterUpdate: (levels: { master: number } & Record<StemKey, number>) => void
  ): void {
    this.onTimeUpdateCb = onTimeUpdate;
    this.onMeterUpdateCb = onMeterUpdate;
  }

  public loadTrack(audio: RenderedTrackAudio, stemsSplit: boolean, resetPosition = true): void {
    const wasPlaying = this.isPlaying;
    this.stopSourcesOnly();
    this.currentAudio = audio;
    this.useStemsMode = stemsSplit;
    if (resetPosition) {
      this.offsetSec = 0;
      this.isPlaying = false;
      this.onTimeUpdateCb?.(0, false);
    } else if (wasPlaying) {
      void this.play(this.offsetSec);
    }
  }

  public setStemsMode(stemsSplit: boolean): void {
    if (this.useStemsMode === stemsSplit) return;
    const curTime = this.getCurrentTime();
    const wasPlaying = this.isPlaying;
    this.useStemsMode = stemsSplit;
    if (wasPlaying) {
      void this.play(curTime);
    }
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.015);
    }
  }

  public setMixerState(next: MixerState): void {
    this.mixerState = next;
    this.applyMixerGains();
  }

  private applyMixerGains(): void {
    if (!this.ctx) return;
    const anySolo = STEM_KEYS.some((k) => this.mixerState[k].solo);
    for (const key of STEM_KEYS) {
      const ch = this.mixerState[key];
      const gainNode = this.stemGains[key];
      if (!gainNode) continue;

      const audible = !ch.muted && (!anySolo || ch.solo);
      const targetGain = audible ? ch.volume : 0;
      gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.012);
    }
  }

  public getCurrentTime(): number {
    if (!this.currentAudio) return 0;
    if (!this.isPlaying || !this.ctx) return this.offsetSec;
    const elapsed = this.ctx.currentTime - this.startCtxTime;
    return Math.min(this.currentAudio.master.duration, this.offsetSec + elapsed);
  }

  public async play(fromSec?: number): Promise<void> {
    if (!this.currentAudio) return;
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.stopSourcesOnly();
    const duration = this.currentAudio.master.duration;
    let startOffset = fromSec !== undefined ? fromSec : this.offsetSec;
    if (startOffset >= duration - 0.05) {
      startOffset = 0;
    }

    this.offsetSec = Math.max(0, startOffset);
    const when = ctx.currentTime + 0.02;
    this.startCtxTime = when;

    if (this.useStemsMode) {
      this.applyMixerGains();
      for (const key of STEM_KEYS) {
        const src = ctx.createBufferSource();
        src.buffer = this.currentAudio.stems[key];
        const dest = this.stemGains[key] ?? this.masterGain!;
        src.connect(dest);
        src.start(when, this.offsetSec);
        this.activeSources.push(src);
      }
    } else {
      const src = ctx.createBufferSource();
      src.buffer = this.currentAudio.master;
      src.connect(this.masterGain!);
      src.start(when, this.offsetSec);
      this.activeSources.push(src);
    }

    this.isPlaying = true;
    this.onTimeUpdateCb?.(this.offsetSec, true);
    this.startLoop();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    this.offsetSec = this.getCurrentTime();
    this.stopSourcesOnly();
    this.isPlaying = false;
    this.stopLoop();
    this.onTimeUpdateCb?.(this.offsetSec, false);
    this.emitZeroMeters();
  }

  public stop(): void {
    this.stopSourcesOnly();
    this.isPlaying = false;
    this.offsetSec = 0;
    this.stopLoop();
    this.onTimeUpdateCb?.(0, false);
    this.emitZeroMeters();
  }

  public seekTo(seconds: number): void {
    if (!this.currentAudio) return;
    const clamped = Math.max(0, Math.min(this.currentAudio.master.duration, seconds));
    if (this.isPlaying) {
      void this.play(clamped);
    } else {
      this.offsetSec = clamped;
      this.onTimeUpdateCb?.(clamped, false);
    }
  }

  private stopSourcesOnly(): void {
    for (const src of this.activeSources) {
      try {
        src.onended = null;
        src.stop();
        src.disconnect();
      } catch {
        // Already stopped
      }
    }
    this.activeSources = [];
  }

  private computeRms(analyser: AnalyserNode | undefined): number {
    if (!analyser) return 0;
    const buf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const norm = (buf[i] - 128) / 128;
      sum += norm * norm;
    }
    return Math.min(1, Math.sqrt(sum / buf.length) * 2.8);
  }

  private emitZeroMeters(): void {
    this.onMeterUpdateCb?.({
      master: 0,
      vocals: 0,
      drums: 0,
      bass: 0,
      other: 0,
    });
  }

  private startLoop(): void {
    this.stopLoop();
    const tick = () => {
      if (!this.isPlaying || !this.currentAudio) return;
      const cur = this.getCurrentTime();
      const dur = this.currentAudio.master.duration;

      if (cur >= dur - 0.02) {
        this.stop();
        return;
      }

      this.onTimeUpdateCb?.(cur, true);
      this.onMeterUpdateCb?.({
        master: this.computeRms(this.masterAnalyser ?? undefined),
        vocals: this.useStemsMode ? this.computeRms(this.stemAnalysers.vocals) : 0,
        drums: this.useStemsMode ? this.computeRms(this.stemAnalysers.drums) : 0,
        bass: this.useStemsMode ? this.computeRms(this.stemAnalysers.bass) : 0,
        other: this.useStemsMode ? this.computeRms(this.stemAnalysers.other) : 0,
      });

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public dispose(): void {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
