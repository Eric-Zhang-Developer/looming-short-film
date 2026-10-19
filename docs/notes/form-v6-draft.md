# ProposalSpace answers, v6 draft (in Eric's voice)

Draft 1, 2026-10-19 00:00. For review before it replaces the fields in `docs/10-submission.md`. Every claim should be true of v6 as it will be on competition day (Oct 26) or of the history; **[Eric]** marks a line only Eric can confirm. Field boxes are small: roughly 120–200 words each.

---

## Project Title
**Looming**

---

## Project Synopsis
Looming is a three-minute paper-cutout short about a gator at UF who keeps putting off his Calc 2 exam. The exam drips out of his calendar as a little ink blob with eyes. Every time he swipes away the Canvas reminder, it grows. Its shadow grows a lot more: under his phone at 3 a.m. it covers the ceiling.

None of the shadows are drawn. They're real light, computed in code, and the size comes from one rule: a light held low and close makes a shadow huge, and a light from above makes it small. So when he finally opens the reminder and walks across campus to Marston, the library's overhead lights shrink the thing he's been dreading down to something he can sit next to.

The turning point is a choice he makes himself. For me, beating procrastination came down to deciding to go to the library, and an early cut where a janitor switched on the light for him didn't survive my first watch. I directed the story, the look and every keep-or-cut call. Claude wrote the code that builds each frame, and an image model painted the paper.

---

## Project Context
It's a 3:21 film made for screens: one video file that plays anywhere. Watch it at [YOUTUBE LINK]. The code is public at https://github.com/Eric-Zhang-Developer/looming-short-film.

I'd most like it shown during finals week on the screens in Marston, where the second half takes place, and in first-year seminars or counseling outreach, where "just start" lands better as a three-minute cartoon than a pamphlet. It's also short enough for a group chat.

Anyone can rebuild it. Every frame is a function of time, so the repo re-renders the film exactly on a laptop, and it also holds the shot plans, every image prompt including the rejects, and a log of each decision I made.

It's been made in versions, and they're all in the repo's history. v1 was a rough animatic on Oct 15. I rejected v3's ending and rewrote the middle around the walk to the library for v4. v5, submitted Oct 18, came after an AI "cold viewer" that saw only frame sheets told us where the story got lost, plus four fix rounds. People who watched v5 still didn't fully follow the plot, so v6 makes the opening explicit and changes the ending. Fixes like that only re-render the shots that changed.

---

## Engagement with the Greater Good
Everyone in college knows this one. You don't start because not starting feels safer, and meanwhile the dread gets bigger. Most of what we hear about procrastination is some version of shame, which makes it worse.

I wanted a film that does the opposite. The blob is never the villain. It's a small, nervous thing that only looks enormous because of where the light is. The way out is small and specific: open the reminder, go to the library, write the first line. At the end the next exam shows up as a fresh drop of ink, and this time he doesn't look away. It hops onto his pen and becomes the first stroke of his work. Exams keep coming. What changed is him.

It's set on our campus, and the walk at the center of it is one every UF student has made at night. I'd like a freshman who's stuck in bed at 3 a.m. to recognize himself and get up.

---

## Influence of Existing Works
Lotte Reiniger's *The Adventures of Prince Achmed* (1926) and Michel Ocelot's silhouette films taught me that a shadow can carry a whole performance. The "Tale of the Three Brothers" in *Harry Potter and the Deathly Hallows: Part 1* showed shadow puppetry working inside a modern film.

Pixar's shorts (*Piper*, *Bao*) and *Inside Out* shaped the idea of giving a feeling a body and keeping it wordless. The Sixth Station train in *Spirited Away* is why the film holds still at dawn in the reading room instead of cutting away.

For the look, I picked a torn-paper picture-book style: flat color, fibrous edges, dot eyes.

Before writing any code we studied eight short films and music videos made with code and AI, including *LGTM*, *i'm upping my p(doom)*, *WHY AM I SLOP?* and *Sydney vs Claude*. None of them used real cast shadows, and none held a shot longer than about six seconds. Those two gaps became the brief for this film.

The render and sound tools started from my own earlier student projects (*SUPER 1776* and a film kit from KnightHacks). **[Eric: confirm both are yours.]**

---

## Resourcefulness
The core trick is physics instead of drawing. Instead of animating a shadow growing, we move a light, and the shadow's size is just the distance to the wall divided by the distance to the blob. The metaphor is a formula you can check.

I ran it like a tiny studio. One AI agent coordinated others, each building one shot in its own copy of the code. Nothing got merged without rendered frames to prove it worked, and I watched every cut and gave the notes. That's 315 commits in four days.

The story changed when it met reality. We found out Marston has no desk lamps, which broke the first climax. After watching v3 I scrapped the janitor, the blinds and the motion-sensor lights, and made the walk to the library the climax. On the last night I watched the master at 9:34 p.m. and the walk looked wrong. It was redone, and just those 21 seconds were re-rendered and spliced in by 10:03.

It all runs on a 16 GB laptop. Renders kept crashing from memory, so the pipeline renders in chunks, resumes after a crash, and keeps one browser open at a time.

The image model painted 16 frozen images, picked from 123 tries. Code cuts them into 175 paper pieces and lights them.

---

## Accessibility & Pluralism
There's no dialogue. The only words on screen are the Canvas reminder, the exam, the math and the grade, so it works in almost any language with very little translation.

The sound carries a lot of the story (the lamp clicks, the clock, the chord when the library light hits him), so the next step is a captioned version that describes those sounds for Deaf and hard-of-hearing viewers. I'd also run a flash-safety check before any public screening, since the light changes are the whole point. Neither of those exists yet.

It's open in a way most animation isn't. Anyone with a laptop can re-render it, change a number and watch the shadow change, or swap in their own paintings and timeline and make a different film. No paid software and no render farm.

The honest limit: the coding model and the image model are closed services. If UF approves an open-weight image model that runs locally, I'd switch to it for the paintings.

---

## Expansion & Connection
Counseling and wellness staff could use it to open a conversation about avoidance without shaming anyone, in a first-year seminar or at an outreach table. **[Eric: only if you've talked to anyone; otherwise this stays a "could".]**

It works in a classroom too. The shadow rule is real optics, so a physics or intro graphics class can change one number in the code and watch the dread double.

UF's libraries could screen it during finals.

Other student filmmakers can reuse the pipeline: swap the paintings and the timeline and you have a new film, directed by editing readable code instead of learning a 3D package.

And the same rule could carry other student feelings: the job application you haven't opened, the hard conversation you keep pushing back, the first week in a new city.

---

## Improvements with Unlimited Resources
I'd record the score with real musicians (felt piano, music box, strings) instead of synthesizing it.

I'd build the paper diorama for real and light it from the same positions as the code, as an exhibit where visitors pick up a lamp and watch the blob's shadow grow and shrink.

An interactive version could let the viewer hold the light, with a phone or a desk lamp, and the shadow would respond live.

I'd want screenings in every UF library during finals and in orientation programs at other schools, and a short series about other feelings, in the same paper.

And I'd make everything run on open models locally, down to the paintings, so the whole film is open.
