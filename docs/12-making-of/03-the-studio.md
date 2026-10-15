# 3 · The studio

## The shape of it

*Looming* was built by one Claude session, the **orchestrator**, which wrote briefs and merged work but, by its own rules, didn't write shot or module code. The work went to subagents, each started with no context:
- **builders** wrote one module or one shot, each in its own git worktree
- **painters** drove Codex image generation for one asset
- **researchers, reviewers and cold readers** came in when a question needed fresh eyes

Eric was the **director**. He decided at gates, picked every frozen image and made every call that couldn't be undone: palette, character design, story beats. The roles are written down in [doc 09](../09-orchestration.md), and every subagent read [`AGENTS.md`](../../AGENTS.md) first.

By the end of October 15 the trail looked like this:
- 203 commits on `wave/3-assets`, the first at 8:37 and the latest at 14:57
- 48 files in `tasks/`, the briefs and the board
- 63 done notes in `done/`
- 86 subagent transcripts in the main session's folder

Two wave PRs had been merged to `main`: #1 (smoke tests) and #2 (foundations).

## Files are the memory

The reason for all those files is that the orchestrator's own memory didn't last. During the day its context filled and was summarized three times (at about 9:40, 12:42 and 14:51). Around noon the session hit its usage limit and stopped until it reset. Eric came back with: "I hit my usage limit while you were working, but it has reset now. Please continue from where you left off." Each time, the orchestrator picked up from `NOW.md`, `tasks/board.md` and the done notes, the way doc 09 says a fresh session should. The hand-off commit at 12:03 (`6fd1271`) is titled "NOW rewritten as a full hand-off (batch 1 resumed after usage limit)".

## Going wide

At 9:24 the orchestrator wrote [`docs/contracts.md`](../contracts.md), every shared module's functions and arguments, before any module existed (`3795589`). It then split wave 2 into "11 briefs in 4 dependency batches" (`8d1c9f0`). Seven minutes later Eric switched the session to a continuous loop: "/loop with the goal being completion full completion". Four minutes after that: "Make sure you're spinning up your subagents."

What followed in `git log` is a dense stretch of work. Between 9:33 and 10:50:
- the timeline (18 shots, every beat named), the seeded core, the render tool, the Codex wrapper, post, lights, the sound engine, paper, the ink blob, foley, material, the score and the puppets merged one after another
- three storyboard passes wrote the 18 shot specs, and a reconcile pass made them one film (`45533f3`)
- the first look-development composite and two look passes ran

Wave 2 merged to `main` at 10:51 (`12862a4`). The first animatic shot, s01, merged at 11:05 (`7c7ccd8`), and the last, s18, at 14:45 (`ff019cb`).

## Evidence, not claims

The rule that held all of this together is in `AGENTS.md`: "Evidence, not claims. 'Looks good' or 'tested' means nothing without the sheet, strip or command output that shows it." A task merged only after the orchestrator had done four things:
1. Checked the diff touched only the task's `owns`.
2. Run `tools/determinism.mjs` on the film across the shot.
3. Looked at the contact sheet itself.
4. Squashed the work into one commit with a message saying *why*.

That rule changed outcomes. A few examples from the done notes:
- **s15 went back to its builder** at about 12:22, even though it rendered and passed every check. The orchestrator looked at the sheet and saw the giant shadow mostly off-screen: "two pale eye-hole circles at the top of the frame, and they read as moons." The fix (`d5d2fc5`) brought a 4.2× shadow fully into frame before the click.
- **The sound foley builder found its brief contradicting a test it didn't own.** The brief said to remove every stub, and the test asserted a stub still throws. It reported "FAIL, by design conflict" instead of editing the test ([`done/snd-foley.md`](../../done/snd-foley.md)). The test's owner fixed it next (`af29c93`).
- **The gator-sheet painter** wrote that its 40 px spacing rule was "only half met" and that the "3/4 head" was "a side head on every variant" ([`done/asset-gator-sheet.md`](../../done/asset-gator-sheet.md)).
- **A timing bug that no single shot showed.** A builder hit the shared 12 fps helper picking the wrong drawing. `contract-timing` counted it across the whole film and found the wrong drawing on **681 of 4,320 frames**, because a float landed a hair under a boundary (`7301947`). The same task found a lamp-dust bug that made a frame's pixels depend on which frame rendered first. It also wrote down why the determinism tool had missed it: every run started from the same first frame ([`done/contract-timing.md`](../../done/contract-timing.md)).

The process also caught one of the orchestrator's own mistakes, which it reported. During the RAM emergency (chapter 8) it told Eric: "a message I meant for no one briefly restarted the finished s12 builder. I stopped it right away, and it changed nothing."

## What the plan got wrong

Doc 09 calls for every shot to be verified and then scored by two independent reviewers before the director sees it. That loop never ran on October 15. There's no `reviews/` folder. The reason is that the schedule changed under it (chapter 10): the director chose a complete rough reel tonight over polished shots one at a time. The verifier's checks (determinism, timeline, owns) ran at every merge, and the two-reviewer pass is still ahead.

The other thing the plan got wrong was speed. The production plan assumed six weeks. At 14:18 Eric pushed back on a cautious plan for the evening: "If you look at the pace at which the codebase is going, you said this would take 6 weeks. We've only been working on it for a few hours." The orchestrator agreed the estimate was "badly off". In its words, the estimate "assumed slow, careful shot reviews, and agents build shots in under an hour." The bottleneck turned out to be the laptop, not the agents. That's chapter 8.
