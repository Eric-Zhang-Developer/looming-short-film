# Done · asset-cast-kit

## What shipped
Four painted cast sheets in the gator's felt-paper style, two variants each, screened and ranked: `roommates_sheet` (heron and bear cub, 6 pieces), `custodian_sheet` (tortoise, cap, cart, tray, bucket, mop, 10), `crowd_sheet` (neighbour and sleeper gators, 6), `top_figures_sheet` (top-down hero in 5 parts, six students, 11). Same sheet and piece names as `src/assets.js`, so the rigs take them with no code change. Nothing frozen, nothing cut into `assets/cut/`, no code touched.

## Where it lives
- Prompts: `assets/prompts/{roommates,custodian,crowd,top_figures}_sheet.v1.md`; specs appended to `assets/specs.json` (commit d1dc3aa).
- Outputs: full size in `assets/raw/<sheet>_v1_{1,2}.png` (gitignored); thumbs and sidecars (with `screening` reasons) in `assets/raw/thumbs/` (commit 8e4070d).
- Evidence: `evidence/asset-cast-kit/`: `contact.jpg` (all 8), `scale.jpg` + `scale_table.md` (winners at PIECES film size beside the frozen gator), `islands.txt`, `aspect_table.md`, `naming.txt`, `*.boxes.json` (auto), `*.named.json` (named), `scripts/`.
- Boxes, best variants (keys are `<sheet>_<piece>`, usable as `cut.mjs --boxes`): `evidence/asset-cast-kit/roommates_sheet_v1_2.named.json`, `custodian_sheet_v1_2.named.json`, `crowd_sheet_v1_2.named.json`, `top_figures_sheet_v1_1.named.json`.

## Ranking (I did not freeze)
- roommates: 1. `v1_2` (real alpha, slim heron sweater, crest and beak, blank-faced bear cub), 2. `v1_1` (magenta-keyed, heron body a wide cone).
- custodian: 1. `v1_2` (closest body aspect, complete cart with shelf plank, 50 px edge margin), 2. `v1_1` (the better tortoise face and a shirt pocket, but a fat body box, a 12 px edge margin and a lopsided cart handle). If the director prefers that face, v1_1 is the character pick.
- crowd: 1. `v1_2` (76 px gaps, clean hoods, tired vs asleep faces read at once), 2. `v1_1` (bulkier, 8 px gaps).
- top figures: 1. `v1_1` (the hero head has a snout and eye bumps and reads as the gator from above), 2. `v1_2` (nicer spacing and poses, but the hero head is a blob).

## How it was checked
- [x] `contact.jpg`, `scale.jpg`, `islands.txt` in `evidence/asset-cast-kit/`. I looked at every sheet and at both.
- [x] Every named piece found: `cut.mjs --auto` island counts 6, 6, 10, 10, 6, 6, 11, 11 (roommates, custodian, crowd, top figures, v1 then v2 each), exactly the PIECES counts. Named by reading order (`scripts/name_boxes.mjs`), and `scale.jpg`, built from those boxes, shows each name on the right shape.
- [x] Boxes files for the best variant of each sheet; ranking above; no freeze, nothing in `assets/frozen/`.
- [x] Screening reason written into every sidecar's `screening` field.
- [ ] Rigs on the new art: **not verified**. I did not run the film or `render.mjs`, so how the rigs look with these pieces is untested.

## Gaps
- **Aspect ratios are not held.** The brief says proportions follow PIECES. Codex ignored most of them (`aspect_table.md`, worst piece per variant 1.5x to 3.7x off). Worst on the winners: mop (3.5x too wide, the fringe head sets the box), custodian arms (2.5:1 vs 4.4:1) and tail (1.8:1 vs 3.9:1), heron tail (2:1 vs 4.2:1), cart tray (8.9:1 vs 15:1), crowd bodies (about 1.0 wide vs 0.67), top hero body (1.16 vs 0.75). The loader keeps each bitmap's own aspect and fixes only the long axis, so nothing breaks, but figures will not match the placeholder proportions and the rig offsets for the heron, custodian and mop will want a refit. I did not spend a third generation on it (usage is tight).
- **60 px spacing was not met.** Padded-box gaps are 0 to 76 px (winners: roommates 9, custodian 16, crowd 76, top figures 0), edge margins 16 to 66 px. All pieces are still separate alpha islands.
- **Roommates v1_1 spent two images in one call** (`codex_images_generated` 2 in its sidecar), so that sheet has used 3 of its cap of 3 generations, the others 2. No more generations are possible on roommates without raising the cap.
- **Roommates v1_1 came back magenta-keyed**, not alpha; `cut.mjs` keys it. The other seven have real alpha.
- **Tint risk:** the rigs tint these pieces with `greenVariant`. That is tuned for green art, so heron grey, bear brown and tortoise khaki may shift. Not tested.
- **The custodian is a tortoise**, as the brief allows; `docs/02-story.md` still says "an older gator". The story doc should be updated or the tortoise vetoed.
- **Crowd greens** are about the hero's green, not the greyer one I asked for; the hoodies and faces do the telling-apart.
- **Hero arms** are one piece, two cream sleeves with mittens meeting in the middle, as asked; v1_2's are bent and v1_1's straight.
- The crowd sheet came back as three columns by two rows rather than the two rows of three I described; the naming script handles that.

## Story
I wrote the four prompts first, one per sheet, copying piece names and aspect ratios straight out of `src/assets.js` so that nothing in the rigs would need touching. The faces were the one design decision. The roommate and hero-top rigs add eyes and mouths from the face sheet, so those heads are painted blank; the custodian and crowd rigs have no face slots, so their faces had to be painted. I picked a heron and a bear cub for the roommates, a tortoise for the custodian, and gators for the Marston neighbours, with the same hoodie logic as the hero.

I ran one Codex call at a time, one variant per call, so I could look at each result before spending the next. My first attempt was a loop in the background to save wall time. It exited immediately and wrote nothing, so I dropped it and ran every call in the foreground. That is why the log from that attempt is empty and not evidence of anything. The roommates' first call quietly made two images in one go (the sidecar says so), which used up that sheet's cap of three.

What surprised me was how good the art was and how bad the measurements were. Every sheet had exactly the right number of separate pieces, and the tortoise's half-lidded face (`evidence/asset-cast-kit/contact.jpg`) is the nicest thing in the batch. But the image model does not do aspect ratios. The mop came back more than three times too wide, and the custodian's arms were half as long as asked. I only saw this when I computed the table and laid the winners beside the gator in `scale.jpg`. The one real choice was the top-down hero: v1_2 had the nicer layout, but its head was a blob, and from above the snout is the only thing that says "gator". I ranked v1_1 first on that alone.
