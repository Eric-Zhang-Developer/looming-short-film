# Done · look-pass-1

## What shipped
- **Rims.** `paper.js` takes `rim: 'auto' | 'none' | 'broken'`.
  - `'broken'` is a thin, near-white rim that varies in width and has long breaks.
  - `'none'` adds no rim. If the art already has a painted pale rim, paper.js thins and breaks that rim instead.
  - `'auto'` (the default) chooses `'none'` when paper.js finds a painted pale rim, and `'broken'` otherwise.
- **Plain stock.** Plain stock fills (no art) now get mottling and dry-brush streaks.
- **Cache.** The sheet cache is now capped by texels instead of entries, and it holds a whole 10 s shot.
- **Lights and grade.**
  - The lamp's vellum cone runs past its target, so the desk cuts it off exactly at the pool.
  - `phoneLight` takes a `penumbra` option.
  - The `night` LUT is lifted.
  - Lookdev uses a cool fill in navy's own hue.

## Where it lives
Branch `task/look-pass-1`. Nothing is pushed.

| Commit | What |
|---|---|
| `cb74e72` | `src/paper.js` and contracts §paper |
| `96c8ccc` | `src/lights.js` and contracts §lights |
| `79ca9fc` | `src/post.js` and contracts §post |
| `2505d50` | `lab/lookdev.js` and `evidence/look-pass-1/` |
| `73574cb` | `src/paper.js`: per-edge-point painted-rim detection (the first version called the gator rimmed) |
| `a094e8d` | All evidence re-rendered after that fix |

Cut parts are in `assets/cut/style_tile_v2_4_{1..6}.png`. They are local and not committed. I made them with:

`node tools/cut.mjs --in=/Users/ericzhang/code/media/looming/assets/raw/style_tile_v2_4.png --auto --out=assets/cut/`

For `lab/paper`, I copied `style_tile_v1.png` into the worktree's gitignored `assets/raw/`.

## How it was checked
I looked at every image listed here.

- [ ] **No constant-width rim anywhere: partial.** See `rim_200.jpg` (200% crops) and the bottom row of `before_after.jpg` (lamp base: before on the left, after on the right).
  - **Pass:** every rim paper.js makes or reshapes now varies in width and breaks. This covers the lamp base and arm, the laptop's outer edge, the desk front's top tear, the gator and the `lab/paper` swatches. The old even 4–6 px band is gone.
  - **Fail 1:** the tissue lampshade still has an even glowing band where it is backlit. That band comes from `material.js`'s edge catch (a fixed 12-texel ring), not from paper.js. `material.js` is outside my owns; see Gaps.
  - **Fail 2:** the laptop's hinge line is a cream band painted inside the art, not a rim. Only new art can change it.
- [x] **Wall visible across the frame in both states; the loom shadow still reads at ≈3×.**
  - Shadow: `measure.txt` gives **3.05×** at t=1 and **3.04×** at t=3, with both eye holes visible (`phone.jpg`).
  - Brightness: `wall.txt` measures mean luminance over 12×6 tiles above the desk.

    | Frame | Darkest tile, before → after | Median tile, before → after |
    |---|---|---|
    | Phone | 7.9 → 25.6 | 15.1 → 52.0 |
    | Lamp | 7.3 → 21.6 | 9.0 → 26.8 |

    Navy now reads as a saturated colour everywhere (`before_after.jpg`, `vs_reference.jpg`), and the only near-black is the loom shadow.
  - **Caveat: the wall's texture is still faint, and I couldn't measure it.** In plain-wall tiles, `wall.txt`'s 5–40 px texture term is 0.5–0.6 before and 0.7–1.3 after. That is about the level the post's film grain leaves after the blur, so it can't confirm the texture. By eye, the dry-brush streaks show across the wall in both frames, but only weakly (`phone.jpg`, `lamp.jpg`, top right of `vs_reference.jpg`). The limits are the DOF blur on the wall plane and the wall art itself: 331 px stretched to 1.35 m.
- [x] **Cone reaches the pool; desk is textured paper.** See `lamp.jpg` and the middle row of `before_after.jpg`.
  - The cone used to fade out above the blob. Its slanted end also hung in mid-air, because the cone stopped at the target instead of at the desk. Its edge now lands on the back of the pool.
  - The desktop and desk front show kraft mottling and streaks.
  - The phone's fan on the desk is a soft fall-off rather than a hard-edged wedge (`phone.jpg`).
- [x] **The second pass is measurably faster.** From `timing.txt` (`node evidence/look-pass-1/timing.mjs`), over 240 frames:

  | Pass | Total | Boil-step frames (mean) | Chrome RSS after |
  |---|---|---|---|
  | Cold | 21.5 s | 465 ms | 0.97 GB |
  | Warm | 3.8 s | 25 ms | 0.90 GB |

  The warm pass is **5.7× faster**. Before, the warm pass was no faster than the cold one (`evidence/lookdev-composite/timing.txt`).
- [x] **Determinism passes** for `lab/lookdev`, `lab/paper`, `lab/post` and `lab/lights` (`determinism.txt`). A grep for `Math.random`, `Date.now` and `performance.now` in the four changed files finds only a comment in `paper.js` that says "no Math.random".
- [x] **Honest paper-vs-vector read:** see below.

### Paper vs vector: before and after
- **Before:** half paper, half vector. Lit surfaces read as paper. Anything navy read as a vector drawing with a torn stroke, inside a murky dark grade.
- **After:** mostly paper wherever the code decides the look.
  - Side by side with the reference (`vs_reference.jpg`), the night now sits in the same family. The navy matches closely, the wall reads as painted stock, and the desk reads as kraft.
  - Rims break and vary instead of tracing every shape.
  - The lamp reads as one object of light, from shade to cone to pool.

**What still reads as vector or CG, by cause:**
1. **Art (only new art fixes these).**
   - The lamp arm, lamp base and laptop are painted the same navy as the wall. With equal hue and value, they read as outlines around nothing, worst under the lamp. My broken rims make them read as dotted outlines rather than solid ones, but they are still outlines. (Director's G1 call.)
   - The laptop's painted hinge band reads as an even stroke.
   - The wall is a 331 px source stretched to 1.35 m, so its dry-brush streaks are low-resolution and soft.
   - The reference's rims are bright white because they're painted white. Ours take the light's colour (lavender, cyan or amber) because they're lit paper. That's correct for a lit diorama, but it reads less "torn white fibre".
2. **Rig, outside my owns.**
   - `material.js`'s backlit edge catch draws a constant-width glowing band around the tissue shade.
   - The blob now reads as a grey-lavender glass bead, more than before. `blob.js` adds the scene's hemisphere fill into its fresnel rim (`env = uAmb * fres`), so the brighter cool fill lights its rim. Doc 03 wants glossy black ink.
3. **Rig, mine and still open.** The vellum cone is softer and frosted, but its sides are still the straight lines of a mesh cone.

## Gaps
- **`material.js` needs a change** (contract `mod-material`, not mine): the edge catch should vary along the edge, as paper.js's rims now do. For example, it could read a rim mask that paper.js would export, or modulate the 8-tap ring with noise. Until then, backlit tissue keeps an even glowing band.
- **`blob.js` greys out under the brighter fill.** Its ambient and fresnel term reads every HemisphereLight, so the night fill that keeps the wall navy also greys the ink. Possible fixes are a `blob.js` change (cap or tint `uAmb` in the rim) or a fill the blob ignores. I didn't take the second, because it relies on the blob's one-key-light shortcut.
- **Defaults I changed, and why.**
  - `paper.js`: the rim is now `'auto'`, because the old even band was the doc 03 violation. Plain fills got mottling, because the old grain mipmapped away.
  - The `night` grade is lifted; the brief asked for it, and only lookdev and `lab/post` use it.
  - `lampLight`: `reach` is now 2.5 and the cone strength went from 0.07 to 0.1. This changes the cone in `lab/lights`, `lab/material` and `lab/puppet` too. I looked at `lab/lights`: the cone now meets its pool on the desk. I didn't re-render `lab/material` or `lab/puppet`.
- **Contract additions:** `rim` in §paper (with a cache-key note), `phoneLight({ penumbra })` and `lampLight({ reach })` in §lights, and a note on the `night` grade in §post. I didn't touch §puppet.
- **Cache memory has a ceiling.** The 256 M-texel cap holds this 10 s shot (about 230 M texels). A 25 s held shot at 4 Hz (s17, about 575 M texels with 8 sheets) won't fit and will replay cold. The `ponytail:` note in `paper.js` names the fixes: a single-channel alpha, or a per-shot clear. I measured RSS only for this one shot; GPU memory on macOS may not show up in RSS.
- **Painted-rim detection is a heuristic.** Each edge point walks inward along its normal. The art counts as rimmed when at least 60% of points are ≥0.12 lighter at the edge than half a tear band further in.
  - I verified it in the page by checking whether `'auto'` renders the same as `'none'` for each piece. Wall, desk, laptop and lamp arm resolve to `'none'` (painted rim found). Gator, calendar and lamp shade resolve to `'broken'`.
  - The first version averaged whole pixel rings. It called the gator rimmed because its cream hoodie touches the edge. Commit `73574cb` fixed that.
  - The calendar and shade are cream right to the edge, so their broken white rim barely shows.
  - I didn't test the rule on other art.
- **The gap noise is seeded by key**, so the breaks hold still and only a small part boils. That was my choice: it follows the edge-wobble pattern, so the silhouette doesn't flicker.
- **`before_after.jpg` and `vs_reference.jpg` layout.**
  - `before_after.jpg`: the left column is the old frames, the right column is the new ones. The rows are phone at t=3, lamp at t=8, and a 200% crop of the lamp base.
  - `vs_reference.jpg`: the top row is the reference beside the new lamp frame. The bottom row is 1:1 crops of the reference, our shade, and our gator and laptop under the phone.
  - The old phone and lamp stills' times weren't recorded. I matched them by eye and by `measure.txt`'s t=3 and t=8.
- I didn't run `tools/check_timeline.mjs`, because this task doesn't touch the timeline. I didn't start a full-film render.

## State
built · 2026-10-15
