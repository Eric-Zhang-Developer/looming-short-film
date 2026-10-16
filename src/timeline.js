// Single source of timing truth (contracts.md). Data only: no clocks, no rendering.
// The G4 cut (spec-g4, director's notes 2026-10-15): about 3:15. Shots and beats from docs/02-story.md's beat sheet and
// docs/shots/sNN.md (local seconds); new shots take a letter so the order reads (s00 before s01, s17b after s17).
// Durations are written out (not derived) so tools/check_timeline.mjs can catch gaps and overlaps.
export const DURATION = 195;

export const SHOTS = [
  { id: 's00',  start: 0,   duration: 4,  beats: { notifyBuzz: 0.5 } },                                   // 0:00 cold open
  { id: 's01',  start: 4,   duration: 6,  beats: {} },
  { id: 's02',  start: 10,  duration: 10, beats: { calendarZoom: 1.5, inkDropForms: 5 } },               // 0:11.5 / 0:15
  { id: 's03',  start: 20,  duration: 6,  beats: { laptopUp: 1, gulp1: 4.5 } },                          // 0:21
  { id: 's04',  start: 26,  duration: 8,  beats: { fridge: 0 } },
  { id: 's05',  start: 34,  duration: 8,  beats: { gameNight: 0 } },
  { id: 's06',  start: 42,  duration: 8,  beats: { lampClickHome: 0.5, lampOffHome: 3, gulp2: 4 } },     // 0:42.5
  { id: 's07',  start: 50,  duration: 12, beats: { blindsStart: 0, blind1: 6, gulp3: 6.5, blind2: 8, gulp4: 8.5 } },
  { id: 's08',  start: 62,  duration: 6,  beats: { sunriseGame: 0 } },
  { id: 's09',  start: 68,  duration: 6,  beats: { marstonEnter: 0 } },                                  // 1:08
  { id: 's10',  start: 74,  duration: 6,  beats: { stacksEnter: 0, stacksFlicker1: 0.4, stacksFlicker2: 3.4 } },
  { id: 's11',  start: 80,  duration: 6,  beats: { laptopOpen: 1, phoneWake: 3.6, tableLightDies: 4.2, gulp5: 5.25 } },
  { id: 's12',  start: 86,  duration: 10, beats: { quiet1Start: 0 } },                                   // 1:26
  { id: 's13',  start: 96,  duration: 7,  beats: { headLift: 0.5, revealSleeper: 1.4, revealDrinks: 2.4, revealFreshman: 3.4 } },
  { id: 's14',  start: 103, duration: 5,  beats: { custodianPass: 0.5, tinyBlobSeen: 2.3 } },
  { id: 's15',  start: 108, duration: 14, beats: { sensorWakeMarston: 0.5, phoneFaceDown: 7.417, penUncap: 8, nameWritten: 10 } }, // 1:48
  { id: 's16',  start: 122, duration: 24, beats: { crossOut: 5.1, problemOneSolved: 7, problemSolved2: 13.5, problemSolved3: 16, problemSolved4: 18, problemSolved5: 19.5, sensorWakeNeighbor: 20, problemSolved6: 21 } }, // 2:02
  { id: 's17',  start: 146, duration: 18, beats: { quiet2Start: 0, dawnBird1: 4, dawnBird2: 10, dawnBird3: 15 } },   // 2:26
  { id: 's17b', start: 164, duration: 9,  beats: { examRoom: 0, testRecognise: 3, testSmile: 4.5, testSolved: 8.5 } }, // 2:44
  { id: 's17c', start: 173, duration: 5,  beats: { gradeSlide: 0.5, gradeReveal: 2 } },                  // 2:53
  { id: 's18',  start: 178, duration: 17, beats: { examCrossedOff: 2, blobAbsorbed: 5.5, newDate: 9.5, dropQuivers: 11, tagPenUncap: 13.5 } }, // 2:58 → 3:15
];

export function shotAt(t) {
  const shot = SHOTS.findLast((s) => t >= s.start) ?? SHOTS[0];
  return { shot, tLocal: t - shot.start };
}

export function beat(name) {
  for (const s of SHOTS) if (name in s.beats) return s.start + s.beats[name];
  throw new Error(`unknown beat: ${name}`);
}
