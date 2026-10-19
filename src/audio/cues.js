// @ts-check
// Cue sheet: sounds placed by beat name (src/timeline.js), never by raw time. Moving a beat moves its sound.
// stem: 'foley' (default) | 'ambience' | 'music'. seed: defaults to seedOf(sound) in tools/mix.mjs,
// so the two lamp clicks share one seed and are sample-identical (doc 05).
// offset: seconds after the beat (may be negative, default 0); the cue starts at beat(beat) + offset.
// Length (beds): dur in seconds, or until: '<beatName>' (runs from the cue's start to that beat). tools/mix.mjs passes it
// as FOLEY[sound](seed, dur); with neither, the sound plays at its default length.
//
// A point is [beatName, offsetSeconds]. bed() runs a bed from one point to another, so a bed that stops 0.5 s before a
// beat is still hung on beats and moves when they move. Sources: doc 05's v4 table and docs/shots/sNN.md §Sound (the v4 cut, 3:15).
// The music stem (score.js) is not placed here.
import { beat, DURATION } from '../timeline.js';

const at = ([b, o = 0]) => beat(b) + o;
const bed = (sound, stem, from, to, gain, extra) => ({ beat: from[0], offset: from[1] ?? 0, dur: at(to) - at(from), sound, stem, gain, ...extra });
const AMB = 'ambience';
const START = ['notifyBuzz', -beat('notifyBuzz')];                // 0:00. s00's only beat
const S01 = ['notifyBuzz', 4 - beat('notifyBuzz')];                // 0:04, s01 has no beat of its own
const S18 = ['examCrossedOff', -2];                                 // 2:55, s18 @ 0
const END = ['tagPenUncap', DURATION - beat('tagPenUncap')];        // 3:15
// Doc 05: every lamp click is dry and exposed. Beds stop on it and come back after its window (the music stem does the
// same in score.js), which is also what keeps the three clicks identical in mix.wav. A lamp click is 0.3 s.
const ON = (b) => [b, 0.3];
// snd-foley-2's sounds, in one place so a level pass touches one table.
const dB = (x) => 10 ** (x / 20);
const GAIN = { jarClink: 0.4, cartonSlosh: 0.5, tvBloops: 0.4, winJingle: 0.3, roommateStep: 0.4, rodSnap: 0.2, cardTap: 0.4, cs2: dB(-30) };
// v7, s07's reels: [file in assets/raw/reels/, in-point in the clip (s), from, to (s07 local s)]. Third-party audio: the
// clips are gitignored and never committed; without them tools/mix.mjs leaves these cues silent and says so. The in-points
// are each clip's first onset (by waveform; nobody has listened yet), so retime them here by ear. Director: four reels,
// 2-4 s each; two before the reminder, two after. The cuts are the flicks; when the picture is reworked, its flicks
// follow this table. (Deoy-54x6aJ, the fifth clip given, is unused: the quietest and flattest of the five.)
export const REELS = /** @type {[string, number, number, number][]} */ ([
  ['DIR3LipSfp6', 0.15, 0.5, 3.25], ['DbSRzwjx3hR', 0, 3.25, 6.25], ['DMbt-octmy6', 0, 7.75, 10.0], ['Ddrfu6TxBq-', 0, 10.0, 12.0]]);

// snd-v4: the clock. One cue per tick, each on a whole second of global time (the beats it hangs on are whole seconds, or
// offsets that land on one), so the tick and the walk's pulse share one grid. Every tick is clockTick's one buffer; the
// variants only filter it for distance (foley.js).
const ticks = (sound, b, offsets, gain) => offsets.map((o) => ({ beat: b, offset: o, sound, gain, stem: AMB }));
const range = (a, z) => Array.from({ length: z - a + 1 }, (_, k) => a + k);

// walk-redo: footsteps follow the picture. s09c's gait is timed: a contact every STEP (0.25 s) on the global pulse grid
// from 84.0, up to the block, then from stepAround (a contact) to the turn. The side-steps around the blob and the
// back-view walk after the turn are timed as before, as in s09c.js.
// ponytail: STEP, DECIDE (blobBlocks + 7/6) and TURN (18.0) mirror s09c.js, which doesn't export them; import them if it ever does.
const STEP = 0.25, S09C = beat('walkStart'), lb = (b) => beat(b) - S09C;
const DECIDE = lb('blobBlocks') + 7 / 6, TURN = 18.0, twos = (t) => Math.ceil(t * 12 - 1e-6) / 12;
function walkSteps() {
  const out = [];
  const timed = (t0, t1) => { for (let t = t0; t < t1 - 1e-9; t += STEP) out.push(t); };
  timed(0, lb('blobBlocks'));
  for (let m = 1; m <= 3; m++) out.push(twos(DECIDE + m * (lb('stepAround') - DECIDE) / 3));   // the third lands on stepAround
  timed(lb('stepAround') + STEP, TURN);
  timed(TURN + STEP, 20);
  return out;
}
export const WALK_STEPS = walkSteps();

export const CUES = [
  // ───────── ambience beds ─────────
  // Paper boil: throughout, very low (doc 05), broken only at the three lamp clicks (the off click's window is 0.17 s: the rustle follows it).
  bed('paperBoil', AMB, START, ['lampClickHome'], 1),
  bed('paperBoil', AMB, ON('lampClickHome'), ['lampOffHome'], 1),
  bed('paperBoil', AMB, ['lampOffHome', 0.17], ['lampOn'], 1),
  bed('paperBoil', AMB, ON('lampOn'), END, 1),
  // Room tone: s00 at its lowest, s01-s03 morning, then 3 dB down from laptopUp; the lobby's warm hush from lightFlood
  // (very faint) to Quiet 2; Quiet 2; s18's home.
  bed('roomTone', AMB, START, S01, 0.4),
  bed('roomTone', AMB, S01, ['laptopUp'], 1),
  bed('roomTone', AMB, ['laptopUp'], ['fridge'], 0.7),
  bed('roomTone', AMB, ['lightFlood'], ['quiet2Start'], 0.5),
  bed('roomTone', AMB, ['quiet2Start'], ['examRoom'], 1),
  bed('roomTone', AMB, S18, END, 1),
  // v4, new: the night room (nightHum, a darker room tone) in bed (s07), very low at 3 a.m. (s08) and through the choice
  // (s09a), out for the nightstand lamp's click, to the door. Then the hall (hallHum: +6 dB over 0.5 s on doorOpen) to the
  // walk, the campus night air to the light, and the lobby's distant fluorescent hum at -24 dB from the light to the exam room.
  bed('nightHum', AMB, ['bedRot'], ['clockThree'], 0.8),
  bed('nightHum', AMB, ['clockThree'], ['lampOn'], 0.5, { seed: 2 }),
  bed('nightHum', AMB, ON('lampOn'), ['doorOpen'], 0.5, { seed: 3 }),
  bed('hallHum', AMB, ['doorOpen'], ['walkStart'], 1),
  bed('nightAir', AMB, ['walkStart'], ['lightFlood'], 1),
  bed('fluorescentHum', AMB, ['lightFlood'], ['examRoom'], dB(-24)),
  // s17b-s17c: the exam room's hush, -6 dB for one second at testRecognise (the world narrows), then -12 dB under
  // s17c (the room empties). Segments overlap by 50 ms so the seams don't dip. Its clock is clockTick (below).
  bed('examHush', AMB, ['examRoom'], ['testRecognise', 0.05], 1),
  bed('examHush', AMB, ['testRecognise'], ['testRecognise', 1.05], 0.5, { seed: 2 }),
  bed('examHush', AMB, ['testRecognise', 1], ['gradeSlide', 0.05], 1, { seed: 3 }),
  bed('examHush', AMB, ['gradeSlide'], S18, 0.25, { seed: 4 }),
  // Fridge: the whole of s04.
  bed('fridgeHum', AMB, ['fridge'], ['gameNight'], 0.4),
  // Screen glow hum (phoneHum): the laptop from laptopUp through s06 (cut dead on the click, back 0.17 s after the off),
  // then the phone in s07; off on clockThree (doc 05: it would compete with the tick).
  bed('phoneHum', AMB, ['laptopUp'], ['lampClickHome'], 0.3),
  bed('phoneHum', AMB, ['lampOffHome', 0.17], ['clockThree'], 0.3),
  // Dawn birds: one sparse phrase group per bird beat.
  { beat: 'dawnBird1', sound: 'dawnBirds', stem: AMB, dur: 3.5, seed: 41, gain: 0.5 },
  { beat: 'dawnBird2', sound: 'dawnBirds', stem: AMB, dur: 3.5, seed: 42, gain: 0.5 },
  { beat: 'dawnBird3', sound: 'dawnBirds', stem: AMB, dur: 3.5, seed: 43, gain: 0.5 },

  // ───────── v4, new: the clock (doc 05 clockTick) ─────────
  // s02, W only, -30 dB: 9.0 and 10.0 (W 0.0-1.5), 17.0 and 18.0 (W 7.083-10.0). Planted so s08 can take everything else away.
  ...ticks('clockTick', 'calendarZoom', [-1.5, -0.5], dB(-30)),
  ...ticks('clockTick', 'inkDropForms', [3, 4], dB(-30)),
  // s08, alone, 60.0-69.0 on every second: close and dry in C1 (0-2), a little further in C2 (2-7), room-distant in C3
  // (7-10); never under -20 dB, the loudest thing in the film's quietest scene.
  ...ticks('clockTick', 'clockThree', [0, 1], dB(-12)),
  ...ticks('clockTickMid', 'clockThree', range(2, 6), dB(-12)),
  ...ticks('clockTickFar', 'clockThree', range(7, 9), dB(-14)),
  // s09a 70.0-75.0 at -16 dB, -4 dB under the held note from breathIn; none at 74.0: the nightstand lamp's click lands on
  // that second and takes the tick's place (doc 05: "on the tick at 74.0"; the click must sound alone to stay identical).
  // s09b 76.0-81.0 room-distant through his door; s09c 82.0, 83.0, then the tick becomes the pulse (score.js).
  ...ticks('clockTickMid', 'phoneFaceDown', [-0.5, 0.5], dB(-16)),
  ...ticks('clockTickMid', 'breathIn', [0.5, 1.5, 3.5], dB(-20)),
  ...ticks('clockTickFar', 'doorOpen', range(-1, 4), dB(-16)),
  ...ticks('clockTickMid', 'walkStart', [0, 1], dB(-16)),
  // s17b: the same tick with the exam room's reverb, 158.0-167.0: -18 dB in the clock insert (K, 0.0-1.0), -26 dB after.
  ...ticks('clockTickExam', 'examRoom', [0], dB(-18)),
  ...ticks('clockTickExam', 'examRoom', range(1, 9), dB(-26)),
  // s18, W only, -30 dB: W 0-3 (175-177), 7.0-10.0 (182-184), 14.5-20.0 (190-194). Just a clock again.
  ...ticks('clockTick', 'examCrossedOff', [-2, -1, 0, 5, 6, 7, 13, 14, 15, 16, 17], dB(-30)),

  // ───────── foley ─────────
  // s00: the notification, the film's first sound over black. Two buzzes, one buffer.
  { beat: 'notifyBuzz', sound: 'phoneBuzz', gain: 0.7 },
  { beat: 'notifyBuzz', offset: 1.5, sound: 'phoneBuzz', gain: 0.7 },
  // s02: the bead, the perch, the landing, two hop taps (s02 §Sound).
  { beat: 'inkDropForms', sound: 'inkDrip', gain: 0.35 },
  { beat: 'inkDropForms', offset: 1.0, sound: 'inkDrip', gain: 0.3 },
  { beat: 'inkDropForms', offset: 2.42, sound: 'inkDrip', gain: 0.7 },
  { beat: 'inkDropForms', offset: 4.04, sound: 'inkDrip', gain: 0.3 },
  { beat: 'inkDropForms', offset: 4.83, sound: 'inkDrip', gain: 0.3 },
  // Shadow-growth rustles (the sub is in the score): s03, s04 x3, s05, s06 spring-back, s07's gulp, s09b's hallway shadow.
  { beat: 'laptopUp', sound: 'paperRustle', gain: 0.4 },
  { beat: 'fridge', sound: 'paperRustle', gain: 0.5 },
  { beat: 'fridge', offset: 2.33, sound: 'paperRustle', gain: 0.3, seed: 2 },
  { beat: 'fridge', offset: 5.33, sound: 'paperRustle', gain: 0.3, seed: 3 },
  { beat: 'gameNight', sound: 'paperRustle', gain: 0.5, seed: 4 },
  { beat: 'lampOffHome', offset: 0.17, sound: 'paperRustle', gain: 0.4, seed: 5 },
  { beat: 'gulp3', sound: 'paperRustle', gain: 0.35, seed: 9 },
  { beat: 'shadowAhead', sound: 'paperRustle', gain: 0.35, seed: 10 },
  // s05: controller button-mashing through the shot.
  { beat: 'gameNight', offset: 0.3, sound: 'controllerClick', gain: 0.35, seed: 3 },
  { beat: 'gameNight', offset: 1.9, sound: 'controllerClick', gain: 0.35, seed: 5 },
  { beat: 'gameNight', offset: 3.3, sound: 'controllerClick', gain: 0.35, seed: 8 },
  { beat: 'gameNight', offset: 5.4, sound: 'controllerClick', gain: 0.35, seed: 13 },
  { beat: 'gameNight', offset: 6.0, sound: 'controllerClick', gain: 0.35, seed: 21 },   // v4: was 6.9 in G4's 8 s s05; at 6.9 its 0.9 s mash ran through the lamp click
  // The lamp clicks: the identical lampClick, same seed and gain, three times. s06's on and off, and v4's nightstand lamp in
  // s09a (Q17): the click that chose the dark is the click that leaves. One seed, one gain (doc 05). snd-v4 lowered the shared
  // gain 0.8 → 0.6: it is the premix's true peak, and the v4 cut's quieter body needs it 2.5 dB lower to fit -16 LUFS / -4 dBTP
  // (tools/mix.mjs). It is still the loudest transient: the master limiter's ceiling is its peak.
  { beat: 'lampClickHome', sound: 'lampClick', gain: 0.6 },
  { beat: 'lampOffHome', sound: 'lampClick', gain: 0.6 },
  { beat: 'lampOn', sound: 'lampClick', gain: 0.6 },
  // The blob's gulps (doc 05): a soft inkDrip swallow at -18 dB under the score's two notes, one per gulp (three in v4).
  ...[1, 2, 3].map((k) => ({ beat: `gulp${k}`, sound: 'inkDrip', gain: 0.126, seed: 20 + k })),
  // s07: the thumb's scroll ticks, -22 dB, seeded per flick. v7: one per reel, on its cut (REELS), where the picture's
  // flicks are too (was every 0.75 s). No clock tick under s07, though its second hand moves from 48.0: the tick's first
  // close appearance is s08's, on the frame the music goes out.
  ...REELS.map(([, , o], k) => ({ beat: 'bedRot', offset: o, sound: 'scrollTick', gain: dB(-22), seed: 1 + k })),
  // v7: the doom scroll. Real Reels audio (the director's clips) out of the phone, each cut hard by the next flick, so
  // it plays as scrolling. Quiet for the 7-hours reminder (6.25-7.75: the chime, the swipe, the gulp), then
  // straight back to the feed, and cut dead by s08's hard cut to the lone tick at 60.0. tools/mix.mjs decodes them
  // through a phone-speaker band and levels each window to one RMS.
  ...REELS.map(([file, inSec, from, to]) => ({ beat: 'bedRot', offset: from, dur: to - from, sound: 'clip', file, in: inSec, gain: dB(-24) })),
  // s08, new: his breath, nasal, -24 dB, phased to the picture as built (climax-a1): in at 65.67, out at 67.25, in at 68.75
  // (doc 05's 20/min, a cycle of 3.08 s), to the choice's slow in-breath at 71.75.
  bed('breathNasal', 'foley', ['clockThree', 5.67], ['breathIn', 0.25], dB(-24)),
  // s09a, new: the phone face down on his hoodie (the card tap); the slow breath, in 71.75-72.5, out 72.5-72.92, -20 dB;
  // the blanket as he sits up (ends 0.15 s before the lamp click, so the click's window stays its own); the backpack.
  // v6-canvas-b: phoneFaceDown is now his thumb tapping the reminder open (a tap on glass); the phone meets his hoodie at
  // 72.75, in the wide, where the light dies.
  { beat: 'phoneFaceDown', sound: 'scrollTick', gain: dB(-18), seed: 30 },
  { beat: 'phoneFaceDown', offset: 2.25, sound: 'cardTap', gain: GAIN.cardTap },
  { beat: 'breathIn', offset: 0.25, sound: 'breathSlow', gain: dB(-20) },
  { beat: 'sitUp', sound: 'paperRustle', dur: 0.35, gain: 0.3, seed: 12 },
  { beat: 'backpackGrab', sound: 'backpackGrab', gain: 0.6 },
  // climax-a1 as built: his first step at 75.75 (his room's floor: the soft step) and the blob's hop landing at 76.0.
  { beat: 'backpackGrab', offset: 0.75, sound: 'footstepSoft', gain: dB(-20), seed: 5 },
  { beat: 'backpackGrab', offset: 1, sound: 'inkDrip', gain: 0.2, seed: 39 },
  // v6-canvas-b: the Canvas reminder, four times, one chime: two high gameBlip notes 80 ms apart, the same pair each time
  // (the same notification every time; phoneBuzz stays s00's two). On arrival: s03 22.25 (the laptop), s06 43.21 (the
  // phone on the desk lights with the lamp-off at 43.0; the chime waits out the click's 0.17 s window so the three clicks
  // stay identical), s07 54.25, s09a 70.0 (on the tick). Each swipe is a soft thumbFlick as the banner starts to go,
  // 0.25 s before its gulp, clear of the gulp's frame.
  ...(/** @type {[string, number][]} */ ([['gulp1', -1.25], ['lampOffHome', 0.21], ['gulp3', -1.25], ['phoneFaceDown', -0.5]])).flatMap(([b, o]) => [
    { beat: b, offset: o, sound: 'gameBlip', gain: 0.1, seed: 105 },
    { beat: b, offset: o + 0.08, sound: 'gameBlip', gain: 0.1, seed: 107 }]),
  ...['gulp1', 'gulp2', 'gulp3'].map((b, k) => ({ beat: b, offset: -0.25, sound: 'thumbFlick', gain: dB(-24), seed: 40 + k })),
  // s09b, new: the latch and hinge on doorOpen (the hall swells under it, above); the blob lands on the threshold at 78.167;
  // one quick breath on the shadow; the swallow in C5, 79.667; his first footsteps, on the runner.
  { beat: 'doorOpen', sound: 'doorLatch', gain: 0.6 },
  { beat: 'doorOpen', offset: 1.167, sound: 'inkDrip', gain: 0.3, seed: 40 },
  { beat: 'shadowAhead', sound: 'breathCatch', gain: dB(-22) },
  { beat: 'doorOpen', offset: 2.667, sound: 'swallow', gain: dB(-24) },
  { beat: 'stepIntoShadow', sound: 'footstepSoft', gain: dB(-20), seed: 1 },
  { beat: 'stepIntoShadow', offset: 0.5, sound: 'footstepSoft', gain: dB(-20), seed: 2 },
  // s09c, new: a footstep on paving on every step of the picture (WALK_STEPS, quickening toward Marston), -20 dB; the blob
  // lands in his path; his fast breath, 36/min to the decision and 40/min after, -22 dB, to the door push.
  ...WALK_STEPS.map((o, k) => ({ beat: 'walkStart', offset: o, sound: 'footstep', gain: dB(-20), seed: 100 + k })),
  { beat: 'blobBlocks', sound: 'inkDrip', gain: 0.3, seed: 41 },
  bed('breathFast', 'foley', ['walkStart'], ['blobBlocks', 7 / 6], dB(-22)),
  bed('breathFaster', 'foley', ['blobBlocks', 7 / 6], ['doorPush'], dB(-22)),
  // s10, new: two steps to the glass (102.0, 102.25), the push bar on the peak, one step across the sill (103.25, on the mat),
  // then everything stops on lightFlood; the long exhale, clear and alone (-6 dB, not -20: doc 05's one exception).
  { beat: 'doorPush', offset: -1, sound: 'footstep', gain: dB(-20), seed: 200 },
  { beat: 'doorPush', offset: -0.75, sound: 'footstep', gain: dB(-20), seed: 201 },
  { beat: 'doorPush', sound: 'doorPush', gain: 0.8 },
  { beat: 'doorPush', offset: 0.25, sound: 'footstepSoft', gain: dB(-20), seed: 3 },
  { beat: 'exhale', sound: 'exhale', gain: 0.5 },
  // s10b (v6): his steps on the stacks carpet, one per contact (walk step 1/3 s from 110.0), the soft step at -26 dB, under
  // s09c's -20 dB paving; the phone into the hoodie pocket, a short paper rustle (the hoodie is paper; s09a's blanket precedent).
  ...range(0, 17).map((k) => ({ beat: 'pocketPhone', offset: k / 3 - 1, sound: 'footstepSoft', gain: dB(-26), seed: 300 + k })),
  { beat: 'pocketPhone', offset: -0.17, sound: 'paperRustle', dur: 0.3, gain: 0.2, seed: 13 },
  // s11: the backpack down (a soft fabric thump: the runner footstep's buffer), the phone face down on the desk, -6 dB
  // under s09a's (the rhyme with the choice), and the blob's three hops up onto the desk, -20 dB.
  { beat: 'deskSit', offset: 0.25, sound: 'footstepSoft', gain: 0.25, seed: 4 },
  { beat: 'deskSit', offset: 2, sound: 'cardTap', gain: GAIN.cardTap / 2 },
  ...[0, 0.5, 0.83].map((o, k) => ({ beat: 'blobClimbs', offset: o, sound: 'inkDrip', gain: 0.1, seed: 42 + k })),
  // s13: one very soft rustle as the head lifts.
  { beat: 'headLift', dur: 0.6, sound: 'paperRustle', gain: 0.25, seed: 7 },
  // s15: uncap, the pen on the first word (penUncap + 0.833 to nameWritten), the flinch under the held note.
  { beat: 'penUncap', sound: 'penUncap', gain: 0.7 },
  bed('penScratch', 'foley', ['penUncap', 0.833], ['nameWritten'], 0.5),
  { beat: 'nameWritten', sound: 'inkDrip', gain: 0.126, seed: 9 },
  // s16 practice (130.5-136.1, the film's closest pen): writing, a full stop with one pen tap at 134.35, the crossing-out
  // (one quick harder stroke), writing again, then the check's two crisp strokes.
  bed('penScratch', 'foley', ['crossOut', -4.1], ['crossOut', -0.5], 0.6, { seed: 2 }),
  { beat: 'crossOut', offset: -0.25, sound: 'penTap', gain: 0.5 },
  { beat: 'crossOut', sound: 'penStroke', dur: 0.15, gain: 0.75 },
  bed('penScratch', 'foley', ['crossOut', 0.2], ['crossOut', 1.5], 0.6, { seed: 8 }),
  { beat: 'problemOneSolved', offset: -0.33, sound: 'penStroke', dur: 0.12, gain: 0.55, seed: 2 },
  { beat: 'problemOneSolved', offset: -0.17, sound: 'penStroke', dur: 0.12, gain: 0.55, seed: 3 },
  // A shrink blip (inkDrip, -18 dB) under every shrink: s16's five, the test, the cross-off.
  ...['problemOneSolved', 'problemSolved2', 'problemSolved3', 'problemSolved4', 'problemSolved5', 'testSolved', 'examCrossedOff']
    .map((b, k) => ({ beat: b, sound: 'inkDrip', gain: 0.126, seed: 10 + k })),
  // P2's three lines (139.5, 140.0, 140.5) at -6 dB, then the montage's pen under the writing poses before #3-#5 at -10 dB.
  ...[-2, -1.5, -1].map((o, k) => ({ beat: 'problemSolved2', offset: o, sound: 'penStroke', dur: 0.35, gain: dB(-6), seed: 6 + k })),
  bed('penScratch', 'foley', ['problemSolved3', -1.1], ['problemSolved3', -0.1], dB(-10), { seed: 4 }),
  bed('penScratch', 'foley', ['problemSolved4', -0.7], ['problemSolved4', -0.1], dB(-10), { seed: 5 }),
  bed('penScratch', 'foley', ['problemSolved5', -0.7], ['problemSolved5', -0.1], dB(-10), { seed: 6 }),
  // s17b: one soft cough across the room before he recognises the test; the pen on the test, steady.
  { beat: 'examRoom', offset: 1.6, sound: 'cough', gain: 0.5 },
  bed('penScratch', 'foley', ['testSolved', -3.0], ['testSolved', -0.1], 0.4, { seed: 9 }),
  // s17c: the paper slide when the grade comes back, a short flip of the page, one soft finger tap.
  { beat: 'gradeSlide', sound: 'paperSlide', gain: 0.7 },
  { beat: 'gradeSlide', offset: 0.83, dur: 0.5, sound: 'paperRustle', gain: 0.4, seed: 11 },
  { beat: 'gradeReveal', offset: 1.5, sound: 'cardTap', gain: 0.2, seed: 3 },
  // s18: the X, two firm strokes ending on examCrossedOff; the hop and the run's wet taps; the dissolve (inkSoak);
  // v4: he sits back and breathes out (the exhale's buffer, soft); the marker writing "Final" and circling the new date,
  // ending on the beat; the tag's uncap, s15's buffer.
  { beat: 'examCrossedOff', offset: -0.5, sound: 'penStroke', dur: 0.18, gain: 0.6, seed: 4 },
  { beat: 'examCrossedOff', offset: -0.2, sound: 'penStroke', dur: 0.2, gain: 0.6, seed: 5 },
  { beat: 'blobAbsorbed', offset: -2, sound: 'inkDrip', gain: 0.2, seed: 30 },
  { beat: 'blobAbsorbed', offset: -1.5, sound: 'inkDrip', gain: 0.2, seed: 31 },
  { beat: 'blobAbsorbed', sound: 'inkSoak', gain: 0.6 },
  { beat: 'lampSitBack', sound: 'exhale', gain: dB(-20), seed: 2 },
  { beat: 'newDate', offset: -2, dur: 2, sound: 'markerScratch', gain: 0.5 },
  { beat: 'tagPenUncap', sound: 'penUncap', gain: 0.7 },
  { beat: 'tagPenUncap', offset: 1.25, sound: 'inkDrip', gain: 0.3, seed: 32 },               // v6-ending: the drop lands on the nib (s18 17.75), a soft plip
  { beat: 'tagPenUncap', offset: 1.917, sound: 'penStroke', dur: 0.42, gain: 0.45, seed: 6 },  // v6-ending: "1." in its ink (18.42–18.83)
  // ───────── snd-foley-2 ─────────
  // s04: jar clinks at 0.83, 2.17, 3.33; three carton sloshes over 3.50-4.00.
  ...[0.83, 2.17, 3.33].map((o, k) => ({ beat: 'fridge', offset: o, sound: 'jarClink', gain: GAIN.jarClink, seed: k + 1 })),
  ...[3.5, 3.67, 3.83].map((o, k) => ({ beat: 'fridge', offset: o, sound: 'cartonSlosh', gain: GAIN.cartonSlosh, seed: k + 1 })),
  // s05: TV bloops through the shot, paused for the win jingle at 5.0 and back when he resumes mashing at 6.0;
  // the roommate's paper-tap footsteps every 1/3 s over 3.33-6.33, all alike (they must not change in the shadow).
  bed('tvBloops', 'foley', ['gameNight'], ['gameNight', 4.9], GAIN.tvBloops),
  bed('tvBloops', 'foley', ['gameNight', 6], ['lampClickHome', -0.5], GAIN.tvBloops, { seed: 2 }),
  { beat: 'gameNight', offset: 5, sound: 'winJingle', gain: GAIN.winJingle },
  ...Array.from({ length: 10 }, (_, k) => ({ beat: 'gameNight', offset: 3.33 + k / 3, sound: 'roommateStep', gain: GAIN.roommateStep, seed: 1 + (k % 2) })),
  // ───────── v7: the laptop game is real CS2 (the director's clip), replacing snd-g4's synthesized blips ─────────
  // Out of the laptop's speakers (the same device band as the reels), under the score. [in-point (s), beat, from, to]:
  // s03 from just after the lid opens, aligned so the clip's first burst (1.4 s in) is him playing, its quiet stretch
  // carries the reminder (gulp1 - 1.25) and the swipe, and its long spray (3.45 s in) lands 0.2 s after gulp1: back to
  // the game. s05 plays the clip's second half under the TV's bloops (its last bursts, 10-12 s in, from 4.5 s, as he
  // snorts at the screen). s06 resumes half a second after gulp2, where his taps did.
  // The last number is extra dB: s05's groove and s06's run 6 dB hotter than s03's, and at one gain the game sat 12-15 dB
  // under them (measured on the music and foley stems), lost; +6 puts it as far under them as it sits under s03's.
  ...(/** @type {[number, string, number, number, number][]} */ ([[0, 'laptopUp', 0.25, 6.0, 0], [5.75, 'gameNight', 0.33, 6.58, 6], [0, 'gulp2', 0.5, 4.0, 6]]))
    .map(([inSec, b, from, to, up]) => ({ beat: b, offset: from, dur: to - from, sound: 'clip', file: 'cs2', in: inSec, gain: GAIN.cs2 * dB(up) })),
];
