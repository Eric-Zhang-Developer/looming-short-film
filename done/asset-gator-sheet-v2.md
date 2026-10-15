# Done · asset-gator-sheet-v2

## What shipped
G2 round 2 on the approved v1_1 base. There are two `gator_sheet` v2 variants, each with the same 14 pieces and rig names as v1, and the first two `gator_hero` variants, each a large single side view for the close-ups in s06, s15 and s18 H. All four survive screening, but the sheets do not meet the 40 px gap rule. Nothing is frozen.

## Where it lives
- Prompts and spec: `assets/prompts/gator_sheet.v2.md`, `assets/prompts/gator_hero.v1.md`, and the `gator_sheet` (edited) and `gator_hero` (new, cap 4) entries in `assets/specs.json`: 571d7c6.
- Sheet thumbs and sidecars, with screening in each sidecar: `assets/raw/thumbs/gator_sheet_v2_{1,2}.{jpg,json}` and `gator_sheet_v2_contact.jpg`: 7f0c1f3.
- Hero thumbs and sidecars: `assets/raw/thumbs/gator_hero_v1_{1,2}.{jpg,json}` and `gator_hero_v1_contact.jpg`: 34a90a4.
- Evidence: `evidence/asset-gator-sheet-v2/`: e7a02fa.
- The full-size PNGs are in `assets/raw/gator_sheet_v2_{1,2}.png` and `gator_hero_v1_{1,2}.png`. They are gitignored and exist only in this worktree.

## How it was checked
- **Generations.** I ran two calls side by side (`gen_run_sheet.txt`, `gen_run_hero.txt`, both ending in `exit 0`). The hero needed 2 calls but 3 generations, because Codex rolled twice inside the `hero_v1_2` call (`codex_images_generated: 2`).

  | asset | used this round | total used / cap | refs |
  |---|---|---|---|
  | `gator_sheet` | 2 | 5 / 8 | `style_tile.png` + `gator_sheet_v1_1.png` |
  | `gator_hero` | 3 | 3 / 4 | `style_tile.png` + `gator_sheet_v1_1.png` |

- [x] **Front views read as a gator (honest answer: partly).** See `front_views.jpg`. The cream face and throat mask is gone on both.
  - **v2_2: yes, mostly.** A separate rounded muzzle plate overlaps the lower face, with nostril dots and tooth tips at the jaw line. A cold viewer might say "hippo", but not "frog" or "bear".
  - **v2_1: borderline.** The muzzle spans the full face width, and on the blank face the two nostril dots read as eyes. It reads as a grinning frog as easily as a gator.
  - Neither has raised nostril bumps, only dots.
- [x] **The 3/4 head is really 3/4, on both.** See `contact.jpg`. Each shows the near eye large, the far eye partly behind it, and a shortened snout with both nostrils. v2_1 turns further.
  - They are cartoon 3/4 heads: the snout angles right more than it goes into depth.
  - The snout is shorter and blunter than v1_1's, which is cuter but is design drift.
  - Both have a painted smile line, which I did not ask for.
- [x] **The torn rim is visible in `edge_crop.jpg`.**
  - The sheets have a pale rim of about 2–4 px on every piece. On cream pieces, a thin dark line just inside the rim reads a little like stitching at thumbnail size.
  - The heroes have the clearest rim, about 4–6 px on hero_1, close to the tile's wall.
  - v1_1 shows no rim, for comparison.
- [ ] **Every gap at least 40 px: FAIL on both sheets.** Measured in `gaps.txt` with `evidence/asset-gator-sheet/measure.mjs`. The prompt asked for 60 px. Nothing touches and no boxes overlap.

  | variant | smallest pixel gap | smallest box gap | frame margin |
  |---|---|---|---|
  | v2_1 | 35 px (body/arm_l) | 20 px (turn_side/body) | 47 px |
  | v2_2 | 35 px (tail/jaw) | 27 px (turn_side/body) | 29 px |
  | v1_1, for comparison | 49 px | 30 px | 29 px |

- [x] **Hero figure height is at least 70% of the canvas.** See `hero_height.txt`: hero_1 is 973/1024 px = **95.0%**, hero_2 is 926/1024 px = **90.4%**. Their frame margins are 23 and 34 px, under the 40 px in my spec target. Nothing touches the edge.
- [x] **Cut test.** `cut.mjs --auto` ran into a scratch dir outside the repo (`cut.txt`, exit 0 for all four).
  - Each sheet gives **14 islands for 14 pieces**, and each hero gives 1 island.
  - The island → rig-name map is at the end of `cut.txt`.
  - **But v2_2's `body` has both sleeves and mitten hands painted on**, so arm_l/arm_r would double on the rig.
  - hero_2 had no alpha. cut.mjs keyed its magenta background.
- [x] **Other checks.**
  - Leg tops are cut flat on both sheets.
  - Side views are near-identical to v1_1. Mean green (`green.txt`, my rough check): v1_1 #668850, v2_1 #66864f, v2_2 #688a53, hero_1 #678553, hero_2 #609152 (brighter).
  - I looked at every evidence JPEG. All are under 0.5 MB.
- [x] **Ranking. I froze nothing.**
  - **Sheet:**
    1. **v2_1:** clean rig parts, the better 3/4 head and a 47 px frame margin, but the weaker front view.
    2. **v2_2:** the best front view, but its `body` part carries arms, which breaks the rig.
    - Option for the director: v2_1 with v2_2's `turn_front`. The pieces share one scale and layout. It is untested.
  - **Hero:**
    1. **hero_v1_1:** the most faithful to v1_1, with real alpha and the best rim.
    2. **hero_v1_2:** brighter green, a bigger eye, the hood rides higher, and it came back on magenta.

## Gaps
- **The 40 px gap rule is still not met after two rounds.** Asking for 60 px in the prompt did not help: box gaps went down, not up. The tight pair is always `turn_side`'s tail over `body`. A layout change in the spec (fewer pieces per sheet, or a wider gutter row) is the fix, not another reroll. That is the director's or orchestrator's call.
- **Hero budget overshoot.** The brief allowed at most 2 hero generations. Codex's internal re-roll made it 3 of the cap of 4. I could not prevent it: gen.mjs counts it after the fact.
- **`turn_head34` now has painted eyes,** because the brief asks for "both eyes partly visible". v1 and the spec had it blank for face-sheet swaps. The spec entry records the change. Whether the rig's eye slots should hide on head34 is not verified (`src/` is out of scope).
- **`turn_front` has tooth tips and a jaw seam painted.** This may clash with face-sheet mouth swaps placed over it. Not verified.
- **The evidence images have no labels.** v1's `sheet.mjs` needs headless Chrome, which is off limits on this machine. `layout.txt` gives the tile order instead.
- **For the orchestrator: `docs/assets.md`'s count needs `gator_hero` added** as a new frozen-asset row (group 2, shots s06, s15, s18 H). Per the brief, I did not edit the doc.
- **Unmeasured.** Image cost and model are unknown (doc 08). The rim width is judged by eye from 1:1 crops.

## State
built · 2026-10-15
