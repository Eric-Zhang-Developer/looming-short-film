# Brief · climax-a1 (the bedroom: bed rot, 3 a.m., the choice, and the clock)

**Type:** builder · **Wave:** 6 (v4) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/02-story.md` (v4, approved), `docs/shots/README.md` (all, especially §12 acting and §13 the clock), `docs/shots/s07.md`, `s08.md`, `s09a.md`, `docs/shots/QUESTIONS.md` Q16–Q17, `docs/05-sound.md` (cue table, for beat names only), `docs/contracts.md`, `src/characters/acting.js`, `src/timeline.js`, `done/spec-v4.md`, `done/asset-v4-kit.md`, `done/rig-v4.md`

## Goal
The bottom of the film and the decision, built: s07 (bed rot, 12 s), s08 (3:00 a.m., 10 s, the clock's tick alone) and s09a (the choice, 6 s), plus the one clock module the whole film uses. This is the first half of the climax, so the acting carries it: the saddest the gator gets, then resolve.

## Owns
- `src/shots/s07.js`, `src/shots/s08.js` (rebuilt under their old names), new `src/shots/s09a.js`
- new `src/clock.js`
- `evidence/climax-a1/`, `done/climax-a1.md`

## Inputs and decisions already made (do not re-open)
- **Specs win.** Build to `docs/shots/s07.md`, `s08.md`, `s09a.md` and README §12–13. Q16 and Q17 are built to their **Recommend** lines.
- **The clock uses the painted kit, not a procedural dial.** `clock_kit` is frozen and cut (`assets/frozen/clock_kit.png`, PIECES in `src/assets.js`): `face_home` (kraft rim), `face_exam` (navy rim), `hour`, `minute` (both already scaled to fit the dial), `pin`, `tab`, `minute_spare`. API from README §13: `makeClock(ctx, { seed, diameter = 0.020, face = 'home' }) → { group, set(h, m, s) }`. Each hand pivots on its **round end**: find it from the cut bitmap, don't guess. The kit has no second hand: draw a thin one in code with the paper material (Night Navy), stepping on whole seconds as §13 says. Every hand is a pure function of t. Batch B (s02, s17b, s18) and the exam room will import `makeClock`, so keep the API exactly this.
- **Close-ups use the painted heads.** `closeup_heads` is frozen and cut: `numb`, `dread`, `resolve`, `relief`, `surprised_smile`, `pride`, each a whole side head with its expression painted in, cut at the neck to sit under the hoodie collar. They are **swaps, not a parts face**: change heads on an expression change, with the acting kit's anticipation (2–3 frames) and a ≥ 12-frame hold. Presets without a painted head (`guilt`, `flinch`, `neutral`) stay on the rig's face-sheet swaps, in the wider framings. Known drift: the painted heads have a taller eye bump and a slightly thicker, greener snout than the rig's head. Avoid cutting rig ↔ painted head on the same framing; a camera change hides it. If the green jars on the cut, one shared colour multiply on the head material is allowed (log the value).
- **s08's gaze from the clock to the calendar:** the painted heads' pupils don't move. Carry the look by cutting (clock insert → his face → the red circle → his face) and a head turn, not pupil animation. If you need a gaze shift on the face, use the rig's face-sheet eyes in the wider C3 framing.
- **The blob's eyes in s09a's black room:** `contract-blob` has no glow option and is not yours. Use the in-shot fallback that `s09a.md` gives, and record it in the done note as a contract change for later.
- **Bedroom constants:** `s07.js` exports the room constants that `s08.js` and `s09a.js` import (all yours). Don't touch `poses.js`, `blob.js`, `lights.js`, `assets.js`. Build `lie_phone` and any other pose with `specPose` inside your shot.
- **The light rule:** low light, close (phone glow under his chin), makes the shadow loom over the ceiling. Shadow scale ≈ (light-to-wall distance) ÷ (light-to-blob distance). Re-solve every hand-computed number in the specs at build and say what you measured.

## Acceptance
- [ ] `evidence/climax-a1/s07_sheet.jpg`, `s08_sheet.jpg`, `s09a_sheet.jpg` (`render.mjs --sheet`, at least 6 frames each at the beat times in `src/timeline.js`)
- [ ] `evidence/climax-a1/clock_times.jpg`: the home face set to 9:00, 1:45, 3:00:00, 3:00:09 and 4:10, plus the exam face at 9:00. Hands on their pivots, inside the dial.
- [ ] `evidence/climax-a1/closeups.jpg`: every close-up frame in your three shots, at phone size (about 400 px wide)
- [ ] A strip across s08's 3:00 tick showing the second hand stepping on whole seconds, with the one-frame overshoot
- [ ] The s07 ceiling shadow is measured and stated (blob shadow width ÷ blob width)
- [ ] `node tools/check_timeline.mjs` ok; determinism passes for your shots (same frame twice gives the same hash)
- [ ] Done note `done/climax-a1.md` from `templates/done-note.md`, ending with `## Story` (what happened, true and specific: what surprised you, what you changed your mind about)

## Machine (hard)
- One headless Chrome at a time, foreground only, `--w ≤ 960`, closed after use. Another builder is rendering in parallel, and the disk is tight (about 3 GB free): render sheets and strips, never full frame sets, and delete any frames you write once the jpg is made.
- A watchdog kills headless Chrome if disk or memory gets dangerous. If your Chrome dies unexpectedly, check `out/watchdog.log` and re-run once.
- Stay inside your worktree. Don't delete or edit anything outside it, including any scratchpad or `/tmp` files you didn't create.

## Git
Commit in your worktree on `task/climax-a1` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, don't merge, don't open PRs.

## Out of scope
s09b, s09c, s10 (climax-a2 builds them in parallel), the trims (batch B), sound (`src/audio/`), doc edits other than your done note.
