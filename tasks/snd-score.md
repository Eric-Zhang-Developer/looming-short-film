# Brief · snd-score

**Type:** builder · **Wave:** 6 (started early) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/05-sound.md` (all, especially §Leitmotifs and §Structure by section), `docs/02-story.md` §beat sheet, `src/timeline.js`, `docs/contracts.md` §src/audio, `done/snd-engine.md`, `src/audio/` as merged

## Goal
Write the film's score as code: the leitmotifs and the section-by-section structure from doc 05, rendered into the music stem by `tools/mix.mjs`.

## Owns
- `src/audio/score.js` (new)
- `tools/mix.mjs` (only to render the score into the music stem)
- `evidence/snd-score/`, `done/snd-score.md`

Do **not** touch `foley.js`, `cues.js` or `synth.js`. If you need a new voice, write it locally in `score.js` and note it under Gaps.

## Spec
- `score.js` exports `SCORE`, a list of `{ beat, motif, ... }` or note events anchored to **beat names** from `src/timeline.js` (offsets in seconds from a beat are fine). Never raw global times, so retiming a shot moves the music. It also exports `renderScore(durSec) → Float32Array` (stereo is fine; match what mix.mjs expects).
- Use the doc 05 voices: felt piano, music box, pads, sub swell. Leitmotifs must be recognisable when they return (same intervals and rhythm).
- Respect doc 05's silences. The film is wordless; music carries emotion but must leave room for the lamp clicks (they stay dry and exposed).
- After your change, `node tools/mix.mjs` lands the full 180 s mix at -14 LUFS ±1 with true peak ≤ -1 dBTP, and stays byte-identical across two runs.

## Acceptance
- [ ] Full mix renders, loudness in range (paste the mix.mjs line)
- [ ] Byte-identical over two runs
- [ ] `evidence/snd-score/spectrogram.jpg` of the full music stem, plus a per-section timeline image, both viewed
- [ ] `evidence/snd-score/score.mp3` (≤2 MB, 96 kbps is fine) so the director can listen
- [ ] `node src/audio/selftest.js` still passes
- [ ] A section-by-section description of what you wrote and why, tied to doc 05
