# Brief · spec-g4

**Type:** builder (docs + timeline contract, no Chrome) · **Wave:** 5a · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md` (the director's notes, verbatim), doc 07's last two entries ("G4 on v1-animatic", "Text rule relaxed"), `docs/02-story.md`, `docs/shots/README.md`, every `docs/shots/sNN.md`, `src/timeline.js`, `tools/check_timeline.mjs`, `docs/contracts.md` §timeline, the sound doc in `docs/` and `src/audio/cues.js`

## Goal
Turn the director's G4 notes into the story and shot specs that v2 is built from: an explicit opening, home that reads, laptop avoidance, the blinds made causal, a 15–20 s payoff, and the calendar ending. Runtime about 3:15 (3:10–3:20).

## Owns
`docs/02-story.md`, `docs/shots/**`, `docs/03-art-direction.md` (the paper-vs-ink rule only), `docs/assets.md` (new rows), the sound doc's cue table, `src/timeline.js`, `tools/check_timeline.mjs` (only if new shots need it), `done/spec-g4.md`

## Spec (the decisions are made; write them well)
1. **Opening, explicit:** the phone buzzes with a school notification (generic red badge, no Canvas logo) reading **"Calc 2 Exam · Fri"**. Then a zoom onto the paper calendar, where Friday says "Calc 2 exam", hand-lettered and circled. The ink drop is born from that circle, as now. Text is allowed sparingly (doc 07): short, hand-lettered, in the paper style.
2. **Home must read as a home.** A student bedroom (bed, desk, window, shelf) and a kitchen that reads at a glance (fridge, stove, sink, counter, microwave). Everything is sized against the gator, so give real-world sizes for each piece in `docs/assets.md`. Kit names: `home_kit` (bedroom) and `kitchen_kit`.
3. **Avoidance is a laptop game at home** (the screen glow is the low light, so the big shadow still works). The phone stays for Marston. Rewrite s03, and s05 or s08 where it fits.
4. **Blinds made causal (s07):** each blind he pulls down removes a band of daylight, and the blob's shadow steps up one meter size. It ends with only the screen's glow. The point: he shuts out the passing time, and that feeds it.
5. **Payoff, 15–20 s, after he writes his name (s15/s16):**
   - **Practice:** a Calc 2 sheet with real, correct math. Use integration by parts, ∫x·eˣ dx = x·eˣ − eˣ + C, plus one series (ratio test). Show his hand working, a crossing-out, then a check. The blob shrinks one step per solved problem; the score already plays "one note per solved problem".
   - **Test day:** a new short scene in an exam room, rows of desks. The test page has a problem like the one he practised. He recognises it, gives a small smile, and writes calmly.
   - **Grade back:** the paper returned with red checks and a circled score (e.g. "94").
6. **Ending replaces the pocket (s17):** he crosses off the exam date on the calendar. The blob shrinks to an ink dot and is absorbed back into the calendar: gone. **Tag:** a new date is lettered, a tiny ink drop quivers, he looks at it and uncaps his pen. Rework s18 to fit, or fold it into the tag, whichever reads better. Keep the Freshman's light if it still earns its place.
7. **Keep:** the blob is ink, not paper (doc 03: "everything is cut paper except the dread"). Keep the library and its lighting; refine, don't redesign.
8. **Shot IDs:** keep the existing files. Name new shots so the order is obvious (e.g. `s00`, `s15b`, `s16b`, `s16c`) and update the shots README. Every shot spec keeps the existing format: beats with times, camera, light, poses, faces, BLOB_R from the dread meter, cues.
9. **Timeline:** update `src/timeline.js` to the new cut (≈3:15) with beat names for the new moments. `node tools/check_timeline.mjs` must pass. The film is re-rendered anyway; the v1/v3 comparison aligns by scene.
10. **Sound:** add cue rows for the new beats (notification buzz, game blips, blind rattle per blind, pencil scratch, exam-room hush, paper slide, the dissolve, the tag's motif reprise). Re-time existing cues to the new beat names.

## Acceptance
- [ ] Doc 02's beat sheet reads end to end as the new film, with timings summing to the timeline
- [ ] A spec for every new shot, and every changed spec updated (list them in the done note)
- [ ] `check_timeline` ok, output in the done note
- [ ] Any math shown is correct (show your working in the done note)
- [ ] The done note ends with `## Story`

## Out of scope
Shot code, art, audio code. Don't move or restage Marston shots beyond what the notes require.
