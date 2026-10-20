# Brief · v2-home-b (kitchen and bedroom shots, real art)

**Type:** builder · **Wave:** 5b (v2) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md`, `docs/02-story.md`, `docs/shots/README.md`, **`docs/shots/s04.md`, `s05.md`, `s07.md`, `s08.md`** (rewritten for G4), `docs/03-art-direction.md` (paper vs ink), `docs/assets.md` (kit rows and sizes), `src/assets.js`, the current `src/shots/s04.js`…`s08.js`, `src/characters/gator.js`, `done/cut-gator.md`, `done/asset-home-kit.md`, `evidence/asset-home-kit/scale_table.md`

## Goal
v2 of the kitchen and bedroom shots, built from the frozen art and reading at a glance. Director: "The room is really ass. It doesn't look like a room … it also really doesn't look like a kitchen. The furniture is weird."

## Owns
`src/shots/s04.js`, `s05.js`, `s07.js`, `s08.js`; `src/assets.js` (**append** the `home_kit` and `kitchen_kit` PIECES entries only; piece names = the keys in `assets/cut/home_kit.boxes.json` and `kitchen_kit.boxes.json`, with sizes from the scale table); `evidence/v2-home-b/`; `done/v2-home-b.md`

## Spec
- Build each shot from its G4 spec, with the frozen kits (`assets/frozen/home_kit.png`, `kitchen_kit.png`, already cut into `assets/cut/`) and the real gator (`cut-gator`). Sets are sized against the gator per the scale table: a fridge taller than him, a counter at his chest.
- **s07 is the blinds:** each blind pulled down removes a band of daylight, and the blob's shadow steps up one size (the BLOB_R and meter values in the spec). It must read as cause and effect in the sheet.
- The laptop game glow is the low light at home, wherever the spec puts it (the screen is a separate kit piece: make it emissive).
- Re-solve the cameras for s04, s07 and s08 (flagged by spec-g4) to frame the new sets.
- The blob stays ink: smooth, too alive, not paper.
- Beat times come from `src/timeline.js`. Don't move them.
- Keep tunables as named constants at the top of each file.

## Acceptance
- [ ] `evidence/v2-home-b/sNN.jpg` per shot: a key-moment sheet (one time per beat), `render.mjs --sheet=… --cols=6 --w=320`. Look at each one and fix anything that doesn't read.
- [ ] `evidence/v2-home-b/s07_blinds.jpg`: a strip showing the shadow stepping up with each blind
- [ ] `determinism` passes at one time per shot; `check_timeline` ok
- [ ] Done note: what a cold viewer would understand from each sheet, what's still rough, and `## Story`

**Machine (hard):** at most one headless Chrome, foreground only, closed after use, `--w ≤ 960`. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap; if that happens, stop and report.
