# Brief · mod-puppet

**Type:** builder
**Wave:** 2 · batch 4 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (Conventions + your section), `docs/04-technical.md` §Puppets, `docs/03-art-direction.md` §Characters and §Motion

## Goal
The cutout puppet system: jointed paper parts with depth gaps, pose blending on 2s, single-frame face swaps and springy secondary motion. Every character runs on this.

## Owns
- `src/puppet.js`
- `lab/puppet.html`
- `lab/puppet.js`
- `evidence/mod-puppet/`
- `done/mod-puppet.md`

## Inputs
`src/core/`, `src/paper.js`, `src/material.js`, `src/lights.js`. No frozen gator art exists yet: build a **temporary test gator** from `paper.js` paths (body, head, jaw, two arms, tail, pocket) in gator green and cream. Faces are simple path-drawn eyes and mouths. Keep it obviously temporary.

## Spec
Implement `src/puppet.js` per contracts.
- Parts are parented Groups with pivots at their joints, and children sit 2–6 mm in front of their parent so they cast small shadows on it.
- `blend` eases between named poses and samples `onTwos`. `face` swaps textures on a single frame. `follow` applies damped spring rotation, also on 2s.
- The lab page has the test gator under a lamp in front of a wall, running a 4 s action: neutral → reach for a lamp (anticipation, reach, hold) → worried face → relieved smile, with the tail following.

## Acceptance
- [ ] Strip shows clear poses with anticipation and holds (not linear mush)
- [ ] Joints don't separate or show gaps at extreme angles (crop)
- [ ] Parts cast small shadows on each other (crop)
- [ ] Face swaps happen on exact frames (strip)
- [ ] Motion steps at 12 fps while the light stays at 24 (explain how you checked)
- [ ] Determinism passes

## Evidence required
`evidence/mod-puppet/`: `action_strip.jpg`, `joint_crop.jpg`, `self_shadow.jpg`, `faces.jpg`, `determinism.txt`.

## Out of scope
Final character art (wave 3). Shot code.
