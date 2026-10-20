# 12 · The making of *Looming*

*Looming* went from a first sentence to a full 3:00 story reel in under eight hours. At 7:11 in the morning on October 15, 2026, Eric Zhang told Claude he wanted to make a film for UF's AI² Gator Create Competition "literally" in code. By 2:45 that afternoon all eighteen shots existed on one timeline and the first full render had started. In between, the director picked a story out of a dozen pitches. A cold reader caught the film's light physics being wrong. A spec of about 9,600 words was written before any code. One orchestrator ran dozens of subagents in parallel worktrees, and Codex painted the paper. The sound was synthesized by agents who could not hear it. A research agent found that Marston Library has no desk lamps, which broke the climax. The laptop ran out of disk twice because of memory swap. The director watched the first act and said the story wasn't reading. These chapters tell that day in order, with a link to the commit, note or image behind each moment.

This is the record of a process, not a press release. Where something failed, it says so. Where something is unknown, it says that too.

## Timeline

Times are Eastern (EDT), from git commit times and session transcripts.

| When | What happened | Where |
|---|---|---|
| Oct 9 | The earliest transcripts handed to the chronicler are about a different project for a different UF AI Days event. The film doesn't appear in them. | [01](01-the-idea.md) |
| Oct 14, ~9:00 | Eric has Claude turn the Gator Create web page into a reference note. Claude flags that registration closes the next day. | [01](01-the-idea.md) |
| Oct 15, 7:11 | First message: "I'm going to use AI to literally generate everything in code." | [01](01-the-idea.md) |
| 7:31–7:37 | Claude pitches four exam stories. Eric picks *Looming*, and the monster becomes a shadow. | [01](01-the-idea.md) |
| 7:52 | The cold read comes back: C6 / I4 / R5 / S4 / Im5. The light physics was wrong. | [01](01-the-idea.md), [doc 07](../07-process-log.md) |
| 7:57 | 3:00, not 5:00. A home lamp beat is added. | [01](01-the-idea.md) |
| 8:16–8:27 | Eight reference films are reviewed. None uses a real cast shadow. The paper-cutout look is chosen. | [01](01-the-idea.md) |
| 8:29–8:48 | The spec, the image pipeline, orchestration and version control are written and committed. | [02](02-spec-before-code.md), `309bb41`, `7a38f71`, `1237037`, `9ed5a09` |
| 9:00 | Wave 1 smoke tests pass: headless Codex paints, and a paper cutout casts a 2.95× shadow. | [02](02-spec-before-code.md), [04](04-paper-and-light.md) |
| 9:21 | "Approved. Merge PR #1 and start planning wave 2." | [03](03-the-studio.md), `d098163` |
| 9:24–10:51 | Wave 2: contracts, eleven module briefs, the sound engine and score, storyboards and two look passes. Merged as PR #2. | [03](03-the-studio.md), [06](06-the-sound.md), `12862a4` |
| 10:12 | The first lookdev composite: "half paper, half vector". | [04](04-paper-and-light.md), `67abc7e` |
| 11:05 | The first animatic shot (s01) merges. | [03](03-the-studio.md), `7c7ccd8` |
| ~12:00 | The session hits its usage limit and resumes. | [08](08-the-machine-fights-back.md), `6fd1271` |
| 12:26 | G1 goes to a v3 tile. "the gator is really ugly ngl" | [05](05-the-gator.md) |
| 12:43 | The disk fills for the first time. | [08](08-the-machine-fights-back.md) |
| 13:13–13:15 | "I like it": style tile v3_4 is frozen. | [05](05-the-gator.md), `a03dd39` |
| 13:26 | "Okay, one problem is that Marston Library doesn't have lamps." | [07](07-marston-has-no-lamps.md) |
| 13:32 | "my ram is dying". The builder ceiling drops to 3. | [08](08-the-machine-fights-back.md), `65c9e9e` |
| 13:38 | The disk fills again (13.8 GB of swap). Motion-sensor lights replace the desk lamps. | [07](07-marston-has-no-lamps.md), [08](08-the-machine-fights-back.md), `51b4130` |
| 13:53 | The Act 1 preview (0:00–0:44) reaches the director. | [09](09-the-dread-meter.md) |
| 14:02 | "I think the blob should get bigger": the dread meter. | [09](09-the-dread-meter.md), `98c0955` |
| 14:04 | G2: gator sheet v2_1 and hero_1 frozen. | [05](05-the-gator.md), `32c6434` |
| 14:17 | The ProposalSpace deadline turns out to be that night. The spec had assumed six weeks or more. | [10](10-rough-first-then-final.md) |
| 14:23 | "having a shitty rough draft, fully fleshed out…": the roadmap. | [10](10-rough-first-then-final.md), `85983a6` |
| 14:43 | The organisers: an incomplete draft tonight, the final due Sunday, Oct 18. | [10](10-rough-first-then-final.md), `6085dc8` |
| 14:45 | s18 merges. All 18 shots are in, and the full render starts. | [10](10-rough-first-then-final.md), `0a912fb` |
| 14:49–14:50 | Eric asks the agents to tell their stories, "from the first day". | [10](10-rough-first-then-final.md), `c82ae7c` |
| 14:52–14:57 | The render dies at frame ~864 in s06, gets a fix and restarts. | [10](10-rough-first-then-final.md), `993b169` |
| Oct 15, 22:00 | The director's G4 notes on v1 are recorded, with the overnight plan: v2 complete, then v3 close to complete. | [11](11-the-overnight-run.md), `3670600` |
| 22:01 | The text rule is relaxed to "sparingly". Face sheet v1_3 is frozen. | [11](11-the-overnight-run.md), `e8a4e32` |
| 22:35–22:41 | The real gator replaces the proxy rig. The G4 specs make a 3:15, 21-shot film. | [11](11-the-overnight-run.md), `f2bcd22`, `428a0ac` |
| 22:51–00:36 | Home, kitchen, Marston, props and cast kits are painted and frozen by rule. | [11](11-the-overnight-run.md), `aa7cef1`, `413c299`, `d654322`, `89e75b3` |
| 23:05 | The sound follows the 3:15 cut. Nobody has listened. | [11](11-the-overnight-run.md), `ea0dead` |
| 23:43–00:44 | The v2 shot batches land on the frozen kits. | [11](11-the-overnight-run.md), `b9e7eec`, `331c5db`, `c75dc33` |
| Oct 16, 01:29–01:32 | v2 renders (3:15). A cold viewer can't say what the shadow's rule is and sees no turning point. | [11](11-the-overnight-run.md), `4b7df3b` |
| 01:30–01:49 | The v3 polish passes land. v3-readability is still in progress. | [11](11-the-overnight-run.md), `a9378c5`, `f25e8f8`, `6f45587` |
| Oct 17, 22:33–22:40 | The director's v3 notes ("not the fucking random janitor") become story v4, which he approves. The master drops to 1080p. | [12](12-the-walk.md), `7134553`, `d429d5e`, `dae735a` |
| Oct 18, 03:10–03:17 | The close-up heads and the wall clock are frozen. The director answers Q16 (2.5×) and Q17 (his nightstand lamp). | [12](12-the-walk.md), `35133b2`, `09bd2ff` |
| 04:11–04:43 | The climax (two rooms in parallel) and its sound merge. | [12](12-the-walk.md), `228d5b2`, `253f3a5`, `5f80ea1` |
| 07:33–07:47 | The home and Marston trims merge, and one frame per shot shows all 21 build. | [12](12-the-walk.md), `391aced`, `c762819`, `599444e` |
| 13:01 | The render script learns to resume after a Chrome crash. | [12](12-the-walk.md), `64c4480` |

## Chapters

1. [The idea](01-the-idea.md): from a competition page to a shadow, in one morning
2. [Spec before code](02-spec-before-code.md): the handoff, the image pipeline, the rules for agents
3. [The studio](03-the-studio.md): one orchestrator, many subagents, evidence-gated merges
4. [Paper and light](04-paper-and-light.md): the shadow rule as real optics, and the look passes
5. [The gator](05-the-gator.md): "really ugly", four directions, v3_4, the frozen sheet
6. [The sound](06-the-sound.md): a score and foley built in code by agents who couldn't listen
7. [Marston has no lamps](07-marston-has-no-lamps.md): the research that broke the climax
8. [The machine fights back](08-the-machine-fights-back.md): GPU memory, swap and a full disk, twice
9. [The dread meter](09-the-dread-meter.md): watching Act 1, and the story not reading
10. [Rough first, then final](10-rough-first-then-final.md): the real deadline, the reel, and this record
11. [The overnight run](11-the-overnight-run.md): the director's notes, five kits by rule, v2, a cold viewer, and v3
12. [The walk](12-the-walk.md): the director's v3 critique, the clock, the climax built in two rooms, and a swell measured by a machine that can't hear

## How this stays current

Since Oct 15, every done note ends with a `## Story` section (`templates/done-note.md`, `AGENTS.md`). It's 150–300 words of prose on how the task really went, false starts included, linked to evidence. A docs-only **Chronicler** subagent (role row in `docs/09-orchestration.md`) reads those sections, `docs/07-process-log.md` and the evidence after each wave, and weaves them into these chapters. It invents no drama, quotes or numbers, and it states what it couldn't verify.

Chapters 1–10 were the first edition, written on the evening of Oct 15. No done note had a Story section yet, so it was built from the git log, the done notes' checklists and gaps, doc 07 and the session transcripts. Chapter 11 is the first built from the Story sections.
