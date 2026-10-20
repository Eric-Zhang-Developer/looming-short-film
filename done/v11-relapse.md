# Done · v11-relapse

## What shipped
s16 on the v11 size table: the blob arrives at 4.5× (r 0.054), gulps to 5× (0.060) on `gulp4`, then the five solves take
it to 1.5× → 1× → 0.71× → 0.54× → 0.42× (0.018, 0.012, 0.0085, 0.0065, 0.005). It is re-staged so the size reads.
Camera B″ is a pulled-back B′. The towering blob's contact steps back behind him to z 0.060. The pendant leans toward
it while it towers, and the phone's cone is widened so the whole 5× blob throws its shadow.

## Where it lives
- `src/shots/s16.ts`: `BLOB_R`, `BIG_Z`/`markOf`, `CAM_B3`, `ZONE_AIM`, the phone spot's angle 0.9 → 1.1
- `docs/shots/s16.md`: the v11 block on top
- `evidence/v11-relapse/`: `sheet.jpg`, `sheet.log`, `shadows.txt`, `determinism.txt`, `check_timeline.txt`
- Commits on `worktree-agent-ad2a4917ecd68e685`: d4afb59 (code), d1dc416 (doc, evidence), and this note

**New beats: none.** s16's only gulp (`gulp4`, local 9.1) and the five solves (`problemOneSolved` 16.5,
`problemSolved2` 21.5, `problemSolved3` 23.0, `problemSolved4` 24.0, `problemSolved5` 25.0) already existed, so
`src/timeline.ts` is untouched.

## How it was checked
- [x] `evidence/v11-relapse/sheet.jpg` at local 0.5, 6.5, 9.5, 11.0, 16.0, 17.0, 21.75, 25.5 (global 140.5…165.5).
  In order: the P insert; the phone lit with the 4.5× blob, `sad`, taller than him in B″; W after gulp4, with the
  shadow up the wall, eye holes above the window band, and him at frame left; B″ at 11.0 with the 5× blob whole, its
  top well above his head and both eyes cream; P at 16.0; B″ at 17.0 with the 1.5× blob `shy` beside him; D at 21.75
  (1×) and at 25.5 (0.42×).
- [x] Wall shadow numbers (`node evidence/v8-s16/probe.ts`, v8's probe run against the new code): S 2.54; **11.4
  units at 4.5×, 12.7 at 5×** (v8 11.9); 0.348 m wide; eyes at y 0.161; top at 0.302. While the phone is lowered
  (10.4): S 2.11, 10.5 units. After `phoneDownLib` there is no wall shadow, only the pendant pool at 1.90×.
  See `shadows.txt`.
- [x] `node tools/determinism.ts --page=index.html --t=149.5` → `t=149.5 fa6573729bdf193e ×3 PASS`, `determinism: PASS`
- [x] `node tools/check_timeline.ts` → `ok (27 shots, 91 beats, 228.0s)`
- [x] `npm run typecheck` → exit 0, no output

## Gaps
- **The s15 → s16 cut is not verified.** s15 belongs to v11-walk. s16 now opens on B″, a pull-back of B′ along the
  same line of sight, with the blob's contact at z 0.060. If s15 ends on the old B′ with the blob at z 0.074, the
  cut shows a small push-out and a 1.4 cm step back of the blob. Check this after the merge.
- **The orchestrator's audio wiring:** none was needed. s16 has no new gulp beats.
- The probe's box (2.28 r × 2 r) is the README's field estimate, not a pixel measurement. In the sheet's W frame the
  shadow's top runs off the top edge, which is a little higher than the probe's 0.302 suggests.
- Every page load logs one 404 (`Failed to load resource`). It appears on the sheet, the determinism run and the
  probe alike. I did not trace it, and the renders are unaffected.
- Not rendered: no strip of the gulp at 24 fps. The snap, the squash and the cut to W are v8's code, unchanged.
- I decided myself, where the spec was silent: "That was it?" (16.5–19.0) stays on B″ rather than v4's tighter B′,
  so the 5× → 1.5× drop reads in one framing. His face still reads there (sheet frame 6).

## Story
The numbers looked like a one-line change: 0.030 becomes 0.054. The first test sheet showed why it wasn't. At
Marston's contact depth the blob shares a plane with his head layers. At 5× it is 12 cm tall, so in B′ it was simply
cut off, and his snout would have dipped into it. I stepped the contact back to z 0.060, behind every layer of him.
That also changed the light's geometry: S fell from about 4 to 2.54. The wall shadow still came out bigger than v8's
(12.7 units against 11.9) and fits W, eyes and all, so I left the phone in his hand.

That first sheet (a scratch render, not kept) had one surprise. At 11.0 the blob's right eye was dark brown, like an
iris. The blob's eyes are lit only by their key light. The pendant was aimed at the page, and the far eye of a 14 cm
blob sat outside its cone. Leaning the pendant toward the blob while it towers fixed it. The page inserts keep the
old aim, so the math looks exactly as it did. The second sheet showed both eyes cream, and that is the staging in
`evidence/v11-relapse/sheet.jpg`. Every render waited behind the other three builders' Chrome, and that waiting took
more of the afternoon than the code did.

## State
built · 2026-10-20
