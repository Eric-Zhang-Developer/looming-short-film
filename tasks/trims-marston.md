# Brief · trims-marston (batch B, part 1: Marston as the reward, and the payoff)

**Type:** builder · **Wave:** 6 (v4) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/02-story.md` (v4, Act 4 and the Payoff), `docs/shots/README.md` (all, especially §1 the meter, §12 acting and close-ups, §13 the clock), `docs/shots/s11.md`, `s13.md`, `s15.md`, `s16.md`, `s17.md`, `s17b.md`, `s17c.md`, `docs/shots/QUESTIONS.md` Q16–Q17, `docs/contracts.md`, `src/characters/acting.js`, `src/clock.js`, `src/timeline.js`, `done/spec-v4.md`, `done/climax-a1.md`, `done/climax-a2.md`

## Goal
After the walk, Marston is no longer where he hits bottom; it's the reward. Rebuild s11 (he sits at a window desk, the blob climbs up beside him), s13 (everyone has a small blob under their own light), s15 (he writes his name and smiles, surprised), and re-time s16 (practice), s17 (dawn, cut to 12 s), s17b (test day, with the exam room's calm clock) and s17c (the 94, with a close-up) to the v4 timeline. Delete the cut shots s12 and s14.

## Owns
- `src/shots/s11.js`, `s13.js`, `s15.js` (rewrites), `s16.js`, `s17.js`, `s17b.js`, `s17c.js` (re-time, acting, close-ups)
- delete `src/shots/s12.js`, `src/shots/s14.js`
- `evidence/trims-marston/`, `done/trims-marston.md`

## Decisions already made (do not re-open)
- **Specs win** for staging. The v4 block at the top of each spec says what changed; the timeline's beat names and local times are the truth.
- **The blob is 2.5× (r 0.030)** from the walk through s15 (README §1, Q16). s16 shrinks it 2.5 → 1.75 → 1 → 0.75 → 0.58 → 0.42 over its five solves (`SHRINK` in README §1), and s17 onward keeps those values.
- **The light is warm and from above** at Marston (v4), and it stays on: **no motion sensors** anywhere (the sensor wakes and the stand are cut). At s11 its shadow is small; the blob itself is big but "a little nervous". There's no laptop at Marston.
- **Close-ups use the painted heads** (`closeup_heads`: `numb`, `dread`, `resolve`, `relief`, `surprised_smile`, `pride`). They're whole-expression swaps: change heads on a cut or with the acting kit's 2–3-frame anticipation, and hold ≥ 12 frames. s15's name beat uses **`surprised_smile`**. s17c's close-up on "the 94" uses **`pride`**. Avoid cutting rig ↔ painted head on the same framing; a camera change hides the small drift in snout and eye bump.
- **s17b's clock:** `await makeClock(ctx, { seed, face: 'exam' })` from `src/clock.js`, which returns `{ group, set(h, m, s), boil(t) }`. Call `clock.set(...)` and `clock.boil(t)` every frame. It reads 9:00 (README §13) and the second hand steps slowly and calmly.
- **Keep these exports stable** (names and behaviour), because shots outside your batch import them:
  - `s11.js`: `kitTools`, `mppOf`, `noCast`, `glow`, `wallCanvas`, `carpetCanvas`, `marstonDesk`, `MARK`, `crop`, `idle` (s09b, s09c, s10, s13, s15, s16, s17)
  - `s15.js`: `UNIT`, `BLOB_AT`, `PHONE`, `PHONE_L`, `PAGE`, `practiceSheet`, `SHEET_INK`, `CAM_B2`, `penLine` (s16)
  - `s17b.js`: `PAGE`, `CAM_P`, `BLOB_AT`, `pageWithInk`, `flatHand`, `overheadSpot`, `loadHand`, `handFont` (s17c, s18)
  - If one has to change, update every importer inside your batch and say so; never break s09b, s09c, s10 or s18.
- Don't touch `poses.js`, `blob.js`, `lights.js`, `assets.js`, `gator.js`, `acting.js`, `clock.js`, `src/audio/`. Use `specPose` in-shot for any new pose.

## Acceptance
- [ ] One sheet per shot, `evidence/trims-marston/<shot>_sheet.jpg` (`render.mjs --sheet`, ≥ 6 frames at the beat times)
- [ ] `evidence/trims-marston/closeups.jpg`: the s15 surprised smile and the s17c pride close-up at about 400 px
- [ ] s11: the blob's shadow ÷ blob width measured and stated (small: the light from above is the point)
- [ ] s16: the blob's size at each solve matches `SHRINK` (state the measured r or px)
- [ ] `src/shots/s12.js` and `s14.js` are gone and nothing imports them; `grep -rn "s12\|s14" src/` lists no live reference
- [ ] `node tools/check_timeline.mjs` ok; determinism passes for every shot you touched
- [ ] Done note `done/trims-marston.md` from `templates/done-note.md`, ending with `## Story`

## Machine and git
- One headless Chrome at a time, foreground only, `--w ≤ 960`, closed after use. The sound builder runs in parallel (no Chrome). Disk is tight: sheets and strips only, never full frame sets; delete frames once the jpg is made. A watchdog kills headless Chrome if disk or memory gets dangerous; if your Chrome dies, check `out/watchdog.log` and re-run once.
- Stay inside your worktree. Don't delete or edit anything outside it.
- Commit on `task/trims-marston` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, merge or open PRs.

## Out of scope
s00–s10 and s18 (s01–s06 and s18 go to the next builder), sound, docs other than your done note.
