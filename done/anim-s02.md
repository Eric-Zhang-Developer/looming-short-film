# Done · anim-s02

## What shipped
`src/shots/s02.js` blocks the 9 s birth shot on the home desk unit (procedural wall, desk top, apron and floor, plus proxy calendar, lamp, chair, exam page and phone). A bead swells on Friday's red circle, glints on `inkDropForms`, runs down the page leaving a fading trail, drops off the bent lip, lands with a squash and a stain, swells to full size, opens its eyes, looks around, and makes three hops to B. The Student (`makeGator`, pose `slump`) blinks twice, glances at it at 8.33 and tightens his mouth at 8.67. The camera is locked. The key is `dawnLight` at k 0.35, placed per spec with `ambient()` fill. DOF pulls from the calendar to B between 5.0 and 6.0.

## Where it lives
- `src/shots/s02.js`
- `evidence/anim-s02/`: `sheet.jpg`, `strip.jpg`, `strip_crop.jpg`, `t09_00.jpg`, `t10_00.jpg`, `t12_40.jpg`, `measure.html` + `measure.mjs` → `measure.txt`, `determinism.txt`
- Commits on `task/anim-s02`: `c1be38b` (shot), `c6500fe` (merge of `wave/3-assets`, as the orchestrator asked), `9bfe24c` (evidence), plus this note

## How it was checked
Brief:
- [x] Key-moment sheet: `node render.mjs --page=index.html --sheet=6.5,7.5,9.5,10,10.5,11.2,11.34,11.9,12.34,12.5,13.1,13.5,14.17,14.34,14.67,14.95 --cols=6 --out=evidence/anim-s02/sheet.jpg`. That is one frame per beat and key pose: slump, blink, bead, beat, run, fall, land, swell, eyes open, side glance, hop, two hop targets, his eye swap, mouth line, and the last frame before s03. I looked at it.
- [x] Two full-res stills (JPEG, about 630 KB each): `t10_00.jpg` (`inkDropForms`: the bead on the circle with its glint) and `t12_40.jpg` (eyes just opened). `t09_00.jpg` is the 3.0 s still for the red check.
- [x] Shadow scale, from `measure.txt`: at 8.9 the widest x chord is 27.13 mm for the blob and 26.51 mm for its shadow on the desk, so **0.977×** (target 1.0 ± 0.1). The method is smoke-paper: the blob writes no colour or depth but still casts, and the frame with it casting is differenced against the frame with `castShadow` off. The shadow's overall x extent is 43 mm. That is the directional light shearing the shape back-left, not magnification: each horizontal slice of the blob lands on one line of constant z on the desk at 1:1. The shadow centroid is at (0.0266, 0, 0.0499) against the spec's (0.024, 0, 0.048).
- [x] `node tools/determinism.mjs --page=index.html --t=10,14.34,3,10` → `determinism: PASS` (t = 3 is in s01).
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`
- [x] Readability (below)

Spec acceptance:
- [x] Strip 3.33–6.5 in order: bead, run, fall, squash, swell, eyes opening. Rendered with `--strip=9.333:12.5 --fps=12`, one cell per drawing. In the full-frame `strip.jpg` the 4 mm bead is about 3 px, so `strip_crop.jpg` (`--crop=1290,330,420,580`) shows it. `measure.txt` lists the drop's center and scale for every drawing.
- [x] At 8.83 the blob is at B: measured center (0.0400, 0.0120, 0.0600), **error 0.00 mm**.
- [x] Shadow at 8.9 is 0.977× (above).
- [x] Red only on the circle, 3.0 s still: at saturation > 0.35 (hue within 20° of red, value > 0.2), all **34** red pixels are in a 110 px box around the circle's projection (1493, 404) and **0** are elsewhere. At a looser saturation > 0.2, 242 pixels elsewhere qualify. I didn't map where they are; to the eye the frame has no other red. Calendar cells hold wavy scribbles only, with no numerals or letters (`t09_00.jpg`).
- [x] Eyes to `side` on exactly the 8.33 frame: by 24 fps frame, 8.2917 is `tired` and 8.3333 is `side`. The mouth goes `line` at 8.6667 (`measure.txt`).

**Readability:** From the strip alone, a cold viewer sees a drop of ink appear on the red-circled day of a calendar, trickle down, fall to the desk and swell into a small creature with eyes. It looks around and hops toward the slumped gator, who only glances at it at the very end. That's the Story job. The weak point is the birth, which is tiny at full frame (the bead is about 20 px across at 1920). It reads in the crop and at film resolution, but not in a thumbnail strip.

## Gaps
- **README §10 character fill: not added. Needs an orchestrator call.** In `t12_40.jpg`, measured before any fill, his face is already at **59–60 %** of the key-lit wall's luma (head 55.6, snout 57.0, wall 94.3), above the 30–45 % band. Here the window key is in front of him, not behind, so it already lights his face. A fill can only add light, so any fill pushes him further over the band, and getting into the band would mean dimming the spec's key. I left the light out rather than add one at an arbitrary intensity.
- **README §11: n/a.** s02 has no spotlight and calls no `aim()`.
- **Spec choices where it's silent or contradicts itself:**
  - Landing spring: the spec has "squash 0.6 for one frame, then `spring(t, 5.33)`". But `spring(t, 5.33)` is 0 on the landing frame and 0.6 on the next, which would hold 0.6 for two drawings. I kicked the spring one drawing early (`spring(t, 63/12)`), so the drawings run 0.6, 0.05, −0.22, −0.04, then 0.
  - The glint is a one-frame cream disc on the bead, not a change to the blob's specular term (`blob.js` has no glint input).
  - The trail is the stain's blot stretched down the flat part of the page. It stops where the lip begins, because the curl hides the rest.
  - The stain scales with the swell until the hops start, then stays put.
  - At 8.83–9.0 the blob's eyes are `open`. Blob eyes have no "up" take, so "gaze up at him" isn't shown.
  - Grade is `night` (the spec names none). It's s01's grade, so the cut doesn't shift colour. I tried `dawn` first: it tinted the whole frame rose (hue 10–20°), which competed with the red circle.
- **Tilt:** the ±1.5° seeded tilt is on the calendar, lamp and chair. The page and phone only turn in the desk plane. The wall, desk top, apron and floor stay true, because the blob sits on and hops across the desk, and a 1.5° tilt on the 0.33 m desk would lift one end about 9 mm.
- **Added beyond the layer table:** a floor plane at y −0.034 (navy-kraft), because the background showed under the wall behind the chair.
- **Proxy-only shims** (real art drops in with no code change):
  - When `calendar` is a proxy, its face is drawn in code (grid, scribbles, red ring, exam glyph). Real art must put the circle at (0.70, 0.542) of the visible sheet so the bead sits on it.
  - The proxy shade is tinted halfway to kraft, because cream tissue lit like the cream wall vanished into it.
  - The chair proxy stands on the floor at 0.032 visible width. The 'seat top y −0.013' isn't modelled, since the proxy is a plain rectangle.
- **Q7 (the Exam's look) has no current option marked.** I built the blob as `blob.js` draws it today. Its highlight sits between the eyes in the B frames.
- **Not verified:** the match into s03 (not built on this branch); the look with frozen art (none frozen yet); sound (not this task).

## State
built · 2026-10-15
