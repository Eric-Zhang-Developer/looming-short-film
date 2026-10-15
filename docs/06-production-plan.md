# 06 · Production Plan

## Principles

1. **Prove the look before building the film.** A 10-second test shot comes first. If it doesn't look like lit paper, nothing else matters.
2. **Timing before beauty.** A rough animatic with temp sound locks the timing before any shot is polished.
3. **Acting shots are the expensive ones.** Seconds of film aren't. Budget by acting shots.
4. **Every week ends with something watchable.**

## Milestones (6 weeks plus buffer)

Dates are relative until the final deadline is confirmed on ProposalSpace. When it is, pin W6 to end five days before it.

| Week | Goal | Done when |
|---|---|---|
| **W0** | Spec | These docs are reviewed and pushed |
| **W1** | Test shot + gator rig | The 10 s test passes (below). The gator puppet shows all face swaps on a model sheet. |
| **W2** | Look locked + animatic | Every shot exists as blocking with placeholder paper and temp sound, cut to 3:00. The readability test with 3 cold viewers is passed. |
| **W3** | Act 1 + 2a final | Shots 1–8 at final quality |
| **W4** | Act 2b + 3 final | Shots 9–16 at final quality, including the crowd reveal |
| **W5** | Dawn, button, sound | Quiet 2 and the button are done. Score and foley are synthesized. First full mix. |
| **W6** | Polish + submission | Color pass, final render, captions, process log published, all 13 questionnaire answers written |
| Buffer | 3–5 days | Reserved for whatever breaks |

## The test shot (W1)

**What:** 10 seconds of the apartment wall, as in Act 1 and the home lamp beat.

- A diorama with three layers: the wall (cardstock), the calendar and a shelf (cardstock and kraft), the desk edge (kraft) in the foreground.
- The ink blob sits on the desk.
- **0–5 s:** the phone glows low and close from frame left. The blob's shadow climbs the wall to about 3× its size and slowly breathes.
- **5 s:** the lamp clicks on overhead. The vellum cone appears and the shadow drops to a small pool under the blob.
- **6–10 s:** hold. The blob blinks (a face swap) and settles. Dust specks drift in the cone.

**It passes when:**
- [ ] A cold viewer says "paper" before they say "3D" or "computer."
- [ ] The shadow growing and shrinking is obvious with the sound off.
- [ ] The tissue lampshade visibly glows through.
- [ ] Edges boil, and it feels handmade, not glitchy.
- [ ] Depth of field makes it read as a miniature.
- [ ] A frame renders in under 1 second at 1080p.

If it fails, change one variable at a time: material shader first, then depth of field, then edge texture. Log each attempt.

## Shot list

Complexity: **A** = acting shot (expensive), **L** = light-driven shot (cheap), **C** = crowd.

| # | Time | Shot | Key light | Cx |
|---|---|---|---|---|
| 1 | 0:00 | Dawn skyline, push to the window | Dawn | L |
| 2 | 0:06 | Desk and calendar, the ink drop forms and rolls | Morning | A |
| 3 | 0:15 | Phone up; shadow climbs the wall (rule 1) | Phone | A |
| 4 | 0:20 | Fridge dodge | Fridge light | A |
| 5 | 0:28 | Game night; roommate walks through the shadow | TV + phone | A |
| 6 | 0:36 | Lamp on, flinch, lamp off (rule 2) | Lamp → phone | A |
| 7 | 0:44 | Blackout curtains montage | Phone | A |
| 8 | 0:54 | Scroll in bed to sunrise | Phone → dawn seam | L |
| 9 | 1:00 | Marston exterior at night | Windows | L |
| 10 | 1:06 | Stacks; shadow follows; lights flicker | Fluorescent | A |
| 11 | 1:12 | Laptop, then phone; shadow closes | Phone | A |
| 12 | 1:18 | **Quiet 1**: head on the desk | Phone (faint) | L |
| 13 | 1:28 | Head lifts; crowd reveal (top-down desk grid) | Many phones | C |
| 14 | 1:35 | Custodian passes, tiny blob on cart | Fluorescent | A |
| 15 | 1:40 | Lamp click; the look; pen; name | Lamp | A |
| 16 | 1:54 | Problem #1 disbelief; montage; neighbor lamp | Lamp | A |
| 17 | 2:15 | **Quiet 2**: dawn reading room, blob to pocket | Dawn | L |
| 18 | 2:40 | Next semester wipe; Freshman lamp; yawn | Lamp | A |

Totals: 12 acting shots, 5 light shots, 1 crowd shot. Shots 6 and 15 must match each other exactly (same angle, same hand path, same click).

## Shared asset list

- **Sets:** apartment (desk, wall, kitchen, couch, bedroom, window), Marston exterior, stacks, reading room (wide and desk close-up), top-down desk grid.
- **Puppets:** Student, Exam blob, Roommate ×2, Custodian (+ cart, mop, tiny blob), Freshman, 8–12 crowd silhouettes.
- **Props:** phone, desk lamp, calendar (two sheets), laptop, pen, exam pages, blackout curtains, drill, ladder, controllers, fridge contents, energy drinks.
- **Light rigs:** phone, desk lamp + cone, fluorescent panels, window/dawn, TV.

## Render budget

- 3:00 at 24 fps = **4,320 frames** at 1920×1080.
- Target under 1 s per frame, so a full render takes under about 75 minutes on one machine. Frames are rendered in parallel workers and can resume.
- Render per shot during production. Render the full film only at W5 and W6.
- Encode H.264 high profile with a 4K-from-2K upscale for upload only if the judges' platform rewards it. Otherwise deliver 1080p.

## Review loop

- Contact sheets for timing, frame strips for motion, cropped close-ups for faces (the KnightHacks `render.mjs` flags).
- Watch every finished shot in context, never on its own.
- Weekly cold-viewer check: one person who has never heard the story watches the current cut.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Paper shader looks like plastic or 3D | Medium | The test shot comes first; fallback is a 2D lighting layer composited over paper renders |
| Gator acting feels stiff | High | Pose to pose on 2s, strong silhouettes, face swaps carry emotion, keep shots short |
| The visual rule doesn't read | Medium | Two demonstrations before Marston; readability test in W2 |
| Crowd shot is too expensive | Medium | Silhouette-only extras, top-down framing, mostly still |
| Shadow artifacts (acne, peter-panning, alpha edges) | Medium | Custom depth material for cutouts, tuned bias; see doc 04 |
| Scope creep beyond 3:00 | Medium | The cut list in doc 02 is binding |
| Deadline unknown | Medium | Confirm on ProposalSpace in W0 |

## Definition of done

- [ ] 3:00 ±5 s, 1080p, 24 fps, -14 LUFS, captions file
- [ ] No legible text anywhere in frame
- [ ] Readability test passed with the final cut
- [ ] Repo public with a reproducible render (`npm install`, then one command)
- [ ] Process log complete and linked from the README
- [ ] All 13 submission answers written and reviewed
