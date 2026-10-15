# 4 · Paper and light

## The metaphor is the algorithm

The film's rule fits in one sentence in [doc 02](../02-story.md): "Light held low and close makes the shadow loom. Light from above makes it small." Under that sentence is real optics: the shadow's scale is roughly the light's distance to the wall divided by its distance to the blob.

The rule started out wrong. In the first treatment a desk lamp aimed straight at the blob shrank its shadow. The cold reader pointed out that this would make the shadow *bigger* ([chapter 1](01-the-idea.md)). Once the phone went low and close and the lamp went overhead, the metaphor became something the computer could calculate rather than something an artist had to fake. The README's line, "The metaphor is the algorithm", is meant literally. `src/lights.js` has a function, `placeForScale`, that takes the shadow size a shot wants (3× on the wall, say) and solves in closed form for where to put the phone ([`done/mod-lights.md`](../../done/mod-lights.md)). Every looming shadow in the film is a real shadow-map render of a light placed by that math.

## The first shadow

The first proof came at 9:00, in wave 1. The `smoke-paper` builder stood a 6 cm torn-paper cutout with two eye holes 15 cm in front of a cream wall and lit it with a low cyan "phone". It measured the shadow by rendering the frame twice, once with the cutout casting and once without, and back-projecting the difference onto the wall. The result was 2.95× against a computed 3.000×, with both eye holes crisp in the shadow (`evidence/smoke-paper/phone_t0.5.jpg`, `shadow_crop.png`). Under the overhead lamp the shadow dropped to a 1.16× pool (`lamp_t4.0.jpg`).

Two smaller findings from that day are in [doc 07](../07-process-log.md). The three.js version the film pins, r186, had removed the soft shadow map type the spec assumed, so softness had to come from the shadow radius and the spotlight's penumbra instead ([doc 04](../04-technical.md)). And the procedurally drawn paper "read as vector, not paper." The physics was right and the material was wrong.

## Half paper, half vector

The material problem got its proper test at 10:12. `lookdev-composite` staged an apartment corner from the six painted pieces of style tile v2_4, in three depth layers, with every wave 2 module working together for the first time:
- torn edges from `paper.js`
- backlit translucency from `material.js`
- the phone and lamp from `lights.js`
- the ink from `blob.js`
- the night grade from `post.js`

The mechanics passed: a 3.04× loom with eye holes under the phone, a 1.4× pool under the lamp, deterministic frames and about 15 ms a frame. The commit title gave the verdict on the look: "first full-rig paper composite; half paper, half vector" (`67abc7e`). Side by side with the torn-paper reference (`evidence/lookdev-composite/vs_reference.jpg`), it read as paper only where it was lit. The builder listed four rig problems:
- a doubled rim (Codex's painted cream rim plus `paper.js`'s own), which read as a drawn stroke
- a night grade far darker than the reference's picture-book night
- light shapes that looked 3D
- a paper cache smaller than one shot

The fifth problem wasn't in the code at all. The v2 tiles painted the props in the wall's navy, so on screen they vanished and only their rims showed.

## Two look passes and a palette rule

The orchestrator split the fixes by who owned them. `look-pass-1` (`1c3c708`, 10:36) made rims thin and broken, with long gaps. If the art already had a painted pale rim, it thinned that one instead of adding a second. It also lifted the night grade to a picture-book night, cut the lamp's cone off at the desk so it ends in its pool, and sized the cache for a whole shot. `look-pass-2` (`0ce006e`, 10:50) gave the backlit edge-catch a wandering width with breaks, made the Exam ink-black and lit only by its key light, and softened the cone's sides by view angle. Before/after images are in `evidence/look-pass-1/before_after.jpg` and `evidence/look-pass-2/before_after.jpg`.

The palette problem went to the director, because palette is one of the decisions this project never lets an agent make alone. At G1 (12:26) Eric chose a new v3 tile under a **value-contrast rule**: props in cream, kraft, green, amber or red, and navy only for walls and sky ([doc 07](../07-process-log.md), "G1 and Q1–Q9"). The v3 painter made every prop pass a 25% luminance test against the wall (`evidence/asset-style-tile-v3/contrast.txt`). [Chapter 5](05-the-gator.md) covers what happened to the gator in that round.

## Ink, not paper

The Exam is the one thing in the film that isn't paper. The orchestrator had argued for this at 8:24: a paper world with one ink creature shows the danger in the materials before anyone follows the plot. Its first version looked like gel candy, and the commit for the director's Q7 pick (`0870fef`) explains why that failed: the specular streak between its eyes "read as a nose or a tear." The fix was matte ink with one painted highlight and a visible stain. Even then, the first crescent highlight "read as a raised eyebrow in the worried state", so the highlight moved to the upper-left shoulder (`evidence/exam-ink/before_after.jpg`).

## Shots that fought the rule

The animatic shots showed where the rule was hard to keep:
- **s03** was the first shot to put the rule on screen: phone up, shadow climbing the wall at 3.12× against a 3.0× spec (`evidence/anim-s03/sheet.jpg`). Its builder also found the blob casting no shadow at all. The light-aiming helper cut off anything closer than about 6 cm to the light, and the blob sat 5 cm from the phone. The fix went into the shared helper (`878cb9d`).
- **s09's** door light sat level with the blob and threw a 10× shadow across the plaza, where the spec allowed at most 1.5×. Raising the light above the doorway brought it to 1.45×.
- **Backlit gators.** Several shots made the gator a black silhouette, because the one motivated light was behind him. The orchestrator added a film-wide rule: a dim front fill on characters that casts no shadow and doesn't reach the wall, so the one-light, one-shadow rule still holds (`d22e43d`, `0ddcb1e`).
- **s15**, the turn, first framed a 7.1× shadow that ran off the top of the frame, so its eye holes "read as moons". Its fix took the loom down to 4.2× with a 1.45° camera tilt so the whole silhouette and both eyes stayed in frame (`d5d2fc5`).

`NOW.md` still lists the cost of those choices as known gaps:
- The shadow scale jumps between s14/s16 (7×) and s15 (4.2×).
- The blob draws 2.73 cm wide, not the 2.4 cm the shot specs assumed, so any width derived from 2.4 is 14% off.
- s12, meant to be the darkest frame of the film, "only just is".

None of these is solved yet. They're the to-do list for the final art pass.
