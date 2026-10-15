# Done · contract-sensor

## What shipped
The code matches the merged sensor spec. `sensorLight` (a pure-`t` level, a `SpotLight` and the `sensor_trough` mesh) is in `src/lights.js`. The three zone beats are renamed with times unchanged. A `sensorWake` foley sound is cued on s15 and s18 with one seed and gain, and the home lamp's off click is cued. `out/audio/mix.wav` is re-rendered. Contract docs are updated.

## Where it lives
Branch `task/contract-sensor`:
- `4cdb3cd` `src/lights.js`: `sensorLight`, `sensorLevel`, `SENSOR_WAKE`, `SENSOR_SEED`
- `5924f93` `src/timeline.js`, `src/audio/{cues,foley,score,selftest}.js`
- the docs and evidence commit: `docs/contracts.md`, `evidence/contract-sensor/`, this note

`sensorLight({ at = [0, 0.127, 0.040], aimAt = [0, 0, 0.098], intensity = 0.8, angle = 0.8, penumbra = 0.5, seed })` returns `{ light, group, tube, update(t, { wake, timeoutAt }) → level, level(t, opts) }`.

## How it was checked
- [x] `node src/core/selftest.js` → `selftest: all passed`. `node src/audio/selftest.js` → all `ok`, after a full `node tools/mix.mjs`. It now checks the lamp pair (home on, home off) and the wake pair (s15, s18) in `foley.wav` (sample-identical) and `mix.wav` (max diff 0 LSB each), and that there is no cue on `sensorWakeNeighbor`.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`. `git grep -n lampClickMarston src` → empty (and Neighbor, Freshman). No `src/shots/*.js` named a renamed beat, so no shot file changed.
- [x] `node tools/determinism.mjs --t=36.5,100.5,109.4` → three `PASS` and `determinism: PASS` (`evidence/contract-sensor/determinism.txt`).
- [x] `evidence/contract-sensor/sensor_strip.jpg` (13 frames, 0–0.5 s at 24 fps, `--w=320 --cols=5`) from `sensor.html`. Dark at frame 0, then 0.9, 0.1, 0.1, 1.0, 0.2, 0.2, 1.15, then settled at 1: three strikes, the third catching. I looked at it.
- [x] Loudness of `out/audio/mix.wav`, `ebur128` (`evidence/contract-sensor/loudness.txt`): integrated **-13.9 LUFS**, true peak **-1.7 dBTP**, LRA 20.1 LU. This is the same loudnorm target as before; I did not measure the before.
- [x] `sensorLevel` timeout equals s11's `tubeLevel` exactly: 0 mismatches over 435 sampled times in 4.2–5.0 and around it (scratch script, not kept).

## Gaps
- **Wake keys are exact frames.** README §3's 0.042, 0.083, 0.167, 0.208, 0.292, 0.375 are 1, 2, 4, 5, 7 and 9 frames of 24 fps rounded to ms. I used k/24 plus a 1e-6 slack, because at t = 1/24 the rounded 0.042 key would have been missed. This is a spec-silent choice.
- **`sensorWake` is 0.65 s, not 0.3 s,** so the hum can rise under it and hand over to the bed. Beds and the score stay out for 0.65 s after a wake (`ON()` in `cues.js`, `CLICKS` in `score.js`). The off click's window is 0.17 s; `paperBoil` now breaks around it.
- **The lamp-click identity check compares 0.17 s, not 0.3 s,** because `lampOffHome`'s spring-back rustle (s06 spec) starts at +0.17 s. It also asserts the click's tail past 0.17 s is under 1% of its peak (0.061%). Not a weakened check, but a changed window.
- **s14's three `fluorescentFlicker` cues** at `custodianPass` + 3.7 / 4.0 / 4.25 (the spec-sensor note's item 2) are not added. The brief didn't list them. `docs/05-sound.md` still has "three lamp clicks" wording; I don't own it.
- **The trough's tube emissive and the sensorLight look in a real shot are not verified.** The strip is a minimal page (wall, desk, blob mark, no phone). The tube faces down, so it isn't visible from the front.
- **Shot docs** s06, s15, s16 and s18 still name the old beats until a doc pass. Shots haven't adopted `sensorLight`; that is the shot rework.
- `determinism.mjs` logged 7 `404`s from the page (missing resources). It still passed. I didn't chase them; I changed no shot or asset code.

## State
built · 2026-10-15
