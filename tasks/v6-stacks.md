# Brief · v6-stacks (s10b: the stacks walk comes back, under the light)

**Type:** builder · **Version:** v6 · **Model:** given at dispatch · **Time box:** about 75 minutes; committed working beats polished.
**Read first:** `AGENTS.md`, `docs/02-story.md` (the rule, Act 4, Story rules), `docs/shots/s10.md`, `docs/shots/s11.md`, `src/shots/s10.js`, `src/shots/s11.js`, `src/timeline.js`, `src/lights.js`. **The old shot:** v3's s10 "The stacks" (`git show 228d5b2^:src/shots/s10.js`, `git show 228d5b2^:docs/shots/s10.md`; frames in `evidence/v3-fix-marston/s10_after.jpg` and `evidence/anim-s10/`). Rebuild it from that code and its frozen Marston kit art.

## The director, verbatim
"what happened to the library scene where gator is walking foward that got cut. ihonestly really liked it maybe rehashed". Approved: "Yes, bring the stacks walk back as a 6 s shot after the threshold: overhead strip lights, phone into his pocket, small shadow. Runtime goes to 3:21 and v6 gets a full render."

## The shot (s10b, 6 s, after s10's threshold and before s11's desk)
v3's stacks walk, with its meaning flipped by the v4 rule. In v3 the phone lit him low and the blob's shadow grew huge on the end wall as he neared the lens. Now Marston's light comes from above:
- **Same framing as v3:** a locked camera down a stacks aisle; he walks toward the lens between the bookshelf bays, with the 2.5× blob (its size in s10/s11; it only shrinks by solved problems) waddling behind his right side on the carpet.
- **Phone into his pocket** early (within the first 1.5 s), a visible choice: he looks at it, then slides it into the hoodie pocket.
- **Overhead strip lights key him**, one tube per bay. As he and the blob pass under each, the blob's shadow is a small pool on the carpet under it, never a looming wall shadow. No faltering tubes (the v3 dread beat is gone).
- **His face:** calm, settling (`relief` or the resolve-to-relief of s10). He breathes slower than on the walk.
- Characters on 2s, light and camera on 1s, matching s10 and s11.

## Timeline
- Insert `{ id: 's10b', start: 110, duration: 6, beats: { pocketPhone: …, … } }` after s10. Pick 2–3 beats on whole or half seconds (the pulse grid), e.g. `pocketPhone`, `underLight1`.
- **Shift every later shot's `start` by +6** (s11 116 … s18 181), so `DURATION` becomes 201. No local beat changes anywhere else.
- **Grep for hard-coded global times after 110** in `src/shots/`, `src/audio/`, `tools/` and the evidence/probe scripts the checks use (determinism times, `DUR` defaults), and fix anything that assumed the old starts. Sound cues and the score are placed by beat name, so they should follow; confirm by checking that `node tools/mix.mjs` runs and the mix is 201 s.
- **Sound for s10b:** at most three new cue lines in `src/audio/cues.js` for s10b: footsteps on carpet (an existing foley sound, softer than s09c's paving), and the phone going into the pocket (cloth rustle, if one exists). Check the score and ambience beds have no hole at 110–116: the fluorescent hum bed runs `lightFlood` → `examRoom` and should cover it. If the score goes silent across the new 6 s, say so; don't restructure `score.js`.

## Owns
`src/shots/s10b.js` (new), `src/timeline.js`, s10b's cue lines in `src/audio/cues.js`, `docs/shots/s10b.md` (new, short), the Act 4 beat line in `docs/02-story.md`, any hard-coded global time you must shift (list them in the done note), `evidence/v6-stacks/`, `done/v6-stacks.md`.

**Not yours:** `src/shots/s18.js` and s18's tag cues (v6-ending is rewriting them), and `s07.js`, `s08.js`, `s09a.js`, `bedroom()`/`LIE` (v6-bed). Don't touch those.

## Acceptance
- [ ] `evidence/v6-stacks/sheet.jpg`: one frame per 0.5 s over 110–116
- [ ] `evidence/v6-stacks/seams.jpg`: 109.5, 110.0 (s10 → s10b) and 115.9, 116.1 (s10b → s11)
- [ ] `node tools/check_timeline.mjs` ok (22 shots, 201.0 s); determinism at three s10b times and at one time each in s11 and s18 (new starts); `npx tsc --noEmit -p .` clean
- [ ] `node tools/mix.mjs` runs; loudness stays within −16 ±1 LUFS, ≤ −4 dBTP
- [ ] Done note `done/v6-stacks.md` ending with `## Story`

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use; two other builders run in parallel. Sheets and strips only; delete frames after. Stay in your worktree. Commit on `task/v6-stacks` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge.
