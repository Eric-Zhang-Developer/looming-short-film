# Done · asset-style-tile-v3

## What shipped
There are four style-tile v3 variants for the director at G1. They use identical set pieces, and each has a different gator direction: (a) soft and round, (b) lanky and sleepy, (c) chibi, (d) graphic picture-book. Navy now appears only on the wall. Every prop is cream, kraft or green, and every prop in every variant passes the 25% luminance rule. `gen.mjs` now reads a per-asset `cap` (style_tile is 12, the default stays 8). 11 of 12 generations are used. Nothing is frozen.

## Where it lives
- `tools/gen.mjs`: `cap` from the spec entry, with a default of 8 (57ce1d3).
- `assets/prompts/style_tile.v3.md` and `assets/specs.json` (prompt → v3, `"cap": 12`): da0eba4.
- `assets/raw/thumbs/style_tile_v3_{1..4}.{jpg,json}` (sidecars carry `gator_direction`, `assembled_prompt` and `screening`), `style_tile_v3_contact.jpg`, and `evidence/asset-style-tile-v3/`: bb6261a.
- Full-size PNGs are in `assets/raw/style_tile_v3_{1..4}.png`. They are gitignored and exist only in this worktree.

## How it was checked
- [x] **4 variants, each a distinct gator direction, with thumbs and sidecars.**
  - gen.mjs has one prompt per asset, so the brief's single `--variants=4` call could not give each variant its own gator. Instead I made four sequential `node tools/gen.mjs --asset=style_tile --variants=1` calls. Before run k, the `[GATOR DIRECTION]` line in block 3 was replaced with direction k's paragraph, which is kept verbatim above `## 3.` in the prompt file, and the file was restored afterwards.
  - The exact prompt each run sent is in `evidence/asset-style-tile-v3/prompt_v3_<k>.txt`. The run logs are `gen_run_<k>.txt` (each ends in `exit 0`), and the raw Codex logs are in `codex/v3_<k>/`.
  - I ran them sequentially, not 2 at a time. gen.mjs picks the output index when it starts, so two parallel processes would both write `_v3_1`.
  - All four came back with real alpha. Three are 1983x793 and one is 2043x770. Each made 1 `image_gen` image with no re-rolls.
  - The dry run now reads `11/12 used`, and `--variants=2` is REFUSED.
  - Usage per run, from `turn.completed`: input 114,684–148,792 tokens, output about 1.6k. Wall-clock was 82–104 s each.
- [x] **Contrast table.** Every prop is ≥ 25% from the wall in all four variants. Full table: `evidence/asset-style-tile-v3/contrast.txt`, script: `contrast.mjs`.
  - Method: Rec.709 luma of each cut piece, mean over alpha ≥ 128. Pass means |ΔY'| ≥ 25% of full scale (64/255).
  - The wall measures Y' 46–53, because the pale torn rim lifts it above #1E2440's 36.7.

  | variant | desk | calendar | lamp | laptop | gator |
  |---|---|---|---|---|---|
  | v3_1 (a) | 37.0% | 61.9% | 53.6% | 58.9% | 45.8% |
  | v3_2 (b) | 36.2% | 64.9% | 53.3% | 60.7% | 47.0% |
  | v3_3 (c) | 36.4% | 67.0% | 53.5% | 62.2% | 45.0% |
  | v3_4 (d) | 38.7% | 63.6% | 50.8% | 59.0% | 45.4% |

  - Control: v2_4, measured the same way, fails on the laptop at 5.1%. Its lamp passes on the mean (38.6%), but 42.2% of its pixels sit within 64 levels of the wall (the navy stem).
  - In v3, no prop has more than 23% of its pixels near the wall's value.
- [x] **`contact.jpg` and `gators.jpg`.**
  - `evidence/asset-style-tile-v3/contact.jpg` (4124x816) shows v3_1..v3_4 left to right, over grey on top and navy below.
  - `gators.jpg` (3360x800) shows the four cut gators, each scaled to 720 px tall, over navy.
  - Both are JPEG under 0.4 MB, and I looked at both.
- [x] **Cut.** `cut.mjs --auto --out=<scratch>` on all four (the best, v3_4, first) gives 6 alpha islands each, all kept, exit 0. Log: `evidence/asset-style-tile-v3/cut.txt`.
  - Real alpha, so there is no key or despill. Interior alpha 250–254 was clamped.
  - The parts were not committed. The gator parts are the ones in `gators.jpg`.
- [x] **Ranking (one line on appeal each). I froze nothing.**
  1. **v3_4 graphic picture-book.** It is the only one that reads instantly as a gator (blunt snout, tooth tips, scalloped tail) while staying friendly: big forward eye, smile, stubby legs. Its flat shapes map onto the 8-part rig, it is the closest to palette green and it is the largest gator. On the other side, it is less cuddly than (a) and its tail makes it wide.
  2. **v3_1 soft and round.** It is the most huggable, with an upturned eye, a warm smile and a bean body. But with the eye bump on a round head and a short snout, it can read as a frog.
  3. **v3_3 chibi.** It is the cutest at thumbnail size. But its head bumps and almost-absent snout read as a baby dinosaur, its green is the most saturated, and it is the smallest (199x288 px box).
  4. **v3_2 lanky, sleepy.** It has the most student personality, but the heavy lid reads bored and is closest to the v2 look the director called ugly. Its hoodie is fleecy, with soft fold shading.

## Gaps
- **The gator direction is a per-run edit, not something gen.mjs knows about.** Each sidecar's `prompt_file` points to `style_tile.v3.md`, which holds a marker line, not the prompt that ran. The real prompt is the sidecar's `assembled_prompt`.
  - A per-variant prompt or slot option in gen.mjs would make this clean. That was outside my owns (gen.mjs was limited to the cap change).
  - gen.mjs is also not safe to run as two processes at once, because of the index race. Untouched; noted only.
- **Gaps between pieces are still under 40 px in all four.** The smallest wall–desk box gap is 12–24 px, and v3_4's laptop–gator gap is about 5 px. The lamp shade overhangs the laptop, so their bounding boxes overlap. They still cut into 6 clean islands.
- **Scale.** The gator is about as tall as the lamp, and the desk is only an edge slab, so the "head a little above the desktop" relation can't be checked from the sheet. This is the same as v2.
- **Material.** All four lean toward a fibrous, felt-like surface, which is strongest on v3_2's hoodie (sherpa, with fold shading). The laptops have a thin light-grey band, a colour off the named palette. The lamp bases and desk slabs are drawn with a top face and a side band, though the light on them is even.
- **Torn rim.** The torn rim is still similar on most props. The wall's rim is heavier, but doc 03's "vary the tear" is only partly met.
- **Not measured.** Gator green is measured only as a mean (distance from #6F8F5E: 13–28). Image cost and model are unknown (doc 08).
- **Untouched.** The 12th generation is unused. Freezing, the manifest and the process log are not in my owns.

## State
built · 2026-10-15
