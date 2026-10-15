# Brief · mod-timeline

**Type:** builder
**Wave:** 2 · batch 1 · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (Conventions + your section), `docs/04-technical.md` §Timeline, `docs/02-story.md` §Beat sheet, `docs/06-production-plan.md` §Shot list, `docs/05-sound.md` §Foley

## Goal
The film's single source of timing truth: 18 shots and every named beat, with a checker that keeps it honest. Picture and sound both hang off these names.

## Owns
- `src/timeline.js`
- `tools/check_timeline.mjs`
- `evidence/mod-timeline/`
- `done/mod-timeline.md`

## Inputs
Doc 06 shot list (times and ids). Doc 02 beat sheet (beat moments). Doc 05 cue names (lamp clicks at 0:36, 1:40, 2:44).

## Spec
- Implement `SHOTS`, `shotAt`, `beat` and `DURATION` per contracts.
- Shot ids are `s01`–`s18`, with starts and durations taken from doc 06 so they tile 0–180 s.
- Beats get camelCase names unique across the film, at minimum: `inkDropForms`, `phoneUp`, `lampClickHome`, `lampOffHome`, `curtainsDone`, `quiet1Start`, `headLift`, `custodianPass`, `lampClickMarston`, `penUncap`, `nameWritten`, `problemOneSolved`, `quiet2Start`, `nextSemester`, `lampClickFreshman`, `blobYawn`.
- Each beat sits in the shot that contains it, in local time.
- `check_timeline.mjs` fails on gaps, overlaps, a total outside 180 ±5 s, duplicate beat names, or beats outside their shot. It prints a table of shots and beats with global times.

## Acceptance
- [ ] `node tools/check_timeline.mjs` passes and prints the table
- [ ] Introducing a deliberate gap (in a temp copy) makes it fail with a clear message (show the output)
- [ ] Every beat listed in this brief exists
- [ ] Global beat times match doc 02 within ±1 s (list any you moved and why)

## Evidence required
`evidence/mod-timeline/`: `check.txt`, `check_fail.txt`.

## Out of scope
Shot modules, `index.html`, audio.
