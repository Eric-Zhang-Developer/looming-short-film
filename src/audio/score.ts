// The film's score (doc 05 §Leitmotifs, §Structure by section): a flat list of note events plus one renderer.
// Every event is { beat, at, voice, midi, ... }: a beat name from src/timeline.ts plus an offset in seconds,
// never a global time, so retiming a shot moves its music. `motif` tags which leitmotif a note belongs to.
// Voices are doc 05's four, from synth.ts: felt piano, music box, warm pad, sub swell; plus v4's pulse, built from the
// clock's tick (foley.ts). An event may carry until: '<beat>' to stop dead on that beat. Mono, 48 kHz.
import { beat, S13_DESKS } from '../timeline.ts';
import { SR, feltPiano, musicBox, pad, subSwell, mixInto } from './synth.ts';
import type { PadOpts, SubOpts } from './synth.ts';
import { FOLEY } from './foley.ts';

// One flat shape for every voice; which fields count depends on the voice (renderScore). midi is a note or a chord
// (piano, box, pad) or null (sub, pulse).
type Voice = 'piano' | 'box' | 'pad' | 'sub' | 'pulse';
export type ScoreEvent = {
  beat: string, at: number, voice: Voice, midi: number | number[] | null,
  vel?: number, dur?: number, gain?: number, motif?: string, until?: string,
  attack?: number, release?: number, hz?: number, bend?: PadOpts['bend'], open?: PadOpts['open'], vib?: number, vibTo?: string,
};
type EvOpts = Omit<ScoreEvent, 'beat' | 'at' | 'voice' | 'midi'>;

// ───────── leitmotifs: [midi, offset s]. Fixed intervals and rhythm, so every return is the same shape ─────────
// The Exam: four music-box notes rising then falling, each a few cents out of tune (kept from snd-engine's bed).
const EXAM = [[72.14, 0], [75.9, 0.55], [81.18, 1.1], [74.88, 1.65]];
// The theme: the Exam's opening leaps (up a major 3rd, up a 4th) played in tune on the piano, with the sour
// fall to D# turned into a step down to G. C E A G E F D. Act 3 leaves it hanging on D; the grade lands it on C.
const THEME = [60, 64, 69, 67, 64, 65, 62];
// Left hand under each theme note: C, C/E, F, C/E, Am, Dm, Gsus4 (open). The grade swaps the last for G7.
const HARM = [[36, 43, 52], [40, 48], [41, 48, 57], [40, 48, 55], [45, 52], [38, 45, 53], [43, 50, 55, 60]];
const G7 = [43, 50, 53, 59];

const ev = (beatName: string, at: number, voice: Voice, midi: ScoreEvent['midi'], o: EvOpts = {}): ScoreEvent => ({ beat: beatName, at, voice, midi, ...o });
const exam = (beatName: string, at: number, o: EvOpts) => EXAM.map(([m, dt]) => ev(beatName, at + dt, 'box', m, { motif: 'exam', ...o }));
// The gulp (doc 05): the motif's first two notes (its rising third), k semitones down for gulp k, the second 0.275 s later
// (half the motif's spacing, a swallow) and 4k cents flatter (the drift growing); velocity 0.30 rising to 0.42 over v4's three.
const gulp = (k: number) => [[0, 0, 0.5], [1, 0.275, 0.8]].map(([j, at, dur]) =>
  ev(`gulp${k}`, at, 'box', EXAM[j][0] - k - (j ? 0.04 * k : 0), { vel: (24 + 6 * k) / 100, dur, motif: 'gulp' }));
// The shrink answer (doc 05 v4): the same two notes falling (second note first), 0.25 s after the solve's theme note, at
// about -6 dB under it. Five solves from the 2.5x peak: #1 -2 (one above the deepest gulp), #2 0 (birth size at birth
// pitch), #3 +1, #4 +2, #5 +3; then the test +4 and the cross-off +5.
const SHRINKS: [string, number][] = [['problemOneSolved', -2], ['problemSolved2', 0], ['problemSolved3', 1], ['problemSolved4', 2],
  ['problemSolved5', 3], ['testSolved', 4], ['examCrossedOff', 5]];
const shrink = ([b, k]: [string, number]) => [[1, 0.25, 0.5], [0, 0.525, 0.9]].map(([j, at, dur]) =>
  ev(b, at, 'box', EXAM[j][0] + k, { vel: 0.25, dur, motif: 'shrink' }));

// ───────── the avoidance groove ─────────
// 120 bpm, one bar = 2 s, each dodge's bars hung from that dodge's own beat: the fridge (bars −8…−5), game night (−4…−1),
// the lamp (0…3; bar 0 is the downbeat 0.5 s before lampClickHome, so gulp2 is bar 2's downbeat). v4's s04 and s05 are 7 s,
// so each dodge's last bar is cut to its first half (a 2/4 bar) and the next dodge still lands on a downbeat. The groove
// ends at bedRot, where s07 thins it to one dyad.
const BAR = 2, BAR0 = -0.5;
const DODGES: [string, number][] = [['fridge', -8], ['gameNight', -4], ['lampClickHome', 0], ['bedRot', 4]];
const dodge = (n: number) => DODGES.findLast(([, k]) => n >= k);
const bar = (n: number, sec = 0): [string, number] => { // → [beat, offset] of second `sec` in bar n
  const [b, n0] = dodge(n)!;
  return [b, (b === 'lampClickHome' ? BAR0 : 0) + (n - n0) * BAR + sec];
};
const barLen = (n: number) => n === 0 ? 0.5 : Math.min(BAR, (([b, o]) => beat(b) + o)(bar(n + 1)) - (([b, o]) => beat(b) + o)(bar(n)));
const CHORDS = [ // I vi IV V, one per bar; every dodge starts on I
  { oom: [48, 43], walk: [48, 52, 55, 57], stab: [64, 67, 72], mel: [[0, 67], [2, 64], [3, 67], [5, 72], [6, 67]] },
  { oom: [45, 40], walk: [45, 48, 52, 54], stab: [64, 69, 72], mel: [[0, 69], [2, 64], [3, 69], [5, 72], [6, 71]] },
  { oom: [41, 48], walk: [41, 45, 48, 50], stab: [65, 69, 72], mel: [[0, 69], [2, 65], [3, 69], [5, 72], [6, 74]] },
  { oom: [43, 50], walk: [43, 47, 50, 53], stab: [62, 67, 71], mel: [[0, 71], [2, 74], [3, 71], [4, 67], [6, 65]] },
];
const swing = (slot: number) => Math.floor(slot / 2) * 0.5 + (slot % 2) * 0.3; // eighths, swung 60:40

// Layers, one per dodge: 1 the fridge's oom-pah bass, 2 game night's stabs, 3 after the lamp's off click (v4's last dodge
// before bed) the bouncy tune over a walking bass, from gulp2's downbeat. s06 plays from 0.0 and cuts dead on the click
// (the gate does the cutting) and sits out the off click (bar 1, stop-time).
function groove() {
  const out: ScoreEvent[] = [];
  for (let n = -8; n < 4; n++) {
    if (n === 1) continue;
    const c = CHORDS[(n - dodge(n)![1]) % 4], end = barLen(n);
    const p = (sec: number, midi: number | number[], vel: number, dur: number) => sec < end && out.push(ev(...bar(n, sec), 'piano', midi, { vel, dur, motif: 'groove' }));
    if (n < 2) { p(0, c.oom[0], 0.55, 0.22); p(1, c.oom[1], 0.5, 0.22); }      // 1: oom-pah bass
    else c.walk.forEach((m, k) => p(k * 0.5, m, 0.55, 0.3));                     // 3: walking bass under the tune
    if (n >= -4) for (const s of n < 2 ? [2, 6] : [1, 3, 5, 7]) p(swing(s), c.stab, 0.33, 0.12);  // 2: stabs
    if (n >= 2) for (const [s, m] of c.mel) p(swing(s), m, 0.5, 0.16);                           // 3: the tune
  }
  return out;
}

// ───────── the walk (s09c-s10, doc 05 v4 "the swell, in sound") ─────────
// Everything on the pulse's grid (every global half-second from lamp1). Every event carries until: 'lightFlood', so on
// that frame it stops dead and only the held chord is left. The climb (+4 dB, marstonSeen → doorPush) is a gain ramp on the
// stem in renderScore, so it lifts every layer at once.
const W = (b: string, at: number, voice: Voice, midi: ScoreEvent['midi'], o: EvOpts = {}) => ev(b, at, voice, midi, { until: 'lightFlood', ...o });
const PULSE_N = Math.round((beat('lightFlood') - beat('lamp1')) / 0.5);   // 39 beats, 84.0 … 103.0
// Layer 2, the Exam motif rising: three-note cells built from its opening leaps (up a third, up a fourth), each cell
// starting a step higher (C, D, E), the opposite of the gulps' falling pair; one note per two pulses from lamp2, landing
// half a beat early on the motif's top note (A) at marstonSeen. Velocity climbs with it.
const RISE = [60, 64, 69, 62, 67, 71, 64, 69, 72, 74, 76];
const WALK = [
  // Layer 1 (lamp1): the pulse. The tick, an octave down, on a thump: lub on every beat, the dub +0.18 s, lighter.
  ...Array.from({ length: PULSE_N }, (_, k) => [W('lamp1', 0.5 * k, 'pulse', null, { gain: 0.2 }), W('lamp1', 0.5 * k + 0.18, 'pulse', null, { gain: 0.11 })]).flat(),
  ...RISE.map((m, k) => W('lamp2', k, 'piano', m, { vel: 0.4 + 0.02 * k, dur: 0.9, gain: 0.35, motif: 'rise' })),
  // ... and holds the top note: re-struck on every whole second to the peak (a piano can't hold, so it repeats).
  ...[0, 1, 2, 3, 4].map((k) => W('marstonSeen', k, 'piano', [69, 81], { vel: 0.5 + 0.04 * k, dur: 1, gain: 0.35, motif: 'rise' })),
  // Layer 3 (lamp3): the strings pad on C, a doubled G in it. On blobBlocks the double slides a semitone flat (F#
  // against G: a minor second, small, not a sting) and slides back on stepAround: the chord is whole again. At marstonSeen
  // it moves to G (the dominant, with the piano's A on top) and opens (its low-pass rises 2.5 kHz by doorPush).
  W('lamp3', 0, 'pad', [48, 52, 55, 55, 60], { dur: beat('marstonSeen') - beat('lamp3'), attack: 1.5, release: 1, gain: 1,
    bend: { voice: 3, at: [[beat('blobBlocks') - beat('lamp3'), 0], [beat('blobBlocks') - beat('lamp3') + 0.25, -1],
      [beat('stepAround') - beat('lamp3'), -1], [beat('stepAround') - beat('lamp3') + 0.25, 0]] }, motif: 'swell' }),
  W('marstonSeen', 0, 'pad', [43, 50, 55, 59, 62], { dur: beat('lightFlood') - beat('marstonSeen'), attack: 1, release: 0.5, gain: 2.2,
    open: { from: 0, to: beat('doorPush') - beat('marstonSeen'), hz: 2500 }, motif: 'swell' }),
  // Layer 4 (lamp4): the music box, the motif's opening (its rising third) in tune, every two seconds a step higher, up to
  // the piano's A. Its F at 98.0 and 101.5 makes the G a G7, which wants C.
  ...[[72, 76], [74, 77], [76, 79], [77, 81]].flatMap(([lo, hi], k) => [
    W('lamp4', 2 * k, 'box', lo, { vel: 0.4 + 0.05 * k, dur: 1.2, gain: 0.4, motif: 'exam-rising' }),
    W('lamp4', 2 * k + 0.5, 'box', hi, { vel: 0.45 + 0.05 * k, dur: 1.4, gain: 0.4, motif: 'exam-rising' }),
  ]),
  // Layer 5 (lamp5): the bass swell, 45 Hz, attack 6 s: its crest is the door push; its 0.5 s release ends on lightFlood.
  W('lamp5', 0, 'sub', null, { hz: 45, dur: beat('lightFlood') - beat('lamp5'), attack: 6, gain: 0.2, motif: 'swell' }),
  // The peak (doorPush): the G chord struck hard under the held A, with the push bar's clunk (cues.ts).
  W('doorPush', 0, 'piano', [31, 43, 50, 55, 59, 62], { vel: 0.8, dur: 0.6, gain: 0.2, motif: 'peak' }),
];

// ───────── s13 (v7): a note on every shadow event ─────────
// Every crowd desk in S13_DESKS (timeline.ts) wakes on a note and goes face down on a note, read from that one table.
// Build (v3's, the one the director called "timed with the music"): the three featured wakes get v3's three chords, the
// bass stepping down A, F, E (Am, Fmaj7, E7: everyone stuck, left on the dominant); the room's seven wakes climb E7 one
// note each on the music box, the blobs' voice (on the piano they sank into the held E7: the stem's first-difference
// level rose 0.3-2.7 dB on them, against 4-10 on the chords), over a sub swell from the head lift (the shadows growing,
// doc 05) that stops dead on the turn. Turn: Act 4's
// theme in major, C E A G, a theme note and its chord on the first phone of each pair, a chord tone above on the second;
// so the E7 opens onto C instead of resolving to A minor. The last two phones land on the home chord and its top note,
// and a pad holds that C into s15, where the theme goes on at nameWritten.
const S13_WAKE: Record<string, number | number[]> = { d2: [45, 52, 60], d4: [41, 48, 57, 64], d15: [40, 47, 56, 62], d1: 64, d11: 68, d5: 71, d12: 74, d14: 76, d7: 80, d9: 83 };
const S13_DOWN: Record<string, [number, number[]?]> = { d7: [THEME[0], HARM[0]], d9: [67], d2: [THEME[1], HARM[1]], d12: [72], d4: [THEME[2], HARM[2]], d14: [72],
  d1: [THEME[3], HARM[3]], d11: [76], d5: [72, [36, 43, 52, 60, 67]], d15: [76] };
const FEATURED: Record<string, number> = { revealSleeper: 2.2, revealDrinks: 2.2, revealFreshman: beat('phonesDown') - beat('revealFreshman') };   // chord lengths
const s13Keys = (o: object) => Object.keys(o).sort().join();
if (s13Keys(S13_WAKE) !== s13Keys(S13_DESKS) || s13Keys(S13_DOWN) !== s13Keys(S13_DESKS)) throw new Error('score: every s13 desk needs a wake note and a down note');
const S13 = [
  ev('headLift', 0, 'sub', null, { hz: 45, dur: beat('phonesDown') - beat('headLift'), attack: 3, gain: 0.15, until: 'phonesDown', motif: 'swell' }),
  ...Object.entries(S13_DESKS).map(([d, { wake: [b, at] }]) => b in FEATURED
    ? ev(b, at, 'piano', S13_WAKE[d], { vel: 0.35, dur: FEATURED[b] })
    : ev(b, at, 'box', S13_WAKE[d], { vel: 0.3 + 0.03 * at / 0.125, dur: 0.6, motif: 'loom' })),   // louder as the room fills
  ...Object.entries(S13_DESKS).flatMap(([d, { down: [b, at] }]) => {
    const [m, chord] = S13_DOWN[d], home = b === 'homeChord', dur = home ? 2.5 : 1.2;
    return chord ? [ev(b, at, 'piano', m, { vel: 0.42, dur, gain: 0.7, motif: 'theme' }), ev(b, at, 'piano', chord, { vel: home ? 0.35 : 0.32, dur, gain: 0.7 })]
      : [ev(b, at, 'piano', m, { vel: 0.3, dur: home ? 2.5 : 0.8, gain: 0.7 })];
  }),
  ev('homeChord', 0, 'pad', [48, 55, 64, 72], { dur: 4, attack: 0.8, release: 2.5, gain: 0.3, motif: 'chord' }),
];

export const SCORE: ScoreEvent[] = [
  // 0:00–0:19 Birth. A dawn pad drains away as the ink drop forms; the Exam motif enters on the music box.
  ev('inkDropForms', -10, 'pad', [48, 55, 64, 74], { dur: 8, attack: 3, release: 3, gain: 0.5 }),
  ...exam('inkDropForms', 0.3, { vel: 0.55, dur: 1.4 }),
  ev('laptopUp', 0, 'sub', null, { hz: 42, dur: 5, attack: 3, gain: 0.2 }),           // shadow climbs the wall
  // The three gulps: 0:23.5 (s03), 0:44 (s06), 0:55.5 (s07, bed rot).
  ...[1, 2, 3].flatMap(gulp),

  // 0:19–0:48 Avoidance. The groove adds a layer per dodge; a sub swell per dodge, each lower-floored and louder.
  ...groove(),
  ev('fridge', 0, 'sub', null, { hz: 44, dur: beat('gameNight') - beat('fridge') + 0.5, attack: 3, gain: 0.25 }),
  ev('gameNight', 0, 'sub', null, { hz: 47, dur: beat('lampClickHome') - beat('gameNight'), attack: 3, gain: 0.3 }), // ends on the click: shadow snaps down
  ...exam('lampClickHome', 0.35, { vel: 0.4, dur: 0.45 }),                              // blob small, right there; done before the off click
  // shadow springs back, to s07; 0.22, not G4's 0.35: under the groove's last bars it out-measured the door push (snd-v4)
  ev('lampOffHome', 0.17, 'sub', null, { hz: 50, dur: beat('bedRot') - beat('lampOffHome') - 0.17, attack: 0.4, gain: 0.22 }),

  // 0:48–1:00 Bed rot (v4). The groove thins and flattens to one sustained felt-piano dyad, C and E 15 cents flat,
  // decaying across the shot; gulp 3's sub, the deepest, at 0.3 (G4's 0.55 measured louder than the climax's peak; doc 05 hangs no shadow growth on bedRot itself: the shot is the
  // thinnest in the film, not a dodge). All of it stops dead on clockThree.
  ev('bedRot', 0, 'piano', [47.85, 51.85], { vel: 0.4, dur: 12, until: 'clockThree', motif: 'thin' }),
  ev('gulp3', 0, 'sub', null, { hz: 56, dur: beat('clockThree') - beat('gulp3') + 0.5, attack: 1, gain: 0.3, until: 'clockThree' }),

  // 1:00–1:10 3 a.m.: music out. Only the tick (cues.ts).

  // 1:10–1:16 The choice (v4). One low held note under the breath: felt piano low C, very soft, with a slow pad swell
  // under it, ringing into s09b and dissolving into the door's swell.
  ev('breathIn', 0, 'piano', 36, { vel: 0.4, dur: beat('doorOpen') - beat('breathIn'), gain: 0.6, motif: 'held' }),
  ev('breathIn', 0, 'pad', [48, 55], { dur: beat('doorOpen') - beat('breathIn') - 1, attack: 3, release: 1.5, gain: 0.35, motif: 'held' }),
  // 1:16–1:22 The door. No music; the shadow's sub as it's thrown down the hall (2 s attack), kept under the pulse
  // that follows it so the walk's build starts from below (snd-v4 measured 0.4 at S -16.9 against the pulse's -27.9).
  ev('shadowAhead', 0, 'sub', null, { hz: 48, dur: beat('walkStart') - beat('shadowAhead'), attack: 2, gain: 0.15 }),

  // 1:22–1:43.5 The walk and the threshold: the build, then the peak (WALK above).
  ...WALK,
  // 1:43.5 The light: one held C-major chord, wide, felt piano and pad, decaying to near-silence by ~106.
  ev('lightFlood', 0, 'piano', [36, 43, 52, 60, 67, 76], { vel: 0.55, dur: 2.5, gain: 0.35, motif: 'chord' }),
  ev('lightFlood', 0, 'pad', [48, 55, 64, 72], { dur: 0.3, attack: 0.15, release: 2.2, gain: 0.3, motif: 'chord' }),
  // The blob blinks: one music-box note at its birth pitch, very soft. Confused, not gone.
  ev('blobBlinks', 0, 'box', EXAM[0][0], { vel: 0.2, dur: 1.2, motif: 'exam' }),
  // 1:52–1:56.5 The stacks (v6): the chord's near-silence keeps its breath, then Act 4's theme arrives with the library,
  // before the desk: its first two notes on felt piano, softer than the desk's statement, one per strip light, over a low
  // C-major pad that carries him to the desk, where the phrase is stated in full.
  ev('underLight1', 0, 'pad', [36, 48, 55, 64], { dur: beat('deskSit') - beat('underLight1'), attack: 2, release: 1.5, gain: 0.2 }),
  ...([['underLight1', 0, 2.4], ['underLight2', 1, 2]] as [string, number, number][]).flatMap(([b, k, dur]) => [
    ev(b, 0, 'piano', THEME[k], { vel: 0.24, dur, motif: 'theme' }),
    ev(b, 0, 'piano', HARM[k], { vel: 0.19, dur }),
  ]),

  // 1:50–2:02 Under the light (v4): Act 4's theme in major, softly: its first phrase on felt piano, one note every two
  // seconds over major chords, and the music box answering with the motif's first note when the blob settles.
  ...[[0, 0], [2, 1], [4, 2], [6, 3]].flatMap(([at, k]) => [
    ev('deskSit', at, 'piano', THEME[k], { vel: 0.35, dur: 1.8, motif: 'theme' }),
    ev('deskSit', at, 'piano', HARM[k], { vel: 0.28, dur: 1.8 }),
  ]),
  ev('blobSettles', 0, 'box', EXAM[0][0], { vel: 0.3, dur: 1.4, motif: 'exam' }),
  // 2:03–2:11 Everyone has one (v7, S13 above): v3's build, then the turn.
  ...S13,

  // 2:02–2:26 First step. One held note when he writes his name; then a theme note per solved problem (five in v4); the
  // phrase completes on #5 (F, then D half a beat later) and is released by s17's first frame.
  ev('nameWritten', 0, 'piano', THEME[0], { vel: 0.5, dur: 6.5, motif: 'theme' }),
  ev('problemOneSolved', 0, 'piano', THEME[1], { vel: 0.5, dur: 3, motif: 'theme' }),
  ...([['problemSolved2', 0, 1], ['problemSolved3', 0, 0.8], ['problemSolved4', 0, 0.8], ['problemSolved5', 0, 0.4], ['problemSolved5', 0.5, 0.25]] as [string, number, number][]).flatMap(([b, at, dur], k) => [
    ev(b, at, 'piano', THEME[k + 2], { vel: 0.48, dur, motif: 'theme' }),
    ev(b, at, 'piano', HARM[k + 2], { vel: 0.35, dur }),
  ]),

  // Each solved problem's shrink answer, then the test's and the cross-off's.
  ...SHRINKS.flatMap(shrink),

  // 2:26–2:38 Quiet 2: no music.

  // 2:38–2:48 The test (s17b). Ambience only at first; at the smile, s15's first-step note recalled, soft. The test's
  // solve leans home (E over C/E) without getting there: landing on C is the grade's.
  ev('testSmile', 0, 'piano', THEME[0], { vel: 0.35, dur: 3, motif: 'theme' }),
  ev('testSolved', 0, 'piano', THEME[1], { vel: 0.45, dur: 2, motif: 'theme' }),
  ev('testSolved', 0, 'piano', HARM[1], { vel: 0.33, dur: 2 }),

  // 2:48–3:15 The grade and the ending. On gradeReveal the music box (the blob's voice) plays the Exam's opening in tune,
  // its sour last note turned into the theme's step down to G (C E A G), doubling the felt piano an octave up. The theme
  // goes on, one note a second, its D on G7; v4: on gradeGrin a second piano voice joins it a third above. It lands on C
  // held as a chord through the dissolve (blobAbsorbed), a pad under it.
  ...THEME.slice(0, 4).map((m, k) => ev('gradeReveal', k, 'box', m + 12, { vel: 0.35, dur: 1.2, motif: 'exam-resolved' })),
  ...THEME.flatMap((m, k) => [
    ev('gradeReveal', k, 'piano', m, { vel: 0.45, dur: 0.9, motif: 'theme' }),
    ev('gradeReveal', k, 'piano', k === 6 ? G7 : HARM[k], { vel: 0.35, dur: 0.9 }),
  ]),
  ...[72, 71, 67, 69, 65].map((m, k) => ev('gradeGrin', k, 'piano', m, { vel: 0.3, dur: 0.9, motif: 'theme' })),
  ev('blobAbsorbed', -1.5, 'piano', 60, { vel: 0.45, dur: 5, motif: 'theme' }),
  ev('blobAbsorbed', -1.5, 'piano', [36, 43, 52, 55], { vel: 0.38, dur: 5 }),
  ev('blobAbsorbed', -1.5, 'pad', [48, 55, 64, 72], { dur: 6, attack: 2.5, release: 3.5, gain: 0.5 }),
  // The dissolve: the Exam motif's last note once more, at its birth pitch, over the held chord. Its voice, one last time.
  ev('blobAbsorbed', 0, 'box', EXAM[3][0], { vel: 0.35, dur: 1.6, motif: 'exam' }),
  // The tag: a new drop beads. The motif's first two notes at the birth pitch, softer than at inkDropForms, trembling
  // (vibrato) until the uncap's frame, where the tremble stops dead and the note rings on still. Then s15's held note.
  ...EXAM.slice(0, 2).map(([m, dt], j) => ev('dropQuivers', 0.3 + dt, 'box', m, { vel: 0.3, dur: j ? 2.4 : 1.4, vib: 25, vibTo: 'tagPenUncap', motif: 'reprise' })),
  // v6: the drop becomes his first mark, and its voice becomes home. It blinks at him (0.75) on its birth pitch, a little
  // sharp as ever; landing on the nib (1.25, the plip) the same note comes back in tune, C, resolved; and the "1." (1.917)
  // gets the film's home chord, C major, felt piano and pad, ringing into the fade.
  ev('tagPenUncap', 0.75, 'box', EXAM[0][0], { vel: 0.28, dur: 0.45, motif: 'exam' }),
  ev('tagPenUncap', 1.25, 'box', 72, { vel: 0.35, dur: 1.6, motif: 'exam-resolved' }),
  ev('tagPenUncap', 1.917, 'piano', [36, 43, 52, 60, 67, 76], { vel: 0.42, dur: 1.6, gain: 0.35, motif: 'chord' }),
  ev('tagPenUncap', 1.917, 'pad', [48, 55, 64, 72], { dur: 1.2, attack: 0.3, release: 1.2, gain: 0.35, motif: 'chord' }),
];

// Music sits under the foley: the lamp click (about -5 dBFS in the foley stem) stays the loudest transient.
const LEVEL = 0.5;

// Doc 05: every lamp click is dry and exposed, so the music stem is true zero across each click's own window.
// Notes and their room tails ring through it (the groove's bar −1 stabs reach the home click; s09a's held note runs
// under the nightstand lamp's click), so the gate fades the stem out over 40 ms before the click and back in 20 ms after
// the window. Beat-relative, like the notes. [beat, window]: a lamp click is 0.3 s, the off click's 0.17 s (the spring-back follows it).
const CLICKS: [string, number][] = [['lampClickHome', 0.3], ['lampOffHome', 0.17], ['lampOn', 0.3]];
const FADE_OUT = 0.04, FADE_IN = 0.02;
function gateClicks(out: Float32Array) {
  const at = (s: number) => Math.round(s * SR);
  for (const [b, len] of CLICKS) {
    const t = beat(b), a = at(t - FADE_OUT), z = at(t), y = at(t + len), e = at(t + len + FADE_IN);
    for (let i = a; i < e && i < out.length; i++) out[i] *= i < z ? 1 - (i - a) / (z - a) : i < y ? 0 : (i - y) / (e - y);
  }
}
// The climb (doc 05 v4): every layer +4 dB, linear in dB, marstonSeen → doorPush, held to lightFlood, where the walk's
// events have all stopped (until), so the held chord is untouched.
const CLIMB_DB = 4;
function climb(out: Float32Array) {
  const t0 = beat('marstonSeen'), t1 = beat('doorPush'), t2 = beat('lightFlood');
  for (let i = Math.round(t0 * SR); i < Math.round(t2 * SR) && i < out.length; i++)
    out[i] *= 10 ** (CLIMB_DB * Math.min(1, (i / SR - t0) / (t1 - t0)) / 20);
}
// until: the event stops dead on that beat's frame (a 5 ms fade, so no click), tails and all. Returns a copy.
function cut(buf: Float32Array, sec: number) {
  const n = Math.max(0, Math.min(buf.length, Math.round(sec * SR))), f = Math.min(n, Math.round(0.005 * SR)), o = buf.slice(0, n);
  for (let i = 0; i < f; i++) o[n - 1 - i] *= i / f;
  return o;
}

// Renders SCORE over [0, durSec) of film time as a mono Float32Array. Notes are cached, so the groove's
// repeats cost one synthesis each.
export function renderScore(durSec: number) {
  const out = new Float32Array(Math.round(durSec * SR)), cache = new Map<string, Float32Array>();
  const note = (voice: Voice, m: number, vel: number | undefined, dur: number | undefined, vib: number, vibUntil: number) => {
    const k = `${voice}|${m}|${vel}|${dur}|${vib}|${vibUntil}`;
    if (!cache.has(k)) cache.set(k, voice === 'piano' ? feltPiano(m, { vel, dur }) : musicBox(m, { vel, dur, vib, vibUntil }));
    return cache.get(k)!;
  };
  const pulse = FOLEY.pulse();
  for (const e of SCORE) {
    const t = beat(e.beat) + e.at, g = LEVEL * (e.gain ?? 1);
    if (t >= durSec) continue;
    const put = (buf: Float32Array) => mixInto(out, e.until ? cut(buf, beat(e.until) - t) : buf, t, g);
    // The voice fixes the shape (ev's callers): a pad has a chord and a dur, a sub a dur, a piano or box note a midi.
    if (e.voice === 'pad') put(pad(e.midi as number[], e as PadOpts));
    else if (e.voice === 'sub') put(subSwell(e as SubOpts));
    else if (e.voice === 'pulse') put(pulse);
    else for (const m of [e.midi as number | number[]].flat()) put(note(e.voice, m, e.vel, e.dur, e.vib ?? 0, e.vibTo ? beat(e.vibTo) - t : Infinity));
  }
  climb(out);
  gateClicks(out);
  return out;
}
