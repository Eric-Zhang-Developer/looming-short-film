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

*Looming* is a 3:45 wordless animated short about a UF student, a small gator, and the exam he keeps avoiding. The exam is a drop of ink that rolls off his calendar and becomes a little blob with eyes. Every time he looks away from it (the practice problem he alt-tabs from, the fridge, a game, one more Reel) it gulps and grows, from a drop smaller than his hand to taller than he is. Its shadow grows further still: under the low glow of his laptop or phone it fills the wall, and under light from above it shrinks to a puddle. [now: final cut v12, `out/looming_v12.mp4`, 2026-10-21]

The film runs on one physical rule: **light held low and close makes the shadow loom; light from above makes it small.** The shadows are not drawn. They are real light computed in code, so the film's metaphor is literally the algorithm.

The turn is a decision he makes, not something that happens to him. At 3 a.m., in bed on his phone, with the wall clock reading three, he turns the phone face down, clicks his nightstand lamp on, and walks out to the library, the blob towering beside him the whole way. At Marston's door the light from above floods him, and the blob, too big to follow him in, catches up with him at his desk. There he flinches once more and reaches for his phone; he sees the shadow spring up the wall and turns the phone face down himself. Every problem he solves shrinks the blob, the first one most of all: it was never as big as it felt. He gets an 85, a relief rather than a triumph, and the next time a date goes on the calendar, he starts right away. The film closes on Seneca: "We suffer more often in imagination than in reality." [now: v12]

A plain analog wall clock, with no numbers, keeps the film's pulse. It reads 9:00 at the start, about 1:45 while he rots in bed, and 3:00 at the bottom, and its tick becomes the heartbeat of the walk. [now]

It is made entirely in code with AI collaborators. Eric directs: story, look, timing and every accept or reject call. Claude writes the code that cuts, lights, rigs and times every frame, Codex image generation paints the paper surfaces, and the score and sound are synthesized in code. The closing credits say the same, word for word. [now: card B, s22]

Goal: one honest, gentle film about starting, made in a way anyone can open up and read.

*Optional line (doc 01 says to own the irony):* "I hit the same first-step wall making it." [director: only if true and you want it]

*Process line:* "What you're watching is the film's own first step: a complete rough draft, with placeholder art, on the final timeline. The finished version is in production for October 26, and we'll show the two side by side." [stale: this was the Oct 15 rough-draft wording. For the final, drop it or reword it; the side-by-side with the rough is planned for competition day, not built]

---

## Project Context
> Share details of how the project is ideally to be deployed, published, exhibited, distributed, interacted with, used and or maintained.

*Looming* is a 3:45 film for screens: a single MP4 that plays anywhere. The master is 1080p (director, Oct 17), with a compressed backup copy cut from it. [now: master 1920×1080, 3:45, −16.0 LUFS / −5.0 dBFS peak, `out/looming_v12.mp4`; backup 720p, 9.58 MB (9,583,645 bytes), `out/looming_v12_backup.mp4`, 2026-10-21]

- **Where it's meant to be seen.** Finals week, on screens in Marston Science Library, where the climax ends and the film's second half takes place, and in first-year orientation and counselling outreach, where the "first step" message is useful. Online, it's short enough to share in a group chat. [planned: venues not arranged]
- **Open and re-renderable.** The whole film is a public GitHub repository: https://github.com/Eric-Zhang-Developer/looming-short-film. Every frame is a pure function of time, so anyone can re-render it bit for bit on a laptop. The repo includes the shot specs, the asset manifest, every image prompt (rejects included) and a process log of every creative decision. [now]
- **Maintained like software.** Each cut is a tagged release with the MP4 attached (animatic, rough cut, final), so any version can be watched or rebuilt. [now: the final cut is tagged `final` on main]
- **Nearly wordless,** so it needs little translation: the only text is a handful of hand-lettered words (the exam, the math, the grade). Captions describe the key sounds. [planned: no captions exist yet]

---

## Engagement with the Greater Good
> Explain how this research contributes to the greater good and its relevance in that context

Almost every student knows the feeling this film is about: the assignment you don't start because not starting feels safer, while the dread gets bigger the longer you wait. Shame makes it worse, and most messaging about procrastination is shame. *Looming* goes the other way. The monster is never evil. It's a small, slightly nervous thing that only looks huge because of where the light is, and the fix the film models is concrete and small: walk to the light, pick up the pen and write your name at the top of the page. [now: story spec]

It's set on our campus, and the turn is a walk every UF student has made: out of the room where the dread grows, across a lamp-lit path, and into Marston Library, where the light is warm and comes from above. The film's argument is that the walk is the hard part, and the library's light is not. [now: built to the approved v4 story]

It also contributes a working example of AI used transparently in art. Nothing here is a black box: the code, prompts, rejected images and decisions are all public, and a human signs off on every shot. [now]

---

## Influence of Existing Works
> Identify existing works that inform your innovation and describe how they do so. Literature reviews or attributions apply here. These do not only have to be AI-based works.

- **Lotte Reiniger, *The Adventures of Prince Achmed* (1926), and Michel Ocelot's silhouette films:** the cut-paper and silhouette tradition. A shadow can carry a whole performance.
- **The "Tale of the Three Brothers" sequence in *Harry Potter and the Deathly Hallows: Part 1*:** shadow-puppet storytelling inside a modern film.
- **Pixar shorts (*Piper*, *Bao*) and *Inside Out*:** a feeling given a body, a wordless arc, and a small creature that's never the villain.
- **The Sixth Station sequence in *Spirited Away*:** stillness and quiet held long enough to land. The film's quiet dawn beat in the reading room comes from here.
- **No-Face in *Spirited Away*:** the closest ancestor of the blob. A lonely creature, not a villain, that grows monstrous by swallowing what it's fed and wants above all to be acknowledged; its masked face stays blank while its body grows enormous, and it is never defeated, only calmed and given a place to belong. The blob takes the same shape: it grows by gulps when he looks away, reads as blank force when huge and as a small anxious creature once faced, and at the end it goes home rather than dying. (Director, 2026-10-20: "It really, really reminds me of No-Face.")
- **A torn-paper picture-book animation loop:** the material language. Torn fibre edges, flat colour, dot-eye face swaps.
- **Eight code-made AI music videos and shorts we studied** (including *i'm upping my p(doom)*, *LGTM*, *WHY AM I SLOP?* and *Sydney vs Claude*). We took their lighting and staging ideas. We also noticed that none of them used real cast shadows or held a shot longer than about six seconds, which is the gap *Looming* aims at. [now: doc 03]
- **Our own tools:** the render and audio kits from earlier student projects (*SUPER 1776*, a KnightHacks film kit), reused and extended. [now]

[number] Add the composers or sound references, if any are used.

---

## Resourcefulness
> Share how you used creativity and available tools to solve problems, overcome challenges, and achieve goals, highlighting your resilient mindset and focus on making the best of your project.

- **Physics instead of drawing.** Instead of animating a growing shadow by hand, we place a light. The shadow's size is the light-to-wall distance over the light-to-blob distance, so the metaphor is a formula anyone can check.
- **A studio run by one director.** One orchestrating AI agent coordinates many builder agents, each in its own git worktree with its own files, and each change is merged only with evidence (contact sheets, determinism hashes). [now; number: 277 commits and 88 task notes in `done/` as of 2026-10-18 (counted in this branch)]
- **Grounding in a real place, which changed the story twice.** Research found no desk lamps at Marston, which broke our first climax, a lamp click. We rebuilt it around motion-sensor lights (Oct 15). Then the director watched v3 and said the turn was wrong: the real turn is that you decide to go to the library. The motion-sensor lights, the custodian, the blinds and the stacks were all cut, and the walk to the library became the climax (Oct 17). [now: decided; `docs/07-process-log.md`, `docs/02-story-v4-draft.md`]
- **Watching early cuts, not trusting specs.** A rough cut of Act 1 showed that the blob's meaning didn't read without subtext, so we made the blob's own size a visible "dread meter". Watching v3 then changed the climax. [now: decided]
- **A 16 GB laptop.** Headless renders once filled the disk with swap. We rebuilt the pipeline to run lean: one browser at a time, and a rough story reel before polish. [now]
- **Image generation as raw material.** 16 images frozen so far, from 52 screened variants on file (`assets/raw/thumbs`). The director picked the gator, and the orchestrator froze later kits by a written rule with every alternative listed (`docs/notes/morning-picks.md`). All of them are cut, lit and rigged in code. [number: as of 2026-10-18]

---

## Accessibility & Pluralism
> Please share speculations, designs, and insights on the potential, or if not why, of enabling technologies or other opportunities for expanded use.

- **No dialogue:** the story is told in pictures and sound. A handful of on-screen words (the exam, the math, the grade), the title, one quote and the credits are the only text, so it travels across languages almost unchanged. [now: director 2026-10-15 allowed sparse text]
- **Captions for sound:** the key sounds (the lamp click, the clock's tick, the held chord at Marston's door) carry story, so a captioned version describes them for Deaf and hard-of-hearing viewers. [planned]
- **Contrast and safety:** key story moments are held in high contrast, and the film is designed without strobing. The sharpest light changes are the lamp clicks, the shadow's stretch and shrink at each street lamp and the flood of light at Marston's door. [planned: the flash-analysis check has not been run]
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

**Organisers (by phone, 2026-10-15): today needs only an incomplete draft. The final is due Sunday, Oct 18, at 11:59 PM, and a YouTube link and the GitHub repo can be submitted.** Director: the film is published on YouTube at full quality, and the ProposalSpace upload is a compressed backup copy. Put the YouTube link in Project Context (and Synopsis if there's room). The director uploads it to YouTube himself.

**The 10 MB cap now only applies to the backup copy.** [now, v12: `tools/backup.sh` two-pass 720p at 270k video + 64k AAC (`VB=270k`; 300k fit 3:15 but not 3:45), 9.58 MB (9,583,645 bytes); stills in `out/stills/v12/`] For a 3:15 film that's a budget of about **410 kbit/s for video and audio together.** For reference, the Act 1 preview (0:44) encoded at 720p H.264 CRF 24 came to 3.5 MB, which scales to about 15 MB for the full film: **over the limit.** Plan:
1. Test encodes at 720p and 1080p: H.264 at a two-pass target bitrate, and HEVC (`hvc1` in `.mp4`, which plays in Safari and macOS and in most modern players). Paper grain and boil are the hardest content to compress, so judge on a phone and a laptop, not by bitrate alone.
2. Submit the best version under 10 MB as the main file, and link the full-quality release (GitHub Release) in Project Context.
3. **Captions:** `.srt` and `.vtt` aren't allowed types, so add a burned-in captioned version as a second MP4 (also ≤ 10 MB), or a PDF caption sheet.
4. Possibly also: a one-page PDF process sheet (the frozen paintings next to the lit, cut result, plus the shadow formula) and 2–3 stills as `.png`.

## Open items
- **The deadline** was settled by phone on Oct 15: Sunday, Oct 18, 11:59 PM (see Submission files). [director: confirm on the form; v12 is dated Oct 21, so whether it can replace what was submitted is the organisers' call]
- **Department and associates:** form fields that aren't in these screenshots (doc 01 items 1–5). [director]
- **The irony line** in the synopsis. [director]
- **Motion sensors at Marston:** moot. The sensors were cut in v4, so nothing in the film depends on how Marston's lights behave.
