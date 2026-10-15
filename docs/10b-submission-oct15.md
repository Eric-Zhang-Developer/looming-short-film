# 10b · Submission as sent (Oct 15, 2026)

This is the paste-ready text for tonight's ProposalSpace entry, frozen as a record of what was submitted. `docs/10-submission.md` stays the living draft for the final version.

**Placeholders to fill before pasting:**
- **[YOUTUBE]**: the link to tonight's rough draft
- **[REPO]**: https://github.com/Eric-Zhang-Developer/looming-short-film

Fields the director fills himself: Principal Researchers (name, email, UFID), College, and the Submitter.

**Category:** Narrative & 'Experimental' Animation

---

### Project Title
Looming

### Project Synopsis
*Looming* is a three-minute, wordless animated short about a UF student, a small gator, and the exam he keeps avoiding. The exam is a drop of ink that rolls off his calendar and becomes a little blob with eyes. Its shadow is the problem. Under the low glow of his phone it fills the wall, and under light from above it shrinks to a puddle. The whole film runs on that one rule: the scary thing is always smaller than its shadow.

The shadows aren't drawn. They're real light computed in code, so the film's metaphor is literally its algorithm. I direct: the story, the look, the timing and every accept or reject decision. AI collaborators do the implementation. Claude writes the code that cuts, lights, rigs and times every frame, and image generation paints the paper surfaces.

What I'm submitting tonight is the film's own first step: a complete rough draft on the final timeline, with placeholder art. The finished, high-fidelity version is in production for October 26, and I'll show the two side by side. Watch it here: [YOUTUBE]

### Project Context
*Looming* is a 3-minute film for screens. The full-quality version lives on YouTube ([YOUTUBE]), and the upload here is a compressed backup copy.

It's meant to be seen where the feeling happens: on screens in Marston Science Library during finals week, where the second half of the film is set, in first-year orientation, and in conversations about procrastination and stress. Because it's wordless and short, it works without translation and shares easily online.

The whole film is open source: [REPO]. Every frame is a pure function of time, so anyone can re-render it identically on a laptop. The repository holds the shot specs, every image prompt (including rejects), a manifest of the generated art and a process log of every creative decision, including the ones that changed the story. Each cut is kept as a tagged release, from tonight's rough draft to the final film.

### Engagement with the Greater Good
Almost every student knows the feeling this film is about: the assignment you don't start because not starting feels safer, while the dread keeps growing. Shame makes it worse, and most messaging about procrastination is shame. *Looming* goes the other way. The monster is never evil. It's a small, nervous thing that only looks huge because of where the light is, and the fix the film shows is concrete and tiny: pick up the pen and write your name.

It's set on our campus. At Marston, the lights over his desk go dark when he sits still over his phone and come back on when he moves. That makes the turning point something any UF student has lived: action brings the light back.

It's also a working example of AI used transparently in art. The code, prompts, rejected images and decisions are all public, and a human signs off on every shot.

### Influence of Existing Works
- **Lotte Reiniger's *The Adventures of Prince Achmed* (1926) and Michel Ocelot's silhouette films:** the cut-paper tradition, and proof that a shadow can carry a performance.
- **The "Tale of the Three Brothers" in *Harry Potter and the Deathly Hallows: Part 1*:** shadow-puppet storytelling inside a modern film.
- **Pixar's *Piper* and *Bao*, and *Inside Out*:** a feeling given a body, a wordless arc, and a small creature that's never the villain.
- ***Spirited Away*'s train sequence:** stillness held long enough to land. Two quiet beats in *Looming* come from it.
- **A torn-paper picture-book animation loop:** the material language. Torn fibre edges, flat colour, dot-eye face swaps.
- **Eight code-made AI music videos and shorts we studied, including *LGTM*, *WHY AM I SLOP?* and *Sydney vs Claude*:** their lighting and staging ideas. Also a gap we noticed: none used real cast shadows or held a shot longer than about six seconds.
- **UF's own architecture:** Marston's atrium, its window bands and Century Tower, from openly licensed photographs.

### Resourcefulness
- **Physics instead of drawing.** Rather than animating a growing shadow by hand, I place a light. The shadow's size is the light-to-wall distance divided by the light-to-blob distance, a formula anyone can check.
- **A one-person studio.** An orchestrating AI agent coordinates many builder agents, each in its own copy of the project with its own files, and a change is merged only with evidence: contact sheets and render hashes that prove the output is identical every time.
- **The real place changed the story.** Research found no desk lamps at Marston, which broke our climax, a lamp click. We rebuilt it around Marston's motion-sensor lights, and the ending got stronger.
- **Watching early cuts.** A rough cut of Act 1 showed the story didn't read without explanation, so we're making the blob's own size a visible "dread meter" in the final.
- **A 16 GB laptop.** Renders filled the disk with swap twice. We rebuilt the pipeline to run lean and moved to a rough-draft-first plan, which is what you're seeing tonight.

### Accessibility & Pluralism
- **Wordless by design:** no dialogue and no legible text anywhere, so it plays the same in any language.
- **Sound carries story:** the light's click, the sensor relay and a music-box motif tell the story, so the final version will have captions describing them for Deaf and hard-of-hearing viewers.
- **Safety and contrast:** key moments are held in high contrast, and the flickering lights will be checked against photosensitivity guidelines before release.
- **Open and reproducible:** anyone with a laptop can re-render, change or adapt it, with no paid software or render farm.
- **Honest limits:** the AI models used are closed services, and we say so. Where UF approves open-weight models that run locally, we'd use them for the generated surfaces.

### Expansion & Connection
- **Counselling and wellness:** a short, shame-free film to open a conversation about avoidance in first-year seminars or wellness outreach.
- **Education:** the shadow rule is real optics, so a physics or computer graphics class could change one number and watch the dread double.
- **Libraries:** screenings in Marston and the other UF libraries during finals.
- **Other student filmmakers:** the paper-and-light pipeline is open source, so anyone can swap the paintings and the timeline and make a new film.
- **A series:** the same rule ("smaller than its shadow") fits other student feelings, like job applications, hard conversations or moving to a new city.

### Improvements with Unlimited Resources
- A live score recorded by real musicians: felt piano, music box and strings.
- A physical twin: the paper diorama built for real and lit from the same light positions as the code, as an exhibit where visitors move a lamp and watch the shadow change.
- An interactive version where the viewer holds the light and the shadow responds live.
- Screenings in every UF library during finals, festival distribution, and orientation programs at other universities.
- A short series covering other student feelings in the same visual language.
- Fully open, locally run models for every generated surface, so the film is open down to the paintings.

### Submission files
1. `looming_v1_rough_backup.mp4`: tonight's rough draft, compressed to 10 MB or less.
2. Optional: a one-page PDF with the shadow rule, the frozen paintings next to the lit result, and the roadmap to the final.
