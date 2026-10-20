# Done · asset-home-kit

## What shipped
Two parts kits in the frozen paper style, three variants each, screened and ranked: `home_kit` (student bedroom, 21 separate pieces) and `kitchen_kit` (16 pieces). Each variant came back as one sheet with every piece its own alpha island. Nothing is frozen or cut into the repo; best-variant boxes and a scale table are in evidence. Six Codex calls total, run one at a time.

## Where it lives
- Prompts: `assets/prompts/home_kit.v1.md`, `assets/prompts/kitchen_kit.v1.md`; specs appended to `assets/specs.json` (commits fc44688, 65f11a5).
- Outputs: full size in `assets/raw/home_kit_v1_{1,2,3}.png`, `assets/raw/kitchen_kit_v1_{1,2,3}.png` (gitignored); thumbs, sidecars with screening reasons and per-kit contact sheets in `assets/raw/thumbs/` (commit fe1c1d0 and the one after it).
- Evidence: `evidence/asset-home-kit/` (`contact.jpg`, `scale.jpg`, `scale_table.md`, `islands.txt`, `*.named.json` boxes, `scripts/`).

## Ranking (the orchestrator freezes by the director's rule; I did not)
Home: 1. `home_kit_v1_1` (simplest, flattest, most cut-paper; bed, blanket, desk and chair read at once), 2. `v1_2` (rounder bed, messier laundry), 3. `v1_3` (best laptop screen, but busy bookshelf and laundry).
Kitchen: 1. `kitchen_kit_v1_1` (strongest fibre and rim, every appliance unmistakable, kraft kickplate), 2. `v1_3` (flattest, simplest, navy kickplates, cleanest fridge), 3. `v1_2` (teapot-ish kettle, white-outline burners).
Boxes for the winners (reading order, named, usable as `cut.mjs --boxes`): `evidence/asset-home-kit/home_kit_v1_1.named.json`, `evidence/asset-home-kit/kitchen_kit_v1_1.named.json` (also named files for v2 and v3).

## Scale table
Gator height is **0.096 m** sole to head top (`src/characters/gator.js`: K = 0.030/130 m per figure px; `src/assets.js` turn_side 0.0962). The brief said about 0.125 m and README says an 8 cm gator; I used the code. I read him as a 1.75 m student, so **1 real m = 0.055 film m**. That also gives a desk top at 0.041 m (0.43 of his height) and a bed top at about 0.028 m (0.29, human knee), against the existing shots' desk (0.034) and chair seat (0.021). Where the brief said "desk at chest": his chest is about 0.47 of his height, so the desk is just under it. Height is fixed from the table; width comes from the painted aspect (except fit-to-neighbour pieces: mattress 0.100 w, blanket 0.090 w, pillow 0.030 w, blinds 0.0753 w = window frame, laptop_base 0.018 w, rug 0.088 w, dish rack 0.0248 w, fruit bowl 0.0165 w).

| piece | kit | cut px (w x h) | film w x h (m) | w, h in gator-heights (0.096 m) | texel density vs gator sheet |
|---|---|---|---|---|---|
| door | home | 148 x 236 | 0.0690 x 0.1100 | 0.72 x 1.15 | 0.50 |
| bookshelf | home | 168 x 288 | 0.0578 x 0.0990 | 0.60 x 1.03 | 0.67 |
| bed_frame | home | 372 x 176 | 0.1163 x 0.0550 | 1.21 x 0.57 | 0.74 |
| window_frame | home | 236 x 224 | 0.0753 x 0.0715 | 0.78 x 0.74 | 0.72 |
| desk | home | 320 x 172 | 0.0768 x 0.0413 | 0.80 x 0.43 | 0.96 |
| desk_chair | home | 168 x 200 | 0.0416 x 0.0495 | 0.43 x 0.52 | 0.93 |
| floor_lamp | home | 104 x 212 | 0.0432 x 0.0880 | 0.45 x 0.92 | 0.56 |
| bed_mattress | home | 368 x 92 | 0.1000 x 0.0250 | 1.04 x 0.26 | 0.85 |
| bed_blanket | home | 320 x 136 | 0.0900 x 0.0382 | 0.94 x 0.40 | 0.82 |
| bed_pillow | home | 212 x 128 | 0.0300 x 0.0181 | 0.31 x 0.19 | 1.63 |
| window_glass | home | 180 x 204 | 0.0525 x 0.0595 | 0.55 x 0.62 | 0.79 |
| blind_up | home | 360 x 115 | 0.0753 x 0.0241 | 0.78 x 0.25 | 1.10 |
| blind_down | home | 256 x 224 | 0.0753 x 0.0659 | 0.78 x 0.69 | 0.78 |
| laundry_pile | home | 340 x 176 | 0.0354 x 0.0183 | 0.37 x 0.19 | 2.22 |
| poster_a | home | 152 x 204 | 0.0287 x 0.0385 | 0.30 x 0.40 | 1.22 |
| poster_b | home | 276 x 164 | 0.0370 x 0.0220 | 0.39 x 0.23 | 1.72 |
| laptop_screen | home | 228 x 148 | 0.0185 x 0.0120 | 0.19 x 0.13 | 2.85 |
| laptop_base | home | 276 x 92 | 0.0180 x 0.0060 | 0.19 x 0.06 | 3.54 |
| rug | home | 312 x 144 | 0.0880 x 0.0406 | 0.92 x 0.42 | 0.82 |
| fridge_body | kitchen | 196 x 376 | 0.0487 x 0.0935 | 0.51 x 0.97 | 0.93 |
| fridge_door | kitchen | 196 x 380 | 0.0482 x 0.0935 | 0.50 x 0.97 | 0.94 |
| stove | kitchen | 256 x 352 | 0.0440 x 0.0605 | 0.46 x 0.63 | 1.34 |
| sink | kitchen | 296 x 336 | 0.0581 x 0.0660 | 0.61 x 0.69 | 1.17 |
| counter_run | kitchen | 576 x 224 | 0.1273 x 0.0495 | 1.33 x 0.52 | 1.04 |
| upper_cabinets | kitchen | 460 x 168 | 0.1054 x 0.0385 | 1.10 x 0.40 | 1.01 |
| microwave | kitchen | 252 x 160 | 0.0309 x 0.0196 | 0.32 x 0.20 | 1.88 |
| kettle | kitchen | 204 x 176 | 0.0159 x 0.0138 | 0.17 x 0.14 | 2.95 |
| dish_rack | kitchen | 332 x 164 | 0.0248 x 0.0122 | 0.26 x 0.13 | 3.10 |
| fruit_bowl | kitchen | 244 x 192 | 0.0165 x 0.0130 | 0.17 x 0.14 | 3.41 |
| cereal_box | kitchen | 116 x 152 | 0.0126 x 0.0165 | 0.13 x 0.17 | 2.13 |
| mug | kitchen | 140 x 124 | 0.0062 x 0.0055 | 0.06 x 0.06 | 5.20 |
| jar | kitchen | 100 x 156 | 0.0071 x 0.0110 | 0.07 x 0.11 | 3.27 |
| wall_strip | home | 320 x 108 | 0.1630 x 0.0550 | 1.70 x 0.57 | 0.45 |
| floor_strip | home | 340 x 128 | 0.1461 x 0.0550 | 1.52 x 0.57 | 0.54 |
| backsplash_strip | kitchen | 736 x 108 | 0.1874 x 0.0275 | 1.95 x 0.29 | 0.91 |
| wall_strip | kitchen | 324 x 108 | 0.1650 x 0.0550 | 1.72 x 0.57 | 0.45 |
| floor_strip | kitchen | 592 x 116 | 0.2807 x 0.0550 | 2.92 x 0.57 | 0.49 |

Proposed `src/assets.js` entries (name: [w, h] in m; shapes `rect`, palette keys to taste; I did not edit it):
- `home_kit`: door: [0.0690, 0.1100], bookshelf: [0.0578, 0.0990], bed_frame: [0.1163, 0.0550], window_frame: [0.0753, 0.0715], desk: [0.0768, 0.0413], desk_chair: [0.0416, 0.0495], floor_lamp: [0.0432, 0.0880], bed_mattress: [0.1000, 0.0250], bed_blanket: [0.0900, 0.0382], bed_pillow: [0.0300, 0.0181], window_glass: [0.0525, 0.0595], blind_up: [0.0753, 0.0241], blind_down: [0.0753, 0.0659], laundry_pile: [0.0354, 0.0183], poster_a: [0.0287, 0.0385], poster_b: [0.0370, 0.0220], laptop_screen: [0.0185, 0.0120], laptop_base: [0.0180, 0.0060], rug: [0.0880, 0.0406], wall_strip: [0.1630, 0.0550], floor_strip: [0.1461, 0.0550]
- `kitchen_kit`: fridge_body: [0.0487, 0.0935], fridge_door: [0.0482, 0.0935], stove: [0.0440, 0.0605], sink: [0.0581, 0.0660], counter_run: [0.1273, 0.0495], upper_cabinets: [0.1054, 0.0385], microwave: [0.0309, 0.0196], kettle: [0.0159, 0.0138], dish_rack: [0.0248, 0.0122], fruit_bowl: [0.0165, 0.0130], cereal_box: [0.0126, 0.0165], mug: [0.0062, 0.0055], jar: [0.0071, 0.0110], backsplash_strip: [0.1874, 0.0275], wall_strip: [0.1650, 0.0550], floor_strip: [0.2807, 0.0550]

## How it was checked
- [x] `contact.jpg` (all 6 variants), `scale.jpg` (winners beside the frozen gator side figure at the table's scale), `islands.txt`: `evidence/asset-home-kit/`. Islands: 21 for each home variant, 16 for each kitchen variant (`node tools/cut.mjs --auto`, none dropped).
- [x] Piece names and boxes: `evidence/asset-home-kit/*_v1_?.named.json`. Naming is by row then x against the prompt order, and I checked it against the sheets by eye; the named boxes cut cleanly (exit 0).
- [x] Ranking above. No freeze, nothing copied to `assets/frozen/`.
- [x] Screening against doc 08 (baked light, background, touching, text, palette, resolution): every variant passes; reasons are in each sidecar's `screening`. I did not verify the pieces lit in the engine.
- [x] Done note ends with `## Story`.

## Gaps
- **Resolution and spacing.** Sheets are 1672x941 (kitchen v1: 1774x887). Large flats are painted at about half the gator's texel density (`scale_table.md` last column: door 0.50, bookshelf 0.67, floor lamp 0.56, wall strips 0.45, floor strips 0.49-0.54); small props are denser than needed. If the camera ever fills the frame with the door, bookshelf, walls or floors, regenerate those one piece per image (doc 08).
- Pieces are 60 px apart in the prompt but only 4-16 px apart between padded boxes (the cutter's pad is 4 px each side), and 7-25 px from the frame edges. They are separate islands anyway and cut clean; the brief's gap check is not met as asked.
- Sheet scale is not shared (the prompt gives per-piece aspect ratios), so relative size on the sheet means nothing; the table does. Measured aspects are not always the prompted ones (mattress 4:1, not 5:1).
- Home wall and floor strips are only ~1.5-1.7 gator-heights wide: tiling is needed and I did not check that their left and right edges meet. Kitchen wall strip is the same.
- Fridge cavity is grey-cream, not the pure cream of the rest. The home `laptop_screen` of v1 carries a small hinge chin; v3's is a clean slab if the glow needs it.
- Alpha edges show the same pale/yellow fringe the frozen gator sheet has over black.
- The home prompt as sent still carries one clumsy clause ("a plant leaf is not needed"); I left the file matching what was sent.
- No lit in-context render; no `src/assets.js` edit.

## Story
I started by reading the gator code to find out how tall he is, because the brief said 0.125 m and the code said 0.096. I trusted the code and wrote that down. The next question was whether furniture could be sized "at his chest" and "at his knee", and the answer was that a cartoon gator with stubby legs has no knees; I picked one scale, 0.055 film m per real m, and checked it against the desk and chair already in the shots.

I wrote one prompt per kit, with every piece's width-to-height ratio spelled out, and then generated three variants each. My first attempt to launch the home run failed in a small, dull way: I chained a BSD-sed tidy-up in front of the Codex call, the sed errored, and the chain stopped before committing, while the generation I had launched on the next line ran anyway. I noticed because git showed the prompt files untracked while a Codex process was alive. I committed after the fact and left the prompt text as it was sent.

The surprise was how well it behaved. All three home sheets came back with 21 clean islands and all three kitchen sheets with 16, on the first try, so there were no re-rolls. The real problem only showed up when I laid the pieces at the gator's own scale in `scale.jpg`: my first layout had the mattress at 0.044 m next to a 0.116 m bed, because I had sized it by height and the painter had made it thicker than I asked. I switched the fit-together pieces to width-based sizing (`evidence/asset-home-kit/scale.jpg`) and the room started to hang together. The other finding is in the last column of the table: the doors and walls are about half as sharp as the gator.

## State
built · 2026-10-15
