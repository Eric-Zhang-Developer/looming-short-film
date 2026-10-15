# Brief · asset-gator-sheet-v2

**Type:** painter · **Wave:** 3 · **Model:** claude-opus-5-5
**Read first:** everything in `tasks/asset-gator-sheet.md`, plus `done/asset-gator-sheet.md`, `evidence/asset-gator-sheet/contact.jpg`, `evidence/asset-gator-sheet/cut.txt`, `assets/prompts/gator_sheet.v1.md`

## Director decision
G2 round 1 was shown with the orchestrator's recommendation: "v1_1, plus one more round to fix the front view, the 3/4 head, the close-up size and the paper edges." Director: "sounds good ok we can continue". **v1_1 is the base. Nothing is frozen yet.**

## Owns
- `assets/prompts/gator_sheet.v2.md`, `assets/prompts/gator_hero.v1.md`
- the `gator_sheet` and new `gator_hero` entries in `assets/specs.json` (append or edit only these two)
- `assets/raw/` (thumbs committed), `evidence/asset-gator-sheet-v2/`, `done/asset-gator-sheet-v2.md`

## Spec
Revision prompts per doc 08 §Notes block. Attach `assets/frozen/style_tile.png` **and** `assets/raw/gator_sheet_v1_1.png` (the approved base; doc 08 lets you use an approved pick as a reference for its own revision). Keep v1_1's side view, colours and proportions exactly.

1. **`gator_sheet` v2** (turnaround and parts, the same 14 pieces and rig names as v1):
   - **Front view:** show the snout foreshortened toward the viewer: a broad rounded muzzle with two nostril bumps and the tooth tips peeking at the jaw line, so it reads as a gator, not a frog or a bear. Remove the cream mask-like throat patch.
   - **A real 3/4 head:** turned about 45°, with the snout angling away and both eyes partly visible.
   - **Paper edges:** a visible pale torn-fibre rim of 2–6 px on every piece, as in the style tile's wall and desk. No felt or fuzz.
   - **Gaps:** at least 40 px between bounding boxes and from the frame edge.
   - Leg tops cut flat, not drawn as lighter cylinder ends.
2. **`gator_hero` v1:** a new asset, a single large side view on its own sheet, the same pose and design as the sheet's side view. It's for the close-ups in s06, s15 and s18. The figure fills at least 70% of the canvas height. Add it to `docs/assets.md`'s count in your done note (as a Gap for the orchestrator), not in the doc itself.
3. Budget: `gator_sheet` has 5 left of its cap of 8, so use at most 2 here. `gator_hero` gets a cap of 4; use at most 2. At most 2 Codex calls at once.
4. Screen, cut v2's best with `cut.mjs --auto` into a scratch dir **outside the repo**, and report islands vs parts.

## Evidence
- `contact.jpg`: v1_1 next to each v2 and the hero, over navy and grey
- `front_views.jpg`: v1_1's front view next to each v2 front view, large
- `edge_crop.jpg`: a 1:1 crop of one cut edge per variant, showing the torn rim

## Acceptance
- [ ] Front views read as a gator (say so honestly)
- [ ] The 3/4 head is really 3/4
- [ ] The torn rim is visible in `edge_crop.jpg`
- [ ] Every gap is at least 40 px, measured
- [ ] Hero figure height ≥ 70% of the canvas
- [ ] A ranking. **You do not freeze anything.**

**Memory:** the machine is short on RAM. Don't open headless Chrome; this task doesn't need it. Never read or print `~/.codex/auth.json` or any token file.
