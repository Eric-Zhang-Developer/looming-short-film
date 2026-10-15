# Brief · snd-score-reveal

**Type:** builder · **Wave:** 6 (early) · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/05-sound.md`, `done/snd-score.md`, `done/snd-score-clicks.md`, `done/sb-reconcile.md` (the score item under Gaps), `src/timeline.js`, `src/audio/score.js`

## Goal
`sb-reconcile` added beat names, including the reveal beats, and the score's reveal chords don't land on them. Re-anchor every score event that the done note flags, plus any event still placed by an offset from a far-away beat when a closer named beat now exists, onto the new beat names.

## Owns
- `src/audio/score.js`
- `evidence/snd-score-reveal/`, `done/snd-score-reveal.md`

## Acceptance
- [ ] Each flagged event is listed with its old and new anchor, and its time error is 0 against the target beat
- [ ] `node tools/mix.mjs && node src/audio/selftest.js`: all 5 checks pass; mix in linear mode, -14 ±0.5 LUFS
- [ ] Byte-identical over two runs
- [ ] Updated `timeline.png` (same method as `evidence/snd-score/`), viewed
