# Done · v7-laptop

## What shipped
The home laptop is 1.8× its real size and turned to −30° (s02, s03, s06; s05's turned to 35°), so it reads as a laptop next to his head and the camera sees its lit screen. Every laptop screen now shows one paper-style first-person shooter (`gameScreen` in `src/shots/s02.js`): blocky walls and crates, a crosshair, a gun in a green hand, no text or HUD. On the CS2 clip's bursts the muzzle flashes and the gun kicks, on 2s. Every wall shadow is the same size as in v6.

## Where it lives
- `src/shots/s02.js`: `DESK.laptop` (scale 1.8, yaw −30°), `LAPTOP` (homeDesk's options), `homeDesk`'s `laptopScale` option (default 1, which is v6), `gameScreen`, `firing` (the clip's bursts).
- `src/shots/s03.js`, `s05.js`, `s06.js`: they use it. Each fires on its own CS2 line, the key target hovers 3 mm over the deck, and the screen halo is at 45%. s05's laptop sinks into a thinner cushion. s06's laptop sits 1 cm nearer him.
- `docs/shots/s03.md`, `s05.md`, `s06.md`: a "v7 (v7-laptop)" paragraph each.
- `evidence/v7-laptop/`: `before_after.jpg`, `shadows.txt` (plus `shadows_v6.txt`, `shadows_v7.txt` and the `shadows.{mjs,js,html}` that wrote them), `screen.jpg`, `hands.txt` (plus `hands.{mjs,js,html}`), `s02_s03_sheet.jpg`, `s06_sheet.jpg`, `s05_key_above_snout.jpg` (the failed first s05: the key above his snout).
- Commits on `worktree-agent-ae5cea3b5aaded22b`: `74a73d1` (the change) and the evidence/done-note commit after it.

## How it was checked
- [x] `evidence/v7-laptop/before_after.jpg`: v6 on the left, v7 on the right, at 12, 21, 24, 35, 45. The v6 frames come from `out/looming_v6_720p.mp4`. The v7 frames come from `render.mjs --sheet` (640 wide).
- [x] `evidence/v7-laptop/shadows.txt`: shadow width in units, measured from the live shots by `node evidence/v7-laptop/shadows.mjs`:
  ```
  film 12   s02         n/a       n/a        —   (no screen key)
  film 21   s03        3.600     3.600   +0.00%   (0.0906, 0.0243)    (0.0887, 0.0108)    dx -0.0019 dy -0.0135
  film 24   s03        5.400     5.400   +0.00%   (0.0906, 0.0459)    (0.0887, 0.0324)    dx -0.0019 dy -0.0135
  film 35   s05        8.000     8.000   +0.00%   (-0.0210, 0.1535)    (-0.0210, 0.1535)    dx +0.0000 dy +0.0000
  film 45   s06        6.800     6.800   +0.00%   (0.0973, 0.0642)    (0.1195, 0.0517)    dx +0.0222 dy -0.0125
  ```
  Film 12 is s02's calendar insert. The laptop is shut and the window is the key, so there is no screen shadow to measure.
- [x] `evidence/v7-laptop/screen.jpg`: 240×180 crops at 1080p (film size, 1:1). Rows are s03, s05, s06. Left column without the flash (21, 35, 45), right column with it (21.67, 37.67, 46).
- [x] `node tools/determinism.mjs --t=12,21,24,35,45` → `determinism: PASS`. The hashes match before and after the last cleanup: t=12 `bc562a25cecf06e5`, t=21 `b286aa0416e378f5`, t=24 `7d112e58e40ee420`, t=35 `2669a5f68437096a`, t=45 `c965f81546f84619`. I also checked three flash frames: `--t=21.67,37.67,46` → `determinism: PASS`.
- [x] `node tools/check_timeline.mjs` → `ok (22 shots, 77 beats, 204.0s)`
- [x] `npx tsc --noEmit -p .` → clean (exit 0, no output)
- [x] Hands on the keys (the brief's "Do"): `evidence/v7-laptop/hands.txt` projects his hand and the key target into the 1920×1080 frame. In s03 the hand is within 11 px of the keys at 1.0, 2.0 and 2.33. In s06 it is within 8 px at 4.0 and 5.0.
- [x] The s02→s03 cut and the reminder insert (the shooter behind the banner): `evidence/v7-laptop/s02_s03_sheet.jpg` (9.5, 18.9, 19.0, 19.6, 20.0, 22.5). The lamp beat: `evidence/v7-laptop/s06_sheet.jpg`.
- [x] done note: this file, ending with `## Story`.

## Gaps
- **Shadow sizes are exact, but their positions moved.** The bigger screen's centre is 5 mm higher, and the shadow moves (1 − S) times that. In s03 the loom sits 1.35 cm lower on the wall, so more of its bottom is behind the desk. It still rises above his eye line (see `before_after.jpg` at 21 and 24). In s06 it is 2.2 cm right and 1.25 cm lower, still in frame. Keeping the old positions would need either moving the blob's mark (`B` is s02's choreography, not mine) or putting the light off the screen. I did neither.
- **The deck overhangs the desk.** I pinned the screen's depth to keep S. At 1.8× that puts the deck's front-right corner about 1.8 cm past the desk's front edge (z ≈ 0.051 against 0.033, computed). It doesn't read as an overhang at s03's or s06's low camera in my sheets, but it is physically there. v6's smaller laptop already overhung by about 3 mm.
- **The hand hovers.** The key target sits 3 mm over the deck. Solved onto the keys themselves, the fingertip lands under the bigger deck and is hidden.
- **s00 and s18 still have v6's laptop.** `homeDesk` defaults to scale 1. s18 (not mine) puts the shut laptop at z 0.008. At 1.8× its back edge would sit behind the wall, so its owner needs to pass `LAPTOP` and pick a new spot. Until then the room's laptop is smaller in the ending than in Act 1. I didn't check whether s00 shows the laptop at all.
- **The flash timing is copied by hand.** The burst times are my reading of the clip's loudness envelope (`assets/raw/reels/cs2.mp3`, 1/24 s windows), not something anyone has listened to. The shots pass `cues.js`'s in-points and offsets as literals: s03 (1.25, 0), s05 (0.33, 5.75), s06 (4.5, 0). If those cue lines change, these numbers have to follow.
- **The flash is on screen only.** The key light doesn't pulse with it.
- **s05's hand isn't solved.** His fingertip is still placed at v6's offset from L. I only checked it by eye in `screen.jpg`, where it sits at the keyboard's right.
- **`docs/shots/s02.md` isn't updated.** It still gives the old laptop size, and it's not in my owns. The older laptop numbers in the s03/s05/s06 tables stay; the v7 paragraph above them says it wins.
- **Colours in `before_after.jpg` differ.** The v6 column is the encoded 720p film and the v7 column is a raw sheet, so the grades don't match exactly. Compare shapes and sizes, not colour.
- **One render broke the swap rule.** It ran at 536 MB free swap, before I put a wait-for-1-GB gate in front of every render. Everything after that waited.

## Story
I set out to make a laptop bigger, and the first lesson was that size wasn't the hard part; depth was. The rule's numbers live entirely in depth: S = z_L / (z_L − z_B), and the blob is a flat card, so the light's height doesn't change the shadow's size. I learned it was a card the hard way. My first measuring script projected a sphere and reported "512 units", because the sphere's front poked past the light. I switched it to the card's outline, pinned each screen's depth, and every width came back identical to v6 to the third decimal (`shadows.txt`).

Pinning depth had a cost I only saw when I worked the corners out on paper. The screen has to stand 2.1 cm from the wall on a 3.3 cm desk, so a 1.8× deck runs past the desk's edge. I kept it; the camera barely sees it.

s05 is where it went wrong. I let the light ride up to the scaled screen's centre, and the next render lost the 8-unit loom under a dark mass that filled the room (`s05_key_above_snout.jpg`). He sits between the light and the wall, and the light had risen above his snout. Sinking the laptop into a thinner cushion put the screen's centre back on v6's light.

Then the hands. In the crops his sleeve stopped at the lid's corner. Projected, the hand sat within 6 px of the keys, but under the deck. It hovers 3 mm higher now (`hands.txt`). Last, I "listened" to the CS2 clip as a loudness envelope, and its bursts became the muzzle flashes.

## State
built · 2026-10-19
