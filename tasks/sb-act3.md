# Brief · sb-act3

**Type:** builder (documentation)
**Wave:** 2 (parallel track) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/02-story.md` (all), `docs/03-art-direction.md` (all), `docs/05-sound.md`, `docs/06-production-plan.md` §Shot list, `docs/04-technical.md` §Lights and §Camera, `docs/contracts.md`, `src/timeline.js`, `templates/shot.md`

## Goal
Turn the beat sheet into buildable shot specs for Act 3, dawn and the button (s15, s16, s17, s18). A shot builder in wave 4 should be able to block its shot from your spec alone, without guessing at framing, light placement, poses or which assets it needs.

## Owns
- `docs/shots/s15.md`
- `docs/shots/s16.md`
- `docs/shots/s17.md`
- `docs/shots/s18.md`
- `done/sb-act3.md`

## Inputs
Shot times and beat names come from `src/timeline.js` (authoritative; don't change it). Story intent comes from doc 02, the look from doc 03, sound from doc 05.

## Spec
- One file per shot, following `templates/shot.md` exactly.
- Be concrete:
  - layer z positions in meters
  - light positions, with the blob's target shadow scale wherever the blob is in frame (doc 02 rule; the phone is low and close, the lamp overhead)
  - camera FOV and position
  - poses at local times with anticipation and holds
  - face swaps on beats
  - sound cues by beat name
- Keep the story rules: no legible text, the hero takes the first step himself, the blob is never evil, one idea per shot.
- Quiet shots (s12, s17) are fully locked off. Only light and boil move.
- Shots s06 and s15 must match exactly (same camera, hand path and click). Whoever owns one cross-references the other by name.
- Asset names: reuse names across shots consistently, and use simple snake_case (`gator_sheet`, `face_sheet`, `apt_wall`, `apt_desk`, `desk_lamp`, `phone`, `calendar`, `marston_stacks`, ...).

## Acceptance
- [ ] Every shot file has every template section filled, with numbers, not adjectives
- [ ] Every beat in your shots from `src/timeline.js` appears in the right shot's Beats line and action
- [ ] Blob shadow scale stated for every shot where the blob is visible
- [ ] Your done note includes a consolidated **asset list** for your shots (name, what it is, which shots use it, close-up or background), for the orchestrator to merge across acts
- [ ] Your done note lists any spec conflicts you found (between doc 02, 06 and the timeline) and what you assumed

## Evidence required
None beyond the shot files and the done note (documentation task).

## Out of scope
Code. Changing the timeline or other docs: report conflicts in the done note instead.
