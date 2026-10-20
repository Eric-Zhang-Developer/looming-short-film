# Brief · asset-marston-kit

**Type:** painter (Codex, no headless Chrome) · **Wave:** 5a · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md` (all), `docs/03-art-direction.md`, `docs/ref-ufl.md`, `src/assets.js` (marston_* entries), `docs/shots/s09.md`–`s17.md`, `assets/frozen/style_tile.png`, `assets/frozen/gator_sheet.png`, and **the director's own photos of Marston's interior: `reference-videos/ufl/image.png`, `image copy.png`, `image copy 2.png`, `image copy 3.png`** (gitignored; reference only, never copied into the repo or a prompt as-is)

## Goal
Make Marston recognisable to a UF student, in the film's paper style. The director: "I like this scene. I want it refined. I really like how lighting is used."

## Owns
`assets/prompts/marston_kit.v1.md`, `assets/specs.json` (append), `assets/raw/` (thumbs committed), `evidence/asset-marston-kit/`, `done/asset-marston-kit.md`

## Spec (from the director's photos)
- **Desks:** long rows of light maple desks with low grey fabric partitions. Round maple tables on black drum bases.
- **Window cubicles:** grey perforated-panel cubicles with curved maple tops, facing a wide **ribbon window band** of thin mullions. The hero's desk is one of these.
- **Chairs:** mesh task chairs with the webbed **Y-shaped back** (side and three-quarter views). This silhouette is the signature piece.
- **Lights:** a large ring pendant (lit and unlit states), long linear strip lights, square recessed ceiling panels in a coffered, pyramid-shaped ceiling tile (a tileable strip).
- **Room:** square white columns with a warm wood band, grey patterned carpet (tileable), a bookshelf bay with dark steel uprights and coloured spines, an exit sign shape (no text).
- **Night window view** (separate layer): oak canopy, black lampposts, the floodlit Century Tower.
- **Exterior (second sheet, `marston_ext_kit`):** a brick block with dark bronze bands, ribbon windows lit warm, stepped bays, the breezeway with Century Tower framed in it, yellow square lanterns. Use `docs/ref-ufl.md` §2.
- Parts kits on transparency, as the gator sheet is. Night palette per doc 03 (the sensor lights' green-cream; amber only from screens or the Freshman's light).
- 3 variants per sheet (cap 6). At most 2 Codex calls at once in total. Screen against doc 08.

## Acceptance
- [ ] `contact.jpg`, `scale.jpg` (pieces beside the frozen gator at a scale table: a desk top at his chest height, and so on), `islands.txt`
- [ ] Piece names proposed for `src/assets.js` (don't edit it), with the boxes file for the best variant
- [ ] A ranking with one line on appeal each. **You do not freeze.**
- [ ] The done note ends with `## Story`

**Memory:** no headless Chrome. Never read or print `~/.codex/auth.json` or any token file.
