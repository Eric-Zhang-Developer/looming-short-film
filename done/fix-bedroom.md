# Done · fix-bedroom

## What shipped
- **Fix 1, done (s09a):** the decision is on his face. C4 is framed on his painted head: `dread`, then the closed lid for the breath, then `resolve` from 73.0. The blob is only an edge at frame right. On `sitUp` (73.5) his near arm reaches to a lamp shade at frame right. At `lampOn` (74.0) the shade under his hand and his face light up on the same frame. The resolve holds from 73.0 to the cut at 74.25 (1.25 s) before he sits up, which now happens in the wide (74.25 half up, 74.33 up).
- **Fix 2, partly done (s07):** one cut-in, 2.0–5.5 s. It shows the painted `numb` head at frame left and the glowing phone in his hand at frame right, with the blink at 3.0 on the painted lid. **Part (c), the ceiling shadow reading as the blob's, is not done.** I tried a change, rendered it and rejected it (see Gaps).
- **Fix 3, done (s08):** every room light is at 0.4 of s07's and the ambient at 0.2. s08 measures 22% darker than s07 over the whole shot and 25% darker in the wide.
- **Fix 4, done (s09a):** after `lampOn` the light is low and local. The lamp went from 0.32 to 0.06 and the ambient from 5% to 0.8% of s02's. The wide after 74.25 (C5: C3 panned 0.085 left) keeps window B in frame, with navy glass and the moon dimmed beside the lamp.

## Where it lives
- `src/shots/s09a.js`, `src/shots/s08.js`, `src/shots/s07.js`
- `evidence/fix-bedroom/`: `decision_strip.jpg`, `before_after.jpg`, `s07_cutin_sheet.jpg`, `s07_s08_luma.jpg`, `s07_caster_tried_2.2.jpg`, `s07_caster_tried_1.4.jpg`, `luma.py`
- Commits on `task/fix-bedroom`:
  - c164937: s09a, fixes 1 and 4. It also has s08 at DIM 0.6 and the `panes` handle from `bedroom()`.
  - 2c3f89a: the first evidence and a draft of this note.
  - 08fc67e: the s07 cut-in.
  - f986fec: s08 at DIM 0.4, with the luma measured.
  - b20b8f0: `before_after.jpg` re-rendered.
  - This note's commit.

## How it was checked
- [x] **`decision_strip.jpg`:** every 4th frame from 71.5 to 75.0 (22 frames).
  - 71.5–71.67: `dread`, eyes open.
  - 71.83–72.83: eyes closed for the breath.
  - 73.0–73.33: `resolve`, still lying.
  - 73.5–73.83: the arm rises to frame right.
  - 74.0: the shade lights under his hand, and the room and his face go warm.
  - 74.17: held.
  - 74.33: the wide. He is sitting up, the room is lamp-lit and the window at the left is dark.
  - 74.5–75.0: he stands. The blob's shadow, with both eye holes, is on the wall.
  - It was rendered from c164937, before two edits that changed only comments and removed the unused sitting `REACH` pose. The s08 dim from 0.6 to 0.4 touches s09a only at 0–0.5, which is before the strip starts.
- [x] **`before_after.jpg`:** the top half is the cold viewer's frames, 48–76 s every 2 s, cut from `evidence/cold-v4/sheet_03.jpg` and `sheet_04.jpg`. The bottom half is this branch at the same times. The cold cut looks about 0.5 s later than the code at 70 and 74: at 70 their frame is already black and at 74 he is already standing. Compare those two pairs with that in mind.
- [x] **`s07_cutin_sheet.jpg`:** 48, 50, 51.1 (the blink), 52, 53.4, 54, 56, 58.
- [x] **s08 vs s07 mean luma.** Method: `python3 evidence/fix-bedroom/luma.py <sheet> 6 17` on `s07_s08_luma.jpg`, which gives YAVG 0–255 per 320 px cell.
  - **s07** (48–58, every 2 s): 70.17, 76.58, 76.07, 70.76, 67.81, 67.62. Mean **71.50**.
  - **s08** (60–69, every 1 s): 76.78, 76.79, 50.87, 50.96, 46.47, 51.29, 51.30, 50.57, 50.49, 50.72. Mean **55.62**, which is **22.2% lower**.
  - **Wide against wide:** s08 at 68 is 50.49 and s07 at 58 is 67.62, **25.3% lower**.
  - Before the fix, the same method gave 68.27 for s07 at 57. climax-a1 measured 68.18 on 1920 px stills, so the two methods agree.
  - s09a at 70.2 is 50.33, which matches s08's end.
- [x] **`node tools/check_timeline.mjs`** → `ok (21 shots, 70 beats, 195.0s)`. `git diff 134495b -- src/timeline.js` is empty.
- [x] **One frame each of s09b and s02 still builds:** t=77 and t=12 both render, and both pass determinism.
- [ ] **Determinism: s07 and s08 pass; s09a fails in the lamp stretch, and the failure predates this round.**
  - **Pass:** s07 at 49, 50.5, 51.1, 53, 54.2 and 57. s08 at 61, 62, 64.5, 66.8 and 68. s09a at 70.3, 71.2, 72.2, 73.2 and 75.5. Also 77 (s09b) and 12 (s02).
  - **Fail:** s09a at 73.6, 74, 74.4 and 74.5, depending on which frames ran before them. In every failure the first render and the fresh page match, and only the render that comes after other times differs. So state is leaking between frames.
  - **It isn't mine:** the base commit 134495b fails the same way. With `--t=72.2,74,74.5,75.5` it fails at 74 and 74.5, and 72.2 and 75.5 pass, the same pattern as my code.
  - **Narrowed:** it isn't the lamp's shadow. With `exam.mesh.castShadow` forced off it still fails.
  - **Not found:** the cause. The climax-a1 note's determinism PASS used a different set of times. Someone has to find this before the master render, or s09a's frames 73.5–74.5 may differ between chunks.

## Gaps
- **The C4 lamp is a continuity cheat.** `ROOM.LAMP` is frozen at the bed's foot. He lies with his head at the other end, so he can't reach it, and a frame wide enough to hold his face and the real lamp puts the blob back in the middle. So C4 alone shows a twin shade: same shape, colour and glow, on the same side of frame as the real lamp in the wide. It sits on the camera ray through his reaching hand, which is solved once at build. His face in C4 is lit by a C4-only warm point light at that shade (`C4_LAMP`), plus the real lamp at `C4_STOP`.
- **The sit-up moved** from 73.5–73.67 to 74.25–74.33, on the cut. The brief allowed it ("cheat the sit-up later within 3.5–4.25"). The blanket drop, the phone's hide and the blob's slide to the bed's foot moved with it.
- **Fix 2(c) is not done:** the ceiling shadow still reads as the flat ellipse.
  - What I tried: turning the caster so its top points at the camera, and stretching it 2.2× or 1.4× along its height.
  - What it did (`s07_caster_tried_2.2.jpg`, `s07_caster_tried_1.4.jpg`): the shadow gets a dome top, but its body runs down the whole back wall. It also re-aims the phone spot, so the nightstand shade glows white. And it changes s08 C3 and s09a 0–0.5.
  - Not clearly better, and it would change two other shots, so I dropped it.
  - The likely real fix is a camera that sees more of the ceiling, or putting the shadow on the back wall. Both mean moving the shared `CAM`.
- **Fix 2(a) in the wide is unchanged.** His face in the wide is as small as before. The cut-in carries "he's on his phone".
- **The blob's edge, with one eye, sits at the top right of the s07 cut-in and of C4.** The brief allows this ("at the frame edge (one eye)").
- **The headboard post** is dark and soft in front of his neck in C4. It is the bed's near face, so it's physically right, and I left it.
- **`LAMP` (exported by s09a) changed value** from 0.32 to 0.06. Nothing imports it today.
- **Renders were down most of the afternoon.** The machine's load average passed 380, and three renders died or hung. That's why fix 2 and fix 3 landed in the last 45 minutes.

**For the sound pass** (global s; no beat changed)
- `sitUp` 73.5 is now his arm coming out from under the blanket, so the rustle still fits. His body sits up at 74.25–74.33, on the cut.
- The lamp click and the light are both exactly on 74.0. His hand is already on the shade at 73.92.
- The blob slides to the bed's foot at 74.25–74.33. It used to be 73.50–73.67.
- s07 has a cut at 50.0 (to the close-up) and another at 53.5 (back to the wide). The thumb-flick times are unchanged.

**For fix-walk:**
- s09a's wide after 74.25 is now `C5`, C3 panned 0.085 left, so he walks off frame right a little further from the edge.
- The room behind him is much dimmer.

## Story
I started where the cold viewer pointed. Their 1:12 frame was the blob's eye, and our own `climax-a1/closeups.jpg` showed why: his head sat small in the lower left and the blob filled the right. Reframing C4 on the painted head was the easy part. The lamp was the hard part. The brief wanted his hand on the lamp in the same frame as his face, but the frozen lamp is at the foot of the bed, a body length past his reach. So the close-up got a twin shade on the camera ray through his hand, and I wrote it down as a cheat.

The first two reaches didn't read. Arm angle 0 already points along his body, so −35 and −5 barely moved the sleeve. Raising the arm 35° up and to the right, with a lower camera, finally made the hand travel to the shade (`decision_strip.jpg`, 73.5 to 74.0).

Then the machine became the story. The load average passed 380. Frames took over a minute each. Two renders died with `Target closed`, one died with a Node error I didn't log in full, and one hung for 40 minutes without starting Chrome. With the s07 changes unseen, I took them out of the code. When the orchestrator stopped the encode that was loading the machine, a 9-frame sheet took 25 seconds. The cut-in looked right, and I committed it. The ceiling flip didn't: it turned the back wall dark (`s07_caster_tried_2.2.jpg`), so it stayed out. DIM 0.6 had taken only 16% off s08's luma. At 0.4 it came to 22%.

The last surprise came from determinism. s09a fails around the lamp click, and checking the base commit showed it failed there before I touched it.

## State
built, partial · 2026-10-18. Fixes 1, 3 and 4 are done. Fix 2 is done except (c). s09a determinism fails in 73.6–74.5; the failure predates this round.
