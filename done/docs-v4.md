# Done · docs-v4

## What shipped
- `docs/10-submission.md` now describes the v4 film: a 3:15 runtime, the 3 a.m. turn (phone face down, nightstand lamp on, the walk, the light from above at Marston's door), the clock motif and the single-job rule. Every claim is tagged built or planned.
- `docs/03-art-direction.md` rules 2 and 8 follow v4 (Marston's light is a warm pendant from above and stays on). The palette row and three color-script rows that only restated the sensor behaviour were fixed too.
- `docs/07-process-log.md` gains four dated entries (close-up heads and clock freeze, Q16/Q17, the `out/` swap, the render crash and resume fix). Story v4 approved and the 1080p master were already logged.
- New `docs/12-making-of/12-the-walk.md` (1,970 words by prose count, 2,004 by `wc -w` with link paths) and its README line plus five timeline rows.

## Where it lives
Branch `task/docs-v4`: `d1326e6` doc 10, `04e68fa` doc 03, `cc68d82` doc 07, `07d8315` chapter 12 and the README, and this note's commit.

## How it was checked
- [x] **Doc 10 grep** (`grep -n -i "sensor\|custodian\|janitor\|blinds" docs/10-submission.md`). Both lines say the things were cut:
```
88:- **Grounding in a real place, which changed the story twice.** Research found no desk lamps at Marston, which broke our first climax, a lamp click. We rebuilt it around motion-sensor lights (Oct 15). Then the director watched v3 and said the turn was wrong: the real turn is that you decide to go to the library. The motion-sensor lights, the custodian, the blinds and the stacks were all cut, and the walk to the library became the climax (Oct 17). [now: decided; `docs/07-process-log.md`, `docs/02-story-v4-draft.md`]
145:- **Motion sensors at Marston:** moot. The sensors were cut in v4, so nothing in the film depends on how Marston's lights behave.
```
- [x] **Chapter 12 evidence paths.** A script resolved every relative link in the chapter against the repo: 29 targets (docs, done notes and 14 evidence files), 0 missing. The 12 commit hashes it cites all resolve with `git cat-file -e`.
- [x] **Chapter length.** 1,970 words with link targets stripped; 2,004 raw.
- [x] **Doc 03 after the edit:** `grep -n -i "sensor\|woken\|trough\|relay" docs/03-art-direction.md` returns only rule 8, which says there are none.
- [x] **No render, no Chrome, no code touched.** Only `docs/` and `done/` changed (`git diff --stat af484c4..`).
- [ ] **Not verified:** that the film itself matches the new text. I read specs and done notes; I watched nothing, and no full v4 render exists in the record.

## Gaps
**Claims I left out because I couldn't trace them**
- When the director gave his v3 notes. The docs date the brief (Oct 17, 22:33) but not the notes; chapter 12 says "his notes on v3" without a time.
- Who froze the close-up heads and clock. The commit says "under the director's v4 approval" and the picks table lists alternatives, so the chapter and doc 07 say "frozen", not "the director picked".
- Any statement that v4 reads, plays or sounds right. No render, cold viewer, listen or flash check of v4 is recorded.
- The final render, captions and flash check: described only as planned.
- "Century Tower": doc 02 names it, but no done note confirms it is in the walk shot, so doc 10 says "a campus path lit by street lamps".
- Whether Marston's lights are really on sensors: moot, and doc 10 now says so.

**Doc 10 edits beyond the sensor lines (all traceable, all small)**
- Runtime 3:00 to 3:15; the 10 MB budget re-derived (about 410 kbit/s; the 14 MB estimate scales to about 15 MB, from the same 3.5 MB per 44 s).
- Counts refreshed: 277 commits and 88 done notes (counted on this branch), 16 frozen images from 52 variant sidecars. The old "19 generations, 3 frozen" is gone.
- The Oct 15 "process line" is tagged stale; the "deadline unconfirmed" open item points at the organisers' phone call.
- "Nearly wordless", because sparse text was allowed on Oct 15.

**Stale lines in doc 03 I left alone (outside rules 2 and 8)**
- Line 62, "Quiet 1" desaturation; rule 5's "Marston stacks"; rule 6's "phone and fluorescent at Marston"; the Characters line naming the custodian; the "On-screen text" ban in the banned list, which the Oct 15 text rule overrules. Say the word and I'll fix them.

## Director must confirm before submitting
1. The synopsis's new turn paragraph and the clock paragraph describe the film he intends; he hasn't watched a full v4 render.
2. The numbers: 277 commits, 88 done notes, 16 frozen images, 52 variants, the 410 kbit/s budget.
3. The process line (drop or reword), the irony line, and the department fields, still open.
4. Venue claims in Project Context are still "planned: venues not arranged".
5. Captions and the flash check are promised as "planned"; remove those lines if they won't exist by Sunday 11:59 PM.
6. That the YouTube link and the repo URL go in the form.

## State
built · 2026-10-18

## Story
The brief said the submission text described a film that no longer existed, and the first read confirmed it: four sensor mentions, a "3:00 film", and a custodian-era climax. The hard part wasn't the rewrite, it was tracing. v4's facts are scattered across a story draft, eight done notes and two docs, and nearly every number had a v3 or G4 twin that was now wrong (the 2x peak, the night-light, the stacks). I checked each claim I carried over against the done note that built it, which is how I found that the blob peaks at 2.5x and that the Q17 lamp is the nightstand, not a night-light, even though the story draft still says "hallway light".

Chapter 12 came together around two moments the notes tell well: the camera standing next to the lamp can't see its own shadow, and the sound agent's meter saying bed rot was louder than the door push. Cutting it to 2,000 words meant dropping several smaller catches, such as the grep that logged two mean lumas as 0. The render crash was the one event traceable only through a commit message, so the chapter says what the message says and no more. The closing section is deliberately blunt: v4 is built and measured, and nobody has seen or heard it.
