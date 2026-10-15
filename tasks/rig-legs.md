# Brief · rig-legs

**Type:** builder · **Wave:** 4 (prep) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/shots/QUESTIONS.md` Q9, `docs/contracts.md` §Conventions, §assets, §characters, `docs/assets.md` (gator_sheet row), `src/assets.js`, `src/characters/gator.js`, `src/characters/poses.js`, `done/char-rigs.md`, and look at the gator in `/Users/ericzhang/code/media/looming/assets/raw/thumbs/style_tile_v2_4.jpg`

## Goal
Q9's current option: the gator gets short, stubby legs, as in every style tile, and stands at the contract's 8 cm. The specs' heights (s15 shoulder and eye heights above the hip, README §1's blob ratio) must still hold.

## Owns
- `src/assets.js` (add `leg_l` and `leg_r` to `gator_sheet` and `freshman_sheet` pieces, plus proxies)
- `src/characters/gator.js`, `src/characters/poses.js`, `src/characters/freshman.js`, `src/characters/crowd.js`
- `docs/assets.md` (gator_sheet and freshman_sheet piece lists only)
- `docs/contracts.md` §characters (additive)
- `evidence/rig-legs/`, `done/rig-legs.md`

## Spec
- Legs hinge at the hip. Every existing pose gets sensible leg angles: walks step on 2s with real foot contacts, the kneel bends, seated poses tuck the legs.
- The gator's hip height places him 8 cm tall standing, and the s15 press path still lands within 1 mm (rerun `tips.mjs`).
- Pose names don't change.

## Acceptance
- [ ] `evidence/rig-legs/poses.jpg` (same layout as char-rigs'), with walks and the kneel visibly using legs
- [ ] Standing height measured: 8 cm ±0.3
- [ ] s15 press path error ≤ 1 mm
- [ ] The walk loop check passes (0 changes on odd frames, k = k+16)
- [ ] Determinism for `lab/characters.html` and `index.html` at 3 times
