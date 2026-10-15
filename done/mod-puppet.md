# Done · mod-puppet

## What shipped
`src/puppet.js` implements the contract: `definePuppet({ name, parts, faces })` returns `{ group, pose, blend, face, follow }`, plus `name`, `joints` and `meshes`. Each part is a joint Group at its pivot holding a `paperMesh` offset so the pivot lands on the joint. `blend` eases between named poses with `kf` and samples at `onTwos(t)`. `face` swaps textures through `updatePaperMesh`. `follow` lags a part behind its ancestors' blended rotation with a damped spring (the same response as core's `spring`), also on 2s. `lab/puppet.html` has a **temporary** path-built test gator (body, head, jaw, two arms, tail, pocket, plus eyes and mouth face slots) under a swaying `lampLight`, in front of a cream wall. It runs the 4 s action.

## Where it lives
- `src/puppet.js`, `lab/puppet.html`, `lab/puppet.js`
- `evidence/mod-puppet/`: `action_strip.jpg`, `joint_crop.jpg`, `self_shadow.jpg`, `faces.jpg`, `faces_all.jpg`, `twos.txt`, `twos.mjs` (run it with `node evidence/mod-puppet/twos.mjs`), `determinism.txt`
- Commits on `task/mod-puppet`: `7232c71` (code), `2ef998d` (blend determinism fix), `1537854` (evidence), plus the commit for this note.

The lab's `t` picks the view: [0,4) is the action, [4,6) and [6,8) are joint stress poses, and [8,9) shows every face take on 2s.

## How it was checked
- [x] **Clear poses with anticipation and holds.** See `action_strip.jpg`: every 12 fps frame from 0 to 3.92 s. The gator holds neutral (0–0.5), leans back with the arm swung back (anticipation, held 0.83–1.08), overshoots the reach (1.33), settles (1.5) and holds to 2.0. It then eases to worried, holds 2.33–2.83 and settles relieved. Key times sit on the 12 fps grid (n/12), so every key pose is actually sampled.
- [x] **No joint gaps at extreme angles.** See `joint_crop.jpg`, a 1:1 crop of two stress poses. Pose A: arm_r 3.0 rad, arm_l −1.2, head +0.6, jaw −0.4, tail +0.6, pocket +0.6. Pose B: arm_r −1.5, arm_l +1.5, head −0.6, tail −0.5, pocket −0.6. Shoulders, neck, tail root and jaw hinge stay covered in both. Each child's end is a disc centered on its pivot, and the pivot sits inside the parent. At jaw −0.4 the background shows between snout and jaw: that's the open mouth, not a joint gap. At tail +0.6 the tail tip dips into the desk, which is expected for a stress pose.
- [x] **Parts cast small shadows on each other.** See `self_shadow.jpg`, a 2× crop at t = 0.25 and 3.5. The arm, pocket and head each throw a thin dark offset on the body, and the mouth shadows the snout. In the worried take, the brows, which stick out past the head, cast onto the wall (visible in `faces.jpg`).
- [x] **Face swaps on exact frames.** See `faces.jpg`: frames 45–50 (top row) and 69–74 (bottom row) at 24 fps. Frames 45–47 are open/neutral and frame 48 (t = 2.0) is worried/line, with no in-between. Frames 69–71 are worried and frame 72 (t = 3.0) is closed/smile. `faces_all.jpg` shows all six eye takes and all four mouths.
- [x] **Motion steps at 12 fps while the light runs at 24.** See `twos.txt`. I stepped t = 0..4 at 24 fps and, after each `renderFrame`, read every puppet mesh's world matrix and map uuid and the lamp's world position from the scene graph. The puppet changed on 42 of 96 steps, and **0** of those fall between frames 2m and 2m+1. The lamp changed on **96 of 96** steps. Result: `twos: PASS`. I used the scene graph and not a pixel diff, because the swaying lamp changes every pixel on every frame.
- [x] **Determinism passes.** See `determinism.txt` (`node tools/determinism.mjs --page=lab/puppet.html --t=0.5,1.333…,2,2.958…,3.5,4.5,8.25`): all PASS. The first run **failed** on reverse order: the tail's base angle from a stress `pose()` leaked into `follow()`. Fixed in `2ef998d` (see Gaps). I grepped for `Date.now`, `performance.now` and `Math.random` in the puppet files and found none.

## Gaps
- **`blend` now owns the whole puppet.** Every joint not named in any of its poses is set to 0. Without this, angles from an earlier `pose()` leaked into later frames, which broke determinism. A shot that wants a manual angle must call `pose()` after `blend()`. `face()` is still stateful: a shot must call it every frame (the lab does), or a take from an earlier `t` stays on.
- **Face slots are parts named after a `faces` key** (`eyes`, `mouth`), and the part list gives where they sit. The contract doesn't say where faces attach. Every take in a slot must match the slot's size, because a swap changes textures, not geometry. `face()` throws on a size mismatch.
- **`pivot` uses v-down** (texture space, the same as paper.js paths and image pixels). The contract doesn't say which way v runs. A root part defaults to z = 0, and children default to 3 mm.
- **Additions beyond the contract:** `follow` takes an optional `gain` (default 1), and the puppet exposes `name`, `joints` and `meshes`. A contract task should list these if shots use them.
- **`follow` is rotation only.** It responds to the ancestors' summed blended angle and ignores translation of the attach point. It integrates from the first blend key on every call (1/240 s steps), so cost grows with shot length. That's marked `ponytail:` in the code.
- **No boil on puppets.** `parts` take one fixed `sheet`, so edges don't re-tear at 8–12 Hz. Boil would need a sheet per seed for each part (for example `sheet: (seed) => PaperSheet`). That's a contract addition. Shots can call `updatePaperMesh(puppet.meshes[part], …)` meanwhile.
- **The test gator is crude and temporary.** It has a big head, a single-segment arm and no elbow. At the reach the hand ends under the raised chin rather than clearly past the snout. The cream tissue pocket under amber light reads almost like a hole. Brows in the worried take sit off the head silhouette and cast on the wall. Lab intensities and the lamp sway were tuned by eye.
- `tools/check_timeline.mjs` wasn't run because this task doesn't touch the timeline.

## State
built · 2026-10-15
