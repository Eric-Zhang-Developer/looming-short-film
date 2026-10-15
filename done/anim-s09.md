# Done · anim-s09

## What shipped
s09 is blocked for the animatic. The set is a 1.20 × 0.42 proxy Marston facade with 24 torn window holes over tissue panes, 5 of them lit. In front sit a navy doors flat with a lit tissue lobby plate behind its doorway, a navy plaza and two hedges. A sky, a moon and a treeline are built behind the facade. The gator is the legged side rig, carrying a `backpack_side` with the blob on its pocket. He walks in from frame left on `walk_side_*`, stops, settles, looks up and sighs. At 4.667 he swaps to the back rig (`backpack_back`, blob at screen right) and walks into the doorway. Light: five unshadowed window point lights; one shadowing lobby spot, raised above the doorway, that throws a short doorway pool and a 1.45× blob shadow; and the README §10 character fill on his face from 0 to 4.6. The camera pushes 0.10 m, with DOF tracking the gator plane. All art is proxy.

## Where it lives
- `src/shots/s09.js`: commits `bfbffcb` (blocking) and `3698536` (spot raised, character fill)
- `evidence/anim-s09/`: `sheet.jpg`, `strip.jpg`, `strip_swap.jpg`, `t62_08.jpg`, `t65_00.jpg`, `crop_blob_2.0.jpg`, `walk_before.jpg`, `walk_after.jpg`, `fill.txt`, `shadow.txt`, `determinism.txt`. First set in commit `ff76fa9`; all of it re-rendered after `3698536`, in the commit that carries this note.

## How it was checked
Brief:
- [x] Key-moment sheet: `node render.mjs --page=index.html --sheet=60.5,62,63,63.9,64.2,64.45,64.583,64.625,65,65.4,65.8,65.95 --cols=6 --out=evidence/anim-s09/sheet.jpg`. I looked at it, and at `strip.jpg` (60–65.75 at 4 fps). The walk, the stop under the door, the turn, the doorway silhouette and the empty lit doorway all read in order.
- [x] Two full-res stills, as JPEG: `t62_08.jpg` (local 2.083, mid-walk, blob eyes open) and `t65_00.jpg` (local 5.0, backlit in the doorway, his shadow a short pool at his feet).
- [x] Shadow scale: **1.45×** on the plaza from 4.8 to 5.4 (1.49× on the walk's pass drawing), against the spec's ≤ 1.5× (`shadow.txt`, computed from the code's light and blob positions). This needed a spec deviation (see Gaps): at the spec's y 0.05 it was 10×. You can see the blob's shadow at his feet in `t65_00.jpg`. From 0 to 4.8 no shadow-casting light reaches the blob, so there's no contact shadow at all (spec: 1.0×).
- [x] `node tools/determinism.mjs --page=index.html --t=62,65,70,62` → `determinism: PASS` (`determinism.txt`)
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`
- [x] Readability (below)

Spec acceptance (`docs/shots/s09.md`):
- [x] 1. The sheet includes 0.5, 2.0, 4.2, 5.0 and 5.8 (global 60.5 … 65.8).
  - The gator is ≈ 14 % of frame height at 2.0, measured by eye from the crop (155 px of 1080). By geometry he is 15.1 % at the start and 16.2 % at the end of the push, under the 18 % limit.
  - Exactly 5 windows glow: r2c1, r2c2, r3c4, r3c7, and r1c5, whose top third shows above the doors flat (the spec's own layout puts it there).
  - No lettering: proxies only.
- [x] 2. `crop_blob_2.0.jpg`: the left frame is 2.0, where the spec's blink makes the eyes `closed`; the right frame is 2.083, where both eyes read on the pocket. The spec puts its own blink exactly at 2.0, so I cropped the next drawing as well. Since the spot was raised, the eyes render dimmer and warmer than cream: the blob shader lights them only from ambient and the key (the spot), and it ignores the fill. They read, but less than before.
- [~] 3. `t65_00.jpg`: at 5.0 he's a backlit silhouette in the doorway (the fill is off from the turn). His shadow now falls toward the camera as a short dark shape inside the small doorway pool, not a long streak. That's the trade for the raised spot: a high light makes a small shadow.
- [~] 4. The swap happens on one frame (`strip_swap.jpg`, 64.5–64.75): the last side frame is 64.625 and the first back frame is 64.667. On 2s the drawing boundaries fall at 4.583 and 4.667, so the swap lands at 4.667, not 4.6. The camera moves 0.10 m in z. It also moves 0.005 m in y, because the spec's own camera line says (0, 0.140, 1.90) → (0, 0.135, 1.80). That contradicts "nothing else"; I followed the camera line.

**Readability:** From the strip alone, a cold viewer sees a small gator with a backpack, and a dark blob with eyes riding on it, trudge across a dark plaza at night. He stops under a lit doorway, looks up at a big building with a few lit windows, and goes in. That covers "night", "he came on his own" and "the blob came with him". "To try" depends on context. With the fill, his green body and eyes read during the walk and the look-up (`walk_before.jpg` / `walk_after.jpg`), where before he was a dark shape against the facade.

## Gaps
- **The spec's framing hides the sky, moon and trees.** The facade's 1.20 m is wider than the frame at its plane (1.07 m) and reaches almost to the top. The "~70 % of the frame width" figure matches 70 % of the frame *height* (0.42 / 0.60). So the moon at (0.42, 0.30) and the treeline (y ≤ 0.20) are both behind the facade. I built them anyway; only a strip of sky at the very top shows. To show them, the facade needs to be about 0.75 m wide, or the camera pulled back. That's a director or spec call.
- **Light numbers that differ from the spec:**
  - Window point lights: cutoff `distance` 0.065, not 0.25. three r186 clamps 1/d² at d = 0.1 m, so with 0.25 all 24 panes lit the same (first sheet). The cutoff is the only thing that keeps a window's light off its neighbours.
  - Panes are cream mixed 60 % toward navy, so the unlit 19 stay dark under the ambient fill.
  - **Lobby spot at y 0.145, not the spec's 0.05** (orchestrator's call, logged as a spec deviation). Level with the blob, the spot threw a 10× plaza shadow (`shadow.txt`, "before"), against the spec's ≤ 1.5× and the rule this shot sets up. Now it's 1.45×. The cost: the doorway pool is short (it ends around z 0.52), and acceptance 3's "streak" is a short shadow.
  - The spot's shadow near plane is set to 0.004 after `aim()` (README §11). `aim()` puts it beyond the doors flat and the gator.
  - An unshadowed lobby point light (0.3, distance 0.08) lights the plate. The raised spot passes over the plate, 47° off its axis.
  - **Character fill (README §10):** a `PointLight` in `lerp(phone, navy, 0.4)` at 0.06, distance 0.06, no shadow. It sits 2 cm ahead of him, 6 cm above the hip and 3.5 cm toward the camera, and moves with him on 2s. `fill.txt`: his head measures 66.6 mean against lit windows at 166–179, which is 37–40 % (it was 30.3, the same as the facade). The plaza under him and the facade beside him are unchanged (11.8 and 31.1 both times), so it lights nothing but him. It is off from the turn at 4.6: the back view has no face, and the doorway beat is a silhouette.
  - Intensities (windows 0.12, spot 0.5, lobby 0.3, fill 0.06) are tuned by eye. The spec's relative values wait on calibration.
- **LUT:** `night` (README §11 now says the same for s09 and s10). `act2b` doesn't exist, and `marston` crushed this exterior to near black.
- **Foot skate:** the spec's speed (0.168 m/s, a step every 0.25 s) gives 0.042 m per step, against the rig's 0.024 m contact spacing, so the planted foot slides about 1.8 cm per step. I kept the spec's timing.
- **The exit, 5.4–6.0:** the spec says "gone behind the jamb" but leaves him at x 0.14, where the doorway still shows him. I slide him right to x 0.215 over 5.4–5.67, still walking, so he passes behind the jamb.
- **Backpack:** `makeGator` has no backpack option. I hung `study_props_sheet` `backpack_side` / `backpack_back` on `rig.joints.body` from the shot. The blob is re-parented between the two rigs every frame, so it's still a pure function of t.
- **Spec offsets were written for a feet root.** I read the blob offset (−0.030, 0.050, +0.012) "from the feet" as the blob's centre: hip space for the side rig, feet space for the back rig. The back-view blob offset (0.024, 0.045, 0.006) is my own choice; the spec only says "screen right of the backpack".
- **Sigh:** the 4.3 key is `specPose({ lean: −3, head: 10 })` per the spec's numbers, not the named `sigh` pose (head 6). There's no separate shoulder rise: the rig has no shoulder joint.
- Not verified: how this looks with real `marston_ext`, `foliage_sheet` or `study_props_sheet` art (none frozen yet), and the cut from s08 and to s10 (neither is built on this branch).

## State
built · 2026-10-15
