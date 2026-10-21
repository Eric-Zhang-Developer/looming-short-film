# Done · v9-blob

## What shipped
- `src/blob.ts`: five new eye states, `plead`, `blank`, `sad`, `shy`, `sleepy` (lids, gaze and a fixed catchlight for `blank`; no mouth, brows or geometry), behind a second shader gate `EYE_MOODS` inside `EYE_LIDS`.
- The acting map (v9-beats §2) in s02, s03, s04, s05, s06, s07, s08, s09a, s09b, s09c, s10, s10b, s16, s17, s17b, s17c. s11, s13 and s15 already act the map's "worried and side" and are untouched.
- s17c: the 94 is covered with the page's own paper and a red circled 85 is hand-lettered over it, with a minus and a slash on his lines; the CU is `relief`, not `pride`; the blob exhales; the tap lands on the 85 (`NINETY_FOUR` → `GRADE`).
- `src/props/canvas.ts`: `dueLabel(clock)`. The exam row and the detail view derive "Today 9:00 AM" / "Tomorrow 9:00 AM" from the screen's clock. s09a's detail screen now reads Today.
- v9 blocks on top of the 16 touched shot docs.

## Where it lives
Branch `worktree-agent-a8c6f72f7287b9a9b`, from `v9` (3db5505). Commits: 465ea12 (blob states), 5649d61 (canvas Today), the acting map, the s17c 85, the docs, and the evidence and this note (last).
Evidence: `evidence/v9-blob/sheet.jpg` (all of it on one page), `eyes.jpg` + `eyes.html` (the states), `beats/*.jpg`, `s17c_85_crop.jpg`, `hashes.txt`, `determinism.txt`, `hashat.ts`, `v9-pre.json`.

## How it was checked
- [x] `evidence/v9-blob/sheet.jpg`: every eye state large (with open, tired, side and closed beside them), then s02's slow blinks, s03's plead, s07's blank, s09a's "Today 9:00 AM" and blank in the black, s10's confused beat, s16's sad, plead (and its plead-shaped wall shadow) and shy, s17's sleepy, s17b's blink, s17c's 85, relief and the tap, and a full-res crop of the 85 with no seam where the 94 was. **s08's blank is not on it:** no s08 frame shows the blob's eyes (it's off-frame or a silhouette from behind, as v8's own note says), so s07 and s09a stand in.
- [x] Hashes proof, `evidence/v9-blob/hashes.txt`. `tools/hashes.ts` has no time filter and renders the whole film in one Chrome, which the memory rule forbids, so `evidence/v9-blob/hashat.ts` is the same grab and hash at chosen times, a few shots per Chrome. Results: s00, s01 and s02 before the drop (0–15, 18 frames) **PASS against `evidence/ts-refactor/baseline.json`** (the only span of that pre-v8 baseline whose timing v8 left alone); against `v9-pre.json` (hashed on `v9` before any change; s11 and s15 hashed with v9's blob.ts swapped back in) **all PASS**: 0–15 (18), s11 117–123.5 (8), s13 124–131 (9), s15 132–139.5 (9), s18 190–209 (23). s13 shows `side`, so EYE_LIDS is live there; its bit-identical frames are the proof that the second gate adds nothing to the old lids. **Frames that moved:** every frame of s02 (from 15.17) through s10b, s16, s17, s17b and s17c where the blob's eyes, wobble or squash changed, by design; s09a's insert (the Today label); s17c's page and CU. Not hashed: s04–s10b etc. have no unchanged-code baseline to compare against.
- [x] `node tools/determinism.ts` at one time per changed shot (16 times, one Chrome each), `evidence/v9-blob/determinism.txt`: all PASS.
- [x] `node tools/check_timeline.ts` → `ok (22 shots, 81 beats, 210.0s)`.
- [x] `npm run typecheck` clean; no ts-ignore / ts-expect-error / ts-nocheck. `dueLabel` checked with node asserts ('' → Tomorrow, '3:00' and '1:45' → Today, '9:00' and '11:30' → Tomorrow).

## Gaps
- **s13 left alone** (and s11, s15): they already act "worried and side", and s13's crowd shadows are blob silhouettes. Its hashes are unchanged.
- **`blank` vs `open`** look almost the same in a still (full discs); the difference is that blank's catchlight ignores the light, and the caller sets `wobble: 0` and never blinks. Taken from the spec's table literally. If the director wants blank to read in a still, the smallest change is dropping its catchlight.
- **s10's "one lid lower than the other"** is done as the spec's parenthesis says (`side` with `look` flicking), not with a per-eye lid; there is no asymmetric state.
- **s10 after the confused beat** goes back to `blank` (v8: `worried` up at him), reading the map's "s10–s10b: blank" literally.
- **s17b's "as the exam starts"**: the blink is at 3.25, the first drawing after the cut to his page. The spec gives no time.
- **The 85's red** is calendarRed × 0.72: plain calendarRed rendered salmon next to the art's painted checks on the ink overlay. The paper's back still shows the faint v8 show-through marks (circle and checks, no number), without the two new marks.
- **The "four gulps" music-box voice** (score.ts) is v9-ending's (audio), not done here.
- **No motion strips** were rendered for the blinks; the stills show the drawings. Time box.
- `hashat.ts` is evidence, not a tool; if the hashes check should run in chunks in general, `tools/hashes.ts` could take `--t` (not my file).

## Story
I started by recording before I changed anything. The brief wanted proof that untouched shots stay bit-identical, and the obvious tool, `tools/hashes.ts`, hashes the whole film in one Chrome, which is exactly what the 8 GB rule forbids. Its baseline was also from before v8 moved the cut, so beyond the first nineteen seconds it no longer described this film. So the first renders were a small script hashing chosen times, a few shots per Chrome, on `v9` itself, before any edit. The first attempt failed on something dull: my gate script wasn't executable, and the log was eight lines of "permission denied".

The shader change follows from a warning in blob.ts's own comments: any extra live code in the lidded path moves a few pixels by 1/255, and s13 must not move. So the moods got their own define nested inside the old one, and s13, which shows `side`, came back identical ([hashes.txt](../evidence/v9-blob/hashes.txt)).

The acting was mostly removal. From gulp3 to s10b the blob stops glancing, gasping and blinking. Taking those away is what makes it read as weather. The surprise was s16: after gulp4 its wall shadow carries the `plead` lids, so the huge shadow on the library wall looks like it's begging ([sheet.jpg](../evidence/v9-blob/sheet.jpg)).

For the 85 I sampled the page's blank lower margin and mirrored it so it fills the patch without stretching. At full resolution there's no seam ([crop](../evidence/v9-blob/s17c_85_crop.jpg)). My first red came out salmon beside the painted checks, so I darkened it and thickened the strokes. The close-up uses the `relief` head that was already in the kit, with its little puff of breath.

## State
built · 2026-10-20
