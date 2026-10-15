# Done · proxy-margin

## What shipped
Every proxy in `src/assets.js` is now drawn inside a transparent margin of 4 % of the long edge (256 px → 10 px, floor 8 px) on all four sides, so `makePaper` tears every edge. Shape proportions are unchanged. `sizes` is still the PIECES size. Frozen-art path untouched.

## Where it lives
- `src/assets.js` (`proxy()`), commit `73ab557`
- `evidence/proxy-margin/`: `proxies.jpg` (all pieces through makePaper, mod-film layout), `zoom.jpg` (corners at 200%), `s01_before_after.jpg`, `determinism.txt`, and the two evidence pages `proxies.html`, `zoom.html`

## How it was checked
- [x] `evidence/proxy-margin/proxies.jpg`: same layout as `evidence/mod-film/proxies.jpg`, every piece drawn as makePaper tears it. I looked at it: every edge of every piece is torn, thin ones (stem, mouth_line, pen) included. `zoom.jpg` shows top, left and bottom edges of six rect pieces at 200% (render at res 1024); the right edges are only visible in `proxies.jpg`.
- [x] `node tools/determinism.mjs --page=index.html --t=0.5,10,95,0.5` → determinism: PASS, all four times (`evidence/proxy-margin/determinism.txt`).
- [x] s01 same layout: `s01_before_after.jpg` (top before, bottom after, t = 0, 1.5, 3, 4.5, 5.9). Same framing and push, same window position. Mean luma difference of the two sheets is 2.3/255.

## Gaps
- **Shapes render about 7 % smaller when a shot passes `sizes[piece]` to `makePaper`.** `makePaper` maps the whole bitmap to `size`, and the bitmap now includes the margin (shape is 256 of 276 px on the long edge). I kept `sizes` = PIECES (the contract, and what real art does), so the margin eats into the size. A shot that wants the shape at exactly PIECES size should pass size × 1.08. I did not change the contract or add an export; say if you want one.
- **s01 doubles up, as expected.** Its local 4 % pad now stacks on this one: the facade is visibly a bit smaller (about 8 %) in the after strip. Layout and camera path are the same. I did not edit s01.
- The 404s in the page log are the `/assets/cut/*.boxes.json` probes for assets with no real art. They were there before this change.

## State
built · 2026-10-15
