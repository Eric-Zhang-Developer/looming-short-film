# Done · snd-score-clicks

## What shipped
`renderScore` now ends with `gateClicks`: the music stem is faded out over 40 ms before each lamp click, held at true zero for the click's 0.3 s, and faded back in over 20 ms. Beats are `lampClickHome`, `lampClickMarston`, `lampClickFreshman`, so a retimed click moves its gap. The Exam motif at 36.85 s is untouched and still enters right after the click.

## Where it lives
`src/audio/score.js` (commit below), `evidence/snd-score-clicks/`. Branch `task/snd-score-clicks`: the `snd(score): gate the music stem...` commit, then the evidence commit, then this note.

## How it was checked
- [x] `node tools/mix.mjs && node src/audio/selftest.js`: all checks pass (`evidence/snd-score-clicks/selftest.txt`). Click identity in mix.wav: `max diff vs lampClickMarston [0,0,0] LSB over 14400 samples each, peak 25211 LSB`.
- [x] Mix: `mix.wav  integrated -14.0 LUFS  true peak -2.1 dBTP (ebur128)  /  -13.96 LUFS, -2.28 dBTP (loudnorm pass 2)  target -14 LUFS, ≤ -1 dBTP`, `loudnorm linear` (`run1.txt`).
- [x] Byte-identical over two runs: mix and all three stems hash the same (`hash1.txt` = `hash2.txt`, `cmp` printed IDENTICAL). mix `f0292820…a0a09`.
- [x] Music-stem level per click window (`levels.txt`, from `levels.mjs`): Home 36.5 s, Marston 100.5 s, Freshman 164 s all peak 0, rms 0, 0 non-zero samples.

## Gaps
- Not heard, only measured. The fades are 40 ms out and 20 ms in; on the reverb tails (about -72 dBFS at the home click) they should be inaudible, but at Marston and Freshman the gate also cuts any note still sounding. At present only tails reach those windows (I did not measure what the gate removed there).
- The gate is a stem-level mask, not a per-note edit. A future score note that is meant to sound on a click will be silenced there by design (doc 05: clicks dry and exposed).
- The 0.3 s click length is a constant in `score.js` matching `FOLEY.lampClick`'s length (0.3 s). If the click is lengthened, update `CLICK_LEN`; the selftest would then fail on the tail.
- No contract change needed.

## State
built · 2026-10-15
