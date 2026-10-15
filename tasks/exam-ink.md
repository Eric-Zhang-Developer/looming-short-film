# Brief · exam-ink

**Type:** builder · **Wave:** 4 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/03-art-direction.md` (§The paper and the ink), `docs/shots/QUESTIONS.md` Q7, `docs/contracts.md` §blob, `src/blob.js`, `done/mod-blob.md`, `done/look-pass-2.md`, `done/contract-blob.md`, `done/contract-light-key.md`; look at `evidence/mod-blob/squash_strip.jpg` and `evidence/look-pass-2/before_after.jpg`

## Director decision
Q7, verbatim: "go with every recommendation." Q7's recommendation: **(b) matte ink with one painted highlight, and the stain made visible.** It keeps the motion and shadow code, makes the Exam the film's one non-paper material without reading as 3D, and removes the highlight that can land where a mouth would.

## Owns
- `src/blob.js`, `lab/blob.js`, `docs/contracts.md` §blob (additive)
- `evidence/exam-ink/`, `done/exam-ink.md`

## Spec
- **Body:** matte ink black, no Fresnel rim, no 3D shading gradient. It reads as a flat, wet-ink silhouette with subtle density variation (thicker ink is darker at the edges, like a dried ink drop), and a faint grain so it sits beside paper.
- **One painted highlight:** a single small cream-white crescent or dot, placed in a fixed position relative to the body, upper-left of the eyes, never below them. It may shift slightly toward the key light's side, but it is drawn, not specular. It must never sit where a mouth or tear would read.
- **Eyes:** keep all six states and the `look` option unchanged.
- **Stain:** the decal under the blob must be visible on kraft and cream surfaces. It's a faint blotted ink ring that stays where the blob sat and fades over ~10 s after the blob leaves (deterministic, keyed to tLocal). Check it in s02 and s15 framings.
- **Shadow and silhouette:** unchanged. `customDepthMaterial` and `silhouette()` pixel-identical in shape.
- **API:** additive only. Shots shouldn't need edits.

## Acceptance
- [ ] `evidence/exam-ink/before_after.jpg`: the lab blob under phone and lamp keys, old vs new
- [ ] Re-renders of s03 (t 16.5) and s04 (t 25) showing the new look in context, plus a stain crop
- [ ] Determinism passes for `lab/blob.html`, and for `index.html` at 16.5, 25, 89.6, 16.5
- [ ] s13's pixels at 89.6 change only where blob bodies are (its decals use `silhouette()`; say what changed)
- [ ] contracts.md diff additive
