// @ts-check
// Offline voices and DSP (doc 05, contracts §src/audio). Plain Node, mono Float32Array at 48 kHz.
// Ideas ported from 1776's audio.ts (oscillator + envelope voices, polyBLEP saw, biquads); code is new.
// Deterministic: noise comes only from src/core/rng.js, seeded per call.
import { mulberry32, seedOf } from '../core/rng.js';

export const SR = 48000;
const TAU = Math.PI * 2;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const len = (sec) => Math.max(1, Math.ceil(sec * SR));

// ───────── primitives ─────────
export function noise(seed, dur) {
  const r = mulberry32(seed), out = new Float32Array(len(dur));
  for (let i = 0; i < out.length; i++) out[i] = r() * 2 - 1;
  return out;
}

// RBJ biquad, returns a new buffer. type: 'lp' | 'hp' | 'bp' (bp has 0 dB peak).
function biquad(x, type, f0, Q = 0.707) {
  const w = TAU * Math.min(f0, SR * 0.45) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * Q);
  const [b0, b1, b2] = type === 'lp' ? [(1 - cs) / 2, 1 - cs, (1 - cs) / 2]
    : type === 'hp' ? [(1 + cs) / 2, -(1 + cs), (1 + cs) / 2] : [al, 0, -al];
  const a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al, out = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; out[i] = y;
  }
  return out;
}
export const lowpass = (buf, hz) => biquad(buf, 'lp', hz);
export const highpass = (buf, hz) => biquad(buf, 'hp', hz);
export const bandpass = (buf, hz, Q = 1) => biquad(buf, 'bp', hz, Q);

// Linear ADSR over the whole buffer, in place: release occupies the last r seconds.
export function env(buf, { a = 0.005, d = 0.1, s = 1, r = 0.05 } = {}) {
  const T = buf.length / SR;
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    let e = t < a ? t / a : t < a + d ? 1 - (1 - s) * (t - a) / d : s;
    if (t > T - r) e *= Math.max(0, (T - t) / r);
    buf[i] *= e;
  }
  return buf;
}

// Adds src into dest starting at atSec (may be negative or run past the end; the overlap is mixed).
export function mixInto(dest, src, atSec, gain = 1) {
  const i0 = Math.round(atSec * SR);
  for (let i = Math.max(0, -i0); i < src.length && i0 + i < dest.length; i++) dest[i0 + i] += src[i] * gain;
  return dest;
}

// Small Schroeder room: 4 parallel combs into 2 allpasses (prime-ish delays, ~1.2 s tail at fb 0.78).
// ponytail: mono plate-ish room, swap for a stereo FDN if the piano needs width.
function room(x, wet = 0.2, fb = 0.78, tail = 1.2) {
  const n = x.length + len(tail), out = new Float32Array(n), acc = new Float32Array(n);
  for (const D of [1557, 1617, 1491, 1422].map((d) => Math.round(d * SR / 44100))) {
    const buf = new Float32Array(D); let p = 0, lp = 0;
    for (let i = 0; i < n; i++) {
      const y = buf[p]; lp += 0.35 * (y - lp);          // damping: highs die first
      buf[p] = (i < x.length ? x[i] : 0) + lp * fb; p = (p + 1) % D; acc[i] += y * 0.25;
    }
  }
  let y = acc;
  for (const D of [556, 225].map((d) => Math.round(d * SR / 44100))) {
    const buf = new Float32Array(D), o = new Float32Array(n); let p = 0;
    for (let i = 0; i < n; i++) { const b = buf[p]; o[i] = -y[i] + b; buf[p] = y[i] + b * 0.5; p = (p + 1) % D; }
    y = o;
  }
  for (let i = 0; i < n; i++) out[i] = (i < x.length ? x[i] : 0) * (1 - wet) + y[i] * wet;
  return out;
}

function sawBlep(phase, dt) {           // polyBLEP-corrected saw, phase in [0,1)
  let v = 2 * phase - 1;
  if (phase < dt) { const t = phase / dt; v -= t + t - t * t - 1; }
  else if (phase > 1 - dt) { const t = (phase - 1) / dt; v -= t * t + t + t + 1; }
  return v;
}

// ───────── voices ─────────
// Felt piano: 8 stiff-string partials (f_n = n f √(1+B n²)), upper partials decay faster,
// a felt-hammer thump of low-passed noise, a 2-pole low-pass whose cutoff opens with velocity and
// closes as the note decays, then a short room. Output runs dur + damper release + reverb tail.
export function feltPiano(midi, { vel = 0.7, dur = 1.5 } = {}) {
  const f = mtof(midi), B = 0.0004, rel = 0.25, n = len(dur + rel), x = new Float32Array(n);
  const tau0 = 2.2 * 2 ** (-(midi - 60) / 24);   // lower notes ring longer
  const parts = [];
  for (let k = 1; k <= 8; k++) {
    const fk = k * f * Math.sqrt(1 + B * k * k);
    if (fk < SR * 0.45) parts.push({ w: TAU * fk / SR, a: (1 / k ** 1.4) * (k === 1 ? 1 : 0.8), tau: tau0 / (1 + 0.7 * (k - 1)) });
  }
  const fc0 = f * (1.5 + 10 * vel * vel), fcMin = f * 1.2;
  let y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const p of parts) v += p.a * Math.sin(p.w * i) * Math.exp(-t / p.tau);
    const atk = Math.min(1, t / 0.004);
    const damp = t > dur ? Math.exp(-(t - dur) / (rel / 4)) * (1 - (t - dur) / rel) : 1; // reaches 0 at dur+rel: no edge
    const fc = fcMin + (fc0 - fcMin) * Math.exp(-t / 0.35);
    const k = 1 - Math.exp(-TAU * Math.min(fc, SR * 0.45) / SR);
    y1 += k * (v - y1); y2 += k * (y1 - y2);
    x[i] = y2 * atk * damp;
  }
  // hammer: 25 ms of soft noise, darker at low velocity
  const ham = lowpass(noise(seedOf('feltPiano', midi), 0.025), 600 + 2400 * vel);
  for (let i = 0; i < ham.length; i++) x[i] += ham[i] * 0.25 * vel * Math.exp(-i / SR / 0.006);
  const out = room(x, 0.18);
  const g = 0.35 * (0.3 + 0.7 * vel);
  for (let i = 0; i < out.length; i++) out[i] *= g;
  return out;
}

// Music box: a sine plus a bright inharmonic partial (×4.2) that dies in ~60 ms. Fractional midi = detune.
// Optional vibrato: vib cents at vibHz, stopping dead at vibUntil seconds (the pitch then holds where it is). vib 0 = none,
// and then the samples are exactly the vibrato-less ones.
export function musicBox(midi, { vel = 0.6, dur = 1.2, vib = 0, vibHz = 7, vibUntil = Infinity } = {}) {
  const f = mtof(midi), out = new Float32Array(len(dur)), w1 = TAU * f / SR, w2 = TAU * f * 4.2 / SR, d = 2 ** (vib / 1200) - 1;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR, fade = Math.min(1, (dur - t) / 0.02);
    const fm = vib ? d * (1 - Math.cos(TAU * vibHz * Math.min(t, vibUntil))) / (TAU * vibHz) : 0;   // ∫ d·sin, in seconds
    out[i] = vel * 0.5 * fade * Math.min(1, t / 0.001) *
      (Math.sin(w1 * i + TAU * f * fm) * Math.exp(-t / (dur * 0.4)) + 0.35 * Math.sin(w2 * i + TAU * f * 4.2 * fm) * Math.exp(-t / 0.06));
  }
  return out;
}

// Warm pad: three saws per note (−8, 0, +8 cents) through a 2-pole low-pass that opens over the attack.
// Length = dur + release. snd-v4, both optional (without them the samples are exactly as before):
// bend { voice, at: [[t, semitones], ...] } glides one voice (index into midis) along a piecewise-linear pitch curve;
// open { from, to, hz } raises the low-pass ceiling by hz between from and to (seconds from the note's start).
/**
 * @param {number[]} midis
 * @param {{ dur: number, attack?: number, release?: number, bend?: { voice: number, at: number[][] }, open?: { from: number, to: number, hz: number } }} opts
 */
export function pad(midis, { dur, attack = 1.5, release = 2, bend, open } = /** @type {any} */ ({})) {  // dur has no default: pass it
  const n = len(dur + release), out = new Float32Array(n), dets = [-8, 0, 8];
  const oscs = midis.flatMap((m, v) => dets.map((c, j) => ({ v, dt: mtof(m) * 2 ** (c / 1200) / SR, ph: (j * 0.318) % 1 })));
  const curve = (k, t) => { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const [t0, a] = k[i - 1], [t1, b] = k[i]; return a + (b - a) * (t - t0) / (t1 - t0); } return k[k.length - 1][1]; };
  let y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, r = bend ? 2 ** (curve(bend.at, t) / 12) : 1;
    let v = 0;
    for (const o of oscs) { const dt = bend && o.v === bend.voice ? o.dt * r : o.dt; v += sawBlep(o.ph, dt); o.ph += dt; if (o.ph >= 1) o.ph -= 1; }
    v /= oscs.length;
    const e = Math.min(1, t / attack) * (t > dur ? Math.max(0, 1 - (t - dur) / release) : 1);
    const lift = open ? open.hz * Math.min(1, Math.max(0, (t - open.from) / (open.to - open.from))) : 0;
    const k = 1 - Math.exp(-TAU * Math.min(250 + 950 * Math.min(1, t / attack) + lift, SR * 0.45) / SR);
    y1 += k * (v - y1); y2 += k * (y1 - y2);
    out[i] = y2 * e * 0.5;
  }
  return out;
}

// Sub swell: a 40–60 Hz sine with a slow (smoothstep) attack, 0.5 s release at the end.
export function subSwell({ hz = 50, dur, attack = dur / 2 }) {
  const out = new Float32Array(len(dur)), w = TAU * hz / SR, r = Math.min(0.5, dur / 4);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR, a = Math.min(1, t / attack), e = a * a * (3 - 2 * a) * Math.min(1, (dur - t) / r);
    out[i] = Math.sin(w * i) * e * 0.5;
  }
  return out;
}
