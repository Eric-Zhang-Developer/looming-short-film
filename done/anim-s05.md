# Done · anim-s05

## What shipped
s05 (game night) blocked for the animatic on proxies. The living room is built to the spec's coordinates (wall, floor, window pane, couch back and seat strip, coffee table, floor cushion) under the locked FOV 20 camera. The Student (legged `makeGator`, mirrored to face frame-left) holds the phone at L = (0.075, 0.035, 0.40); the Exam sits on the table at B. The wall shadow is 8.1× by geometry. roommate_round sits inside it; roommate_tall gets up at 3.0 and walks frame-right through it at z 0.16. All puppets are on 2s, the TV flickers at 4 Hz on 1s, boil 10/s. Both roommates and the Student use the shared rigs and `poses.js`.

## Where it lives
- `src/shots/s05.js`
- `evidence/anim-s05/`: `sheet.jpg`, `still_4_5.jpg`, `still_5_0.jpg`, `crop_walker_4.5.jpg`, `crop_round_1.0.jpg`, `strip.jpg` (3.33–6.33, every frame), `measure.html` + `measure.mjs` → `measure.txt`, `determinism.txt`, `check_timeline.txt`
- Commits on `task/anim-s05`: `609f9b9` (shot), `fef30ec` (evidence), plus this note

## How it was checked
I looked at every image listed. Sheet, strip and crops are global-time renders (shot starts at 28 s).
- [x] Sheet: `--sheet=28,29,30,30.8,31.17,31.5,32,32.5,33,33.17,33.5,34,35.5,35.95 --cols=6` (local 0, 1, 2, 2.8, 3.17, 3.5, 4, 4.5, 5, 5.17, 5.5, 6, 7.5, 7.95).
- [x] Two stills: `still_4_5.jpg` (he is in the shadow) and `still_5_0.jpg` (cheer and hop), 1920 px JPEG, 350 KB each.
- [x] Shadow scale, `measure.txt` (smoke-paper method; the TV and window shadows are off for the diff so only the phone's shadow counts): **8.13× at 2.0, 8.10× at 4.5, 8.08× at 7.0** against 8.0 ± 0.8. Shadow on the wall x −14.8…7.3 cm, y 0…19.7 cm, against the spec's −14.1…5.1 and 0…18.7 (wobble breathes it).
- [x] `node tools/determinism.mjs --page=index.html --t=29.5,31,38,29.5` → `determinism: PASS`. `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] Framing checks against the spec's NDC points: blob, phone, Student, couch left edge, shadow top and left edge land within a few px of the spec at 1920×1080.

Spec acceptance:
- [x] 1. Shadow 8.1× at 2.0 s (above).
- [~] 2. At 4.5 s the walker's body is inside the shadow volume and his wall silhouette is dark (`crop_walker_4.5.jpg`). His body goes from mint (lit) to grey-green, **not black**: the §10 fill, the TV and the ambient light still reach him. His feet (below the volume's y 0.011) and the wall on both sides of the shadow edge read cyan.
- [x] 3. Strip 3.33–6.33: the step cadence, bob, eyes `open` and mouth `neutral` don't change through 4.0–4.9. It is a pure function of the walk keys, with no branch on the shadow.
- [~] 4. `crop_round_1.0.jpg`: round is inside the shadow (the shadow edge crosses the seat strip beside him). Like the walker he is darkened, not black, for the same reason.
- [x] 5. The Student's eyes are `tired` for the whole shot (sheet: 0, 2, 3.5, 4.5, 5, 6, 7.5). Mouth `smile` 4.50–4.83 only.

**Readability:** From the strip alone, a cold viewer sees a huge soft shadow of a little black blob filling the wall, with its eyes cut out as holes. Two couch-sitting gators ignore it, one of them gets up, walks right through it without a glance and goes off right, while the hunched gator at the phone never looks up. That matches the Story job. Weaker: the roommates are dark proxies with tiny eyes and the shadow is a mauve grey, so "nobody can see it" rests on the walker's body language, not on faces.

## Gaps
- **Roommates face +x in profile, not the camera.** The rigs are side-view only, so "seated on the couch facing camera" is not built. Round and tall mash controllers in profile and look toward frame-right.
- **The Student is a plain profile, not "opened 3/4",** and holds the phone in his near arm (the spec says left hand), because the rig has no 3/4 pose. His hip is at x 0.131 so his fingertip lands on L: the spec's centre x 0.10 would need a shorter arm. His body is about 3 cm further right than the spec's NDC 0.60, so the tail tip sits close to the frame edge.
- **Window: no hole in the wall.** The wall is one sheet, so `dawnLight` can't come from behind it. The pane is a tissue piece on the wall; the dusk-to-night ramp (k 0.3 → 0) runs as a front light at 30% (about 10% of the key at the wall) with its shadow off. Spec: behind the wall with shadow on.
- **Tall at scale 0.9** (the sheet's tall is 0.111 m at 1.0; the spec wants head top 0.10). Round is at scale 1 with its bottom 3 cm behind the seat strip, so its head top is 0.08.
- **Walk speed** is 0.15 m/s (−0.15 → 0.30 over 3.0 s), a 0.05 m step. The spec says stride 0.045, which doesn't reach 0.30 in 3 s. The endpoints won. The Exam flips its eyes at 4.5 per the spec's "about 4.5", though the walker reaches x 0 at 4.33.
- **§10 fills** are short-reach cyan points (Student body, seated pair, a follower on the walker; distance 0.17–0.2) and not shadowed. They do not reach the wall (≥ 0.2 m beyond their cutoff). Their intensities (0.03–0.05 cd) are tuned by eye; the faces read at about 35–45% of the lit wall. **Not measured.** `exam.update` is passed `{ key: spot }` per §11.
- **Hot spot on the coffee table.** The key grazes the table fascia and top from 5 cm away, so they burn out toward white-cyan, and a glow pools on the floor below. I darkened the table top (kraft mixed 50% to navy); the fascia is the frozen-art proxy and is still hot. It reads as the phone's pool, but it's the brightest thing in frame. A look call.
- **The TV's faint blob shadow (1.78×)** shows as a ghost to the right of the big shadow, with eyes. It is in the spec, but it is more conspicuous than "faint", which clashes with one key, one shadow. Look call at G4.
- The couch proxy is navy (saturated against the cream wall); the real art is kraft cushions on a cardstock couch. The coffee table, couch and window have no frozen art yet. Proxies only; art not verified.
- The controller on the couch arm at 2.67 is placed by eye at (−0.20, 0.038, 0.098). Footstep skating isn't corrected (a blocking walk).
- Sound is not added. A floor cushion (kraft ellipse) was added under the Student, which the spec's layer table doesn't list.
- Render time was 4–7 s per frame while the other builders were running. Two 4096-px-class assets (wall, floor at 2048) are cached.

## State
built · 2026-10-15
