# Done · walk-redo

## What shipped
- **Gait:** s09c's side walk is now timed, not phased on distance. There's a contact every 0.25 s from global 84.0, so every other footfall lands on the 120 bpm pulse. Each step's leg spread is scaled to the distance x(t) covers in that step (0.7–1.2× the pose's 0.024 m), so the planted foot barely skates. On top of that: an extra ±14° arm swing, a ±8° tail sway, and a body bob, because the root's height now comes from the final legs (after act()'s lean).
- **Look:** his paper lights itself at 0.45 of its painted colour, with no torn-edge catch and through-light at 0.1. The cream hoodie reads cream and the green reads green, close to s10's look, and the white rim fringe is gone.
- **Head:** the wide always shows the `open` eye take with its blinks. The worried, gasp and side takes are out of the wide. The close-up at 92.333–93.667 is unchanged.
- **Blob:** it trails a further 3.5 cm (`GAP`) behind HEEL, with a clear gap between them, except at the block. The wide's camera shifts by half that.

## Where it lives
- `src/shots/s09c.js` only. Commit on `task/walk-redo` (see `git log`).
- `evidence/walk-redo/`: `gait.jpg` (12 fps over 84.0–85.917, 24 frames, crop on him), `sheet.jpg` (1 s, 82–101), `s10_105.jpg`, `determinism.txt`, `exports.txt`.

## How it was checked
- [x] `evidence/walk-redo/gait.jpg`: the legs alternate (contact, pass, contact) every 3 drawings, and the root bobs. The blob is clear of him in all 24 frames.
- [x] `evidence/walk-redo/sheet.jpg`: one frame per second, 82–101. The head is the same in every wide. The CU is at 93, and the blob meets him only at 92 (the block) and 94 (still planted as he steps round).
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 70 beats, 195.0s)`. No beat changed.
- [x] `node tools/determinism.mjs --t=84.25,89,96.5` → three PASS (`determinism.txt`). The first try failed at 84.25 and 96.5: the emissive map was synced before face() swapped the eye map in the same frame. Moving the sync to the end of update() fixed it.
- [x] s10 still builds: `s10_105.jpg`.
- [x] Exports unchanged: I dumped `X` every 0.25 s from 0 to 20, plus `LAMP_X`, `LAMP_H`, `KEY_I`, `BLOB_R` and the export list, for HEAD~ and for the new file. `cmp` found no difference (`exports.txt`).

## Gaps
- **The sound must follow (I don't own `src/audio/cues.js`).** `WALK_STEPS` still places one step per 0.024 m of x(t), and the picture no longer does that. The new picture contacts in s09c local time:
  - every 0.25 s from 0.0 to 9.75 (global 82.0–91.75)
  - the three side-steps, unchanged
  - every 0.25 s from 12.0 to 17.75 (global 94.0–99.75)
  - the back walk from 18.25, unchanged

  Each one lands on a 12 fps drawing.
- **The step rate stays at 4/s; it doesn't quicken toward Marston.** The steps get longer instead (0.0225 → 0.0275 m). His legs are 0.015 m long, so 2 steps a second at x(t)'s speed would mean feet sliding a full stride.
- **The puddles have moved.** On a lamp beat the blob now sits 3.5 cm short of the lamp, so its puddle is a little off-centre. I didn't re-measure the shadow lengths.
- His feet sit near the paving's far edge in the wide. That was there before my change, and I didn't touch it.
- The glances (eyes to the blob at 9.5, at the side-step, wider at Marston) are gone from the wide, per the one-head rule.

## Story
The orchestrator's strips made it look like the legs weren't animating. The code said they were: the walk was phased on distance, so at x(t)'s 6–8 cm/s his stubby legs were taking about 2.8 tiny steps a second, out of step with the pulse. Behind a blob that overlapped his hips, and lit only by the lamps behind him, those steps disappeared. Most of what read as a muddy, dirty character was light. The lamps sit behind him on the hedge line, so the paper got only its own torn-edge rim and the cool through-light. Letting his paper light itself at its painted colour, with the edge catch off, gave the cream hoodie back in one render (`sheet.jpg`).

For the gait I tied the cycle to the clock instead: four contacts a second from 84.0, every other one on the pulse. Each step's spread is scaled to the distance x(t) actually covers, so x(t) stays frozen. Determinism caught one real bug. I had synced the emissive map before face() swapped the eye take, so each frame drew the previous frame's eye. Moving the sync to the end of update() fixed it.

## State
built · 2026-10-18
