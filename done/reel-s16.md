# Done · reel-s16

## What shipped
`src/shots/s16.js` rebuilt for motion-sensor lights. I reused the WIP's set, ink, pop grid and part-1 acting. The desk lamps are gone. Each desk has a `sensorLight` zone: his stays lit the whole shot, and the neighbour's is dead until 15.0, then wakes on the shared `SENSOR_WAKE` keys. At 15.0–16.0 he pops up into the gap between the desks (`stand_stretch`, then `stand_look`) and back down for solve #6. The blob steps down on every solve (0.012 → 0.005). Beat times and the shot's start and end are unchanged (`sensorWakeNeighbor` @ 15, solves @ 3, 8.5, 11, 13, 14.5, 16).

## Where it lives
- `src/shots/s16.js`, `evidence/reel-s16/sheet.jpg` (brief command, 12 frames, w 320), `evidence/reel-s16/montage_wide.jpg` (Camera D at 7.0, 12.2, 14.9, 15.25, 15.75, 20.8; w 640)
- Commit `7979190` on `task/anim-s16`

## How it was checked
- [x] Sheet, local t 0.4, 1.5, 3.2, 3.9, 5.5, 9.0, 12.2, 14.9, 15.25, 15.75, 17.2, 20.8: `node render.mjs --page=index.html --sheet=114.40,…,134.80 --cols=6 --w=320 --out=evidence/reel-s16/sheet.jpg`. I looked at it, fixed what didn't read (see Gaps) and re-rendered.
- [x] `node tools/determinism.mjs --t=117.2,129.3` → `PASS` at both (`169128df…`, `fdd357a8…`)
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`
- What a cold viewer gets from the sheet:
  - **Part 1:** he braces over the page, writes, and stops. The blob braces with him, eyes shut.
  - **Montage:** a wide shot of two desks. His desk is lit and he keeps working. The neighbour sits hunched under a huge phone-cast shadow of their own blob.
  - **The stand:** he stands up in the gap. The neighbour's fixture lights up, their wall shadow fades to a ghost, and it's gone once their phone goes face-down. They are writing by 17.2.
  - **The neighbour beat** reads clearly even at 320 px.
  - **The hero blob's shrink** reads at 640 px (`montage_wide.jpg`). At the brief's 320 px it is only a few pixels and reads weakly.

## Gaps
- **Spec numbers changed for readability:**
  - Outshone phone is 0.05, not README §4's 0.2. At 0.2 the loom still read after the wake; s15 measured the same.
  - The room fluorescent is 0.4 on Camera D (s15's 1.0 on Camera B). At 1.0 the dead zone looked lit.
  - The trough housing uses unlit dark card, and a diffuser lip under each trough glows with the zone's level. Camera D looks down on the troughs, so the tube is hidden from it, and the neighbour's phone cone lit their housing.
- **Rough:**
  - The neighbour's desk top still catches the phone's grazing light before the wake. The "dead zone" reads from the wall shadow and the dark lip, not from the desk.
  - Part 1 faces (gasp at 3.5, `o` at 3.833) are too small to check at sheet size.
  - The neighbour's head-up at 15.5 isn't legible at sheet size.
  - Problem #6 has no writing pops (he's standing), so its answer appears whole on the solve frame.
- **Not done:** precision measures (spec acceptance 2–3: px widths, the ≥ 6× and ≤ 1.2× crops, contrast) were skipped per the brief.
- **Spec gaps:** `docs/11-roadmap.md`, cited by the orchestrator's frame-alignment note, isn't in this worktree; I followed the note as relayed. The LUT stays `amber` to match s15 as built. s15 still has a desk lamp and needs its own sensor pass, or the 0.0 cut won't match.
- **What the final pass may restage:** Camera D is the spec's. The floor fills about 40% of the frame and the figures are small. A slightly tighter or lower Camera D would help the blob shrink read, but would change framing, so I left it. Tunables (`BLOB_R`, `BLOB_STEPS`, zone positions, intensities, `OUTSHONE`, `FLUOR_D`, `LIP_H`) are named constants at the top of `s16.js`.

## State
built · 2026-10-15
