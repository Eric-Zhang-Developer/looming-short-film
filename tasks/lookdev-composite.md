# Brief · lookdev-composite

**Type:** builder
**Wave:** 2 · batch 4 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/03-art-direction.md` (all), `docs/contracts.md`, `docs/02-story.md` §The visual rule, `done/` notes of every wave 2 module

## Goal
The real paper test that wave 1 asked for. The five painted Codex pieces (wall, desk, calendar, lamp, laptop) become torn paper in the full rig, with the ink blob on the desk, under phone light then lamp light, with post on. If this reads as paper, the look is proven. It's the dress rehearsal for the G3 test shot.

## Owns
- `lab/lookdev.html`
- `lab/lookdev.js`
- `evidence/lookdev-composite/`
- `done/lookdev-composite.md`

## Inputs
All wave 2 modules. Style tile parts: run `node tools/cut.mjs --auto` on the local `assets/raw/style_tile_v1.png` (copy it from the main checkout; it's gitignored) into your worktree's `assets/cut/`. Don't commit the cut PNGs, since the asset isn't frozen.

## Spec
- Build the apartment corner as a diorama of 3–4 depth layers using the pieces, `paperMesh` and the light rigs. The blob sits on the desk.
- 0–5 s: phone light, with the shadow at about 3×. At 5 s the lamp clicks on (cone appears). 6–10 s: hold, the blob blinks, dust drifts.
- Post: DOF focused on the blob, `night` LUT, grain.
- Render a sheet, a strip across the click, and two full-res stills.

## Acceptance
- [ ] Shadow ≈3× under phone, small pool under lamp
- [ ] Painted pieces keep their painting and gain torn edges
- [ ] Tissue lampshade glows when lit
- [ ] DOF gives a miniature read
- [ ] Two independent judgments recorded: your own paper-vs-vector read, and a side-by-side against `reference-videos/frames/torn_paper_ref.jpg`
- [ ] Determinism passes; ms/frame recorded

## Evidence required
`evidence/lookdev-composite/`: `sheet.jpg`, `click_strip.jpg`, `phone.jpg`, `lamp.jpg`, `vs_reference.jpg`, `determinism.txt`, `timing.txt`.

## Out of scope
Characters (only the blob appears). Final art. Sound.
