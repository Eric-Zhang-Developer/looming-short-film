# Brief · asset-v4-kit (the clock, and the close-up head kit)

**Type:** painter (Codex, no headless Chrome) · **Wave:** 6 (v4) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md`, `docs/03-art-direction.md`, **`docs/02-story.md`** (v4: §The clock, the acting map, the climax), `assets/frozen/gator_hero.png` (the close-up reference), `assets/frozen/gator_sheet.png`, `assets/frozen/face_sheet.png`, `assets/frozen/props_kit.png` (calendar style), `src/characters/acting.js` (the preset names)

## Goal
The director: "our gator itself is not very emotional." The acting kit gives readable moods in wide and medium shots. **Close-ups need painted emotion.** Paint the replacement heads the climax's close-ups swap to, plus the clock that's the film's pulse.

## Owns
`assets/prompts/closeup_heads.v1.md`, `assets/prompts/clock_kit.v1.md`, `assets/specs.json` (append), `assets/raw/` (thumbs committed), `evidence/asset-v4-kit/`, `done/asset-v4-kit.md`

## Spec
- **closeup_heads**: one sheet of 6 whole-head replacement drawings, side view, each matching `gator_hero` exactly in head shape, size, line weight, felt texture and palette. Only the face acts:
  - `numb`: half-lidded, slack
  - `dread`: worried, brows up and in, a sweat drop
  - `resolve`: jaw set, brows flat and low, eyes level, a firm mouth
  - `relief`: eyes closed, brows lifted, a soft exhale, the faintest smile
  - `surprised_smile`: eyes wide, a small smile
  - `pride`: a big grin, eyes bright
  Keys `closeup_heads_<preset>`.
- **clock_kit**: the wall clock face (tick marks, **no numbers**, paper style matching the calendar), hour hand, minute hand, centre pin, and the same clock face for the exam room (a slightly different frame colour). Keys `clock_kit_<piece>`.
- **3 variants of the heads sheet** (the hard one), **2 of the clock**. One Codex call at a time. Put `gator_hero.png` in the run folder as the reference image.

## Acceptance
- [ ] `contact.jpg`; `heads_vs_hero.jpg`: each head beside `gator_hero`, same scale (Node or ffmpeg; no Chrome); a head-size match within 5% (state the numbers); `islands.txt`
- [ ] Boxes files for the best variant of each; a ranking with one line each, judged on: *does each face read its emotion at phone size, and does it look like the same gator?* **You do not freeze.**
- [ ] The done note ends with `## Story`

**Memory:** no headless Chrome. Never read or print `~/.codex/auth.json` or any token file.
