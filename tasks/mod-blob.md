# Brief · mod-blob

**Type:** builder
**Wave:** 2 · batch 2 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (Conventions + your section), `docs/04-technical.md` §The ink blob, `docs/03-art-direction.md` §Characters (The Exam), `docs/02-story.md` §Characters

## Goal
The Exam: the one thing in the film that isn't paper. Glossy liquid ink with two cream eyes, whose shadow matches its exact shape. It has to look alive and a little nervous, never evil.

## Owns
- `src/blob.js`
- `lab/blob.html`
- `lab/blob.js`
- `evidence/mod-blob/`
- `done/mod-blob.md`

## Inputs
`src/core/`.

## Spec
Implement `src/blob.js` per contracts.
- 3–5 metaball centers move on `t` (seeded). A thresholded field gives the shape, and gradient normals give a specular highlight that responds to the scene's key light direction (pass light uniforms, or read them from the scene each frame).
- Squash and stretch are driven by `squash` (−1 to 1). The eyes are cream discs that can be `open`, `closed` or `worried` (smaller and higher). Eye positions follow the blob's top.
- `customDepthMaterial` evaluates the same field so the shadow matches.
- The stain is a darker decal on the surface below, with an opacity you can fade.
- The lab page has a blob on a kraft desk in front of a cream wall, lit by a low phone-style spotlight. It shows idle wobble (0–2 s), a squash landing (2–3 s), worried eyes (3–4 s) and the big wall shadow.

## Acceptance
- [ ] The ink reads as wet and glossy, not flat black (close-up)
- [ ] The shadow on the wall matches the blob outline, eye holes included
- [ ] Squash strip shows anticipation and settle
- [ ] Determinism passes
- [ ] Honest read: cute or menacing?

## Evidence required
`evidence/mod-blob/`: `closeup.jpg`, `shadow.jpg`, `squash_strip.jpg`, `eyes.jpg`, `determinism.txt`.

## Out of scope
Paper, puppets, post.
