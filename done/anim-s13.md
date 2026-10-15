# Done · anim-s13

## What shipped
s13 blocked for the animatic: one locked top-down shot (fov 20, camera (0, 0, 1.60) looking down, framing x ±0.50 / y ±0.28) of a 5 × 3 desk grid on a procedural `marston_floor`. The hero is built from `top_figures_sheet` hero parts (body, arms, tail, head on a neck pivot, backpack) with `face_sheet` eye swaps. Ten crowd figures use `seated_1..6`. Each occupied desk gets the same rig: a phone cutout, a cyan screen and glow decal, a `createBlob`, and an ink shadow decal cut from that blob's own field with soft edges and eye holes. The hero lifts his head, looks at the Sleeper, then Drinks, then the Freshman as each phone wakes and its shadow springs up. After that the six generic desks wake. Everything is proxy art, because no frozen art exists for these sheets.

## Where it lives
- `src/shots/s13.js`
- `evidence/anim-s13/`: `sheet.jpg`, `strip.jpg`, `strip_1.3-2.0.jpg`, `strip_2.3-3.0.jpg`, `strip_3.3-4.0.jpg`, `t89_90.png`, `t92_50.png`, `crop_freshman_4.5.jpg`, `measure.html` + `measure.mjs` → `measure.txt`, `determinism.txt`
- Commits on `task/anim-s13`: `0c87b39`, `7a2ef11` (plus this note)

## How it was checked
Brief:
- [x] Strip: `node render.mjs --page=index.html --strip=88:94.75 --fps=4 --cols=8 --out=evidence/anim-s13/strip.jpg` (28 frames, about one per beat and key pose). I used `--fps=4` because the brief's command at the default 24 fps gives 169 frames, not "~1 per beat". I ended it at 94.75 because a frame at 95.0 is s14's stub. Looked at it.
- [x] Two full-res stills: `t89_90.png` (local 1.9, head turned to the Sleeper, whose shadow is up) and `t92_50.png` (local 4.5, holding on the Freshman).
- [x] Shadow scale measured from pixels (`measure.txt`). Each decal and its blob is rendered alone on white, back-projected to its own plane and measured across the decal axis. At local 6.5 every desk is within 0.2–1.5 % of target: hero 7.16× (target 7.1), Freshman 9.10×, Drinks 7.10×, Sleeper 5.01×, G1–G7 3.01–6.06×. Length ÷ width is 1.42–1.52 (spec 1.5). Every decal has 2 eye holes. G1 at local 4.5 reads 2.47× and is labelled growing: it woke at 4.4.
- [x] `node tools/determinism.mjs --page=index.html --t=89.6,92.5,100,89.6` → `determinism: PASS`
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`
- [x] Readability (below)

Spec acceptance:
- [x] 1. `sheet.jpg` at 0.2 / 1.0 / 2.0 / 3.0 / 4.0 / 6.5. At 0.2 only the hero's desk has a glow and a shadow; his 7.1× decal points NW. By 6.5 all 10 crowd desks have both, and d3/d6/d10/d13 have neither. Caveat: at 0.2 the hero's fill dimly lights the neighbouring desks (it carries no glow or shadow of theirs).
- [x] 2. The cropped strips show the same order for each featured desk: the phone lights over 2 frames, then the shadow grows over 0.5 s, then his head turns. Turns start at 1.6 / 2.6 / 3.6, 0.2 s after wakes at 1.4 / 2.4 / 3.4. The 2.4 wake falls between frames, so the frame at 2.375 shows the Drinks glow at 20 %.
- [x] 3. `crop_freshman_4.5.jpg`: the Freshman's decal is the largest by scale (9×), and both eye holes are visible in the composite. The Freshman's figure is the smallest (seated_6 at 0.80). By absolute width the Freshman's decal (20.5 cm) and the Drinks decal (20.5 cm) are equal. That is in the spec's own numbers (0.020 × 9 ≈ 0.026 × 7).
- [x] 4. Covered by a logged table rather than a crop image (`measure.txt`): all 10 crowd figures are unique on pose + mirror + turn + scale (10/10). The proxies are identical ellipses, so a crop comparison wouldn't show anything until real art arrives.
- [x] 5. The camera is set once in `build`; `update` never touches it. No text anywhere: proxies, glyph-free floor grid, blank pages.

**Readability:** From the strip alone, a cold viewer sees one figure lift its head in a dark room as phone glows appear desk by desk, each with a big ink blob-shaped shadow, until every occupied desk has one. That reads as "everyone here has one". The hero is findable as the only lit desk at the start and the centre of the grid. His head turns are small at full frame (proxy head with no snout), so "he notices them" depends on timing more than pose.

## Gaps
- **Lighting deviates from the spec (needs a director/spec call).** With only `ambient()` at 0.3× and decals, the frame rendered black and the ink decals were invisible on the dark floor (first sheet render). I added one **unshadowed cyan PointLight per phone** at z 0.2. Each sits 0.4 of its shadow's length along the shadow and reaches 0.75 × length + 0.2. Hero 0.16 cd, crowd 0.14, stepping on with the phone. No light casts a shadow map, so "a decal per desk, not a light" still holds for shadows. Ambient stays at 0.3×.
- **Decals sit at z 0.0325 (desk-top plane), not z 0.001 as the spec says.** On the floor the 3–9× shadows run under neighbouring desks, which hid the Freshman's eye holes. Parallax is ≤ 8 mm at frame edge.
- **The decal reuses `blob.mesh.customDepthMaterial.onBeforeCompile`**, which isn't in contracts.md, and regex-patches its discard into a soft edge. It throws loudly if blob.js changes. Suggested contract addition: `blob.silhouette({ soft })` → Material.
- **Spec/asset conflict, figures:** the spec wants 9 distinct crowd poses plus 1 mirrored; `top_figures_sheet` has 6. G4, G5, G6 and G7 reuse seated_1/2/4/5 mirrored, with their own turn and scale.
- **Spec geometry collision:** back-to-back occupants in the same column (d2 N-facing at y 0.08 / d7 S-facing at y 0.05; d9 / d14) sit 3 cm apart with 5–7 cm figures, so their figures overlap and read as one. I left it as specified; restaging needs a spec change (README §8 already floats restaging s13).
- **The phone corner isn't in the spec.** I mirrored the hero's (+0.030, −0.020) into each occupant's frame. Drinks' phone is on its left, so its shadow falls SW toward the hero instead of across the Freshman's eye holes.
- The blob has no `side` or `gasp` eyes (blob.js supports open/closed/worried), so the hero's blob `side` 1.6–5.0 renders as `open`.
- The LUT `act2b` doesn't exist in post.js; I used `marston` (the Act 2b grade).
- Desaturation (0.55 → 0.75) is a material colour multiplier computed for gator green. It is exact on the proxies and approximate on painted art.
- Chairs aren't drawn: the spec puts them inside the desk_top art, and the proxy has none. G2's headphones and the Sleeper's head-on-textbook can't show on ellipse proxies.
- Hero glow strength: I read "1.0 (which carries s12's dim of 0.6)" as glow opacity 1.0. The fill is the darker of the two by choice.
- Not verified: how this looks with real `top_figures_sheet` / `top_props_sheet` art (none frozen yet); the cut to and from s12 and s14 (neither built).

## State
built · 2026-10-15
