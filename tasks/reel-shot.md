# Brief · reel-sNN (story reel, tonight's submission)

**Type:** builder · **Wave:** 4 · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/02-story.md`, `docs/shots/README.md` (especially the sensor fixture and §10–§11), **your shot spec `docs/shots/sNN.md`** (already rewritten for motion-sensor lights), its neighbours' specs, `docs/contracts.md` (§lights `sensorLight`, §blob, §characters), `src/timeline.js`, `src/shots/_template.js`, and `src/shots/s15.js` (the reference desk unit)

## Context
The director submits tonight (deadline Oct 15, 11:59 PM EDT). The film goes in as a complete 3:00 **story reel**: every shot readable and on its beats, with placeholder art. This brief replaces `tasks/anim-shot.md`'s precision bar with a looser one. Speed and readability first.

## Owns
- `src/shots/sNN.js` (only your own), `evidence/reel-sNN/`, `done/reel-sNN.md`

## The bar
- **Story job first.** A viewer with no context understands the shot's story job from the sheet alone. That's the main acceptance.
- Follow the spec's staging, camera, light and beats. Where a number fights readability, readability wins: note it in one line.
- **Motion-sensor lights at Marston** via `sensorLight` / `sensorLevel` (contracts §lights). No desk lamp at any Marston desk.
- **Blob size:** define `const BLOB_R = 0.012` (or the spec's value) at the top of your file and use it everywhere, so the blob-meter pass can change it in one line.
- Characters from `src/characters/`, faces swapped per the spec.
- No legible text. No sound work: cues live in `src/audio/`.

## The rough → final rule (director, 2026-10-15)
This reel is tagged `v1-animatic` and later shown **side by side with the final**. So:
- Don't move beat times or the shot's start and end.
- Choose framing you'd keep. The final pass improves art and light, not staging.
- Keep tunables (`BLOB_R`, light positions, intensities) as named constants at the top of your file.

## Skip tonight
Precision measurement scripts (`measure.mjs`, pixel-scale checks, luminance percentages), full-res stills and crops.

## Acceptance
- [ ] Key-moment sheet: `node render.mjs --page=index.html --sheet=<one t per beat and key pose> --cols=6 --w=320 --out=evidence/reel-sNN/sheet.jpg`. Look at it, and fix anything that doesn't read.
- [ ] `node tools/determinism.mjs --t=<two times in your shot>` passes
- [ ] `node tools/check_timeline.mjs` is ok
- [ ] Done note: what a cold viewer would understand from the sheet, and anything left rough

**Machine limits (hard):** at most one headless Chrome at a time, foreground only, closed after use. No background renders. Delete your own scratch.
