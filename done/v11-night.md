# Done · v11-night

## What shipped
The blob grows from 2.5× to 4.5× across s07: a gulp on three Reel flicks plus gulp3. It then holds at 4.5× (r 0.054) through s08, s09a and s09b, taller than him in each.
- s07's head-on setup (H, which s08 reuses) is pulled back so that "taller than him" reads with both of them whole.
- In the bedroom the blob sits at the bed's foot, behind him.
- s09b is restaged: the blob squeezes through his door, and the lintel cuts its top.

## Where it lives
- `src/shots/s07.ts`: `BLOB_R`, `gulpAt()`, `FOOT`, the H camera, the blob mark and the bed.
- `src/shots/s08.ts`, `src/shots/s09a.ts`, `src/shots/s09b.ts`.
- `src/timeline.ts`: s07's row, beat additions only.
- `docs/shots/s07.md`, `s08.md`, `s09a.md`, `s09b.md`: each has a v11 block at the top.
- `evidence/v11-night/`.
- Commits on `worktree-agent-a41e90dd64ec3163c`: `47c5ed4` (s07 and the timeline), `95414eb` (s08, s09a, s09b and the docs), then this note.

**New beats (s07, local / global):**
- `gulpReel1` 0.5 / 51.5 (reel 1's flick), r → 0.036
- `gulpReel2` 3.25 / 54.25 (reel 2's flick), r → 0.042
- `gulp3` 7.5 / 58.5 (unchanged), r → 0.048
- `gulpReel3` 10.0 / 61.0 (reel 4's flick), r → 0.054

## How it was checked
- [x] `evidence/v11-night/sheet.jpg`, 12 frames in this order:
  - s07 after each gulp: 51.6, 54.4, 58.6 (W), 61.2.
  - s08 C3 (H) with both whole: 70.5.
  - s09a: 73.5 (local 0.5, the phone insert, as the brief asked) and 78.0 (local 5.0, he stands in front of it and it reaches the ceiling).
  - s09b: 80.0 (1.0, both whole in his room), 81.0 (2.0, squeezing through the doorway), 82.0 (3.0, the poster: the lintel cuts its top and he is beside it), 83.5, and 84.9 (he steps into the dark).
- [x] `node tools/determinism.ts --page=index.html --t=54.4,70.5,78.0,82.0` → `determinism: PASS` (`evidence/v11-night/determinism.txt`).
- [x] `node tools/check_timeline.ts` → `ok (27 shots, 94 beats, 228.0s)` (`check_timeline.txt`).
- [x] `npm run typecheck` → exit 0 (`typecheck.txt`).
- [ ] Gulp strips (squash on t₀ − 1/12, snap on t₀): **not rendered**. `gulpAt()` uses s06's numbers, but I didn't check the frames.

## Gaps
- **Gulp order differs from the beat sheet.** The sheet puts three Reel gulps before gulp3 and has gulp3 reach 0.054. REELS has only two flicks before 7.5; reel 3's flick is at 7.75, three drawings after gulp3. I put the third Reel gulp on reel 4's flick (10.0), so gulp3 → 0.048 and `gulpReel3` → 0.054. The blob still only grows, and it ends the shot at 4.5×. The director or orchestrator may prefer a double gulp at 7.5/7.75 instead.
- **s09b loses the eye holes on the front door.** At 4.5× the blob is wider than the doorway. From the room camera it hides whatever is behind it, so the poster frame now reads through the blob's own blank eyes and him beside it. The shadow does fill the end wall (S 3.1), but you can't see it. To get the holes back, the poster would need a camera that sees past a doorway-sized blob, which is a bigger restage.
- **Hidden shadows.** In s09a C5 and in W, the wall behind the bed is in shadow up to the ceiling at this size, so the shadow has no readable outline there. In s09a C4 one of the blob's blank eyes shows, cut by the frame, at top right. I kept both and didn't tune them.
- **s09b door.** It now opens to 150° (was 80°) so it no longer stands edge-on over the doorway. This is a cheat: a real door would stop at the wall.
- **Not touched.** Audio is not wired for the three new gulps; that is the orchestrator's job. No full-shot strips were rendered.

## State
built · 2026-10-20

## Story
The spec looked like a table of numbers, and the first surprise was in it. Three gulps on three Reel flicks before gulp3 at 7.5 isn't possible, because cues.ts has only two flicks before 7.5; the third is at 7.75. I put the third gulp on the fourth reel and let the sizes follow the clock. The commit message (`47c5ed4`) argues that choice.

Head-on, the old lens sat 26 cm from a blob that already ran off the frame at 2×. I pulled it back to 56 cm and moved the blob to his right. The second test sheet showed it working: he gets smaller, and the blob's top clears his head by half its height.

The door was the real problem. My first restage pushed the lamp off the camera's axis and squeezed the blob into the hall. It made a thin dark slab, half hidden by the open door, with him peeking past the jamb. My geometry had also been wrong: I had used the half-height of the lens as its half-width, and that was why I ruled out lamp positions that were actually in frame. With that fixed, the lamp moved 4 cm left and the door opened to 150°. Then the poster read: a doorway with a blank-eyed blob wedged in it, its top cut by the lintel, and him beside it in the hall. The eye holes on the front door didn't survive. They're behind the blob now, and that is written down above.
