// The film's score (doc 05 §Leitmotifs, §Structure by section): a flat list of note events plus one renderer.
// Every event is { beat, at, voice, midi, ... }: a beat name from src/timeline.js plus an offset in seconds,
// never a global time, so retiming a shot moves its music. `motif` tags which leitmotif a note belongs to.
// Voices are doc 05's four, from synth.js: felt piano, music box, warm pad, sub swell. Mono, 48 kHz.
import { beat } from '../timeline.js';
import { SR, feltPiano, musicBox, pad, subSwell, mixInto } from './synth.js';

// ───────── leitmotifs: [midi, offset s]. Fixed intervals and rhythm, so every return is the same shape ─────────
// The Exam: four music-box notes rising then falling, each a few cents out of tune (kept from snd-engine's bed).
const EXAM = [[72.14, 0], [75.9, 0.55], [81.18, 1.1], [74.88, 1.65]];
// The theme: the Exam's opening leaps (up a major 3rd, up a 4th) played in tune on the piano, with the sour
// fall to D# turned into a step down to G. C E A G E F D. Act 3 leaves it hanging on D; the Button lands it on C.
const THEME = [60, 64, 69, 67, 64, 65, 62];
// Left hand under each theme note: C, C/E, F, C/E, Am, Dm, Gsus4 (open). The Button swaps the last for G7.
const HARM = [[36, 43, 52], [40, 48], [41, 48, 57], [40, 48, 55], [45, 52], [38, 45, 53], [43, 50, 55, 60]];
const G7 = [43, 50, 53, 59];

const ev = (beatName, at, voice, midi, o = {}) => ({ beat: beatName, at, voice, midi, ...o });
const exam = (beatName, at, o) => EXAM.map(([m, dt]) => ev(beatName, at + dt, 'box', m, { motif: 'exam', ...o }));

// ───────── the avoidance groove ─────────
// 120 bpm, one bar = 2 s. Bar 0 is the lamp dodge's downbeat, 0.5 s before lampClickHome. The other dodges have
// no beat names, so they ride this grid: fridge bar −8 (0:20), game night −4 (0:28), lamp 0 (0:36),
// curtains 4 (0:44), scroll 9 (0:54); bar 12 (1:00) is Marston, where the groove drops out.
const BAR = 2, BAR0 = -0.5;
const bar = (n, sec = 0) => BAR0 + n * BAR + sec;
const CHORDS = [ // I vi IV V, one per bar; every 8 s dodge starts on I
  { oom: [48, 43], walk: [48, 52, 55, 57], stab: [64, 67, 72], mel: [[0, 67], [2, 64], [3, 67], [5, 72], [6, 67]] },
  { oom: [45, 40], walk: [45, 48, 52, 54], stab: [64, 69, 72], mel: [[0, 69], [2, 64], [3, 69], [5, 72], [6, 71]] },
  { oom: [41, 48], walk: [41, 45, 48, 50], stab: [65, 69, 72], mel: [[0, 69], [2, 65], [3, 69], [5, 72], [6, 74]] },
  { oom: [43, 50], walk: [43, 47, 50, 53], stab: [62, 67, 71], mel: [[0, 71], [2, 74], [3, 71], [4, 67], [6, 65]] },
];
const swing = (slot) => Math.floor(slot / 2) * 0.5 + (slot % 2) * 0.3; // eighths, swung 60:40

function groove() {
  const out = [], p = (n, sec, midi, vel, dur) => out.push(ev('lampClickHome', bar(n, sec), 'piano', midi, { vel, dur, motif: 'groove' }));
  for (let n = -8; n < 12; n++) {
    if (n === 0 || n === 1) continue;   // stop-time: the lamp clicks on (36.5) and off (39) in the open
    const c = CHORDS[(n + 8) % 4];
    if (n < 4) { p(n, 0, c.oom[0], 0.55, 0.22); p(n, 1, c.oom[1], 0.5, 0.22); }      // fridge: oom-pah bass
    else c.walk.forEach((m, k) => p(n, k * 0.5, m, 0.55, 0.3));                         // curtains: walking bass
    if (n >= -4) for (const s of n < 4 ? [2, 6] : [1, 3, 5, 7]) p(n, swing(s), c.stab, 0.33, 0.12); // game night: stabs
    if (n >= 2) for (const [s, m] of c.mel) {                                            // lamp: the bouncy tune
      p(n, swing(s), m, 0.5, 0.16);
      if (n >= 9) p(n, swing(s), m + 12, 0.35, 0.12);                                   // scroll: doubled an octave up
    }
  }
  return out;
}

export const SCORE = [
  // 0:00–0:20 Birth. A dawn pad drains away as the ink drop forms; the Exam motif enters on the music box.
  ev('inkDropForms', -10, 'pad', [48, 55, 64, 74], { dur: 8, attack: 3, release: 3, gain: 0.5 }),
  ...exam('inkDropForms', 0.3, { vel: 0.55, dur: 1.4 }),
  ev('phoneUp', 0, 'sub', null, { hz: 42, dur: 5, attack: 3, gain: 0.2 }),            // shadow climbs the wall

  // 0:20–1:00 Avoidance. The groove adds a layer per dodge; a sub swell per dodge, each lower-floored and louder.
  ...groove(),
  ev('lampClickHome', bar(-8), 'sub', null, { hz: 44, dur: 8.5, attack: 3, gain: 0.25 }),
  ev('lampClickHome', bar(-4), 'sub', null, { hz: 47, dur: 8.5, attack: 3, gain: 0.3 }), // ends on the click: shadow snaps down
  ...exam('lampOffHome', -2.15, { vel: 0.4, dur: 0.45 }),                              // blob small, right there; done before the off click
  ev('lampOffHome', 0, 'sub', null, { hz: 50, dur: 5.5, attack: 0.4, gain: 0.35 }),       // shadow springs back
  ev('lampClickHome', bar(4), 'sub', null, { hz: 53, dur: 10.5, attack: 3, gain: 0.42 }),
  ev('lampClickHome', bar(9), 'sub', null, { hz: 56, dur: 6.5, attack: 2, gain: 0.5 }),

  // 1:00–1:18 Marston. Groove gone; one low piano note. The sub follows him in and fades before Quiet 1.
  ev('lampClickHome', bar(12), 'piano', 33, { vel: 0.65, dur: 7, gain: 1.6 }),
  ev('quiet1Start', -18, 'sub', null, { hz: 56, dur: 17.5, attack: 0.5, fade: 8, gain: 0.5 }),

  // 1:18–1:28 Quiet 1: no music.

  // 1:28–1:40 Reveal. One sparse chord per shadow revealed, darker each time, the last left on E7.
  ev('headLift', 1.0, 'piano', [45, 52, 60], { vel: 0.35, dur: 2.2 }),
  ev('headLift', 2.5, 'piano', [41, 48, 57, 64], { vel: 0.38, dur: 2.2 }),
  ev('headLift', 4.0, 'piano', [38, 45, 53, 60], { vel: 0.4, dur: 2.2 }),
  ev('headLift', 5.5, 'piano', [40, 47, 56, 62], { vel: 0.45, dur: 2.2 }),

  // 1:40–2:15 First step. Click and silence; one held note when he writes his name; then a theme note per problem.
  ev('nameWritten', 0, 'piano', THEME[0], { vel: 0.5, dur: 6.5, motif: 'theme' }),
  ev('problemOneSolved', 0, 'piano', THEME[1], { vel: 0.5, dur: 3, motif: 'theme' }),
  ...[3, 5, 6.5, 7.5, 8.5].flatMap((dt, k) => [
    ev('problemOneSolved', dt, 'piano', THEME[k + 2], { vel: 0.48, dur: k === 4 ? 1.4 : 1, motif: 'theme' }),
    ev('problemOneSolved', dt, 'piano', HARM[k + 2], { vel: 0.35, dur: k === 4 ? 1.4 : 1 }),
  ]),
  // The montage: the whole theme again, faster and fuller, ending open on Gsus4 and gone before Quiet 2.
  ...THEME.flatMap((m, k) => [
    ev('quiet2Start', -8 + k * 0.75, 'piano', [m, m + 12], { vel: 0.55, dur: k === 6 ? 1.6 : 0.75, motif: 'theme' }),
    ev('quiet2Start', -8 + k * 0.75, 'piano', HARM[k], { vel: 0.42, dur: k === 6 ? 1.6 : 0.75 }),
  ]),

  // 2:15–2:40 Quiet 2: no music.

  // 2:40–3:00 Button. The theme in time, split around the Freshman's lamp click, resolved to C; pad under the
  // ending; the Exam motif, softest yet, on the yawn.
  ...THEME.slice(0, 4).flatMap((m, k) => [
    ev('nextSemester', k * 0.7, 'piano', m, { vel: 0.45, dur: 0.6, motif: 'theme' }),
    ev('nextSemester', k * 0.7, 'piano', HARM[k], { vel: 0.35, dur: 0.6 }),
  ]),
  ...THEME.slice(4).flatMap((m, k) => [
    ev('lampClickFreshman', 1.5 + k * 0.7, 'piano', m, { vel: 0.45, dur: k === 2 ? 1.1 : 0.6, motif: 'theme' }),
    ev('lampClickFreshman', 1.5 + k * 0.7, 'piano', k === 2 ? G7 : HARM[k + 4], { vel: 0.35, dur: k === 2 ? 1.1 : 0.6 }),
  ]),
  ev('lampClickFreshman', 4.1, 'piano', 60, { vel: 0.45, dur: 5, motif: 'theme' }),
  ev('lampClickFreshman', 4.1, 'piano', [36, 43, 52, 55], { vel: 0.38, dur: 5 }),
  ev('lampClickFreshman', 4.1, 'pad', [48, 55, 64, 72], { dur: 7.5, attack: 2.5, release: 3.5, gain: 0.5 }),
  ...exam('blobYawn', 0.2, { vel: 0.28, dur: 1.4 }),
];

// Linear fade over the last `sec` seconds, in place.
function fadeOut(buf, sec) {
  const n = Math.min(buf.length, Math.round(sec * SR));
  for (let i = 0; i < n; i++) buf[buf.length - n + i] *= 1 - i / n;
  return buf;
}

// Music sits under the foley: the lamp click (about -5 dBFS in the foley stem) stays the loudest transient.
const LEVEL = 0.5;

// Doc 05: every lamp click is dry and exposed, so the music stem is true zero across each click's own 0.3 s window.
// Notes and their room tails ring through it (the groove's bar −1 stabs, 35.5 s, reach the home click), so the
// gate fades the stem out over 40 ms before the click and back in 20 ms after the window. Beat-relative, like the notes.
const CLICKS = ['lampClickHome', 'lampClickMarston', 'lampClickFreshman'], CLICK_LEN = 0.3, FADE_OUT = 0.04, FADE_IN = 0.02;
function gateClicks(out) {
  const at = (s) => Math.round(s * SR);
  for (const b of CLICKS) {
    const t = beat(b), a = at(t - FADE_OUT), z = at(t), y = at(t + CLICK_LEN), e = at(t + CLICK_LEN + FADE_IN);
    for (let i = a; i < e && i < out.length; i++) out[i] *= i < z ? 1 - (i - a) / (z - a) : i < y ? 0 : (i - y) / (e - y);
  }
}

// Renders SCORE over [0, durSec) of film time as a mono Float32Array. Notes are cached, so the groove's
// repeats cost one synthesis each.
export function renderScore(durSec) {
  const out = new Float32Array(Math.round(durSec * SR)), cache = new Map();
  const note = (voice, m, vel, dur) => {
    const k = `${voice}|${m}|${vel}|${dur}`;
    if (!cache.has(k)) cache.set(k, voice === 'piano' ? feltPiano(m, { vel, dur }) : musicBox(m, { vel, dur }));
    return cache.get(k);
  };
  for (const e of SCORE) {
    const t = beat(e.beat) + e.at, g = LEVEL * (e.gain ?? 1);
    if (t >= durSec) continue;
    if (e.voice === 'pad') mixInto(out, pad(e.midi, e), t, g);
    else if (e.voice === 'sub') mixInto(out, e.fade ? fadeOut(subSwell(e), e.fade) : subSwell(e), t, g);
    else for (const m of [e.midi].flat()) mixInto(out, note(e.voice, m, e.vel, e.dur), t, g);
  }
  gateClicks(out);
  return out;
}
