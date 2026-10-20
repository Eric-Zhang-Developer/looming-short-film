# Done · v8-trims

## What shipped
- **s10b is 4 s:** a brisker walk with the same stride, the phone pocketed by 0.75, and both tube pools.
- **s17 is 8 s:** all its acting is kept, and the dawn ramp is compressed so the gold lands by 7.5.
- **s17c is 6 s:** the grin holds one second, then the cut back to P and the tap at 5.25.
- **s18:** the closed laptop now sits on the desk's front right for the whole shot, drawn as a shut laptop. In the tag his head and eyes go to it for half a second (14.75–15.25, the flinch), then back to the drop. From the uncap at 16.5 on it is v7's tag unchanged: the drop hops onto the nib, and he writes "1." in its ink.
- Each shot doc has a v8 block on top.

## Where it lives
- `src/shots/s10b.ts`, `s17.ts`, `s17c.ts` and s18's first pass: commit `c4cd3fe`.
- s18's fix pass after the orchestrator's review (the laptop on the desk, v7's tag restored after the uncap): commit `a53edde`.
- `docs/shots/s10b.md`, `s17.md`, `s17c.md`, `s18.md` (the v8 blocks): commit `a4aa732`. s18's block was rewritten for the fix pass in the same commit as this note.
- `evidence/v8-trims/`: `sheet.jpg`, `s18_sheet.jpg`, `s18_flinch_strip.jpg`, `checks.txt`.
- Branch: `worktree-agent-a894158605848df8f`.

## How it was checked
- [x] `evidence/v8-trims/sheet.jpg`, in reading order (global times from `src/timeline.ts`); I looked at it:
  - s10b at 0.5, 1.5, 3.0, 3.9 (113.5, 114.5, 116.0, 116.9): the phone goes down to the pocket, and he grows toward the lens.
  - s17 at 0.5, 3.0, 6.0, 7.9 (166.5, 169.0, 172.0, 173.9): the panes go night → pink → gold, full gold at 7.9.
  - s17c at 2.0, 5.9 (186.0, 189.9): the cut back to P is in by 5.9.
  - s18 at 14.0, 15.0, 16.5, 19.0 (204.0, 205.0, 206.5, 209.0). Re-rendered after the fix pass.
- [x] `evidence/v8-trims/s18_sheet.jpg`: s18 at 14.0, 15.0, 16.5, 17.75, 18.5, 19.5 (204.0 … 209.5):
  - 15.0: the flinch, his head down toward the laptop.
  - 17.75: the drop on the nib.
  - 18.5: the stroke.
  - 19.5: the black "1." in the fade.
  - The laptop is in every W frame.
- [x] `evidence/v8-trims/s18_flinch_strip.jpg`: every frame from 204.5 to 205.5 (s18 14.5–15.5), cropped on him and the desk. Level look → head down to the laptop at 14.75 → `worried` 14.92–15.17 → back up on the drop by 15.33.
- [x] `node tools/determinism.ts --t=114.5,172.0,189.5,205.0` → all PASS (first pass). After the s18 fix: `--t=191.0,205.0,207.75` → all PASS (`checks.txt`).
- [x] `node tools/check_timeline.ts` → `ok (22 shots, 81 beats, 210.0s)`
- [x] `npm run typecheck` → clean
- [x] s18 after 16.5 is v7's code: I rebuilt the file from `wave/3-assets` and re-applied only the flinch, the laptop and the 14.5–16.5 mouth. `git diff wave/3-assets -- src/shots/s18.ts` shows nothing past the mouth line.

## Gaps
- **Is the laptop nameable at film size? Not verified with a cold viewer.**
  - In a full-res 1080p crop it reads as a shut laptop: a grey lid, the lid's pale edge over the base with a seam, and a cyan sleep light.
  - On the 640 px sheet tiles at 15.0 it is a small grey slab with an edge on the desk's right. It's clearer in the pushed frames after 17.
  - The camera is low (about 10° down), and a closed laptop is thin. If it still doesn't read, the strongest fix is the lid open a crack with the dark screen showing. That isn't "closed", so I didn't do it.
- **The laptop is drawn, not the kit art.** Face-down, home_kit's lid showed its screen art from above, a dark slab that looked like a hole in the desk. The shell is four flat `rect`s over the hidden lid, plus a cyan dot.
  - I drew it chunky (2.8 mm, the cartoon idiom; real would be ~1 mm).
  - It is 1.6× rather than s03's 1.8×, because 1.8× would cover the lamp's base and the blob's landing spot.
  - It sits square to the camera, because the shell has no side faces.
- **The eye drawings were chosen by eye.** The `side` drawing (the spec's usual glance) points the pupil back over his shoulder, away from the laptop. So the look lands on `open` with the head at −20° (−6° didn't show on the first sheet), and the flinch is `worried` for 3 drawings.
- **The mouth is a `line` from 14.5 to the uncap**, then v7's smile. fix-payoff had the smile from the tag's first frame, but a flinch under a smile reads wrong.
- **Audio:** the orchestrator is fixing the s10b footsteps and the s17c tap in `src/audio/cues.ts`. s18's cues are fine again, now that v7's tag is back.
- **s10b's approach is shorter:** z 0.06 → 0.40 (was 0.45), so he grows about 1.6× on screen instead of 1.8×. That keeps the stride at about 2 cm a step. The steps are quicker (0.25 s, v3's cadence). The pools show on the sheet, but I didn't crop them to measure.
- **s17's DAWN_K is unchanged.** At the faster ramp, dawn overtakes the pendants at about 6.3 s instead of about 9. I didn't measure it on stills.
- I didn't listen to anything. No mix was run.

## Story
The trims were mostly arithmetic. The one real decision in s10b was what "tighten, don't truncate" means for a walk. If I kept v6's speed, he would just stop two-thirds of the way down the aisle. If I kept the distance at the old step rate, his feet would skate. v3's old 0.25 s step at 0.085 m/s comes out to almost exactly v6's two centimetres a footfall, so he simply walks faster. The timeline already carried the new beats, and the tubes are placed from them, so the second pool landed within a millimetre of where it was before without my touching it. s17c had a small trap: the tap on the 94 was hard-coded at 6.25, past the new 6 s cut.

s18 took two passes. On the first, I read "the drop stays tiny" as replacing v6's hop onto the nib, so I cut it. That was wrong: the orchestrator pointed out that the score and the mix are built on that hop. Rather than undo my edit piece by piece, I rebuilt the file from the branch's v7 version and put back only the new parts.

The other note was fair too. My strip showed him dipping his head at the desk, but the laptop was a sliver at the back. Moving it forward wasn't enough. The first render showed a dark rectangle that looked more like a hole in the desk, because the face-down lid shows its screen art from above. So I drew it as a shut laptop: a grey lid, a two-layer edge with a seam, and a small cyan sleep light. In the full-res crop it finally reads. Whether it reads at film size to someone who hasn't seen s03 is the one thing I couldn't check.

## State
built · 2026-10-20
