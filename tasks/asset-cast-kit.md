# Brief · asset-cast-kit

**Type:** painter (Codex, no headless Chrome) · **Wave:** 5c (v3) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md`, `docs/03-art-direction.md` (§Characters), `docs/02-story.md` (the roommates, the custodian, the Marston neighbours), `src/assets.js` (the four sheets below), `src/characters/roommates.js`, `custodian.js`, `crowd.js`, `assets/frozen/gator_sheet.png` (the house style for every animal), `assets/frozen/style_tile.png`

## Goal
Replace the last placeholder characters with painted ones in the gator's style, as drop-in sheets: same sheet names, same piece names, so the rigs pick them up with no code change.

## Owns
`assets/prompts/<sheet>.v1.md` for the four sheets, `assets/specs.json` (append), `assets/raw/` (thumbs committed), `evidence/asset-cast-kit/`, `done/asset-cast-kit.md`

## Spec: four parts sheets (pieces exactly as named in `src/assets.js` PIECES)
- **roommates_sheet** (s05): `tall_body, tall_head, tall_leg_l, tall_leg_r, tall_tail, round`. Two roommates: a tall lanky one (a heron or a lanky gator cousin) and a round one. Different animals from the hero, same felt-paper style, and muted so they don't steal focus.
- **custodian_sheet** (s14): `custodian_body, custodian_head, custodian_cap, custodian_arm_l, custodian_arm_r, custodian_tail, cart_frame, cart_tray, cart_bucket, mop`. A kind older animal (a tortoise or a heron) in a work shirt and cap, plus the cart and mop.
- **crowd_sheet** (s16): `neighbor_body, neighbor_head, neighbor_arm, sleeper_body, sleeper_head, sleeper_arm`. Marston neighbours, seated side view, one of them asleep on the desk.
- **top_figures_sheet** (s13, top-down): `hero_body, hero_head, hero_arms, hero_tail, hero_backpack, seated_1`…`seated_6`. Seen from directly above, so heads and shoulders are simple shapes. The hero matches the gator's colours, and seated_1–6 are varied muted students.
- Proportions follow the sizes in PIECES (aspect ratios). Prefix boxes keys `<sheet>_<piece>`.
- **2 variants per sheet** (usage is tight), cap 3. One Codex call at a time.

## Acceptance
- [ ] `contact.jpg`, `scale.jpg` (beside the frozen gator), `islands.txt` (every named piece found)
- [ ] Boxes files for the best variant of each sheet; a ranking with one line each. **You do not freeze.**
- [ ] The done note ends with `## Story`

**Memory:** no headless Chrome. Never read or print `~/.codex/auth.json` or any token file.
