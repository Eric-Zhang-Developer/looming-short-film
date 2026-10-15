# Done · mod-paper

## What shipped
`src/paper.js` implements the contract: `WEIGHTS`, `makePaper`, `boilSeed` and `clearPaperCache`. The edge is cut against the exact signed distance field of the art's alpha (or of `path`). Every noise is read at the pixel's nearest edge point, so the tear moves only along normals. A smooth wobble is seeded by `key` alone, so the silhouette holds still. A linear-interpolated jag is re-seeded per boil step, which gives it corners where smoothstep noise gave lumps. It also adds a streaky pale fiber rim, a few hairs past the edge, and grain. The cache is an LRU keyed by `(key, seed, res)` with a cap of 300. `lab/paper.html` shows the four weights and the painted lamp under a soft overhead light and a low side light, boiling at 10 Hz.

## Where it lives
- `src/paper.js`, `lab/paper.html`, `lab/paper.js`
- `evidence/mod-paper/`: `weights.jpg`, `edge_crops.jpg`, `boil_strip.jpg`, `painted.jpg`, `determinism.txt`, `cache_check.txt`, `check_cache.mjs`
- Commits on `task/mod-paper`: `21f797f` (code), `8dda7fd` (evidence), plus the commit for this note.

## How it was checked
The renders use mod-render's `render.mjs` and `tools/determinism.mjs`. I copied them from the main checkout into a scratch runner whose `lab/ src/ assets/` symlink to this worktree, because neither is merged into this branch. The lab's `t` picks the view: [0,10) all five, [10,50) one weight's edge each, [50,60) the painted lamp.
- [x] **Four weights differ at the edge.** See `edge_crops.jpg` (`--sheet=10,20,30,40 --cols=2 --w=960`, about 1 texel per px) and `weights.jpg` (`--sheet=0`). Cardstock has a tight jag with a white rim. Kraft has a bigger wobble, coarser teeth and a tan rim. Tissue has large ragged notches and a rim close to its own color. Vellum is nearly clean with almost no rim.
- [x] **Painted piece keeps its painting.** See `painted.jpg` (`--sheet=50`): the paper lamp is on the left and the raw cut-out art (its own alpha, no tear) is on the right. The colors and brush texture are unchanged. The lamp gains a torn edge and a pale rim, clearest around the base, the knob and the shade's hem.
- [x] **Boil.** See `boil_strip.jpg` (`--strip=0:0.5 --fps=10 --crop=800,360,320,360`, the tissue sheet, 6 boil steps). The teeth and notches change every frame. The overall rectangle and its big wobble stay put.
- [x] **Determinism.** See `determinism.txt`: t = 0.05, 0.35, 15.2, 33.3 and 55.55 are each rendered, rendered again in reverse order, then rendered on a fresh page. All PASS (exit 0). The fresh page rebuilds every texture, so the cache can't hide a mismatch. `grep` finds no `Math.random`, `Date.now`, `performance.now` or raw hex codes in `src/paper.js` or `lab/paper.js`.
- [x] **Cache.** See `cache_check.txt`: same args return the same sheet, and a new seed or res makes a new sheet. Past 300 entries the least recently used entry is evicted. The check touches the oldest entry first, so a FIFO cache would fail it.
- [x] **Paper or vector, against `reference-videos/frames/torn_paper_ref.jpg`.** In close-up (`edge_crops.jpg`, `painted.jpg`) it reads as torn paper: corners in the tear, a fibrous rim, grain. It's clearly past the smoke test's lumps. At the wide framing (`weights.jpg`, pieces about 220 px on screen) it reads as rough-cut card, not vector, but **not yet as the reference.** The reference's white rim is a bold 3–5 px on objects about 200 px wide, roughly 2% of the object. Ours is 2–6 px on a 1024 px texture, which is 0.5% and lands at about 1 screen px, so the rim nearly vanishes. The edge shape is right; the rim is too thin at film scale.

## Gaps
- **The rim width spec is too thin for the film's framing.** At 2–6 px per 1024 px, the rim only shows once a piece fills roughly half the frame. To match the reference, rims need about 2% of the piece's on-screen size: either raise `rimPx` (about 8–14 at 1024) or size it per shot from screen coverage. I kept the brief's number and am flagging it for the director rather than changing it.
- **Hairs read as thorns up close.** They're straight 1–2 px spikes, most visible on kraft and tissue in `edge_crops.jpg`.
- **The tissue boil is strong.** A 15 px jag re-cut 10 times a second may read as jitter in motion. I haven't watched it moving. If it does, lower the tissue jag or use `rate = 4`.
- **`WEIGHTS` shape.** `tearAmp`, `tearFreq` and `rimPx` are `[a, b]` pairs: `[wobble, jag]` and `[min, max]`. Amplitudes are peak px at 1024; layered value noise mostly stays within about a third of the peak. I didn't add any fields. Rim whiteness comes from `thickness`, because thin stock is dyed through.
- **Spec was silent; I chose these:**
  - `path` is in image space with y down, like the art's pixels.
  - With `art`, the long edge of `size` is used and the art's aspect sets the other side. `size` is always required.
  - Art gets 0.4 of the wobble, because the full wobble would distort the drawing and could sever thin parts like the lamp's neck. Where the tear crosses past the painted edge, color bleeds in from just inside it.
- **Memory.** One sheet is two RGBA canvases, about 11 MB at 1024×1331, so 300 cached sheets could reach about 3 GB. Per-asset bases (SDF plus fill) aren't evicted (marked `ponytail:`). This is fine for the lab but untested at film scale.
- **Cost.** A new boil step costs about 50–70 ms per 1024 px piece, from render.mjs at 260–380 ms/frame for 5 pieces. A cache hit costs nothing.
- **Shadows from `alphaMap` without `customDepthMaterial`.** In `weights.jpg` the lamp's shadow on the wall is lamp-shaped (arm, shade, base). The lamp's `map` is opaque, so three r186 must be using the `alphaMap`. This confirms what smoke-paper only read in the source. mod-material should know about it.
- **Painted source is small.** The lamp crop is 330×420 px, upscaled about 2.4× to 1024 px, so it's soft. That matches the style-tile screening note. The crop box (1300, 210, 330, 420) and the cleared laptop corner are hard-coded in `lab/paper.js`.
- **The lab needs unfrozen art.** It loads `assets/raw/style_tile_v1.png`, which is gitignored. I copied it locally and didn't commit it. On a fresh checkout the lab won't load until that file is copied in.
- **`check_cache.mjs` depends on mod-render's `tools/lib/page.mjs`.** It runs from the repo root once mod-render is merged. Here I ran it from the scratch runner with `--preserve-symlinks`.
- **Lab lighting choice.** The pieces don't receive shadows, because the grazing side light striped them with a hard self-shadow line. Vellum and tissue use plain Lambert, because translucency belongs to mod-material.

## State
built · 2026-10-15
