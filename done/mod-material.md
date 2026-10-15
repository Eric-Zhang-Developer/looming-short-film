# Done · mod-material

## What shipped
`src/material.js` implements the contract: `paperMesh(sheet, { translucency, edgeCatch })` and `updatePaperMesh(mesh, sheet)`. The material is `MeshLambertMaterial` patched with `onBeforeCompile`. It adds a back-light translucency term (doc 04 formula, divided by π like Lambert) and an edge catch: an 8-tap alpha ring finds pixels near a torn edge, and those pixels glow when lit from behind. Custom depth and distance materials are set. `lab/material.html` has the tissue and cardstock lampshades lit from inside by `lampLight` (translucency on and off), a cardstock cutout with three holes casting on a cream wall, backlit torn rims (edge catch on and off), and the same cutout under a PointLight.

## Where it lives
- `src/material.js`, `lab/material.html`, `lab/material.js`
- `evidence/mod-material/`: `tissue_on_off.jpg`, `rim_crop.jpg`, `shadow.jpg`, `alpha_shadow_test.txt`, `alpha_shadow_test.jpg`, `swap_check.txt`, `determinism.txt`, `checks.mjs` (run it from the repo root with `node evidence/mod-material/checks.mjs`)
- Commits on `task/mod-material`: `2301581` (code), `2bc5a9d` (evidence), plus the commit for this note.

## How it was checked
The lab's `t` picks the view: [0,5) shades on, [5,10) shades off, [10,20) shadow, [20,25) rims on, [25,30) rims off, [30,40) point light.
- [x] **Tissue glows from behind and cardstock barely does.** See `tissue_on_off.jpg` (`--sheet=1,6 --crop=280,260,1360,560`). The left pair is the shipped material: the tissue shade glows amber with a hot spot that falls off, while the cardstock body stays dark and only its rim catches. The right pair has translucency and edge catch at 0 (plain Lambert), and both shades are the same dull ambient brown.
- [x] **Backlit torn rim catches light.** See `rim_crop.jpg`, a full-res crop with a 1:1 cell, edge catch on above and off below. The pieces are about 445 px wide on screen. With the catch on, every torn edge carries a bright, irregular amber rim about 4–6 px wide, on cardstock and on tissue. With it off, the rim is a dark ~1 px line.
- [x] **Cutout shadow keeps the torn edge and the holes.** See `shadow.jpg` (t = 12 and 12.5, full-res crop). All three holes are open in the wall shadow and the outline is lumpy and torn, not an ellipse. Between the two boil steps the shadow's edge changes.
- [x] **The boil swap allocates no geometry.** See `swap_check.txt`. I rendered 48 frames (boil seeds 0–20) and compared `renderer.info` and object identity before and after. `memory.geometries` stayed at 3 and `programs` stayed at 2. The geometry and material uuids were unchanged, and the map uuids changed, which proves the swap happened. Textures went from 8 to 88, which is expected because paper.js caches each boil seed's textures. `updatePaperMesh` doesn't set `needsUpdate`, so the program isn't re-fetched.
- [x] **r186 native alpha shadows: YES.** See `alpha_shadow_test.txt` and `alpha_shadow_test.jpg`. The cutout writes no color or depth but still casts, so each frame shows only the wall and the shadow. I compared four modes: shipped, custom materials removed, a control with the materials removed and `alphaTest` 0, and no caster. For SpotLight (depth) and PointLight (distance), the shipped and removed frames are **pixel-identical**: same sha256, 0 px different. The control throws a solid rectangle that differs from shipped in about 261k and 272k px, so the test can tell the difference. The custom materials stay per doc 04 and the brief.
- [x] **Determinism.** See `determinism.txt` (`node tools/determinism.mjs --page=lab/material.html --t=1,6,12.05,21.3,26,32`). All six times PASS on render, re-render in reverse order and fresh page. `src/material.js` and `lab/material.js` use no clock and no `Math.random`.

## Rim width (re the "~1 screen px" report)
The edge catch widens the visible rim, but only when the light is behind. The ring radius is `max(EDGE_TEXELS · texel, EDGE_SCREEN_PX · fwidth(uv))`: 12 texels at 1024 px, but never under 6 screen px. So the lit band never shrinks below a few screen px however wide the framing. Both constants sit at the top of `src/material.js`. The same ring-sample trick could add a front-lit pale band with a screen-px floor. That's a material change worth a director call, because it would partly override paper.js's rim. I didn't do it.

## Gaps
- **The custom depth materials protect nothing on their own in r186.** Every shadow pass, `getDepthMaterial` copies `map`, `alphaMap` and `alphaTest` from `mesh.material` onto the custom materials. If a mesh's material had `alphaTest` 0, the custom material would cast a rectangle too. They would only matter if three stopped copying.
- **First version of the alpha test was blind.** It hid the caster on a layer only the shadow camera saw. r186's shadow pass tests layers against the *main* camera, so nothing cast and every mode reported IDENTICAL. The rectangle control caught it. `checks.mjs` now reports INCONCLUSIVE when a control matches.
- **PointLight shadows need `shadow.camera.near` set.** The default near of 0.5 m clips a tabletop set entirely: the lab's point shadow was missing until I set near to 0.01. Shots using point lights must set it.
- **The edge catch isn't scaled by `thickness`.** Torn fibers are thin even on cardstock, so cardstock rims glow when backlit. It also has no 1/π, so the rim is brighter than a translucent body; I chose this so the rim reads as glowing. The spec was silent on both.
- **The lab's "off" state turns off translucency and the edge catch together.** That's the plain-Lambert baseline. The rim view isolates the edge catch alone.
- **Translucency is shadowed.** `directLight.color` already carries the shadow, so anything between the light and a sheet darkens its glow. That's physically right and useful for shadow-through-tissue shots. I checked that `normalBias` 0.002 on a backlighting SpotLight doesn't self-shadow the back term (tissue pixel 120,57,7 both ways, scratch test, not committed). I didn't test DirectionalLight (dawn and fluorescent use normalBias 0.002).
- **Contract defaults kept.** Translucency is 0.8 below thickness 0.5, otherwise 0.05; edge catch is 0.6. Lab light intensities were tuned by eye under NoToneMapping.
- **The cutout's front-lit pale edge in `shadow.jpg` is paper.js's fiber rim, not the edge catch.** The catch is 0 there, because the light is in front.
- `tools/check_timeline.mjs` wasn't run because this task doesn't touch the timeline.

## State
built · 2026-10-15
