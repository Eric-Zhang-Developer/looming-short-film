# Brief · smoke-paper

**Type:** builder
**Wave:** 1 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/04-technical.md` (§Architecture, §Determinism, §paper.js, §paperMaterial, §Lights, §Rendering), `docs/03-art-direction.md` §The paper and the ink and §Lighting rules, `docs/02-story.md` §The visual rule

## Goal
Prove the film's core technique before anything else is built. A torn-paper cutout stands in front of a paper wall in three.js. A low, close light makes its **cutout-shaped** shadow loom large, and an overhead light makes it small. It renders headless to image files, the same render at the same `t` gives identical output, and it reads as paper.

## Owns
- `package.json`, `package-lock.json` (create them: `three`, `puppeteer-core`, and a static server only if needed; pin exact versions)
- `smoke/paper/` (all code for this test)
- `evidence/smoke-paper/`
- `done/smoke-paper.md`

Do **not** create `src/` modules yet. That's wave 2. Keep everything inside `smoke/paper/`, written simply enough that wave 2 can lift the good parts.

## Spec
**Scene** (all units in meters; it's a tabletop diorama):
- **Wall:** a cardstock plane, cream `#F2E8D5` darkened toward night navy `#1E2440` by the lighting, not by the texture.
- **Desk edge:** a kraft `#A8835A` strip in the foreground.
- **The cutout:** a torn-paper blob shape about 6 cm across, standing about 15 cm in front of the wall, in gator green `#6F8F5E`.
  - Generate its texture on a 2D canvas: a closed shape whose edge is pushed in and out along its normals with layered value noise (the torn edge), a 2–6 px pale fiber rim inside the edge, and fine grain noise in the fill.
  - It has two eye holes. The shadow must show them.
- **Material:** `MeshLambertMaterial` plus `alphaTest: 0.5` and `side: DoubleSide`. Add a **`customDepthMaterial`** that uses the same alpha map, so the shadow is the torn shape with eye holes and not a rectangle. This is the key gotcha in doc 04.
- **Optional, if time allows:** one tissue-weight plane (a small lampshade shape) using a simple back-lit translucency term in `onBeforeCompile`, so you can see whether it glows when lit from behind. If you skip it, say so.
- **Lights:**
  - **"phone":** a cyan `#6FD3E3` SpotLight, wide angle, low and close to the cutout from the front, so the shadow on the wall is about **3×** the cutout's size.
  - **"lamp":** an amber `#F0A84A` SpotLight high above, so the shadow is a small pool near the cutout's base.
  - Use the doc 02 formula (shadow scale ≈ d(light→wall) / d(light→cutout)) to place them, and print the computed scale.
  - `PCFSoftShadowMap`, a 2048 shadow map, and tuned bias so there's no acne and no detached shadow.
- **Camera:** a `PerspectiveCamera` with a narrow FOV (~20°), far back. Depth of field is optional.
- **Time:** expose `window.renderFrame(t)`. For `t < 2.5` the phone light is on; for `t >= 2.5` the lamp is on. The edge-noise seed is `floor(t * 10)` so you can see the boil. No `Math.random`: use a seeded PRNG (mulberry32 or similar).

**Render:** a small Node script (`smoke/paper/render.mjs`) that uses `puppeteer-core` with Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` to load the page, call `renderFrame(t)` for t = 0.5 and 4.0, and save 1920×1080 PNGs. Also save frames t = 0.0, 0.1 and 0.2 as a strip to show the boil. Use `preserveDrawingBuffer: true`. Record milliseconds per frame.

**Determinism:** render t = 0.5 twice and compare sha256 of the PNGs. Report the result.

## Acceptance
- [ ] `evidence/smoke-paper/phone_t0.5.png`: the shadow is clearly much larger than the cutout, and the measured or computed scale is within ±30% of 3×
- [ ] `evidence/smoke-paper/lamp_t4.0.png`: the shadow is a small pool, under about 1.3× the cutout's width
- [ ] The shadow has the torn edge and both eye holes (crop to prove it: `evidence/smoke-paper/shadow_crop.png`)
- [ ] The boil strip shows the edge changing between frames
- [ ] Determinism: identical hashes for the two renders of t = 0.5 (or exactly what differs)
- [ ] ms/frame recorded
- [ ] Your honest one-line read: does it look like **paper** or like **3D/vector**? Look at the images before answering.

## Evidence required
`evidence/smoke-paper/`: the two stills, `shadow_crop.png`, `boil_strip.png`, `hashes.txt`, `timing.txt`, and (if built) `tissue.png`.

## Out of scope
Characters, puppets, the ink-blob shader, post-processing beyond optional depth of field, and any `src/` module. Polish isn't the goal here. Proving the technique is.
