# Brief · sb-reconcile

**Type:** builder (docs + timeline data) · **Wave:** 3 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/02-story.md`, `docs/03-art-direction.md`, `docs/06-production-plan.md`, `docs/08-image-pipeline.md` §Generation order and budget, `docs/contracts.md`, `src/timeline.js`, all of `docs/shots/s01–s18.md`, and `done/sb-act1.md`, `done/sb-act2.md`, `done/sb-act3.md`, `done/snd-score.md`

## Goal
Three storyboard passes wrote 18 shot specs independently and listed 30+ conflicts between them. Make the 18 specs one consistent film, merge their asset lists into one budgeted list, and separate what the director must decide from what you can resolve.

## Owns
- `docs/shots/` (all files)
- `docs/assets.md` (new: the film's single asset list)
- `docs/shots/QUESTIONS.md` (new: director questions)
- `src/timeline.js` (**additive only**: new beat names; never move or rename an existing beat or shot boundary)
- `evidence/sb-reconcile/`, `done/sb-reconcile.md`

## Spec
1. **Resolve the reversible conflicts** consistently across all shots, and log each one (conflict → resolution → shots touched) in the done note. These include:
   - one blob radius film-wide (the storyboards converged on 0.012 m; use it unless the specs show a reason not to, and note that `createBlob`'s default stays 0.025 per contract, so shots pass `radius`)
   - s06 ↔ s15 camera, desk and hand keys mirrored exactly (s15 is the source)
   - lamp continuity s06/s15
   - the stylized phone light convention (state it once in `docs/shots/README.md` or the top of QUESTIONS if it's a director call)
   - the s13 crane ban
   - the s10 fluorescent vs the shadow rule
   - the TV and one-key-light rule in s05 and s07
   - curtains opaque vs tissue
2. **Beats.** Add the beat names the storyboards and `snd-score` asked for (`fridge`, `gameNight`, `curtainsStart`, `scrollStart`, `marstonEnter`, and the 11 proposed in sb-act2) to `src/timeline.js`, positioned where the specs put them. `node tools/check_timeline.mjs` must pass. Beat names stay unique.
3. **One asset list, on budget.** Merge the three asset lists into `docs/assets.md`: name, type (character, face, set, prop, crowd), which shots use it, generation-order group (doc 08), and notes. The storyboards ask for ~58 new painted assets against a doc 08 budget of **25–35 frozen**. Get to ≤ 35 by:
   - sharing pieces across shots
   - making sheets that hold several props (one generation, many cut pieces; a sheet counts as one asset)
   - moving plain shapes (floors, plain walls, tiles) to procedural `paper.js` paths
   - cutting redundant variants

   Say what was merged or dropped, and why. Never cut a story beat to save an asset.
4. **Director questions.** Write `docs/shots/QUESTIONS.md`: every conflict that changes a story beat, character design, palette or a film-wide rule. These are one-way doors, so you don't decide them. For each one give the options, your recommendation, and the shots affected. Known ones:
   - s17 sit-back and pocket climb vs "only light and boil move"
   - a 4th (neighbor's) lamp click
   - s18's click squeezing the walk-over
   - a second red circle
   - the blob growing vs only its shadow growing
   - the phone light that should also throw the gator's own shadow
   - the Exam's look (glossy gel vs matte ink; see `evidence/mod-blob/squash_strip.jpg`)

   Keep it to one page if you can.

## Acceptance
- [ ] Every conflict from the three done notes is either resolved (logged) or in QUESTIONS.md, with none dropped. Include a count.
- [ ] `docs/assets.md` total ≤ 35 frozen assets, each used by ≥ 1 shot, and every shot's assets section points at names in it
- [ ] `check_timeline.mjs` passes; new beats listed in the done note
- [ ] No existing beat or shot boundary moved (diff of `SHOTS` starts/durations is empty)
