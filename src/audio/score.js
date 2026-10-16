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
// fall to D# turned into a step down to G. C E A G E F D. Act 3 leaves it hanging on D; the grade lands it on C.
const THEME = [60, 64, 69, 67, 64, 65, 62];
// Left hand under each theme note: C, C/E, F, C/E, Am, Dm, Gsus4 (open). The grade swaps the last for G7.
const HARM = [[36, 43, 52], [40, 48], [41, 48, 57], [40, 48, 55], [45, 52], [38, 45, 53], [43, 50, 55, 60]];
const G7 = [43, 50, 53, 59];

const ev = (beatName, at, voice, midi, o = {}) => ({ beat: beatName, at, voice, midi, ...o });
const exam = (beatName, at, o) => EXAM.map(([m, dt]) => ev(beatName, at + dt, 'box', m, { motif: 'exam', ...o }));
// The gulp (doc 05): the motif's first two notes (its rising third), k semitones down for gulp k, the second 0.275 s later
// (half the motif's spacing, a swallow) and 4k cents flatter (the drift growing); velocity 0.30 rising to 0.42.
const gulp = (k) => [[0, 0, 0.5], [1, 0.275, 0.8]].map(([j, at, dur]) =>
  ev(`gulp${k}`, at, 'box', EXAM[j][0] - k - (j ? 0.04 * k : 0), { vel: (27 + 3 * k) / 100, dur, motif: 'gulp' }));
// The shrink answer (doc 05): the same two notes falling (second note first), 0.25 s after the solve's theme note, at
// about -6 dB under it, one semitone higher each time: -4 at s16's #1 up to +1 at #6, then the test +2 and the cross-off +3.
const SHRINKS = [['problemOneSolved', -4], ['problemSolved2', -3], ['problemSolved3', -2], ['problemSolved4', -1],
  ['problemSolved5', 0], ['problemSolved6', 1], ['testSolved', 2], ['examCrossedOff', 3]];
const shrink = ([b, k]) => [[1, 0.25, 0.5], [0, 0.525, 0.9]].map(([j, at, dur]) =>
  ev(b, at, 'box', EXAM[j][0] + k, { vel: 0.25, dur, motif: 'shrink' }));

// ───────── the avoidance groove ─────────
// 120 bpm, one bar = 2 s. Each dodge's bars hang from that dodge's own beat (G4 cut): fridge 0:26 (bars −8…−5), game
// night 0:34 (−4…−1), the lamp 0:42 (0…3), blinds 0:50 (4…9), sunrise 1:02 (10…12); bar 13 (1:08) is marstonEnter,
// where the groove is gone. The lamp's bar 0 is the downbeat 0.5 s before lampClickHome, so gulp2 (0:46) is bar 2's downbeat.
const BAR = 2, BAR0 = -0.5;
const DODGES = [['fridge', -8], ['gameNight', -4], ['lampClickHome', 0], ['blindsStart', 4], ['sunriseGame', 10], ['marstonEnter', 13]];
const dodge = (n) => DODGES.findLast(([, k]) => n >= k);
const bar = (n, sec = 0) => { // → [beat, offset] of second `sec` in bar n
  const [b, n0] = dodge(n);
  return [b, (b === 'lampClickHome' ? BAR0 : 0) + (n - n0) * BAR + sec];
};
const CHORDS = [ // I vi IV V, one per bar; every dodge starts on I
  { oom: [48, 43], walk: [48, 52, 55, 57], stab: [64, 67, 72], mel: [[0, 67], [2, 64], [3, 67], [5, 72], [6, 67]] },
  { oom: [45, 40], walk: [45, 48, 52, 54], stab: [64, 69, 72], mel: [[0, 69], [2, 64], [3, 69], [5, 72], [6, 71]] },
  { oom: [41, 48], walk: [41, 45, 48, 50], stab: [65, 69, 72], mel: [[0, 69], [2, 65], [3, 69], [5, 72], [6, 74]] },
  { oom: [43, 50], walk: [43, 47, 50, 53], stab: [62, 67, 71], mel: [[0, 71], [2, 74], [3, 71], [4, 67], [6, 65]] },
];
const swing = (slot) => Math.floor(slot / 2) * 0.5 + (slot % 2) * 0.3; // eighths, swung 60:40

// Layers (s04-s08 §Sound): 1 the fridge's oom-pah bass, 2 game night's stabs, 3 the blinds' tune (with a walking bass),
// 4 the sunrise's octave doubling. s06 plays from 0.0 and cuts dead on the click (the gate does the cutting), sits out the
// off click and comes back on gulp2's downbeat. blind1 drops the tune for gulp3; blind2 cuts it all until s08, which
// returns with every layer and sheds one per bar.
function groove() {
  const out = [];
  for (let n = -8; n < 13; n++) {
    if (n === 1 || n === 8 || n === 9) continue;   // stop-time: the off click (0:45) in the open; blind B's cut (0:58) to s08
    const c = CHORDS[(n - dodge(n)[1]) % 4], end = n === 0 ? 0.5 : BAR;  // bar 0: only its half-second before the click
    const p = (sec, midi, vel, dur) => sec < end && out.push(ev(...bar(n, sec), 'piano', midi, { vel, dur, motif: 'groove' }));
    if (n < 4) { p(0, c.oom[0], 0.55, 0.22); p(1, c.oom[1], 0.5, 0.22); }      // 1: oom-pah bass
    else c.walk.forEach((m, k) => p(k * 0.5, m, 0.55, 0.3));                     // blinds on: walking bass
    if (n >= -4 && n !== 12) for (const s of n < 4 ? [2, 6] : [1, 3, 5, 7]) p(swing(s), c.stab, 0.33, 0.12); // 2: stabs
    if (n >= 4 && n !== 7) for (const [s, m] of c.mel) {                                            // 3: the bouncy tune
      p(swing(s), m, 0.5, 0.16);
      if (n === 10) p(swing(s), m + 12, 0.35, 0.12);                                               // 4: an octave up
    }
  }
  return out;
}

export const SCORE = [
  // 0:00–0:20 Birth. A dawn pad drains away as the ink drop forms; the Exam motif enters on the music box.
  ev('inkDropForms', -10, 'pad', [48, 55, 64, 74], { dur: 8, attack: 3, release: 3, gain: 0.5 }),
  ...exam('inkDropForms', 0.3, { vel: 0.55, dur: 1.4 }),
  ev('laptopUp', 0, 'sub', null, { hz: 42, dur: 5, attack: 3, gain: 0.2 }),           // shadow climbs the wall
  // The five gulps: 0:24.5 (s03), 0:46 (s06), 0:56.5 and 0:58.5 (s07's blinds), 1:25.25 (s11).
  ...[1, 2, 3, 4, 5].flatMap(gulp),

  // 0:20–1:08 Avoidance. The groove adds a layer per dodge; a sub swell per dodge, each lower-floored and louder.
  ...groove(),
  ev(...bar(-8), 'sub', null, { hz: 44, dur: 8.5, attack: 3, gain: 0.25 }),
  ev(...bar(-4), 'sub', null, { hz: 47, dur: 8.5, attack: 3, gain: 0.3 }), // ends on the click: shadow snaps down
  ...exam('lampClickHome', 0.35, { vel: 0.4, dur: 0.45 }),                              // blob small, right there; done before the off click
  ev('lampOffHome', 0.17, 'sub', null, { hz: 50, dur: 4.83, attack: 0.4, gain: 0.35 }),  // shadow springs back, to s07
  ev('blindsStart', 0, 'sub', null, { hz: 53, dur: 8, attack: 3, gain: 0.42 }),          // to blind B's cut
  // gulp4: the biggest of the film so far, alone in the silence; holds through s08, easing 3 dB down over its last 4 s.
  ev('gulp4', 0, 'sub', null, { hz: 56, dur: 9.5, attack: 1, gain: 0.55, ease: [5.5, 3] }),

  // 1:08–1:26 Marston. Groove gone; one low piano note. The sub follows him in and fades before Quiet 1.
  ev('marstonEnter', 0, 'piano', 33, { vel: 0.65, dur: 7, gain: 1.6 }),
  ev('marstonEnter', 0, 'sub', null, { hz: 56, dur: 17.5, attack: 0.5, fade: 8, gain: 0.5 }),

  // 1:26–1:36 Quiet 1: no music.

  // 1:36–1:48 Reveal. One sparse chord on each shadow revealed (docs/shots/s13.md): the Sleeper, the Drinks gator,
  // then the Freshman, whose chord is the lowest and longest and is left hanging on E7.
  ev('revealSleeper', 0, 'piano', [45, 52, 60], { vel: 0.35, dur: 2.2 }),
  ev('revealDrinks', 0, 'piano', [41, 48, 57, 64], { vel: 0.35, dur: 2.2 }),
  ev('revealFreshman', 0, 'piano', [40, 47, 56, 62], { vel: 0.35, dur: 3 }),

  // 1:48–2:26 First step. The wake and silence; one held note when he writes his name; then a theme note per problem.
  ev('nameWritten', 0, 'piano', THEME[0], { vel: 0.5, dur: 6.5, motif: 'theme' }),
  ev('problemOneSolved', 0, 'piano', THEME[1], { vel: 0.5, dur: 3, motif: 'theme' }),
  ...['problemSolved2', 'problemSolved3', 'problemSolved4', 'problemSolved5', 'problemSolved6'].flatMap((b, k) => [
    ev(b, 0, 'piano', THEME[k + 2], { vel: 0.48, dur: k === 4 ? 0.5 : 1, motif: 'theme' }),
    ev(b, 0, 'piano', HARM[k + 2], { vel: 0.35, dur: k === 4 ? 0.5 : 1 }),
  ]),
  // The montage: after the last solve the whole theme again, faster and fuller (s16), ending open on Gsus4 and
  // released by s16's 24.0 (s16 §Sound: 21.0–23.5, last note off by 24.0). The sixth note is short so the replay starts clean.
  ...THEME.flatMap((m, k) => [
    ev('problemSolved6', 0.5 + k * 0.33, 'piano', [m, m + 12], { vel: 0.55, dur: 0.5, motif: 'theme' }),
    ev('problemSolved6', 0.5 + k * 0.33, 'piano', HARM[k], { vel: 0.42, dur: 0.5 }),
  ]),

  // Each solved problem's shrink answer, then the test's and the cross-off's.
  ...SHRINKS.flatMap(shrink),

  // 2:26–2:44 Quiet 2: no music.

  // 2:44–2:53 The test (s17b). Ambience only at first; at the smile, s15's first-step note recalled, soft. The test's
  // solve leans home (E over C/E) without getting there: landing on C is the grade's.
  ev('testSmile', 0, 'piano', THEME[0], { vel: 0.35, dur: 3, motif: 'theme' }),
  ev('testSolved', 0, 'piano', THEME[1], { vel: 0.45, dur: 2, motif: 'theme' }),
  ev('testSolved', 0, 'piano', HARM[1], { vel: 0.33, dur: 2 }),

  // 2:55–3:15 The grade and the ending. The motif resolves here: on gradeReveal the music box (the blob's voice) plays
  // the Exam's opening for the first time in tune, its sour last note turned into the theme's step down to G (C E A G),
  // doubling the felt piano an octave up. The theme goes on alone, one note a second, its D on G7, and lands on C held
  // as a chord through the dissolve (blobAbsorbed), a pad under it (s17c, s18 §Sound).
  ...THEME.slice(0, 4).map((m, k) => ev('gradeReveal', k, 'box', m + 12, { vel: 0.35, dur: 1.2, motif: 'exam-resolved' })),
  ...THEME.flatMap((m, k) => [
    ev('gradeReveal', k, 'piano', m, { vel: 0.45, dur: 0.9, motif: 'theme' }),
    ev('gradeReveal', k, 'piano', k === 6 ? G7 : HARM[k], { vel: 0.35, dur: 0.9 }),
  ]),
  ev('blobAbsorbed', -1.5, 'piano', 60, { vel: 0.45, dur: 5, motif: 'theme' }),
  ev('blobAbsorbed', -1.5, 'piano', [36, 43, 52, 55], { vel: 0.38, dur: 5 }),
  ev('blobAbsorbed', -1.5, 'pad', [48, 55, 64, 72], { dur: 6, attack: 2.5, release: 3.5, gain: 0.5 }),
  // The dissolve: the Exam motif's last note once more, at its birth pitch, over the held chord. Its voice, one last time.
  ev('blobAbsorbed', 0, 'box', EXAM[3][0], { vel: 0.35, dur: 1.6, motif: 'exam' }),
  // The tag: a new drop beads. The motif's first two notes at the birth pitch, softer than at inkDropForms, trembling
  // (vibrato) until the uncap's frame, where the tremble stops dead and the note rings on still. Then s15's held note.
  ...EXAM.slice(0, 2).map(([m, dt], j) => ev('dropQuivers', 0.3 + dt, 'box', m, { vel: 0.3, dur: j ? 2.4 : 1.4, vib: 25, vibTo: 'tagPenUncap', motif: 'reprise' })),
  ev('tagPenUncap', 0.5, 'piano', THEME[0], { vel: 0.4, dur: 3, motif: 'theme' }),
];

// Linear fade over the last `sec` seconds, in place.
function fadeOut(buf, sec) {
  const n = Math.min(buf.length, Math.round(sec * SR));
  for (let i = 0; i < n; i++) buf[buf.length - n + i] *= 1 - i / n;
  return buf;
}
// From `from` s to the end, a gain ramp linear in dB down to -dB, in place.
function easeDown(buf, [from, dB]) {
  const i0 = Math.round(from * SR), n = buf.length - i0;
  for (let i = 0; i < n; i++) buf[i0 + i] *= 10 ** (-dB * i / n / 20);
  return buf;
}

// Music sits under the foley: the lamp click (about -5 dBFS in the foley stem) stays the loudest transient.
const LEVEL = 0.5;

// Doc 05: every lamp click is dry and exposed, so the music stem is true zero across each click's own window.
// Notes and their room tails ring through it (the groove's bar −1 stabs, 35.5 s, reach the home click), so the
// gate fades the stem out over 40 ms before the click and back in 20 ms after the window. Beat-relative, like the notes.
// [beat, window]: a lamp click is 0.3 s, the off click's 0.17 s (the spring-back follows it), the sensor wake 0.65 s (cues.js WAKE).
// blind2 is not a click, but s07 cuts everything on its clack for 0.5 s, to gulp4 (only the paper boil is left); its fade
// back in ends on gulp4's frame (0.48 + 0.02), so the gulp's onset is whole.
const CLICKS = [['lampClickHome', 0.3], ['lampOffHome', 0.17], ['sensorWakeMarston', 0.65], ['blind2', 0.48]], FADE_OUT = 0.04, FADE_IN = 0.02;
function gateClicks(out) {
  const at = (s) => Math.round(s * SR);
  for (const [b, len] of CLICKS) {
    const t = beat(b), a = at(t - FADE_OUT), z = at(t), y = at(t + len), e = at(t + len + FADE_IN);
    for (let i = a; i < e && i < out.length; i++) out[i] *= i < z ? 1 - (i - a) / (z - a) : i < y ? 0 : (i - y) / (e - y);
  }
}

// Renders SCORE over [0, durSec) of film time as a mono Float32Array. Notes are cached, so the groove's
// repeats cost one synthesis each.
export function renderScore(durSec) {
  const out = new Float32Array(Math.round(durSec * SR)), cache = new Map();
  const note = (voice, m, vel, dur, vib, vibUntil) => {
    const k = `${voice}|${m}|${vel}|${dur}|${vib}|${vibUntil}`;
    if (!cache.has(k)) cache.set(k, voice === 'piano' ? feltPiano(m, { vel, dur }) : musicBox(m, { vel, dur, vib, vibUntil }));
    return cache.get(k);
  };
  for (const e of SCORE) {
    const t = beat(e.beat) + e.at, g = LEVEL * (e.gain ?? 1);
    if (t >= durSec) continue;
    if (e.voice === 'pad') mixInto(out, pad(e.midi, e), t, g);
    else if (e.voice === 'sub') mixInto(out, e.fade ? fadeOut(subSwell(e), e.fade) : e.ease ? easeDown(subSwell(e), e.ease) : subSwell(e), t, g);
    else for (const m of [e.midi].flat()) mixInto(out, note(e.voice, m, e.vel, e.dur, e.vib ?? 0, e.vibTo ? beat(e.vibTo) - t : Infinity), t, g);
  }
  gateClicks(out);
  return out;
}
