# Brief · cut-gator

**Type:** builder (one headless Chrome at most) · **Wave:** 5a · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md` (cutting), `docs/contracts.md` §characters, `src/assets.js`, `src/characters/gator.js`, `poses.js`, `roommates.js`, `freshman.js`, `tools/cut.mjs`, `done/asset-gator-sheet-v2.md`, `done/asset-face-sheet.md`

## Goal
The gator in every shot becomes the frozen art, not the placeholder shapes. The director's note: "Poor old Gator is really incredibly ugly". This is the biggest single fix.

## Owns
`assets/cut/gator_sheet*`, `assets/cut/face_sheet*` (pieces and `.boxes.json`), `src/assets.js` (only the gator_sheet / face_sheet entries and the frozen-load path), `src/characters/gator.js`, `src/characters/poses.js`, `src/characters/roommates.js`, `src/characters/freshman.js`, `evidence/cut-gator/`, `done/cut-gator.md`

## Inputs
- Frozen: `assets/frozen/gator_sheet.png` (v2_1), `gator_hero.png`, `face_sheet.png` (v1_3, plus `evidence/asset-face-sheet/v1_3.boxes.json` and its on-head measurements: the faces need scaling down about 2.2–2.5× in code).
- The sheet: the top row is reference (side, front, back, ¾ head). The pieces are the hoodie body, head cap, upper snout, lower jaw with teeth, tail, 2 arms, 2 boot legs and a pocket.

## Spec
1. Cut both sheets with `tools/cut.mjs` (boxes files with names matching `src/assets.js` PIECES). Clean the green or yellow edge halo (despill); check it at 4× zoom.
2. Load cut art when it exists (`proxy: false`). Refit pivots, sizes and layering in `gator.js` so the side view assembles like the sheet's side figure: shoulder at the top of the sleeve, hip at the top of the boot, jaw hinge, tail root. The ¾ and front views use the reference pieces where the rig already asks for them (s10's front shot).
3. Faces: eyes and mouths from the face sheet on the head, at the measured scale and position.
4. The roommates and Freshman share pieces: make sure they still build (tints and scales).
5. A split hand at the cuff (forearm or hand) **only if** s15's pen grab needs it.
6. Keep the rig API unchanged so shots don't need edits. If a shot breaks, list it.

## Acceptance
- [ ] `evidence/cut-gator/turnaround.jpg`: side, ¾ and front, plus 6 face swaps, beside the frozen sheet's side figure
- [ ] `evidence/cut-gator/shots.jpg`: one frame from each of s03, s06, s11, s15, s16 and s18 with the real gator (`render.mjs --sheet ... --w=480`)
- [ ] `evidence/cut-gator/halo.jpg`: 4× edge crop, before and after
- [ ] `check_timeline` ok; `determinism` passes at two times in s15
- [ ] The done note ends with `## Story`

**Machine:** one headless Chrome, foreground only, closed after use, `--w ≤ 960`. A watchdog kills Chrome if disk or swap gets low; if that happens, stop and report.
