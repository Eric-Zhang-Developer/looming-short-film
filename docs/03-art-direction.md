# 03 · Art Direction

## North star

**A lit paper diorama.** Torn-paper cutouts stand on separate depth planes like a miniature theater set. Real light falls on them, glows through the thin ones, and casts shadows from layer to layer. It should feel as if someone built Gainesville out of construction paper in a shoebox and filmed it at night with a phone and a desk lamp.

Lineage to cite: Lotte Reiniger's silhouette animation (*The Adventures of Prince Achmed*, 1926), Michel Ocelot's shadow-theater films, and the "Tale of the Three Brothers" sequence in *Harry Potter and the Deathly Hallows: Part 1*.

**Primary style reference:** the torn-paper picture-book loop in `reference-videos/` (the screen recording). Keep its material language: torn white fiber edges, dry-brush fills, dot-eye faces, a navy/yellow/coral night palette. **Add what it lacks:** depth, real light, cast shadows, varied paper weights, and slow pacing. We aren't copying it; we're finishing it.

## The paper and the ink

The film's conflict should be visible in its materials before anyone understands the plot.

| Material | Used for | Look |
|---|---|---|
| **Cardstock** | Walls, furniture, gators, buildings | Opaque, slightly rough. Tight torn edge with a thin pale fiber rim. Dry-brush texture on the fill. |
| **Kraft / textured card** | Desks, floors, bookshelves | Warm brown with a visible fiber texture. |
| **Tissue** | Curtains, lampshade, window glass | Translucent and glows when backlit. Ragged, uneven edge. |
| **Vellum** | Light cones, the dawn haze | Mostly transparent, frosted. Catches light along its edges. |
| **Ink** | **The Exam only** | Matte liquid black with one painted cream highlight (Q7 b). Soaks a faint stain into the paper beneath it. Its shadow is the only true black in the film. |

**Everything is cut paper except the dread** (G4, 2026-10-15). The director on v1's blob: "It's more animated and less paper-cut, which makes it unnatural. I think you should keep it that way." So the contrast is a rule, not an accident:
- **Paper** is torn, grained, boiled and posed: it moves pose to pose and its edges shimmer.
- **The Exam** is the one thing that isn't: a smooth outline that never tears or boils, no paper grain, liquid squash, stretch and wobble. It should look a little too alive for the world it's in.
- **Words and marks are paper, not ink.** The notification, the calendar's lettering and its X, his handwriting and math, the red checks and circles: all are matte lines drawn on the sheet, part of the paper, even where the story says "pen". Nothing but the Exam is wet, glossy or liquid, so the eye never confuses a pen line with the dread.
- **Where ink meets paper** it stains: under the blob, along its first run (s02), and at the circle where it soaks back in (s18). The stain is the only ink-on-paper mark in the film.

Rules:
- **Vary the tear by paper weight.** Identical edge noise on every shape reads as a filter, which was the reference video's biggest flaw.
- **Boil the edges.** Edge noise re-seeds 8–12 times a second, so cutouts shimmer slightly like stop-motion. Held shots boil more slowly, about 4 times a second.
- **Nothing is perfectly flat.** Each plane gets a tiny tilt and curl. Cutouts sit a few millimeters off the layer behind them so they always cast a thin contact shadow.

## Palette

Separate **paper stocks** (the color of things) from **light colors** (the color of what lights them).

| Role | Name | Hex (starting point) |
|---|---|---|
| Paper | Night Navy (walls, sky, shadowed stock) | `#1E2440` |
| Paper | Cream (pages, highlights, moon) | `#F2E8D5` |
| Paper | Gator Green (characters) | `#6F8F5E` |
| Paper | Kraft (desks, floors, shelves) | `#A8835A` |
| Light | Phone Cyan | `#6FD3E3` |
| Light | Lamp Amber (the home lamp) | `#F0A84A` |
| Light | Fluorescent (Marston's ceiling light; faint green-cream) | `lerp(Cream, Gator Green, 0.15)` ≈ `#DEDBC3` (shots README §6) |
| Ink | Exam Black | `#0A0A0F` |

The dawn rose is **lamp amber mixed into cream through tissue**, not a new color. Red appears only on the calendar circles: the first exam, and the new circled date at the end (director, Q4).

### Color script

| Section | Dominant light | Mood |
|---|---|---|
| Act 1 birth | Cool morning plus the first cyan of the phone | Light, curious |
| Act 2a avoidance | Cyan grows and the room darkens with each dodge; amber flashes once (lamp beat) | Comic, slowly suffocating |
| Act 2b Marston | Flickering fluorescent green-white, then near-black with a faint cyan | Lonely, heavy |
| Act 3 first step | The woken desk fluorescent takes the frame back from cyan, from the desk outward (whether it warms toward amber is Q12) | Warm, relieved |
| Quiet 2 dawn | Gold through tissue windows, cold shadows warming | Peaceful |
| Button | Night navy and one lit pool: the home lamp's amber, then a woken fluorescent zone at Marston | Kind |

**Desaturate on the low point.** During Quiet 1 the gator drains slightly toward grey, while the shadow stays rich.

## Lighting rules

1. **One motivated source per shot.** Every shot names its key light (phone, lamp, fluorescent, window, dawn). Fill comes only from bounce and ambient.
2. **Light has shape.** Lamp light is a visible vellum cone with a hard pool on the desk and a few dust specks. Phone light is a low wedge. Marston's fluorescent is a louvred trough hung over each desk, with a soft pool and no cone; where the camera sees the trough, its tube shows whether the zone is lit. Draw the light as an object.
3. **Light falls off.** Brightness on each paper layer is computed from its distance to the source. The phone lights the gator's snout and the room fades to navy.
4. **Light comes through paper.** Thin stock glows when lit from behind: tissue curtains, the lampshade, the window, a lit torn edge. This is the look's signature.
5. **Light seeps out from behind layers.** Dawn creeps under the apartment door and between the Marston stacks as a hot thin seam along a paper edge.
6. **Two temperatures, one story.** When phone and lamp (at home) or phone and fluorescent (at Marston) share a room, the direction of the shadow tells you which one is winning.
7. **No glow without shadow.** Bloom is used sparingly, at the source only. Every glow must also cast a shadow somewhere.
8. **Marston's light answers movement.** There are no desk lamps at Marston. Each desk has its own ceiling fluorescent on a motion sensor: stillness lets it time out, and movement wakes it with a relay clack and a three-strike stutter. Nobody switches it by hand. The home lamp is the only light anyone clicks. Numbers are in `docs/shots/README.md` §3.

## Characters

**How characters are made.** Each character's painted surface is generated once with Codex image gen as a single design sheet: a turnaround plus separated parts, with eyes and mouths on their own sheet. It's flat-lit on a chroma-key background. The director curates it and it's frozen. All poses come from rigging those parts in code, so the character never drifts between shots. See doc 04.

**The Student (gator).** A paper puppet built from about 8 flat parts: body, head, upper jaw/snout, lower jaw, 2 arms, tail, hoodie pocket. A chunky, rounded silhouette that reads at small size. A short snout so the face reads front-on. Gator Green cardstock with a lighter belly and a darker dry-brush back. The hoodie is cream tissue-weight, so it glows a little when backlit.

**Face set** (texture swaps, no in-betweens):
- eyes: open, closed/content, half-lid tired, wide/gasp, worried (with sweat dots), side-glance
- mouth: neutral, small smile, open "o", tight line

**The Exam (ink blob).** A soft round drop, about the size of a coffee mug in its first scene. Two small round eyes in cream, the only light parts of it. It moves like liquid: squash on landing, slow wobble at rest, stretch when it rolls. In light from above it looks nervous, and small next to its shadow at any size. Its shadow is a clean, soft-edged silhouette of the blob, eyes included as holes.

**Its size is the meter** (doc 02, `docs/shots/README.md` §1). It grows in steps from 1× at birth (2.4 cm across) to 2.5× by Marston (6 cm tall, its eyes level with his at the desk), then shrinks one step per solved problem to 0.42×, small enough for his pocket. Each step is a **gulp**: eyes closed on a squash, a one-drawing snap to the next size with a stretch, a settle, and its eyes back on him. Bigger means heavier and more anxious, never meaner: the eyes stay round cream discs, it never gets a mouth or teeth, and the matte ink, the painted highlight and the stain scale with it unchanged. It never swells slowly. Each size must read against props the audience knows: the calendar circle, the jars and the stool (s04), the coffee table (s05), his head (s06 on).

**Roommates, Custodian, Freshman.** The same puppet system with different proportions and paper colors: a tall roommate, a round one, an older custodian with a hunch and a cap, a small Freshman with an oversized backpack.

**Crowds.** Marston extras are simpler cardstock silhouettes with 2–3 parts each. Every one has a different scale, pose and distance from its light. **Never clone a figure.**

## Camera

- **Miniature depth of field.** Shallow focus with soft background layers is what makes it read as a diorama and not flat graphics. It's the biggest single sell.
- **A long lens** (narrow field of view) to keep the layers flat and theatrical.
- **Locked off by default.** Allowed moves: slow push-ins on held compositions, gentle lateral parallax to reveal depth. **No** handheld shake, orbiting, or endless drift.
- **Quiet shots are fully locked.** Only light and boil move.

## Motion

- **Characters animate on 2s** (12 fps) and step pose to pose with clear holds. Stiffness becomes stop-motion charm.
- **Light and camera move on 1s** (24 fps), so light feels alive while puppets feel handmade.
- **Faces change on a single frame**, timed to beats.
- Anticipation and settle on every big action (lamp reach, pen uncap, head lift).

## What we take from the reference study

Eight code-made films were reviewed (see `reference-videos/`, not in git). None used real cast shadows, and none held a shot longer than about six seconds.

| Reference | Take |
|---|---|
| Torn-paper picture-book loop (screen recording) | The whole material language, plus dot-eye face swaps |
| *i'm upping my p(doom)* (4K) | One warm source with distance falloff; the empty-stage spotlight held still; the collapse-to-slit transition |
| *Claude Pop – I'm Upping My P(Doom)* | The night room with screen glow; light seeping from behind a door |
| *Claude AI Made This Music Video* (riso) | A restricted ink palette with one global grain pass; one torn-paper wipe |
| *WHY AM I SLOP?* | Warm lamp against a cold window in one room; a tiny figure in a huge frame |
| *LGTM* | Top-down grid of dark desks with one lit; a subject in a spotlight on a little stage |
| *Sydney vs Claude* pixel fight | Hold the pose while the scene warms from cold to gold; drain color at the low point |
| *AI is a normal technology?* | Light drawn as a geometric cone plus a floor pool |

## What reads as "made by AI" (banned)

- On-screen text, captions, HUDs, fake data labels
- Cloned crowds
- Bloom soup and blown-out glow
- Swirling light ribbons and particle-storm climaxes
- A camera that never stops moving
- The same procedural edge on every shape
- Cutting every 1–2 seconds
