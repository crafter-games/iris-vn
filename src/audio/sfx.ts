// Efectos de sonido sintetizados con Web Audio: sin archivos ni licencias.
// Buses: master → sfx / ui / music. Todo lo "dramático" pasa por una reverb larga.

type Ctx = {
  ac: AudioContext;
  master: GainNode;
  sfx: GainNode;
  ui: GainNode;
  music: GainNode;
  reverb: ConvolverNode;
  noise: AudioBuffer;
};

let ctx: Ctx | null = null;

const db = (value: number) => Math.pow(10, value / 20);

// Debe llamarse dentro de un gesto del usuario (clic/tap) para que el navegador permita audio.
export function unlockAudio() {
  if (ctx) {
    ctx.ac.resume();
    return;
  }
  const ac = new AudioContext();
  const master = ac.createGain();
  master.gain.value = db(-3);
  master.connect(ac.destination);

  const bus = (gainDb: number) => {
    const g = ac.createGain();
    g.gain.value = db(gainDb);
    g.connect(master);
    return g;
  };

  const reverb = ac.createConvolver();
  reverb.buffer = impulse(ac, 3.2, 2.6);
  const wet = ac.createGain();
  wet.gain.value = db(-8);
  reverb.connect(wet).connect(master);

  const noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  ctx = { ac, master, sfx: bus(0), ui: bus(-10), music: bus(-6), reverb, noise };
}

function impulse(ac: AudioContext, seconds: number, decay: number) {
  const length = Math.floor(ac.sampleRate * seconds);
  const buffer = ac.createBuffer(2, length, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return buffer;
}

// ——— Bloques básicos ———

function envelope(c: Ctx, at: number, peak: number, attack: number, release: number) {
  const g = c.ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
  return g;
}

function route(c: Ctx, node: AudioNode, bus: GainNode, wet = 0) {
  node.connect(bus);
  if (wet > 0) {
    const send = c.ac.createGain();
    send.gain.value = wet;
    node.connect(send).connect(c.reverb);
  }
}

function tone(
  c: Ctx,
  opts: {
    at: number;
    freq: number;
    to?: number;
    glide?: number;
    type?: OscillatorType;
    peak: number;
    attack?: number;
    release: number;
    bus?: GainNode;
    wet?: number;
    filter?: number;
  },
) {
  const osc = c.ac.createOscillator();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, opts.at);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, opts.at + (opts.glide ?? opts.release));
  const env = envelope(c, opts.at, opts.peak, opts.attack ?? 0.005, opts.release);
  let node: AudioNode = osc.connect(env);
  if (opts.filter) {
    const lp = c.ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = opts.filter;
    node = node.connect(lp);
  }
  route(c, node, opts.bus ?? c.sfx, opts.wet);
  osc.start(opts.at);
  osc.stop(opts.at + (opts.attack ?? 0.005) + opts.release + 0.05);
}

function noise(
  c: Ctx,
  opts: {
    at: number;
    duration: number;
    peak: number;
    type?: BiquadFilterType;
    freq: number;
    to?: number;
    q?: number;
    attack?: number;
    bus?: GainNode;
    wet?: number;
  },
) {
  const src = c.ac.createBufferSource();
  src.buffer = c.noise;
  src.loop = true;
  const filter = c.ac.createBiquadFilter();
  filter.type = opts.type ?? "bandpass";
  filter.Q.value = opts.q ?? 1;
  filter.frequency.setValueAtTime(opts.freq, opts.at);
  if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, opts.at + opts.duration);
  const env = envelope(c, opts.at, opts.peak, opts.attack ?? 0.003, opts.duration);
  route(c, src.connect(filter).connect(env), opts.bus ?? c.sfx, opts.wet);
  src.start(opts.at, Math.random());
  src.stop(opts.at + (opts.attack ?? 0.003) + opts.duration + 0.05);
}

// ——— Catálogo (claves = tabla de assets del GDD, sin el prefijo sfx_) ———

function hit(c: Ctx, at: number, peak: number) {
  tone(c, { at, freq: 150, to: 42, glide: 0.35, peak, release: 0.9, wet: 0.9, filter: 900 });
  tone(c, { at, freq: 75, to: 38, glide: 0.5, type: "triangle", peak: peak * 0.6, release: 1.1, wet: 0.6 });
  noise(c, { at, duration: 0.08, peak: peak * 0.5, type: "lowpass", freq: 1800, wet: 0.5 });
}

const sounds: Record<string, (c: Ctx, t: number) => void> = {
  // El "dodon": dos golpes graves, el segundo más fuerte.
  dodon(c, t) {
    hit(c, t, 0.55);
    hit(c, t + 0.19, 0.85);
  },

  // Verdad roja: golpe + campana metálica inarmónica con cola larga.
  red_truth(c, t) {
    hit(c, t, 0.6);
    for (const [ratio, peak] of [
      [1, 0.22],
      [2.76, 0.12],
      [5.4, 0.08],
      [8.93, 0.05],
    ]) {
      tone(c, { at: t + 0.02, freq: 392 * ratio, peak, release: 2.6, wet: 1 });
    }
  },

  glass_shatter(c, t) {
    noise(c, { at: t, duration: 0.35, peak: 0.5, type: "highpass", freq: 2500, wet: 0.5 });
    hit(c, t, 0.35);
    for (let i = 0; i < 26; i++) {
      const at = t + Math.random() * 0.7 * Math.random();
      tone(c, { at, freq: 2600 + Math.random() * 5200, peak: 0.05 + Math.random() * 0.08, release: 0.04 + Math.random() * 0.18, wet: 0.7 });
    }
  },

  riser(c, t) {
    noise(c, { at: t, duration: 2.2, peak: 0.28, freq: 200, to: 5000, q: 4, attack: 1.9, wet: 0.6 });
    tone(c, { at: t, freq: 60, to: 240, glide: 2.2, type: "sawtooth", peak: 0.12, attack: 2, release: 0.15, filter: 1400, wet: 0.5 });
  },

  stinger(c, t) {
    for (const freq of [110, 116.5, 164.8, 174.6]) {
      tone(c, { at: t, freq, type: "sawtooth", peak: 0.12, attack: 0.01, release: 1.6, filter: 1600, wet: 0.9 });
    }
    hit(c, t, 0.4);
  },

  heartbeat(c, t) {
    for (const [offset, peak] of [
      [0, 0.7],
      [0.22, 0.5],
    ]) {
      tone(c, { at: t + offset, freq: 70, to: 40, glide: 0.15, peak, release: 0.25, filter: 300 });
    }
  },

  static(c, t) {
    noise(c, { at: t, duration: 0.45, peak: 0.25, freq: 1200, to: 3200, q: 0.6 });
    for (let i = 0; i < 6; i++) {
      tone(c, { at: t + Math.random() * 0.4, freq: 80 + Math.random() * 2000, type: "square", peak: 0.04, release: 0.03 });
    }
  },

  clock(c, t) {
    noise(c, { at: t, duration: 0.03, peak: 0.3, freq: 3500, q: 6, bus: c.ui, wet: 0.3 });
  },

  whoosh(c, t) {
    noise(c, { at: t, duration: 0.55, peak: 0.25, freq: 2400, to: 300, q: 1.2, attack: 0.2 });
  },

  door(c, t) {
    tone(c, { at: t, freq: 90, to: 50, peak: 0.5, release: 0.35, filter: 400, wet: 0.4 });
    noise(c, { at: t, duration: 0.12, peak: 0.25, type: "lowpass", freq: 700 });
  },

  typing(c, t) {
    for (let i = 0; i < 7; i++) {
      noise(c, { at: t + i * 0.09 + Math.random() * 0.04, duration: 0.02, peak: 0.12, freq: 2800 + Math.random() * 1500, q: 3, bus: c.ui });
    }
  },

  notif(c, t) {
    tone(c, { at: t, freq: 880, peak: 0.25, release: 0.18, bus: c.ui, wet: 0.2 });
    tone(c, { at: t + 0.11, freq: 1320, peak: 0.25, release: 0.35, bus: c.ui, wet: 0.2 });
  },

  msg_received(c, t) {
    tone(c, { at: t, freq: 620, to: 780, glide: 0.06, peak: 0.25, release: 0.14, bus: c.ui });
  },

  msg_sent(c, t) {
    tone(c, { at: t, freq: 1040, to: 1400, glide: 0.05, peak: 0.16, release: 0.08, bus: c.ui });
  },

  msg_deleted(c, t) {
    tone(c, { at: t, freq: 900, to: 90, glide: 0.35, type: "square", peak: 0.1, release: 0.4, filter: 2200 });
    sounds.static(c, t + 0.05);
  },

  ui_click(c, t) {
    tone(c, { at: t, freq: 1800, to: 1200, glide: 0.03, peak: 0.12, release: 0.04, bus: c.ui });
  },

  ui_hover(c, t) {
    tone(c, { at: t, freq: 2400, peak: 0.04, release: 0.03, bus: c.ui });
  },
};

export function playSfx(key: string) {
  if (!ctx) return;
  const sound = sounds[key.replace(/^sfx_/, "")];
  if (!sound) {
    console.warn(`sfx desconocido: ${key}`);
    return;
  }
  sound(ctx, ctx.ac.currentTime + 0.01);
}
