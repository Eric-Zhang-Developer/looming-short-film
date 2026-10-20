# Done · v6-canvas-a

## What shipped
- `src/props/canvas.js`: Canvas Student's To-do list and an iOS-style reminder banner, light mode, drawn in code on a 2D canvas (no school logo, no Canvas wordmark), with swipe-off and tap-open built into the screen's `set()`, and the `COUNTDOWN` table.
- s00 wakes on that To-do list (exam row `MAC2312 · Calc 2 Exam · Tomorrow 9:00 AM`); the second buzz lands the banner and raises the row's red marker.
- s02: the ink of "Calc 2 exam" runs out of the letters into the bead (3.5–5.0), leaving a ghost of the words.

## Where it lives
- `f5da680` the module (`src/props/canvas.js`, evidence page `evidence/v6-canvas/screens.html`) · `b71dff4` s00 · `312f01c` s02 · this note and the docs in the last commit. Branch `task/v6-canvas-a`.

### The module's API
```js
import { todoScreen, banner, COUNTDOWN, EXAM_Y, ROWS, uiPoint } from '../props/canvas.js';
const scr = todoScreen({ aspect });   // aspect = screen height / width (default 844/390) → { texture, canvas, H, set }
scr.set(t, { banner, swipe, open, marker, clock });
//   banner: a banner() result (or null) drawn at the top of the screen; swipe 0..1 slides it off right (smoothstep);
//   open 0..1 expands it from its rect to the whole screen as the exam's detail view; marker 0..1 the exam row's red
//   marker (default 1); clock: status-bar time ('1:45'), omitted → none. Redraws (and flags texture.needsUpdate) only
//   when an option changed; t never changes the picture.
const b = banner({ body, title = 'Calc 2 Exam' });   // → { texture, canvas, w: 362, h: 82, title, body } (points; canvas is 2 px/pt)
EXAM_Y        // the exam row's centre, UI points from the top (W = 390 points)
uiPoint(scr, x, y) → [u, v]   // UI points → texture uv (v from the bottom), for aiming a camera
```
Put `scr.texture` on a `MeshBasicMaterial({ transparent: true, toneMapped: false })` plane over the phone's painted screen (portrait; corners are transparent). s00.js shows the placement on `phone_face_up`: the plane is `PlaneGeometry(short, long)` rotated +90° about z so the UI's top faces the phone's camera dot (−x), and `aspect` is the painted screen's 0.94 × 0.86 of the visible box (2.42, longer than an iPhone, so the list just has more room).

### COUNTDOWN
| key | body | from |
|---|---|---|
| s00 | `Tomorrow 9:00 AM` | pre-dawn, no clock: names the time |
| s03 | `Starts in 24 hours` | continuous with s02's 9:00 |
| s06 | `Starts in 10 hours` | **assumed 11 p.m.**: s06 has no clock (night, after game night, before s07's 1:45) |
| s07 | `Starts in 7 hours` | 1:45 → 7 h 15, nearest hour |
| s09a | `Starts in 6 hours` | 3:00:10 → 5 h 59, nearest hour |

## How it was checked
- [x] `evidence/v6-canvas/screens.jpg`: the to-do screen, the screen with the s00 banner, a half swipe (s07, clock 1:45), a 60% open (s09a), and the four countdown banners, each flat at 400 px wide. Looked at: every row, the banner title and body read.
- [x] `evidence/v6-canvas/s00_s02.jpg`: s00 at 0–3.5 every 0.5 s, then s02 at 13.0–16.0 every 0.5 s (480 px cells). The exam row reads in every lit s00 cell; at 13.5 the letters are streaks into the bead; from 14.0 the square holds a ghost.
- [x] `node tools/check_timeline.mjs` → `ok (22 shots, 73 beats, 201.0s)`
- [x] `node tools/determinism.mjs --t=1.0,3.0,14.5` → all three PASS, `determinism: PASS`
- [x] s03, s06, s18 still build: `evidence/v6-canvas/neighbours.jpg` (global 22, 44, 190).
- [x] `npx tsc --noEmit -p .` → clean (no output).

## Gaps
- **s06's countdown is an assumption** (11 p.m. → 10 hours); the story gives s06 no clock. The director should set it.
- s03's "24 hours" differs from the brief's example ("22 hours"): computed from s02's 9:00 and s03 following it directly.
- Day column shows only "Thu"/"Fri" (no day numbers): the calendar's numbers are scribbles, so a date would be invented. Course `CHM2045 · Lab Report 6` and the badge count (4, the number of rows) are filler I chose; no Inbox badge.
- Red: doc 03 says red appears only on the calendar circles; the brief asked for a red exam marker and red badge, so the screen uses `calendarRed` for both. Doc 03's line may want a v6 note (not mine to change).
- The banner arrives in one frame in s00 (no slide-down); `set()` has no vertical offset, so a slide-in would need one more option.
- s00 spec acceptance not re-measured: the 0–0.46 luminance (the code path for those frames is unchanged: the screen is hidden) and the 24 fps strip of the wake.
- s02's drip is on 2s and its ghost is 18% of the letters; the paper patch is a Lambert overlay sampled from the art's paper, not the square's own paper material, so at a very tight crop its tone could differ slightly (not visible at 480 px).
- Sound the new picture wants: nothing new. Optional: a soft wet run under 3.5–5.0 in s02, ending in the bead's 5.0 glint.

## Story
I started with the module because another builder was waiting on it. The first flat render (`evidence/v6-canvas/screens.jpg`) read on the first try, which was a relief: the reference's layout does the recognising, so leaving off the logo and the wordmark cost nothing. The one design choice was where the swipe and the open live. A 3D helper that slides a second plane would have been the obvious API, but the banner already sits inside the phone's screen in real life, so it went into the screen texture as options of `set()`, and a shot only ever puts one plane on its phone.

s00 took two tries. I first pushed from the whole phone toward the exam row, and the contact sheet showed the banner landing out of frame at 2.0, the exact moment it mattered. Pushing straight down onto the point between the banner and the exam row fixed it.

The drip was the part I expected to fight. The painted square is only 132 × 128 pixels, so I didn't repaint it: the overlay reads the art's own dark pixels, covers each with the paper's colour as it leaves, and sends it down to the bead, lower strokes first. The first sheet showed a thick outline of the words left behind, because I'd only moved the darkest pixels; moving their antialiased edges too left the ghost the brief asked for. At 13.5 in `s00_s02.jpg` you can see "exam" pulling down into the bead.

## State
built · 2026-10-18
