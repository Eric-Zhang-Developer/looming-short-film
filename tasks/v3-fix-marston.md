# Brief · v3-fix-marston

**Type:** builder (polish) · **Wave:** 5c (v3) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md`, `docs/notes/v3-fixlist.md`, `docs/shots/README.md`, the specs and current code for **s09–s17**, the done notes `v2-marston-a.md`, `v2-marston-b.md`, `v2-payoff.md` and `asset-cast-kit.md`, and `done/v3-fix-home.md` (how the home pass approached the same kinds of fixes)

## Goal
The v3 polish pass on the Marston shots: the director's favourite part ("I want it refined. I really like how lighting is used."). Fix the fix-list items without losing the lighting's mood.

## Owns
`src/shots/s09.js`–`s17.js` (not s17b/s17c), `src/characters/custodian.js`, `src/characters/crowd.js`, `evidence/v3-fix-marston/`, `done/v3-fix-marston.md`

## Fix list
- **s09:** far too dark. Lift it so the building, tower and gator read at phone brightness; keep it night.
- **s12:** the giant shadow is mostly cropped at the top. Reframe, or lower the light, so the loom reads in frame.
- **s13:** very dark. Also fit the new `top_figures_sheet` art (frozen).
- **s14:** fit the new custodian art (a tortoise with cart and mop; the painter's aspect ratios are off: mop about 3.5× wide, arms short), so the pass reads.
- **s16:** the insert's writing hand is a lime-green placeholder. Use the gator's arm piece (green felt plus the cream cuff) holding the pen. The six-step shrink is hard to follow in the wide: hold each step, or favour the inserts. Fit the `crowd_sheet` neighbours.
- **s17:** the blob is tiny in the wide. The shrink must still read.
- **s09–s12:** the blob's eye level vs his after the 9.3 cm rig. Make the "eye to eye" moment at the 2.5× peak true again where the spec calls for it.
- Secondary motion where cheap (breathing, tail sway), as functions of t.

Beat times don't move. Keep tunables as named constants.

## Acceptance
- [ ] Before and after sheets per shot in `evidence/v3-fix-marston/` (`--w=320`). Look at them.
- [ ] `determinism` at one time per shot; `check_timeline` ok
- [ ] Done note: each item → fixed / partly / not, with evidence, and `## Story`

**Machine (hard):** one headless Chrome, foreground only, `--w ≤ 960`. A full-film render is running; swap is high. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap; if your render dies, wait 2 minutes and retry once, then report.
