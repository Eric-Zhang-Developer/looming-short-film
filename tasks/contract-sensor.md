# Brief · contract-sensor

**Type:** builder · **Wave:** 4 · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `done/spec-sensor.md` (the code-change list), `docs/shots/README.md` (the sensor fixture section), `docs/05-sound.md`, `docs/contracts.md` (§lights, §timeline, §audio), `src/lights.js`, `src/timeline.js`, `src/audio/cues.js`, `src/audio/foley.js`

## Goal
Make the code match the merged spec: Marston's light is a ceiling fluorescent on a motion sensor. This is the contract half only; shots are reworked later.

## Owns
- `src/lights.js` (add `sensorLight`; additive), `src/timeline.js` (beat renames), `src/audio/cues.js`, `src/audio/foley.js` (the `sensorWake` sound), `src/audio/selftest.js`
- every `src/shots/*.js` line that **names** a renamed beat: a mechanical rename only, nothing else in those files
- `docs/contracts.md` (§lights, §timeline, §audio; additive)
- `evidence/contract-sensor/`, `done/contract-sensor.md`

## Spec
1. **`sensorLight(opts)`** in `lights.js`: the louvred trough from the README (position, size, colour per Q12's current option), returning `{ light, update(t, { wake, timeoutAt }) }` or similar. Stutter-on: a relay at the wake time, then three strikes at the README's offsets. Time-out: the reverse stutter. The flicker is a pure function of t from a seeded RNG, no clocks. Document it in contracts.md.
2. **Beat renames** in `timeline.js` per the done note (`lampClickMarston` → `sensorWake…`, etc.). Times unchanged. Update every reference in `src/` (shots, cues, score) mechanically. `check_timeline.mjs` must pass.
3. **Sound:** add a `sensorWake` foley sound (a relay clack, then the fluorescent ping and hum, synthesized like the rest of `foley.js`) with the same buffer at s15 and s18; s16 is silent (Q2). Add the missing `lampOffHome` click with the home lamp's click buffer. Re-render `out/audio/mix.wav` with `tools/mix.mjs`. The selftest must pass, with a check that s15's and s18's wake buffers are identical.

## Acceptance
- [ ] `node src/core/selftest.js` and `node src/audio/selftest.js` pass
- [ ] `check_timeline.mjs` is ok; `git grep -n lampClickMarston src` is empty
- [ ] `determinism.mjs --t=36.5,100.5,109.4` passes (one Chrome, foreground, then closed)
- [ ] `evidence/contract-sensor/sensor_strip.jpg`: the lab or a minimal page showing the stutter-on over 0.5 s, rendered at `--w ≤ 960`
- [ ] The mix's loudness (`ebur128` on the WAV, for now): integrated and true peak

**Memory and disk are tight.** At most one headless Chrome, foreground only, closed after each use. Delete your own scratch.
