# Brief · v3-fix-home

**Type:** builder (polish) · **Wave:** 5c (v3) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md`, `docs/notes/v3-fixlist.md`, `docs/02-story.md`, `docs/shots/README.md`, the specs and current code for **s01, s03, s04, s05, s06**, the done notes `v2-home-a.md` and `v2-home-b.md`, `done/asset-cast-kit.md`

## Goal
The v3 polish pass on the home shots: fix the fix-list items, and make every beat read at phone size.

## Owns
`src/shots/s01.js`, `s03.js`, `s04.js`, `s05.js`, `s06.js`, `src/shots/s02.js` (only the shared home desk set, if a fix needs it), `src/characters/roommates.js` (fitting the new cast art), `evidence/v3-fix-home/`, `done/v3-fix-home.md`

## Fix list (from the orchestrator's review)
- **s03:** the laptop game's wall shadow is pale and medium-sized. It must loom at the s03 meter (1.25×): darker, bigger, unmistakable.
- **s04:** the blob's shadow reads as a muddy brown blotch over the cabinets. It must read as the blob's shape (eyes punched through).
- **s05:** the roommates now have painted art (`roommates_sheet`, frozen; a heron and a bear). Fit the rig to it: pivots, the aspect ratios the painter didn't hold, layering. Make the walk-through read.
- **s06:** the real-scale lamp is 120 cm to clear his head. Restage so a normal desk lamp works, or use the kit's floor lamp deliberately.
- **s01:** replace the proxy skyline and oaks with `marston_ext_kit` layers (oak canopy, night layers) or home-kit exterior pieces.
- **Everywhere:** secondary motion where it's cheap (breathing, tail sway, sleeve swing), done with springs and functions of t, never clocks.

Beat times don't move. Keep tunables as named constants.

## Acceptance
- [ ] Before and after sheets per shot in `evidence/v3-fix-home/` (`--w=320`, one time per beat). Look at them.
- [ ] `determinism` at one time per shot; `check_timeline` ok
- [ ] Done note: each fix-list item → fixed / partly / not, with evidence, and `## Story`

**Machine (hard):** one headless Chrome, foreground only, `--w ≤ 960`. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap.
