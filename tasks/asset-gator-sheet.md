# Brief · asset-gator-sheet

**Type:** painter · **Wave:** 3 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md` (all of it), `docs/03-art-direction.md` (§Palette, §Characters, §Face set, §Banned AI tells), `docs/assets.md` row 1 (`gator_sheet`), `docs/07-process-log.md` (the last entry, G1), `done/asset-style-tile-v3.md`, `assets/prompts/style_tile.v3.md`, `docs/contracts.md` §characters (the rig's part names and pivots), `src/characters/gator.js`

## Director decisions this brief carries out
- **G1 approved, verbatim:** "I like it", for style tile **v3_4**, the graphic picture-book gator. Frozen at `assets/frozen/style_tile.png`.
- Earlier note that drives this: "the gator is really ugly ngl." **Appeal is the top priority.** The sheet must keep exactly what the director liked in v3_4: the flat geometric shapes, the strong simple silhouette, the blunt snout with a few tiny triangle tooth tips, the scalloped tail, the cream hoodie with hands in the pocket, the stubby legs and the friendly read.
- **Q9:** short stubby legs.

## Goal
One sheet, a turnaround plus parts, that becomes the film's hero gator. It's gate **G2**: the director picks one variant, or gives notes.

## Owns
- `assets/prompts/gator_sheet.v1.md`
- the `gator_sheet` entry in `assets/specs.json` (append; don't touch `style_tile`)
- `assets/raw/` (thumbs and sidecars committed; full-size PNGs gitignored)
- `evidence/asset-gator-sheet/`, `done/asset-gator-sheet.md`

## Spec
1. **Spec entry** per doc 08 step 1. Pieces, per `docs/assets.md` row 1:
   - the turnaround: side, front, back, and a 3/4 head
   - the parts: body, head, upper jaw/snout, lower jaw, arm_l, arm_r, leg_l, leg_r (short, stubby, foot forward), tail, pocket

   Map each part to the rig's names and pivots in `src/characters/gator.js`, so the cut pieces drop straight onto the rig. Key colour is **magenta** (the gator is green).
2. **Reference:** attach `assets/frozen/style_tile.png` and nothing else (doc 08's reference table). Describe v3_4's gator in the asset block in your own words, specifically enough that the design carries over.
3. **Fix what screening found in v3:**
   - **The surface read as felt.** The film is **torn paper**: flat colour with a pale torn fibre rim at every cut edge, fine paper grain, and no fuzz or pile. Use the style block's paper language verbatim (doc 08).
   - **Gaps:** every part at least 40 px from every other, no bounding boxes overlapping, and nothing touching the frame edge.
   - **Proportions:** the legs about 20% of standing height, as in v3_4 (the rig's are 37%; the sheet sets the truth and the rig will be refit to it).
4. **Eyes and mouth:** follow doc 03 §Face set. Faces are texture swaps from the separate face sheet (G2's second asset). If doc 03 or the rig expects the head painted **without** the eye and mouth so the swaps can sit on top, paint it that way, plus one extra fully featured side head for the director to judge appeal. Say which you did and why.
5. **Generate** 3 variants with `node tools/gen.mjs --asset=gator_sheet --variants=3` (cap 8). At most 2 Codex calls at once. Don't use more than 4 generations in this round unless one fails outright.
6. **Screen** every variant against doc 08's checklist plus appeal against v3_4, and write the reasons into the sidecars. Cut the best one with `tools/cut.mjs --auto` into a scratch dir **outside the repo**, and report the island count against the parts list.
7. **Evidence:**
   - `contact.jpg`: all variants over navy and over grey
   - `beside_v3_4.jpg`: each variant's side view next to the frozen tile's gator, at the same height, since that's the comparison the director makes
   - `parts.jpg`: the best variant's cut islands, labelled by part name (labels drawn by you on the evidence image, never in the painting)

## Acceptance
- [ ] The specs entry, the prompt and 3 variants, with thumbs and sidecars
- [ ] Screening per variant, including a gap measurement (smallest part-to-part gap in px)
- [ ] Cut test: islands vs parts, mapped to rig names
- [ ] `contact.jpg`, `beside_v3_4.jpg`, `parts.jpg`
- [ ] Your ranking, one line each on appeal and how faithful it is to v3_4. **You do not freeze anything.**

## Out of scope
The face sheet, rig changes, anything in `src/`. Never read or print `~/.codex/auth.json` or any token file.
