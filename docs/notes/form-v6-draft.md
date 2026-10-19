# ProposalSpace answers, v6 draft 2

2026-10-19. Draft 1 went past a mock judge, a voice reader and a fact-checker; draft 2 takes all three. Confirm the items in "Before pasting" first. Strip this header when pasting.

## Before pasting
- Influences: confirm each "showed me / is why" is true for you (Reiniger, Ocelot, Three Brothers, Inside Out, Spirited Away).
- SUPER 1776 and the KnightHacks kit: confirm both are yours.
- Captions and the flash-safety check: the Accessibility answer says they'll exist by Oct 26. Keep that only if we build them.
- GitHub: the repo's `main` doesn't have this work yet (it's on `wave/3-assets`). Merge before judges click the link.
- Paste the YouTube link into Context.

---

## Project Title
Looming

## Project Synopsis
Looming is a three-minute paper-cutout short about a gator at UF who keeps putting off his Calc 2 exam. The exam drips off his calendar as a little ink blob with eyes, and every time he swipes away the Canvas reminder, it grows.

Nobody drew its shadow. The code computes it from where the light is, so his phone at 3 a.m. throws it across the whole ceiling, and the overhead lights at Marston shrink it back down. He finally opens the reminder, walks to the library and starts.

I wanted a film about procrastination that doesn't shame anyone. The blob isn't evil. It only looks huge because of the light he's sitting in.

I directed it with AI as the crew. I chose the idea, the look and the gator, set the turning point, and gave the notes that rewrote it twice. Claude drafted the scenes and wrote all the code, and an image model painted the paper.

## Project Context
Looming is a 3:21 video, so it plays on any screen. Watch it at [YOUTUBE LINK]. The code, prompts and process log are public at https://github.com/Eric-Zhang-Developer/looming-short-film.

I'd most like it shown on the screens in Marston during finals week, since that's where the second half takes place, and in first-year seminars and counseling outreach, where a three-minute cartoon about starting is easier to hear than advice.

Anyone can rebuild it. Every frame is calculated from the time code, so the repo re-renders the film exactly on a laptop. It also keeps the shot plans, every image prompt including the rejected ones, and a log of each decision and who made it.

I made it in versions. v1 was a rough animatic on Oct 15. After watching v3 I threw out its turning point and had the middle rebuilt around the walk to the library. People who watched v5 still didn't follow the plot, so v6, for Oct 26, opens on the Canvas to-do list, ties every growth spurt to a swiped-away reminder, and ends with the next exam turning into the ink of his first pen stroke. Fixes only re-render the shots that changed.

## Engagement with the Greater Good
Almost every student has done this. You don't start because not starting feels safer, and meanwhile the dread gets bigger. Psychologists Fuschia Sirois and Tim Pychyl describe procrastination as short-term mood repair, not laziness, yet most of what students hear about it is still some version of shame, which makes it worse.

I wanted a film that treats it with some dignity. The blob isn't evil. It's small and nervous, and it only looks huge because of the light. He gets out of it by doing small things. He opens the reminder, walks to the library and writes one line. At the end the next exam shows up as a fresh drop of ink, and this time he looks right at it. It hops onto his pen and becomes the first stroke of his work.

It's set on our campus, on a walk to Marston a lot of UF students have made at night. If one freshman stuck in bed at 3 a.m. sees himself in it and gets up, it did its job.

## Influence of Existing Works
The silhouette tradition is the base. Lotte Reiniger's The Adventures of Prince Achmed (1926) and Michel Ocelot's shadow films showed me silhouettes can tell a whole story, and the "Tale of the Three Brothers" in Harry Potter and the Deathly Hallows: Part 1 showed shadow puppetry working in a modern film. On top of that I picked a torn-paper picture-book look, with flat colors and dot eyes.

Inside Out is the reason the blob is a feeling made into a character. Spirited Away's quiet train ride is why the film sits still at dawn in the reading room instead of cutting away.

Before any code, I chose eight short films and music videos made with code and AI, including LGTM, i'm upping my p(doom), WHY AM I SLOP? and Sydney vs Claude, and Claude scored each one on the same sheet. None used real cast shadows, and none held a shot longer than about six seconds, so I wanted this film to do both.

The way the film treats procrastination follows Sirois and Pychyl's research on it as mood repair. The render and sound tools started from my earlier projects, SUPER 1776 and a KnightHacks film kit.

## Resourcefulness
We don't animate the shadow growing. We move the light. The shadow's size is the light's distance to the wall divided by its distance to the blob, so a physics student can check the metaphor.

I worked like a director with an AI crew. Claude ran builder agents in parallel, each owning a batch of shots in its own copy of the code, and nothing merged without rendered frames as proof. My job was the judgment calls. I picked the look and the gator from 52 painted tries, and I watched each cut and sent it back with notes.

Those notes changed the film. Research turned up no desk lamps at Marston, which broke the first climax. After v3 I cut the janitor, the window blinds and the motion-sensor lights and made the walk to the library the climax. On the last night I watched the master at 9:34 p.m. and the walk looked wrong. We redid it, re-rendered only those 21 seconds, and had the fixed master by 10:03.

It all runs on one 16 GB laptop with no render farm. When renders crashed from running out of memory, we changed the pipeline to render in 30-second chunks and pick up where it crashed.

## Accessibility & Pluralism
There's no dialogue. The only words on screen are short ones: the Canvas reminder, "Calc 2 exam", the math, his name, the grade and "Final". That makes it easy to follow in almost any language.

The sound carries a lot of the story, like the lamp clicks, the clock and the chord when the library light hits him. So before competition day I'm adding a captioned version that describes those sounds, and running a flash-safety check, since the light changes are the whole point.

Anyone with a laptop can re-render it, change one number and watch the shadow change, or swap in their own paintings and timeline and make a different film. You don't need paid software or a render farm.

One limit is that the coding and image models are closed services. If UF approves an open-weight image model that runs locally, I'd switch to it for the paintings.

## Expansion & Connection
Counseling and wellness staff could use it to start a conversation about avoidance without shaming anyone. I'd like to offer it to UF's Counseling and Wellness Center for first-year outreach.

It also works in a classroom. The shadow rule is real optics, so a physics or intro graphics class can change one number in the code and watch the dread double.

Other student filmmakers can reuse the pipeline. Swap the paintings and the timeline and you have a new film, directed by editing readable code instead of learning a 3D package.

The same idea would work for other things students avoid, like a job application they haven't opened.

## Improvements with Unlimited Resources
A score recorded by real musicians, with felt piano, music box and strings, instead of synthesized sound.

A real paper diorama, lit from the same positions as the code, as an exhibit where visitors pick up a lamp and watch the blob's shadow grow and shrink.

A study. I'd show it to first-years the week before an exam and measure whether more of them start studying that night than a group who didn't see it.

Open models running locally for everything, down to the paintings, so the whole film is open.
