# Brief · snd-score-clicks

**Type:** builder · **Wave:** 6 (early) · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/05-sound.md` §Sync, `done/snd-score.md`, `done/contract-audio.md`, `src/audio/score.js`, `src/audio/selftest.js`

## Goal
Doc 05 keeps every lamp click dry and exposed. `selftest.js` now checks that the three clicks are sample-identical in `mix.wav`, and it fails by 8 LSB at the home click (36.5 s). The piano and reverb tail of the groove's bar −1 stabs (35.5 s) is still sounding under it.

## Owns
- `src/audio/score.js`
- `evidence/snd-score-clicks/`, `done/snd-score-clicks.md`

## Spec
Make the score silent (true zero in the music stem) across each lamp click's own window, for all three clicks, by ending or fading notes and tails before the click. Do it with beat-relative times, not raw seconds, and keep the musical intent: the Exam motif entry right after the click stays. Do not loosen the selftest.

## Acceptance
- [ ] `node tools/mix.mjs && node src/audio/selftest.js`: all checks pass, including click identity in `mix.wav` (≤ 1 LSB)
- [ ] Mix still -14 ±0.5 LUFS in linear mode (paste the line)
- [ ] Byte-identical over two runs
- [ ] Music-stem level in each click window printed (should be 0)
