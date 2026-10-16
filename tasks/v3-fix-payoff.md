# Brief · v3-fix-payoff

**Type:** builder (polish) · **Wave:** 5c (v3) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md`, `docs/notes/v3-fixlist.md`, the specs and current code for **s17b, s17c, s18** (and `s02.js`'s shared home desk set), `done/v2-payoff.md`, `done/v3-fix-home.md` (the home desk lamp is now 80 cm), `done/asset-props-kit.md`

## Goal
The v3 polish pass on the payoff: the 15–20 s the director asked for must feel satisfying, not just be present.

## Owns
`src/shots/s17b.js`, `s17c.js`, `s18.js`, any font file you add under `assets/fonts/`, `evidence/v3-fix-payoff/`, `done/v3-fix-payoff.md`

## Fix list
- **Handwriting:** it's the Noteworthy system font, which is machine-dependent and breaks re-renderability. Prefer the painted props_kit pieces (test_page, graded_test, practice sheets, "Final" if painted). Where live writing must animate, bundle an open-licence handwriting font file in the repo (state its licence) and load it explicitly.
- **s18:** the lamp is in front of its shade. The ink and the gator cast no shadows (the film's rule is real light and real shadows). The cross-off reach shows his legs over the desk: restage the reach. Since v3-fix-home, the home desk lamp is 80 cm (in the shared set), so check it.
- **s17c:** let the 94 land with a beat of stillness and a small reaction (eyes, then a smile) before the cut.
- **s18 tag:** the quivering drop and the uncap should read as "it'll come back, and that's fine", so hold it.
- Secondary motion where cheap. Beat times don't move.

## Acceptance
- [ ] Before and after sheets per shot (`--w=320`), plus `s18_soak_strip.jpg`. Look at them.
- [ ] `determinism` at one time per shot; `check_timeline` ok; no system-font dependency left (grep for font-family uses)
- [ ] Done note: each item → fixed / partly / not, and `## Story`

**Machine (hard):** one headless Chrome, foreground only, `--w ≤ 960`. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap; if your render dies, wait 2 minutes and retry once.
