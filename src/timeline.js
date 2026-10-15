// Single source of timing truth (contracts.md). Data only: no clocks, no rendering.
// id/start/duration from doc 06's shot list; beats from doc 02's beat sheet (local seconds),
// plus the cue anchors the storyboards and snd-score asked for (sb-reconcile), placed where docs/shots put them.
// Durations are written out (not derived) so tools/check_timeline.mjs can catch gaps and overlaps.
export const DURATION = 180;

export const SHOTS = [
  { id: 's01', start: 0,   duration: 6,  beats: {} },
  { id: 's02', start: 6,   duration: 9,  beats: { inkDropForms: 4 } },            // 0:10
  { id: 's03', start: 15,  duration: 5,  beats: { phoneUp: 0.5 } },               // 0:15
  { id: 's04', start: 20,  duration: 8,  beats: { fridge: 0 } },
  { id: 's05', start: 28,  duration: 8,  beats: { gameNight: 0 } },
  { id: 's06', start: 36,  duration: 8,  beats: { lampClickHome: 0.5, lampOffHome: 3 } }, // 0:36; off time not in docs
  { id: 's07', start: 44,  duration: 10, beats: { curtainsStart: 0, curtainsDone: 8 } }, // before 0:54 scroll
  { id: 's08', start: 54,  duration: 6,  beats: { scrollStart: 0 } },
  { id: 's09', start: 60,  duration: 6,  beats: { marstonEnter: 0 } },
  { id: 's10', start: 66,  duration: 6,  beats: { stacksEnter: 0, stacksFlicker1: 0.4, stacksFlicker2: 3.4 } },
  { id: 's11', start: 72,  duration: 6,  beats: { laptopOpen: 1, phoneWake: 3.6, tableLightDies: 4.2 } },
  { id: 's12', start: 78,  duration: 10, beats: { quiet1Start: 0 } },             // 1:18
  { id: 's13', start: 88,  duration: 7,  beats: { headLift: 0.5, revealSleeper: 1.4, revealDrinks: 2.4, revealFreshman: 3.4 } }, // 1:28
  { id: 's14', start: 95,  duration: 5,  beats: { custodianPass: 0.5, tinyBlobSeen: 2.3 } }, // 1:35
  { id: 's15', start: 100, duration: 14, beats: { sensorWakeMarston: 0.5, phoneFaceDown: 7.417, penUncap: 8, nameWritten: 10 } }, // 1:40 / 1:48 / 1:50
  { id: 's16', start: 114, duration: 21, beats: { problemOneSolved: 3, problemSolved2: 8.5, problemSolved3: 11, problemSolved4: 13, problemSolved5: 14.5, sensorWakeNeighbor: 15, problemSolved6: 16 } }, // 1:54 + ~3 s
  { id: 's17', start: 135, duration: 25, beats: { quiet2Start: 0, dawnBird1: 6, dawnBird2: 13.5, dawnBird3: 19 } }, // 2:15
  { id: 's18', start: 160, duration: 20, beats: { nextSemester: 0, sensorWakeFreshman: 4, blobYawn: 14 } }, // 2:40 / 2:44 / 2:54
];

export function shotAt(t) {
  const shot = SHOTS.findLast((s) => t >= s.start) ?? SHOTS[0];
  return { shot, tLocal: t - shot.start };
}

export function beat(name) {
  for (const s of SHOTS) if (name in s.beats) return s.start + s.beats[name];
  throw new Error(`unknown beat: ${name}`);
}
