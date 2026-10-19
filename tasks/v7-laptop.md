# Brief · v7-laptop (a laptop that reads as a laptop, playing a shooter)

**Type:** builder · **Version:** v7 · **Model:** given at dispatch · **Time box:** about 90 minutes; committed working beats polished.
**Read first:** `AGENTS.md`, `docs/02-story.md` (the rule; Act 1–2), `docs/03-art-direction.md`, `docs/shots/s03.md`, `docs/shots/s05.md`, `docs/shots/s06.md`, `src/shots/s02.js` (`DESK`, `homeDesk`: the laptop), `src/shots/s03.js`, `src/shots/s05.js`, `src/shots/s06.js`, `src/audio/cues.js` (the CS2 lines).

## The director, verbatim
"The laptop in the initial few scenes is way too small as well." Then: use real CS2 audio for his game ("it makes it more relatable"). The CS2 sound is already built (`cues.js`, `file: 'cs2'`): s03 from `laptopUp` + 0.25 (bursts of fire at about s03 local 2.65 and 4.7–5.85, quiet across the reminder), s05 from 0.33, s06 from `gulp2` + 0.5. Don't change those lines.

## Why it's small
`homeDesk` builds the laptop at real scale (33 cm on a 1.75 m gator), but his cartoon head is huge by real proportions, and the laptop is yawed −55° so we see it almost edge-on. At 0:20 it reads as a phone in his lap. The screen's game (a teal field and one platform) doesn't read at all.

## Do
- **Scale the laptop up** (start near 1.8×; pick what reads as a laptop next to his head at 1080p) and **turn it** so the camera sees the lit screen, in s02 (closed on the desk), s03 and s06, and in s05 if its laptop reads small too.
- **The screen is a shooter, in the paper style:** a first-person view with a crosshair in the middle, a gun at lower right and a few blocky map shapes. No logos, no text, no HUD numbers. If cheap, flash the muzzle or kick the gun on the CS2 bursts (times above), on 2s.
- **Keep the rule's numbers.** The screen is each shot's key light, and the shadow sizes are calculated from where the screen sits (s03: `SCREEN_Z`, 3.6 before the gulp and 5.4 units after; s06's and s05's in their specs and code). Recalculate the light so every shadow stays the size it is in v6 (±5%), measured at the same times before and after.
- The hands and taps must still land on the keys (s03 solves them through its camera).

## Owns
`src/shots/s02.js` (the laptop in `homeDesk` and `DESK`'s laptop numbers only), `src/shots/s03.js`, `src/shots/s05.js`, `src/shots/s06.js`, the laptop lines in `docs/shots/s03.md`, `s05.md`, `s06.md`, `evidence/v7-laptop/`, `done/v7-laptop.md`.
**Not yours:** `cues.js`, s04 (v7-fridge), s07 and on.

## Acceptance
- [ ] `evidence/v7-laptop/before_after.jpg`: v6 against v7 at 12, 21, 24, 35, 45
- [ ] `evidence/v7-laptop/shadows.txt`: the shadow width in units at the same times, v6 against v7, from code or a measurement script
- [ ] `evidence/v7-laptop/screen.jpg`: a crop of the screen at film size
- [ ] `node tools/determinism.mjs` at 12, 21, 24, 35, 45; `node tools/check_timeline.mjs`; `npx tsc --noEmit -p .` clean
- [ ] `done/v7-laptop.md` ending with `## Story`

## Machine and git
You're in a fresh git worktree. Before rendering: `ln -s /Users/ericzhang/code/media/looming/node_modules node_modules`; `cp /Users/ericzhang/code/media/looming/assets/cut/*.png assets/cut/`. Never commit those.
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use. Swap is near full and one other builder runs beside you: check `sysctl vm.swapusage` before each render batch, and if free swap is under 1 GB, wait and retry. Sheets and strips only; delete frames after. Commit on your worktree's branch with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge. Report your branch name and last commit at the end.
