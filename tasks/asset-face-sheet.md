# Brief · asset-face-sheet

**Type:** painter · **Wave:** 3 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md` (all of it), `docs/03-art-direction.md` (§Palette, §Characters, §Face set, §Banned AI tells), `docs/assets.md` row 2 (`face_sheet`), `docs/07-process-log.md` (the G1 and G2 entries), `done/asset-gator-sheet-v2.md`, `docs/contracts.md` §characters (how faces attach: names, anchor and scale), `src/characters/` (the face swap code)

## Director decisions
- G1: the style tile v3_4 is frozen. G2: the gator sheet v2_1 and hero_1 are frozen ("G2: freeze gator sheet v2_1 and hero_1.").
- Appeal first ("the gator is really ugly ngl" drove v3). The face set must keep the approved gator's look: one big round eye with a small highlight, a simple smile line and a friendly read.

## Goal
One sheet holding every eye and mouth swap from doc 03 §Face set, all the same size and line weight, so the swaps drop onto the frozen gator's head with no in-betweens.

## Owns
- `assets/prompts/face_sheet.v1.md`, the `face_sheet` entry in `assets/specs.json` (append)
- `assets/raw/` (thumbs committed), `evidence/asset-face-sheet/`, `done/asset-face-sheet.md`

## Spec
1. **Pieces** (doc 03): eyes in open, closed/content, half-lid tired, wide/gasp, worried (with sweat dots) and side-glance; mouths in neutral, small smile, open "o" and tight line.
   - Each eye is drawn for the **side view**, the way v3_4 and the sheet's side head show one big eye. Add a front-view pair of the open eye if the rig needs it for s10's front shot; check `src/characters/` and say what you found.
   - The mouths fit the side-view snout line.
2. **References:** `assets/frozen/style_tile.png` and `assets/frozen/gator_sheet.png` (doc 08's table). Measure the eye diameter and position on the frozen sheet's side head, and size the open eye to match it exactly. Report the numbers.
3. **Readability:** the faces are shared, scaled, by the roommates and the Freshman, and must read from above in s13, so keep shapes bold and simple.
4. **Generate** 3 variants with `gen.mjs --asset=face_sheet --variants=3` (cap 8). At most 2 Codex calls at once. Magenta key if any green appears; otherwise doc 08's default.
5. **Screen** each variant against doc 08's checklist and one more test: every piece at the same line weight and scale. Cut the best with `cut.mjs --auto` into a scratch dir **outside the repo**.
6. **Evidence:**
   - `contact.jpg`: all variants over navy and grey
   - `on_head.jpg`: the best variant's open, worried and gasp eyes, each composited onto the frozen sheet's side head at the measured position, done in a small Node or ffmpeg script, **no headless Chrome**
   - `islands.txt`: islands vs pieces

## Acceptance
- [ ] 10 pieces (6 eyes, 4 mouths) per variant, plus any front pair you justify
- [ ] The open eye matches the frozen head's eye within 5% in diameter
- [ ] `contact.jpg`, `on_head.jpg`, `islands.txt`
- [ ] A ranking with one line on appeal each. **You do not freeze anything.**

**Memory:** the machine is short on RAM. No headless Chrome. Never read or print `~/.codex/auth.json` or any token file.
