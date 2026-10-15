# Done · mod-timeline

## What shipped
`src/timeline.js` (18 shots s01-s18, 16 named beats, `shotAt`, `beat`, `DURATION`) and `tools/check_timeline.mjs` (gaps, overlaps, total 180 ±5, duplicate beats, beats outside their shot; prints the shot/beat table; `--file=` checks a copy).

## Where it lives
`src/timeline.js`, `tools/check_timeline.mjs`, `evidence/mod-timeline/{check,check_fail}.txt`. Branch `task/mod-timeline`.

## How it was checked
- [x] `node tools/check_timeline.mjs` passes and prints the table: `evidence/mod-timeline/check.txt` -> `ok (18 shots, 16 beats, 180.0s)`
- [x] Deliberate gap in a temp copy fails clearly: `evidence/mod-timeline/check_fail.txt` -> `gap: 54s to 56s before s08` (plus the overlaps that follows from it), exit 1
- [x] All 16 beats from the brief exist (table in check.txt)
- [x] Global beat times within ±1 s of doc 02 (below)

Beat moves vs doc 02 (none beyond 1 s):
- phoneUp 15.5, lampClickHome 36.5, headLift 88.5, custodianPass 95.5, lampClickMarston 100.5: +0.5 s so the action lands after the cut.
- lampOffHome 39.0, curtainsDone 52.0, nameWritten 110.0: doc 02 gives no exact time; chosen inside the shot (flinch ~2.5 s after click; montage ends before 0:54; name 2 s after the 1:48 uncap).
- problemOneSolved 117.0: 1:54 start + "about three seconds".
- Exact: inkDropForms 10, quiet1Start 78, penUncap 108, quiet2Start 135, nextSemester 160, lampClickFreshman 164, blobYawn 174.

## Gaps
- Lamp clicks are 0.5 s after doc 05's 0:36 / 1:40 (both mirrored, so shots 6 and 15 stay symmetric). Doc 05 cues of "0:36" are therefore 0.5 s off; sound should use `beat()`.
- Durations are explicit in the data; the checker, not derivation, enforces tiling.
- Doc 02 says Quiet 2 is ~20 s, doc 06 shot list gives 25 s (2:15-2:40). I followed doc 06.

## State
built · 2026-10-15
