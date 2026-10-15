# Brief · mod-lights

**Type:** builder
**Wave:** 2 · batch 2 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (Conventions + your section), `docs/04-technical.md` §Lights, `docs/03-art-direction.md` §Lighting rules, `docs/02-story.md` §The visual rule, `done/smoke-paper.md`

## Goal
The film's light rigs: phone, lamp (with a visible cone and dust), dawn, fluorescent and ambient. Plus the math that places a light to get a target shadow scale. The light rule is the story, so this has to be exact.

## Owns
- `src/lights.js`
- `lab/lights.html`
- `lab/lights.js`
- `evidence/mod-lights/`
- `done/mod-lights.md`

## Inputs
`src/core/`. `smoke/paper/scene.js` light placement and bias values that worked.

## Spec
Implement `src/lights.js` per contracts.
- `placeForScale` solves the doc 02 formula. `shadowScale` checks it.
- The lamp cone is a translucent vellum-like cone mesh (additive, no shadow cast) with 20–40 seeded dust specks drifting on `t`.
- Fluorescent flicker comes from a seeded noise curve, mostly steady with rare dips.
- `aim` keeps the shadow camera frustum tight to the target.
- The lab page has a wall, a desk and a simple cutout (plain textured planes are fine, since mod-paper is parallel). It switches phone (t < 2) → lamp (2–4) → fluorescent (4–6) → dawn ramp (6–9).

## Acceptance
- [ ] `placeForScale(scale=3)` then `shadowScale` round-trips within 2%, at 3 positions (printed)
- [ ] Phone frame: shadow about 3× (measured from pixels as smoke-paper did)
- [ ] Lamp frame: visible cone, dust, small pool
- [ ] Dawn ramp: 4-frame strip from cold to gold
- [ ] No shadow acne or detached shadows (crop)
- [ ] Determinism passes

## Evidence required
`evidence/mod-lights/`: `phone.jpg`, `lamp.jpg`, `fluor_strip.jpg`, `dawn_strip.jpg`, `scale.txt`, `crop.jpg`, `determinism.txt`.

## Out of scope
Paper textures, the paper material, post.
