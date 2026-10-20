# Done · asset-gator-sheet

## What shipped
There are three v1 gator sheets for the director at G2. Each has 14 pieces: a 4-piece turnaround (side, front, back, 3/4 head) and 10 rig parts named and oriented for `src/characters/gator.js`. All three are near-traces of v3_4's side view. They differ in surface and in how cleanly the parts drop onto the rig. 3 of the 8 generations are used. Nothing is frozen.

## Where it lives
- `assets/specs.json` (the `gator_sheet` entry is appended, with parts mapped to rig names and pivots) and `assets/prompts/gator_sheet.v1.md`: ce2d34d.
- `assets/raw/thumbs/gator_sheet_v1_{1,2,3}.{jpg,json}` and `gator_sheet_v1_contact.jpg`, with screening in each sidecar: 3705352.
- `evidence/asset-gator-sheet/`: 35e1708.
- The full-size PNGs are in `assets/raw/gator_sheet_v1_{1,2,3}.png`. They are gitignored and exist only in this worktree.

## How it was checked
- [x] **Spec, prompt, 3 variants with thumbs and sidecars.**
  - One call: `node tools/gen.mjs --asset=gator_sheet --variants=3`. gen.mjs runs its variants one after another, so only one Codex call ran at a time. Log: `gen_run.txt`, which ends in `exit 0`.
  - Each run made 1 `image_gen` image. The dry run now reads `3/8 used`.
  - Sizes: 1672x941, 1672x941 and 1536x1024, all with real alpha.
  - Input tokens per run: 143k, 150k and 280k.
- [x] **Screening per variant, with gaps.**
  - Gaps are in `gaps.txt` (`measure.mjs`, alpha ≥ 16 islands, pixel gap measured edge to edge).
  - Leg share is in `legs.txt`, measured as the part of standing height below the hoodie hem: tile 18.4%, variants 17.2% / 17.5% / 17.9%.

  | variant | pixel gap (min) | box gap (min) | box overlaps | frame margin |
  |---|---|---|---|---|
  | v1_1 | 49 px (tail/jaw) | 30 px | none | 29 px |
  | v1_2 | 43 px | 32 px | none | 27 px |
  | v1_3 | 41 px | 35 px | none | 29 px |

- [x] **Cut test.** `cut.mjs --auto` on v1_1 into a scratch dir outside the repo gives **14 islands for 14 pieces**, 0 dropped, exit 0. Every piece is one island, with nothing merged or split. The island → rig-name map is at the end of `cut.txt`, and `parts.jpg` shows it labelled.
- [x] **Evidence images.** `contact.jpg` (navy and grey), `beside_v3_4.jpg` (each `turn_side` at the tile gator's height) and `parts.jpg` are all JPEG and under 0.3 MB. I looked at each one.
- [x] **Ranking. I froze nothing.**
  1. **v1_1.** Appeal: the friendliest and cleanest of the three. Faithfulness: a near-trace of v3_4's head, eye bump, snout, tooth tips, scalloped tail and hoodie. It has the best paper surface. Weak points: the leg tops are drawn as lighter cylinder ellipses, and on `turn_front` a cream throat patch reads as a blank mask.
  2. **v1_2.** Appeal: charming, with a slightly bigger head and the longest tail. Faithfulness: as close as v1_1. It has round joint discs, but the green disc at each arm's shoulder would show on the hoodie, and the hood on `body` is folded oddly.
  3. **v1_3.** Appeal: the least lively, with a paler, greyer green (judged by eye). Faithfulness: the same design. Its surface still reads as felt, and `body` is painted front-on, not in side view.

## Gaps
- **The 40 px rule is only half met.** Pixel gaps are 41–49 px and no bounding boxes overlap, but the smallest box gaps are 30–35 px and frame margins are 27–29 px. Nothing touches anything, and the cut is clean.
- **Resolution is too low for the close-ups.** `turn_side` is about 425 px tall. That is too small for s06, s15 and s18 H (doc 08: one piece per image for frame-filling use). Fixing it means splitting the sheet, which is a spec change for the director.
- **`turn_head34` is a side head on every variant, not a 3/4 front view.**
- **`turn_front` has no muzzle.** Front-on, he reads as a frog or a bear. s10 walks him front-on.
- **The torn-paper fix is partial.** v1_1 and v1_2 read more as paper than the tile does, but none has a clearly torn fibre rim.
- **Faces.**
  - `head`, `turn_front` and `turn_head34` are painted blank, because the rig's face slots sit on them.
  - `turn_side` is fully featured, because s12 uses it whole with no slots. I used it as the "extra featured side head" instead of painting a 15th piece. That is a deviation from the brief, made to keep the gaps.
  - On the rig, the eye slot is parented to `head`, so with `head34(on)` it may sit at the side-view position. Not verified, because `src/` is out of scope.
- **Tooth tips.** `turn_side` shows 2 tooth tips on all three variants, the same as v3_4. The `jaw` part has 3.
- **Unmeasured.** Green is judged by eye only. Image cost and model are unknown (doc 08).

## State
built · 2026-10-15
