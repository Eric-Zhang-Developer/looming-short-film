# Done · asset-face-sheet

## What shipped
Three `face_sheet` v1 variants (3 generations of the cap of 8). Each has the 10 doc-03 pieces plus one front-view open pair. All three pass doc 08's checklist. None is painted at the frozen head's pixel scale: each sheet is uniformly 2.2–2.5× too large. Nothing is frozen.

## Where it lives
- Spec and prompt: the `face_sheet` entry in `assets/specs.json` (appended) and `assets/prompts/face_sheet.v1.md`, in 6ab138f.
- Thumbs, sidecars with screening notes, and contact: `assets/raw/thumbs/face_sheet_v1_{1,2,3}.{jpg,json}` and `face_sheet_v1_contact.jpg`, in 14ff8d0.
- Evidence in `evidence/asset-face-sheet/`, in 919c136:
  - `contact.jpg`, `on_head.jpg`, `islands.txt`, `measure.txt`, `gen_run.txt`
  - the scripts `measure.mjs`, `strokes.mjs` and `on_head.mjs`
  - `v1_3.boxes.json`
- The full-size PNGs are `assets/raw/face_sheet_v1_{1,2,3}.png`. They are gitignored and exist only in this worktree. The cuts went to scratch and were deleted.

## How it was checked
- [x] **Generation.** `gen_run.txt` ends `exit 0`. There were 3 sequential Codex calls (never more than 1 at a time), and each sidecar has `codex_images_generated: 1`. The key was magenta, because the lids and lines are green. All three came back with real alpha at 1672×941.
- [x] **10 pieces plus the front pair, on every variant.** See `contact.jpg`, which shows all three over navy and over grey.
- [x] **Islands vs pieces.** See `islands.txt`. v1_1 gives 12 islands, v1_2 gives 12 and v1_3 gives 13, for 11 pieces each.
  - The front pair is 2 islands by design.
  - v1_3's sweat drops float free of the eye. A hand-written boxes file fixes this: `cut.mjs --boxes`, 11 named pieces, exit 0.
  - Nothing is merged across pieces, and nothing was dropped.
- [ ] **The open eye matches the frozen head within 5%.** This fails as painted and holds only after scaling. See `measure.txt`.
  - The frozen eye disc measures **59.5 px** (59 × 60), centred at (298.5, 130). Its pupil is 37.5 px.
  - The variants' open eyes measure **136 px (v1_1), 146.5 px (v1_2) and 129.5 px (v1_3)**, which is +118% to +146%. The prompt asked for 59 px. Codex does not follow absolute pixel sizes.
  - Each sheet's pieces share one scale, so one factor per sheet makes the open eye match by construction: k = 0.4375, 0.4061 and 0.4595. The rig sets its size from `PIECES` anyway. The test that carries information is whether every piece shares that one scale, and `measure.txt` covers it:
    - v1_3: all lines are 14 px (6.4 px at head scale, against the frozen smile's 6 px). The front pair, side, tired and worried discs are within 2% of the open eye.
    - v1_1: the front pair is −9%.
    - v1_2: the lines are 25% heavier than the frozen smile.
- [x] **`on_head.jpg`.** This is v1_3's open, worried and gasp eyes on the frozen `turn_side` head, at the measured centre and k, beside the original. It is built in Node and ffmpeg, with no headless Chrome. I looked at it: all three sit cleanly in the eye bump.
- [x] **Ranking, with one line on appeal each. I froze nothing.**
  1. **v1_3:** the closest match to the approved head, with the same line weight and line colour and the most even, friendly set.
  2. **v1_1:** just as charming, with thin lines that match the head, but the front pair is visibly small and the darkest lines sit heavy on green.
  3. **v1_2:** the boldest and easiest to read from above (s13), but its lines are heavier than the head's smile and its o-mouth has a two-tone ring that doesn't match the other pieces.

## Gaps
- **A front-view eye pair is needed, but the rig can't use it yet.** The front pair is painted, but `src/characters/gator.js` gives the side and front facings one shared `eyes` slot (`SLOTS`, `makeFaces`). That means today's front view would show a single side eye in the middle of the face.
  - s10 (front) uses `tired` for most of the shot and `open` from 3.4 to 4.0 s.
  - s08 (front, lying down) uses `tired` and `closed`, with mouths `o` and `neutral`.
  - So an open pair alone doesn't cover the front shots. Front pairs for `tired` and `closed` are also needed.
  - The rig also needs a per-facing eye slot. That is a char-rigs or contract change, not mine.
- **Mouths don't match the frozen smile's shape.** Every variant's smile is a symmetric U. The frozen smile curves up toward the snout like a J. At head scale the smiles are also 30–45% wider than the painted one (91–101 px against 70 px).
- **The worried lid slants down toward the snout,** because my prompt asked for that. That can read glum rather than anxious. Whether to flip it in v2 is the director's call.
- **Lids show a faint pale rim** where they cross the head's eye bump (see `on_head.jpg`, worried). On v1_3 the sweat drops sit on the edge of the head silhouette.
- **`on_head.jpg` erases the painted eye with a flat green fill.** That is fine under disc swaps, but the composite can't be used to judge the closed or tired eyes, so I didn't include them.
- **Some numbers rest on assumptions.** The pupil and disc numbers use thresholds that I state in each script. v1_2's lid widths couldn't be measured: its lids are too pale for the green test. The worried disc centres in `on_head` assume the open eye's diameter.
- **Not checked in the renderer.** I have not checked under lamp light, in a shot, or from above in s13. Nothing was put into `assets/cut/`.
- **Unknown cost.** The image cost and model are unknown (doc 08).

## State
built · 2026-10-15
