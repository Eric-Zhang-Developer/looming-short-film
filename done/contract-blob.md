# Done · contract-blob

## What shipped
- **Three new eye states in `blob.js`:** `tired`, `gasp` and `side`.
  - `tired` is a half-lid that droops toward the outer corners.
  - `gasp` is a wide eye, 1.35× the size and raised.
  - `side` is a level half-lid with both eyes slid toward the new `look` option (+1 or −1, in plane x).
  - Unknown eye names now throw. Before, they silently drew `open`.
  - The wall shadow and the silhouette cut the same shapes as holes.
- **`blob.silhouette({ color, soft })`** returns a flat decal material that shares the blob's uniforms. s13 now uses it in place of its regex patch on the depth material, and the old helper is deleted.
- **`lab/blob.html?cam=eyes&d=<m>`** shows one eye state per second at r 0.012.
- **§blob in `contracts.md`** gains 16 added lines.

## Where it lives
- `src/blob.js`, `lab/blob.js`, `docs/contracts.md`: `bd18503`
- `src/shots/s13.js`: `7b3b50e`
- `evidence/contract-blob/` and this note: the commit after those two

## How it was checked
- [x] **`evidence/contract-blob/eyes.jpg` shows all six states at film size and at 4×.** It is made by `node evidence/contract-blob/eyes.mjs`. I looked at it.
  - Columns: open, closed, tired, gasp, worried, side (look +1), side (look −1).
  - Row 1 is film size at 1.2 m, s07's distance and the widest shot that uses these eyes. The blob is about 65 px wide there.
  - Row 2 is the same pixels at 4×, nearest-neighbour.
  - Row 3 is film size at 0.31 m, s15's Camera A.
  - In rows 2 and 3 every state reads as its emotion. The glance direction of `side` reads from where the eyes sit on the body.
  - `shadow_holes.jpg` (d 0.9: open, tired, side, closed) shows the wall shadow's eye holes taking the lid shapes, so the depth material picks up the lids.
  - `eyes_determinism.txt`: every eyes-view frame hashes the same when re-rendered in reverse order. PASS.
- [x] **s13's pixels are unchanged.** I ran `node tools/determinism.mjs --page=index.html --t=89.6,92.5` before any edit (`s13_before.txt`, at `bbe772e`) and on the final code (`s13_after.txt`):

  | t | before | after |
  |---|---|---|
  | 89.6 | `200ad4d9ef55ad1a` | `200ad4d9ef55ad1a` |
  | 92.5 | `faaf6d3c97c47ac1` | `faaf6d3c97c47ac1` |

  These also match `evidence/anim-s13/determinism.txt`.
- [x] **Determinism passes for `lab/blob.html` (0.5, 1.45, 2.58, 3.5) and `lab/characters.html` (3, 52, 57, 92, 1000, 2000.125, 2000.5).** See `determinism.txt`. Every hash also equals the one recorded by look-pass-2 and char-rigs, so neither page's pixels changed.
- [x] **The contracts.md diff is additive only.** `git diff --numstat` gives 16 added and 0 removed (`contracts_additive.txt`).
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`. A grep for `Math.random|Date.now|performance.now` in the changed files finds nothing.

## Gaps
- **Why there's an `EYE_LIDS` define.** My first version kept the lid code always compiled.
  - That moved 2 pixels of s13 at 92.5 by 1/255. I measured it with a full-frame diff.
  - Two other arrangements of the lid code (moved into `eyesDist`) gave the same changed hash. Comments and an unused function did not change it.
  - So the lid code now compiles only while a lidded eye is showing. `update()` flips the define on the blob, its depth material and its silhouettes.
  - Cost: one extra shader program per blob type, compiled the first time `tired` or `side` appears.
  - The lidded shapes use negative codes so the catchlight test stays byte-identical.
- **Silhouette with lidded eyes was not rendered.** It is on the same define switch as the depth material, which I did check (`shadow_holes.jpg`). No shot draws one yet.
- **At 1.2 m (row 1), `tired` and `side (+1)` are close to each other.** Both are about 4 px half-discs. `side` is told apart only by its level lid and the off-centre placement. A shot that relies on the difference at that distance should check its own frame.
- **The lab's key-light highlight sits over the left eye in most cells.** It's the same tear-like highlight mod-blob noted. That comes from the lab light, not from the eyes.
- **Changes beyond the literal brief.**
  - s13's change is the call plus deleting its now-unused `shadowMaterial` helper. The import line didn't need to change.
  - `look` is a new `update()` option. The specs give `side` a direction ("toward −x", "down-right"), and a fixed direction would be wrong for half of them.
  - "Down" isn't modelled.
- **Existing issue, not mine:** `index.html` logs six 404s for missing resources on every load, before and after this change.
- **`render.mjs` and `determinism.mjs` reject page paths with a query.** That is why the eyes view has its own script.

## State
built · 2026-10-15
