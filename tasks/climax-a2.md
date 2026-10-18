# Brief · climax-a2 (the door, the walk, the threshold)

**Type:** builder · **Wave:** 6 (v4) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/02-story.md` (v4, approved), `docs/shots/README.md` (all, especially §12 acting), `docs/shots/s09b.md`, `s09c.md`, `s10.md`, `docs/shots/QUESTIONS.md` Q16–Q17, `docs/05-sound.md` (cue table, for beat names only), `docs/contracts.md`, `src/characters/acting.js`, `src/timeline.js`, `src/shots/s11.js` (helpers), `done/spec-v4.md`, `done/asset-v4-kit.md`, `done/rig-v4.md`

## Goal
The climax itself: s09b (the door, 6 s, the poster image), s09c (the walk, 20 s, a lamp on every heartbeat) and s10 (the threshold, 8 s, the light from above snaps the shadow small). The director: "the keystone decision in my life … is to go to the library … I'm super scared but I made the decision". The walk must feel terrifying and the threshold like relief.

## Owns
- `src/shots/s09b.js`, `src/shots/s09c.js` (new), `src/shots/s10.js` (rebuilt under its old name); delete `src/shots/s09.js` (the cut Marston exterior shot)
- `evidence/climax-a2/`, `done/climax-a2.md`

## Inputs and decisions already made (do not re-open)
- **Specs win.** Build to `docs/shots/s09b.md`, `s09c.md`, `s10.md` and README §12. **Q17 is built to its Recommend line:** a plug-in night-light low on the hall wall beside his door throws the blob's shadow huge **ahead** of him, down the hall. Q16: the blob is at 2× here.
- **Every beat lands on the pulse.** `src/timeline.js` already puts each lamp, `blobBlocks`, `stepAround`, `doorPush` and `lightFlood` on whole half-seconds of global time (120 bpm from 1:22). Read beat times from the timeline, never hard-code them, because the score is built on the same grid.
- **The light rule, the whole point of the climax:** a low street lamp behind or beside him stretches the shadow long; directly overhead it shrinks to his feet. At Marston's door the warm light comes **from above** and the shadow snaps to a puddle in one beat (`lightFlood`). Shadow scale ≈ (light-to-wall or ground distance) ÷ (light-to-blob distance). The spec's `decay 0` shadow lights with per-lamp pool lights are approved. Re-solve every hand-computed number at build and say what you measured.
- **Art:** reuse `marston_ext_kit` (lampposts, oaks, Century Tower, the ribbon windows) and `marston_kit`; the hallway, path and glass doors are procedural with the paper material. You may import `s11.js`'s helpers (`kitTools`, `mppOf`, `noCast`, `glow`, `carpetCanvas`, `wallCanvas`) **read-only**, or copy them. Batch B will rewrite s11 later and keep those names stable.
- **Close-ups use the painted heads.** `closeup_heads` is frozen and cut: `numb`, `dread`, `resolve`, `relief`, `surprised_smile`, `pride`, each a whole side head with its expression painted in, cut at the neck to sit under the hoodie collar. They are **swaps, not a parts face**: change heads on an expression change, with the acting kit's anticipation (2–3 frames) and a ≥ 12-frame hold. The door (s09b C5) is `dread` → `resolve`; the threshold (s10 CU) is `resolve` → `relief` (eyes closed, the exhale puff is painted on). Known drift: the painted heads have a taller eye bump and a slightly thicker, greener snout than the rig's head. Avoid cutting rig ↔ painted head on the same framing; a camera change hides it. If the green jars, one shared colour multiply on the head material is allowed (log the value).
- **Acting on the walk:** `act()` with breath 36–40/min, no slump, level tail, pace quickening toward Marston, sweat, never a smile until the threshold. At `blobBlocks` he stops and looks at it; at `stepAround` he steps around it.
- Don't touch `poses.js`, `blob.js`, `lights.js`, `assets.js`, `src/clock.js`. Use `specPose` in-shot for any new pose.

## Acceptance
- [ ] `evidence/climax-a2/s09b_sheet.jpg`, `s09c_sheet.jpg`, `s10_sheet.jpg` (`render.mjs --sheet`, at least 6 frames each, at the beat times)
- [ ] `evidence/climax-a2/poster.jpg`: s09b's frame with the shadow thrown down the hall ahead of him, at 1920 px wide (one frame)
- [ ] `evidence/climax-a2/lamp_strip.jpg`: s09c across two lamps, showing the shadow long → under his feet → long again. Shadow length measured at three points and stated.
- [ ] `evidence/climax-a2/snap.jpg`: s10 just before and just after `lightFlood`, with the shadow ÷ blob ratio measured on both
- [ ] `evidence/climax-a2/closeups.jpg`: every close-up frame at phone size (about 400 px wide)
- [ ] `node tools/check_timeline.mjs` ok; determinism passes for your shots
- [ ] Done note `done/climax-a2.md` from `templates/done-note.md`, ending with `## Story` (what happened, true and specific: what surprised you, what you changed your mind about)

## Machine (hard)
- One headless Chrome at a time, foreground only, `--w ≤ 960` (except the one 1920 poster frame), closed after use. Another builder is rendering in parallel, and the disk is tight (about 3 GB free): render sheets and strips, never full frame sets, and delete any frames you write once the jpg is made.
- A watchdog kills headless Chrome if disk or memory gets dangerous. If your Chrome dies unexpectedly, check `out/watchdog.log` and re-run once.
- Stay inside your worktree. Don't delete or edit anything outside it, including any scratchpad or `/tmp` files you didn't create.

## Git
Commit in your worktree on `task/climax-a2` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, don't merge, don't open PRs.

## Out of scope
s07, s08, s09a and `src/clock.js` (climax-a1 builds them in parallel), the trims (batch B), sound (`src/audio/`), doc edits other than your done note.
