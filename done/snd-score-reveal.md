# Done · snd-score-reveal

## What shipped
Every score event that sat on a far-away beat now hangs from its nearest named beat. The reveal chords moved from `headLift` +1/2.5/4/5.5 onto `revealSleeper`/`revealDrinks`/`revealFreshman` (three chords, not four). The groove, its sub swells, the Marston note and the Exam bit at the home lamp moved onto `fridge`/`gameNight`/`curtainsStart`/`scrollStart`/`marstonEnter`/`lampClickHome` with no change in time. The solve notes and the closing replay in s16 moved onto `problemSolved2`–`6`.

## Where it lives
- `src/audio/score.js`; evidence in `evidence/snd-score-reveal/`
- Branch `task/snd-score-reveal`: `809ae72` (dodge anchors, time-neutral), `46d4e6c` (reveal chords), `2a118a1` (solve notes and replay), `de4a82c` (evidence), then this note

## How it was checked
- [x] **Each flagged event listed with old and new anchor, error 0.** `evidence/snd-score-reveal/verify.txt` (script `verify.mjs`, diffs the score at `0f4f78a` against the new one):

  | Event | Old anchor | New anchor | Old → new time | Error vs target |
  |---|---|---|---|---|
  | Am chord | `headLift` +1 | `revealSleeper` +0 | 89.5 → 89.4 s | 0 |
  | Fmaj7 chord | `headLift` +2.5 | `revealDrinks` +0 | 91.0 → 90.4 s | 0 |
  | E7 chord (lowest, dur 2.2 → 3, as s13 asks) | `headLift` +5.5 | `revealFreshman` +0 | 94.0 → 91.4 s | 0 |
  | Dm7 chord | `headLift` +4 | removed | was 92.5 s | n/a |
  | Groove, fridge bars (9 events), sub 44 Hz | `lampClickHome` −16.5… | `fridge` | unchanged | 0 |
  | Groove, game-night bars (17), sub 47 Hz | `lampClickHome` −8.5… | `gameNight` | unchanged | 0 |
  | Groove, curtains and scroll bars (66 + 55), subs 53 / 56 Hz | `lampClickHome` +7.5… | `curtainsStart` / `scrollStart` | unchanged | 0 |
  | Marston low A1 and the 56 Hz sub | `lampClickHome` +23.5 / `quiet1Start` −18 | `marstonEnter` +0 | unchanged | 0 |
  | Exam motif at the home lamp (4 notes) | `lampOffHome` −2.15…−0.5 | `lampClickHome` +0.35…+2 | unchanged | 0 |
  | Theme notes 3–7 (+ left hand) | `problemOneSolved` +3/5/6.5/7.5/8.5 | `problemSolved2`…`6` +0 | 120/122/123.5/124.5/125.5 → 122.5/125/127/128.5/130 s | 0 |
  | Full-theme replay (7 notes ×2 voices) | `quiet2Start` −8 + k·0.75 | `problemSolved6` +0.5 + k·0.35 | 127–131.5 → 130.5–132.6 s | n/a (offset by design) |

  The 153 time-neutral events are matched by content and global time, so "unchanged" is measured, not assumed. Proof it really was a no-op: after `809ae72` the mix and all three stems hash the same as before (mix `f0292820…a0a09`).
- [x] **`node tools/mix.mjs && node src/audio/selftest.js`.** All 5 checks print `ok` (`selftest.txt`; click identity in mix.wav `[0,0,0] LSB`). Mix: `loudnorm linear`, `mix.wav integrated -14.0 LUFS  true peak -2.0 dBTP (ebur128)  /  -13.96 LUFS, -2.15 dBTP (loudnorm pass 2)  target -14 LUFS` (`run2.txt`). `check_timeline.mjs`: `ok (18 shots, 41 beats, 180.0s)`.
- [x] **Byte-identical over two runs.** `hash1.txt` = `hash2.txt` (`cmp` printed IDENTICAL, `cmp.txt`). mix `bc76724b…4e97`, music `354c6b88…1eb1`, foley and ambience unchanged from before.
- [x] **Updated `timeline.png`, same method as `evidence/snd-score/`** (`timeline.mjs` is that script with the output path changed). Viewed: the three reveal chords sit on the three reveal beat lines, one theme note per `problemSolvedN`, the replay follows `problemSolved6`, the click gaps at 100.5 s and 164 s remain, and Quiet 1 and Quiet 2 are empty.
- [x] **Quiet 2 stays silent.** `quiet2.txt`: music stem peak -62.9 dBFS at 134.5–135 s, -95.4 dBFS at 135–136 s, true zero from 136 s (the old score was zero from 135 s).

## Gaps
- **Not heard, only measured.** I can't listen. Everything above comes from code, hashes, peaks and the timeline image.
- **Dm7 is gone.** Doc 05 and the old score had four chords (Am, Fmaj7, Dm7, E7). s13 asks for three beats and three chords. I kept Am, Fmaj7 and E7 (E7 is the lowest root and still left hanging) and dropped Dm7. Chord velocities are now 0.35 each, as s13 states (they were 0.35/0.38/0.4/0.45). If the director wants four chords, a fourth beat is a contract change.
- **The s16 montage changed, beyond the flagged chord.** The solve notes at +3…8.5 s from `problemOneSolved` played 2.5–4.5 s before the solves, and the replay at 127–133 s would now collide with solves 4–6. I put the solve notes on their beats, kept the replay's notes and voicing, and anchored it to `problemSolved6` +0.5. To stay clear of Quiet 2 it steps 0.35 s (was 0.75) and the solve-6 note is 0.5 s (was 1.4), so the replay starts clean. That is a timing and feel change I made because the spec put the solves on beats and the replay had to move. Not heard.
- **`lampClickNeighbor` (129 s) is still silent in the music** (Q2 is open). It is not one of the gated clicks, and nothing in the score is anchored to it.
- Not re-anchored, because no closer beat exists: the 0:00 pad (`inkDropForms` −10), the Button's `nextSemester`/`lampClickFreshman` offsets (already within 4 s of their beats).
- No contract change needed. `evidence/snd-score-reveal/score_before.mjs` is a frozen copy of the old score with absolute imports; it only serves `verify.mjs`.

## State
built · 2026-10-15
