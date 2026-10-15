# Done · contract-audio

## What shipped
- **Master path.** The music stem gets a fixed +5 dB makeup into a sample-peak limiter at -6 dBFS (2 ms attack, 80 ms release, no RNG). It is in `tools/mix.mjs`, and it only touches the music stem. loudnorm now runs in **linear** mode, which is one gain for the whole file. A full mix throws if loudnorm ever falls back to dynamic.
- **Bed lengths.** Every bed takes `(seed, dur)`. A cue can carry `dur` or `until: '<beat>'`, and `offset` (the orchestrator's addition). `mix.mjs` passes the length through.
- **Room tone.** The Quiet 2 `roomTone` is the first real bed cue.
- **Selftest.** It now checks click identity in `mix.wav` and checks that a bed cue fills its span.

## Where it lives
`tools/mix.mjs`, `src/audio/{cues,foley,selftest}.js`, `docs/contracts.md` §src/audio, `evidence/contract-audio/`.
Branch `task/contract-audio`:
- 9f791f1: bed signature and cue length/offset
- c3621b2: limiter and linear loudnorm
- 6940328: contracts.md
- bc111a0: evidence
- this note

## How it was checked
- [x] **Mix line, linear** (`evidence/contract-audio/run1.txt`):
  `range 0:180 s  premix -16.69 LUFS, -4.83 dBTP  →  loudnorm linear`
  `mix.wav  integrated -14.0 LUFS  true peak -2.1 dBTP (ebur128)  /  -13.96 LUFS, -2.28 dBTP (loudnorm pass 2)`
- [ ] **Selftest: FAIL on the new mix.wav click check** (`selftest.txt`, exit 1). The other four checks pass, including foley-stem click identity and the bed span. Measured diffs against the Marston click:
  - Marston vs Freshman: **1 LSB** (pass)
  - Home vs Marston: **8 LSB** (fail)

  The cause is not the master path:
  - `linear_check.txt` shows `mix.wav = g·premix` to **0.50 LSB** (rounding only) over all 8,640,000 samples, with g = +2.690 dB. Equal input therefore gives equal output anywhere in the film.
  - The same file shows **7.66 LSB of music under the home click**, against 0.00 under Marston and 0.59 under Freshman.
  - That music is the piano/room-reverb tail of the groove's last stop-time stabs (`score.js`, bar −1, 35.5 s), still ringing at 36.5 s.

  See Gaps.
- [x] **Byte-identical over two runs.** `run1.txt` and `run2.txt` are identical:
  - mix: `7ee748a7…b1ea`
  - all three stems match
  - foley stem `25a16a0f…0c46` is unchanged from before this task
- [x] **A bed cue with a length plays in full.** `roomTone` with `until: 'nextSemester'` is non-zero from 135.00002 to 159.99998 s in the ambience stem (selftest). Picture: `stems.png`, rows music / foley / ambience over 0–180 s; the blue bar is the bed.
  `offset` and `dur` were checked with temporary edits (`offset_dur.txt`):
  - `offset: -0.25` with `until` → 134.750–160.000
  - `offset: -0.25, dur: 5` → 134.750–139.750
- [x] **Timeline check.** `node tools/check_timeline.mjs` → `ok (18 shots, 16 beats, 180.0s)` (`check_timeline.txt`).
- [x] **No sound change in foley.js.** All 19 FOLEY entries hash the same before and after the signature change, both at `seedOf(name)` and at seed 7 (scratch script; foley stem hash also unchanged).
- [x] **`--range` still works.** `--range=30:45` now also goes linear: premix -17.24 LUFS, -4.84 dBTP.

## Gaps
- **Click identity in `mix.wav` needs a score change (contract request to the `score.js` owner).** The tail of the stop-time stabs at bar −1 (35.5 s) is still ringing at the home click, at about −72 dBFS: inaudible, but not identical. To fix it, either:
  - end the bar −1 groove (or its room tail) before 36.5 s, or
  - decide that music under a click is allowed and ducked at the mix.

  I did neither. `score.js` isn't mine, and a mix-side duck would silently cut whatever a future score puts on a click. The check stays strict at ±1 LSB.
- **Check window.** The mix.wav check compares the click's own 14,400 samples, not the foley check's ±0.1 s. With the ±0.1 s padding, the home click also catches the Exam motif that `score.js` starts at 36.85 s, 50 ms after the click buffer ends, which gives a 10,502 LSB diff. I treated that motif as a separate sound after the click, not part of it. Both windows fail today, so this choice didn't buy a pass.
- **Balance change.** The music is now about 4 dB louder relative to the foley than snd-score's mix. The click stays the loudest transient (music peaks at ≤ -6 dBFS, the click at -4.83 dBTP). The limiter takes up to 5.9 dB off the loudest piano attacks: about 6% of non-silent music samples see more than 1 dB of gain reduction (prototype numbers, scratch). I can't listen to it, so it is unchecked by ear.
- **Thin margin.** The premix peak-to-loudness ratio is 11.9 dB against loudnorm's 12.5 dB linear limit. If the score gets quieter or the foley peakier, the full mix will throw. That is deliberate: it beats a silent fallback to dynamic mode. The knob is `MUSIC_MAKEUP_DB`.
- **LRA.** The target LRA is 50 (loudnorm's max), which switches off the LRA gate. The film measures LRA 16.8 LU, and doc 05 sets no LRA target. This is not a loosened acceptance item, since the brief's targets are I and TP only. Flagging it in case someone expects LRA 11.
- **TP target.** It stays at -1.5. In linear mode there is no 192 kHz resample, so -1 would now be safe. I left it alone as the smaller change.
- **Selftest exit order.** On this failure the selftest exits before writing `out/audio/solo/*.wav`, same as the existing exit-on-first-failure pattern. I put the mix.wav check last so the other checks still report.
- **Decisions where the spec was silent:**
  - stems are written post-limiter, so stems still sum to the premix
  - the `roomTone` cue's gain is 1
  - `until` is measured from the cue's start including `offset`

## State
built · 2026-10-15
