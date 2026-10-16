# Brief · snd-g4

**Type:** builder (audio) · **Wave:** 5b · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md`, `docs/05-sound.md` (the cue table and the rename map under it), `docs/02-story.md`, `src/timeline.js`, `src/audio/` (all), `tools/mix.mjs`, `docs/contracts.md` §audio, the `snd-*` done notes, `evidence/spec-g4/dropped_beat_refs.txt`

## Goal
The sound follows the 3:15 G4 cut. Director: "I really like the noises here. It's odd and I like how it's so animated." Keep that voice; extend it, don't clean it up.

## Owns
`src/audio/**`, `tools/mix.mjs`, `docs/05-sound.md` (the prose that spec-g4 left stale: structure times, sensor-wake prose, the leitmotif shrink line), `out/audio/` (generated), `evidence/snd-g4/`, `done/snd-g4.md`

## Spec
1. **Fix the break:** seven beats were renamed or removed (rename map in doc 05). `cues.js` imports again, `score.js` never throws, and the audio selftest passes.
2. **Re-time** every existing cue and the score to the new beat names and times (195 s).
3. **New cues** from doc 05's table, in the same odd, animated voice:
   - notification buzz (s00)
   - laptop game blips (home)
   - one rattle per blind (s07), with the blob's gulp after each
   - pencil scratch and a crossing-out (practice)
   - the exam-room hush (s17b)
   - the paper slide when the grade comes back (s17c)
   - the ink soaking into the calendar (s18)
   - the tag's small motif reprise
   The motif resolves at the grade.
4. **Loudness:** integrated **−16 LUFS ±1**, true peak **≤ −4 dBFS** (v1 was −13.9 / −1.6). Measure the final `out/audio/mix.wav` with ffmpeg `ebur128=peak=true`.
5. Determinism: the mix renders bit-identically twice.

## Acceptance
- [ ] `node tools/mix.mjs` writes `out/audio/mix.wav` at 195.0 s; selftest output in the done note
- [ ] ebur128 output in `evidence/snd-g4/loudness.txt` within target
- [ ] `evidence/snd-g4/cues.txt`: every cue with its time and beat name; the new ones marked
- [ ] Two mixes hash identically
- [ ] `check_timeline` ok
- [ ] The done note ends with `## Story`. The director singled out the sound for the making-of, so tell how the new cues were designed by an agent that can't listen.

**Machine:** if anything needs headless Chrome, one at a time, foreground only, closed after use. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap.
