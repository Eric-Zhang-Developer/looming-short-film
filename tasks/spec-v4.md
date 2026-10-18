# Brief · spec-v4

**Type:** builder (docs + timeline contract, no Chrome) · **Wave:** 6 (v4) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, **`docs/02-story.md`** (the approved v4 story: beat sheet, clock, acting map, swell cue sheet), `docs/02-story-v4-draft.md` (the why, the cut list, the cost), `docs/07-process-log.md` (the last entry), `docs/shots/README.md`, every `docs/shots/sNN.md`, `src/timeline.js`, `tools/check_timeline.mjs`, `docs/05-sound.md`, `docs/assets.md`, `src/assets.js` (what art exists: home_kit, kitchen_kit, marston_kit, marston_ext_kit with lampposts and oaks, props_kit, exam_room_kit with a wall clock), `docs/contracts.md` §characters (the acting kit API, if rig-v4 has added it; otherwise `tasks/rig-v4.md` §3)

## Goal
The approved v4 story becomes buildable: a spec for every shot, the timeline, and the cue sheet, so builders can rebuild the film in two rounds today.

## Owns
`docs/shots/**`, `src/timeline.js`, `tools/check_timeline.mjs` (only if new shots need it), `docs/05-sound.md` (cue table plus a rename map), `docs/assets.md` (new rows: the clock, the close-up head kit, any campus or hallway pieces), `done/spec-v4.md`

## Spec
1. **Shot list and times exactly as doc 02's beat sheet** (≈3:15). New: s07 (bed rot, reusing the file name), s08 (3 a.m.), s09a (the choice), s09b (the door), s09c (the walk), s10 (the threshold, reusing the file name). Cut from the timeline: old s12 (quiet 1), s14 (custodian), the blinds and game-to-sunrise content, the stacks. Note the dead shot files for the builders to delete.
2. **Every spec** in the existing format (beats with times, camera, light, poses, faces, BLOB_R from the meter, cues), plus two new fields per shot:
   - `acting`: the expression per beat from doc 02's acting map, in the acting kit's terms (`numb`, `guilt`, `flinch`, `dread`, `resolve`, `relief`, `pride`), plus breath rate and posture
   - `closeup`: whether a beat uses a close-up head from the new kit
3. **The climax specs (s08–s10) are the most important text you'll write.** Give each one its staging, light and camera beat by beat. Make every cause and effect visible: the light source and the shadow in the same frame. The door's backlight throws the shadow *ahead* of him. Each street lamp's shadow cycle lands on the pulse, and the blob blocks him once. The threshold's light floods from above and the shadow snaps. Timings must line up with the swell cue sheet.
4. **The clock:** one design (tick marks, no numbers) beside the calendar. Times per doc 02's table: s02 ~9:00, s07 ~1:45, s08 3:00, s17b exam room, s18 tag afternoon. Say where it is in frame each time.
5. **Sound:** turn doc 02's swell cue sheet into the doc 05 cue table with beat names: the tick (~60 bpm in s08), the pulse (~120 bpm on the walk), one layer per lamp, the block's dissonance and its resolve, the threshold chord, near-silence. Re-time every kept cue. Remove the sensor-relay cues and say so.
6. **Timeline:** `src/timeline.js` to the new cut, beat names for the new moments. `node tools/check_timeline.mjs` must pass.
7. **Builder batches:** at the end of your done note, propose two builder batches with no shared files: A = the climax (s07–s10), B = the trims.

## Acceptance
- [ ] Every shot in the new timeline has a spec; every cut shot is listed
- [ ] `check_timeline` ok (output in the done note)
- [ ] doc 05's cue table matches the beats; the swell's layers are listed with times
- [ ] The done note ends with `## Story`

## Out of scope
Shot code, art, audio code.
