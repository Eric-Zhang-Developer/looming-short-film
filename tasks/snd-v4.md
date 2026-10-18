# Brief · snd-v4 (the tick, the pulse, the swell, the chord)

**Type:** builder (audio) · **Wave:** 6 (v4) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/02-story.md` (v4, especially "The clock" and "The swell, in sound"), `docs/05-sound.md` (the v4 cue table and the rename map under it: your spec), `src/timeline.js`, `src/audio/` (all), `tools/mix.mjs`, `docs/contracts.md` §audio, `done/snd-g4.md`, `done/spec-v4.md`, `done/climax-a2.md`, `docs/shots/QUESTIONS.md` Q16–Q17

## Goal
The sound follows the v4 cut (195 s) and carries the climax. The director asked "how do we really make this super emotional and swelling?", and the answer is in sound: at 3 a.m. the music drops out and only the clock ticks; on the walk the tick doubles into a 120 bpm pulse and the score adds one layer per lamp; at Marston's door it peaks and cuts to one held major chord, then near-silence and a breath. Keep the existing voice (the director: "I really like the noises here. It's odd and I like how it's so animated"). Extend it, don't clean it up.

## Owns
`src/audio/**`, `tools/mix.mjs`, `docs/05-sound.md` (stale prose only; the cue table is the spec, so change it only to fix an error and say so), `out/audio/` (generated), `evidence/snd-v4/`, `done/snd-v4.md`

## Spec
1. **Fix the break.** The v4 timeline renamed or removed beats (the blinds, sunrise game, the stacks, quiet 1, the custodian, the sensor wakes). `cues.js` imports, `score.js` never throws on a missing beat, and the audio selftest passes.
2. **Re-time** every kept cue and the score to doc 05's v4 table.
3. **New cues, from doc 05's table:**
   - `clockTick`: faint in s02 and s18, **alone** in s08 (about 60 bpm, the room tone under it), under s09a–s09b, calm in s17b. A paper-and-wood tick in the film's voice, not a sample-library clock.
   - **The pulse:** the tick doubles into a heartbeat at s09c's `lamp1` (84.0), 120 bpm, on the grid the timeline already uses (every lamp, `blobBlocks`, `stepAround`, `doorPush` and `lightFlood` are on whole half-seconds).
   - **The swell, one layer per lamp:** pulse (`lamp1`), felt piano with the motif **rising** (`lamp2`), strings pad (`lamp3`), a small dissonance on `blobBlocks` that resolves on `stepAround`, music box (`lamp4`), bass swell (`lamp5`), the climb from `marstonSeen`, peak on `doorPush` (103.0), **cut to one held major chord on `lightFlood` (103.5)**, then near-silence and the exhale (107.0). Act 4: the theme in major, softly.
   - s07: the score thins and flattens; the scrolling thumb ticks. s08: music **out**. s09a: one low held note under the breath.
   - **The nightstand lamp click** at s09a `lampOn` (74.0): the same buffer as s06's lamp clicks (the click that chose the dark is the click that leaves).
   - From climax-a2's build (global times): door latch and hinge at 77.0 with the hall's hush swelling (no electric hum: Q17's light is the nightstand lamp, which is silent); the blob lands on the threshold at 78.167; a hard swallow 79.667–79.833; footsteps on the walk, rate rising toward Marston (if `src/shots/s09c.js` exports his x(t), place one step per 0.024 m of it; otherwise ramp from about 2 to 3 steps a second); the exhale at 107.0.
   - s07–s09a (bed rot, 3 a.m., the choice) are still being built by climax-a1. Use the spec times in doc 05 and `docs/shots/s07.md`, `s08.md`, `s09a.md`; the orchestrator forwards any changes.
4. **Loudness:** integrated **−16 LUFS ±1**, true peak **≤ −4 dBFS**, measured on the final `out/audio/mix.wav` with ffmpeg `ebur128=peak=true`. The s08 tick-alone stretch should be quiet but audible on a phone speaker; say how you checked that without ears (e.g. its short-term loudness against the film's).
5. Determinism: the mix renders bit-identically twice.

## Acceptance
- [ ] `node tools/mix.mjs` writes `out/audio/mix.wav` at 195.0 s; selftest output in the done note
- [ ] `evidence/snd-v4/loudness.txt` (ebur128) within target
- [ ] `evidence/snd-v4/cues.txt`: every cue with its time and beat name; new ones marked
- [ ] `evidence/snd-v4/swell.png` or `.txt`: short-term loudness (or RMS) across 60–110 s, showing the drop at s08, the climb one layer per lamp, the peak at 103.0 and the near-silence after the chord
- [ ] Two mixes hash identically; `check_timeline` ok
- [ ] Done note ends with `## Story`. The director singled out sound for the making-of, so tell how a swell was designed by an agent that can't listen.

## Machine and git
- No headless Chrome should be needed. If it is: one at a time, foreground, closed after use. Disk is tight: write WAVs only under your worktree's `out/audio/` and delete scratch renders.
- Stay inside your worktree; don't touch files you didn't create outside it.
- Commit on `task/snd-v4` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, merge or open PRs.

## Out of scope
Shot code (`src/shots/`), the timeline (if a beat is wrong, say so in the done note), the final master mux.
