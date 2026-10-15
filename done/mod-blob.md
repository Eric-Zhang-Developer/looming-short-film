# Done · mod-blob

## What shipped
`src/blob.js` implements `createBlob({ radius, seed })` and returns `{ mesh, update(tLocal, { squash, wobble, eyes }), stain }`. The blob is a vertical plane with a 4-ball metaball field (seeded body plus three lobes). It's shaded as glossy ink by the scene's key light and has cream eyes that can be `open`, `closed` or `worried`. Its `customDepthMaterial` runs the same field, so the shadow matches the blob and the eyes show as holes. The stain is a seeded soft blot that you fade with `stain.material.opacity`. `lab/blob.html` puts the blob on a kraft desk in front of a cream wall under a low cyan phone spot, with idle wobble (0–2 s, blink at 1.4 s), a hop and squash landing (2–3 s) and worried eyes (3–4 s). `?cam=close` gives the close-up view.

## Where it lives
- `src/blob.js`, `lab/blob.html`, `lab/blob.js`
- `evidence/mod-blob/`: `closeup.jpg`, `shadow.jpg`, `squash_strip.jpg`, `eyes.jpg`, `determinism.txt`, `render_lab.mjs` (a stand-in renderer)
- Commits on `task/mod-blob`: `076d098` (code), `cfbc99d` (evidence), plus the commit for this note.

## How it was checked
I looked at every image with my own eyes.
- [x] **Wet and glossy, not flat black.** See `closeup.jpg`: there's a crisp rounded-rectangle reflection of the source with a hot core, a cyan fresnel rim around the whole outline and eye catchlights. Caveat: the middle of the body is plain near-black, so the gloss reads from the edges and one highlight. It looks like gel candy, not a pool of wet ink.
- [x] **The wall shadow matches the outline, eye holes included.** See `shadow.jpg` (idle and worried): the lumpy outline and both eye holes show on the wall at about 2.8×. In the worried frame the holes are smaller and higher, just like the eyes. The bottom of the shadow falls onto the desk, which is physically correct.
- [x] **The squash strip shows anticipation and settle.** See `squash_strip.jpg`, one cell per 12 fps pose from 1.96 to 3.04 s: rest, crouch (wider, two frames), launch stretch, round in the air with a contact shadow below, falling stretch, impact squash with the eyes shut, rebound, and a damped settle back to rest.
- [x] **Determinism passes.** See `determinism.txt`. Each t ∈ {0.5, 1.45, 2.58, 3.5} was rendered twice in both camera views, with other frames in between. The PNG sha256s were IDENTICAL, all 4 times were distinct, and a second process gave byte-identical results. A grep for `Math.random|Date.now|performance.now` found nothing.
- [x] **Honest read: cute, a little nervous, not menacing.** It's a round bean with low-set, wide eyes, a big forehead and catchlights. With the low phone light, the highlight sits under the left eye like a tear or sweat drop. That reads as nervous, but it's an accident of where the light is, not a design choice. The wall shadow is the spooky one, a ghost with hollow eyes, which is the intended metaphor. Seen alone in the worried frame, the highlight can also read as a small "o" mouth (startled).

## Gaps
- **One key light only.** The highlight follows only the brightest shadow-casting light. With phone and lamp together (doc 03 rule 6), the second light adds nothing. This is marked `ponytail:` in the code.
- **The highlight lands on the face under a low frontal light.** That's physically correct, but in other shots it may sit in the "mouth" spot. I lowered the eyes and moved the lab light left so it reads as a tear. Shots should check it.
- **Floor clip from the stain.** The flat contact patch is clipped at the stain's world height, so a lifted mesh rounds out. This assumes an unrotated, unscaled blob over a level surface, with the stain added to the scene. Without the stain in the scene it clips at the mesh origin.
- **Stain not verified visually.** The desk under the blob is almost black in this lighting, so the stain doesn't show in any evidence image.
- **The wobble is quantized to 12 fps inside `update`.** I did this because doc 03 says characters animate on 2s. Squash comes from the caller, so callers should key it on the 12 fps grid (the lab does).
- **Lab look.** The phone spot uses decay 1 (not 2) so the blob doesn't blow out at 13 cm. The wall reads teal under the cyan light, and the shadow is brown-black because of the kraft hemisphere ambient. The lab light isn't `lights.js`, which isn't on this branch.
- **Tools.** `render.mjs` and `tools/determinism.mjs` aren't on this branch, so `evidence/mod-blob/render_lab.mjs` stands in for both. One 404 in the page console (most likely the favicon, the same as in mod-core).
- **Choices where the spec was silent.** `createBlob` defaults its argument to `{}` (an additive change). The eye catchlight goes beyond "cream discs" and was added so the eyes don't read as holes under cyan light. Closed eyes are a lower arc (content).

## State
built · 2026-10-15
