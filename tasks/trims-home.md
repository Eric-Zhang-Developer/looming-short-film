# Brief · trims-home (batch B, part 2: the home shots, plus two rig fixes)

**Type:** builder · **Wave:** 6 (v4) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/02-story.md` (v4, Acts 1–2 and the Ending), `docs/shots/README.md` (§1 the meter, §12 acting, §13 the clock), `docs/shots/s01.md`–`s06.md`, `docs/shots/s18.md`, `docs/contracts.md`, `src/characters/acting.js`, `src/characters/gator.js`, `src/clock.js`, `src/timeline.js`, `done/spec-v4.md`, `done/rig-v4.md`, `done/climax-a1.md`, `docs/notes/v4-fixlist.md` ("Carried from rig-v4")

## Goal
The home shots follow the v4 timeline: s01 (5 s), s02 (the calendar with the clock beside it at 9:00), s03 (the laptop, gulp 1), s04 (the kitchen), s05 (game night with the gator roommates), s06 (the lamp clicked on and off, gulp 2) and s18 (home in the afternoon, the clock at ~4:10, the cross-off, the tag). Each gets its v4 timing, its acting presets and the new blob sizes. Plus two small rig fixes nobody else owns.

## Owns
- `src/shots/s01.js`, `s02.js`, `s03.js`, `s04.js`, `s05.js`, `s06.js`, `s18.js`
- `src/characters/gator.js`: **the neck's colour only**
- `src/characters/acting.js`: **the `resolve` preset only**
- `evidence/trims-home/`, `done/trims-home.md`

## Decisions already made (do not re-open)
- **Specs win** for staging and timing: the v4 block at the top of each spec says what changed, and `src/timeline.js` has the beat names and local times.
- **The blob ladder (README §1, the director's Q16 answer):** s02 born → 1× (r 0.012); **s03 gulp 1: 1 → 1.5 (0.018)**; s04 and s05 hold 1.5; **s06 gulp 2: 1.5 → 2 (0.024)**, and its lamp shows it at 1.5 first. s18 starts at r 0.004 and the cross-off takes it to the dot (0.0015) per README §1's `SHRINK`. Re-solve any shadow light position that the bigger sizes move, so the shadow keeps the units its spec gives (README §1, "Shadow units").
- **The clock (s02, s18):** `await makeClock(ctx, { seed, face: 'home' })` from `src/clock.js` returns `{ group, set(h, m, s), boil(t) }`. Call `clock.set(...)` and `clock.boil(t)` every frame. Placement and readings are in README §13 (s02 9:00 beside the calendar; s18 ~4:10). It must be the same clock on the same wall as s07 and s08 (`ROOM` constants in `src/shots/s07.js`); match its look, not s07's set coordinates.
- **s02.js exports stay stable** (names and behaviour): `DESK`, `B`, `tools`, `homeDesk`, `seatReach`. s00, s03, s06, s07 and s18 import them. Keep s18's use of `loadHand`, `handFont` from `s17b.js` as is (another builder owns s17b and keeps those stable).
- **The two rig fixes:**
  1. **Neck colour:** the drawn cream throat is a little paler and smoother than the painted cream (`evidence/rig-v4/neck.jpg`). Match it to the painted sheet's cream; colour or texture only, no shape change.
  2. **`resolve` vs `neutral`:** they're hard to tell apart at 220 px (`done/rig-v4.md`). Make `resolve` read at phone size: brows lower and flatter, and a firmer mouth than the hair-thin `line` (a thicker tight line, drawn the way the brows are). Don't change any other preset. Check one frame of s09a (the resolve face) still builds.
- s05's roommates are already gators (rig-v4); keep them.
- Don't touch other shots, `poses.js`, `blob.js`, `lights.js`, `assets.js`, `clock.js`, `src/audio/`. Use `specPose` in-shot for any new pose.

## Acceptance
- [ ] One sheet per shot, `evidence/trims-home/<shot>_sheet.jpg` (`render.mjs --sheet`, ≥ 6 frames at the beat times)
- [ ] `evidence/trims-home/clock.jpg`: s02 at 9:00 and s18 at ~4:10, cropped, beside s07's clock crop (`evidence/climax-a1/s07_clock_crop.png` is in the repo)
- [ ] `evidence/trims-home/blob_sizes.txt`: the blob's r at each beat in s02–s06 and s18, against README §1
- [ ] `evidence/trims-home/neck.jpg` (before and after beside the frozen sheet's cream) and `evidence/trims-home/resolve.jpg` (`neutral` | old `resolve` | new `resolve` at 220 px)
- [ ] One frame each of s00, s07 and s09a still builds (they import from your files)
- [ ] `node tools/check_timeline.mjs` ok; determinism passes for every shot you touched
- [ ] Done note `done/trims-home.md` from `templates/done-note.md`, ending with `## Story`

## Machine and git
- One headless Chrome at a time, foreground only, `--w ≤ 960`, closed after use. Another builder (trims-marston) is rendering in parallel. **Disk is tight (about 6 GB free) and `out/` in the main checkout is a dead link right now (an external drive is unplugged):** use only your worktree's own `out/`, sheets and strips only, and delete frames once the jpg is made.
- Stay inside your worktree. Don't delete or edit anything outside it.
- Commit on `task/trims-home` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, merge or open PRs.

## Out of scope
s00, s07–s17c, sound, docs other than your done note.
