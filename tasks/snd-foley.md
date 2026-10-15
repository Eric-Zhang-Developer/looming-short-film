# Brief · snd-foley

**Type:** builder · **Wave:** 6 (started early) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/05-sound.md` (all), `docs/contracts.md` §src/audio, `done/snd-engine.md`, `src/audio/` as merged

## Goal
Implement every foley and ambience sound in doc 05's table that `src/audio/foley.js` still stubs with `todo(...)`: penScratch, phoneHum, inkRoll, shadowGrowth, fridgeHum, controllerClick, drill, fluorescentFlicker, mopOnTile, paperBoil, dawnBirds. Also add any doc 05 sound not in the file yet.

## Owns
- `src/audio/foley.js`
- `evidence/snd-foley/`, `done/snd-foley.md`

Do **not** touch `cues.js`, `synth.js` or `tools/mix.mjs`. Placing cues waits for the animatic. If you need a new synth primitive, write it as a local helper in `foley.js` and note it under Gaps.

## Spec
- Each sound is `(seed) => Float32Array` at 48 kHz, deterministic, and finite. Beds (hums, ambience) take a duration: `(seed, dur)`. Document the signature in a one-line comment.
- Match doc 05's descriptions. All sound is synthesized: no samples, no downloads.
- Write each sound to `out/audio/solo/<name>.wav` with a small script under `evidence/snd-foley/`, and render a spectrogram PNG per sound (ffmpeg `showspectrumpic`). Look at each one with the Read tool and fix anything clipped, DC-offset, or obviously wrong (hard edges, silence).
- Extend `src/audio/selftest.js`? No, you don't own it. Put your determinism check (render twice, compare hashes) in `evidence/snd-foley/check.mjs` and save its output.

## Acceptance
- [ ] No `todo(` left in `foley.js`
- [ ] Every sound deterministic (hash table in evidence)
- [ ] Spectrogram contact sheet `evidence/snd-foley/spectra.jpg`, each viewed
- [ ] `node src/audio/selftest.js` still passes (after `node tools/mix.mjs`)
- [ ] An honest one-line guess per sound of how it will sound, since you can't listen
