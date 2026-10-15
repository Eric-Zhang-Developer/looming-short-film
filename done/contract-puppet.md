# Done · contract-puppet

## What shipped
A part's `sheet`, and any face take, may now be a function `(seed) => PaperSheet`. `Puppet.boil(t, rate = 10)` computes `boilSeed(t, rate)`. When the seed changes, it re-tears every function-sheet part, plus the face take on show, through `updatePaperMesh`. Only textures change, never geometry. Plain sheets work as before and never boil. `docs/contracts.md` §puppet gained an additive block covering `boil`, function sheets, `follow`'s `gain`, `joints`, `meshes`, `name`, the face-slot convention, v-down `pivot`, the rule that `pose()` after `blend()` overrides, and the requirement to call `face()` (and `boil()`) every frame. Every lab test-gator sheet is now a seed function, and `boil(t)` runs at the top of every frame, in all views.

## Where it lives
- `src/puppet.js`, `lab/puppet.js`, `docs/contracts.md` (§puppet only)
- `evidence/contract-puppet/`: `boil_strip.jpg`, `boil_zoom.jpg`, `boil_check.txt`, `swap_check.txt`, `determinism.txt`, `contracts_additive.txt`, `twos_after_boil.txt`, `checks.mjs` (run from repo root: `node evidence/contract-puppet/checks.mjs`)
- Commits on `task/contract-puppet`: `50e2174` (code + lab), `e8feb13` (contract), `e5f6b30` (evidence), plus the commit for this note.

## How it was checked
- [x] **Boil strip: edges re-tear every step at rate 10, and the silhouette holds.** `boil_strip.jpg` is a full-res crop of the gator at t = 4.05 … 4.75. That's eight consecutive boil steps (seeds 40–47) with stress pose A held, so only boil and the lamp sway change. The torn outlines of the arm, pocket, body and eye rims differ in every cell, and the shape doesn't move. `boil_zoom.jpg` is a 3× crop of the eyes and head edge over four steps. In `boil_check.txt`, all 9 parts share each step's seed. On each step, 0.84–1.00 % of the body's alpha pixels flip, and 1.02–1.13 % of the head's. That's never 0, and well under the 5 % ceiling I set for "holds" (my own threshold, not from the spec). → PASS
- [x] **Geometry and program counts don't grow over 48 frames.** `swap_check.txt` uses the same method as mod-material: render frame 0, snapshot, render frames 1–48, snapshot again. Geometries stay at 13 → 13 and programs at 5 → 5. Geometry and material uuids are unchanged, map uuids changed, and the body passed through seeds 0–20. Textures went from 23 to 383, which is paper.js caching each seed. → PASS
- [x] **`node tools/determinism.mjs --page=lab/puppet.html --t=0.5,2,3.5`** → all PASS (`determinism.txt`). I also re-ran mod-puppet's full set (0.5, 1.333…, 2, 2.958…, 3.5, 4.5, 8.25): all PASS. There's no clock and no `Math.random` in the changed code.
- [x] **contracts.md diff is additive only.** `git show --numstat e8feb13` reports `18 0 docs/contracts.md`, in one hunk `@@ -143,0 +144,18 @@` at the end of §puppet. No other section was touched (`contracts_additive.txt`).

## Gaps
- **mod-puppet's twos check now FAILS** (`twos_after_boil.txt`: 16 of the puppet's 61 changes land on odd frames). `evidence/mod-puppet/twos.mjs` counts a map uuid change as puppet motion. Boil follows the brief's `boilSeed(t, rate)` on raw `t`, so at rate 10 the textures swap off the 12 fps grid. Pose motion is still on 2s. I didn't edit the check, because it isn't in my owns, and I didn't move boil onto `onTwos(t)`, because the spec says raw `t` and set pieces boil on raw `t`. **Director/orchestrator call:** either boil puppets on 2s (`boilSeed(onTwos(t), rate)`, which gives uneven 10-in-12 steps), or make twos.mjs compare only world matrices.
- `boil()` is stateful, like `face()`: it remembers the last seed. Skipping it on a frame leaves an earlier tear on. The contract says to call it every frame. Determinism holds because the lab does.
- Texture memory: a 9-part puppet at rate 10 makes 9 sheets per 0.1 s. paper.js's LRU cap (300 sheets) disposes the old ones, so memory is bounded. But several boiling puppets plus a boiling set will churn that cache and re-tear evicted seeds on scrub. Not measured beyond 48 frames.
- `tools/check_timeline.mjs` wasn't run because this task doesn't touch the timeline.

## State
built · 2026-10-15
