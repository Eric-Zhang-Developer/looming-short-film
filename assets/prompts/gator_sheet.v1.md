# Gator sheet · v1

Blocks 1, 2 and 4 are the shared files in `assets/prompts/_blocks/`, inserted verbatim by `tools/gen.mjs` (block 4 with the magenta key from `assets/specs.json`). This file supplies block 3 and block 5. Everything above `## 3.` is not sent to Codex.

Carries out G1 ("I like it", style tile v3_4, frozen as `assets/frozen/style_tile.png`, the only reference attached), Q9 (short stubby legs) and the note "the gator is really ugly ngl": appeal first. Part names, orientations and pivots follow `src/characters/gator.js` and the cutter's art conventions in `docs/contracts.md` §characters. Faces: doc 03 makes eyes and mouths texture swaps from the separate face sheet, and the rig puts eye and mouth slots on `head` and on `turn_front`, so those two (and `turn_head34`) are painted blank. `turn_side` is painted fully featured: s12 uses it as a whole figure with no face slots, and it is the featured side head the director judges appeal on.

## 3. Asset

A character sheet for "the Student," the film's hero: a young alligator college student made as a cut-paper puppet. The design is the small gator on the far right of the attached style tile, and it must stay that exact character, only drawn larger and cleaner. Do not redesign him. Copy his shapes, proportions, colours and friendly expression from the reference.

The design, in words. He is built from a few flat, simple geometric shapes, like a mid-century picture-book illustration, with a strong silhouette that would read instantly if filled solid black. Standing in side view facing right, he is about as wide (snout tip to tail tip) as he is tall. His head is a tall rounded shape that runs forward into a long, straight, blunt snout with a squared-off rounded tip, held level; the snout is about as long as the head is tall, with no bumps along it and one tiny dark nostril dot near the tip. On the top back of the head sits a small semicircle eye bump. The upper jaw is green; the lower jaw and throat are cream, and the cream sweeps from the chin down the front of the neck into the chest. The closed mouth is a long, gently upturned smile line where the jaws meet, and along it two to four very small cream triangle tooth tips peek up, friendly and neat, never sharp. He wears a boxy oversized cream hoodie that covers him from the neck to the hips, with the hood down as a soft rolled collar at the back of the neck, straight sleeves with simple rounded cuffs, and round green mitten hands. Below the hoodie hem, two short, stubby, chunky green legs, each a rounded rectangle with a small foot pointing forward; the legs are only about one fifth of his standing height. Behind him a long tapering tail with a blunt rounded tip, its underside cream, with a single row of three or four small rounded scallops along its top edge in a slightly darker green. Minimal interior detail: each shape is one flat field of colour. The feeling: confident, charming, friendly, designed.

The paper, which is the main thing to fix from the reference: he is torn paper, not felt. Matte cardstock surfaces painted with dry-brush gouache: visible bristle streaks, slightly uneven pigment, soft paper grain. Each piece is flat colour cut from card, with a thin pale torn fibre rim at every cut edge, fine paper grain inside, and no fuzz, no pile, no fibres standing up from the surface, no wool, fleece, felt or fabric look anywhere, including the hoodie. The hoodie is plain cream paper with no fold shading. Every piece is one flat cut shape; nothing is drawn as a 3D object with a top and a side.

Fourteen separate pieces, all at one shared scale (each part exactly the size it is in the side view), laid out in three rows on one sheet:

Top row, the turnaround, four pieces left to right, all standing on one baseline at the same height:
(1) full figure, side view facing right, arms hanging down at his sides with the near mitten hand just below the hoodie hem, legs straight, feet flat. This one is fully painted with his face: one big round eye in the eye bump (a cream circle with a large black pupil looking forward and one small cream dot in the pupil), the smile line, the tooth tips and the nostril dot.
(2) full figure, front view facing the viewer, painted WITHOUT arms (the shoulders are clean rounded hoodie shoulders with no sleeves), the snout foreshortened to a wide rounded muzzle, the eye bumps on top of the head. The face is blank: no eyes and no mouth painted (they are a separate sheet).
(3) full figure, back view: the back of the head, the hood lying down on the hoodie's back, arms hanging down, the tail coming toward the viewer and resting on the ground. No face.
(4) the head alone, without the body, in three-quarter front view turned toward the right, with its snout and jaws as one piece. The face is blank: no eye and no mouth.

Middle row, five rig parts left to right, each a side-view part of the figure in (1), facing right:
(5) body: the hoodie torso alone, from the neck to the hips, with the hood rolled down at the back of the neck and a band of green hips below the hem. No head, no arms, no legs, no tail, no pocket.
(6) head: the cranium alone with the semicircle eye bump on top, ending where the snout begins. No snout, no lower jaw. The face is blank: no eye and no mouth painted.
(7) upper jaw: the long blunt green snout, pointing right, its root on the left and the rounded tip on the right, with the tiny nostril dot near the tip.
(8) lower jaw: pointing right, root on the left, green on top and cream underneath, with the two to four small cream triangle tooth tips standing up along its top edge.
(9) tail: lying horizontal, pointing LEFT, its root on the right and the blunt tip on the left, cream underside, scallops along the top edge.

Bottom row, five rig parts left to right:
(10) far arm and (11) near arm: two identical hoodie sleeves lying horizontal, the shoulder end on the left and the round green mitten hand on the right.
(12) far leg and (13) near leg: two identical short stubby green legs standing upright, the hip end at the top and the small foot at the bottom pointing right.
(14) pocket: the hoodie's kangaroo pocket alone, a soft rounded cream rectangle.

Every piece is one complete closed shape. Every piece sits apart with at least 40 px of empty background on every side, so no two pieces touch, overlap or share a bounding box, and no piece touches or is cropped by the frame edge. Parts include the small extra overlap at their joints (the top of each leg, the shoulder end of each arm, the root of the tail and of each jaw), finished as clean rounded ends.

Palette: gator green #6F8F5E for the gator, a slightly darker green only for the tail scallops, cream #F2E8D5 for the hoodie, pocket, belly, lower jaw and tooth tips, black only for the one pupil and the nostril dot in piece (1). Nothing in the artwork is magenta, pink or purple. No navy, no amber, no kraft.

Banned: no text, letters, numbers or labels next to the pieces. No eyebrow, no brow ridge, no scales, no spikes or ridges, no claws, no tongue, no gums. No cast shadows, no drop shadows, no outline glow, no piece lighter on one side than the other.

Size: the largest landscape size available.

## 5. Notes

Director at G1, verbatim: "I like it", for the style tile's graphic picture-book gator (the attached reference). Earlier: "the gator is really ugly ngl." Appeal is the top priority: keep exactly what made the reference gator likable.
- In the reference, every surface reads as felt: a fuzzy, fibrous pile. The film is torn paper: flat colour, a pale torn fibre rim at every cut edge, fine paper grain, no fuzz or pile.
- In the reference the pieces sat 5 to 24 px apart. Keep at least 40 px everywhere, including from the frame edge.
- Keep his legs short: about one fifth of his standing height, as in the reference.
