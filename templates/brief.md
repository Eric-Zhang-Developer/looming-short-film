# Brief · <task-id>

**Type:** builder | painter | reviewer | verifier | cold-viewer | judge | briefer
**Wave:** <n> · **Model:** <model id>
**Read first:** `AGENTS.md`, then <the docs this task needs, e.g. `docs/03-art-direction.md`, `docs/04-technical.md` §Lights, `docs/02-story.md` shot 15>

## Goal
<One or two sentences: what exists when you're done, and why it matters to the film.>

## Owns
<Exact paths you may create or change. Nothing else.>
- `src/shots/s15_first_step.js`
- `evidence/shot-15-first-step/`
- `done/shot-15-first-step.md`

## Inputs
<What you build on: contract modules (cite `docs/contracts.md`), frozen assets by filename, earlier done notes, director notes quoted verbatim.>

## Spec
<The specifics: beats with local timings, key light, camera, poses, face swaps, sound cues by name. For painters, the asset spec and its reference images. For reviewers, which evidence to review.>

## Acceptance
<Checkable criteria. Each one should be something evidence can show.>
- [ ] Runs 0:00–0:14 local time; beat `lampClickMarston` at 0:00.0
- [ ] Shadow pool under the blob ≤ 1.2× blob width after the click
- [ ] Same camera, hand path and click timing as shot 6 (compare strips)
- [ ] No legible text in any frame
- [ ] `check_timeline` and `determinism` pass

## Evidence required
<Exactly what to render into `evidence/<id>/`, e.g. a contact sheet at listed times, a strip across the key action, a face crop.>

## Out of scope
<What not to do, so the subagent doesn't wander.>
