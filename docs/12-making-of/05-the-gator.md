# 5 · The gator

## Two gators

For most of October 15 the film had two gators.

The first lived in the shots. The animatic builders posed a stand-in rig, `src/characters/gator.js`: flat green shapes on a skeleton, with 92 named poses (`3b5b063`) and stubby legs added at 11:47 (`64c5aa7`). It existed so the shots could be timed and framed before any art was approved. Nobody ever meant it to be good-looking.

The second gator lived in Codex. Painters generated it as a picture, and the director picked it. Turning the painted gator into the rigged one is still to come: in the roadmap, the rig gets refit to the frozen art after tonight ([doc 11](../11-roadmap.md)).

## "the gator is really ugly ngl"

The painted gator's first version came with the v2 style tiles at 9:56 (`7baa17b`). There were four six-piece paper dioramas, each with a side-view gator in a cream hoodie ([`done/asset-style-tile.md`](../../done/asset-style-tile.md)). The lookdev composite built on v2_4 showed the palette problem (navy props on a navy wall, [chapter 4](04-paper-and-light.md)), and at 10:14 the orchestrator revised its G1 recommendation away from freezing any v2 (`e477f81`).

At 12:26 Eric answered G1 and the nine open story questions in one line: "G1: make style tile v3 with the value-contrast rule (+4 generations). Q1–Q9: go with every recommendation." Twenty seconds later, a second message:

> "the gator is really ugly ngl"

Then: "Codex to generate images for this." Then: "Okay, so this is the placeholder sheet, right?" He was looking at s15's animatic sheet. The orchestrator separated the two problems. The animatic gator was "a flat green stand-in silhouette so the shots can be timed. It was never meant to look good." And "the v2 tile gators weren't appealing either, so v3 is redesigning him from scratch." Appeal became the round's priority (`NOW.md`, "Director decisions").

## Four directions

The v3 painter kept the set identical across all four variants and gave each a different gator ([`done/asset-style-tile-v3.md`](../../done/asset-style-tile-v3.md)):
- **(a)** soft and round
- **(b)** lanky and sleepy
- **(c)** chibi
- **(d)** graphic picture-book

It ran into a limit of its own tool: `gen.mjs` takes one prompt per asset, so one call couldn't give four variants four different gators. It ran four sequential calls instead, swapping the gator-direction paragraph before each one, and recorded the prompt that actually ran in each sidecar. It used 11 of the 12 generations the director had allowed. The four gators are cropped side by side in `evidence/asset-style-tile-v3/gators.jpg`.

At 13:12 Eric asked "where are the videos?", corrected himself ("sorry the images"), then asked "which one is v3_4." After seeing it: "I like it." The freeze commit three minutes later (`a03dd39`) gives the reason: v3_4 "was the only one of the four that read as a gator at a glance while staying friendly, which was the point of v3 after the v2 gator was called ugly." `assets/frozen/style_tile.png` became the reference for every image painted after it.

## The sheet

A frozen tile isn't a character yet. The rig needs separate parts (body, head, jaw, arms, tail, legs) and the gator from every side. At 13:30 the gator-sheet painter returned three v1 sheets of 14 pieces each, all near-traces of v3_4 ([`done/asset-gator-sheet.md`](../../done/asset-gator-sheet.md), `assets/raw/thumbs/gator_sheet_v1_contact.jpg`). Its own screening found the faults, and the orchestrator passed them to Eric:
- The front view had no muzzle, so "he reads as a frog or a bear".
- The "3/4 head" came out as a plain side head on every variant.
- He was about 425 px tall, too small for the close-ups in s06, s15 and s18.

Eric, in the middle of a RAM emergency: "sounds g ood ok we can continue". Round 2 at 13:53 (`8c8051c`) gave the front view a real muzzle with teeth and the 3/4 head a true three-quarter turn. It also added a separate large **hero** side view for close-ups ([`done/asset-gator-sheet-v2.md`](../../done/asset-gator-sheet-v2.md)).

The screening caught two more things a quick look would miss. Variant v2_2 had the sleeves and hands painted onto its body piece, so once rigged the arms would appear twice. And hero_2 had drifted to a brighter green than the design Eric approved. At 14:04 Eric wrote: "G2: freeze gator sheet v2_1 and hero_1." The commit (`32c6434`) records why those two: v2_1 because v2_2 would double the arms, hero_1 because it keeps "v1_1's exact green".

One rule didn't survive. Doc 08 asks for 40 px between pieces on a sheet so they cut cleanly. After two rounds, and even after the prompt asked for 60 px, the gaps got smaller, not larger. The painter concluded that the fix was a layout change, "not another reroll". The cut still came out clean, at 14 islands.

## The face, 2.2–2.5× too big

The last piece of G2 is the face sheet: the swappable eyes and mouths that let a paper puppet act. The painter asked Codex to paint the open eye at the frozen head's exact scale, 59 px. The three variants came back at 136, 146.5 and 129.5 px. Its done note states the lesson plainly: "Codex does not follow absolute pixel sizes."

Instead of rerolling, the painter checked whether each sheet was at least *internally* consistent, with every piece sharing one scale. If so, one factor per sheet would make it fit by construction. v1_3 passed. Its lines measure 6.4 px at head scale against the frozen smile's 6 px. The painter composited v1_3's eyes onto the frozen head (`evidence/asset-face-sheet/on_head.jpg` on that branch) and ranked it first (`done/asset-face-sheet.md`, commit `8fd2701` on the local branch `task/asset-face-sheet`, not yet merged or pushed).

It also found a problem that isn't Codex's: the rig gives the side and front views one shared eye slot, so a front shot today would show a single side eye in the middle of the face. The face sheet is waiting for the director's pick (the recommendation is v1_3), and the rig is waiting for a per-facing eye slot.

## Where he stands

At the end of October 15 the gator's design is frozen in three files: `style_tile.png`, `gator_sheet.png` and `gator_hero.png`. The animatic still runs on the green stand-in. The gap between them is written down:
- The rig's legs are 37% of his height, where the tile's are about 20%.
- The face sheet needs scaling in code.
- The tile's surface reads "as felt rather than torn paper" ([doc 07](../07-process-log.md), "G1 approved").

Refitting the rig to the painted gator is a roadmap item for Friday ([doc 11](../11-roadmap.md)).
