# Brief · char-rigs

**Type:** builder · **Wave:** 4 (prep) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/03-art-direction.md` §Characters and §Motion, `docs/contracts.md` §puppet, §blob, §assets, §shots, `docs/assets.md`, `docs/shots/README.md`, `src/assets.js` (`PIECES`), `lab/puppet.js` (the test gator), `done/mod-puppet.md`, `done/contract-puppet.md`, and skim every `docs/shots/sNN.md` §Characters and action

## Goal
One shared rig per character, so 18 shot builders pose the same gator the same way. The rigs build from `assets.load(...)` pieces, which are proxies today and frozen art later, with no code change when the art lands.

## Owns
- `src/characters/` (new): `gator.js`, `exam.js`, `roommates.js`, `custodian.js`, `freshman.js`, `crowd.js`, `poses.js`
- `lab/characters.html`, `lab/characters.js`
- `docs/contracts.md` §characters (new section, additive)
- `evidence/char-rigs/`, `done/char-rigs.md`

## Spec
1. `await makeGator(ctx, { seed, scale = 1, green? }) → Puppet` (contract §puppet). It has a joint hierarchy, pivots and face slots from `gator_sheet` and `face_sheet` pieces, and `Puppet.boil` wired. It's sized to the ~8 cm gator (contracts §Conventions). Rebuild it the same way for the Freshman (0.85×) and the crowd (different greens, per assets.md).
2. `poses.js`: a named pose library covering every action the 18 specs ask for, e.g. sit, slump, scroll phone, reach, recoil, write, sit-back, walk cycle on 2s (4 key poses), head-lift, press switch. Name them by verb, and list which shots use each.
3. `exam.js`: a thin wrapper over `createBlob` that fixes the film-wide radius (0.012 m per `docs/shots/README.md`) and the shrink steps (Q5's current recommendation). One place to change if the director answers differently.
4. Roommates, custodian and crowd: simpler rigs (2–5 parts) per assets.md.
5. The lab page shows every character and every pose on a contact sheet.

## Acceptance
- [ ] `evidence/char-rigs/poses.jpg`: every pose in `poses.js` on the gator proxy, each readable as its verb in silhouette
- [ ] `evidence/char-rigs/cast.jpg`: all characters side by side at scale
- [ ] The walk cycle strip loops on 2s
- [ ] Determinism passes for `lab/characters.html`
- [ ] contracts.md §characters lists every export and pose name
