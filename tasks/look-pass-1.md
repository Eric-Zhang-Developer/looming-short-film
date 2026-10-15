# Brief · look-pass-1

**Type:** builder · **Wave:** 3 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/03-art-direction.md` (all), `docs/contracts.md` §paper, §post, §lights, `done/lookdev-composite.md` (all of it), and look at `evidence/lookdev-composite/vs_reference.jpg`, `phone.jpg`, `lamp.jpg` with the Read tool

## Goal
Lookdev reads half paper, half vector. Fix the parts of that which live in code, so the next lookdev measures the art and not the rig. **Don't touch palette or painted art.** The navy-props-on-navy-wall problem is the director's G1 call.

## Owns
- `src/paper.js`, `src/post.js`, `src/lights.js` (additive contract options only; defaults may change if the done note says why)
- `lab/lookdev.js`, `lab/lookdev.html`
- `docs/contracts.md` §paper, §post, §lights (additive only)
- `evidence/look-pass-1/`, `done/look-pass-1.md`

## Spec
1. **Rim reads as a stroke.** When `art` is given, painted pieces already carry a rim, so `paper.js` must not stack a second even band. Add `rim: 'auto' | 'none' | 'broken'` (default `'auto'`: none on art that already has a pale edge, broken otherwise). A broken rim is thinner, near-white (cream lifted), with gaps and varying width along the edge, like the reference's torn white fibres. A rim may never be a constant-width band around a whole shape.
2. **Night is too dark.** The reference keeps a bright picture-book night. Lift the `night` LUT and the lookdev's ambient/fill so navy reads as a colour (the wall's texture is visible everywhere in frame), and only the loom shadow goes near-black. Keep doc 03's color script intent: night is cool, not grey.
3. **Light shapes read as 3D.** The lamp cone should be a soft vellum shape that reaches the pool, not a wedge that fades in mid-air, and the phone's light fan shouldn't be a hard geometric fan on an untextured desk. Give the desk a paper texture (procedural kraft via `makePaper` is fine).
4. **Cache thrash.** `paper.js`'s 300-entry cap is smaller than one 10 s shot (320 entries). Make the cap sized for a shot, or LRU, so a second pass over the same frames hits cache. Measure it.
5. Re-render lookdev on the same `v2_4` parts (absolute path `/Users/ericzhang/code/media/looming/assets/raw/style_tile_v2_4.png`, cut into your worktree's `assets/cut/`, uncommitted). Produce the same evidence set, **plus** a `before_after.jpg` (old phone/lamp frames from `evidence/lookdev-composite/` vs new).

## Acceptance
- [ ] No constant-width rim anywhere (crop at 200%)
- [ ] Wall texture visible across the whole frame in both phone and lamp states; loom shadow still reads at ≈3×
- [ ] Cone reaches the pool; desk is textured paper
- [ ] Second pass over the 10 s lookdev is measurably faster than the first (numbers)
- [ ] Determinism passes for lab/lookdev, lab/paper, lab/post, lab/lights
- [ ] Honest paper-vs-vector read again, and what's left that only new art can fix
