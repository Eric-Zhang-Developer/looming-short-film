# 01 · Competition

## The brief in one paragraph

The AI² Gator Create Competition (UF AI Days, run by the AI² Center) asks UF students for creative work that engages with human-centred AI across the arts, design and humanities. Every entry must involve AI in one of four ways. *Looming* uses rule 2: **AI is a core medium for implementing the project.** Judges score five criteria and treat AI ethics as a core part of judging. The full brief lives in `Gator Create Competition - Transcription.md` at the repo root. The official page is https://ai.ufl.edu/ai-university/ai-days/gator-create/.

| Item | Status |
|---|---|
| Registration | Closed October 15, 2026 (on ProposalSpace) |
| Final submission deadline | **To confirm** in the ProposalSpace call details. The plan assumes 6+ weeks. |
| Category | Visual Arts → Narrative & Experimental Animation |
| Entrant | Solo |

## Why this category

The rules say to pick the category that reflects "the way you want it to be assessed." *Looming* wins or loses on whether it looks good and makes people feel something, and that is what animation judges assess.

Alternatives considered and rejected:
- **Acting & Performance → Non-Verbal Communication.** It fits a wordless film, but it judges performance, and character acting is the weakest part of code-built animation.
- **Script & Story.** Polished visuals barely count there.
- **Media & Visual Communications → Motion Graphics.** The film would read as commercial or explainer work.

## How AI is used, and how we frame it

**The risk.** A sharp judge can say: "This film is about doing the hard thing yourself, and it was made by having an AI do the hard thing." The FAQ also warns that "simply generating text or images is insufficient," and the brief asks for AI as "a leverage point rather than a crutch."

**The answer, which must be true in practice and not just in the write-up:**

1. **The director authors; the AI implements.** The story, beats, look, timing and every accept/reject call are human decisions. Claude writes the code that draws the frames. This is the same split as a director and an animation studio.
2. **The metaphor is the algorithm.** The looming shadow is not painted on. It is a real light computation, with shadow size set by light position. The film's central idea lives in its code, and anyone can read it.
3. **Nothing is a black box.** This is not text-to-video. Every frame comes from readable, open-source code, and every creative decision is recorded in the process log (doc 07). That serves the Transparency and Accountability principles directly.
4. **Generated images are raw material, not the film.** Codex image generation paints the surfaces: character art, props, backgrounds. Those images are opaque, flat-lit pictures. The code cuts them into paper, lights them, casts their shadows, rigs them and times them. The engagement is the compositing, lighting and direction, which is what the FAQ's "generating images is insufficient" line asks for. Every generated image is listed in a public manifest, and the end of the film shows what the model made and what the code made.
5. **Say the irony out loud.** The synopsis should admit that the director hit the same first-step wall while making the film. Owning that is stronger than hiding it.

## Criteria: where each one is earned

An outside cold read of the early treatment scored it Creativity 6, Innovation 4, Results 5, Strategies 4, Impacts 5. The current spec targets the fixes below.

| Criterion | How *Looming* earns it | Target |
|---|---|---|
| **Creativity** | A familiar feeling made new by a physical rule: shadow size equals avoidance. The paper-and-ink material split shows the conflict in the materials themselves. | 8 |
| **Innovation** | Real light simulation as the storytelling device. A code-built film that uses shadow and stillness, the two things AI-made video skips. | 7–8 |
| **Results** | Craft comes before runtime: 3:00, not 5:00. A 10-second test shot proves the look before production. Shown to cold viewers for readability. | 8 |
| **Strategies** | A public process log, a reference study of eight code-made films, the outside critique and how it changed the film, and a documented render pipeline. | 8 |
| **Impacts** | Every student knows this feeling. The film is designed to be screened in Marston during finals week and shared through first-year programs and counseling outreach. | 7 |

## Ethics principles: our position on each

- **Accountability:** a human signs off on every shot. The log records what was accepted, rejected and overridden.
- **Agency:** the director makes the creative choices. The film's own climax is about agency: the hero turns on his own lamp.
- **Dignity:** the film treats procrastination with tenderness, not shame. The monster ends up small and living alongside him, not defeated.
- **Environment:** no generative video model is used. A one-time library of a few dozen generated images is made, then everything renders locally on a laptop in about an hour.
- **Fairness:** generated imagery is limited to surfaces the director curates image by image. It doesn't depict real people or groups. The training-data question is acknowledged in the write-up, not hidden.
- **Misinformation:** original fiction. Nothing can be mistaken for real footage.
- **Openness:** the code, the asset manifest and the process log are public under an open license. The coding model (Claude) and the image model (Codex image gen) are closed, and the write-up says so. If UF's approved list includes an open-weight image model that runs locally, prefer it for textures.
- **Privacy:** no personal data is used in the film or the repo.
- **Robustness:** deterministic renders, self-tests on the timeline, and a pipeline anyone can re-run.
- **Transparency:** see "How AI is used" above.

## Submission questionnaire: answer plan

**Superseded for wording by `docs/10-submission.md`, the living draft kept current through production.** These were the points each answer must hit.

1. **Principal researcher:** Eric Zhang.
2. **Research associates:** leave blank.
3. **Category:** Visual Arts → Narrative & Experimental Animation.
4. **Title:** *Looming*.
5. **Department:** the director's program. Note that the project sits outside their field.
6. **Synopsis:** the logline, the visual rule, and the fact that it was made entirely in code with an AI collaborator.
7. **Context:** a 3-minute film for screens. Ideal venues are finals-week screenings in Marston, first-year orientation, and online. Code is public and re-renderable.
8. **Greater good:** procrastination is universal, and shame makes it worse. The film models one gentle, concrete move: the first step. It also shows that AI can be a transparent collaborator rather than a black box.
9. **Existing works:** Lotte Reiniger's *The Adventures of Prince Achmed* (1926), Michel Ocelot's silhouette films, the "Tale of the Three Brothers" sequence in *Harry Potter and the Deathly Hallows: Part 1*, Pixar shorts (*Piper*, *Bao*), *Inside Out*, the Sixth Station sequence in *Spirited Away*, and the eight code-made reference films studied (doc 03).
10. **Resourcefulness:** a reused render kit from earlier films, light physics standing in for hand-drawn shadows, a cut from 5:00 to 3:00 to protect quality, and the outside critique that reshaped the climax.
11. **Accessibility & pluralism:** the film is wordless, so no language barrier. Plan captions describing key sounds for Deaf and hard-of-hearing viewers. Keep high contrast in key moments. Avoid strobing.
12. **Expansion:** the paper-light pipeline can be reused by other student filmmakers, educators (light and shadow physics), and counseling or orientation programs.
13. **Unlimited resources:** a live score with real musicians, a physical paper diorama built to match the digital one, festival distribution, and a short series covering other student feelings.

## Differentiators to repeat everywhere

- The shadow is real light, not an effect.
- It holds still. The quiet shots are deliberate.
- Paper and ink: the conflict is visible in the materials.
- Fully open: the code, the log and the decisions are all published.
