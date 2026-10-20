# Done · v6-math

## What shipped
The writing on s15/s16's practice sheets is no longer the ~300 px painting. It's drawn by code at K = 4 canvas px per sheet px, in s17b's hand (Caveat via `loadHand`/`handFont`/`runParts`/`drawInt`). That covers the name squiggle, problem 1 and its three working lines, the deliberately wrong line and its grey strike, practice_2's problem, ratio, "→ ½ < 1" and "converges". Σ and → are stroked paths because Caveat has neither glyph. Each line is fitted into its painted `SHEET_INK` box, so every reveal, pen-tip path and beat is unchanged. The paper is still the blank_page painting.

## Where it lives
- `src/shots/s15.js`: `WRITING`, `typeset`, `bounds`, `inkLayers` replace `unmix` and the heal pass. `practiceSheet` works at K = 4, `build` awaits `loadHand`.
- `src/shots/s16.js`: awaits `loadHand`. The `heal` argument and the '+' bars drawn under the painted strike are gone, because the drawn navy layer has whole '+' signs.
- `src/shots/s17b.js`: unchanged.
- Commit `1500d48` on `task/v6-math`.

## How it was checked
- [x] `evidence/v6-math/before_after.jpg`: before on the left, after on the right. Rows: s15 at 131.4, 132.6 and 135.6 (crop 300×170 at 700,690, enlarged 3× nearest-neighbour), then s16 at 138.0, 140.7 (strike landed), 142.4 (check) and 147.2 (P2), each a full-res crop 900×1080 at 500,0.
- [x] `node tools/check_timeline.mjs` → `ok (22 shots, 73 beats, 201.0s)` (`check_timeline.txt`)
- [x] Determinism: s15 at 131.4 and 135.6, s16 at 140.7, 142.4 and 147.2 all PASS (`determinism.txt`).
- [x] s17b at 172.5 hashes `ca4a22061e57c84e` both before (on the brief commit, before any edit) and after (`s17b_hash.txt`). s17b.js has no diff.
- [x] `npx tsc --noEmit -p .` → exit 0 (`tsc.txt`)
- [x] The math was copied from the paintings and agrees with done/spec-g4.md. Line b, `= xeˣ + eˣ + C`, is still wrong on purpose and is struck on crossOut.

## Gaps
- **s15 is barely legible either way.** On Camera B′ the sheet is about 250 px wide. The new writing is crisper but thin and light there. This brief doesn't put a close-up on the s15 sheet.
- **The tap position is approximate.** In the pause, the pen taps at the painted '+' (x 118, `I1.plus`). The drawn '+' sits within a few px of it but wasn't measured.
- **The time-lapse is still scribble lines** (`scribbles` in s16), only sharper now because K went from 2 to 4. AGENTS.md asks for scribbles outside the specified text, and it's seen only on wide D. I made that call because the spec is silent.
- **The name is still a squiggle**, matching the painting. No name is invented.
- **Two 404s in the page log.** Each determinism run logged a 404 resource. I didn't check whether the base commit does the same; frames are unaffected and hash stable.
- **s17c/s18 frames weren't re-hashed.** They import only s17b, which is unchanged.
- **Temporary files left for you.** Stills in my scratchpad (before/, after*/, final/) were not deleted because the shell blocked an `rm` on a variable path. Nothing was written to `out/`.

## Story
The director said the practice math looked blurry, and he was right. Put side by side in Camera P, the painted "−∫eˣdx" smears into the paper while s17b's test page stays sharp. The cause was simple: s15 unmixes a 284×376 painting into ink layers and magnifies them. The fix was to stop using the painting's pixels for ink and set the same lines in the hand s17b already uses. Caveat has no ∫, Σ or →, so I counted its cmap with a few lines of node before drawing those as strokes. My first pass gave all lines on a sheet one size, the largest that fit every box. That looked tidy on problem 1 but shrank practice_2's fractions and "½ < 1" well below the painting (visible in the first review render). So each line now fills its own painted box, which also keeps the reveals and the pen on their marks. The superscript x sat on Caveat's leaning e twice before I gave it a small gap. The strokes were too thin until I thickened them, and they still read light on s15's wide shot. s17b never had to change: its exports were enough, and its frame hashes the same as before.

## State
built · 2026-10-19
