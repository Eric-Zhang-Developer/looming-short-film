# Done · anim-s01

## What shipped
`src/shots/s01.js` blocks the 6 s opening. It's a backlit paper diorama of torn tissue sky bands, two navy skylines with a clock-tower peak, the apartment facade with one torn window hole and a cross-mullioned tissue pane, and an oak branch with tissue moss in the top-left. The camera makes one eased push from the skyline into the window. The dawn key warms from k 0.10 to 0.25, the DOF tracks the facade plane and the boil runs at 10/s. Every asset is a proxy (nothing in `assets/frozen/` yet). Each one swaps for frozen art with no code change.

## Where it lives
- `src/shots/s01.js`, commit `759ee59`
- `evidence/anim-s01/`: `strip.jpg`, `sheet.jpg`, `t0_00.png`, `t5_50.png`, `rim_crop_t0.jpg`, `rim_crop_facade_t0.jpg`, `window_luma_t5_50.txt`, `window_t5_99.txt`, `determinism.txt`

## How it was checked
Brief:
- [x] Strip: `node render.mjs --page=index.html --strip=0:5.95 --cols=8 --out=evidence/anim-s01/strip.jpg` gives 144 frames, every frame of the shot. I used 5.95 and not 6 because t = 6.0 is s02's first frame. The shot has no beats or poses, so `sheet.jpg` (0, 1.5, 3, 4.5, 5.99) is the one-frame-per-key-moment view. I looked at both. The push is continuous, the branch is out of frame by ~1 s and the window grows steadily.
- [x] Two full-res stills: `t0_00.png` (the establishing skyline) and `t5_50.png` (the window). These are the shot's two key moments.
- [x] Shadow scale: n/a. There is no blob in s01 and the spec gives no target.
- [x] Determinism: `node tools/determinism.mjs --page=index.html --t=0.5,4,10,0.5` passed at all four times. t = 10 is in s02. Output is in `determinism.txt`.
- [x] Readability: from the strip alone, a cold viewer would see a cut-paper town at the cold end of night, with a tower on the skyline, and the camera picking out one building's single glowing window. "This window is where the story lives" reads. "Early morning" reads only weakly, because at k 0.10–0.25 the sky is cold lavender with no visible rose, so it could pass for dusk.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`

Spec acceptance (`docs/shots/s01.md`):
- [x] Contact sheet at 0, 1.5, 3, 4.5, 6 shows one continuous push. At 5.99 the window (hole plus lit rim, pixels with luma above 90) spans y 221..875, which is **61 % of frame height**, above the ≥ 45 % target (`window_t5_99.txt`; the 5.99 still was rendered to a temp dir to measure and not kept). 6.0 itself is s02, so I used 5.99.
- [x] Window brightest at 5.5 s: all of the six brightest 40 px blocks sit inside the window's box (x 756..1225, y 261..869). The rest of the frame is unlit navy facade (`window_luma_t5_50.txt`).
- [x] No legible text or signage: the proxies are flat silhouettes and the skyline is a procedural roofline (sheet and stills).
- [x] Lit torn rim on every cardstock layer at 0.0 s: `rim_crop_t0.jpg` shows the far skyline and tower and the near skyline, and `rim_crop_facade_t0.jpg` shows the facade top. The oak branch rim is visible in `t0_00.png`. The rims are broken in long stretches. That comes from material.js's designed edge-catch gaps, not from shadow.
- [x] `node tools/determinism.mjs --t=0.5,4` passed (run above, with `--page=index.html`).
- [x] Skyline doesn't shadow the window: traced back toward the key, the ray from the window center crosses the near skyline's plane at y 0.35 (its tops are at most 0.15) and the far skyline's plane at y 0.36 (its tops, tower included, are at most 0.23). The pane in `t5_50.png` is evenly lit.

## Gaps
- **All art is proxy.** The facade, skyline and branch come from `assets.js` proxies. In-file shims:
  - The skyline proxy is a flat rectangle, so s01 draws a seeded procedural roofline path (flat and pitched roofs, canopies, one tower) when `proxy` is true.
  - The facade proxy is kraft, so it is restocked Night Navy when `proxy` is true. The spec wants the front near navy.
  - The window hole is punched in code. That also works on real art.
- **Proxies can't tear.** Rectangular proxies and RECT paths fill their canvas edge to edge, which leaves paper.js no edge to tear. They rendered as ruled straight lines. s01 pads them with a 4 % transparent margin (`torn()`, `tornArt()`). Other shot builders will hit the same thing. A fix inside `assets.js` proxies (mod-film's file) would cover every shot.
- **Spec deviations (spec silent or contradictory):**
  - The three sky bands share one tilt. Separate ±1.5° tilts on 1.8 m planes swing their edges ±24 mm, which cuts through the 4 mm gaps and showed a straight intersection line.
  - `skyline_far` and the tissue pane have `castShadow = false`. At the spec's 5° key, the far layer's shadow covers the whole back of the near layer, which killed its rim (an acceptance item). The pane's hard shadow killed the window hole's lit rim. The sky bands also cast nothing, because the key sits behind them.
  - The pane is 0.068 × 0.088 rather than 0.06 × 0.08, so the torn hole never shows a gap. The hole sets the visible size.
  - The mullions are straight-cut strips: torn 4 mm strips pinched through.
  - The moss is four procedural tissue strands. `PIECES` has no moss piece. They lag the sway through `definePuppet` / `follow` (k 6, w 18). The lag is barely visible at ±0.6°, as specified.
  - `dawnLight().update` sets its own position, so s01 overrides it after every update with the spec's (−1.2, 0.5, −1.5). The shadow camera is widened to ±1.1 m.
  - The LUT is `'night'` (the spec doesn't name one). DOF uses the default aperture, so the skyline is soft from frame 0.
- **Not built:**
  - No plane curl, only tilt. A curl would need bent geometry.
  - The tower's pointed cap reads as a steeple more than a clock tower at proxy size.
- **Spec note:** the "Matching" section puts the window at frame center-right at the end, but the spec's own end camera looks straight at it, so it lands at center. I followed the camera numbers. The s02 calendar handoff should still work, but it isn't checked.
- **Look, for the director:** the frame is dim and cold all the way through. The pane reads grey-lavender (luma ~100), not glowing. That's what k 0.10–0.25 through `dawnLight()` gives at default translucency. A warmer or brighter key would help "dawn" read, but it's a spec change.

## State
built · 2026-10-15
