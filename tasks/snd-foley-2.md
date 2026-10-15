# Brief · snd-foley-2

**Type:** builder · **Wave:** 6 (early) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/05-sound.md`, `docs/contracts.md` §src/audio, `done/snd-foley.md`, `done/snd-cues.md` (Gaps), `src/audio/foley.js`, `src/audio/cues.js`

## Goal
Synthesize the eleven sounds the shot specs ask for that `FOLEY` lacks, then place them: thumb-flick and scroll ticks, jar clinks, carton sloshes, TV bloops, roommate footsteps, a win jingle (game, not music), ladder creaks, rod snap, curtain swishes and a card tap. Also fix the placed sounds that miss their spec (drill pulls ~0.3 s off, `shadowBreath` at 4.5 s instead of 5 s, mop stroke rate).

## Owns
- `src/audio/foley.js`, `src/audio/cues.js`
- `evidence/snd-foley-2/`, `done/snd-foley-2.md`

## Spec
- Same rules as snd-foley: `(seed)` or `(seed, dur)`, deterministic, synthesized only, a spectrogram per sound, viewed.
- Place each new sound per its shot spec, by beat name and offset.
- Don't touch the lamp clicks. Respect the click gaps and the Quiet sections.
- Don't touch `tools/mix.mjs`. If headroom (PLR ≤ 12.5 dB for linear mode) won't fit the levels the specs want, place them at the level that fits and list the shortfall.

## Acceptance
- [ ] Every sound in the done-note table placed, or a stated reason why not
- [ ] `node tools/mix.mjs && node src/audio/selftest.js`: all pass, linear, -14 ±0.5 LUFS
- [ ] Byte-identical over two runs
- [ ] `evidence/snd-foley-2/spectra.jpg` viewed; `mix.mp3` ≤ 2 MB
