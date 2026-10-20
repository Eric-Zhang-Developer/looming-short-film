# Done · contract-light-key

## What shipped
- `aim(spot, target, { nearest })`: the shadow camera's near is now `min(0.004, d/20)` (or `nearest`), so a blob 5 cm from the phone casts its shadow with the default call.
- The blob's key light is the light with the largest contribution at the blob (intensity × luminance × three's distance falloff × spot cone), not the largest raw intensity. `blob.update(t, { key })` overrides it.
- contracts.md §lights and §blob gained additive notes. `src/shots/*` untouched.

## Where it lives
`src/lights.js`, `src/blob.js`, `docs/contracts.md`, `evidence/contract-light-key/`. Commits on `task/contract-light-key`: `2c26921` (contract(lights)), `dfce0a5` (contract(blob)), plus this note.

## How it was checked
- [x] Blob 5 cm from an aimed spot shadows with the default near: `evidence/contract-light-key/near_lab.html` (blob 4.7 cm from the spot, aimed at its wall hit). `near_before.jpg` (old rule, no wall shadow) against `near_after.jpg` (shadow with both eye holes).
- [x] s03 crop at t 17: `s03_key_before.jpg` (violet window highlight, warm eyes) against `s03_key_after.jpg` (cyan rim and catchlights on the phone side). Rendered with `node render.mjs --page=index.html --crop=700,580,300,240 --sheet=17`; before = blob.js stashed.
- [x] Override: `key_auto.jpg` (a brighter-by-raw-intensity directional is in the scene, the blob still picks the spot) and `key_win.jpg` (`{ key }` forces the directional, warm catchlights).
- [x] Determinism: `evidence/contract-light-key/determinism.txt`, PASS for lab/lights.html, lab/blob.html and index.html at 15.6, 89.6, 0.5.
- [x] contracts.md diff is additive: `git diff --stat` shows 9 insertions, 0 deletions.
- [x] `node tools/check_timeline.mjs` run after the change `ok (18 shots, 41 beats, 180.0s)`.

## Gaps
- index.html logs 22 "404 Not Found" resource loads during the determinism run. Not investigated; the hashes still match across runs.
- The wall-shadow near fix was verified in a scratch lab, not by removing s03's own `near = 0.004` line (not mine to edit).
- Behavior change to know about: any scene where a shadow-casting light was winning only because it casts shadows can now lose to a nearer unshadowed light. Only s03 and lab/blob.html were looked at; other shots' highlights not re-rendered.
- Luminance weighting means a saturated cyan phone counts less than a white light of equal intensity; fine for s03, a knob if a shot disagrees.

## State
built · 2026-10-15
