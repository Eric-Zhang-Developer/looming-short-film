# Brief · rig-v4 (neck, gator roommates, acting kit)

**Type:** builder · **Wave:** 6 (v4) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `src/characters/gator.js`, `poses.js`, `roommates.js`, `src/assets.js` (gator_sheet, face_sheet), `assets/frozen/gator_sheet.png`, `assets/frozen/gator_hero.png`, `done/cut-gator.md`, `done/v3-fix-home.md` (how the roommates are fitted now), `docs/03-art-direction.md` (§Characters, §Face set)

## Director (2026-10-17, on v3)
"If you look at the gator, our gator is missing a neck. It looks odd." · "having the two roommates being not gators is kind of weird in context because everything everyone else is a gator. I'd want to change them to gators." · "our gator itself is not very emotional. We need more emotion for our gator, even just some simple face changes."

## Owns
`src/characters/gator.js`, `poses.js`, `roommates.js`, new `src/characters/acting.js`, `assets/cut/gator_sheet.boxes.json` (only to add a throat piece cut from the sheet), `src/assets.js` (gator_sheet entries only), `evidence/rig-v4/`, `done/rig-v4.md`

## Spec
1. **Neck.** On the frozen sheet's side figure, the cream throat runs from under the jaw down into the hoodie, so the head sits on a neck. The rig puts the head straight on the hood with nothing under the snout. Add a throat or neck piece (cut from the sheet's side figure, or drawn in code with the paper material in the sheet's cream and green) and lift the head slightly so the silhouette matches the sheet. Check it beside the sheet.
2. **Gator roommates.** Rebuild both roommates from the hero's own gator rig: different hoodie colours (navy, kraft, as `greenVariant` and PALETTE allow), one taller and lanky, one rounder, so they read as different gators at a glance. Drop the heron and bear (`roommates_sheet` stays frozen but unused; note it).
3. **Acting kit, `src/characters/acting.js`:** one shared module every shot can use, a pure function of t.
   - **Expression presets** mapping to the face-sheet swaps plus new **brows**: `numb` (half-lid, flat mouth), `guilt` (side-glance, tight line), `flinch` (wide, o), `dread` (worried + sweat, tight line), `resolve` (level eyes, tight line, brows flat and low), `relief` (closed-content, small smile, brows up), `pride` (wide → smile), `neutral`.
   - **Brows:** simple torn-paper strips drawn in code with the paper material (no new Codex art), angled per expression.
   - **Life:** blinks (every 3–5 s, seeded, on twos), breathing (rate is a parameter: fast for fear, slow for relief), head tilt, slump vs upright, tail droop vs curl.
   - **Timing:** each change gets a 2–3-frame anticipation and holds at least 12 frames.
   - API, e.g. `act(rig, t, [[t0, 'dread'], [t1, 'resolve'], …], { breath, slump })`. Document it at the top of the file and in `docs/contracts.md` §characters (append a short section; that one doc edit is allowed).
4. Existing shots must still build unchanged (the new behaviour is opt-in).

## Acceptance
- [ ] `evidence/rig-v4/neck.jpg`: before and after beside the frozen sheet's side figure
- [ ] `evidence/rig-v4/roommates.jpg`: both new gator roommates beside the hero
- [ ] `evidence/rig-v4/expressions.jpg`: all 8 presets on the side head, plus one `gator_hero` close-up if the rig supports it
- [ ] `evidence/rig-v4/breath_blink_strip.jpg`
- [ ] One frame from each of s03, s05, s11, s15 and s18 still builds (`render.mjs --sheet`); `determinism` passes; `check_timeline` ok
- [ ] Done note with `## Story`

**Machine (hard):** one headless Chrome, foreground only, `--w ≤ 960`, closed after use.
