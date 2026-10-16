# Brief · asset-home-kit

**Type:** painter (Codex, no headless Chrome) · **Wave:** 5a · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md` (all), `docs/03-art-direction.md`, `docs/notes/g4-2026-10-15.md`, `src/assets.js` (apt_* entries), `docs/shots/s02.md`–`s08.md`, `assets/frozen/style_tile.png`, `assets/frozen/gator_sheet.png`

## Goal
Home that reads as a home. Director: "The house is really ugly … that's a fucking massive table … The room is really ass. It doesn't look like a room. In the kitchen it also really doesn't look like a kitchen." Paint two parts kits in the frozen paper style, scaled to the gator.

## Owns
`assets/prompts/home_kit.v1.md`, `assets/prompts/kitchen_kit.v1.md`, `assets/specs.json` (append), `assets/raw/` (thumbs committed), `evidence/asset-home-kit/`, `done/asset-home-kit.md`

## Spec
- **home_kit (student bedroom):** bed with blanket and pillow, small desk, desk chair, window with frame, roller blind (rolled up and down states), bookshelf, a couple of posters (abstract shapes), rug, door, floor lamp, laundry pile, wall strip and floor strip, laptop open (screen as a separate piece so it can glow).
- **kitchen_kit:** fridge (door as a separate piece so it opens), stove with oven, sink with tap, counter run, upper cabinets, microwave, kettle, dish rack, fruit bowl, tiled backsplash strip, plus small props (cereal box, mug, jar).
- Each kit is one sheet of separate pieces on transparency, the way the gator sheet is (parts kit, not a scene). Use the style tile and the gator sheet as references, so line weight, fibre edges and palette match.
- **Scale:** the gator stands about 0.125 m tall in film units (check `gator.js`). Give each piece a real-world-proportion size relative to him (a desk top at his chest height, a bed at his knee height, and so on). Write the table into the done note.
- 3 variants per kit (`gen.mjs --variants=3`, cap 6). At most 2 Codex calls at once in total. Screen each against doc 08's checklist. Cut the best into a scratch dir outside the repo.

## Acceptance
- [ ] `contact.jpg` (all variants), `scale.jpg` (the best variant's pieces beside the frozen gator's side figure, at the scale table; Node or ffmpeg, no Chrome), `islands.txt`
- [ ] Piece names proposed for `src/assets.js` (don't edit it), with the boxes file for the best variant
- [ ] A ranking with one line on appeal each. **You do not freeze.** The orchestrator freezes by the director's rule (most cut-paper, simplest, most readable).
- [ ] The done note ends with `## Story`

**Memory:** no headless Chrome. Never read or print `~/.codex/auth.json` or any token file.
