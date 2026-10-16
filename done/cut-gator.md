# Done · cut-gator

## What shipped
The Student is now built from the frozen `gator_sheet` (v2_1) and `face_sheet` (v1_3) in every shot, with no placeholder shapes. The side rig is fitted part by part to the sheet's own side figure. The front and back views and the ¾ head use the painted reference figures, and the eyes and mouths sit on the head at the measured face scale. The loader now cleans the yellow-green alpha fringe. The rig API is unchanged and no shot file was edited.

## Where it lives
- `assets/cut/gator_sheet.boxes.json`, `assets/cut/face_sheet.boxes.json`: 0da7ac9
- `src/characters/gator.js` (fit, faces, tint, head34) and `src/assets.js` (gator_sheet/face_sheet PIECES, despill, a clear error when a cut PNG is missing): 6f96efb
- `evidence/cut-gator/turnaround.{html,js}`, `halo.txt`: fbd5275. `turnaround.jpg`, `shots.jpg`, `halo.jpg`: 18fd996. `extras.jpg`, `s13_eyes.jpg`: bb7f44e
- The cut PNGs are gitignored. Regenerate them before rendering, or the loader throws:
  `node tools/cut.mjs --in=assets/frozen/gator_sheet.png` and `node tools/cut.mjs --in=assets/frozen/face_sheet.png`

## How it was checked
- [x] **`turnaround.jpg`.** Cell 1 is the frozen turn_side. Cells 2–5 are the rig at the same camera: side, ¾ (head34), front and back. Cells 6–11 are the six eye swaps (open, closed, tired, gasp, worried, side) with all four mouths. Cell 12 is the front pair (tired), cell 13 is seated `press`, and cell 14 is the proxy Freshman and the roommates. I looked at it: the side view reads as the sheet's figure.
- [x] **`shots.jpg`.** Frames at t = 16.5, 37.0, 74.0, 100.45, 120.0 and 165.0 (s03, s06, s11, s15, s16, s18), `--w=480`. Every one shows the cut gator.
- [x] **`halo.jpg`.** The top row is the cut head piece unlit on navy at about 4.3× (cut.mjs on the left, loader on the right). The bottom row is the same edge through paper.js at 4× canvas (before and after the despill). `halo.txt` has the numbers per piece for the fringe (16 ≤ α < 128), e.g. snout `rgb(157,168,125)` → `rgb(227,225,195)`, and head `rgb(165,173,132)` → `rgb(228,224,193)`. Pixel counts are unchanged.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`
- [x] `node tools/determinism.mjs --t=100.45,108.6` → `86d086a6154977ab` ×3 PASS, `728734d12613eb1b` ×3 PASS, `determinism: PASS`
- [x] **Done note ends with `## Story`.**
- **Other shots, at one frame each, viewed in scratch.** s02, s04, s05, s07, s08, s09 ×2, s10, s12, s13, s14, s17 all build and render. The frames I kept as evidence are in `extras.jpg`: s10 at 68.0, s14 at 98.5, s15 at 108.6 and 111.0, s17 at 155.0, and s18 H at 175.0.

## Gaps
- **He is no longer the 8 cm gator.** K is set so that hip to shoulder is 0.030, the number the desk unit's hand paths hang off. At that scale the sheet's big head puts the head top at hip + 0.0775 and the eye at hip + 0.066. That means 9.3 cm standing, and a seated eye at desk y ≈ 0.054 against README §2's estimate of 0.030. **README §1's "2.5× blob looks him in the eye" (its eyes at 0.032) no longer holds.** The 8 cm, eye-height and HIP numbers in `docs/shots/README.md` need a doc pass. That is not my file.
- **Stubby boots.** HIP is now 0.0154 (it was 0.0294), with the foot model re-measured from the cut boot. Seated feet dangle higher.
  - The walk poses in `poses.js` are unchanged. By my calculation from the hipHeight foot model, these boots can span at most about 0.009 m per step, while s09/s18 move 0.024. **The feet slide.** It isn't visible in the frames I checked: s09 is tiny, and in s18 G his feet are below frame. Not verified frame by frame.
- **s15 Camera B: the snout reaches the 2.5× blob.** At 111.0 the teeth touch its top-left (`extras.jpg`). The head sits behind the body plane (z −0.0035), so the blob draws in front of it.
- **s13 broke a little.** It reads `face_sheet` pieces directly. The top-view hero's eye is now one painted disc, 1.4 cm across, where the proxy drew a pair (`s13_eyes.jpg`, right). s13 needs a top-view pair. `crowd.js` heroTop has the same single-eye slot.
- **Despill lives in the loader, not in `tools/cut.mjs`, because cut.mjs isn't mine.** It applies to every frozen sheet.
  - My first version filled every α < 255 pixel from the nearest opaque one. That made the rendered edge more olive, because the painted cream rim is itself partly transparent. The shipped version fills only α < 128.
  - In renders the difference is about one pixel (halo.jpg, bottom row), because paper.js already cuts at 0.5. The olive streaks that remain come from paper.js thinning the painted rim, not from the fringe.
  - Moving the despill into cut.mjs's alpha branch would be cleaner.
- **No split hand.** The s15 pen rides the hand group at the mitten tip, and 108.6 shows it held (`extras.jpg`).
- **Faces.**
  - The mouths are the face sheet's, as measured, and 30–45% wider than the painted smile (asset-face-sheet's gap). The `o` mouth sits on the jaw.
  - The front pair is built from the single eye takes, with the right eye mirrored. The painted `eyes_front_open` is cut but unused.
  - The front mouth sits on the painted jaw seam, over the painted teeth.
- **The jaw doesn't fully close at the snout tip.** Thin slivers of background show between the teeth there.
- **The arms are longer than the figure's** (ARM 0.032 kept). The sleeve top starts about 9 mm above the sheet's.
- **Freshman and roommates are still proxies** (their sheets aren't frozen). They build. The Freshman's proxies now follow the new side layout (`turnaround.jpg`, cell 14).
- **A stale comment in s18.** Its comment about the head at z 0.003 covering the pocket is out of date. The H cheat still works (175.0).
- **`lab/characters.js` isn't mine.** It renders the new rig, but its frames weren't checked.

## Story
I expected to cut the sheet, flip the loader to real art and nudge some pivots. The first grid overlay of the side figure changed that plan. The cut parts aren't the figure taken apart. The sleeve piece is about twice as long as the figure's arm, the snout piece is 1.45× too big, and the head cap is 1.1× too big. So each part needed its own scale.

Then came the real decision. The rig's numbers came from a proxy with a small head and long legs, and the sheet has a huge head and stubby boots. No single scale matches both. I pinned the scale on hip-to-shoulder = 0.030, because every desk shot's hand path depends on it, and let the gator come out 9.3 cm tall instead of 8.

To iterate without Chrome, I wrote a throwaway ffmpeg compositor that laid the pieces over a ghost of the figure. In the first pass (v0) the head floated above the hood. Putting the head behind the body fixed it in one move, and the hood then wraps the neck as painted.

The despill taught me something. My first version made the rendered edge worse. The cream rim Codex painted is half-transparent itself, so filling from opaque pixels pulled green outward. I limited the fill to the part paper.js throws away anyway. Honestly, its effect on screen is about a pixel. The numbers in `halo.txt` show it working; `halo.jpg` shows how little it matters.

The six shots came back on the first full render (`shots.jpg`). s13's single-eye regression only showed up because I went looking (`s13_eyes.jpg`).

## State
built · 2026-10-15
