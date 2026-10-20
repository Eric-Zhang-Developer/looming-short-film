# Done · asset-marston-kit

## What shipped
Two parts kits in the frozen paper style, built from the director's four interior photos and `docs/ref-ufl.md` §2: `marston_kit` (interior, 18 pieces) and `marston_ext_kit` (exterior plus the night window view, 14 pieces). Interior: 5 sheets (3 of v1, 2 of the v2 chair revision). Exterior: 3 sheets. Eight Codex calls, one at a time. Each sheet came back with every piece its own alpha island. Nothing is frozen or cut into the repo.

## Where it lives
- Prompts: `assets/prompts/marston_kit.v1.md`, `marston_kit.v2.md`, `marston_ext_kit.v1.md`; specs appended to `assets/specs.json` (the `marston_kit` spec now points at v2). Commits a046d48, 02e7061, 77a9c81.
- Outputs: full size `assets/raw/marston_kit_v{1_1..1_3,2_1,2_2}.png`, `marston_ext_kit_v1_{1..3}.png` (gitignored); thumbs, sidecars with screening reasons and per-kit contact sheets in `assets/raw/thumbs/`.
- Evidence `evidence/asset-marston-kit/`: `contact.jpg` (all 8 sheets), `scale.jpg` (interior pieces beside the frozen gator), `scale_ext.jpg`, `scale_table_int.md`, `scale_table_ext.md`, `islands.txt`, `*.named.json` boxes, `scripts/`.

## Ranking (I did not freeze)
Interior: 1. `marston_kit_v2_1` (bold Y-frame chairs in three-quarter and rear, curved-front perforated cubicle, brightest bookshelf), 2. `v2_2` (clearest side-chair rib, muddier palette), 3. `v1_2` (strong cubicle fronts, Y only from behind), 4. `v1_3` (best perforated panels and tube-like strip light), 5. `v1_1`.
Exterior: 1. `marston_ext_kit_v1_3` (clean openings, mullioned stepped bay, clean breezeway beam, best tower), 2. `v1_1` (night view best composed, ragged window holes), 3. `v1_2` (12 openings, stray bars on the breezeway).
Boxes for the winners, keys prefixed and in reading order, usable as `cut.mjs --boxes`: `evidence/asset-marston-kit/marston_kit_v2_1.named.json` and `evidence/asset-marston-kit/marston_ext_kit_v1_3.named.json` (named files exist for every variant).

## Proposed `src/assets.js` entries (name: [w, h] film m; I did not edit it)
Scale 0.055 film m per real m (gator 0.096 m = 1.75 m student, as in `done/asset-home-kit.md`). Desk top 0.75 m = 0.041, 0.43 of his height, so a desk top sits just under his chest. Interior heights are my reading of the photos; the exterior sizes are film metres from `docs/shots/s09.md` and `s11.md`, not real scale (tower and lamps are distance-layer sizes).
- `marston_kit` (v2_1): cubicle_front: [0.1182, 0.0770], cubicle_side: [0.1000, 0.0770], desk_row_front: [0.2223, 0.0578], round_table: [0.0871, 0.0413], chair_side: [0.0369, 0.0550], chair_34: [0.0433, 0.0550], chair_back: [0.0425, 0.0550], bookshelf_bay: [0.0981, 0.1155], column: [0.0446, 0.1650], ring_light_lit: [0.1100, 0.0389], ring_light_unlit: [0.1100, 0.0394], strip_light: [0.1320, 0.0215], recessed_panel: [0.0330, 0.0330], exit_sign: [0.0192, 0.0099], ceiling_strip: [0.2640, 0.0709], carpet_tile: [0.0660, 0.0305], ribbon_window: [0.3438, 0.0825], wall_strip: [0.5657, 0.1650]
- `marston_ext_kit` (v1_3): facade_block: [1.2000, 0.3086], stepped_bay: [0.4000, 0.2495], breezeway_frame: [0.4009, 0.3300], century_tower: [0.1158, 0.5000], night_view: [0.5000, 0.2511], oak_canopy: [0.8000, 0.2601], lit_window_strip: [0.8500, 0.1913], brick_strip: [0.4357, 0.0750], band_strip: [0.2265, 0.0300], planter_hex: [0.1400, 0.0770], sculpture_yellow: [0.2000, 0.1917], lantern_post: [0.0612, 0.1650], lantern_cluster: [0.0800, 0.0618], lamppost_black: [0.0594, 0.2200]

Full tables with assumed real sizes and texel density: `evidence/asset-marston-kit/scale_table_int.md`, `scale_table_ext.md`.

## How it was checked
- [x] `contact.jpg`, `scale.jpg`, `islands.txt` in `evidence/asset-marston-kit/`. `node tools/cut.mjs --auto` gave 18 islands for each interior sheet and 14 for each exterior sheet, none dropped.
- [x] Piece names and boxes: named by row order against the prompt and checked by eye against the sheets for interior v1_2 and exterior v1_3 only (box positions line up with the images); the other variants share the same row layout and are named the same way but I did not check each one; the named boxes cut cleanly (exit 0).
- [x] Spec checks by eye: Y-back chairs side/three-quarter/rear (v2: yes in three-quarter and rear, a rib in side; v1: rear only), ring pendant lit and unlit as one object in two states, strip light, coffered ceiling strip, recessed panel, column with wood band, carpet, shelf bay, exit sign without text, ribbon window panes empty; exterior bronze bands, stepped bay, breezeway with a separate tower, lanterns, night view with oak, lampposts and the tower.
- [x] Screening reasons for all 8 variants are in each sidecar's `screening`. No baked light, text, or off-palette failures; faults are listed below.
- [x] Nothing copied to `assets/frozen/`.
- [ ] Pieces lit in the engine: **not verified**.

## Gaps
- **The Y back is strongest from behind.** In every v1 sheet the side and three-quarter chairs were a plain oval mesh (`contact.jpg`, top block). v2 fixed the three-quarter and rear views; the side view only shows a dark rib. If a shot holds the side chair large, treat it as acceptable, not perfect.
- **Photos were not attached to Codex.** They show real students, and the brief says reference only, so the prompts describe them in text and attach the style tile, gator sheet and the frozen home kit. The result is a recognisable-type library, not a copy of Marston's exact fixtures. The ring pendant is drawn as a slab with two rods, not the ring-from-below the photo shows.
- **Brick is red-brown**, not the near-navy dark terracotta the prompt asked for. It needs darkening in the engine.
- **Facade has 2 window ribbons (3 bands)**; `docs/shots/s09.md` wants 3 rows of 8 openings. The winner is 3.9:1, not the s09 1.2 x 0.42 m (it scales to 1.2 x 0.309).
- **Low resolution on big flats**: texel density against the gator sheet is 0.13 for the facade and lit window strip, 0.16 for the interior wall strip, 0.34 for the ribbon window, 0.38 for the ceiling strip, 0.41 for the column. Fine for the distant s09 and the dim, defocused room; regenerate one piece per image (doc 08) if a shot fills the frame with any of them.
- **Tileability not verified**: the carpet, wall, brick, band and ceiling strips were asked to tile left to right; I did not check that their edges meet.
- **Night view is on the exterior sheet** (it is an outside view), not the interior one, and the lit window strip is separate from the facade so s09 can choose which windows glow.
- Alpha edges carry the same pale fringe as the frozen gator sheet over black. Piece gaps on the sheets are a few px between padded boxes, as in the home kit.
- The v2 prompt has a clumsy "the v1 sheet is not attached" aside; the file matches what was sent.
- Interior real heights (e.g. cubicle 1.4 m, column 3.0 m, wall strip 3.0 m) are my estimates from the photos, not measurements.

## Story
I began with the four photos, looked at what makes a room recognisable and listed it: the Y-backed mesh chair, grey dotted cubicle panels with curved maple tops, the ring pendant, long strip lights and the pyramid ceiling tile. I could not attach the photos to Codex, since they show real students and the brief calls them reference only, so I wrote everything into the prompt as text and attached the style tile, the gator sheet and the frozen home kit so the new kit would match the home one. I wrote two prompts, one for the inside and one for the outside with the Century Tower, and ran three variants of each, one Codex call at a time.

The first surprise was how well it behaved: every sheet came back with the right number of clean islands (18 inside, 14 outside, `islands.txt`), no re-rolls. The second was that the one thing I cared most about had slipped through. Looking closely at the chairs, the Y shape appeared only in the rear view, and the side and three-quarter chairs had a plain oval back (`contact.jpg`, top block). I wrote a revision prompt that spelled out the Y as the visible structure, and spent two more calls on it. It worked for the three-quarter and rear chairs, and the side chair only got a dark rib. I stopped there rather than burn the rest of the cap on one view.

One small snag: ffmpeg here has no text drawing, so I could not label the boxes on an overlay. I named them by row order and checked each name against the sheet by eye, which is why the naming claim is "by eye".

## State
built · 2026-10-15
