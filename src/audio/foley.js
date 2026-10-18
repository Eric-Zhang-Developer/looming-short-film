// Named foley from doc 05's table. One-shots: (seed) => mono Float32Array at 48 kHz.
// Beds and sized one-shots take a length: (seed, dur), dur in seconds; omit it for the sound's default length.
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

// The ceiling fluorescent's motion sensor waking (docs/05-sound.md, README §3), 0.65 s. The wake's strikes are at +0.042, +0.167
// and +0.292: a relay clack on the beat (lampClick's snap, pitched down, with a short metallic tail), a faint tick on each of the
// first two strikes, a glassy ping as the third catches, and the tube's 120 Hz hum rising under it over ~0.3 s to the bed's level
// (cues.js: fluorescentHum at 0.15 / this cue's 0.8), so it hands over to the bed at +0.65. Both wakes use the one seed.
function sensorWake(seed = 1) {
  const out = new Float32Array(Math.ceil(0.65 * SR));
  const snap = (at, g, s) => {
    mixInto(out, decay(bandpass(noise(s, 0.02), 2400, 0.9), 0.0018), at, g);
    mixInto(out, gen(0.05, (t) => Math.sin(TAU * 1100 * t) * Math.exp(-t / 0.005)), at, g * 0.45);
    mixInto(out, gen(0.05, (t) => Math.sin(TAU * 520 * t) * Math.exp(-t / 0.008)), at, g * 0.3);
  };
  snap(0, 1, seed);
  snap(0.014, 0.4, seed + 1);
  mixInto(out, gen(0.15, (t) => (Math.sin(TAU * 3170 * t) + 0.6 * Math.sin(TAU * 4410 * t)) * Math.min(1, t / 0.001) * Math.exp(-t / 0.03)), 0.004, 0.12);  // metal tail
  mixInto(out, decay(highpass(noise(seed + 2, 0.01), 3000), 0.001), 0.042, 0.18);
  mixInto(out, decay(highpass(noise(seed + 3, 0.01), 3000), 0.001), 0.167, 0.15);
  mixInto(out, gen(0.4, (t) => (Math.sin(TAU * 2480 * t) + 0.5 * Math.sin(TAU * 3720 * t) + 0.25 * Math.sin(TAU * 5900 * t)) * Math.min(1, t / 0.001) * Math.exp(-t / 0.12)), 0.292, 0.3);  // ping
  norm(out, 0.5);                                            // the clack stays a little under lampClick's 0.57, the film's loudest transient
  const w = TAU * 120 / SR;                                  // fluorescentHum's waveform, unfaded, phase from the wake frame
  mixInto(out, gen(0.65, (t, i) => {
    const k = Math.min(1, Math.max(0, (t - 0.08) / 0.3)), rise = k * k * (3 - 2 * k), buzz = Math.tanh(2.5 * Math.sin(w * i)) * 0.5;
    const ev = 0.25 * Math.sin(2 * w * i) + 0.12 * Math.sin(4 * w * i + 1) + 0.06 * Math.sin(8 * w * i + 2);
    return (buzz * 0.6 + ev + 0.1 * Math.sin(w * i / 2)) * 0.25 * (0.15 / 0.8) * rise;
  }), 0);
  return out;
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
function paperRustle(seed = 1, dur = 0.8) {
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
function fluorescentHum(seed = 1, dur = 4) {
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
  return norm(fade(scratch(seed, dur, speed), 0.01), 0.4);
}
// The pen's sound for a given speed curve (0..1 per sample, length ceil(dur * SR)), unnormalized.
function scratch(seed, dur, speed) {
  const n = speed.length, lo = bandpass(noise(seed, dur), 2200, 0.8), hi = bandpass(noise(seed + 1, dur), 5500, 0.9);
  const rt = mulberry32(seed + 2), ticks = new Float32Array(n);
  for (let i = 0; i < n; i++) if (rt() < speed[i] * 250 / SR) ticks[i] = (rt() < 0.5 ? -1 : 1) * (0.5 + rt());
  const tk = bandpass(ticks, 4200, 3);
  for (let i = 0; i < n; i++) { const s = speed[i]; lo[i] = s * ((1 - s) * lo[i] + s * hi[i]) + s * tk[i] * 2; }
  return lo;
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
  mixInto(out, norm(lowpass(paperRustle(seed, dur), 4500), 0.15), 0);
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

// (seed, dur) => one-shot of length dur (default 1.34 s, s07's whirr windows). A cordless drill, one trigger pull:
// a fast spin-up, held, released 0.25 s before the end to coast down. A seeded load wobble (the bit biting) keeps two
// pulls from sounding alike. The tone is a 6-harmonic buzz on a 40→300 Hz fundamental, plus brush noise (3–7 kHz)
// pulsing at the rotation rate.
function drill(seed = 1, dur = 1.34) {
  const r = mulberry32(seed), brush = lowpass(highpass(noise(seed, dur), 3000), 7000), off = Math.max(0.1, dur - 0.25);
  const wf = 2.5 + 2 * r(), wp = TAU * r();
  let spd = 0, ph = 0;
  const out = gen(dur, (t, i) => {
    const on = t < off;
    spd += ((on ? 1 - 0.12 * (0.5 + 0.5 * Math.sin(TAU * wf * t + wp)) : 0) - spd) / ((on ? 0.08 : 0.18) * SR);
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
  const r = mulberry32(seed), n = Math.ceil(dur * SR), gate = new Float32Array(n), out = scale(fluorescentHum(seed, dur), 2);
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

// (seed, dur) => bed. The custodian's mop: one wet swish every 0.5 s exactly, starting at 0 (s14: 0.5 + 0.5n), so a cue
// on a beat lands its swishes on the spec's grid. Strokes alternate forward/back; each swish crossfades a 700 Hz band into
// a 2.6 kHz band (back strokes the reverse), with a wet low squish and a soft 140 Hz thunk as the mop head lands.
function mopOnTile(seed = 1, dur = 6) {
  const r = mulberry32(seed), n = Math.ceil(dur * SR), out = new Float32Array(n);
  const lo = bandpass(noise(seed, dur), 700, 0.7), hi = bandpass(noise(seed + 1, dur), 2600, 0.8), wet = lowpass(noise(seed + 2, dur), 600);
  for (let k = 0, t = 0; t < dur - 0.2; k++, t = k * 0.5) {
    const len = Math.min(0.4 + 0.05 * r(), dur - t - 0.02), i0 = Math.round(t * SR), m = Math.round(len * SR);
    for (let i = 0; i < m && i0 + i < n; i++) {
      const p = i / m, e = Math.sin(Math.PI * p) ** 2 * (1 - 0.3 * p), x = k % 2 ? 1 - p : p, j = i0 + i;
      out[j] += e * ((1 - x) * lo[j] + x * hi[j]) + wet[j] * 0.8 * Math.exp(-p / 0.12) * Math.min(1, p / 0.02);
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

// (seed, dur) => bed (default 10 s, s12). The shadow's breathing in Quiet 1: a 45 Hz sine and a breath of noise below
// 250 Hz, following the blob's breath (s12: period 5 s, peaks at 1.25 and 6.25 s), then holding its 6.0 s level.
function shadowBreath(seed = 1, dur = 10) {
  const air = lowpass(lowpass(noise(seed, dur), 250), 250), breath = (t) => 0.5 + 0.5 * Math.cos(TAU * (Math.min(t, 6) - 1.25) / 5);
  const out = gen(dur, (t, i) => breath(t) * (Math.sin(TAU * 45 * t) + 2 * air[i]));
  return norm(fade(out, 0.3), 0.5);
}


// ───────── snd-foley-2: the shot specs' sounds doc 05 doesn't list ─────────

// TV speaker: nothing below 300 Hz or above 4.5 kHz.
const tv = (buf) => lowpass(lowpass(highpass(buf, 300), 4500), 4500);
// A few odd harmonics of f: a soft 8-bit square, no aliasing.
const square = (ph) => Math.sin(ph) + Math.sin(3 * ph) / 3 + Math.sin(5 * ph) / 5 + Math.sin(7 * ph) / 7;

// (seed) => one-shot, 0.06 s. s03's thumb flick on the phone glass: a tiny bright tick and a whisper of skin.
function thumbFlick(seed = 1) {
  const out = decay(bandpass(noise(seed, 0.06), 4500, 1.5), 0.0007);
  mixInto(out, decay(highpass(noise(seed + 1, 0.03), 3000), 0.008, 0.004), 0, 0.08);
  return norm(fade(out, 0.005, 0), 0.3);
}

// (seed) => one-shot, 0.12 s. s08's scroll tick: a 60 ms thumb drag on glass ending in a soft, duller tick.
function scrollTick(seed = 1) {
  const out = new Float32Array(Math.ceil(0.12 * SR)), drag = bandpass(noise(seed, 0.06), 3200, 0.7);
  for (let i = 0; i < drag.length; i++) drag[i] *= Math.sin(Math.PI * i / drag.length) * 0.15;
  mixInto(out, drag, 0);
  mixInto(out, decay(bandpass(noise(seed + 1, 0.04), 2200, 1.2), 0.0015), 0.055, 1);
  return norm(fade(out, 0.01, 0), 0.3);
}

// (seed) => one-shot, 0.5 s. s04's jar clink: two glass jars touching, a seeded 1.9–2.6 kHz partial set
// (×1, 2.32, 3.86, 5.1, higher ones dying faster) with a small impact tick, then a lighter second touch 25–45 ms later.
function jarClink(seed = 1) {
  const r = mulberry32(seed), out = new Float32Array(Math.ceil(0.5 * SR)), f0 = 1900 + 700 * r();
  const hit = (at, g, s) => {
    const parts = [[1, 1, 0.22], [2.32, 0.6, 0.12], [3.86, 0.4, 0.07], [5.1, 0.25, 0.04]];
    mixInto(out, gen(0.4, (t) => parts.reduce((v, [m, a, tau]) => v + a * Math.sin(TAU * f0 * m * t) * Math.exp(-t / tau), 0) * Math.min(1, t / 0.0004, (0.4 - t) / 0.15)), at, g);   // tapered, so the ring never stops on a step
    mixInto(out, decay(highpass(noise(s, 0.01), 4000), 0.0008), at, g * 0.5);
  };
  hit(0, 1, seed);
  hit(0.025 + 0.02 * r(), 0.35, seed + 1);
  return norm(fade(out, 0.05, 0), 0.45);
}

// (seed) => one-shot, 0.35 s. s04's carton slosh: a soft cardboard thump, then liquid noise whose band moves low → mid
// → low (250, 650, 300 Hz crossfaded) with two or three rising glug bubbles.
function cartonSlosh(seed = 1) {
  const r = mulberry32(seed), d = 0.35, n = Math.ceil(d * SR), out = new Float32Array(n);
  const bands = [250, 650, 300].map((f, k) => bandpass(noise(seed + k, d), f, 2));
  for (let i = 0; i < n; i++) {
    const p = i / n, e = Math.sin(Math.PI * p) ** 1.5, x = 2 * p;
    out[i] = e * (x < 1 ? (1 - x) * bands[0][i] + x * bands[1][i] : (2 - x) * bands[1][i] + (x - 1) * bands[2][i]) * 2;
  }
  mixInto(out, gen(0.08, (t) => Math.sin(TAU * 120 * t) * Math.min(1, t / 0.002) * Math.exp(-t / 0.02)), 0, 0.5);
  for (let k = 0, m = 2 + (r() < 0.5 ? 1 : 0); k < m; k++) {
    const f = 300 + 300 * r(); let ph = 0;
    mixInto(out, gen(0.05, (t) => { ph += TAU * f * (1 + 6 * t) / SR; return Math.sin(ph) * Math.sin(Math.PI * t / 0.05); }), 0.08 + 0.2 * r(), 0.3);
  }
  return norm(fade(lowpass(out, 2000), 0.02), 0.4);   // liquid in cardboard is dull: nothing bright
}

// (seed, dur) => bed. s05's TV game bloops through the TV speaker: seeded 8-bit blips (40–110 ms, C-major pentatonic
// from C5 to C7, every 60–300 ms), about a third of them jump-sweeps up an octave.
function tvBloops(seed = 1, dur = 4) {
  const r = mulberry32(seed), out = new Float32Array(Math.ceil(dur * SR)), PENT = [0, 2, 4, 7, 9];
  for (let t = 0.02 + 0.1 * r(); t < dur - 0.15; t += 0.06 + 0.24 * r()) {
    const midi = 72 + 12 * Math.floor(r() * 2) + PENT[Math.floor(r() * 5)], f = 440 * 2 ** ((midi - 69) / 12);
    const len = 0.04 + 0.07 * r(), sweep = r() < 0.33;
    let ph = 0;
    mixInto(out, gen(len, (u) => { ph += TAU * f * (sweep ? 1 + u / len : 1) / SR; return square(ph) * Math.min(1, u / 0.003, (len - u) / 0.008); }), t, 0.5 + 0.5 * r());
    t += len;
  }
  return norm(fade(tv(out), 0.02), 0.3);
}

// (seed) => one-shot, 0.12 s. s05's roommate footstep: a soft paper foot on a paper floor, a low thud (noise under
// 700 Hz) with a light 2 kHz paper tap on top.
function roommateStep(seed = 1) {
  const out = decay(highpass(lowpass(lowpass(noise(seed, 0.12), 700), 700), 40), 0.018, 0.003);
  mixInto(out, decay(bandpass(noise(seed + 1, 0.03), 2000, 1.2), 0.004), 0.002, 0.25);
  return norm(fade(out, 0.02, 0), 0.4);
}

// (seed) => one-shot, 0.9 s. s05's TV "win": an 8-bit C-major arpeggio up (C6 E6 G6, 70 ms each), then C7 + E7 held
// 0.45 s with a 7 Hz vibrato, through the TV speaker. A game sound, not score. Seed unused.
function winJingle(seed = 1) {
  const out = new Float32Array(Math.ceil(0.9 * SR)), hz = (m) => 440 * 2 ** ((m - 69) / 12);
  const note = (m, at, len, vib) => {
    let ph = 0;
    mixInto(out, gen(len, (u) => { ph += TAU * hz(m) * (1 + vib * 0.012 * Math.sin(TAU * 7 * u)) / SR; return square(ph) * Math.min(1, u / 0.003, (len - u) / 0.02); }), at, 0.5);
  };
  [84, 88, 91].forEach((m, k) => note(m, k * 0.07, 0.07, 0));
  note(96, 0.21, 0.45, 1); note(100, 0.21, 0.45, 1);
  return norm(fade(tv(out), 0.05, 0), 0.4);
}

// (seed) => one-shot, 0.4 s. s07's ladder creak: wood stick-slip, a pulse train whose rate sweeps a seeded 25 → 70 Hz,
// each pulse ringing body modes at about 550, 1200 and 2300 Hz.
function ladderCreak(seed = 1) {
  const r = mulberry32(seed), d = 0.4, n = Math.ceil(d * SR), pulses = new Float32Array(n), f0 = 25 + 10 * r(), f1 = 55 + 15 * r();
  for (let t = 0.01; t < d - 0.03; t += 1 / (f0 + (f1 - f0) * t / d) * (0.9 + 0.2 * r())) pulses[Math.round(t * SR)] = (0.6 + 0.4 * r()) * Math.sin(Math.PI * t / d);
  const out = new Float32Array(n);
  for (const [f, q, g] of [[550 * (0.9 + 0.2 * r()), 8, 1], [1200 * (0.9 + 0.2 * r()), 10, 0.7], [2300, 12, 0.35]]) mixInto(out, bandpass(pulses, f, q), 0, g);
  return norm(fade(lowpass(out, 3500), 0.03), 0.45);   // wood, not a click track: the pulses' leak above 3.5 kHz goes
}

// (seed) => one-shot, 0.5 s. s07's curtain rod snapping into its bracket: a sharp click, the rod's inharmonic metal ring
// (1150, 3170, 6200 Hz), and a small rattle 18 ms later.
function rodSnap(seed = 1) {
  const out = new Float32Array(Math.ceil(0.5 * SR));
  const hit = (at, g, s) => {
    mixInto(out, decay(bandpass(noise(s, 0.015), 3000, 0.9), 0.001), at, g);
    mixInto(out, gen(0.45, (t) => (Math.sin(TAU * 1150 * t) * Math.exp(-t / 0.15) + 0.6 * Math.sin(TAU * 3170 * t) * Math.exp(-t / 0.08) + 0.3 * Math.sin(TAU * 6200 * t) * Math.exp(-t / 0.04)) * Math.min(1, t / 0.0005, (0.45 - t) / 0.15)), at, g * 0.35);
  };
  hit(0, 1, seed);
  hit(0.018, 0.3, seed + 1);
  return norm(fade(out, 0.05, 0), 0.6);
}

// (seed, dur) => one-shot of length dur (default 0.67 s, s07's swish windows). A curtain drawn along its rod: fabric
// noise (1.2 kHz and 3.5 kHz bands) swelling and ebbing, with seeded ring scrapes (~18/s, 5 kHz ticks) on the rod.
function curtainSwish(seed = 1, dur = 0.67) {
  const r = mulberry32(seed), n = Math.ceil(dur * SR), out = bandpass(noise(seed, dur), 1200, 0.5), hi = bandpass(noise(seed + 1, dur), 3500, 0.7);
  for (let i = 0; i < n; i++) out[i] = (out[i] + 0.5 * hi[i]) * Math.sin(Math.PI * i / n) ** 1.5;
  for (let k = 0, m = Math.floor(dur * 18); k < m; k++) mixInto(out, decay(bandpass(noise(seed + 10 + k, 0.01), 5000, 3), 0.002), (0.1 + 0.8 * r()) * dur, 0.15 + 0.15 * r());
  return norm(fade(out, 0.02), 0.35);
}

// (seed) => one-shot, 0.2 s. s15's card tap: the phone laid face down on the desk, a soft 180 Hz cardstock thud with a
// dull tap (noise under 2.5 kHz) and a lighter settle tap 30 ms later.
function cardTap(seed = 1) {
  const out = new Float32Array(Math.ceil(0.2 * SR));
  const tap = (at, g, s) => {
    mixInto(out, gen(0.1, (t) => Math.sin(TAU * 180 * t) * Math.min(1, t / 0.001) * Math.exp(-t / 0.025)), at, g * 0.6);
    mixInto(out, decay(lowpass(noise(s, 0.03), 2500), 0.004), at, g);
  };
  tap(0, 1, seed);
  tap(0.03, 0.35, seed + 1);
  return norm(fade(out, 0.03, 0), 0.4);
}


// ───────── snd-g4: the G4 cut's new sounds (doc 05, marked "new") ─────────
// The same toolkit as above (seeded noise, biquads, a few sines), and the same habit: every sound gets one small
// physical joke (the motor that wobbles, the ratchet that rises, the clock that tocks lower) so it reads as animated.

// (seed) => one-shot, 0.33 s. s00's notification: a phone's vibration motor rattling on a wooden desk. The motor is a
// soft-clipped ~165 Hz buzz that spins up from 110 Hz and wobbles ±3% at 11 Hz (a cheap motor); the desk answers each
// motor cycle with a knock through two wood modes (280 Hz, 1.1 kHz) and a bright tick on top, and the phone skitters
// once (a louder knock) just before the motor stops. Physical, not a UI chime.
function phoneBuzz(seed = 1) {
  const r = mulberry32(seed), d = 0.33, n = Math.ceil(d * SR), knocks = new Float32Array(n);
  let ph = 0;
  const motor = gen(d, (t, i) => {
    const f = (110 + 55 * Math.min(1, t / 0.03)) * (1 + 0.03 * Math.sin(TAU * 11 * t));
    const p0 = ph; ph += f / SR;
    if (Math.floor(ph) > Math.floor(p0)) knocks[i] = 0.4 + 0.6 * r();     // one desk knock per motor turn
    return Math.tanh(3 * Math.sin(TAU * ph));
  });
  knocks[Math.round(0.27 * SR)] = 2.2;                                    // the skitter
  const desk = bandpass(knocks, 280, 2);
  mixInto(desk, bandpass(knocks, 1100, 3), 0, 0.6);
  mixInto(desk, highpass(knocks, 4000), 0, 0.15);
  const hum = lowpass(motor, 900), out = gen(d, (t, i) => (0.25 * hum[i] + desk[i]) * Math.min(1, t / 0.015, (d - t) / 0.04));
  return norm(out, 0.5);
}

// (seed) => one-shot, ~0.15 s. The laptop game's voice: a soft key tick, then a small cheerful square-wave blip (the game
// answering), through a laptop speaker (nothing under 500 Hz). The seed picks everything, so a tap is repeatable:
// note = C major pentatonic step seed % 6; a seed with seed % 7 === 3 jumps up a fifth halfway (a power-up).
// Register by the seed's hundreds: 0xx C5 (home), 1xx C6 (s05, higher, under the TV), 2xx C4 (s08, sleepy: longer, softer, sagging).
function gameBlip(seed = 1) {
  const r = mulberry32(seed), reg = Math.floor(seed / 100) % 3, sleepy = reg === 2;
  const midi = [72, 84, 60][reg] + [0, 2, 4, 7, 9, 12][seed % 6], jump = seed % 7 === 3, f = 440 * 2 ** ((midi - 69) / 12);
  const len = (0.05 + 0.04 * r()) * (sleepy ? 1.6 : 1), out = new Float32Array(Math.ceil((len + 0.03) * SR));
  mixInto(out, decay(bandpass(noise(seed, 0.01), 3500, 1.5), 0.0008), 0, 0.5);           // the key
  let ph = 0;
  mixInto(out, gen(len, (u) => {
    ph += TAU * f * (jump && u > len / 2 ? 1.5 : 1) * (sleepy ? 1 - 0.06 * u / len : 1) / SR;
    return square(ph) * Math.min(1, u / (sleepy ? 0.008 : 0.002), (len - u) / 0.01);
  }), 0.012, 0.6);
  return norm(fade(lowpass(highpass(out, 500), 7000), 0.01, 0), 0.5);
}

// (seed) => one-shot, 0.36 s. s07's roller blind coming down: the spring roller's ratchet over 0.2 s, its pawl clicks
// speeding up (24 ms apart down to 8) and rising in pitch (2.2 → 3.6 kHz) like a cartoon zip, over a swell of fabric
// noise; then at BLIND_CLACK the bottom bar's soft clack on the sill (a dull thump, 420 Hz and 1.15 kHz modes) and one
// small bounce. Cue it at offset -BLIND_CLACK so the clack lands on the beat. One seed, so both blinds are identical.
export const BLIND_CLACK = 0.2;
function blindRattle(seed = 1) {
  const r = mulberry32(seed), out = new Float32Array(Math.ceil(0.36 * SR));
  for (let t = 0.004, k = 0; t < BLIND_CLACK - 0.006; k++) {
    const p = t / BLIND_CLACK, f = 2200 + 1400 * p;
    mixInto(out, decay(bandpass(noise(seed + 10 + k, 0.01), f, 1.5), 0.0012), t, 0.35 + 0.35 * p);
    mixInto(out, gen(0.02, (u) => Math.sin(TAU * f * 0.55 * u) * Math.exp(-u / 0.003)), t, 0.12);
    t += (0.024 - 0.016 * p) * (0.9 + 0.2 * r());
  }
  const cloth = bandpass(noise(seed, BLIND_CLACK), 900, 0.7);
  for (let i = 0; i < cloth.length; i++) cloth[i] *= 0.25 * Math.sin(Math.PI * i / cloth.length);
  mixInto(out, cloth, 0);
  const clack = (at, g, s) => {
    mixInto(out, decay(lowpass(noise(s, 0.03), 1800), 0.006), at, g);
    mixInto(out, gen(0.12, (u) => (Math.sin(TAU * 420 * u) * Math.exp(-u / 0.015) + 0.5 * Math.sin(TAU * 1150 * u) * Math.exp(-u / 0.008)) * Math.min(1, u / 0.0005)), at, g * 0.7);
  };
  clack(BLIND_CLACK, 1, seed + 1);
  clack(BLIND_CLACK + 0.035, 0.25, seed + 2);
  return norm(fade(out, 0.03, 0), 0.5);
}

// (seed, dur) => one-shot of length dur (default 0.15 s). One quick, hard pen stroke: penScratch's sound at full speed
// from the first millisecond. The crossing-out (a fix, not anger), the check marks and s18's X.
function penStroke(seed = 1, dur = 0.15) {
  const n = Math.ceil(dur * SR), speed = new Float32Array(n);
  for (let i = 0; i < n; i++) speed[i] = Math.sin(Math.PI * i / n) ** 0.3;
  return norm(fade(scratch(seed, dur, speed), 0.005), 0.5);
}

// (seed) => one-shot, 0.08 s. s16's pen tap in the pause: the tip on paper (a 3 kHz tick) and the desk under it (650 Hz).
function penTap(seed = 1) {
  const out = decay(bandpass(noise(seed, 0.08), 3000, 1.2), 0.0015);
  mixInto(out, gen(0.06, (t) => Math.sin(TAU * 650 * t) * Math.exp(-t / 0.006)), 0, 0.4);
  return norm(fade(out, 0.01, 0), 0.3);
}

// A far-away version of a sound for the exam room: darker, with two slap echoes off the walls.
const far = (buf, hz = 2500) => { const o = lowpass(buf, hz); mixInto(o, o.slice(), 0.07, 0.3); mixInto(o, o.slice(), 0.16, 0.15); return o; };

// (seed, dur) => bed. s17b's exam room: a large quiet room's air (darker and wider than roomTone), a distant page turn
// every 1.5-3.5 s, and now and then a far pen. The wall clock and the cough are their own sounds (clockTick, cough), so
// the room can duck at testRecognise while the clock goes on.
function examHush(seed = 1, dur = 4) {
  const r = mulberry32(seed), out = highpass(lowpass(lowpass(noise(seed, dur), 700), 700), 40);
  scale(out, 0.5);
  for (let t = 0.3 + r(), k = 0; t < dur - 0.5; t += 1.5 + 2 * r(), k++) mixInto(out, far(paperRustle(seed + 20 + k, 0.35)), t, 0.3 + 0.3 * r());
  for (let t = 0.8 + 2 * r(), k = 0; t < dur - 1.3; t += 2.5 + 3 * r(), k++) mixInto(out, far(penScratch(seed + 40 + k, 0.6 + 0.6 * r()), 2000), t, 0.12);
  return norm(fade(out, 0.05), 0.07);
}

// snd-v4: the wall clock (README §13) is one paper-and-wood tick, the same buffer everywhere (doc 05). It ignores its seed
// on purpose, so no cue can make a second clock. The tick: a dry escapement snap, the paper disc's wooden body answering
// (420 Hz case knock, 1.15 and 2.65 kHz modes) and a grain of paper on top. The joke is the second hand's overshoot
// (README §13: one frame of +1.5°, back the next): a small, slightly higher rebound tick one frame later, 1/24 s.
// Placed one cue per whole second of global time (cues.js), so it shares the pulse's 0.5 s grid. (G4's exam-room clock
// bed, a 4.5 kHz tick/tock, is replaced: doc 05 v4 makes s17b's clock this buffer.)
const TICK_SEED = 0x71c4;
function clockTick() {
  const out = new Float32Array(Math.ceil(0.12 * SR));
  const tick = (at, g, k, s) => {
    mixInto(out, decay(bandpass(noise(s, 0.01), 3200 * k, 1.4), 0.0006), at, g);
    for (const [f, tau, a] of [[420, 0.010, 0.35], [1150, 0.006, 0.6], [2650, 0.003, 0.4]])
      mixInto(out, gen(0.05, (t) => Math.sin(TAU * f * k * t) * Math.exp(-t / tau)), at, g * a);
    mixInto(out, decay(bandpass(noise(s + 1, 0.006), 5200, 2), 0.002), at + 0.003, g * 0.25);
  };
  tick(0, 1, 1, TICK_SEED);
  tick(1 / 24, 0.28, 1.12, TICK_SEED + 2);
  return norm(fade(out, 0.01, 0), 0.9);
}
// Distance is filtering, never a different tick: s08 C2 a little further; the room through his door (s08 C3, s09a, s09b);
// the exam room's reverb (s17b: far()'s two slaps plus a short darkening tail).
const roomy = (b, sec) => { const o = new Float32Array(Math.ceil(sec * SR)); o.set(b); return o; };
const clockTickMid = () => lowpass(clockTick(), 4000);
const clockTickFar = () => { const o = far(roomy(clockTick(), 0.3), 2200); mixInto(o, lowpass(o.slice(), 1500), 0.03, 0.4); return o; };
const clockTickExam = () => {
  const o = far(roomy(clockTick(), 0.6), 3500), dry = o.slice(0, Math.round(0.1 * SR));
  for (let k = 1; k <= 6; k++) mixInto(o, lowpass(dry, 2500 - 250 * k), 0.035 * k, 0.5 ** k);
  return o;
};

// The walk's pulse (doc 05, s09c): the tick an octave down (played at half speed) on a soft low thump. The dub is the same
// buffer, lighter (score.js). A heartbeat built from the clock.
function pulse() {
  const t2 = clockTick(), out = new Float32Array(Math.ceil(0.3 * SR));
  for (let i = 0; i < 2 * t2.length - 2; i++) { const j = i / 2, k = Math.floor(j); out[i] = 0.6 * (t2[k] + (j - k) * (t2[k + 1] - t2[k])); }
  let ph = 0;
  mixInto(out, gen(0.25, (t) => { ph += TAU * (48 + 50 * Math.exp(-t / 0.025)) / SR; return Math.sin(ph) * Math.min(1, t / 0.003) * Math.exp(-t / 0.06); }), 0, 0.8);
  mixInto(out, decay(lowpass(lowpass(noise(TICK_SEED + 9, 0.08), 220), 220), 0.02, 0.002), 0, 2.5);
  return norm(fade(out, 0.03, 0), 0.9);
}

// (seed) => one-shot, 0.6 s. One soft cough across the exam room: two noise bursts shaped by three vocal-tract bands
// (450, 1400, 2600 Hz), a sharp onset each, the second smaller, 0.18 s apart; then far().
function cough(seed = 1) {
  const out = new Float32Array(Math.ceil(0.6 * SR));
  const burst = (at, g, s, len) => {
    const x = noise(s, len), y = bandpass(x, 450, 3);
    mixInto(y, bandpass(x, 1400, 4), 0, 0.6);
    mixInto(y, bandpass(x, 2600, 5), 0, 0.3);
    for (let i = 0; i < y.length; i++) { const t = i / SR; y[i] *= Math.min(1, t / 0.004) * Math.exp(-t / (len * 0.35)); }
    mixInto(out, y, at, g);
  };
  burst(0, 1, seed, 0.14);
  burst(0.18, 0.55, seed + 1, 0.12);
  return norm(fade(far(out), 0.05, 0), 0.25);
}

// (seed) => one-shot, 0.5 s. s17c's grade coming back: a sheet slid across a table. Friction noise whose band climbs with
// the slide's speed (1.4 → 3 kHz), then at 0.42 s the skid: stick-slip chatter (pulses 70 → 40 Hz through a 900 Hz
// body) and a soft stop.
function paperSlide(seed = 1) {
  const r = mulberry32(seed), d = 0.5, n = Math.ceil(d * SR), out = new Float32Array(n), skid = 0.42;
  const speed = (t) => t < skid ? Math.sin(Math.PI / 2 * t / skid) : Math.max(0, 1 - (t - skid) / 0.06);
  const lo = bandpass(noise(seed, d), 1400, 0.6), hi = bandpass(noise(seed + 1, d), 3000, 0.8);
  for (let i = 0; i < n; i++) { const v = speed(i / SR); out[i] = v * ((1 - v) * lo[i] + v * hi[i]); }
  const chatter = new Float32Array(n);
  for (let t = skid; t < skid + 0.06; t += 1 / (70 - 500 * (t - skid))) chatter[Math.round(t * SR)] = 0.6 + 0.4 * r();
  mixInto(out, bandpass(chatter, 900, 4), 0, 3);
  mixInto(out, decay(lowpass(noise(seed + 2, 0.04), 1200), 0.008), skid + 0.06, 0.4);
  return norm(fade(out, 0.03), 0.4);
}

// (seed) => one-shot, 0.9 s. s18's dissolve: the ink soaking back into the calendar. Noise through a one-pole low-pass
// whose cutoff swells 300 → 2.2 kHz → 400 Hz over 0.75 s, three wet blips falling (smaller each time) inside it, and
// at 0.78 s a tiny dry tick, as if the paper drank it.
function inkSoak(seed = 1) {
  const d = 0.9, x = noise(seed, d), out = new Float32Array(x.length);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR, p = Math.min(1, t / 0.75), e = Math.sin(Math.PI * p) ** 2;
    y += (1 - Math.exp(-TAU * (300 + 1900 * Math.sin(Math.PI * p) - 100 * p) / SR)) * (x[i] - y);
    out[i] = y * e * (t < 0.75 ? 1 : 0);
  }
  [[0.1, 0.5], [0.3, 0.35], [0.45, 0.2]].forEach(([at, g], k) => {
    let ph = 0;
    mixInto(out, gen(0.15, (u) => { ph += TAU * (300 + (700 - 150 * k) * Math.exp(-u / 0.02)) / SR; return Math.sin(ph) * Math.min(1, u / 0.002) * Math.exp(-u / 0.04); }), at, g);
  });
  mixInto(out, decay(highpass(noise(seed + 1, 0.01), 4000), 0.0006), 0.78, 0.25);
  return norm(fade(out, 0.03, 0), 0.4);
}

// (seed, dur) => one-shot of length dur (default 2 s, newDate - 2 to the beat). A felt-tip marker: squeaky strokes for
// the letters of "Final" over the first 62.5% (F three strokes, i a stroke and a dot, n, a, l), a breath, then one round
// stroke for the circle over the last third, its squeak gliding up and back down as it goes round, ending on the beat.
// The squeak is a stick-slip whistle (a 1.6-2.8 kHz tone with jittered pitch and a little 2nd harmonic) over felt noise.
function markerScratch(seed = 1, dur = 2) {
  const r = mulberry32(seed), n = Math.ceil(dur * SR), env = new Float32Array(n), pitch = new Float32Array(n).fill(2000);
  const stroke = (t0, len, f0, f1, round) => {
    const i0 = Math.round(t0 * SR), m = Math.round(len * SR);
    for (let i = 0; i < m && i0 + i < n; i++) {
      const p = i / m;
      env[i0 + i] = Math.sin(Math.PI * p) ** 0.5;
      pitch[i0 + i] = round ? f0 + (f1 - f0) * Math.sin(Math.PI * p) : f0 + (f1 - f0) * p;
    }
  };
  const letters = 0.625 * dur;
  for (let k = 0, t = 0.02; k < 7; k++) {                  // F F F i n a l
    const len = (0.08 + 0.06 * r()) * dur / 2, f = 1600 + 1000 * r();
    stroke(t, len, f, f * (0.85 + 0.3 * r()), false);
    t += len + (0.03 + 0.04 * r()) * dur / 2;
    if (k === 3) { stroke(t, 0.012, 2600, 2600, false); t += 0.04 * dur / 2; }   // the i's dot
    if (t > letters) break;
  }
  stroke(0.665 * dur, 0.335 * dur, 1800, 2700, true);      // the circle, ending on the beat
  const jit = lowpass(noise(seed + 1, dur), 60), felt = bandpass(noise(seed + 2, dur), 3500, 0.8);
  let ph = 0;
  const out = gen(dur, (t, i) => {
    ph += TAU * pitch[i] * (1 + 0.4 * jit[i]) / SR;                     // the stick-slip wobble
    return env[i] * (0.6 * (Math.sin(ph) + 0.25 * Math.sin(2 * ph)) + 0.8 * felt[i]);
  });
  return norm(fade(out, 0.01), 0.35);
}


// ───────── snd-v4: the climax's sounds (doc 05 v4, marked "new"). Same toolkit, same habit: one physical joke each ─────────

// A sin^p swell of `len` seconds at t0, added into env.
const swell = (env, t0, len, g, p = 2) => { const i0 = Math.round(t0 * SR), m = Math.round(len * SR); for (let i = 0; i < m && i0 + i < env.length; i++) env[i0 + i] += g * Math.sin(Math.PI * i / m) ** p; };

// (seed, dur) => breathing at a fixed rate: each cycle an inhale (brighter air, 1.8 + 3.6 kHz) then an exhale (darker,
// 0.9 + 1.7 kHz), each a swell, levels seeded per breath. nasal: through the nose, narrower, a 2.8 kHz resonance, and
// the joke: every third in-breath catches a faint nose whistle that slides up.
function breaths(seed, dur, { period, tin, tout, nasal = false }) {
  const r = mulberry32(seed), n = Math.ceil(dur * SR), eIn = new Float32Array(n), eOut = new Float32Array(n), whistle = new Float32Array(n);
  const ni = noise(seed, dur), no = noise(seed + 1, dur);
  const inA = bandpass(ni, nasal ? 2800 : 1800, nasal ? 4 : 0.9), inB = bandpass(ni, 3600, 1.2);
  const outA = bandpass(no, nasal ? 1100 : 900, nasal ? 3 : 0.8), outB = bandpass(no, 1700, 1.2);
  for (let t0 = 0, k = 0; t0 < dur - 0.1; t0 += period, k++) {
    const g = 0.75 + 0.25 * r();
    swell(eIn, t0, tin, 0.8 * g, 1.5); swell(eOut, t0 + tin, tout, g);
    if (nasal && k % 3 === 1) swell(whistle, t0 + 0.2 * tin, 0.6 * tin, 0.12 * g);
  }
  let ph = 0;
  return norm(fade(gen(dur, (t, i) => {
    ph += TAU * 2900 * (1 + 0.03 * ((t % period) / tin)) / SR;
    return eIn[i] * (inA[i] + 0.4 * inB[i]) + eOut[i] * (outA[i] + 0.4 * outB[i]) + whistle[i] * Math.sin(ph);
  }), 0.02), 0.5);
}
// s08: nasal, phased to climax-a1's picture (in 1.58 s, out 1.5 s: a 3.08 s cycle, about doc 05's 20/min).
// s09c: fast, 36/min to the decision, 40/min after (the acting table).
const breathNasal = (seed = 1, dur = 6) => breaths(seed, dur, { period: 3.08, tin: 1.58, tout: 1.5, nasal: true });
const breathFast = (seed = 1, dur = 6) => breaths(seed, dur, { period: 60 / 36, tin: 0.5, tout: 0.6 });
const breathFaster = (seed = 1, dur = 6) => breaths(seed, dur, { period: 60 / 40, tin: 0.45, tout: 0.55 });
// (seed) => s09a's one slow breath: in 0.75 s, out 0.42 s (breathIn + 0.25 → + 1.42), the decision's breath.
const breathSlow = (seed = 1) => breaths(seed, 1.2, { period: 2, tin: 0.75, tout: 0.42 });
// (seed) => s09b's catch at shadowAhead: one quick in-breath, 0.22 s, with a tiny glottal hitch at its start.
function breathCatch(seed = 1) {
  const out = new Float32Array(Math.ceil(0.3 * SR)), e = new Float32Array(out.length);
  swell(e, 0, 0.22, 1, 1);
  const a = bandpass(noise(seed, 0.3), 2000, 1), b = bandpass(noise(seed + 1, 0.3), 3800, 1.5);
  for (let i = 0; i < out.length; i++) out[i] = e[i] * (a[i] + 0.5 * b[i]);
  mixInto(out, decay(bandpass(noise(seed + 2, 0.01), 1200, 2), 0.002), 0, 0.6);
  return norm(fade(out, 0.02, 0), 0.5);
}
// (seed) => the threshold's long exhale (s10 exhale, 107.0), 2.6 s: a quick rise and a long sigh whose air darkens from
// 1.3 kHz to 700 Hz as the lungs empty. The joke: relief ends in a little lip flutter (24 Hz) on the last half second.
function exhale(seed = 1) {
  const d = 2.6, hi = bandpass(noise(seed, d), 1300, 0.9), lo = bandpass(noise(seed + 1, d), 700, 0.9), air = bandpass(noise(seed + 2, d), 3000, 1);
  return norm(fade(gen(d, (t, i) => {
    const k = t / d, e = Math.min(1, t / 0.15) * (1 - k) ** 1.3, flutter = t > d - 0.6 ? 0.55 + 0.45 * Math.sin(TAU * 24 * t) : 1;
    return e * flutter * ((1 - k) * hi[i] + k * lo[i] + 0.3 * air[i]);
  }), 0.05), 0.5);
}

// (seed) => s09a's backpackGrab, 0.7 s: a fabric swish, the strap's soft snap, and the zip pulls jingling. The joke: the
// three clinks rise in pitch like a tiny bell.
function backpackGrab(seed = 1) {
  const out = new Float32Array(Math.ceil(0.7 * SR)), sw = bandpass(noise(seed, 0.3), 1300, 0.7);
  for (let i = 0; i < sw.length; i++) sw[i] *= Math.sin(Math.PI * i / sw.length) ** 2;
  mixInto(out, sw, 0, 0.6);
  mixInto(out, decay(lowpass(noise(seed + 1, 0.03), 900), 0.006), 0.12, 0.5);
  [[0.18, 1, 0.8], [0.27, 1.12, 0.6], [0.4, 1.26, 0.4]].forEach(([at, k, g]) =>
    mixInto(out, gen(0.15, (t) => (Math.sin(TAU * 3100 * k * t) + 0.6 * Math.sin(TAU * 4740 * k * t) + 0.3 * Math.sin(TAU * 6900 * k * t)) * Math.min(1, t / 0.0005) * Math.exp(-t / 0.035)), at, g * 0.35));
  return norm(fade(out, 0.03), 0.45);
}

// (seed) => s09b's doorLatch at doorOpen, 1.1 s: the latch's metal click and release tick, then the hinge: stick-slip pulses
// through two body bands. The joke: the creak's pitch rises 180 → 420 Hz, like the door asking.
function doorLatch(seed = 1) {
  const out = new Float32Array(Math.ceil(1.1 * SR));
  const clk = (at, g, s) => {
    mixInto(out, decay(bandpass(noise(s, 0.01), 3000, 1), 0.001), at, g);
    mixInto(out, gen(0.06, (t) => (Math.sin(TAU * 2200 * t) + 0.5 * Math.sin(TAU * 3900 * t)) * Math.exp(-t / 0.008)), at, g * 0.4);
  };
  clk(0, 1, seed); clk(0.06, 0.4, seed + 1);
  const r = mulberry32(seed), pulses = new Float32Array(out.length);
  for (let t = 0.12; t < 0.9;) { const k = (t - 0.12) / 0.78; pulses[Math.round(t * SR)] = (0.5 + 0.5 * r()) * Math.sin(Math.PI * k); t += 1 / (180 + 240 * k); }
  const creak = bandpass(pulses, 900, 3);
  mixInto(creak, bandpass(pulses, 2000, 4), 0, 0.5);
  mixInto(out, creak, 0, 6);
  return norm(fade(out, 0.05, 0), 0.45);
}

// (seed, dur) => s09b's hall: a low wideband hush (no electric hum: the light is his nightstand lamp, Q17) that swells
// +6 dB over its first 0.5 s, the house bigger outside his room.
function hallHum(seed = 1, dur = 4) {
  const out = highpass(lowpass(lowpass(noise(seed, dur), 1400), 1400), 60);
  for (let i = 0; i < out.length; i++) { const t = i / SR; out[i] *= (0.5 + 0.5 * Math.min(1, t / 0.5)) * (0.9 + 0.1 * Math.sin(TAU * 0.13 * t)); }
  return norm(fade(out, 0.05, 0.02), 0.07);
}

// (seed, dur) => s09c's night: low air, slow gusts in the oaks (leaf hiss riding the gusts), and the joke: one far cricket
// that chirps in threes now and then.
function nightAir(seed = 1, dur = 8) {
  const r = mulberry32(seed), air = highpass(lowpass(lowpass(noise(seed, dur), 600), 600), 40), leaves = bandpass(noise(seed + 1, dur), 3500, 0.7);
  const gust = lowpass(lowpass(noise(seed + 2, dur), 0.4), 0.4);
  let gm = 0; for (const v of gust) gm = Math.max(gm, Math.abs(v));
  const out = gen(dur, (t, i) => { const g = 0.6 + 0.4 * gust[i] / (gm || 1); return air[i] * g + 0.25 * leaves[i] * g * g; });
  for (let t = 0.8 + 2 * r(); t < dur - 0.5; t += 2.5 + 3 * r())
    for (let k = 0; k < 3; k++) mixInto(out, gen(0.04, (u) => Math.sin(TAU * 4600 * u) * Math.sin(Math.PI * u / 0.04) ** 2 * (0.5 + 0.5 * Math.sin(TAU * 90 * u))), t + 0.07 * k, 0.04);
  return norm(fade(out, 0.3), 0.07);
}

// (seed) => s09b's swallow, 0.25 s: a small dry throat sound. The joke: it is the blob's gulp (inkDrip's falling sine) made
// dry and small, with a soft click after it.
function swallow(seed = 1) {
  let ph = 0;
  const out = gen(0.25, (t) => { ph += TAU * (160 + 260 * Math.exp(-t / 0.03)) / SR; return Math.sin(ph) * Math.min(1, t / 0.004) * Math.exp(-t / 0.04); });
  mixInto(out, decay(lowpass(noise(seed, 0.02), 1800), 0.003), 0, 0.4);
  mixInto(out, decay(bandpass(noise(seed + 1, 0.01), 1400, 2), 0.002), 0.09, 0.3);
  return norm(fade(out, 0.03, 0), 0.4);
}

// (seed) => a footstep on paving, 0.2 s: the heel's thump (110 Hz and a dark noise thud) and the toe's grit scuff, levels
// seeded per step. The joke: he is cardstock, so every step has a tiny paper tap on top.
function footstep(seed = 1) {
  const r = mulberry32(seed), out = new Float32Array(Math.ceil(0.2 * SR));
  mixInto(out, decay(lowpass(lowpass(noise(seed, 0.06), 300), 300), 0.015, 0.002), 0, 3);
  mixInto(out, gen(0.08, (t) => Math.sin(TAU * 110 * t) * Math.exp(-t / 0.02)), 0, 0.4);
  mixInto(out, decay(bandpass(noise(seed + 1, 0.01), 2000, 2), 0.002), 0.002, 0.35);
  const sc = bandpass(noise(seed + 2, 0.05), 3500, 0.8);
  for (let i = 0; i < sc.length; i++) sc[i] *= Math.sin(Math.PI * i / sc.length);
  mixInto(out, sc, 0.03 + 0.02 * r(), 0.15 + 0.15 * r());
  return norm(fade(out, 0.02, 0), (0.5 + 0.1 * r()));
}
// (seed) => a footstep on the hall runner or the lobby mat: the same heel, muffled, no grit, a fabric brush.
function footstepSoft(seed = 1) {
  const out = lowpass(footstep(seed), 900);
  mixInto(out, decay(bandpass(noise(seed + 3, 0.06), 1200, 0.7), 0.02, 0.004), 0, 0.08);
  return norm(out, 0.45);
}

// (seed) => s10's doorPush, 1.0 s: the push bar's heavy clunk (160, 430 Hz and 1.9 kHz modes), the latch clacking out,
// then air rushing through the opening seal. The joke: the door sighs first (the hiss slides down 3 kHz → 1.2 kHz, an
// exhale), four seconds before he does.
function doorPush(seed = 1) {
  const out = new Float32Array(Math.ceil(1.0 * SR));
  mixInto(out, decay(lowpass(noise(seed, 0.04), 1500), 0.008), 0, 0.8);
  for (const [f, tau, a] of [[160, 0.06, 0.8], [430, 0.04, 0.5], [1900, 0.015, 0.3]]) mixInto(out, gen(0.3, (t) => Math.sin(TAU * f * t) * Math.exp(-t / tau)), 0, a);
  mixInto(out, decay(bandpass(noise(seed + 1, 0.02), 3500, 1.5), 0.002), 0.03, 0.5);
  mixInto(out, gen(0.06, (t) => (Math.sin(TAU * 2800 * t) + 0.5 * Math.sin(TAU * 4400 * t)) * Math.exp(-t / 0.01)), 0.03, 0.25);
  const hiss = noise(seed + 2, 0.9), y = new Float32Array(hiss.length);
  for (let s = 0; s < 6; s++) {                          // the slide, in six overlapping bands
    const f = 3000 * (1200 / 3000) ** (s / 5), b = bandpass(hiss, f, 1.2), c = (s + 0.5) / 6;
    for (let i = 0; i < b.length; i++) { const u = i / b.length; y[i] += b[i] * Math.max(0, 1 - Math.abs(u - c) * 5); }
  }
  for (let i = 0; i < y.length; i++) { const t = i / SR; y[i] *= Math.min(1, t / 0.08) * Math.exp(-t / 0.35); }
  mixInto(out, y, 0.06, 0.35);
  return norm(fade(out, 0.05, 0), 0.6);
}

export const FOLEY = {
  lampClick, sensorWake, penUncap, inkDrip, paperRustle, fluorescentHum,
  penScratch, phoneHum, inkRoll, shadowGrowth, fridgeHum, controllerClick, drill,
  fluorescentFlicker, mopOnTile, paperBoil, dawnBirds, roomTone, nightHum, shadowBreath,
  thumbFlick, scrollTick, jarClink, cartonSlosh, tvBloops, roommateStep, winJingle, ladderCreak, rodSnap, curtainSwish, cardTap,
  phoneBuzz, gameBlip, blindRattle, penStroke, penTap, examHush, clockTick, cough, paperSlide, inkSoak, markerScratch,
  clockTickMid, clockTickFar, clockTickExam, pulse, breathNasal, breathFast, breathFaster, breathSlow, breathCatch, exhale,
  backpackGrab, doorLatch, hallHum, nightAir, swallow, footstep, footstepSoft, doorPush,
};
