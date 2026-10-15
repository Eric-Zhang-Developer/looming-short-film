# Director questions (from sb-reconcile)

> **Answered 2026-10-15.** Director: "Q1–Q9: go with every recommendation." Each question below is decided as its **Recommend** line. Q2 = (b), seen not heard. Q7 = (b), matte ink with one painted highlight and a visible stain. Every other question = (a).

Each one changes a story beat, a character's design, the palette or a film-wide rule, so these are one-way doors. The specs are built to the **recommendation** until you answer. Everything reversible was resolved in the specs and logged in `done/sb-reconcile.md`.

**Q1 · What may move in a quiet shot?** Doc 03 says "only light and boil move". Doc 02 has the shadow "slowly breathe" in Quiet 1 and has him sit back while the blob climbs into his pocket in Quiet 2.
- (a) Allow both, kept short: s12's blob breathes ±6% over a 5 s period; s17's sit-back and pocket climb happen inside 4.0–12.0, then nothing moves for 13 s. *(current)*
- (b) Strict doc 03: s12's breath becomes light only (the phone dims and brightens); move the pocket climb to the end of s16, so s17 holds still for all 25 s.
- (c) Strict for s12 only, (a) for s17.
- **Recommend (a).** Both actions are doc 02 beats, and the 13 still seconds after 12.0 keep the Sixth Station feel. Counterpoint: (b) is the purer held shot. *Shots: s12, s16, s17.*

**Q2 · Is the neighbor's lamp click heard?** Doc 05 says the click is heard three times (home, Marston, Freshman). The neighbor's lamp in s16 (`lampClickNeighbor`) makes a fourth.
- (a) The same buffer at −12 dB, panned right. *(storyboarded)*
- (b) Seen, not heard: the light comes on under the montage's theme note.
- **Recommend (b).** It keeps the three identical clicks as the hero's own motif. Counterpoint: a silent switch may read as unmotivated. *Shots: s16 (score and cues).*

**Q3 · s18's click squeezes the walk-over.** The timeline has `lampClickFreshman` at 2:44.0. Doc 02 starts the walk-over at 2:44.
- (a) Keep the beat: the calendar wipe runs 0–2.0, he walks in 2.0–3.33, and presses at 4.0. *(current)*
- (b) Move the beat later (e.g. 2:46) in a contract-timeline task so the walk breathes.
- (c) Open G with him already at the Freshman's desk.
- **Recommend (a).** The walk-in is 1.3 s on 2s, which reads, and no beat moves. *Shots: s18, score.*

**Q4 · A second red circle?** Doc 03: red appears exactly once. Doc 02's "a new circled date" on next semester's calendar makes a second.
- (a) Red, the same motif: amend doc 03 to "red only on the calendar circle". *(current)*
- (b) A navy pencil circle; red stays unique to the first exam.
- **Recommend (a).** The rhyme needs the same mark to read as "another exam". *Shots: s18 (s02).*

**Q5 · Does the blob itself grow, or only its shadow?** Doc 02 says the Exam "grows because it is ignored" and later shrinks to "hamster-sized". The logline and the visual rule say the *shadow* grows.
- (a) Body constant at r 0.012 through s15; all of Act 2's growth is shadow geometry; the body shrinks only in s16, one step per solved problem (0.012 → 0.005). *(current)*
- (b) The body grows too, e.g. 0.008 at s02 → 0.012 by s07, with the shadow doing the rest.
- **Recommend (a).** "The metaphor is the algorithm": if the body grows, the audience can't tell whether light or neglect made the shadow big. Counterpoint: doc 02's wording. *Shots: s02–s18.*

**Q6 · Should the phone also throw the gator's own shadow?** A real screen faces its user, so a physical phone light would put his giant shadow over the blob's.
- (a) Stylized rig (`docs/shots/README.md` §4): the shadow light sits at the phone but aims at the blob, he stays outside its cone, his face gets an unshadowed cyan fill, and the phone spot drops to 0.2 when a lamp comes on. *(current)*
- (b) Physical: he casts too, and the blob's shadow competes with his.
- (c) Hybrid: his shadow at about 30% opacity.
- **Recommend (a).** The rule has to read with one shadow per beat. Counterpoint: an attentive viewer may notice he casts nothing. *Shots: every phone shot (s03–s08, s10–s16, s18).*

**Q7 · The Exam's look.** `mod-blob` reads as glossy CG gel candy: a black body, a cyan fresnel rim, catchlights, and a highlight that can sit where a mouth or tear would (`evidence/mod-blob/squash_strip.jpg`). Doc 03 asks for glossy wet ink that stains paper.
- (a) Keep the gel.
- (b) Matte ink with one painted highlight and the stain made visible.
- (c) Painted Codex ink texture inside the shader silhouette.
- **Recommend (b).** It keeps the motion and shadow code, makes it the film's only non-paper material without reading as 3D, and fixes the mouth-highlight accident. *Shots: s02–s18 (G2 agenda).*

**Q8 · "Thursday" (doc 02, 0:54) has no marker.** Text is banned, so s08 reads only as "a night went by".
- (a) No marker. *(current)*
- (b) A cross-off scribble on Wednesday's cell in a later desk shot. No home desk shot follows s08, so this needs a new insert or a calendar in s08's bedroom.
- **Recommend (a).** "Before the exam" already reads from Marston at night. *Shots: s08.*

**Q9 · Does the gator have legs?** (from `char-rigs`) `gator_sheet`'s piece list has no legs, so the rig stands 5.3 cm, not the 8 cm that contracts §Conventions and README §1 assume. Walks are a legless waddle, and kneeling looks like standing.
- (a) Add `leg_l` and `leg_r` (short, stubby) to `gator_sheet`, and keep 8 cm. Every v2 style-tile variant already paints him standing on legs. *(current: the rig gets proxy legs now)*
- (b) Keep him legless and correct the 8 cm figure and the blob ratio film-wide.
- **Recommend (a).** It matches the style tile and makes walks and the s04 kneel readable. Note: the rig's legs are 37% of his height (the tile's are ~20%), forced by 8 cm plus s15's fixed head height; shorter legs mean a shorter gator or new s15 numbers. *Shots: every gator shot.*
