# Done · smoke-paper

## What shipped
A three.js r186 smoke scene with a cream paper wall, a kraft desk, and a 6 cm torn-paper gator-green cutout with two eye holes standing 15 cm in front of the wall. It has two SpotLights: a low, close cyan phone placed by doc 02's formula, and a high amber lamp. `window.renderFrame(t)` is a pure function of `t`, and the edge boils at `floor(t*10)` with mulberry32. A puppeteer-core script renders it headless, measures the shadow scale from pixels, checks determinism and times frames. I also built the optional tissue lampshade test.

## Where it lives
- `smoke/paper/index.html`, `smoke/paper/scene.js` (scene, paper textures, lights, measure helpers), `smoke/paper/render.mjs` (run with `node smoke/paper/render.mjs`)
- `package.json`, `package-lock.json`: `three` 0.186.1 and `puppeteer-core` 25.14.0, exact pins. There's no server dependency because `node:http` serves the page.
- `evidence/smoke-paper/`
- Commits on `task/smoke-paper`: `54882b6` (deps), `978745d` (code + evidence), plus the commit for this note.

## How it was checked
All numbers come from `evidence/smoke-paper/render_log.txt` and `measure.json`, from the final run.
- [x] **Phone shadow about 3×.** See `phone_t0.5.jpg`. The computed scale is **3.000×**: the light sits 7.5 cm from the cutout along the center ray, and `d(light→wall)/d(light→cutout)` was solved for 3. The observed scale is **2.95×** in world terms (shadow 17.3 cm wide against a 5.9 cm cutout), and 2.54× in raw screen pixels (503 px against 198 px). The screen number is smaller only because the wall is 15 cm farther from the camera than the cutout. Both are within ±30% of 3×. To measure, I render with the cutout hidden from the camera but still casting, take the difference against a frame with no cast, and back-project the bounding box onto the wall plane.
- [x] **Lamp shadow is a small pool.** See `lamp_t4.0.jpg`. The computed scale is **1.048×** and the observed width is **1.16×** (6.7 cm against 5.8 cm), under the 1.3× limit. See the Gaps for how it reads.
- [x] **Torn edge and both eye holes in the shadow.** See `shadow_crop.png`, cropped from the real t=0.5 frame. Both eye holes are crisp, and the outline is irregular and wobbly, not a rectangle or a clean ellipse. The torn character of the edge is mild: it reads as lumpy more than ragged.
- [x] **Boil.** See `boil_strip.png` (t = 0.0, 0.1, 0.2 at full resolution around the cutout). The edge lumps and the bottom-corner silhouette visibly change between frames, while the eyes and the overall shape hold.
- [x] **Determinism.** See `hashes.txt`. Two renders of t=0.5 in one session are **IDENTICAL** (sha256 `0b04000c…7a9613`). The second render came after the lamp switch, measurements, 20 uncached boil seeds and the tissue test. Two separate `node` runs also gave the same hash.
- [x] **ms/frame.** See `timing.txt`: **2.5 ms** for render only (median of 20), **10.4 ms** when a new boil step rebuilds the canvas textures, and **149 ms** with PNG encoding and the transfer to disk. Capture is the cost, not the render.
- [x] **Paper or 3D/vector, my read after looking at every image.** The shadow sells it as real light, but the cutout and wall still read as clean 3D/vector, not paper. Details are under Gaps.
- [x] **Tissue (optional).** See `tissue.png`. The left half is the shade with the translucency term at 0 and the right half has it at 0.6, with the same bulb behind the shade in both. With the term off the shade is invisible against the navy, and with it on it glows with a hot spot that falls off.

## Gaps
- **Paper vs 3D, in detail.** At this framing the cutout is about 200 px wide, so the ±8 px texture tear becomes about ±3 screen px of gentle lumps. The 2–6 px fiber rim becomes a 1–2 px pale outline. Wall grain is barely visible. Under the phone the cutout looks like a glowing mint sticker. The lamp shot reads most like paper, because the dry-brush streaks and the rim show there. Likely fixes for wave 2:
  - a rougher, higher-amplitude tear scaled to screen size
  - a wider rim
  - visible paper tooth on the wall
  - depth of field, which I skipped
- **PCFSoftShadowMap no longer exists.** three r186 removed it: asking for it logs a warning and falls back. I use `PCFShadowMap`, which is now a soft Vogel-disk PCF, with `shadow.radius = 3`. Doc 04 §Lights still names PCFSoftShadowMap and should be updated.
- **customDepthMaterial is now largely redundant.** In r186, `WebGLShadowMap.getDepthMaterial` copies the mesh material's `alphaMap`/`alphaTest`/`map` onto whatever depth material it uses, including a custom one. So three already handles the doc 04 gotcha. I added `customDepthMaterial` as the brief asks. I found this by reading the source and did **not verify** it with a render that omits it.
- **Phone exposure.** A 3× shadow with decay 2 means the cutout gets 9× the wall's irradiance, which falls out of the geometry. I used ACESFilmic tone mapping and a low phone intensity (0.1). The spec was silent on tone mapping. The cutout still runs hot.
- **The lamp "pool" is mostly hidden.** A vertical flat cutout under a near-overhead light throws a short shadow behind and beside its base. From this low camera (about 10° down) it shows as a thin dark pool to the left of the base, not a pool around it. Making it read better needs a camera that looks down more, or a lamp set further to the side, decided per shot.
- **Desk.** The kraft desk top is the foreground in the lamp shot. In the phone shot it's black, because the phone grazes it. The separate front-edge strip at z = 0.42 is below the frame.
- **Shape and test rig choices.** I gave the blob a flattened torn base so it stands on the desk; a round blob touched at one point and read as floating. The cutout has a small tilt (doc 03: nothing is perfectly flat). The tissue test uses its own small amber "bulb" SpotLight inside the shade, not the lamp.
- **Bias was tuned by eye.** No acne and no detached shadow are visible in the stills, but I didn't run a systematic sweep.
- **Console noise.** The page console shows one 404, which is probably the favicon request. It's harmless and I didn't chase it.
- **Missing repo tools.** `tools/check_timeline.mjs` and `tools/determinism.mjs` don't exist yet, so I ran the determinism check inside `render.mjs`.
- **npm install.** It ran inside the sandbox with no override.

## State
built · 2026-10-15
