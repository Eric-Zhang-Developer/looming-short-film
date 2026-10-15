# Done · mod-post

## What shipped
`src/post.js`: `createPost(stage, opts)` and `loadLUT(name)` per contracts. Chain: RenderPass (MSAA x4) → BokehPass → OutputPass (sRGB) → LUT → grain + vignette. No bloom. Four procedural 32³ LUTs (`night`, `marston`, `amber`, `dawn`) generated in code, no files. `stage.setRender(fn)` added to `src/core/stage.js` (default draw unchanged). `lab/post.html` + `lab/post.js`: three staggered layers at 1.6 / 2.3 / 2.9 m, focus pulled front → back over 0–3 s, then each LUT held 1.5 s (t in 0–9).

## Where it lives
`src/post.js`, `lab/post.html`, `lab/post.js`, `src/core/stage.js`, `evidence/mod-post/`. Commits on `task/mod-post`: `e848a78` (contract(core)), `a722499` (mod(post)).

## How it was checked
- [x] Focus pull strip shows the background softening: `evidence/mod-post/focus_strip.jpg`; full-res crop `focus_crop_t0_vs_t3.jpg` (t=0 front sharp, mid/back soft; t=3 reversed).
- [x] Each LUT visibly different and on palette: `evidence/mod-post/luts.jpg` (none, night blue, marston green-white and drained, amber, dawn gold with cold shadows). "On palette" is my eye on the sheet, not a measurement.
- [x] Grain deterministic: `evidence/mod-post/determinism.txt`. Same t gives the same sha256 after other frames rendered (t=0.5 and t=4: IDENTICAL). Control: t=4 vs t=4+1/24, with focus and LUT held, differs, so grain does re-roll per frame.
- [x] Frame time with post on: `evidence/mod-post/timing.txt`: 12.0 ms/frame on vs 2.0 ms off (median of 40, 1920×1080, headless Chrome, light lab scene).
- [x] `node src/core/selftest.js` after the stage change → `selftest: all passed`.

Reproduce: `node evidence/mod-post/render.mjs` (own driver, since `render.mjs` isn't in this worktree).

## Gaps
- Timing is for the light lab scene (no shadows, Lambert). The film's scenes will cost more; post adds roughly 10 ms on this machine, mostly the extra depth render and the 41-tap bokeh.
- Not tested with `render.mjs`, `tools/determinism.mjs` (absent here), nor on a real shot scene.
- **Import map:** post.js imports `three/examples/jsm/postprocessing/*`, so every page using it needs `"three/examples/jsm/": "/node_modules/three/examples/jsm/"` in its import map alongside `three`. The contracts' import-map line should gain it (a contract-doc note, not something I changed).
- BokehPass's depth pass uses an override depth material, so alphaTest cutouts, Points (dust) and transparent vellum are treated as opaque solid meshes in depth. Blur on soft-edged cutouts may be slightly off; unchecked on real paper meshes.
- BokehPass clears depth to `scene.background`'s color, so post.js hides the background during that pass only.
- Spec was silent on grade strength and LUT format: I took generated-in-code, so `assets/luts/` is empty (not created). Grade numbers are first guesses for the director to tune; the act-to-LUT mapping per shot is wave 4's job.
- `focus` is world distance (m) along the look axis. Shots animate it via `post.set({ focus })` in their `onFrame`.
- Grain is hashed from pixel and `round(t*24)`. It is deterministic on the same GPU/driver. A different GPU could round differently, unverified.

## State
built · 2026-10-15
