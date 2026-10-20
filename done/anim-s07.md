# Done · anim-s07

## What shipped
s07 is blocked for the animatic on proxies. The bedroom is one locked frame at the spec's camera (FOV 20, (−0.06, 0.14, 1.30)) with the cream wall, the kraft floor, the navy ceiling, the tissue window with a navy cross, the ladder (drawn as rails and rungs over the proxy), the drill, the bed, and the scissor-cut Night Navy curtains (rod, 2 brackets, 2 panels, closed with 3 mm side seams and a 1 mm centre seam). The Student is the legged side rig on 2s, posed from `poses.js` (drill_a/b, blow, crouch, lift_rod, tug, pull_curtain, nod, prone, prone_flick). He goes through four stations, each opened by a single-frame pop, then black at 8.0, then lies prone at 8.5 with two thumb flicks. Light: the moon is `dawnLight` k 0 behind the wall, stepping x 0.30 → 0.15 per station. It goes to 5% at 8.0. The phone `phoneLight({ angle 0.9, penumbra 0.4, distance 1.0 })` comes on at 8.5 at L, aimed along L → blob, with a cyan face fill. The blob shadow reads 20.25× on wall, floor and ceiling. Grade `night`, DOF 1.25 m, jumping to 1.10 m / aperture 0.012 in the black.

## Where it lives
- `src/shots/s07.js`, commit `b30f840`
- `evidence/anim-s07/`, commit `a90d160`: `sheet.jpg`, `still_51_4.jpg`, `still_53_5.jpg`, `crop_stations.jpg`, `crop_eyes_ceiling_9.5.jpg`, `crop_patch_7.5_8.0.jpg`, `crop_seams_7.96_8.0.jpg`, `measure.html` + `measure.mjs` → `measure.txt`, `determinism.txt`, `check_timeline.txt`
- This note: the commit after those

## How it was checked
I looked at every image listed above.

Brief:
- [x] Key-moment sheet: `node render.mjs --page=index.html --sheet=44,44.17,45,45.9,46,47,47.75,48,48.25,48.6,48.9,49.25,50,50.5,51,51.4,51.75,51.9,52,52.25,52.5,53,53.5,53.95 --cols=6 --out=evidence/anim-s07/sheet.jpg`. That is every pop, anticipation, drill, blow, bracket, crouch, lift, snap, tug, both pulls, step back, nod, black, the 8.5 pop, the 9.0 and 9.5 eye changes, and 9.95.
- [x] Two full-res stills, JPEG (1920 wide, one-frame sheets): `still_51_4.jpg` (local 7.4, the right panel closing, patch narrowing) and `still_53_5.jpg` (local 9.5, the 20× peak).
- [x] Shadow scale (`measure.txt`, the smoke-paper diff as anim-s03): **20.25×** at 9.5 and 20.14× at 9.0, against 20 ± 2. The shadow is centred at x −10.2 cm (spec −10.0).
- [x] `node tools/determinism.mjs --page=index.html --t=45,53.5,30,45` → `determinism: PASS`. A grep for clocks and Math.random in s07.js finds nothing.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`
- [x] Readability (below)

Spec acceptance (`docs/shots/s07.md`):
- [x] 1. The sheet includes 45, 47, 49, 51, 52.25 and 53.5 (local 1, 3, 5, 7, 8.25, 9.5). The stations read as distinct: left bracket, the mirrored right bracket, the rod with crooked panels, then on the floor closing them. Then the black, then the shadow.
- [x] 2. Frames 8.042–8.458 measure **4.7%** mean luma, graded (`measure.txt`). This only passes with a spec deviation (Gaps).
- [~] 3. The width check **fails as written, though the scale passes.** At 9.5 the wall shadow is 0.554 m wide (x −0.379…0.175) against 0.48 ± 0.05. The scale is 20.25×. The blob draws 2.73 cm wide, not 2.4 cm (its lobes and wobble 1, the same finding as anim-s03), and 2.73 × 20.25 = 0.553. The 0.48 figure assumes a 2.4 cm silhouette. I didn't touch the blob (contract-blob) or the wobble (spec: 1).
- [x] 4. `crop_eyes_ceiling_9.5.jpg` / `still_53_5.jpg`: both eye holes show high on the wall. Their centres sit around y px 350, inside the wall's top third, which ends at about px 397. Their lower edges dip about 30 px below it. The left hole half-falls on the closed left panel, where it lights navy instead of cream. The dark shape continues across the ceiling seam as a dark arc on the ceiling strip.
- [~] 5. The moon patch: `crop_patch_7.5_8.0.jpg` shows it at 7.5 as two narrowing slivers (the right panel is mostly closed by then) and gone at 8.0. The floor's p95 drops from 7.6% to 4.8%. **The seams at 8.0 fail <5%:** left 7.3%, right 6.4% mean luma against a panel at 4.6% (`measure.txt`, `crop_seams_7.96_8.0.jpg`, faint blue hairlines). At this grade's floor, a 1% moon still measured 5.5% (probe, not kept). Only the moon fully off passes. I kept the spec's 5%; see Gaps.

**Readability:** From the strip alone, a cold viewer sees a small gator on a ladder at night drill above a moonlit window, then the other side. He hangs a rod with dark curtains, pulls them shut, nods, and the room goes black. Then he lies on the floor with a glowing phone beside a little ink blob, whose shadow fills the whole wall, eyes and all, over the curtains he just hung. That's the Story job. What's weaker: during the montage he's a dark silhouette (the moon is behind him) and in profile, not 3/4. The drill reads as a small navy box. "The phone makes the shadow" depends on the cyan cone, because the phone is a sliver on the floor.

## Gaps
- **The black needs less ambient than the spec says.** The `night` grade alone puts an empty black frame at 4.3% mean luma. At the spec's 15% ambient the black measured **8.6%**. The shot runs 1% of s02's ambient for 8.0–8.5 (4.7%, a thin margin) and goes back to the spec's 15% on the 8.5 phone frame, so s08 still opens at s07's level. Director/orchestrator call: keep this, or change the grade or the check.
- **Seam hairlines vs < 5%** (acceptance 5): the two numbers can't both hold under this grade (see above). Same owner as the item above. s08's "no visible seam light at 0.0" points the same way as the < 5% check.
- **Face fill (README §4 vs §10).** At §4's 15–30% of the spot, his face read at 218% of the lit wall: three clamps 1/d² at 0.1 m, and the fill sits 3 cm from him. With no fill it measures 29%, so §10 applies. The fill is 0.15% of the spot, which measures **40.7%** (`measure.txt`). It also sits 2.5 cm toward the camera from the phone, not at it: at the phone it was behind his planes (z 0.405+) and lit only their back rims. No ladder-station fill: the faces there measure 77–204% of the moon patch (the patch itself is dim, 8–12%), above the 30% trigger.
- **The wall doesn't cast; a hidden blocker does.** Four black planes at z −0.004 leave a window-exact hole for the moon. A hole torn into a 1 m wall sheet wobbles by millimetres, and the seams are 1–3 mm. The window pane is tissue at z 0.002 in front of the unholed wall, glowing from behind. s08 will need the same rig for its seams.
- **Curtains are scissor-cut** (straight edges, no tear), so the 1 mm centre seam can't open and close on each boil. s08 wants torn rims that glow; that's a conflict for its builder to solve.
- Spec-silent choices:
  - He is in profile, not "3/4 open": no 3/4 body exists.
  - Hip offsets so the hand reaches each bracket: ±2 cm from the ladder centre.
  - Body plane z 0.048 on the ladder.
  - Left bracket on from the 2.0 pop; rod and panels hidden before 4.0.
  - The rod rides his hand's world height until the 4.83 snap.
  - Panels crooked 5° / −4° until the 5.17 / 5.5 tugs.
  - Station 4 faces −x for the left panel and pops to +x at 7.0 for the right. The panels' 0.11 bottom edge is above his reach (he's 8 cm), so the pull is a pose, not contact.
  - Drill held level at the hand; it reads as a box.
  - Floor extended to z 0.62 (the frame's bottom edge meets y 0 at z 0.506).
  - Wall to y 0.32, behind the ceiling seam.
  - Blob `side` look −1 at stations 2 and 9.0.
  - Aperture 0.02 (default) before 8.0.
  - Moon intensity is `dawnLight`'s own 0.6 at k 0.
  - Ambient = `ambient()` × 0.4.
- Physics notes: the shadow's floor run is barely visible, because the phone is 4 mm above the floor and lights it at about 1°. The ladder's top catches phone light through the left eye hole as a pale shape inside the shadow. That's real geometry; the spec expects the ladder's own shadow inside the blob's.
- Disk: the machine ran out of space mid-task (117 MB free, ENOSPC on one render). Nothing of mine was large; I deleted nothing outside my owns. It may slow the other builders.
- Not verified: the cut from s06 or into s08 (both are stubs on this branch), anything with frozen art (all proxies), and sound (none added).

## State
built · 2026-10-15
