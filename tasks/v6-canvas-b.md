# Brief · v6-canvas-b (he swipes it away, it grows; at 3 a.m. he taps it open)

**Type:** builder · **Version:** v6 · **Model:** given at dispatch · **Time box:** about 75 minutes.
**Read first:** `AGENTS.md`, `tasks/v6-canvas-a.md` (the plot and the module's API: read it whole), `docs/02-story.md`, `docs/shots/s03.md`, `s06.md`, `s07.md`, `s09a.md`, `src/shots/s03.js`, `s06.js`, `s07.js`, `s09a.js`, `src/characters/acting.js`.

## The director, verbatim
"people still kinda dont get the plot … make it more explicit". Approved: "build the light-mode Canvas countdown opening (MAC2312, no UF logo), the swipe-away gulps, and tapping it open at 3 a.m."

## The gesture carries the plot
Each gulp (the blob growing a half-size) now has an explicit cause: a Canvas reminder arrives and **he swipes it away; the blob gulps on the beat, the swipe landing on it.** Three times, then once he taps it open. At most four reminders in the film (the director's limit is "not a lecture").
- **s03, gulp1 (global 23.5):** the reminder pops on his laptop screen (a banner top-right) mid-game, about 1 s before; he flicks it away; gulp. Countdown body from the module's `COUNTDOWN.s03`.
- **s06, gulp2 (44.0):** the phone on the desk lights with the reminder as the lamp goes off (lampOffHome 43.0); he swipes it away; gulp. If s06's staging can't take it, say so and use the laptop.
- **s07, gulp3 (55.5):** in bed, the reminder slides in at the top of his phone while he scrolls; he swipes it up and away; gulp. The cut-in to the phone already exists: use it so the banner reads.
- **s09a, the decision (phoneFaceDown 70.5, breathIn 71.5):** at 3 a.m. the reminder comes once more (`COUNTDOWN.s09a`, "Starts in 6 hours"). **He taps it open** instead (the beat formerly his putting the phone face down: keep the beat name, change the action), the banner expands to the exam's row, he looks at it, breathes in (71.5), and puts the phone face down (or down on the bed) before resolveFace (73.0). The rest of s09a as is.
- **Legibility:** each banner must read at 400 px, so each one gets a short insert or a framing where the screen is large (≥ 1 s readable). Keep the shadow rule's framings otherwise.

## The module
`v6-canvas-a` is building the screens module now (see its brief: `banner({ body })`, a placement helper with `swipe` 0..1 and `open` 0..1, and `COUNTDOWN`). **Until it lands, build against that API with a temporary stand-in in your own shot files** (a plain light rectangle texture with the text drawn by a 2D canvas, behind the same function names). The orchestrator will message you the module's commit; then `git cherry-pick` it into your branch and switch to it, deleting the stand-in. Don't create the module file yourself.

## Owns
`src/shots/s03.js`, `s06.js`, `s07.js`, `s09a.js` (s07/s09a include the merged bed fix; keep it: `bedroom()`, `LIE`, `LIE_HEAD`, `DUVET_TUCK`); cue lines in `src/audio/cues.js` for the four reminders (a short phone/laptop buzz or chime on each arrival, from existing foley sounds; the swipe a soft tick); those shots' lines in `docs/02-story.md` and their shot docs; `evidence/v6-canvas-b/`; `done/v6-canvas-b.md`.

## Frozen
Every beat in `src/timeline.js`. s02's exports. s00, s02 and the module (v6-canvas-a's). s08, s10b, s18 (others).

## Acceptance
- [ ] `evidence/v6-canvas-b/gulps.jpg`: for each of the three gulps, frames at −1.0, −0.5, 0 (the gulp) and +0.5 s
- [ ] `evidence/v6-canvas-b/tap.jpg`: s09a every 0.5 s from 70.0 to 74.0
- [ ] `node tools/check_timeline.mjs` ok (22 shots, 201 s); determinism at the three gulps and 71.0; `npx tsc --noEmit -p .` clean; `node tools/mix.mjs` runs within −16 ±1 LUFS, ≤ −4 dBTP
- [ ] Done note `done/v6-canvas-b.md` ending with `## Story`

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use; two other builders render in parallel and disk is tight (≈ 6 GB). Sheets and strips only; delete frames after. Stay in your worktree. Commit on `task/v6-canvas-b`. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge.
