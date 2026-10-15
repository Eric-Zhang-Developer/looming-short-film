# Done · look-pass-2

## What shipped
- **Edge catch (`material.js`).** The backlit rim is no longer an even band.
  - Its width wanders along the edge, from 0.2 to 0.9 of the old ring.
  - It has long breaks over about two fifths of the edge.
  - It is brightest where it is thinnest.
  - The pattern is placed by the sheet's key and nudged by its boil seed, so it boils.
- **Ink (`blob.js`).** The room fill no longer reaches the body or its rim. The body is `PALETTE.ink`, shaded only by the key light's direction (1.0 down to 0.55). Its only gloss is the key's reflection, a faint wet edge on the key's side and the eye catchlights.
- **Cone (`lights.js`).** The cone draws only its far wall, at twice the strength. Its sides fade to zero by view angle, over a width that wanders.
- Contract notes are added to §material, §blob and §lights.

## Where it lives
- Branch `task/look-pass-2`. Nothing is pushed.

  | Commit | What |
  |---|---|
  | `0c8ced4` | `src/material.js` and §material |
  | `4c012c8` | `src/blob.js` and §blob |
  | `8af5876` | `src/lights.js` and §lights |
  | `4e9d653` | `evidence/look-pass-2/` |

- **Cut parts.** `assets/cut/style_tile_v2_4_{1..6}.png` were copied from the main checkout. They are local and not committed.
- I didn't change `lab/lookdev.js`.

## How it was checked
I looked at every image listed here. "Before" means `src/` at `554d7e7` (look-pass-1 merged), rendered fresh from the same scene and times.

- [x] **Shade rim at 200% varies in width and breaks.** See the top row of `rim_200.jpg`: before t=8, after t=8, and after t=8.25 (the next boil step).
  - **Before:** an even cream band, about 8 px at 200%, all the way around the shade.
  - **After:** the band runs from hairline to a few px, with dark gaps along the top edge and the left side. The t=8.25 tile shows the pattern shifting between boil steps.
  - The bottom row shows the same change in `lab/material`'s rim view (t=21). The before rim is an even amber line; the after rim is thin, uneven and broken.
- [x] **Blob is ink black with one key highlight and no grey cast,** in the phone state (t=3) and the lamp state (t=8). See `blob.jpg` (before and after phone, then before and after lamp, all at 200%) and `blob_measure.txt` / `blob_measure_before.txt` (`node evidence/look-pass-2/blob_measure.mjs`).
  - How the script works:
    - It finds the body with a mask: pixels that stay the same when the blob is rendered alone over two backgrounds.
    - It drops the key highlight, eyes and catchlights. Those are pixels above luma 40 in a pass with the ink colour and the fill zeroed, grown by 3 px.
    - It reports the body's mean RGB both raw and graded.

  | Frame | Before, raw | After, raw | After, max \|Δ\| vs `#0A0A0F` |
  |---|---|---|---|
  | Phone, t=3 | 38.7, 59.6, 80.4 | **11.3, 11.3, 15.5** | **1.3** |
  | Lamp, t=8 | 83.9, 62.2, 43.6 | **8.0, 7.8, 10.5** | **4.5** |

  - **Graded:** the night grade lifts `#0A0A0F` itself to (20.8, 25.2, 50.0). Against that, the graded body is within **1.4** (phone) and **5.7** (lamp). Before, it was off by 70.8 and 50.8.
  - Of the lamp-state cast, about 50 of the 60 points in red came from the cone's near wall drawn over the blob, not from the fill. I measured that with the cone hidden. So the cone fix is part of this item.
- [x] **Cone edge has no hard straight line.** See `cone_edge.jpg`.
  - **Top row** (lookdev t=8, 200%, before and after): the hard ruled edge is now a soft, slightly wavy fall-off.
  - **Bottom row** (`lab/lights` t=3, before and after): the same, from close up.
- [x] **Determinism passes** for `lab/lookdev`, `lab/material`, `lab/blob` and `lab/lights`. Every time PASSes on render, re-render and a fresh page (`determinism.txt`). A grep for `Math.random|Date.now|performance.now` in the three changed files finds nothing.
- [x] **`before_after.jpg`:** look-pass-1 code on the left, this branch on the right. The rows are phone at t=3 and lamp at t=8.
- **Re-rendered lookdev set:**
  - `phone.jpg`, `lamp.jpg` and `sheet.jpg` (t = 1, 3, 4.95, 5.5, 8, 9.5).
  - `measure.txt`: the wall shadow is still **3.05×** at t=1 and **3.06×** at t=3, so the blob's shadow is unchanged.

### Before and after, honestly
- **Blob.** This is the biggest change. It now reads as a black drop of ink with one highlight, and it is the darkest thing in the frame, as doc 03 wants. The cost is that it's less "wet": the body has almost no modelling, so the gloss reads from the highlight alone. In the lamp state, the faint key-side edge picks up an olive tint through the night grade.
- **Shade.** It no longer has a traced outline. The glow is broken and uneven, like fibres.
- **Cone.** It reads more as light and less as a polygon. Its sides are still straight in overall shape, because it is a cone, but they are soft.

## Gaps
- **The ink check is measured on the raw render, as the spec asks.** The graded frame can't meet "within 10 of `#0A0A0F`", because the `night` LUT (look-pass-1, `post.js`, not mine) lifts pure black to about (8, 11, 28). So I report graded numbers against `#0A0A0F` pushed through the same grade.
- **The cone no longer lays haze over things standing in it.** Before, the near wall added amber over the blob and over `lab/lights`'s puppet head. That was physically plausible in-scatter, but it was also the lamp-state cast.
  - **New hard line:** where the far wall meets the desk, there's a curved line inside the pool (bottom row of `cone_edge.jpg`). Before, the near wall drew a similar line further forward.
  - **Spec silent:** I treated the far wall as acceptable because it's curved, not straight.
  - **Alternative:** a depth-texture soft-particle cone would keep the haze in front, at the cost of a depth pre-pass.
- **Rim boil.** The boil seed nudges the rim pattern by up to 0.35 of a noise cell per step instead of reshuffling it, so the rim doesn't flicker at 4 Hz. That's my reading of "seeded by the boil seed so it boils too".
- **"Brighter where thinnest" is built in, but I didn't measure it.** It's a 1.7× to 0.8× gain tied to the width noise, visible as hotter thin stretches in `rim_200.jpg`.
- **The blob's body shading ignores the key's strength by design.** A dimly lit blob is as dark as a brightly lit one; only the highlight scales with the light. The fill still lights the eyes.
- **Small things I noticed but didn't fix:**
  - In the lamp state, the DOF pass bleeds a faint diagonal from the out-of-focus cone edge across the blob's lower left. Before has it too. It comes from `post.js`.
  - I didn't render `lab/blob`'s `?cam=close` view, because `render.mjs` rejects a query string in `--page`. I only looked at the default view (`lab/blob`, t = 0.5, 2.58, 3.5). The blob is black, its eyes and catchlights read, and the wall shadow is unchanged.
- **Not redone from look-pass-1's set:**
  - `vs_reference.jpg` (needs the reference video frame).
  - `click_strip.jpg`, `wall.txt` and `timing.txt` (nothing here changes timing or the wall).
- I didn't run `tools/check_timeline.mjs`, because the timeline is untouched. I didn't start a full-film render.

## State
built · 2026-10-15
