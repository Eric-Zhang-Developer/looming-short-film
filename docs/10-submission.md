# 10 · Submission answers (living draft)

The ProposalSpace form, field by field. **This is a living draft: the orchestrator updates it whenever a decision, gate or number changes, and logs each change in doc 07.** Doc 01 §Submission questionnaire holds the original plan; this file supersedes it for wording.

Tags in the drafts:
- **[now]** true today and checkable in the repo
- **[planned]** in the spec but not built yet: reword before submitting
- **[director]** needs Eric's confirmation or his own words
- **[number]** a figure to refresh at submission time

Field boxes are small, so each draft aims at about 80–180 words. Write plainly. Every claim must be true in practice, not just in the write-up (doc 01).

---

## Project Title
> Choose a concise name for your submission that reflects your goals, subjects, results, or even humorous aspects of the project to help others understand what to expect or how to engage.

**Looming**

Alternatives, if a subtitle helps: *Looming: a paper film about the first step*, or *Looming (smaller than its shadow)*. Recommendation: the one word. The film explains it in its first minute. [director]

---

## Project Synopsis
> Provide a brief description of the project and its goals.

*Looming* is a three-minute wordless animated short about a UF student, a small gator, and the exam he keeps avoiding. The exam is a drop of ink that rolls off his calendar and becomes a little blob with eyes. Every time he looks away from it, it grows a size. Its shadow grows far more: under the low glow of his phone it fills the wall, and under light from above it shrinks to a puddle. [now: spec; planned: final render]

The film runs on one physical rule: **the scary thing is always smaller than its shadow.** The shadows are not drawn. They are real light computed in code, so the film's metaphor is literally the algorithm.

It is made entirely in code with AI collaborators. Eric directs: story, look, timing and every accept or reject call. Claude writes the code that cuts, lights, rigs and times every frame, and image generation paints the paper surfaces. [now]

Goal: one honest, gentle film about starting, made in a way anyone can open up and read.

*Optional line (doc 01 says to own the irony):* "I hit the same first-step wall making it." [director: only if true and you want it]

*Process line:* "What you're watching is the film's own first step: a complete rough draft, with placeholder art, on the final timeline. The finished version is in production for October 26, and we'll show the two side by side." [now, if tonight's upload is the rough; reword once the organisers answer]

---

## Project Context
> Share details of how the project is ideally to be deployed, published, exhibited, distributed, interacted with, used and or maintained.

*Looming* is a 3:00 film for screens: a single MP4 that plays anywhere. [planned]

- **Where it's meant to be seen.** Finals week, on screens in Marston Science Library, where the second half of the film takes place, and in first-year orientation and counselling outreach, where the "first step" message is useful. Online, it's short enough to share in a group chat. [planned: venues not arranged]
- **Open and re-renderable.** The whole film is a public GitHub repository: https://github.com/Eric-Zhang-Developer/looming-short-film. Every frame is a pure function of time, so anyone can re-render it bit for bit on a laptop. The repo includes the shot specs, the asset manifest, every image prompt (rejects included) and a process log of every creative decision. [now]
- **Maintained like software.** Each cut is a tagged release with the MP4 attached (animatic, rough cut, final), so any version can be watched or rebuilt. [planned: no tags yet]
- **Wordless,** so it needs no translation. Captions describe the key sounds. [planned]

---

## Engagement with the Greater Good
> Explain how this research contributes to the greater good and its relevance in that context

Almost every student knows the feeling this film is about: the assignment you don't start because not starting feels safer, while the dread gets bigger the longer you wait. Shame makes it worse, and most messaging about procrastination is shame. *Looming* goes the other way. The monster is never evil. It's a small, slightly nervous thing that only looks huge because of where the light is, and the fix the film models is concrete and tiny: pick up the pen and write your name. [now: story spec]

It's set on our campus. Marston's motion-sensor lights go dark when you sit still and come back when you move, which turns a detail every UF student has lived into the film's turning point. [now: spec; director: confirm the sensors are real]

It also contributes a working example of AI used transparently in art. Nothing here is a black box: the code, prompts, rejected images and decisions are all public, and a human signs off on every shot. [now]

---

## Influence of Existing Works
> Identify existing works that inform your innovation and describe how they do so. Literature reviews or attributions apply here. These do not only have to be AI-based works.

- **Lotte Reiniger, *The Adventures of Prince Achmed* (1926), and Michel Ocelot's silhouette films:** the cut-paper and silhouette tradition. A shadow can carry a whole performance.
- **The "Tale of the Three Brothers" sequence in *Harry Potter and the Deathly Hallows: Part 1*:** shadow-puppet storytelling inside a modern film.
- **Pixar shorts (*Piper*, *Bao*) and *Inside Out*:** a feeling given a body, a wordless arc, and a small creature that's never the villain.
- **The Sixth Station sequence in *Spirited Away*:** stillness and quiet held long enough to land. The film's two quiet beats come from here.
- **A torn-paper picture-book animation loop:** the material language. Torn fibre edges, flat colour, dot-eye face swaps.
- **Eight code-made AI music videos and shorts we studied** (including *i'm upping my p(doom)*, *LGTM*, *WHY AM I SLOP?* and *Sydney vs Claude*). We took their lighting and staging ideas. We also noticed that none of them used real cast shadows or held a shot longer than about six seconds, which is the gap *Looming* aims at. [now: doc 03]
- **Our own tools:** the render and audio kits from earlier student projects (*SUPER 1776*, a KnightHacks film kit), reused and extended. [now]

[number] Add the composers or sound references, if any are used.

---

## Resourcefulness
> Share how you used creativity and available tools to solve problems, overcome challenges, and achieve goals, highlighting your resilient mindset and focus on making the best of your project.

- **Physics instead of drawing.** Instead of animating a growing shadow by hand, we place a light. The shadow's size is the light-to-wall distance over the light-to-blob distance, so the metaphor is a formula anyone can check.
- **A studio run by one director.** One orchestrating AI agent coordinates many builder agents, each in its own git worktree with its own files, and each change is merged only with evidence (contact sheets, determinism hashes). [now; number: 179 commits and 56 completed task notes as of 2026-10-15]
- **Grounding in a real place, which changed the story.** Research found no desk lamps at Marston, which broke our climax, a lamp click. We rebuilt it around Marston's motion-sensor lights, and the turn got stronger: stillness feeds the dark, and moving brings the light back. [now: decided 2026-10-15]
- **Watching early cuts, not trusting specs.** A rough cut of Act 1 showed that the blob's meaning didn't read without subtext, so we made the blob's own size a visible "dread meter". [now: decided]
- **A 16 GB laptop.** Headless renders once filled the disk with swap. We rebuilt the pipeline to run lean: one browser at a time, and a rough story reel before polish. [now]
- **Image generation as raw material.** 19 image generations so far, 3 frozen. Each was picked by the director and then cut, lit and rigged in code. [number]

---

## Accessibility & Pluralism
> Please share speculations, designs, and insights on the potential, or if not why, of enabling technologies or other opportunities for expanded use.

- **Wordless by design:** no dialogue and no legible text anywhere, so it plays the same in any language.
- **Captions for sound:** the key sounds (the lamp click, the sensor relay, the music-box motif) carry story, so a captioned version describes them for Deaf and hard-of-hearing viewers. [planned]
- **Contrast and safety:** key story moments are held in high contrast, and the flickering lights are kept under photosensitivity thresholds. No strobing. [planned: verify with a flash-analysis check]
- **Open and reproducible:** anyone with a laptop can re-render it, change it or translate its look. No paid software or GPU farm is needed. [now]
- **A pipeline others can reuse:** shadow-as-metaphor animation that a student can direct by editing readable code, not by learning a 3D package. [now]
- **The limits, honestly:** the image and coding models are closed services, which we say plainly. Where UF approves an open-weight model that runs locally, we'd prefer it. [now: doc 01]

---

## Expansion & Connection
> In what ways do you think this work might be expanded by those in other disciplines or connected with other professionals, communities, users, or audiences beyond your original intention?

- **Counselling and wellness:** a short, shame-free film to open a conversation about avoidance, in first-year seminars or the counselling centre's outreach. [director: has anyone been contacted?]
- **Education:** the shadow rule is real optics, so a physics or intro-graphics class could change one number and watch the dread double.
- **Libraries:** Marston and the other UF libraries during finals.
- **Other student filmmakers:** the paper-and-light pipeline is open source, so you can swap the paintings and the timeline and get a new film.
- **A series:** the same rule ("smaller than its shadow") fits other student feelings, like applying for jobs, a hard conversation or a new city.

---

## Improvements with Unlimited Resources
> If budget, time, and resources were not constraints, how could this work be enhanced?

- **A live score** recorded by real musicians (felt piano, music box, strings) in place of synthesis.
- **A physical twin:** the paper diorama built for real and lit with the same light positions as the code, for an exhibit where visitors move a lamp and watch the shadow change.
- **An interactive version** where the viewer holds the light (phone or lamp) and the blob's shadow responds live.
- **Festival distribution,** screenings in every UF library during finals, and orientation programs at other universities.
- **A short series** covering other student feelings in the same visual language.
- **Locally run open models** for every generated surface, so the whole film is open down to the paintings.

---

## Submission files
> 10 MB max per file. Allowed: .doc, .docx, .gif, .jpeg, .jpg, .mov, .mp4, .pdf, .png, .ppt, .pptx, .tif, .tiff, .wmv, .zip

**Director, 2026-10-15: the film is published on YouTube at full quality; the ProposalSpace upload is a compressed backup copy.** Put the YouTube link in Project Context (and Synopsis if there's room). The director uploads it to YouTube himself.

**The 10 MB cap now only applies to the backup copy.** For a 3:00 film that's a budget of about **440 kbit/s for video and audio together.** For reference, the Act 1 preview (0:44) encoded at 720p H.264 CRF 24 came to 3.5 MB, which scales to about 14 MB for the full film: **over the limit.** Plan:
1. Test encodes at 720p and 1080p: H.264 at a two-pass target bitrate, and HEVC (`hvc1` in `.mp4`, which plays in Safari and macOS and in most modern players). Paper grain and boil are the hardest content to compress, so judge on a phone and a laptop, not by bitrate alone.
2. Submit the best version under 10 MB as the main file, and link the full-quality release (GitHub Release) in Project Context.
3. **Captions:** `.srt` and `.vtt` aren't allowed types, so add a burned-in captioned version as a second MP4 (also ≤ 10 MB), or a PDF caption sheet.
4. Possibly also: a one-page PDF process sheet (the frozen paintings next to the lit, cut result, plus the shadow formula) and 2–3 stills as `.png`.

## Open items
- **The deadline** is still unconfirmed (doc 01). [director]
- **Department and associates:** form fields that aren't in these screenshots (doc 01 items 1–5). [director]
- **The irony line** in the synopsis. [director]
- **Motion sensors at Marston:** confirm the lights really behave this way. [director]
