# Brief · v7-fridge (s04: the fridge loop)

**Type:** builder · **Version:** v7 · **Model:** given at dispatch · **Time box:** about 90 minutes; committed working beats polished.
**Read first:** `AGENTS.md`, `docs/02-story.md` (the rule; Act 2; Story rules), `docs/03-art-direction.md`, `docs/shots/s04.md`, `src/shots/s04.js`, `src/audio/cues.js` (s04's lines), `src/audio/foley.js` (what sounds exist).

## The director, verbatim
On v6's s04: "What the fuck am I doing in the fridge? ... How can I make this more procrastinating? Because, again, legibility is still an issue."

## Why it doesn't read
The gag on paper is that he "lovingly reorganizes the fridge" (jars in size order). On screen it's a gator bent into a fridge: he's getting food.

## The new staging: the fridge loop, in three
Everyone knows this one: **open the fridge, stare, close it, walk off, come back, open it again.** Nothing has changed inside, and he stares anyway. Three times in the shot's 7 s, the third the longest. His face stays blank throughout; it doesn't change, and that's the joke.
- **The rule, every time.** The fridge light is the low, close light. **Door open:** the light is on and the blob's shadow springs up across the cabinets. **Door closed:** the kitchen goes dim and the shadow is gone (the blob itself stays visible, dimly). Between opens the blob scoots a little closer to the fridge, so **each time the shadow comes back bigger**. That's the light rule (s04's v4 note already grows it this way: 4.0 → 4.5 → 5.2 units). No gulp here: the blob's size stays 1.25×.
- **Suggested timing** (yours to adjust): open 1 at 0.0–1.6, close; turn away and back; open 2 at 2.5–3.9, close; open 3 from 4.67 and hold the stare to the cut at 7.0.
- Reuse s04's set, stool, blob and fridge rig. Doors on 2s and the light on 1s, as now.
- **Sound:** a fridge door open and close each time, built from sounds `foley.js` already has (no new synthesis needed). Keep the `fridgeHum` bed and add the door cues in s04's section of `cues.js`. Re-run `node tools/mix.mjs`, which must still pass.

## Owns
`src/shots/s04.js`, `docs/shots/s04.md`, s04's cue lines in `src/audio/cues.js`, `evidence/v7-fridge/`, `done/v7-fridge.md`.
**Not yours:** s02/s03/s05/s06 (v7-laptop), every other shot, other cue lines, `src/timeline.js`.

## Acceptance
- [ ] `evidence/v7-fridge/sheet.jpg`: every 0.25 s over 26–33
- [ ] `evidence/v7-fridge/shadows.txt`: the shadow width at each open, growing
- [ ] `evidence/v7-fridge/preview.mp4`: 24–35 at `--w 960`, muxed with the new mix, small
- [ ] `node tools/determinism.mjs` at three s04 times; `node tools/check_timeline.mjs`; `npx tsc --noEmit -p .` clean; mix and `node src/audio/selftest.js` pass
- [ ] `done/v7-fridge.md` ending with `## Story`

## Machine and git
You're in a fresh git worktree. Before rendering: `ln -s /Users/ericzhang/code/media/looming/node_modules node_modules`; `cp /Users/ericzhang/code/media/looming/assets/cut/*.png assets/cut/`; `mkdir -p assets/raw/reels && cp /Users/ericzhang/code/media/looming/assets/raw/reels/*.mp3 assets/raw/reels/`. Never commit those.
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use. Swap is near full and one other builder runs beside you: check `sysctl vm.swapusage` before each render batch, and if free swap is under 1 GB, wait and retry. Sheets and strips only; delete frames after. Commit on your worktree's branch with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge. Report your branch name and last commit at the end.
