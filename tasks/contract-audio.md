# Brief · contract-audio

**Type:** builder · **Wave:** 6 (early) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/05-sound.md` §Sync and §Mix, `docs/contracts.md` §src/audio, `done/snd-engine.md`, `done/snd-foley.md`, `done/snd-score.md`

## Goal
Close two mix-level gaps found by the sound builders, without breaking the audio contract.

## Owns
- `tools/mix.mjs`, `src/audio/cues.js`, `src/audio/selftest.js`
- `src/audio/foley.js` (signatures only, no sound changes)
- `docs/contracts.md` §src/audio (additive edits only)
- `evidence/contract-audio/`, `done/contract-audio.md`

## Spec
1. **Click identity in the final mix.** Doc 05 says the three lamp clicks are the same sound. They are sample-identical in the foley stem but not in `mix.wav`, because loudnorm runs in dynamic mode (premix PLR 16.1 dB > 12.5). Make the master path deterministic and position-independent: e.g. a fixed-parameter limiter/compressor on the music stem (written in Node, seeded nothing, no lookahead that depends on neighbouring cues beyond its own window), then **linear** loudnorm to -14 LUFS ±0.5, ≤ -1 dBTP. If you change the approach, say why. Add a selftest check that the three clicks are sample-identical in `mix.wav`, within ±1 LSB.
2. **Bed durations.** Beds mix `(seed, dur)` and `(seed, { dur })` signatures, and `mix.mjs` passes no duration. Pick one signature for beds, convert the two old ones, let a cue carry `dur` (or `until: '<beatName>'`), and have `mix.mjs` pass it. Document it in contracts.md.

## Acceptance
- [ ] Mix line pasted: -14 ±0.5 LUFS, ≤ -1 dBTP, **linear** mode
- [ ] Selftest passes, including click identity in `mix.wav`
- [ ] Byte-identical over two runs
- [ ] A test cue for one bed with a `dur` plays its full length (show it in the stem)
- [ ] `node tools/check_timeline.mjs` passes
