# Face sheet · v1

Blocks 1, 2 and 4 are the shared files in `assets/prompts/_blocks/`, inserted verbatim by `tools/gen.mjs` (block 4 with the magenta key from `assets/specs.json`: the pieces carry green lids and dark-green lines). This file supplies block 3. Everything above `## 3.` is not sent to Codex.

G2, second half. References: the frozen style tile v3_4 and the frozen gator sheet v2_1 (doc 08's table). Every piece is painted at the frozen sheet's own pixel scale, measured with `evidence/asset-face-sheet/measure.mjs` on `turn_side`'s head: the eye is a 59 × 60 px cream disc centred at (298.5, 130), its pupil a 37 × 38 px black disc centred at (309.5, 131), 11 px forward of the disc centre; the smile line is a dark green stroke (about rgb 74,102,61) roughly 70 × 29 px and 6–9 px thick. The front open pair is added because the rig's `eyes` slot is shared by the side and front facings (`src/characters/gator.js`), and s10 and s08 use the front turnaround.

## 3. Asset

A face sheet for "the Student," a young alligator college student made as a cut-paper puppet: the separate eye and mouth pieces that are swapped onto his blank head. Two images are attached. The first is the style tile (the look of the whole film). The second is his approved character sheet. Look at the full side view at its top left: his head has a semicircle eye bump with one big round eye in it (a cream disc with a large black pupil looking forward and one small cream highlight dot in the pupil), and a gently upturned dark green smile line on the side of the snout. Every piece on this sheet must look like that eye and that smile line: the same flat cut-paper shapes, the same cream, the same black, the same dark green line, the same friendly picture-book charm. Do not redesign them; make variations of them.

Scale: paint every piece at exactly the same scale as the attached character sheet, on a landscape canvas the same size as that sheet (1672 × 941 px). On that sheet the side-view eye is a cream disc 59 px across, so here every cream eye disc is 59 px across (about 3.5 percent of the image width), and every pupil about 37 px across. The pieces are small on a large empty sheet. That is correct: do not enlarge them.

Layout, three rows, evenly spaced, every piece at least 80 px from every other piece and from the frame edges, nothing touching or overlapping.

Top row, six side-view eyes, all for the side view (the head faces right), left to right:
(1) open: exactly the eye on the sheet. A round cream disc 59 px across, a big round black pupil 37 px across pushed toward the right (front) edge of the disc and touching it, and one small cream highlight dot in the upper part of the pupil.
(2) closed, content: no disc at all, just a single thick dark green curved line about 50 px wide, arching upward like a happy closed eye (an upside-down U), the same thickness and colour as the smile line on the sheet.
(3) half-lid, tired: the same 59 px cream disc and pupil as (1), with a green lid (the head's gator green #6F8F5E) covering the top half of the disc, its lower edge a straight, slightly sleepy line with a thin dark green line along it.
(4) wide, gasp: a round cream disc a little bigger, about 65 px across, with a small black pupil only about 20 px across in its centre and a small highlight dot. Shocked, but still cute.
(5) worried: the same 59 px cream disc, the pupil a little smaller and looking down and back (toward the lower left), the green lid covering a thin slanted sliver at the top of the disc, lower at the front, and two small cream teardrop sweat drops just behind the disc on its upper left, each drop touching the disc's edge.
(6) side-glance: the same 59 px cream disc and 37 px pupil as (1), but the pupil pushed to the left (back) edge of the disc, looking sideways and back, with its highlight dot.

Middle row, one piece:
(7) front-view pair, open: the open eye seen from the front, for the front turnaround. Two identical round cream discs, each 59 px across, side by side with their centres about 95 px apart, each with a 37 px black pupil in its centre looking straight at the viewer and a small cream highlight dot at the same upper-right spot in each pupil. Both eyes the same size, the same height, mirror-calm, friendly.

Bottom row, four mouths, all for the side view, each drawn as it sits along the side of the snout (the snout points right), in the same dark green line, 7 px thick, as the smile on the sheet:
(8) neutral: a gentle, almost straight line about 60 px long, curving up only very slightly at its right end.
(9) small smile: exactly the smile line on the sheet, about 70 px long, curving gently up toward the right like a friendly grin.
(10) open "o": a small round open mouth, a dark green oval about 22 px across and a little taller than wide, filled with a deeper dark green.
(11) tight line: a short, perfectly straight flat line about 40 px long, tense and pressed.

Every piece is the same line weight: every dark green line is the same 7 px thickness. Every eye disc is 59 px across except the gasp eye. Shapes are bold and simple so they read even when tiny. Each piece is one complete, closed shape (the sweat drops touch their eye).

The paper: the eye discs, lids and sweat drops are flat colour cut from matte card, with fine paper grain, and a very thin pale torn fibre rim along their outline, like the eye on the sheet. The lines are painted on, flat and even. No felt, no fuzz, no pile.

Palette: cream #F2E8D5 for the eye discs, highlight dots and sweat drops; black only for pupils; gator green #6F8F5E for lids; one dark green (about #4A6640) for every line and the open mouth. Nothing in the artwork is magenta, pink or purple. No navy, no amber, no kraft, no red, no blue.

Banned: no text, letters, numbers or labels next to the pieces. No eyebrows, no brow ridges, no eyelashes, no tongue, no teeth, no gums, no lips, no cheeks or blush, no head, no snout, no face around the pieces. No cast shadows, no drop shadows, no outline glow, no piece lighter on one side than the other, no 3D shine on the pupils beyond the one highlight dot.

Size: a landscape canvas 1672 × 941 px, or the nearest landscape size available.
