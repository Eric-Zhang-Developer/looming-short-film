# Done · spec-v4

## What shipped
The approved v4 story is on paper and on the timeline: 21 shot specs for the 3:15 cut, six of them new and written beat by beat for the climax (s07 bed rot, s08 3 a.m., s09a the choice, s09b the door, s09c the walk, s10 the threshold). s11, s13 and s15 are rewritten so Marston reads as the reward. The kept shots get v4 blocks with mechanical re-timing rules. Every spec now carries `Acting` and `Close-up` fields. There is one procedural clock with a reading and frame position per shot. Doc 05's cue table turns the swell into named cues, and docs/assets.md has rows for the new pieces.

## Where it lives
Branch `task/spec-v4`, 10 commits `3f13ead`…`c52de03`:
- `src/timeline.js` (`3f13ead`)
- `docs/shots/s07.md`, `s08.md`, `s09a.md`, `s09b.md` (`657f735`, `c52de03`); `s09c.md`, `s10.md` (`47ca53e`)
- `docs/shots/s11.md`, `s13.md`, `s15.md` (`d38ae85`)
- v4 blocks in `s00`–`s06`, `s16`, `s17`, `s17b`, `s17c`, `s18` (`b6da76f`)
- `docs/shots/README.md`: "v4 at a glance", the §1 meter, §9, new §12 acting and close-ups, new §13 the clock (`7625897`)
- `docs/shots/s09.md`, `s12.md`, `s14.md` deleted; `QUESTIONS.md` Q16–Q17 (`cf0dbe0`)
- `docs/05-sound.md` (`dbb0d3b`), `docs/assets.md` (`f908287`)

## How it was checked
- [x] **Every shot in the new timeline has a spec, and every cut shot is listed.** A scratch script compared each spec's `**Time:**` line with `src/timeline.js`: duration, every beat name and every local time. Output: `spec files not in the timeline: none` / `ok: 21 specs match the timeline`. The cut shots (s09, s12, s14) and the dead code files are listed in README "v4 at a glance" and under Batches below.
- [x] **`check_timeline` ok:** `node tools/check_timeline.mjs` → `ok (21 shots, 69 beats, 195.0s)`. The checker needed no change.
- [x] **Doc 05's cue table matches the beats.** A second scratch script read every backticked beat name in the table's "Where" column, resolved it with `beat()`, and compared it with the global time the table quotes: `92 beat refs checked, 0 mismatches` (the only non-beat token it flagged was the sound name `paperRustle`). The swell's layers are listed with their times: pulse `lamp1` 84.0, felt piano `lamp2` 87.5, pad `lamp3` 90.5, dissonance `blobBlocks` 92.0 → resolve `stepAround` 94.0, music box `lamp4` 95.5, bass swell `lamp5` 97.0, climb from `marstonSeen` 98.0, peak `doorPush` 103.0, held chord `lightFlood` 103.5. The sensor-relay cues are removed and the doc says so.
- [x] Every spec has an Acting and a Close-up section: a grep for `^## Acting` and `^## Close-up` gave one of each in all 21 files.
- [ ] **Geometry: not verified by render.** This task allowed no Chrome. Every shadow scale, frame position and px size in the new specs comes from hand arithmetic on the v3 constants, and each says "re-solve at build" with an acceptance test that measures it.

## Gaps
- **Two calls are built to a recommendation and wait on the director (QUESTIONS Q16, Q17).** Q16: the meter now peaks at **2×**, not 2.5×. v4 has one gulp in bed where G4 had three later ones, so s16 shrinks the blob in five solves. Q17: the light behind him at the door is a **plug-in night-light**. Doc 02 says "hallway light", but a ceiling light would make the shadow small, against the film's own rule.
- **Decisions I made where the story is silent:**
  - No laptop at Marston (it was the home game).
  - Marston's light is warm in v4 (doc 02 calls it warm; this goes against Q12's old recommendation).
  - s16's neighbor wake and the stand are cut along with the sensors.
  - s13's Sleeper art now reads as reading.
  - s17c gets a close-up for "the 94".
  - s18 is afternoon with the lamp on and gains a 3 s sit-back.
  - s01, s03, s04 and s05 change length even though doc 02 marks them "kept". Its beat-sheet times force it.
- **Rule bends to review:**
  - The walk's and the threshold's shadow lights use `decay 0`, so the long shadow far from a lamp stays dark. That's the same kind of stylization as README §4's screen light, and it bends doc 03 rule 3. The visible falloff comes from the per-lamp pool lights instead.
  - s09c is an 18 s lateral track. That's more than doc 03's "gentle lateral parallax", though it's motivated by his walk.
  - Doc 03 rules 2 and 8 still describe motion-sensor troughs. Doc 03 isn't in my owns, and neither is `docs/10-submission.md`, which doc 02 says must be reworded. The orchestrator should update both.
- **Contract change needed:** `contract-blob` should add a self-lit eye option (`update(t, { glow })`), so the blob's eyes read in s09a's black room. Today the room's light is the only thing that lights them. The s09a spec gives an in-shot fallback.
- **Not landed yet, specified against:**
  - rig-v4's acting kit. I used the API in `tasks/rig-v4.md` §3, because main has no `acting.js` yet.
  - `closeup_head_kit` is unpainted. Every close-up names a `gator_hero` fallback.
  - The new pose `lie_phone` (s07–s09a) has to be built with `specPose` or added by the rig owner.
- **Interim breakage until the builders and the sound pass land:**
  - `film.js` imports shots by timeline id, so `s09a/b/c.js` don't exist yet.
  - Kept shot modules read the new durations.
  - `src/audio/cues.js` and `score.js` still name cut beats, and `beat()` throws on those. The rename map is in doc 05.
- **s02's clock might not fit the built Camera W.** I didn't have the code camera's real-scale numbers, so the spec says to hang it on the calendar's left instead and log that.
- **A small mixed commit:** the s07/s08 clock coordinate fix (to match README §13's placement rule) went into `cf0dbe0` alongside the deleted specs, not into its own commit.
- I wrote no `evidence/spec-v4/` (it isn't in my owns). The check outputs are above. The two scratch scripts lived in the session scratchpad and aren't in the repo.

## Batches (proposal: two builder batches, no shared files)
**Batch A, the climax (critical path; start first).**
- Owns: `src/shots/s07.js`, `s08.js`, `s10.js` (rebuilt under their old names), new `src/shots/s09a.js`, `s09b.js`, `s09c.js`, deleting `src/shots/s09.js`, and **new `src/clock.js`**. The clock module is `makeClock(ctx, { seed, diameter = 0.020 }) → { group, set(h, m, s) }`, README §13, and A owns it because s08 is all clock.
- s07.js exports the bedroom constants that s08.js and s09a.js import (all inside A).
- s09c and s10 may import s11.js's existing helpers (`kitTools`, `mppOf`, `noCast`, `glow`, `carpetCanvas`, `wallCanvas`) read-only, or copy them.
- Uses `specPose` in-shot; doesn't touch poses.js, blob.js, lights.js or assets.js.
- Suggested split if two builders: A1 = s07, s08, s09a, clock.js (the bedroom); A2 = s09b, s09c, s10 (the hall, the walk, the door).

**Batch B, the trims.**
- Owns: `src/shots/s01.js`, `s02.js`, `s03.js`, `s04.js`, `s05.js`, `s06.js` (timing and acting only), `s11.js`, `s13.js`, `s15.js` (rewrites), `s16.js`, `s17.js`, `s17b.js`, `s17c.js`, `s18.js`, deleting `src/shots/s12.js` and `s14.js`.
- B must keep the exported helpers of `s11.js`, `s02.js`, `s15.js` and `s17b.js` stable (names and behaviour), because A and the other B shots import them.
- **The one cross-batch dependency:** s02, s17b and s18 import `makeClock` from A's `src/clock.js`. Do those three clock placements last, after A's clock commit is merged, or have the orchestrator merge `src/clock.js` early.
- s00 needs no change.

**Outside both:** the sound pass (`src/audio/*`: the renames, the new voices and the swell), `contract-blob` (eye glow), the `closeup_head_kit` painter, and doc 03 / doc 10 wording.

## Story
I read the brief, the approved story, every shot file and the v3 shot code before writing. The code mattered as much as the specs: the v2/v3 builders had re-staged everything at real scale, so the G4 numbers in the shot files often weren't what's on screen. That's why the new specs anchor on the code's constants and say "re-solve at build" wherever my arithmetic couldn't be rendered.

The climax was mostly physics. Doc 02 puts the hallway light behind him, throwing the shadow ahead, but a ceiling light makes it small under the film's own rule. The only light that's low and behind him once he's in the hall is a night-light on the near jamb of his door. That became Q17. The walk was harder: at real campus height, the lamps stretched the shadow only about 1.3×, so the heartbeat wouldn't read. I lowered the lanterns to just above his head, gave the shadow light a stylized falloff, and put every lamp on the 0.5 s pulse grid so the score can add a layer per lamp by beat name.

I caught two slips. First, the bedroom clock was touching the calendar. I noticed it while writing s02's placement rule and fixed it, though the fix rode along in an unrelated commit. Second, I nearly wrote an asset total that was wrong arithmetic on a count the table no longer supports. Checking the cue table by script found 0 mismatches in 92 beat references, which I wouldn't have trusted by eye.

## State
built · 2026-10-18
