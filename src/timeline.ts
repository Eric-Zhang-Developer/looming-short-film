// Single source of timing truth (contracts.md). Data only: no clocks, no rendering.
// The v4 cut (spec-v4, story approved by the director 2026-10-17): 3:15; v6 adds s10b (the stacks, 6 s): 3:21; v7 grows s13
// from 5 s to 8 s (v3's music-timed shadows, then the turn): 3:24. Shots and beats from docs/02-story.md's beat
// sheet and docs/shots/sNN.md (local seconds); a letter after a number means a shot added after the numbering froze
// (s00 before s01; s09a-c after s08; s10b after s10; s17b after s17). Cut since G4: s09 (Marston exterior), s12 (quiet 1), s14 (custodian);
// s07, s08 and s10 keep their file names for new shots (bed rot, 3 a.m., the threshold).
// The climax runs on two grids: the clock's tick at 1 s (s08 from 60.0) and the walk's pulse at 0.5 s (s09c from 84.0),
// so every lamp, the block, the door push and the light land on whole half-seconds of global time.
// Durations are written out (not derived) so tools/check_timeline.mjs can catch gaps and overlaps.
export const DURATION = 204;

export type Shot = { id: string; start: number; duration: number; beats: Record<string, number> };

export const SHOTS: Shot[] = [
  { id: 's00',  start: 0,   duration: 4,  beats: { notifyBuzz: 0.5 } },                                   // 0:00 cold open
  { id: 's01',  start: 4,   duration: 5,  beats: {} },
  { id: 's02',  start: 9,   duration: 10, beats: { calendarZoom: 1.5, inkDropForms: 5 } },               // 0:09; clock at ~9:00
  { id: 's03',  start: 19,  duration: 7,  beats: { laptopUp: 1, gulp1: 4.5 } },                          // 0:19
  { id: 's04',  start: 26,  duration: 7,  beats: { fridge: 0 } },
  { id: 's05',  start: 33,  duration: 7,  beats: { gameNight: 0 } },
  { id: 's06',  start: 40,  duration: 8,  beats: { lampClickHome: 0.5, lampOffHome: 3, gulp2: 4 } },     // 0:40
  { id: 's07',  start: 48,  duration: 12, beats: { bedRot: 0, clockGlance: 6, gulp3: 7.5 } },            // 0:48 bed rot; clock ~1:45
  { id: 's08',  start: 60,  duration: 10, beats: { clockThree: 0, circleGlance: 4, sweatDrop: 6.5 } },   // 1:00 3 a.m.: music out, tick alone
  { id: 's09a', start: 70,  duration: 6,  beats: { phoneFaceDown: 0.5, breathIn: 1.5, resolveFace: 3, sitUp: 3.5, lampOn: 4, backpackGrab: 5 } }, // 1:10 the choice
  { id: 's09b', start: 76,  duration: 6,  beats: { doorOpen: 1, shadowAhead: 2.5, stepIntoShadow: 4.5 } }, // 1:16 the door
  { id: 's09c', start: 82,  duration: 20, beats: { walkStart: 0, lamp1: 2, lamp2: 5.5, lamp3: 8.5, blobBlocks: 10, stepAround: 12, lamp4: 13.5, lamp5: 15, marstonSeen: 16 } }, // 1:22 the walk
  { id: 's10',  start: 102, duration: 8,  beats: { doorPush: 1, lightFlood: 1.5, blobBlinks: 2.5, exhale: 5 } }, // 1:42 the threshold
  { id: 's10b', start: 110, duration: 6,  beats: { pocketPhone: 1, underLight1: 2, underLight2: 4.5 } }, // 1:50 the stacks (v6: v3's walk, under the light)
  { id: 's11',  start: 116, duration: 7,  beats: { deskSit: 0.5, blobClimbs: 3, blobSettles: 5 } },     // 1:56
  // v7: v3's build (phones wake desk by desk, each shadow springing up on a note), then the turn (phones face down, each
  // shadow collapsing to its pool on the theme's chords). Every desk's two events are in S13_DESKS below.
  { id: 's13',  start: 123, duration: 8,  beats: { headLift: 0.5, revealSleeper: 1.25, revealDrinks: 2.25, revealFreshman: 3.25, roomWakes: 3.5, phonesDown: 5, homeChord: 7 } }, // 2:03
  { id: 's15',  start: 131, duration: 8,  beats: { penUncap: 1.5, nameWritten: 4.5, nameSmile: 5.5 } },  // 2:11
  { id: 's16',  start: 139, duration: 16, beats: { crossOut: 4.6, problemOneSolved: 6.5, problemSolved2: 11.5, problemSolved3: 13, problemSolved4: 14, problemSolved5: 15 } }, // 2:19
  { id: 's17',  start: 155, duration: 12, beats: { quiet2Start: 0, dawnBird1: 3, dawnBird2: 7, dawnBird3: 10 } },   // 2:35
  { id: 's17b', start: 167, duration: 10, beats: { examRoom: 0, testRecognise: 4, testSmile: 5.5, testSolved: 9.5 } }, // 2:47
  { id: 's17c', start: 177, duration: 7,  beats: { gradeSlide: 0.5, gradeReveal: 2, gradeGrin: 4 } },   // 2:57
  { id: 's18',  start: 184, duration: 20, beats: { examCrossedOff: 2, blobAbsorbed: 5.5, lampSitBack: 7.5, newDate: 12.5, dropQuivers: 14, tagPenUncap: 16.5 } }, // 3:04 → 3:24
];

// s13's cascade, the one place its timing lives: for each crowd desk, when its phone wakes (its shadow springs up) and
// when it goes face down (the shadow collapses to its pool under the pendant), as [beat, offset s]. src/shots/s13.js
// draws from it and src/audio/score.js puts a note on every event, so moving a desk here moves its shadow and its note.
// Build: the three featured desks a second apart (v3's 1.4 / 2.4 / 3.4, a little earlier, so the last loom is full and
// held a quarter-second before the turn), then the room's other seven every 1/8 s from the outside in, closing round him.
// Turn: from his neighbours outward, two desks per chord, a quarter-second apart; the Freshman's is the last phone down,
// on the home chord's top note.
export const S13_DESKS: Record<string, { wake: [string, number], down: [string, number] }> = {
  d2:  { wake: ['revealSleeper', 0],  down: ['phonesDown', 0.5] },
  d4:  { wake: ['revealDrinks', 0],   down: ['phonesDown', 1.0] },
  d15: { wake: ['revealFreshman', 0], down: ['homeChord', 0.25] },
  d1:  { wake: ['roomWakes', 0],      down: ['phonesDown', 1.5] },
  d11: { wake: ['roomWakes', 0.125],  down: ['phonesDown', 1.75] },
  d5:  { wake: ['roomWakes', 0.25],   down: ['homeChord', 0] },
  d12: { wake: ['roomWakes', 0.375],  down: ['phonesDown', 0.75] },
  d14: { wake: ['roomWakes', 0.5],    down: ['phonesDown', 1.25] },
  d7:  { wake: ['roomWakes', 0.625],  down: ['phonesDown', 0] },
  d9:  { wake: ['roomWakes', 0.75],   down: ['phonesDown', 0.25] },
};

export function shotAt(t: number): { shot: Shot; tLocal: number } {
  const shot = SHOTS.findLast((s) => t >= s.start) ?? SHOTS[0];
  return { shot, tLocal: t - shot.start };
}

export function beat(name: string): number {
  for (const s of SHOTS) if (name in s.beats) return s.start + s.beats[name];
  throw new Error(`unknown beat: ${name}`);
}
