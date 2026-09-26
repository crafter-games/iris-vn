import { getAudio, onAudioReady, type Ctx } from "./sfx";

// Música ambiental generativa (Web Audio, sin archivos): un "mood" por escena
// y capas de corrupción encima que ensucian lo que suene.

type Mood = {
  chords: number[][]; // notas MIDI
  chordSec: number;
  pad: { type: OscillatorType; gain: number; cutoff: number };
  bells?: { every: [number, number]; gain: number; octave: number; detune?: number };
  pulse?: { bpm: number; midi: number; gain: number; double?: boolean };
};

const MOODS: Record<string, Mood> = {
  title: {
    chords: [[45, 52, 57, 64]],
    chordSec: 16,
    pad: { type: "sine", gain: 0.05, cutoff: 900 },
    bells: { every: [3, 7], gain: 0.035, octave: 2 },
  },
  warm: {
    // Cmaj7 · Am7 · Fmaj7 · G6
    chords: [
      [48, 55, 59, 64],
      [45, 52, 55, 60],
      [41, 48, 52, 57],
      [43, 50, 55, 59],
    ],
    chordSec: 8,
    pad: { type: "triangle", gain: 0.045, cutoff: 1300 },
    bells: { every: [1.2, 2.8], gain: 0.04, octave: 2 },
  },
  uneasy: {
    chords: [
      [45, 52, 55, 60],
      [44, 51, 55, 60],
      [41, 48, 51, 56],
      [42, 49, 54, 57],
    ],
    chordSec: 10,
    pad: { type: "sawtooth", gain: 0.03, cutoff: 700 },
    bells: { every: [2.5, 5], gain: 0.03, octave: 2, detune: 18 },
  },
  office_night: {
    chords: [
      [38, 45, 50, 52, 57],
      [36, 43, 48, 50, 55],
    ],
    chordSec: 12,
    pad: { type: "sawtooth", gain: 0.028, cutoff: 600 },
    bells: { every: [4, 8], gain: 0.03, octave: 2 },
    pulse: { bpm: 66, midi: 26, gain: 0.18 },
  },
  horror: {
    chords: [
      [37, 38, 44, 49],
      [36, 37, 43, 48],
    ],
    chordSec: 14,
    pad: { type: "sawtooth", gain: 0.035, cutoff: 480 },
    bells: { every: [1.5, 4], gain: 0.035, octave: 3, detune: 40 },
    pulse: { bpm: 52, midi: 24, gain: 0.3, double: true },
  },
  confession: {
    // Am · F · C · G
    chords: [
      [45, 52, 57, 60],
      [41, 48, 53, 57],
      [48, 55, 60, 64],
      [43, 50, 55, 59],
    ],
    chordSec: 7,
    pad: { type: "sine", gain: 0.05, cutoff: 1000 },
    bells: { every: [0.8, 1.8], gain: 0.045, octave: 2 },
  },
};

const FADE_SEC = 2.5;
const LOOKAHEAD_SEC = 0.5;
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
const rand = (min: number, max: number) => min + Math.random() * (max - min);

class Player {
  private c: Ctx;
  private mood: Mood;
  readonly out: GainNode;
  private nextChord = 0;
  private chordIndex = 0;
  private nextBell = 0;
  private nextPulse = 0;
  private stopped = false;

  constructor(c: Ctx, mood: Mood) {
    this.c = c;
    this.mood = mood;
    this.out = c.ac.createGain();
    this.out.gain.value = 0;
    this.out.connect(c.music);
    const now = c.ac.currentTime;
    this.out.gain.setTargetAtTime(1, now, FADE_SEC / 3);
    this.nextChord = this.nextBell = this.nextPulse = now + 0.1;
  }

  stop() {
    this.stopped = true;
    const now = this.c.ac.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setTargetAtTime(0, now, FADE_SEC / 4);
    setTimeout(() => this.out.disconnect(), FADE_SEC * 2000);
  }

  // Programa las notas que caen dentro de la ventana de anticipación.
  schedule() {
    if (this.stopped) return;
    const horizon = this.c.ac.currentTime + LOOKAHEAD_SEC;
    const { mood } = this;
    while (this.nextChord < horizon) {
      this.padChord(mood.chords[this.chordIndex % mood.chords.length], this.nextChord);
      this.chordIndex++;
      this.nextChord += mood.chordSec;
    }
    if (mood.bells) {
      while (this.nextBell < horizon) {
        this.bell(this.nextBell);
        this.nextBell += rand(...mood.bells.every);
      }
    }
    if (mood.pulse) {
      while (this.nextPulse < horizon) {
        this.thump(this.nextPulse, mood.pulse.gain);
        if (mood.pulse.double) this.thump(this.nextPulse + 0.24, mood.pulse.gain * 0.7);
        this.nextPulse += 60 / mood.pulse.bpm;
      }
    }
  }

  private padChord(notes: number[], at: number) {
    const { ac } = this.c;
    const { pad, chordSec } = this.mood;
    const dur = chordSec + 3;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = pad.cutoff;
    filter.Q.value = 0.7;
    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.linearRampToValueAtTime(pad.gain, at + 2.5);
    env.gain.setValueAtTime(pad.gain, at + chordSec);
    env.gain.linearRampToValueAtTime(0.0001, at + dur);
    filter.connect(env).connect(this.out);
    const send = ac.createGain();
    send.gain.value = 0.35;
    env.connect(send).connect(this.c.reverb);
    for (const midi of notes) {
      for (const detune of [-6, 6]) {
        const osc = ac.createOscillator();
        osc.type = pad.type;
        osc.frequency.value = hz(midi);
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(at);
        osc.stop(at + dur + 0.1);
      }
    }
  }

  private bell(at: number) {
    const { ac } = this.c;
    const bells = this.mood.bells!;
    const chord = this.mood.chords[Math.max(0, this.chordIndex - 1) % this.mood.chords.length];
    const midi = chord[Math.floor(Math.random() * chord.length)] + 12 * bells.octave;
    for (const [ratio, gain] of [
      [1, bells.gain],
      [2.01, bells.gain * 0.3],
    ]) {
      const osc = ac.createOscillator();
      osc.frequency.value = hz(midi) * ratio;
      osc.detune.value = bells.detune ? rand(-bells.detune, bells.detune) : 0;
      const env = ac.createGain();
      env.gain.setValueAtTime(0.0001, at);
      env.gain.exponentialRampToValueAtTime(gain, at + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, at + 2.4);
      osc.connect(env).connect(this.out);
      const send = ac.createGain();
      send.gain.value = 0.8;
      env.connect(send).connect(this.c.reverb);
      osc.start(at);
      osc.stop(at + 2.5);
    }
  }

  private thump(at: number, gain: number) {
    const { ac } = this.c;
    const osc = ac.createOscillator();
    osc.frequency.setValueAtTime(hz(this.mood.pulse!.midi) * 2, at);
    osc.frequency.exponentialRampToValueAtTime(hz(this.mood.pulse!.midi), at + 0.12);
    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(gain, at + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
    osc.connect(env).connect(this.out);
    osc.start(at);
    osc.stop(at + 0.4);
  }
}

// Capas de corrupción: continuas, con volumen según el nivel (0–3).
class CorruptionLayers {
  private gains: GainNode[] = [];

  constructor(c: Ctx) {
    const { ac } = c;
    const layer = () => {
      const g = ac.createGain();
      g.gain.value = 0;
      g.connect(c.music);
      this.gains.push(g);
      return g;
    };

    // Nivel ≥1: zumbido grave con batido (dos senos casi iguales).
    const hum = layer();
    for (const f of [55, 55.7]) {
      const osc = ac.createOscillator();
      osc.frequency.value = f;
      osc.connect(hum);
      osc.start();
    }

    // Nivel ≥2: aire filtrado que barre lento, como respiración de servidores.
    const air = layer();
    const src = ac.createBufferSource();
    src.buffer = c.noise;
    src.loop = true;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 3;
    bp.frequency.value = 500;
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 350;
    lfo.connect(lfoGain).connect(bp.frequency);
    src.connect(bp).connect(air);
    src.start();
    lfo.start();

    // Nivel 3: un tono agudo desafinado que sube y baja.
    const whine = layer();
    const high = ac.createOscillator();
    high.frequency.value = 2960;
    const wobble = ac.createOscillator();
    wobble.frequency.value = 0.19;
    const wobbleGain = ac.createGain();
    wobbleGain.gain.value = 22;
    wobble.connect(wobbleGain).connect(high.frequency);
    high.connect(whine);
    high.start();
    wobble.start();
  }

  set(level: number, c: Ctx) {
    const targets = [
      [0, 0, 0],
      [0.05, 0, 0],
      [0.07, 0.05, 0],
      [0.09, 0.08, 0.008],
    ][Math.max(0, Math.min(3, level))];
    const now = c.ac.currentTime;
    this.gains.forEach((g, i) => g.gain.setTargetAtTime(targets[i], now, 1.5));
  }
}

let player: Player | null = null;
let layers: CorruptionLayers | null = null;
let currentMood = "";
let currentLevel = 0;

setInterval(() => player?.schedule(), 200);

export function playMood(name: string) {
  if (name === currentMood) return;
  currentMood = name;
  const c = getAudio();
  if (!c) return; // se aplica cuando el audio se habilite
  player?.stop();
  player = null;
  const mood = MOODS[name];
  if (mood) player = new Player(c, mood);
  else if (name && name !== "none") console.warn(`bgm desconocido: ${name}`);
}

export function setCorruptionAudio(level: number) {
  currentLevel = level;
  const c = getAudio();
  if (!c) return;
  layers ??= new CorruptionLayers(c);
  layers.set(level, c);
}

export function musicState() {
  return currentMood;
}

// Si el mood se pidió antes de habilitar el audio, arranca en cuanto se pueda.
onAudioReady((c) => {
  const pending = currentMood;
  currentMood = "";
  if (pending) playMood(pending);
  layers ??= new CorruptionLayers(c);
  layers.set(currentLevel, c);
});

