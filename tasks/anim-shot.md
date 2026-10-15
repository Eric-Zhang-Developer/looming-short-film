# Brief · anim-sNN (animatic blocking, one per shot)

**Type:** builder · **Wave:** 4 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/02-story.md`, `docs/03-art-direction.md`, `docs/contracts.md` (all), `docs/shots/README.md`, `docs/shots/QUESTIONS.md`, **your shot spec `docs/shots/sNN.md`**, its neighbours' specs (sNN−1, sNN+1) for continuity, `src/timeline.js`, `src/shots/_template.js`

The orchestrator's dispatch message names your shot `sNN`.

## Goal
Block your shot for the animatic. Real camera, framing, light rig and shadow scale, and timing on the beats, with proxy art and character rigs. It's the animatic's version of the shot: readable story, not final polish.

## Owns
- `src/shots/sNN.js` (only your own)
- `evidence/anim-sNN/`, `done/anim-sNN.md`

Call only what contracts.md lists. If you need a contract change, stop, write it under Gaps and finish what you can.

## Spec
- Follow your shot spec exactly: layers and z, camera FOV and position and moves, key light and its shadow scale (use `placeForScale`), DOF target, and the action keyed to local times and beat names.
- Where QUESTIONS.md has an open question, build the **current** option (it's marked) and note it in the done note.
- Characters come from `src/characters/` (if your shot has them); poses from `poses.js`. Characters move on 2s; light at 24.
- Don't add sound. Cues live in `src/audio/cues.js` and are placed later.
- No legible text anywhere.

## Acceptance
- [ ] `node render.mjs --page=index.html --strip=<shot start>:<shot end> --cols=8 --out=evidence/anim-sNN/strip.jpg` with ~1 frame per beat and per key pose. Look at it.
- [ ] Two full-res stills at the shot's most important beats (`--stills`)
- [ ] Shadow scale measured where the spec gives one (±20%)
- [ ] `tools/determinism.mjs --page=index.html --t=<two times inside your shot>,<one in another shot>,<the first again>` passes
- [ ] Readability: one line on what a cold viewer would understand from your strip alone, against the spec's Story job
- [ ] Every spec acceptance item checked, or listed as a gap
