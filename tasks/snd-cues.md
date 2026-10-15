# Brief · snd-cues

**Type:** builder · **Wave:** 4 (temp sound for the animatic) · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/05-sound.md` (all), `docs/contracts.md` §src/audio (cue fields: `beat`, `offset`, `dur`, `until`, `stem`, `gain`), `src/timeline.js`, `src/audio/cues.js`, `src/audio/foley.js`, every `docs/shots/sNN.md` §Sound, `docs/shots/QUESTIONS.md` (Q2: the neighbour's click is seen, not heard)

## Goal
Place every foley and ambience cue the 18 shot specs and doc 05 call for, so the animatic has its temp sound.

## Owns
- `src/audio/cues.js`
- `evidence/snd-cues/`, `done/snd-cues.md`

## Spec
- Every cue keys off a beat name plus an `offset`. Never raw time. Beds use `dur` or `until`.
- Use only sounds that exist in `FOLEY`. If a spec asks for one that doesn't, list it under Gaps; don't write synthesis.
- Keep the three lamp clicks exactly as they are. Follow QUESTIONS.md's current options (Q2: no neighbour click).
- Leave doc 05's silences silent (Quiet 1, Quiet 2).

## Acceptance
- [ ] A table in the done note: each shot's spec'd sound → the cue placed, or why not
- [ ] `node tools/mix.mjs && node src/audio/selftest.js`: all checks pass, linear mode, -14 ±0.5 LUFS (paste the line)
- [ ] Byte-identical over two runs
- [ ] `evidence/snd-cues/stems.png`: the three stems over 180 s with shot boundaries marked, viewed
- [ ] `evidence/snd-cues/mix.mp3` (≤ 2 MB) for the director
