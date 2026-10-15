# Done · lookdev-composite

## What shipped
`lab/lookdev.html` and `lab/lookdev.js` stage an apartment corner from the six v2_4 style-tile pieces in three depth layers: the navy wall with the calendar (z 0), the desktop with the lamp, laptop, gator and blob (z 0.04–0.2), and the painted desk front (z 0.33). The pieces come from `paperMesh`, the lights from `lights.js`, the ink from `blob.js` and the post from `post.js`.
- **0–5 s:** phone light placed by `placeForScale(scale 3)`.
- **At 5 s:** the lamp clicks on (cone, dust, bulb, bounce) and the phone goes dark.
- **6–10 s:** hold. The blob blinks at 7.4 s and 9.0 s and the dust drifts.
- **Post:** DOF focused on the blob, `night` LUT, grain 0.04. Edges boil at 4 Hz (held shot).

## Where it lives
- `lab/lookdev.html`, `lab/lookdev.js`: commit `4ffd409`.
- `evidence/lookdev-composite/`: `sheet.jpg`, `click_strip.jpg`, `phone.jpg`, `lamp.jpg`, `vs_reference.jpg`, `determinism.txt`, `timing.txt`, plus `measure.mjs`/`measure.txt` (shadow measured from pixels) and `timing.mjs`: commit `1f3aff6`.
- Cut parts are in `assets/cut/style_tile_v2_4_{1..6}.png`, local and not committed. I made them with `node tools/cut.mjs --in=/Users/ericzhang/code/media/looming/assets/raw/style_tile_v2_4.png --auto --out=assets/cut/`. The output was 6 islands, keyed `#FF00FF` and despilled. The parts are 1 wall, 2 desk, 3 calendar, 4 lamp, 5 laptop and 6 gator.

## How it was checked
I looked at every image listed here.
- [x] **Shadow ≈3× under phone, small pool under lamp.** `measure.txt` (`node evidence/lookdev-composite/measure.mjs`) back-projects changed pixels (blob casting vs not casting, props hidden) onto the wall and desk.
  - Under the phone, the wall shadow is **3.04×** the blob's width at t=1 and 3.03× at t=3. It reaches 14 cm up the wall and both eye holes show (`phone.jpg`).
  - Under the lamp there's no wall shadow at all. The pool on the desk is 8.2 × 1.8 cm, **1.4×** the blob's width, offset to the right of the blob (`lamp.jpg`).
- [x] **Painted pieces keep their painting and gain torn edges.** See `phone.jpg`, `lamp.jpg` and the bottom crops of `vs_reference.jpg`. The wall's dry-brush streaks, the shade's grain, the calendar grid and red circle, and the gator's hoodie are all intact. Every piece has a torn, boiling edge (the desk front's top tear is the clearest). Caveat: the Codex art already has a painted cream rim, and paper.js adds its own on top (see the verdict).
- [x] **Tissue lampshade glows when lit.** See `lamp.jpg` and the bottom middle of `vs_reference.jpg`. There's a warm hot spot inside the shade where the bulb sits, falling off toward the hem, and the torn rim catches amber all round. Under the phone (`phone.jpg`) the same shade is front-lit flat cyan with no hot spot.
  - Caveat: the glow comes from a dedicated small PointLight behind the shade (no shadow, 10 cm range), not from the key spot.
  - It reads as "warm, lit from inside", not as a strong glow.
- [x] **DOF gives a miniature read (moderate).** The blob is sharp. The wall, calendar and desk front are soft, and the gator, 11 cm behind the blob, is noticeably soft (`lamp.jpg`). The settings are aperture 0.09 and maxblur 0.01.
  - I tried 0.12, and it blurred the gator past recognition.
  - The miniature read is real but weaker than it could be, because the dark grade hides most of the out-of-focus planes.
- [x] **Two independent judgments recorded.** See below.
- [x] **Determinism passes; ms/frame recorded.**
  - `determinism.txt`: t = 1, 4.95, 5, 7.45 and 9.5 all PASS (same page, reverse order, fresh page). A grep for `Math.random`, `Date.now` and `performance.now` in `lab/lookdev.js` finds nothing.
  - `timing.txt`: about **15 ms/frame** to draw at 1920×1080 with post, synced on a 1 px readPixels. Each new 4 Hz boil step adds about **380 ms** for `makePaper` across 8 sheets.

### Judgment 1: paper or vector (my own read, before the side-by-side)
**Half paper, half vector. Lit surfaces read as paper. Anything dark or navy reads as a vector drawing with a torn stroke.** The lamp frame is the stronger of the two: glowing shade, hard amber pool, cone with dust, and a small black ink drop. That frame reads as a lit miniature. The phone frame sells the metaphor (the hollow-eyed ghost on the wall, with the gator standing in it), but it reads less as paper.

The top three things that break the paper read:
1. **Navy props on a navy wall collapse to their rims.** v2_4 painted the lamp arm, the lamp base and the laptop in the same navy as the wall. With equal value and hue, only the pale torn rim separates them, so they read as white line drawings, like a coloring book. It's worst under the lamp, where the arm is a pale outline around nothing. This is an art and palette problem in the tile, not a code problem.
2. **The rim reads as a stroke.** Codex's painted cream rim and paper.js's fiber rim stack into one even pale band, about 4–6 px, all the way round every piece. That band is continuous, the same width everywhere, and tinted by the light (cyan or amber). Doc 03 bans this "same procedural edge on every shape". In the reference, rims are bright white, thinner and broken.
3. **Light and ink shapes are CG-clean.**
   - Under the phone, the blob reads as a glass or gel bead: blue-grey body with a cyan fresnel rim.
   - The vellum cone is a smooth additive wedge that fades out in mid-air above the blob.
   - The phone throws a hard-edged geometric fan on a desktop that is a flat, untextured kraft sheet.

   These are the most "3D render" things in the frame.

### Judgment 2: side by side with `torn_paper_ref.jpg` (`vs_reference.jpg`)
The top row shows the reference next to `lamp.jpg`. The bottom row has three 1:1 crops: the reference, our shade, and our gator and laptop under the phone.

The reference's paper read rests on three things, and we're missing two of them:
- **Bright, broken white rims.** We have dimmer, continuous, light-tinted rims, softened by DOF.
- **Saturated shapes in contrasting hues on navy.** Our props share the wall's value and hue.
- **Visible fill texture.** We have this, and the wall's dry-brush holds up.

We beat the reference on what doc 03 says to add: depth, cast shadow, back-lit tissue and a motivated light. At reference brightness, our frame would read as the same family. In our dark grade it reads as a different, murkier film. The reference has no darkness at all, so it gives no guidance on how paper should look at night.

## Gaps
- **Brief conflict.** Out of scope says "Characters (only the blob appears)", but Inputs says to stand the v2_4 gator on the desk as a static prop. I followed Inputs, as the orchestrator also asked. It's mirrored to face the blob and isn't rigged.
- **paper.js cache thrash** (outside my owns). This held 10 s shot has 8 sheets × 40 boil steps = 320 entries, more than the 300-entry LRU. Replaying the frames in order misses on every boil step, so the warm pass is no faster than the cold one (`timing.txt`). A full 180 s shot would hit the same wall. paper.js would need a larger cap or a per-shot clear.
- **No phone prop.** The phone is only a light at desk height, 10 cm in front of the blob. Doc 03's "draw the light as an object" isn't met for the phone.
- **The click is a hard cut.** The phone goes off and the lamp comes on on the same frame (`click_strip.jpg`), with no flicker or warm-up. That's my choice: it gives a clean read of the small pool, so I didn't dim the phone.
- **Choices where the spec was silent.**
  - The lamp light is kept at 0.35 rad, from the brief.
  - Light intensities were tuned by eye: phone 0.3 with no distance cutoff, lamp 0.35, bulb 0.04, and a warm "bounce" hemisphere at 0.35 that comes on with the lamp. Without the bounce, everything but the pool was black.
  - The shade/arm split is a rectangle plus a brightness test on the lamp's art (x ≥ 96, y ≤ 258, red > 110). My first polygon cut off a sliver of the shade, which showed as a torn crack.
  - The wall piece is scaled up to 0.86 × 1.35 m to fill the frame, so its 331 px source is soft.
- **The blob's highlight follows one key light only** (mod-blob's `ponytail:`). That was fine here, because only one light is ever on.
- `assets/cut/style_tile_v2_4.boxes.json` isn't covered by `.gitignore` (only `assets/cut/*.png` is). I left it untracked.
- `measure.mjs` measures with every piece but the wall and desktop hidden, so props can't cover the shadow. The ratio comes from the blob's own silhouette width on its plane.
- I didn't run `tools/check_timeline.mjs`, because this task doesn't touch the timeline.

## State
built · 2026-10-15
