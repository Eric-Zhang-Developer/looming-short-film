// Named foley from doc 05's table. Each entry: (seed, opts?) => mono Float32Array at 48 kHz.
// The same seed always gives the same samples, so a cue repeated with one seed is sample-identical.
import { mulberry32 } from '../core/rng.js';
import { SR, noise, lowpass, highpass, bandpass, mixInto } from './synth.js';

const TAU = Math.PI * 2;
const gen = (sec, fn) => { const o = new Float32Array(Math.ceil(sec * SR)); for (let i = 0; i < o.length; i++) o[i] = fn(i / SR, i); return o; };
const decay = (buf, tau, a = 0.0005) => { for (let i = 0; i < buf.length; i++) { const t = i / SR; buf[i] *= Math.min(1, t / a) * Math.exp(-t / tau); } return buf; };
const scale = (buf, g) => { for (let i = 0; i < buf.length; i++) buf[i] *= g; return buf; };
const todo = (name) => () => { throw new Error(`foley '${name}' not implemented (later sound wave)`); };

// A lamp's rocker switch: a dry plastic snap (bright noise transient + two damped body modes),
// a smaller settle tick 11 ms later, then the bulb's filament "tink" as it heats, ~45 ms in, very quiet.
function lampClick(seed = 1) {
  const out = new Float32Array(Math.ceil(0.3 * SR));
  const snap = (at, g, s) => {
    mixInto(out, decay(bandpass(noise(s, 0.02), 3800, 0.9), 0.0016), at, g);
    mixInto(out, gen(0.04, (t) => Math.sin(TAU * 1750 * t) * Math.exp(-t / 0.004)), at, g * 0.45);
    mixInto(out, gen(0.04, (t) => Math.sin(TAU * 820 * t) * Math.exp(-t / 0.006)), at, g * 0.3);
  };
  snap(0, 1, seed);
  snap(0.011, 0.35, seed + 1);
  const tink = (t) => Math.sin(TAU * 6150 * t) + 0.5 * Math.sin(TAU * 9230 * t) + 0.3 * Math.sin(TAU * 12370 * t);
  mixInto(out, gen(0.2, (t) => tink(t) * Math.min(1, t / 0.002, (0.2 - t) / 0.02) * Math.exp(-t / 0.025)), 0.045, 0.05);
  return scale(out, 0.9);
}

// Pen cap: a soft friction slide, then a crisp pop of air with a little upward pitch.
function penUncap(seed = 1) {
  const out = new Float32Array(Math.ceil(0.25 * SR));
  const slide = highpass(noise(seed, 0.07), 2500);
  for (let i = 0; i < slide.length; i++) { const t = i / SR; slide[i] *= 0.06 * Math.sin(Math.PI * t / 0.07); }
  mixInto(out, slide, 0);
  let ph = 0;
  mixInto(out, gen(0.05, (t) => { ph += TAU * (900 + 9000 * t) / SR; return Math.sin(ph) * Math.min(1, t / 0.0005) * Math.exp(-t / 0.01); }), 0.07, 0.5);
  mixInto(out, decay(highpass(noise(seed + 1, 0.02), 3000), 0.002), 0.07, 0.4);
  return out;
}

// Ink drip: a wet "bloop" (sine sweeping 1300 → 350 Hz) over a low-passed noise blip.
function inkDrip(seed = 1) {
  let ph = 0;
  const out = gen(0.3, (t) => { ph += TAU * (350 + 950 * Math.exp(-t / 0.018)) / SR; return Math.sin(ph) * Math.min(1, t / 0.001) * Math.exp(-t / 0.05) * 0.6; });
  mixInto(out, decay(lowpass(noise(seed, 0.05), 1500), 0.008), 0, 0.5);
  return out;
}

// Paper rustle: band-passed noise (2–6 kHz) shaped by seeded crackle grains over a soft swell.
function paperRustle(seed = 1, { dur = 0.8 } = {}) {
  const r = mulberry32(seed), n = Math.ceil(dur * SR);
  const base = bandpass(noise(seed, dur), 3500, 0.6), shape = new Float32Array(n);
  for (let g = 0; g < dur * 60; g++) {            // ~60 grains/s at random times and levels
    const at = Math.floor(r() * n), lvl = 0.3 + 0.7 * r(), tau = 0.004 + 0.01 * r();
    for (let i = at; i < n && i < at + tau * 5 * SR; i++) shape[i] += lvl * Math.exp(-(i - at) / SR / tau);
  }
  for (let i = 0; i < n; i++) base[i] *= (0.15 + shape[i]) * Math.sin(Math.PI * i / n) * 0.5;
  return base;
}

// Fluorescent hum: 120 Hz mains buzz. A soft-clipped 120 Hz sine (odd harmonics) plus even harmonics
// and a faint 60 Hz. 400 samples per period at 48 kHz, so any length loops cleanly. Seed unused.
function fluorescentHum(seed = 1, { dur = 4 } = {}) {
  const w = TAU * 120 / SR;
  return gen(dur, (t, i) => {
    const buzz = Math.tanh(2.5 * Math.sin(w * i)) * 0.5;
    const ev = 0.25 * Math.sin(2 * w * i) + 0.12 * Math.sin(4 * w * i + 1) + 0.06 * Math.sin(8 * w * i + 2);
    return (buzz * 0.6 + ev + 0.1 * Math.sin(w * i / 2)) * Math.min(1, t / 0.05, (dur - t) / 0.05) * 0.25;
  });
}

export const FOLEY = {
  lampClick, penUncap, inkDrip, paperRustle, fluorescentHum,
  penScratch: todo('penScratch'),
  phoneHum: todo('phoneHum'),
  inkRoll: todo('inkRoll'),
  shadowGrowth: todo('shadowGrowth'),
  fridgeHum: todo('fridgeHum'),
  controllerClick: todo('controllerClick'),
  drill: todo('drill'),
  fluorescentFlicker: todo('fluorescentFlicker'),
  mopOnTile: todo('mopOnTile'),
  paperBoil: todo('paperBoil'),
  dawnBirds: todo('dawnBirds'),
};
