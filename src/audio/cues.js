// Cue sheet: sounds placed by beat name (src/timeline.js), never by raw time. Moving a beat moves its sound.
// stem: 'foley' (default) | 'ambience' | 'music'. seed: defaults to seedOf(sound) in tools/mix.mjs,
// so the two lamp clicks share one seed and are sample-identical (doc 05).
// offset: seconds after the beat (may be negative, default 0); the cue starts at beat(beat) + offset.
// Length (beds): dur in seconds, or until: '<beatName>' (runs from the cue's start to that beat). tools/mix.mjs passes it
// as FOLEY[sound](seed, dur); with neither, the sound plays at its default length.
//
// A point is [beatName, offsetSeconds]. bed() runs a bed from one point to another, so a bed that stops 0.5 s before a
// beat is still hung on beats and moves when they move. Sources: docs/shots/sNN.md §Sound and doc 05 (the G4 cut, 3:15).
// The music stem (score.js) is not placed here.
import { beat, DURATION } from '../timeline.js';
import { BLIND_CLACK } from './foley.js';

const at = ([b, o = 0]) => beat(b) + o;
const bed = (sound, stem, from, to, gain, extra) => ({ beat: from[0], offset: from[1] ?? 0, dur: at(to) - at(from), sound, stem, gain, ...extra });
const AMB = 'ambience';
const START = ['notifyBuzz', -beat('notifyBuzz')];                // 0:00. s00's only beat
const S01 = ['notifyBuzz', 4 - beat('notifyBuzz')];                // 0:04, s01 has no beat of its own
const S18 = ['examCrossedOff', -2];                                 // 2:58, s18 @ 0
const END = ['tagPenUncap', DURATION - beat('tagPenUncap')];        // 3:15
// Doc 05: every lamp click and the sensor wake are dry and exposed. Beds stop on it and come back after its window (the music
// stem does the same in score.js), which is also what keeps identical cues identical in mix.wav. A lamp click is 0.3 s;
// the sensor wake is 0.65 s (its hum rises under it and hands over to the fluorescent bed). WAKE is sensorWake's length in foley.js.
const WAKE = 0.65;
const ON = (b) => [b, b.startsWith('sensorWake') ? WAKE : 0.3];
// snd-foley-2's sounds, in one place so a level pass touches one table.
const GAIN = { jarClink: 0.4, cartonSlosh: 0.5, tvBloops: 0.4, winJingle: 0.3, roommateStep: 0.4, rodSnap: 0.2, cardTap: 0.4 };

export const CUES = [
  // ───────── ambience beds ─────────
  // Paper boil: throughout, very low (doc 05), broken only at the clicks and the wake (the off click's window is 0.17 s: the rustle follows it).
  bed('paperBoil', AMB, START, ['lampClickHome'], 1),
  bed('paperBoil', AMB, ON('lampClickHome'), ['lampOffHome'], 1),
  bed('paperBoil', AMB, ['lampOffHome', 0.17], ['sensorWakeMarston'], 1),
  bed('paperBoil', AMB, ON('sensorWakeMarston'), END, 1),
  // Room tone: s00 at its lowest, s01-s03 morning, then 3 dB down from laptopUp; s07's morning to the last blind; s08 faint
  // morning hush; s09 stands in for the outdoor night bed; Quiet 2; s18's home.
  bed('roomTone', AMB, START, S01, 0.4),
  bed('roomTone', AMB, S01, ['laptopUp'], 1),
  bed('roomTone', AMB, ['laptopUp'], ['fridge'], 0.7),
  bed('roomTone', AMB, ['blindsStart'], ['blind2'], 0.7),
  bed('roomTone', AMB, ['sunriseGame'], ['marstonEnter'], 0.5),
  bed('roomTone', AMB, ['marstonEnter'], ['stacksEnter'], 0.6),
  bed('roomTone', AMB, ['quiet2Start'], ['examRoom'], 1),
  bed('roomTone', AMB, S18, END, 1),
  // s17b-s17c, new: the exam room's hush, -6 dB for one second at testRecognise (the world narrows), then -12 dB under
  // s17c (the room empties). Segments overlap by 50 ms so the seams don't dip. The wall clock runs on its own bed at 1 Hz
  // and is not ducked at testRecognise; its second segment starts on a whole second (examRoom + 10) to keep the tick's phase.
  bed('examHush', AMB, ['examRoom'], ['testRecognise', 0.05], 1),
  bed('examHush', AMB, ['testRecognise'], ['testRecognise', 1.05], 0.5, { seed: 2 }),
  bed('examHush', AMB, ['testRecognise', 1], ['gradeSlide', 0.05], 1, { seed: 3 }),
  bed('examHush', AMB, ['gradeSlide'], S18, 0.25, { seed: 4 }),
  bed('clockTick', AMB, ['examRoom'], ['examRoom', 10], 1),
  bed('clockTick', AMB, ['examRoom', 10], S18, 0.25),
  // Fridge: the whole of s04.
  bed('fridgeHum', AMB, ['fridge'], ['gameNight'], 0.4),
  // Fluorescent hum. s10-s11 full; once the table tube dies, the distant bed at -6 dB (s11-s13); s14-s16 a working tube
  // overhead, full (off for the Marston wake); s17 at -12 dB, to the exam room.
  bed('fluorescentHum', AMB, ['stacksEnter'], ['tableLightDies', 0.8], 0.15),
  bed('fluorescentHum', AMB, ['tableLightDies', 0.8], ['custodianPass', -0.5], 0.075),
  bed('fluorescentHum', AMB, ['custodianPass', -0.5], ['sensorWakeMarston'], 0.15),
  bed('fluorescentHum', AMB, ON('sensorWakeMarston'), ['quiet2Start'], 0.15),
  bed('fluorescentHum', AMB, ['quiet2Start'], ['examRoom'], 0.04),
  // Screen glow hum (phoneHum), whenever a screen is the key light: the laptop at home, the phone at Marston.
  bed('phoneHum', AMB, ['laptopUp'], ['lampClickHome'], 0.3),                          // s03-s06, cut dead on the click
  bed('phoneHum', AMB, ['lampOffHome', 0.17], ['blindsStart'], 0.3),                   // back 0.17 s after the off
  bed('phoneHum', AMB, ['blindsStart'], ['blind1'], 0.15),                             // s07: masked by the sunlit room,
  bed('phoneHum', AMB, ['blind1'], ['blind2'], 0.22),                                  // up a step with blind A,
  bed('phoneHum', AMB, ['gulp4'], ['marstonEnter'], 0.3),                              // full once blind B's cut is over, through s08
  bed('phoneHum', AMB, ['stacksEnter'], ['laptopOpen', -1], 0.3),                      // s10
  bed('phoneHum', AMB, ['phoneWake'], ['quiet1Start'], 0.3),                           // s11
  bed('phoneHum', AMB, ['quiet1Start'], ['sensorWakeMarston'], 0.15),                  // s12-s14, "very faint"
  bed('phoneHum', AMB, ON('sensorWakeMarston'), ['phoneFaceDown'], 0.075),             // s15, ducked -6 dB; stops on the face-down frame
  bed('phoneHum', AMB, ['headLift', 3.9], ['headLift', 4.6], 0.0189, { seed: 1 }),    // s13 generic wakes, -24 dB each
  bed('phoneHum', AMB, ['headLift', 4.3], ['headLift', 5.0], 0.0189, { seed: 2 }),
  bed('phoneHum', AMB, ['headLift', 4.7], ['headLift', 5.4], 0.0189, { seed: 3 }),
  bed('phoneHum', AMB, ['sensorWakeNeighbor'], ['problemSolved6', 0.5], 0.03),         // s16 neighbour's phone, -20 dB, until 21.5
  // Quiet 1: the shadow's breathing (sub), s12 only. Starts on the shot so its 1.25/6.25 s breath peaks land.
  bed('shadowBreath', AMB, ['quiet1Start'], ['headLift', -0.5], 0.1),
  // Mop on tile: one swish every 0.5 s. s13's pre-lap from 6.0 at -12 dB (swishes at s13 6.0, 6.5, 7.0 = s14 0.0),
  // then s14's ten at custodianPass + 0.5n (shot 0.5 to 5.0); the tenth's 0.45 s swish ends before the Marston wake.
  bed('mopOnTile', AMB, ['headLift', 5.5], ['custodianPass'], 0.09),
  bed('mopOnTile', AMB, ['custodianPass'], ['custodianPass', 4.95], 0.2),
  // Dawn birds: one sparse phrase group per bird beat.
  { beat: 'dawnBird1', sound: 'dawnBirds', stem: AMB, dur: 3.5, seed: 41, gain: 0.5 },
  { beat: 'dawnBird2', sound: 'dawnBirds', stem: AMB, dur: 3.5, seed: 42, gain: 0.5 },
  { beat: 'dawnBird3', sound: 'dawnBirds', stem: AMB, dur: 3.5, seed: 43, gain: 0.5 },

  // ───────── foley ─────────
  // s00, new: the notification, the film's first sound over black. Two buzzes, one buffer.
  { beat: 'notifyBuzz', sound: 'phoneBuzz', gain: 0.7 },
  { beat: 'notifyBuzz', offset: 1.5, sound: 'phoneBuzz', gain: 0.7 },
  // s02: the bead, the perch, the landing, two hop taps (s02 §Sound).
  { beat: 'inkDropForms', sound: 'inkDrip', gain: 0.35 },
  { beat: 'inkDropForms', offset: 1.0, sound: 'inkDrip', gain: 0.3 },
  { beat: 'inkDropForms', offset: 2.42, sound: 'inkDrip', gain: 0.7 },
  { beat: 'inkDropForms', offset: 4.04, sound: 'inkDrip', gain: 0.3 },
  { beat: 'inkDropForms', offset: 4.83, sound: 'inkDrip', gain: 0.3 },
  // Shadow-growth rustles (the sub is in the score): s03, s04 x3, s05, s06 spring-back.
  { beat: 'laptopUp', sound: 'paperRustle', gain: 0.4 },
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
  // The home lamp's two clicks (on, off): the identical lampClick, same seed and gain. Do not touch (doc 05).
  { beat: 'lampClickHome', sound: 'lampClick', gain: 0.8 },
  { beat: 'lampOffHome', sound: 'lampClick', gain: 0.8 },
  // The sensor wake, once since G4 (s15). None for sensorWakeNeighbor (QUESTIONS.md Q2, option b: seen, not heard).
  { beat: 'sensorWakeMarston', sound: 'sensorWake', gain: 0.8 },
  // s07: the drill's one window, then each blind (new): one ratcheting roll-down, the identical buffer both times, its
  // clack on the beat; blind A's shadow step; and after blind B's half-second of nothing, the biggest growth of the film so far.
  bed('drill', 'foley', ['blindsStart', 0.33], ['blindsStart', 1.67], 0.1),
  { beat: 'blind1', offset: -BLIND_CLACK, sound: 'blindRattle', gain: 0.6 },
  { beat: 'blind1', offset: 0.17, sound: 'paperRustle', gain: 0.35, seed: 9 },
  { beat: 'blind2', offset: -BLIND_CLACK, sound: 'blindRattle', gain: 0.6 },
  { beat: 'gulp4', dur: 3.5, sound: 'shadowGrowth', gain: 0.08 },
  // The blob's gulps (doc 05): a soft inkDrip swallow at -18 dB under the score's two notes, one per gulp.
  ...[1, 2, 3, 4, 5].map((k) => ({ beat: `gulp${k}`, sound: 'inkDrip', gain: 0.126, seed: 20 + k })),
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
  // s16 practice (1.0-6.6, the film's closest pen): writing, a full stop 4.60-5.10 with one pen tap at 4.85, the
  // crossing-out (new: one quick harder stroke), writing again, then the check's two crisp strokes (6.67, 6.83).
  bed('penScratch', 'foley', ['crossOut', -4.1], ['crossOut', -0.5], 0.6, { seed: 2 }),
  { beat: 'crossOut', offset: -0.25, sound: 'penTap', gain: 0.5 },
  { beat: 'crossOut', sound: 'penStroke', dur: 0.15, gain: 0.75 },
  bed('penScratch', 'foley', ['crossOut', 0.2], ['crossOut', 1.5], 0.6, { seed: 8 }),
  { beat: 'problemOneSolved', offset: -0.33, sound: 'penStroke', dur: 0.12, gain: 0.55, seed: 2 },
  { beat: 'problemOneSolved', offset: -0.17, sound: 'penStroke', dur: 0.12, gain: 0.55, seed: 3 },
  // A shrink blip (inkDrip, -18 dB) under every shrink: s16's six, the test, the cross-off. Then the pen under each
  // later writing pose in s16 at -10 dB.
  ...['problemOneSolved', 'problemSolved2', 'problemSolved3', 'problemSolved4', 'problemSolved5', 'problemSolved6', 'testSolved', 'examCrossedOff']
    .map((b, k) => ({ beat: b, sound: 'inkDrip', gain: 0.126, seed: 10 + k })),
  bed('penScratch', 'foley', ['problemSolved2', -1.4], ['problemSolved2', -0.1], 0.1738, { seed: 3 }),
  bed('penScratch', 'foley', ['problemSolved3', -1.4], ['problemSolved3', -0.1], 0.1738, { seed: 4 }),
  bed('penScratch', 'foley', ['problemSolved4', -1.4], ['problemSolved4', -0.1], 0.1738, { seed: 5 }),
  bed('penScratch', 'foley', ['problemSolved5', -1.4], ['problemSolved5', -0.1], 0.1738, { seed: 6 }),
  bed('penScratch', 'foley', ['problemSolved6', -1.4], ['problemSolved6', -0.1], 0.1738, { seed: 7 }),
  // s17b: one soft cough across the room (new) before he recognises the test; the pen on the test, steady.
  { beat: 'examRoom', offset: 1.6, sound: 'cough', gain: 0.5 },
  bed('penScratch', 'foley', ['testSolved', -3.0], ['testSolved', -0.1], 0.4, { seed: 9 }),
  // s17c, new: the paper slide when the grade comes back, a short flip of the page, one soft finger tap (s17c 3.50).
  { beat: 'gradeSlide', sound: 'paperSlide', gain: 0.7 },
  { beat: 'gradeSlide', offset: 0.83, dur: 0.5, sound: 'paperRustle', gain: 0.4, seed: 11 },
  { beat: 'gradeReveal', offset: 1.5, sound: 'cardTap', gain: 0.2, seed: 3 },
  // s18: the X, two firm strokes ending on examCrossedOff; the hop and the run's wet taps; the dissolve (new, inkSoak);
  // the marker (new) writing "Final" and circling the new date, ending on the beat; the tag's uncap, s15's buffer.
  { beat: 'examCrossedOff', offset: -0.5, sound: 'penStroke', dur: 0.18, gain: 0.6, seed: 4 },
  { beat: 'examCrossedOff', offset: -0.2, sound: 'penStroke', dur: 0.2, gain: 0.6, seed: 5 },
  { beat: 'blobAbsorbed', offset: -2, sound: 'inkDrip', gain: 0.2, seed: 30 },
  { beat: 'blobAbsorbed', offset: -1.5, sound: 'inkDrip', gain: 0.2, seed: 31 },
  { beat: 'blobAbsorbed', sound: 'inkSoak', gain: 0.6 },
  { beat: 'newDate', offset: -2, dur: 2, sound: 'markerScratch', gain: 0.5 },
  { beat: 'tagPenUncap', sound: 'penUncap', gain: 0.7 },
  // ───────── snd-foley-2: the specs' sounds that were missing ─────────
  // s04: jar clinks at 0.83, 2.17, 3.33; three carton sloshes over 3.50-4.00.
  ...[0.83, 2.17, 3.33].map((o, k) => ({ beat: 'fridge', offset: o, sound: 'jarClink', gain: GAIN.jarClink, seed: k + 1 })),
  ...[3.5, 3.67, 3.83].map((o, k) => ({ beat: 'fridge', offset: o, sound: 'cartonSlosh', gain: GAIN.cartonSlosh, seed: k + 1 })),
  // s05: TV bloops through the shot, paused for the win jingle at 5.0 and back when he resumes mashing at 6.0;
  // the roommate's paper-tap footsteps every 1/3 s over 3.33-6.33, all alike (they must not change in the shadow).
  bed('tvBloops', 'foley', ['gameNight'], ['gameNight', 4.9], GAIN.tvBloops),
  bed('tvBloops', 'foley', ['gameNight', 6], ['lampClickHome', -0.5], GAIN.tvBloops, { seed: 2 }),
  { beat: 'gameNight', offset: 5, sound: 'winJingle', gain: GAIN.winJingle },
  ...Array.from({ length: 10 }, (_, k) => ({ beat: 'gameNight', offset: 3.33 + k / 3, sound: 'roommateStep', gain: GAIN.roommateStep, seed: 1 + (k % 2) })),
  // s07: blind B's roller snaps into its brackets at 3.50.
  { beat: 'blindsStart', offset: 3.5, sound: 'rodSnap', gain: GAIN.rodSnap },
  // s15: the phone laid face down, a soft card tap (the phone hum stops on the same frame, above).
  { beat: 'phoneFaceDown', sound: 'cardTap', gain: GAIN.cardTap },
  // ───────── snd-g4: the laptop game's blips (new), on his key taps, never on a gulp's frame ─────────
  // gameBlip's seed sets its note and register (foley.js): 0xx home, 1xx higher (s05, under the TV), 2xx sleepy (s08).
  // s03: the two-note boot on laptopUp (C then G), then the taps (s03 2.33 … 5.67; none on gulp1 at 4.5).
  ...[[0, 0], [0.1, 9]].map(([o, seed]) => ({ beat: 'laptopUp', offset: o, sound: 'gameBlip', gain: 0.126, seed })),
  ...[1.33, 1.67, 2.17, 2.5, 3.0, 3.67, 4.17, 4.67].map((o, k) => ({ beat: 'laptopUp', offset: o, sound: 'gameBlip', gain: 0.1, seed: k + 1 })),
  // s05: every 0.5 s from 0.33, quieter and an octave higher, under the TV's bloops.
  ...Array.from({ length: 16 }, (_, k) => ({ beat: 'gameNight', offset: 0.33 + 0.5 * k, sound: 'gameBlip', gain: 0.063, seed: 101 + k })),
  // s06: the taps resume half a second after gulp2 (he is back at the keys from 4.0; the gulp's frame stays clear).
  ...Array.from({ length: 7 }, (_, k) => ({ beat: 'gulp2', offset: 0.5 + 0.5 * k, sound: 'gameBlip', gain: 0.08, seed: 11 + k })),
  // s07: 4.0-5.5 (taps at 4.33, 4.83, 5.17) and from 9.0 (every 0.5 s from 9.33).
  ...[4.33, 4.83, 5.17].map((o, k) => ({ beat: 'blindsStart', offset: o, sound: 'gameBlip', gain: 0.09, seed: 21 + k })),
  ...Array.from({ length: 6 }, (_, k) => ({ beat: 'gulp4', offset: 0.83 + 0.5 * k, sound: 'gameBlip', gain: 0.09, seed: 24 + k })),
  // s08: every 0.5 s from 0.25, low and sleepy, through the yawn.
  ...Array.from({ length: 12 }, (_, k) => ({ beat: 'sunriseGame', offset: 0.25 + 0.5 * k, sound: 'gameBlip', gain: 0.07, seed: 201 + k })),
];
