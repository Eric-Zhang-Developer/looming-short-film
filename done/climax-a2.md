# Done · climax-a2

## What shipped
The climax, built for the director's Q16/Q17 answers (blob 2.5×, r 0.030; the light at the door is his nightstand lamp, not a night-light).
- **s09b, the door (6 s).** A paper-theatre cutaway: his room with the lamp low in the foreground, his door, and the hall running away to the front door. When the door opens, the blob's shadow fills the end wall with two eye holes around the front door.
- **s09c, the walk (20 s).** Five lampposts on the pulse. The shadow is long between lamps and pulls under his feet on each lamp beat. The blob blocks him, he steps around it, and Marston appears.
- **s10, the threshold (8 s).** He pushes through the glass doors under the warm panel, and on `lightFlood` the shadow snaps to a puddle. Then a painted close-up goes `resolve` → `relief`.

`src/shots/s09.js` is deleted.

## Where it lives
- `src/shots/s09b.js`, `src/shots/s09c.js`, `src/shots/s10.js`; measurement tool `evidence/climax-a2/probe.html` + `probe.mjs`
- Commits on `task/climax-a2`: `4626bd5` (s09c), `7580a49` (s09b), `b9f99f2` (s10, delete s09), `b46b748` (s09b hall dark until doorOpen), `e1ad2ca` (s10 flood fill), plus the evidence/done-note commit
- s10 imports `lamppost`, `lampKey`, `LAMP_COOL`, `LAMP_H`, `KEY_I` from s09c and `closeupRig`, `HEAD_AT` from s09b. From s11 it uses `kitTools`, `mppOf`, `noCast`, `glow`, `wallCanvas`, read-only.

## How it was checked
All shadow numbers come from `probe.mjs`. It renders each frame three ways (as is, blob invisible but still casting, blob not casting), takes the 1st–99th percentile extents of the shadow mask, and projects them onto the receiver in metres. Ratios are shadow extent ÷ the blob's measured width on the same frame.
- [x] `evidence/climax-a2/s09b_sheet.jpg`: 76.5, 77.0, 77.083, 77.25, 78.167, 78.5, 79.0, 79.7, 80.3, 80.6, 81.0, 81.5
- [x] `evidence/climax-a2/s09c_sheet.jpg`: 82, 84, 85.75, 87.5, 88.75, 90.5, 92.25, 93.5, 95.5, 98.5, 101, 101.9
- [x] `evidence/climax-a2/s10_sheet.jpg`: 102.5, 103.0, 103.083, 103.25, 103.458, 103.5, 104.0, 104.5, 105.0, 106.0, 107.0, 108.0
- [x] `evidence/climax-a2/poster.jpg`: global 79.0 (s09b t 3.0) at 1920 px, one frame. It holds the lamp, the blob on the threshold, him walking, and the shadow on the end wall. Wall probe at t 3.0: the shadow spans the hall's full width (x −0.055…0.064 of ±0.065), is 0.116 m tall (81% of the 0.145 ceiling, 1.9× the blob's 0.0625 width), covers 57% of the end wall, lit/dark 2.66.
- [x] `evidence/climax-a2/lamp_strip.jpg`: s09c 3.75 → 6.75 (85.75–88.75), across lamp 2 (`lamp2` 5.5). Ground length ÷ blob width:
  - 3.75: **3.20×** (shadow x 0.061…0.273, blob 0.066)
  - 5.5 (`lamp2`): **1.33×** (under his feet)
  - 6.75: **2.84×**

  The other beats: t 0 2.50×, `lamp1` 1.36×, `lamp3` 1.32×, 10.25 (block) 2.58×, `lamp4` 1.33×, `lamp5` 1.32×.
- [x] `evidence/climax-a2/snap.jpg`: s10 at 1.458 (103.458) and 1.5 (103.5, `lightFlood`). Ground probe kept to the lobby floor:
  - Before: the tongue runs z 0.117…0.382, so 0.265 m = **5.7×** the squeezed blob's 0.0465 width mid-hop, or 3.9× its rest width of 0.0684. lit/dark 1.55.
  - After: **puddle 1.14×** (x −0.001…0.075 against a 0.066 blob, z 0.162…0.180), lit/dark 1.41. The residual long tongue measures lit/dark **1.10** (10% contrast, `--rel=0.05 --thr=3`), under README §4's 20%. At 2.0 the puddle is 1.15×.
- [x] `evidence/climax-a2/closeups.jpg`: 28 frames at 400 px. s09b C5 every drawing from 79.5 to 79.917 (12): dread with sweat, anticipation dip at 79.917, resolve from 80.0. s10 CU every 0.25 s from 106 to 109.75 (16): resolve, anticipation at 106.917, relief from 107.0 (`exhale`).
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 70 beats, 195.0s)`
- [x] `node tools/determinism.mjs --t=79,80.3,84,92.25,99.5,103.458,103.5,107.5` → all PASS, `determinism: PASS` (after the last code change)
- Sheets were checked by eye. Nothing else was rendered. The spec's per-shot strips beyond the brief's list were not made.

## Gaps
- **Brief vs director.** The brief says Q16 is 2× and Q17 is a night-light. The coordinator relayed the director's 2026-10-18 answers (`09bd2ff`): 2.5×, and his nightstand lamp from s09a. I built to the answers. There is no night-light, so no night-light hum.
- **`NIGHTSTAND_LAMP = [-0.012, 0.027, 0.80]` in s09b.js is a placeholder, marked to match s07.** It puts the lamp 0.30 inside his room on the door line. When climax-a1 exports the real nightstand position from s07.js, import it. S = 0.80 / 0.295 = 2.71 and `BLOB_AT` are derived from it, but the camera and room layout are tuned by eye to this value.
- **s09b staging.**
  - It is a cutaway: the hall's right wall is removed and the door wall ends at the doorway's right edge. The camera is off-axis at (0.30, 0.135, 1.32). From behind the lamp, the blob and his body hid the eye holes, because a camera near the light can't see the shadow.
  - The hall is 0.13 m wide (spec 0.10) and the doorway 0.09, to fit a 6.8 cm blob.
  - The door hinges on the doorway's left and opens toward camera, so it doesn't cover the blob.
  - The door wall and his door cast shadows, the one exception to "only the blob casts". The C5 background is in that wall's shadow, with a soft blurred shadow edge at frame right (visible in `closeups.jpg`).
  - The end-wall shadow covers 57% of the wall, short of the ≥ 80% I aimed for. The hall's width clips it sideways.
  - The blob's eyes face camera in s09b.
- **s09c.**
  - Lamp-beat puddles measure 1.32–1.36×, not ≤ 1.3. Pushing them lower meant raising the lamps above 0.105, which shortened the long spans.
  - t 0 is 2.50×.
  - `resolve` lands at 11.167 (93.167), not on `blobBlocks`: `act()`'s minimum hold forces it.
  - The tower, tree line and sky are multiplane layers that ride the camera. Planters and the `night_view` plate were dropped (the plate duplicated the towers). Marston is at scale 0.4 with the facade left of the breezeway. The path is widened to z 0.03–0.20.
  - The side-step around the blob skates a little.
  - Back-view breath is manual. There's no tail curl and no door-handle turn.
  - Verified by sheet only: the last fixes (lobby glass doors, plaza far edge, hedge rims).
- **s10.**
  - The doors moved to z 0.10 and open 80°.
  - Before the push (102.5–103.083) he is behind the glass and backlit. Only his paper edge rims read, as a white outline. That's acceptable as "seen through glass at night", but it isn't a designed silhouette.
  - The residual long tongue after the flood is 10% contrast and very faint at 960 px.
  - The eyes-close beat is merged into the exhale swap (`relief` has closed eyes). The painted puff holds for the whole CU, not just the exhale.
  - Front-view breath uses the preset.
  - Two lights not in the spec: a non-casting warm room fill (0.15, rising to 0.30 on `lightFlood`) and a CU face key point light. The overhead hit the CU face edge-on.
- **Painted heads.** No green multiply was applied (none needed by eye). The rig ↔ painted head drift is hidden by camera changes.
- **Out-shone rule.** Lamp 5 is at 0.2 from `lightFlood` with no fade, per README §4.
- **Not mine:** a Chrome on port 9333 that I saw on the machine during the work. I left it alone.

## Notes for batch B and the sound pass
- Keep s09c's exports stable (`lamppost`, `lampKey`, `LAMP_COOL`, `LAMP_H`, `KEY_I`, `X`, `LAMP_X`). Keep s09b's too (`closeupRig`, `HEAD_AT`, `HEAD_K`, `NIGHTSTAND_LAMP`). s10 imports them.
- **Sound:**
  - The door hinge clicks at `doorOpen` 77.0, and the blob lands on the threshold at 78.167.
  - The C5 swallow is 79.667–79.833.
  - s09c footsteps follow distance walked (a step per 0.024 m), not fixed intervals, so the step rate rises toward Marston.
  - The walk's `resolve` face is at 93.167.
  - s10: the chord on `lightFlood` 103.5, the exhale at 107.0.
  - The nightstand lamp is silent here (its click belongs to s09a).

## Story
I started from the brief's geometry: a night-light low on the hall wall beside his door, the blob 2× big. The first s09b renders put the shadow on the hall's side wall, not down the hall. A light beside the door throws sideways, so the "huge shadow ahead of him" never showed up. While I was fighting that, the coordinator passed on the director's Q16/Q17 answers (`09bd2ff`): 2.5×, and the light is his own nightstand lamp, left on from s09a. That fixed the direction, because lamp, doorway, blob, hall and front door now sit on one line. Every number had to be re-solved for r 0.030.

The surprise was a physics lesson I should have seen coming. The obvious poster camera sits in his room behind the lamp, looking down the hall, and from there the shadow is mostly hidden: the camera is nearly at the light, so the blob covers its own shadow. Only a camera off the light's axis sees it. I rebuilt s09b as a cutaway paper theatre with the camera off to the side, and that frame became `poster.jpg`.

On the walk the shadows first came out short. The spot cone (1.2 rad) clipped the shadow's tip, and opening it to 1.45 gave the long spans back (3.20× → 1.33× → 2.84× in `lamp_strip.jpg`). Late on, the threshold snap measured fine, but at 960 px the eye holes of the old tongue still showed behind the puddle. I let the lobby's fill rise on the beat (`e1ad2ca`), and only the puddle reads.

One routine thing went wrong: my first commit swept the deletions of s09 and the old s10 into the s09c commit. I reset it before anything left the machine and recommitted it as three clean commits.

## State
built · 2026-10-18
