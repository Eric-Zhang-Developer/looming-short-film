# Brief · snd-engine

**Type:** builder
**Wave:** 2 (parallel track) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/05-sound.md` (all), `docs/contracts.md` §Conventions and §src/audio, `src/timeline.js`

## Goal
The offline synthesis engine and mixer, so the film's sound can be built from code and locked to beat names. Also the single most important sound in the film: the lamp click.

## Owns
- `src/audio/`
- `tools/mix.mjs`
- `evidence/snd-engine/`
- `done/snd-engine.md`

## Inputs
- `src/timeline.js` (`beat()`, `DURATION`) and `src/core/rng.js` (seeded noise).
- `~/code/media/1776/src/audio.ts`: read it for synthesis patterns (oscillators, envelopes, echo), and port the ideas, not the file.
- `~/code/hackathons/knighthacks-2026-video/build.py`: the loudness normalization approach.
- ffmpeg is installed.

## Spec
- Implement the `src/audio/` contract in plain Node (no Web Audio, no npm audio packages). WAV writing is a small hand-written function (16-bit PCM or 32-bit float, 48 kHz, stereo).
- **Voices:**
  - `feltPiano`: a few inharmonic partials, a soft hammer-noise attack, a low-pass that opens with velocity, and a short room reverb (a simple feedback delay network or comb/allpass set is fine).
  - `musicBox`: a sine plus a bright partial with fast decay.
  - `pad`: detuned saws through a slow low-pass.
  - `subSwell`: as specified.
- **Foley now:** `lampClick` (a dry plastic click plus a tiny filament "tink"), `penUncap`, `inkDrip`, `paperRustle`, `fluorescentHum` (a 120 Hz buzz with harmonics). Add stubs that throw "not implemented" for the rest of doc 05's table, so the cue list is complete.
- `CUES`: wire the three lamp clicks (`lampClickHome`, `lampClickMarston`, `lampClickFreshman`), `penUncap`, `inkDropForms` → `inkDrip`. All by beat name.
- `tools/mix.mjs`: render cues onto a 180 s timeline (or `--range`), plus a placeholder music bed of the Exam motif (four music-box notes, slightly detuned) at `inkDropForms`. Write the stems and the mix, loudness-normalize to −14 LUFS with ffmpeg `loudnorm` (two-pass), and print measured LUFS and true peak.
- **Deterministic:** the same command gives a byte-identical mix (hash it twice).

## Acceptance
- [ ] `node tools/mix.mjs --range=30:45` writes stems and a mix; LUFS and true peak printed (≤ −1 dBTP)
- [ ] The full 180 s mix renders; the run time is recorded
- [ ] Byte-identical mix across two runs (hashes)
- [ ] A spectrogram PNG of the lamp click (`ffmpeg -lavfi showspectrumpic`) and of the felt-piano C4 note, viewed with Read
- [ ] The three lamp clicks are sample-identical (compare the buffers)
- [ ] Honest one-line read of how the piano and click probably sound, from spectrograms and waveforms. You can't listen, so say so.

## Evidence required
`evidence/snd-engine/`: `mix_30_45.wav` (short; under 2 MB, or use a 10 s excerpt), `lampclick_spec.png`, `piano_c4_spec.png`, `loudness.txt`, `hashes.txt`, `timing.txt`.

## Out of scope
The full score and remaining foley (later sound wave). Muxing with picture.
