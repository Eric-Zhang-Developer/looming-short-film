# Done · snd-engine

## What shipped
The `src/audio/` contract in plain Node: `synth.js` (feltPiano, musicBox, pad, subSwell, noise, lowpass/highpass/bandpass, env, mixInto), `foley.js` (lampClick, penUncap, inkDrip, paperRustle, fluorescentHum, plus throwing stubs for the rest of doc 05's table), `cues.js` (3 lamp clicks, penUncap, inkDropForms → inkDrip, all by beat name), `wav.js` (32-bit float writer). `tools/mix.mjs` renders cues plus a placeholder Exam-motif bed, writes stems and a two-pass-loudnorm mix, and prints LUFS and true peak. `src/audio/selftest.js` checks the clicks, determinism and stubs.

## Where it lives
`src/audio/{synth,foley,cues,wav,selftest}.js`, `tools/mix.mjs`, `evidence/snd-engine/`. Branch `task/snd-engine`: 1f35664 (engine), a330d5a (evidence), then this note.

## How it was checked
- [x] `node tools/mix.mjs --range=30:45` writes stems and mix and prints loudness: **-23.3 LUFS, -1.5 dBTP** (`evidence/snd-engine/loudness.txt`). True peak passes. LUFS misses -14 because this range holds one lamp click in 15 s of silence; loudnorm falls back to dynamic mode and can't raise a lone transient to -14 LUFS under the peak ceiling. Excerpt: `mix_30_45.wav` (10 s, 32–42 s, 1.92 MB).
- [x] Full 180 s mix renders in **16.0 s** wall time on an Apple M2 (`timing.txt`). Result: **-14.5 LUFS, -1.2 dBTP** (ebur128 on the final file).
- [x] Byte-identical across two runs: mix `126cd3a0…87f7` both times, and all three stems match (`hashes.txt`). The 30:45 mix also matches (`5fb9e7c2…6deb`).
- [x] Spectrograms `lampclick_spec.png` and `piano_c4_spec.png` (plus `*_wave.png`), viewed with Read. The first pass showed two bugs: the filament tink was a 0.4 s pure tone cut off with a splash, and the piano had a full-band vertical line at 1.8 s where the damper hit a hard edge. Both were fixed, and the images were regenerated and re-read.
- [x] The three lamp clicks are sample-identical in the float foley stem (`selftest.txt`: deepEqual of ±0.1 s windows at 36.5, 100.5 and 164 s). In the final normalized 16-bit mix the max diff is 0 too.
- [x] Honest read (**I can't listen; this comes only from spectrograms, waveforms and the synthesis code**). The click is a sharp broadband tick with a woody 820/1750 Hz "tock" and a second tick 11 ms later. The tink is about 25 dB below it and may vanish on laptop speakers. The piano C4 is dark and soft, with partials only up to ~2 kHz and a smooth single-stage decay. It probably reads as a mellow synth or electric piano rather than a real felt piano, and the Schroeder tail may sound slightly metallic.

`node tools/check_timeline.mjs` → `ok (18 shots, 16 beats, 180.0s)` (timeline untouched).

## Gaps
- **-14 LUFS is not exactly met.** The full mix is -14.5 LUFS and the 30:45 range is -23.3, because the mostly silent timeline forces loudnorm into dynamic mode. This should converge once ambience and score fill the timeline. I didn't add a limiter or loosen the target.
- loudnorm targets **-1.5 dBTP**: at -1 the final 48 kHz file measured -0.8 dBTP after loudnorm's 192 kHz resample.
- The click identity in the final mix holds because each click sits in silence. Dynamic loudnorm gain depends on context, so once ambience runs under the clicks the mix-level identity should be re-checked. The synthesized buffers stay identical regardless.
- The ambience stem is silent. No ambience cue is in the brief's wiring, and `fluorescentHum` exists but isn't cued.
- Stems and mix are dual mono (L = R). Voices are mono, and there's no panning or stereo reverb yet.
- `lampOffHome` (doc 05 says "on and off at home") is not cued. The brief wires only three clicks. That makes four clicks, so this is a director call.
- Things I picked because the spec was silent (all reversible): Exam motif notes C5, E5, A5, D#5 at +14, −10, +18, −12 cents, 0.55 s apart, starting 0.3 s after `inkDropForms`. Cue gains of 0.7 to 0.8. The `subSwell` default attack is dur/2. Cues may carry optional `stem` and `seed` fields, and `synth.js` also exports `SR` and `bandpass` (additions only).
- The piano is only exercised by the selftest and the solo WAV. Nothing in the mix uses it yet.

## State
built · 2026-10-15
