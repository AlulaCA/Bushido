import type { RenderedTrackAudio, SongTrack, StemKey } from '../types/studio';

const SAMPLE_RATE = 44100;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function parseMusicalKey(keyStr: string): { rootMidi: number; isMinor: boolean } {
  const cleaned = (keyStr || 'Am').trim();
  const isMinor = /m(in)?$/i.test(cleaned) && !/maj/i.test(cleaned);
  const noteMatch = cleaned.match(/^([A-Ga-g])([#b]?)/);
  const baseMap: Record<string, number> = {
    C: 48,
    D: 50,
    E: 52,
    F: 53,
    G: 55,
    A: 45,
    B: 47,
  };
  let rootMidi = 45; // A2 default
  if (noteMatch) {
    const letter = noteMatch[1].toUpperCase();
    const accidental = noteMatch[2];
    rootMidi = baseMap[letter] ?? 45;
    if (accidental === '#') rootMidi += 1;
    if (accidental === 'b') rootMidi -= 1;
  }
  return { rootMidi, isMinor };
}

type GenreProfile = 'synthwave' | 'lofi' | 'rock' | 'jazz';

function detectGenreProfile(style: string): GenreProfile {
  const s = style.toLowerCase();
  if (/breakbeat|jungle|amen|big beat|lofi|lo-fi|chill|hiphop|hip-hop|boom|r&b|ambient|sleep/.test(s)) return 'lofi';
  if (/jazz|acoustic|unplugged|fingerpicking|soul|bossa|blues|folk|coffeehouse|suling/.test(s)) return 'jazz';
  if (/metal|gamelan|taiko|rock|pop jawa|campursari|pop|indie|punk|ethnic|guitar/.test(s)) return 'rock';
  return 'synthwave';
}

function createNoiseBuffer(ctx: BaseAudioContext, durationSec: number, rand: () => number): AudioBuffer {
  const length = Math.ceil(ctx.sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = rand() * 2 - 1;
  }
  return buffer;
}

function extractLyricDensity(lyrics: string): number[] {
  const lines = lyrics
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('['));
  if (lines.length === 0) return [4, 6, 5, 7, 4, 6, 8, 5];
  return lines.slice(0, 16).map((line) => Math.max(2, Math.min(10, line.split(/\s+/).length)));
}

export function computeWaveformPeaks(buffer: AudioBuffer, numBars = 120): number[] {
  const ch0 = buffer.getChannelData(0);
  const ch1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : ch0;
  const blockSize = Math.max(1, Math.floor(ch0.length / numBars));
  const peaks: number[] = [];
  let maxPeak = 0.001;

  for (let i = 0; i < numBars; i++) {
    const start = i * blockSize;
    const end = Math.min(ch0.length, start + blockSize);
    let peak = 0;
    const step = Math.max(1, Math.floor((end - start) / 40));
    for (let j = start; j < end; j += step) {
      const v = (Math.abs(ch0[j]) + Math.abs(ch1[j])) * 0.5;
      if (v > peak) peak = v;
    }
    peaks.push(peak);
    if (peak > maxPeak) maxPeak = peak;
  }

  return peaks.map((p) => Math.min(1, Math.max(0.06, p / maxPeak)));
}

async function renderDrumsStem(
  durationSec: number,
  bpm: number,
  profile: GenreProfile,
  isCloudQuality: boolean,
  seed: number
): Promise<AudioBuffer> {
  const rand = mulberry32(seed + 101);
  const ctx = new OfflineAudioContext(2, Math.ceil(durationSec * SAMPLE_RATE), SAMPLE_RATE);
  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  const noiseBuf = createNoiseBuffer(ctx, 0.4, rand);
  const beatDur = 60 / bpm;
  const sixteenth = beatDur / 4;
  const totalSixteenths = Math.floor(durationSec / sixteenth);

  const triggerKick = (time: number, accent = 1) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const startFreq = profile === 'lofi' ? 115 : 145;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.085);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.65 * accent, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.3);
  };

  const triggerSnare = (time: number, accent = 1) => {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = profile === 'lofi' ? 1400 : 2100;
    filter.Q.value = 0.9;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.32 * accent, time);
    nGain.gain.exponentialRampToValueAtTime(0.001, time + (isCloudQuality ? 0.2 : 0.14));
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(master);
    noise.start(time);
    noise.stop(time + 0.22);

    const body = ctx.createOscillator();
    const bGain = ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(195, time);
    body.frequency.exponentialRampToValueAtTime(110, time + 0.07);
    bGain.gain.setValueAtTime(0.24 * accent, time);
    bGain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
    body.connect(bGain);
    bGain.connect(master);
    body.start(time);
    body.stop(time + 0.12);
  };

  const triggerHat = (time: number, open: boolean, accent = 1) => {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = profile === 'jazz' ? 5800 : 7200;
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner();
    pan.pan.value = open ? 0.18 : -0.12;
    gain.gain.setValueAtTime(0.14 * accent, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.19 : 0.045));
    noise.connect(hp);
    hp.connect(gain);
    gain.connect(pan);
    pan.connect(master);
    noise.start(time);
    noise.stop(time + (open ? 0.21 : 0.06));
  };

  for (let step = 0; step < totalSixteenths; step++) {
    const stepInBar = step % 16;
    const swingOffset =
      profile === 'lofi' || profile === 'jazz'
        ? step % 2 === 1
          ? sixteenth * 0.22
          : 0
        : 0;
    const t = step * sixteenth + swingOffset;
    if (t >= durationSec - 0.1) break;

    if (profile === 'synthwave') {
      if (stepInBar % 4 === 0) triggerKick(t, 1);
      if (stepInBar === 4 || stepInBar === 12) triggerSnare(t, 1);
      if (stepInBar % 2 === 0) triggerHat(t, stepInBar === 10, stepInBar % 4 === 2 ? 0.9 : 0.55);
    } else if (profile === 'lofi') {
      if (stepInBar === 0 || stepInBar === 7 || stepInBar === 10) triggerKick(t, stepInBar === 0 ? 1 : 0.78);
      if (stepInBar === 4 || stepInBar === 12) triggerSnare(t, 0.85);
      if (stepInBar % 2 === 0) triggerHat(t, false, 0.48 + rand() * 0.2);
    } else if (profile === 'jazz') {
      if (stepInBar === 0 || stepInBar === 10) triggerKick(t, 0.7);
      if (stepInBar === 4 || stepInBar === 12) triggerSnare(t, 0.55);
      if (stepInBar === 0 || stepInBar === 4 || stepInBar === 7 || stepInBar === 8 || stepInBar === 12 || stepInBar === 15) {
        triggerHat(t, stepInBar === 7 || stepInBar === 15, 0.7);
      }
    } else {
      // rock / pop
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 8) triggerKick(t, stepInBar === 0 ? 1 : 0.85);
      if (stepInBar === 4 || stepInBar === 12) triggerSnare(t, 1);
      if (stepInBar % 2 === 0) triggerHat(t, stepInBar === 14, 0.72);
    }
  }

  return ctx.startRendering();
}

async function renderBassStem(
  durationSec: number,
  bpm: number,
  chords: number[][],
  profile: GenreProfile,
  isCloudQuality: boolean
): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, Math.ceil(durationSec * SAMPLE_RATE), SAMPLE_RATE);
  const master = ctx.createGain();
  master.gain.value = 0.75;
  master.connect(ctx.destination);

  const beatDur = 60 / bpm;
  const barDur = beatDur * 4;
  const eighth = beatDur / 2;
  const totalBars = Math.ceil(durationSec / barDur);

  for (let bar = 0; bar < totalBars; bar++) {
    const chord = chords[bar % chords.length];
    const rootMidi = chord[0] - 12;
    const fifthMidi = rootMidi + 7;
    const octMidi = rootMidi + 12;

    const steps = profile === 'synthwave' || profile === 'rock' ? 8 : 4;
    const stepDur = barDur / steps;

    for (let s = 0; s < steps; s++) {
      const t = bar * barDur + s * stepDur;
      if (t >= durationSec - 0.08) break;

      let note = rootMidi;
      if (profile === 'synthwave' && s % 2 === 1) note = octMidi;
      if (profile === 'jazz') note = [rootMidi, rootMidi + 4, fifthMidi, octMidi][s % 4];
      if (profile === 'lofi' && s === 2) note = fifthMidi;
      if (profile === 'lofi' && s === 1) continue;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = profile === 'lofi' || profile === 'jazz' ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(midiToFreq(note), t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isCloudQuality ? 480 : 360, t);
      filter.frequency.exponentialRampToValueAtTime(160, t + stepDur * 0.85);

      const noteLen = Math.min(stepDur * 0.88, eighth * 1.7);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteLen);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc.start(t);
      osc.stop(t + noteLen + 0.02);
    }
  }

  return ctx.startRendering();
}

async function renderOtherStem(
  durationSec: number,
  bpm: number,
  chords: number[][],
  profile: GenreProfile,
  isCloudQuality: boolean
): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, Math.ceil(durationSec * SAMPLE_RATE), SAMPLE_RATE);
  const master = ctx.createGain();
  master.gain.value = 0.65;
  master.connect(ctx.destination);

  const beatDur = 60 / bpm;
  const barDur = beatDur * 4;
  const totalBars = Math.ceil(durationSec / barDur);

  for (let bar = 0; bar < totalBars; bar++) {
    const chord = chords[bar % chords.length];
    const barStart = bar * barDur;
    const padDur = Math.min(barDur, durationSec - barStart);
    if (padDur <= 0.1) break;

    // Warm chord pad voices
    chord.forEach((midi, idx) => {
      const voices = isCloudQuality ? [-7, 7] : [0];
      voices.forEach((detuneCents, vIdx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        const pan = ctx.createStereoPanner();

        osc.type = profile === 'lofi' || profile === 'jazz' ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(midiToFreq(midi + 12), barStart);
        osc.detune.value = detuneCents;

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(profile === 'synthwave' ? 1600 : 1100, barStart);

        pan.pan.value = ((idx % 2 === 0 ? -0.35 : 0.35) + (vIdx === 0 ? -0.15 : 0.15)) * (isCloudQuality ? 1 : 0.3);

        gain.gain.setValueAtTime(0.001, barStart);
        gain.gain.linearRampToValueAtTime(0.11 / voices.length, barStart + 0.18);
        gain.gain.setValueAtTime(0.095 / voices.length, barStart + padDur - 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, barStart + padDur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(pan);
        pan.connect(master);

        osc.start(barStart);
        osc.stop(barStart + padDur + 0.02);
      });
    });

    // Rhythmic arpeggio / pluck texture
    const arpSteps = profile === 'synthwave' ? 8 : 4;
    const stepDur = barDur / arpSteps;
    for (let s = 0; s < arpSteps; s++) {
      const t = barStart + s * stepDur;
      if (t >= durationSec - 0.08) break;
      const arpNote = chord[s % chord.length] + 24;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(midiToFreq(arpNote), t);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.frequency.exponentialRampToValueAtTime(480, t + stepDur * 0.7);
      pan.pan.value = s % 2 === 0 ? -0.3 : 0.3;

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + stepDur * 0.75);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(pan);
      pan.connect(master);
      osc.start(t);
      osc.stop(t + stepDur * 0.8);
    }
  }

  return ctx.startRendering();
}

async function renderVocalsStem(
  durationSec: number,
  bpm: number,
  chords: number[][],
  scaleIntervals: number[],
  rootMidi: number,
  lyricDensity: number[],
  isCloudQuality: boolean,
  seed: number
): Promise<AudioBuffer> {
  const rand = mulberry32(seed + 404);
  const ctx = new OfflineAudioContext(2, Math.ceil(durationSec * SAMPLE_RATE), SAMPLE_RATE);
  const master = ctx.createGain();
  master.gain.value = 0.7;
  master.connect(ctx.destination);

  const beatDur = 60 / bpm;
  const barDur = beatDur * 4;
  const totalBars = Math.ceil(durationSec / barDur);

  for (let bar = 0; bar < totalBars; bar++) {
    const density = lyricDensity[bar % lyricDensity.length] ?? 5;
    const notesInBar = Math.max(3, Math.min(8, density));
    const slotDur = (barDur * 0.86) / notesInBar;
    const barChord = chords[bar % chords.length];

    for (let n = 0; n < notesInBar; n++) {
      // Leave natural breathing space between vocal phrases
      if (n === notesInBar - 1 && rand() > 0.65) continue;

      const t = bar * barDur + n * slotDur;
      if (t >= durationSec - 0.15) break;

      const deg = scaleIntervals[Math.floor(rand() * scaleIntervals.length)];
      const anchor = barChord[n % barChord.length] + 12;
      const targetMidi = n === 0 ? anchor : rootMidi + 24 + deg;
      const freq = midiToFreq(targetMidi);
      const noteLen = slotDur * (0.72 + rand() * 0.18);

      const carrier = ctx.createOscillator();
      const subHarmonic = ctx.createOscillator();
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      const formant1 = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();

      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(freq * 0.985, t);
      carrier.frequency.exponentialRampToValueAtTime(freq, t + 0.035);

      subHarmonic.type = 'sine';
      subHarmonic.frequency.setValueAtTime(freq, t);

      vibrato.type = 'sine';
      vibrato.frequency.value = 5.4;
      vibratoGain.gain.setValueAtTime(0, t);
      vibratoGain.gain.linearRampToValueAtTime(isCloudQuality ? 4.2 : 2.2, t + noteLen * 0.45);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(carrier.frequency);
      vibratoGain.connect(subHarmonic.frequency);

      // Vowel-like formant sweep
      formant1.type = 'bandpass';
      formant1.Q.value = 2.4;
      formant1.frequency.setValueAtTime(650 + rand() * 550, t);
      formant1.frequency.linearRampToValueAtTime(850 + rand() * 450, t + noteLen * 0.7);

      pan.pan.value = isCloudQuality ? (rand() - 0.5) * 0.12 : 0;

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.26, t + 0.045);
      gain.gain.setValueAtTime(0.22, t + Math.max(0.05, noteLen - 0.06));
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteLen);

      carrier.connect(formant1);
      subHarmonic.connect(formant1);
      formant1.connect(gain);
      gain.connect(pan);
      pan.connect(master);

      carrier.start(t);
      subHarmonic.start(t);
      vibrato.start(t);
      carrier.stop(t + noteLen + 0.03);
      subHarmonic.stop(t + noteLen + 0.03);
      vibrato.stop(t + noteLen + 0.03);
    }
  }

  return ctx.startRendering();
}

function mixStemsIntoMaster(stems: Record<StemKey, AudioBuffer>): AudioBuffer {
  const ref = stems.vocals;
  const ctx = new OfflineAudioContext(2, ref.length, ref.sampleRate);
  const out = new AudioBuffer({
    numberOfChannels: 2,
    length: ref.length,
    sampleRate: ref.sampleRate,
  });

  const weights: Record<StemKey, number> = {
    vocals: 0.9,
    drums: 0.9,
    bass: 0.85,
    other: 0.8,
  };

  for (let ch = 0; ch < 2; ch++) {
    const outData = out.getChannelData(ch);
    const keys: StemKey[] = ['vocals', 'drums', 'bass', 'other'];
    for (const key of keys) {
      const stemData = stems[key].getChannelData(Math.min(ch, stems[key].numberOfChannels - 1));
      const w = weights[key];
      for (let i = 0; i < outData.length; i++) {
        outData[i] += stemData[i] * w;
      }
    }
    // Soft limiting to prevent clipping
    for (let i = 0; i < outData.length; i++) {
      outData[i] = Math.tanh(outData[i] * 0.72);
    }
  }
  void ctx;
  return out;
}

export async function renderTrackStems(track: SongTrack): Promise<RenderedTrackAudio> {
  const { rootMidi, isMinor } = parseMusicalKey(track.musicalKey);
  const scaleIntervals = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const chords = isMinor
    ? [
        [rootMidi, rootMidi + 3, rootMidi + 7],
        [rootMidi + 8, rootMidi + 12, rootMidi + 15],
        [rootMidi + 3, rootMidi + 7, rootMidi + 10],
        [rootMidi + 7, rootMidi + 10, rootMidi + 14],
      ]
    : [
        [rootMidi, rootMidi + 4, rootMidi + 7],
        [rootMidi + 7, rootMidi + 11, rootMidi + 14],
        [rootMidi + 9, rootMidi + 12, rootMidi + 16],
        [rootMidi + 5, rootMidi + 9, rootMidi + 12],
      ];

  const profile = detectGenreProfile(track.style);
  const isCloud = track.qualityMode === 'bf16-cloud';
  const lyricDensity = extractLyricDensity(track.lyrics);

  const renderSilentVocals = async (): Promise<AudioBuffer> => {
    const silentCtx = new OfflineAudioContext(2, Math.ceil(track.durationSec * SAMPLE_RATE), SAMPLE_RATE);
    return silentCtx.startRendering();
  };

  const [vocals, drums, bass, other] = await Promise.all([
    track.instrumentalOnly
      ? renderSilentVocals()
      : renderVocalsStem(
          track.durationSec,
          track.bpm,
          chords,
          scaleIntervals,
          rootMidi,
          lyricDensity,
          isCloud,
          track.seed
        ),
    renderDrumsStem(track.durationSec, track.bpm, profile, isCloud, track.seed),
    renderBassStem(track.durationSec, track.bpm, chords, profile, isCloud),
    renderOtherStem(track.durationSec, track.bpm, chords, profile, isCloud),
  ]);

  const stems: Record<StemKey, AudioBuffer> = { vocals, drums, bass, other };
  const master = mixStemsIntoMaster(stems);

  return {
    trackId: track.id,
    master,
    stems,
    masterPeaks: computeWaveformPeaks(master, 140),
    stemPeaks: {
      vocals: computeWaveformPeaks(vocals, 48),
      drums: computeWaveformPeaks(drums, 48),
      bass: computeWaveformPeaks(bass, 48),
      other: computeWaveformPeaks(other, 48),
    },
  };
}

export function encodeAudioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const numSamples = buffer.length;
  const blockAlign = numChannels * (bitDepth / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;

  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const clamped = Math.max(-1, Math.min(1, channels[ch][i]));
      const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export function downloadWavFromBuffer(buffer: AudioBuffer, fileName: string): void {
  const blob = encodeAudioBufferToWav(buffer);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.wav') ? fileName : `${fileName}.wav`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
