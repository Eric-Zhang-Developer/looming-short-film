# Director questions (from sb-reconcile)

> **Answered 2026-10-15.** Director: "Q1–Q9: go with every recommendation." Each question below is decided as its **Recommend** line. Q2 = (b), seen not heard. Q7 = (b), matte ink with one painted highlight and a visible stain. Every other question = (a).

Each one changes a story beat, a character's design, the palette or a film-wide rule, so these are one-way doors. The specs are built to the **recommendation** until you answer. Everything reversible was resolved in the specs and logged in `done/sb-reconcile.md`.

**Q1 · What may move in a quiet shot?** Doc 03 says "only light and boil move". Doc 02 has the shadow "slowly breathe" in Quiet 1 and has him sit back while the blob climbs into his pocket in Quiet 2.
- (a) Allow both, kept short: s12's blob breathes ±6% over a 5 s period; s17's sit-back and pocket climb happen inside 4.0–12.0, then nothing moves for 13 s. *(current)*
- (b) Strict doc 03: s12's breath becomes light only (the phone dims and brightens); move the pocket climb to the end of s16, so s17 holds still for all 25 s.
- (c) Strict for s12 only, (a) for s17.
- **Recommend (a).** Both actions are doc 02 beats, and the 13 still seconds after 12.0 keep the Sixth Station feel. Counterpoint: (b) is the purer held shot. *Shots: s12, s16, s17.*

**Q2 · Is the neighbor's lamp click heard?** **Superseded 2026-10-15 (motion sensors):** there is no neighbor lamp. The answer, (b) seen not heard, carries over to the neighbor's zone waking in s16. Doc 05 says the click is heard three times (home, Marston, Freshman). The neighbor's lamp in s16 (`lampClickNeighbor`) makes a fourth.
- (a) The same buffer at −12 dB, panned right. *(storyboarded)*
- (b) Seen, not heard: the light comes on under the montage's theme note.
- **Recommend (b).** It keeps the three identical clicks as the hero's own motif. Counterpoint: a silent switch may read as unmotivated. *Shots: s16 (score and cues).*

**Q3 · s18's click squeezes the walk-over.** **Superseded 2026-10-15 (motion sensors):** he no longer stops at a knob. He walks past and the wake lands mid-stride at 4.0, so nothing is squeezed. The beat stays. The timeline has `lampClickFreshman` at 2:44.0. Doc 02 starts the walk-over at 2:44.
- (a) Keep the beat: the calendar wipe runs 0–2.0, he walks in 2.0–3.33, and presses at 4.0. *(current)*
- (b) Move the beat later (e.g. 2:46) in a contract-timeline task so the walk breathes.
- (c) Open G with him already at the Freshman's desk.
- **Recommend (a).** The walk-in is 1.3 s on 2s, which reads, and no beat moves. *Shots: s18, score.*

**Q4 · A second red circle?** Doc 03: red appears exactly once. Doc 02's "a new circled date" on next semester's calendar makes a second.
- (a) Red, the same motif: amend doc 03 to "red only on the calendar circle". *(current)*
- (b) A navy pencil circle; red stays unique to the first exam.
- **Recommend (a).** The rhyme needs the same mark to read as "another exam". *Shots: s18 (s02).*

**Q5 · Does the blob itself grow, or only its shadow?** **Superseded 2026-10-15 (the dread meter):** the director chose growth after the Act 1 preview. The body grows by gulps to 2.5× and shrinks per solved problem (`docs/shots/README.md` §1); the shadow rides on top. The counterpoint below is answered by keeping the two apart on screen: the light changes the shadow while the body holds (s03 0.5–1.5, the lamp and wake beats), and each gulp swells body and shadow together. Doc 02 says the Exam "grows because it is ignored" and later shrinks to "hamster-sized". The logline and the visual rule say the *shadow* grows.
- (a) Body constant at r 0.012 through s15; all of Act 2's growth is shadow geometry; the body shrinks only in s16, one step per solved problem (0.012 → 0.005). *(current)*
- (b) The body grows too, e.g. 0.008 at s02 → 0.012 by s07, with the shadow doing the rest.
- **Recommend (a).** "The metaphor is the algorithm": if the body grows, the audience can't tell whether light or neglect made the shadow big. Counterpoint: doc 02's wording. *Shots: s02–s18.*

**Q6 · Should the phone also throw the gator's own shadow?** A real screen faces its user, so a physical phone light would put his giant shadow over the blob's.
- (a) Stylized rig (`docs/shots/README.md` §4): the shadow light sits at the phone but aims at the blob, he stays outside its cone, his face gets an unshadowed cyan fill, and the phone spot drops to 0.2 when a lamp comes on (or a desk zone wakes, README §4). *(current)*
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

# Opened by spec-sensor (2026-10-15), unanswered

Marston has no desk lamps; its desk light is a ceiling fluorescent on a motion sensor (director, process log 2026-10-15). The specs are built to each **Recommend** line until you answer.

**Q10 · How long does a zone take to time out on screen?** Real occupancy sensors wait minutes, and no source gives Marston's (`docs/ref-ufl.md` §0). The film times its timeouts to beats: s11's light starts dying 0.6 s after he picks up the phone (4.2, while his hunch is still settling until 4.4), and s14's dies as the cart leaves.
- (a) Film time: timeouts land on the beat with no on-screen sign of time passing. A zone whose occupant went still only recently stays lit (the neighbor and the hero in s17). *(current)*
- (b) Also time out s17's zones as dawn takes over (the sleeping neighbor's early, the hero's after he goes still), so the rule never bends on screen.
- **Recommend (a).** The rule reads from cause and effect, not from a clock, and Quiet 2 keeps its single light event, the dawn. Counterpoint: an attentive viewer may notice a sleeping neighbor under a live tube in s17, which (b) fixes. *Shots: s11, s14, s17.*

**Q11 · Does the Custodian's passing wake the hero's light in s14?** Doc 02 said the Custodian "must not turn on the lamp".
- (a) Yes, briefly. His cart wakes the hero's zone at 1.0, the hero stays still, and it times out over 4.2–5.0. At `tinyBlobSeen` both blobs are small in one frame. It shows movement bringing the light before s15, and s18 (the hero walking the same aisle past the Freshman) rhymes with it. *(current)*
- (b) No. The hero's zone stays dead and the aisle is its own zone. s14 keeps its 5-second contrast (his 7.1× against the Custodian's 1×). But s15 becomes the first time movement brings the light, and s18 has to explain why the aisle wakes the Freshman's zone and not the hero's.
- **Recommend (a).** The light he's given dies because he doesn't move, so the hero still takes the first step himself, and the film's two passers-by rhyme. Counterpoint: it edges toward the cut "Custodian turns on the lamp", and it spends a little of s15's first small-blob moment. *Shots: s14, s15, s18 (doc 02).*

**Q12 · Is the light at the turn green-cream or warm?** Doc 03's color script had amber take over Act 3 from the desk outward, and the lamp was the film's amber. A ceiling fluorescent is faint green-cream (`docs/ref-ufl.md` §1).
- (a) The fluorescent tone (≈ `#DEDBC3`) in every zone. Act 3's warmth comes from the grade at the wake (s15 is built with an amber grade from the press) and from dawn in s17. Amber stays the home lamp's and dawn's. *(current)*
- (b) Warm the woken zones toward Lamp Amber (for example halfway). The turn keeps its color payoff, but the fluorescent stops looking like one.
- **Recommend (a).** It keeps Marston believable and saves the gold for dawn, where Quiet 2 needs it. Counterpoint: the climax may read cooler than the board intended; check it on s15's built frames at G4. *Shots: s15–s18 (doc 03 color script).*

# Opened by spec-blob-meter (2026-10-15), unanswered

The blob's own size is now the dread meter (process log 2026-10-15; `docs/shots/README.md` §1). The specs are built to each **Recommend** line until you answer. No beat time or cut moves in any option.

**Q13 · How big is the peak?** The brief said "about the gator's head height (around 3×)"; the process log's proposal said "about the gator's head size".
- (a) **2.5× (r 0.030)**, 6.8 × 6.0 cm. Sitting on the desk its eyes are level with his, so the s15 look is eye to eye. *(current)*
- (b) 3× (r 0.036), 8.2 × 7.2 cm, as tall as he is seated, measured from the floor. Its eyes sit 9 mm above his at the desk. In Camera A′ it fills about a third of the frame height. The Marston mark moves back to z 0.066 (S 2.37 keeps the 7.1-unit loom, whose top lands at y 0.165, so A′ still holds it); the laptop and the trough's aim are unchanged.
- (c) 2× (r 0.024), its top level with his head.
- **Recommend (a).** Eye level is a specific, readable image, and the desk close-ups keep room for him and the loom. Counterpoint: the brief's 3× reads bigger in the wide shots (s09, s10, s13).

**Q14 · Do other gators' blobs show the meter too?** The s13 crowd, the neighbor (s16, s17) and the Freshman (s18) keep 0.75–1.17× blobs under their 3–9× shadows, so the hero's 2.5× is the biggest in the room.
- (a) Keep their sizes: seen through his eyes, other people's exams look small and only their shadows look huge. The decals carry "everyone has one". *(current)*
- (b) Grow theirs to 1.5–2.5×, each different, keeping every decal's on-screen width. s13's table, s16/s17's neighbor and s18's Freshman change.
- **Recommend (a).** It restates the thesis (smaller than its shadow) in every other gator, costs no rework, and keeps the Freshman's s18 blob a fresh 1×. Counterpoint: in s13's top view his big blob could read as "his is the worst", which edges against "he isn't alone".

**Q15 · Camera A′ for s06 and s15.** A grown blob plus any loom bigger than it doesn't fit Camera A (about 9 cm of wall in view). Doc 11 keeps each shot's framing between the rough and the final unless a note changes it; this is that note.
- (a) **Camera A′** for both shots: A pulled back 0.26 m along its own axis, the whole loom in frame, and s15's push-in to Camera B′ restores the closeness. *(current)*
- (b) Keep Camera A and let the loom overflow the frame: dark wall with two eye holes, the "moons" anim-s15 already rejected.
- (c) Keep Camera A for the rough (`v1-animatic` is built that way) and switch to A′ for the final. The comparison then differs in framing in these two shots, not just in art.
- **Recommend (a).** The turn has to show a shape dropping to a pool, and the s06 ↔ s15 rhyme survives because both move together. Counterpoint: he is a third of the frame height before the push, smaller than in the built shot.
