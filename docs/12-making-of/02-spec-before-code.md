# 2 · Spec before code

## "I want to write up a very detailed spec first"

At 8:29, with a story, a runtime and a look agreed, Eric asked for the opposite of code:

> "All right, can you give a massive handoff and start setting up the scaffolding and looming? I don't want you to create anything, but basically, it's mostly a documentation handoff. I want to write up a very detailed spec first. … we should aim for about maybe 5,000 words, split up across a bunch of documents."

Before writing, Claude asked four questions. Eric's answers fixed things that would matter all day:
- **Deadline:** "6+ weeks out." This turned out to be wrong by almost all of it. The real deadline was that night (see [chapter 10](10-rough-first-then-final.md)).
- **Music:** "Synthesized in code." The score would be code, locked to the same timeline as the picture ([chapter 6](06-the-sound.md)).
- **Team:** solo. Eric directs, and Claude is the code collaborator.
- **Privacy:** the repo would be public, so the story docs describe beats and keep the personal origins of the ideas out. This making-of follows the same rule.

The docs were written between 8:31 and 8:36 and committed at 8:37 as `309bb41`: the README and docs 01 to 07, about 9,600 words by `wc`. The commit message gives the reasoning:

> "Locking decisions in prose first is cheaper than discovering them in code: the light rule, the 3:00 cut and the paper-plus-ink look all constrain the engine design."

## The model paints, the code is the scissors and the lamp

While the spec was being written, a research subagent checked what image generation the laptop already had. It found Codex CLI with image generation turned on and already used 56 times. It also found three limits that shaped everything after:
- the images come back opaque, with no transparency
- recurring characters drift between generations
- default sizes are about 1.2–1.5K, too small for close-ups

Eric's reply at 8:37: "Yeah, what if we did Codex image generation? Yeah, we did a hybrid of code video. And you would call it and drive the calls." A minute later: "Yeah, and you would have prompted with the images, like, 'Very extensively prompt it.' It's pretty good. Let's add that to the spec."

Claude summed up the division of labour as **the model paints the paper, and the code is the scissors and the lamp.** Codex would paint surfaces once (character sheets, props, plates) on a flat key colour. Code would do everything else: cutting, torn edges, alpha, light, shadow, rigging, timing and sound. [Doc 08](../08-image-pipeline.md) (`7a38f71`, 8:39) made it a procedure:
- Every prompt has the same five blocks: style, lighting, asset, technical and notes.
- Every generation after the first carries approved images as references.
- The painter screens every variant and writes a reason for each reject.
- The director picks, and only the director's pick is frozen into `assets/frozen/` with a manifest entry.
- Rejected images stay in the repo as thumbnails, as evidence.

Two rules from that doc held all day. Images are never generated at render time, because that would break "every frame is a function of `t`". And each character is generated once as a sheet of parts and posed in code, because a paper puppet can't drift.

## One orchestrator, a lot of subagents

At 8:41 Eric pointed Claude at a framework of his own, Agent Brigade, "for inspiration", and named the shape he wanted:

> "I don't want to have multiple different main agents, but probably one agent, like you, as an orchestrator agent, driving a lot, and I mean a lot, of subagents."

Claude read it and reported back before writing anything. The plan kept Brigade's ideas and dropped its machinery. The ideas: specs as the source of truth, every task owning its files, a task being done only when its done note exists, and evidence over self-reports. The machinery: the PR loops, watchdogs and CI gates that only exist to coordinate several equal agents. [Doc 09](../09-orchestration.md), `AGENTS.md` and three templates landed at 8:44 (`1237037`). Chapter 3 covers how that worked in practice.

Then Eric asked how versions would work: "This is probably like version 1, version 2, version 3, etc." The answer, committed at 8:48 (`9ed5a09`), was a three-level branch structure:
- Each subagent gets a task branch in its own worktree, squash-merged into a wave branch.
- Each wave reaches `main` as one PR.
- The director's gate approval *is* the merge.
- Every watchable cut is a tag with its MP4 on a GitHub Release.

Git LFS was rejected because its free bandwidth is too small for a public repo that judges might clone ([doc 07](../07-process-log.md), "Version control").

By 8:48 the repo held close to 14,000 words of Markdown and not one line of film code.

## The smoke tests

"Start wave 1 as the orchestrator," Eric wrote at 8:48. Two subagents ran in parallel, and both reported by 9:00.

- **`smoke-codex`** made one style tile through a headless `codex exec` call, with no person in the loop ([done note](../../done/smoke-codex.md), `evidence/smoke-codex/contact.jpg`). Two surprises came back. Codex ignored the requested green background and returned real transparency. It also read the repo's `AGENTS.md` and docs before painting, which cost about 193k input tokens for one image ([doc 07](../07-process-log.md), "Wave 1 smoke tests").
- **`smoke-paper`** built a cream paper wall and a 6 cm torn-paper cutout with two eye holes, then lit it two ways ([done note](../../done/smoke-paper.md)). The phone's shadow measured 2.95× against a computed 3.000×. The overhead lamp's pool measured 1.16×. Two renders of the same moment hashed identically. The builder's honest read: "The shadow sells it as real light, but the cutout and wall still read as clean 3D/vector, not paper."

That last line changed the plan. Procedural paper wasn't enough, so painted surfaces from Codex became the main path to the paper look (`c853baf`). At 9:21 Eric approved: "Approved. Merge PR #1 and start planning wave 2." (`d098163`)
