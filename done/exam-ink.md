# Done · exam-ink

## What shipped
- **Matte ink body (Q7 b).** No Fresnel rim, no specular, no dome gradient. Instead: flat ink, a darker band where the pigment pools at the outline, a slow mottle and a fine grain. All of it rides the body, so it squashes with it.
- **One painted highlight.** A tapered cream stroke on the upper-left shoulder, a fixed distance inside the outline. It slides slightly along the edge toward the key.
- **Visible stain.**
  - It's a blotted ring wider than the drop's foot.
  - `update(t, { left })` eases it out over 10 s once the blob has gone.
- **Lab additions.** `lab/blob.html` gains `?key=lamp` and `?cam=stain`.
- **Unchanged:** eyes (six states, `look`), field, shadow and `silhouette()`.

## Where it lives
- `src/blob.js`: `ba149a6` (look, highlight, stain ring, `left`) and `2429fc4` (ring moved into `map` so s02's trail keeps its solid alphaMap).
- `lab/blob.js`: `0754072`.
- `docs/contracts.md` §blob: `dae79a9`.
- `evidence/exam-ink/`: `ef451a3`.
- Scripts: `evidence/exam-ink/lab.mjs` (lab views with a query, which `render.mjs` refuses) and `s13_diff.mjs` (pixel diff of two stills).

## How it was checked
I looked at every image listed here.
- [x] **`before_after.jpg`:** `lab/blob.html?cam=close`, old `blob.js` (top) vs new (bottom). Columns: phone t 0.5, phone t 3.5 (worried), lamp t 0.5, lamp t 3.5.
  - **Old:** the cyan rim, plus a reflection under the left eye (phone) or over it (lamp).
  - **New:** flat ink, the shoulder stroke, and a ring at the foot.
  - `eyes.jpg` shows all seven eye cells at s15 distance. The stroke is up and left of the eyes in each, never below them.
- [x] **s03 (t 16.5) and s04 (t 25) in context:** `s03_s04.jpg`. Old vs new crops are in `shots_before_after.jpg` (rows: s02 t 13, s03 16.5, s04 25).
  - In s02 the old highlight was a vertical streak between the eyes, where a nose or mouth reads. It's gone.
- [x] **Stain crop:** `stain_crop.jpg`, 3× crops, old left, new right. Rows: s02 t 13 (kraft desk, dawn), s03 t 16.5 (desk under the phone), and s15's Camera A framing (lab at d 0.31, lamp key, because s15 is still a stub).
  - **Before:** nothing visible.
  - **After:** a faint ring in front of the foot in s02 and s03, and a clear ring from s15's height.
  - `stain_fade.jpg`: the blob hops off at 1 s and the ring stays where it sat. Frames: 0.5, 1.5, 3, 6, 9, 11.5. It's gone by 11.
  - `s02_trail.jpg`: s02 t 11, the trail on the cream calendar. Old vs new look the same.
- [x] **Determinism:** `determinism.txt`. All PASS:
  - `lab/blob.html` at 0.5, 1.45, 2.58, 3.5
  - `index.html` at 16.5, 25, 89.6, 16.5
  - the query views (`?cam=stain&key=lamp`, `?cam=close&key=lamp`, `?cam=eyes&d=0.31`), with a scratch copy of `determinism.mjs` that accepts a query
  - Also in that file: the clock grep finds nothing; `check_timeline` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] **s13 at 89.6 changes only on blob bodies:** `s13_diff.txt` and `s13_diff.jpg` (changed pixels in magenta).
  - 4,262 of 2,073,600 pixels changed, in 11 patches of 40–72 px. Each patch is one crowd blob's body: its rim band, grain, the new stroke, and the eyes losing their spec term.
  - The `silhouette()` decals and the big shadow didn't change. Its hash moved from `200ad4d9ef55ad1a` to `a6db114b203ece8c`.
  - `s03_diff.txt` and `s03_diff.jpg` show the same at s03 16.5. Only the blob and its stain changed (one patch), and the wall shadow is pixel-identical.
- [x] **contracts.md diff is additive:** `contracts_additive.txt` → `13 0`.

## Gaps
- **The stain is faint at the film's desk angles.** s02 and s03 look at the desk almost edge-on, so the front of the ring is a 1–3 px band. It's clearly visible from s15's height and in the lab. I didn't raise it further because the spec says "faint". The knob is `STAIN` (0.6).
- **"Stays where the blob sat" is the shot's job.** There is one stain mesh, and shots place it. s03 moves the stain with the blob on its hop, so no ring is left at B. To leave one, the shot stops moving the stain and passes `left`. A second stain at B2 would need a second mesh.
  - I didn't edit any shot.
  - `update()` must keep being called while a fading stain shows. s02 stops calling it once the blob is hidden, but s02 never leaves its stain.
- **s15 not checked in the real shot.** `src/shots/s15.js` is a stub. I used the lab at s15's Camera A distance and direction under a lamp key.
- **Choices where the spec was silent:**
  - The highlight is a stroke, not a crescent or dot. My first crescent beside the eye read as a raised eyebrow in `worried`. Hugging the outline avoids that.
  - The highlight is tinted by the light like the eyes (cyan under the phone, amber under the lamp), not pure white, so it reads as paint in the room's light.
  - I kept the eye catchlights: the brief keeps the eyes unchanged. I did drop the eyes' share of the old specular.
- **The body is a touch lighter than look-pass-2's mean in the middle** (mottle 0.85–1.25× ink) and darker at the rim (0.45×). It's still the darkest thing in frame in every shot crop I looked at. I didn't re-run `blob_measure.mjs`.
- **Scratch-only scripts.** The query-view determinism script lives in scratch, not the repo. Its output is in `determinism.txt`.
- **Environment.** The disk filled up mid-task: `/System/Volumes/Data` had 119 MB free, and two renders failed with ENOSPC. It was not caused by this task (my scratch use was ~30 MB). All evidence was re-rendered after space returned.

## State
built · 2026-10-15
