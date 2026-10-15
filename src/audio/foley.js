// Named foley from doc 05's table. One-shots: (seed) => mono Float32Array at 48 kHz.
// Beds built by snd-foley take a length: (seed, dur). The older paperRustle/fluorescentHum take (seed, { dur }).
// Each sound's output peak is its intended loudness relative to the others at cue gain 1.
// The same seed always gives the same samples, so a cue repeated with one seed is sample-identical.
import { mulberry32 } from '../core/rng.js';
import { SR, noise, lowpass, highpass, bandpass, mixInto, subSwell } from './synth.js';

const TAU = Math.PI * 2;
const gen = (sec, fn) => { const o = new Float32Array(Math.ceil(sec * SR)); for (let i = 0; i < o.length; i++) o[i] = fn(i / SR, i); return o; };
const decay = (buf, tau, a = 0.0005) => { for (let i = 0; i < buf.length; i++) { const t = i / SR; buf[i] *= Math.min(1, t / a) * Math.exp(-t / tau); } return buf; };
const scale = (buf, g) => { for (let i = 0; i < buf.length; i++) buf[i] *= g; return buf; };
const norm = (buf, peak) => { let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v)); return m ? scale(buf, peak / m) : buf; };
// Linear fade-out of f seconds and fade-in of fi seconds, in place, so no sound starts or ends on a hard edge.
const fade = (buf, f = 0.02, fi = f) => {
  const n = Math.min(buf.length / 2, f * SR), m = Math.min(buf.length / 2, fi * SR);
  for (let i = 0; i < n; i++) buf[buf.length - 1 - i] *= i / n;
  for (let i = 0; i < m; i++) buf[i] *= i / m;
  return buf;
};

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
  return fade(out, 0.02, 0);   // snd-foley: the tail used to stop on a step at 0.3 s
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


// ───────── snd-foley: the rest of doc 05's table ─────────

// (seed, dur) => bed. Handwriting: seeded strokes of 80–250 ms, short letter gaps and longer word gaps.
// Pen speed (a hump per stroke) sets loudness, brightness (2.2 kHz band → 5.5 kHz band) and the rate of
// paper-fiber ticks. Silent between strokes, so it starts and ends quiet.
function penScratch(seed = 1, dur = 3) {
  const r = mulberry32(seed), n = Math.ceil(dur * SR), speed = new Float32Array(n);
  for (let t = 0.05 + 0.1 * r(); t < dur - 0.3;) {
    const len = 0.08 + 0.17 * r(), v = 0.45 + 0.55 * r(), i0 = Math.round(t * SR), m = Math.round(len * SR);
    for (let i = 0; i < m && i0 + i < n; i++) speed[i0 + i] = v * Math.sin(Math.PI * i / m) ** 0.7;
    t += len + (r() < 0.18 ? 0.25 + 0.3 * r() : 0.015 + 0.05 * r());
  }
  const lo = bandpass(noise(seed, dur), 2200, 0.8), hi = bandpass(noise(seed + 1, dur), 5500, 0.9);
  const rt = mulberry32(seed + 2), ticks = new Float32Array(n);
  for (let i = 0; i < n; i++) if (rt() < speed[i] * 250 / SR) ticks[i] = (rt() < 0.5 ? -1 : 1) * (0.5 + rt());
  const tk = bandpass(ticks, 4200, 3);
  for (let i = 0; i < n; i++) { const s = speed[i]; lo[i] = s * ((1 - s) * lo[i] + s * hi[i]) + s * tk[i] * 2; }
  return norm(fade(lo, 0.01), 0.4);
}

// (seed, dur) => bed. The phone's cold glow: a very faint 7.9 kHz sine with a whisper of 11.85 kHz and a
// slow 0.7 Hz shimmer. Seed unused.
function phoneHum(seed = 1, dur = 4) {
  const out = gen(dur, (t) => (Math.sin(TAU * 7900 * t) + 0.15 * Math.sin(TAU * 11850 * t + 1)) * (1 + 0.1 * Math.sin(TAU * 0.7 * t)));
  return norm(fade(out, 0.15), 0.03);
}

// (seed, dur) => one-shot of length dur. The blob rolling: a dark squelchy noise bed with wet blips every
// 90–210 ms, each a small inkDrip-style sine falling to about a third of its start pitch.
function inkRoll(seed = 1, dur = 1.2) {
  const r = mulberry32(seed), out = highpass(lowpass(lowpass(noise(seed, dur), 450), 450), 40);
  for (let i = 0; i < out.length; i++) out[i] *= 0.6 + 0.4 * Math.sin(TAU * 4.5 * i / SR);
  for (let t = 0.03 + 0.05 * r(); t < dur - 0.15; t += 0.09 + 0.12 * r()) {
    const f0 = 500 + 600 * r(), g = 0.25 + 0.35 * r();
    let ph = 0;
    mixInto(out, gen(0.12, (u) => { ph += TAU * f0 * (0.35 + 0.65 * Math.exp(-u / 0.014)) / SR; return Math.sin(ph) * Math.min(1, u / 0.002) * Math.exp(-u / 0.025); }), t, g);
  }
  return norm(fade(out, 0.03), 0.5);
}

// (seed, dur) => one-shot of length dur. The shadow grows: a 45 Hz sub swell (attack over 60% of dur)
// under a soft, darkened paper rustle.
function shadowGrowth(seed = 1, dur = 2.5) {
  const out = subSwell({ hz: 45, dur, attack: dur * 0.6 });
  mixInto(out, norm(lowpass(paperRustle(seed, { dur }), 4500), 0.15), 0);
  return norm(out, 0.6);
}

// (seed, dur) => bed. A cartoon fridge compressor: 60 Hz plus harmonics, a 120.8 Hz partial beating against
// 120 Hz, a lumpy 0.8 Hz wobble, and a faint rattle (1.8 kHz noise pulsed at 30 Hz).
function fridgeHum(seed = 1, dur = 4) {
  const rat = bandpass(noise(seed, dur), 1800, 2), w = TAU * 60;
  const out = gen(dur, (t, i) => {
    const hum = 0.5 * Math.sin(w * t) + 0.35 * Math.sin(2 * w * t + 0.3) + 0.25 * Math.sin(3 * w * t) + 0.1 * Math.sin(5 * w * t) + 0.2 * Math.sin(TAU * 120.8 * t);
    return hum * (0.75 + 0.25 * Math.sin(TAU * 0.8 * t)) + rat[i] * 0.4 * (0.5 + 0.5 * Math.sin(TAU * 30 * t)) ** 4;
  });
  return norm(fade(out, 0.2), 0.35);
}

// (seed) => one-shot, ~0.9 s. Button mashing: 4–7 plastic presses, each a bright noise tick plus a damped
// 2.4–3.4 kHz body mode, and a quieter release tick 30–60 ms later.
function controllerClick(seed = 1) {
  const r = mulberry32(seed), out = new Float32Array(Math.ceil(0.9 * SR)), count = 4 + Math.floor(r() * 4);
  const press = (at, g, s, f) => {
    mixInto(out, decay(bandpass(noise(s, 0.01), 3000, 0.8), 0.0012), at, g);
    mixInto(out, gen(0.03, (t) => Math.sin(TAU * f * t) * Math.exp(-t / 0.003)), at, g * 0.5);
  };
  for (let k = 0, t = 0.01; k < count && t < 0.75; k++, t += 0.07 + 0.09 * r()) {
    const f = 2400 + 1000 * r(), g = 0.6 + 0.4 * r();
    press(t, g, seed + 2 * k, f);
    press(t + 0.03 + 0.03 * r(), g * 0.35, seed + 2 * k + 1, f * 1.15);
  }
  return norm(out, 0.6);
}

// (seed) => one-shot, 2.4 s. A cordless drill, two trigger pulls: a short "brr" then a long "BRRR".
// Motor speed follows the trigger with a fast spin-up and slower coast-down; the tone is a 6-harmonic
// buzz on a 40→300 Hz fundamental, plus brush noise (3–7 kHz) pulsing at the rotation rate.
function drill(seed = 1) {
  const revs = [[0.02, 0.32], [0.5, 1.7]], brush = lowpass(highpass(noise(seed, 2.4), 3000), 7000);
  let spd = 0, ph = 0;
  const out = gen(2.4, (t, i) => {
    const on = revs.some(([a, b]) => t >= a && t < b);
    spd += ((on ? 1 : 0) - spd) / ((on ? 0.08 : 0.18) * SR);
    ph += TAU * (40 + 260 * spd) / SR;
    let v = 0;
    for (let k = 1; k <= 6; k++) v += Math.sin(k * ph) / k;
    return spd ** 1.5 * (0.5 * v + 0.15 * brush[i] * (0.5 + 0.5 * Math.sin(ph)));
  });
  return norm(fade(out, 0.05), 0.6);
}

// (seed, dur) => one-shot of length dur. The Marston tubes flicker: the fluorescent buzz gated on and off in
// seeded 20–150 ms segments (2 ms smoothing), with a crackle of 3–8 sharp ticks at each strike.
function fluorescentFlicker(seed = 1, dur = 1.2) {
  const r = mulberry32(seed), n = Math.ceil(dur * SR), gate = new Float32Array(n), out = scale(fluorescentHum(seed, { dur }), 2);
  let on = false;
  for (let t = 0.03; t < dur;) {
    const seg = on ? 0.03 + 0.12 * r() : 0.02 + 0.08 * r();
    on = !on;
    if (on) {
      for (let i = Math.round(t * SR); i < Math.min(n, Math.round((t + seg) * SR)); i++) gate[i] = 1;
      for (let k = 0, m = 3 + Math.floor(r() * 6); k < m; k++) mixInto(out, decay(highpass(noise(seed + 10 + k + Math.round(t * 1000), 0.006), 2500), 0.0008), t + 0.015 * r(), 0.3 + 0.5 * r());
    }
    t += seg;
  }
  for (let i = 1; i < n; i++) gate[i] = gate[i - 1] + (gate[i] - gate[i - 1]) / (0.002 * SR);
  for (let i = 0; i < n; i++) out[i] *= 0.15 + 0.85 * gate[i];   // ticks ride on top; a faint hum stays when "off"
  return norm(fade(out, 0.01), 0.5);
}

// (seed, dur) => bed. The custodian's mop: a stroke every ~1.4 s (seeded ±0.15 s), alternating forward/back.
// Each stroke is a swish that crossfades a 700 Hz band into a 2.6 kHz band (back strokes the reverse),
// with a wet low squish and a soft 140 Hz thunk as the mop head lands.
function mopOnTile(seed = 1, dur = 6) {
  const r = mulberry32(seed), n = Math.ceil(dur * SR), out = new Float32Array(n);
  const lo = bandpass(noise(seed, dur), 700, 0.7), hi = bandpass(noise(seed + 1, dur), 2600, 0.8), wet = lowpass(noise(seed + 2, dur), 600);
  for (let k = 0, t = 0.1; t < dur - 0.5; k++, t += 1.25 + 0.3 * r()) {
    const len = Math.min(0.85 + 0.15 * r(), dur - t - 0.05), i0 = Math.round(t * SR), m = Math.round(len * SR);
    for (let i = 0; i < m && i0 + i < n; i++) {
      const p = i / m, e = Math.sin(Math.PI * p) ** 2 * (1 - 0.3 * p), x = k % 2 ? 1 - p : p, j = i0 + i;
      out[j] += e * ((1 - x) * lo[j] + x * hi[j]) + wet[j] * 0.8 * Math.exp(-p / 0.08) * Math.min(1, p / 0.01);
    }
    mixInto(out, gen(0.12, (u) => Math.sin(TAU * 140 * u) * Math.min(1, u / 0.003) * Math.exp(-u / 0.035)), t, 0.15);
  }
  return norm(fade(lowpass(out, 5000), 0.02), 0.45);   // a wet string mop is soft: nothing bright above 5 kHz
}

// (seed, dur) => bed. Paper boil: a faint high hiss with a slow drift, plus ~25 tiny crinkle grains per second,
// each 10 ms of noise band-passed at a random 2.5–6.5 kHz. Very low on purpose.
function paperBoil(seed = 1, dur = 4) {
  const r = mulberry32(seed), out = bandpass(noise(seed, dur), 4000, 0.5);
  for (let i = 0; i < out.length; i++) out[i] *= 0.12 * (0.7 + 0.3 * Math.sin(TAU * 0.23 * i / SR + 6 * r()) );
  for (let g = 0, m = Math.floor(dur * 25); g < m; g++)
    mixInto(out, decay(bandpass(noise(seed + 100 + g, 0.01), 2500 + 4000 * r(), 2), 0.0025), r() * (dur - 0.01), 0.2 + 0.8 * r());
  return norm(fade(out, 0.1), 0.08);
}

// (seed, dur) => bed. Two or three far-off birds: each phrase is 2–5 quick chirps sweeping down ~35% from
// 3–4.5 kHz with a 40 Hz flutter, low-passed for distance, plus two faint echoes off the buildings.
function dawnBirds(seed = 1, dur = 8) {
  const r = mulberry32(seed), dry = new Float32Array(Math.ceil(dur * SR)), count = 2 + (r() < 0.5 ? 1 : 0);
  for (let p = 0; p < count; p++) {
    let t = (p + 0.1 + 0.6 * r()) * (dur - 1.5) / count;
    for (let k = 0, m = 2 + Math.floor(r() * 4), f0 = 3000 + 1500 * r(); k < m; k++) {
      const len = 0.04 + 0.05 * r(), f = f0 * (0.95 + 0.1 * r());
      let ph = 0;
      mixInto(dry, gen(len, (u) => { ph += TAU * f * (1 - 0.35 * u / len) * (1 + 0.03 * Math.sin(TAU * 40 * u)) / SR; return Math.sin(ph) * Math.sin(Math.PI * u / len) ** 2; }), t, 0.6 + 0.4 * r());
      t += len + 0.04 + 0.04 * r();
    }
  }
  const out = lowpass(dry, 5000);
  mixInto(out, out.slice(), 0.12, 0.25);
  mixInto(out, out.slice(), 0.27, 0.1);
  return norm(fade(out, 0.05), 0.15);
}

// (seed, dur) => bed. Morning/quiet room tone: dark, steady air (noise low-passed twice at 500 Hz, rumble
// below 30 Hz removed) with a trace of 1.5 kHz air. Sits under the Birth and Quiet 2 sections.
function roomTone(seed = 1, dur = 4) {
  const out = highpass(lowpass(lowpass(noise(seed, dur), 500), 500), 30);
  mixInto(out, bandpass(noise(seed + 1, dur), 1500, 0.7), 0, 0.03);
  return norm(fade(out, 0.3), 0.06);
}

// (seed, dur) => bed. Night hum for the Button: a darker room tone (250 Hz) with a distant appliance's
// 60 and 120 Hz breathing slowly at 0.15 Hz.
function nightHum(seed = 1, dur = 4) {
  const air = highpass(lowpass(lowpass(noise(seed, dur), 250), 250), 30);
  const out = gen(dur, (t, i) => air[i] + (0.04 * Math.sin(TAU * 60 * t) + 0.025 * Math.sin(TAU * 120 * t)) * (0.8 + 0.2 * Math.sin(TAU * 0.15 * t)));
  return norm(fade(out, 0.3), 0.07);
}

// (seed, dur) => bed. The shadow's breathing in Quiet 1: a 48 Hz sine and a breath of noise below 250 Hz,
// both swelling and ebbing on a 4.5 s cycle that starts at zero.
function shadowBreath(seed = 1, dur = 6) {
  const air = lowpass(lowpass(noise(seed, dur), 250), 250);
  const out = gen(dur, (t, i) => (0.5 - 0.5 * Math.cos(TAU * t / 4.5)) * (Math.sin(TAU * 48 * t) + 2 * air[i]));
  return norm(fade(out, 0.3), 0.5);
}

export const FOLEY = {
  lampClick, penUncap, inkDrip, paperRustle, fluorescentHum,
  penScratch, phoneHum, inkRoll, shadowGrowth, fridgeHum, controllerClick, drill,
  fluorescentFlicker, mopOnTile, paperBoil, dawnBirds, roomTone, nightHum, shadowBreath,
};
