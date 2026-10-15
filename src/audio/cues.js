// Cue sheet: sounds placed by beat name (src/timeline.js), never by raw time. Moving a beat moves its sound.
// stem: 'foley' (default) | 'ambience' | 'music'. seed: defaults to seedOf(sound) in tools/mix.mjs,
// so the three lamp clicks share one seed and are sample-identical (doc 05).
// offset: seconds after the beat (may be negative, default 0); the cue starts at beat(beat) + offset.
// Length (beds): dur in seconds, or until: '<beatName>' (runs from the cue's start to that beat). tools/mix.mjs passes it
// as FOLEY[sound](seed, dur); with neither, the sound plays at its default length.
//
// A point is [beatName, offsetSeconds]. bed() runs a bed from one point to another, so a bed that stops 0.5 s before a
// beat is still hung on beats and moves when they move. Sources: docs/shots/sNN.md §Sound and doc 05.
// The music stem (score.js) is not placed here.
import { beat, DURATION } from '../timeline.js';

const at = ([b, o = 0]) => beat(b) + o;
const bed = (sound, stem, from, to, gain, extra) => ({ beat: from[0], offset: from[1] ?? 0, dur: at(to) - at(from), sound, stem, gain, ...extra });
const AMB = 'ambience';
const START = ['inkDropForms', -beat('inkDropForms')];              // 0:00. s01 has no beat of its own
const END = ['nextSemester', DURATION - beat('nextSemester')];      // 3:00
// Doc 05: every lamp click is dry and exposed. Beds stop on the click and come back after its 0.3 s window (the music
// stem does the same in score.js), which is also what keeps the three clicks identical in mix.wav.
const ON = (b) => [b, 0.3];

export const CUES = [
  // ───────── ambience beds ─────────
  // Paper boil: throughout, very low (doc 05), broken only at the three clicks.
  bed('paperBoil', AMB, START, ['lampClickHome'], 1),
  bed('paperBoil', AMB, ON('lampClickHome'), ['lampClickMarston'], 1),
  bed('paperBoil', AMB, ON('lampClickMarston'), ['lampClickFreshman'], 1),
  bed('paperBoil', AMB, ON('lampClickFreshman'), END, 1),
  // Room tone: s01-s03 morning, then 3 dB down from phoneUp; s08 faint morning hush; s09 stands in for the outdoor night
  // bed; Quiet 2 and s18's home 0-2 s.
  bed('roomTone', AMB, START, ['phoneUp'], 1),
  bed('roomTone', AMB, ['phoneUp'], ['fridge'], 0.7),
  bed('roomTone', AMB, ['scrollStart'], ['marstonEnter'], 0.5),
  bed('roomTone', AMB, ['marstonEnter'], ['stacksEnter'], 0.6),
  bed('roomTone', AMB, ['quiet2Start'], ['nextSemester', 2], 1),
  // Night hum: the Button, from 2.0 in s18. Stops for the Freshman's click.
  bed('nightHum', AMB, ['nextSemester', 2], ['lampClickFreshman'], 1),
  bed('nightHum', AMB, ON('lampClickFreshman'), END, 1),
  // Fridge: the whole of s04.
  bed('fridgeHum', AMB, ['fridge'], ['gameNight'], 0.4),
  // Fluorescent hum. s10-s11 full; once the table tube dies, the distant bed at -6 dB (s11-s13); s14-s16 a working tube
  // overhead, full (off for the Marston click); s17 at -12 dB.
  bed('fluorescentHum', AMB, ['stacksEnter'], ['tableLightDies', 0.8], 0.15),
  bed('fluorescentHum', AMB, ['tableLightDies', 0.8], ['custodianPass', -0.5], 0.075),
  bed('fluorescentHum', AMB, ['custodianPass', -0.5], ['lampClickMarston'], 0.15),
  bed('fluorescentHum', AMB, ON('lampClickMarston'), ['quiet2Start'], 0.15),
  bed('fluorescentHum', AMB, ['quiet2Start'], ['nextSemester'], 0.04),
  // Phone glow hum, whenever the phone is the key light.
  bed('phoneHum', AMB, ['phoneUp'], ['lampClickHome'], 0.3),                           // s03-s06, cut dead on the click
  bed('phoneHum', AMB, ['lampOffHome', 0.17], ['curtainsDone'], 0.3),                  // back 0.17 s after the off, to the s07 cut
  bed('phoneHum', AMB, ['curtainsDone', 0.5], ['marstonEnter'], 0.3),                  // s07-s08
  bed('phoneHum', AMB, ['stacksEnter'], ['laptopOpen', -1], 0.3),                      // s10
  bed('phoneHum', AMB, ['phoneWake'], ['quiet1Start'], 0.3),                           // s11
  bed('phoneHum', AMB, ['quiet1Start'], ['lampClickMarston'], 0.15),                  // s12-s14, "very faint"
  bed('phoneHum', AMB, ON('lampClickMarston'), ['phoneFaceDown'], 0.075),             // s15, ducked -6 dB; stops on the face-down frame
  bed('phoneHum', AMB, ['headLift', 3.9], ['headLift', 4.6], 0.0189, { seed: 1 }),    // s13 generic wakes, -24 dB each
  bed('phoneHum', AMB, ['headLift', 4.3], ['headLift', 5.0], 0.0189, { seed: 2 }),
  bed('phoneHum', AMB, ['headLift', 4.7], ['headLift', 5.4], 0.0189, { seed: 3 }),
  bed('phoneHum', AMB, ['lampClickNeighbor'], ['problemSolved6', 0.5], 0.03),         // s16 neighbour's phone, -20 dB, until 16.5
  bed('phoneHum', AMB, ['nextSemester', 2], ['lampClickFreshman'], 0.15),             // s18 the Freshman's phone, faint
  bed('phoneHum', AMB, ON('lampClickFreshman'), ['blobYawn'], 0.075),                 // ducked -6 dB after the click
  // Quiet 1: the shadow's breathing (sub), s12 only.
  bed('shadowBreath', AMB, ['quiet1Start'], ['headLift', -0.5], 0.1),
  // Mop on tile: s13's pre-lap from 6.0 at -12 dB, then s14 louder to the end of the shot.
  bed('mopOnTile', AMB, ['headLift', 5.5], ['custodianPass'], 0.09),
  bed('mopOnTile', AMB, ['custodianPass'], ['lampClickMarston', -0.5], 0.2),
  // Dawn birds: one sparse phrase group per bird beat.
  { beat: 'dawnBird1', sound: 'dawnBirds', stem: AMB, dur: 3.5, seed: 41, gain: 0.5 },
  { beat: 'dawnBird2', sound: 'dawnBirds', stem: AMB, dur: 3.5, seed: 42, gain: 0.5 },
  { beat: 'dawnBird3', sound: 'dawnBirds', stem: AMB, dur: 3.5, seed: 43, gain: 0.5 },

  // ───────── foley ─────────
  // s02: the bead, its landing, three hop taps.
  { beat: 'inkDropForms', sound: 'inkDrip', gain: 0.35 },
  { beat: 'inkDropForms', offset: 1.33, sound: 'inkDrip', gain: 0.7 },
  { beat: 'inkDropForms', offset: 2.83, sound: 'inkDrip', gain: 0.3 },
  { beat: 'inkDropForms', offset: 3.5, sound: 'inkDrip', gain: 0.3 },
  { beat: 'inkDropForms', offset: 4.17, sound: 'inkDrip', gain: 0.3 },
  // Shadow-growth rustles (the sub is in the score): s03, s04 x3, s05, s06 spring-back.
  { beat: 'phoneUp', sound: 'paperRustle', gain: 0.4 },
  { beat: 'fridge', sound: 'paperRustle', gain: 0.5 },
  { beat: 'fridge', offset: 2.33, sound: 'paperRustle', gain: 0.3, seed: 2 },
  { beat: 'fridge', offset: 5.33, sound: 'paperRustle', gain: 0.3, seed: 3 },
  { beat: 'gameNight', sound: 'paperRustle', gain: 0.5, seed: 4 },
  { beat: 'lampOffHome', offset: 0.17, sound: 'paperRustle', gain: 0.4, seed: 5 },
  // s05: controller button-mashing through the shot.
  { beat: 'gameNight', offset: 0.3, sound: 'controllerClick', gain: 0.35, seed: 3 },
  { beat: 'gameNight', offset: 1.9, sound: 'controllerClick', gain: 0.35, seed: 5 },
  { beat: 'gameNight', offset: 3.3, sound: 'controllerClick', gain: 0.35, seed: 8 },
  { beat: 'gameNight', offset: 5.4, sound: 'controllerClick', gain: 0.35, seed: 13 },
  { beat: 'gameNight', offset: 6.9, sound: 'controllerClick', gain: 0.35, seed: 21 },
  // The three lamp clicks. Same seed and gain: do not touch (doc 05). No click for lampOffHome (three only) and none for
  // lampClickNeighbor (QUESTIONS.md Q2, option b: seen, not heard).
  { beat: 'lampClickHome', sound: 'lampClick', gain: 0.8 },
  { beat: 'lampClickMarston', sound: 'lampClick', gain: 0.8 },
  { beat: 'lampClickFreshman', sound: 'lampClick', gain: 0.8 },
  // s07: the drill's two windows, then (after the cut) the biggest growth of the film so far.
  { beat: 'curtainsStart', offset: 0.31, sound: 'drill', gain: 0.1 },
  { beat: 'curtainsStart', offset: 2.15, sound: 'drill', gain: 0.1, seed: 2 },
  { beat: 'curtainsDone', offset: 0.5, dur: 3.5, sound: 'shadowGrowth', gain: 0.08 },
  // s10: the shadow grows through the shot; two flickers of 0.6 s.
  { beat: 'stacksEnter', dur: 6, sound: 'shadowGrowth', gain: 0.3, seed: 2 },
  { beat: 'stacksFlicker1', dur: 0.6, sound: 'fluorescentFlicker', gain: 0.35, seed: 11 },
  { beat: 'stacksFlicker2', dur: 0.6, sound: 'fluorescentFlicker', gain: 0.35, seed: 12 },
  // s11: the lid, the phone-wake surge, then the table tube dies in three crackles over 4.2-5.0.
  { beat: 'laptopOpen', dur: 0.4, sound: 'paperRustle', gain: 0.35, seed: 6 },
  { beat: 'phoneWake', dur: 2.4, sound: 'shadowGrowth', gain: 0.3, seed: 3 },
  { beat: 'tableLightDies', dur: 0.25, sound: 'fluorescentFlicker', gain: 0.35, seed: 13 },
  { beat: 'tableLightDies', offset: 0.3, dur: 0.25, sound: 'fluorescentFlicker', gain: 0.35, seed: 14 },
  { beat: 'tableLightDies', offset: 0.55, dur: 0.25, sound: 'fluorescentFlicker', gain: 0.35, seed: 15 },
  // s13: one very soft rustle as the head lifts.
  { beat: 'headLift', dur: 0.6, sound: 'paperRustle', gain: 0.25, seed: 7 },
  // s15: uncap, the pen on the first word (8.833 to nameWritten), the flinch under the held note.
  { beat: 'penUncap', sound: 'penUncap', gain: 0.7 },
  bed('penScratch', 'foley', ['penUncap', 0.833], ['nameWritten'], 0.5),
  { beat: 'nameWritten', sound: 'inkDrip', gain: 0.126, seed: 9 },
  // s16: the first solve's pen (0.583-2.917) and shrink blip, then the pen under each later writing pose at -10 dB.
  bed('penScratch', 'foley', ['problemOneSolved', -2.417], ['problemOneSolved', -0.083], 0.495, { seed: 2 }),
  { beat: 'problemOneSolved', sound: 'inkDrip', gain: 0.126, seed: 10 },
  bed('penScratch', 'foley', ['problemSolved2', -1.4], ['problemSolved2', -0.1], 0.1738, { seed: 3 }),
  bed('penScratch', 'foley', ['problemSolved3', -1.4], ['problemSolved3', -0.1], 0.1738, { seed: 4 }),
  bed('penScratch', 'foley', ['problemSolved4', -1.4], ['problemSolved4', -0.1], 0.1738, { seed: 5 }),
  bed('penScratch', 'foley', ['problemSolved5', -1.4], ['problemSolved5', -0.1], 0.1738, { seed: 6 }),
  bed('penScratch', 'foley', ['problemSolved6', -1.4], ['problemSolved6', -0.1], 0.1738, { seed: 7 }),
  // s18: the calendar tears (0.25-1.0).
  { beat: 'nextSemester', offset: 0.25, dur: 0.75, sound: 'paperRustle', gain: 0.6, seed: 8 },
];
