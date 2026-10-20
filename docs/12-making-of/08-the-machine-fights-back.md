# 8 · The machine fights back

## One laptop

Everything in *Looming* runs on one laptop with 16 GB of RAM: the orchestrator, every subagent, every Codex call and every render. Doc 09 planned for it from the start. "Code-writing subagents: at most 4–6 at once … The ceiling comes from 16 GB of RAM while several shots render." Full-film renders were to run "one at a time, never during a shot wave."

The plan was right about the ceiling and wrong about where it was. Agents turned out to be fast. The machine is what slowed the film down.

## Why rendering is heavy

Every frame of *Looming* is a three.js page drawn by headless Chrome, driven by `render.mjs`. Builders don't just write a shot. They render it, sometimes many times, to prove it:
- contact sheets of the key moments
- motion strips
- determinism runs that draw the same moment twice and compare hashes
- measurement pages that back-project shadow pixels onto the wall to check that a 4.2× loom really is 4.2×

Each of those opens a Chrome. Each Chrome has a GPU process. With five builders working on the animatic at once, that added up quickly.

## The first disk-full

At 12:43 the orchestrator stopped everything with a message that began "🚨 **Blocker: your disk is full.**" Every shell command was failing with "no space left on device". It couldn't merge, render "or even run `df`". It had sent the v3 style-tile merge just as this hit and couldn't tell whether any of it had run. Two builders had hit `ENOSPC` mid-render. The state commit at 12:48 drew the line that mattered: "the cause is outside the repo" (`ff0aeb9`). The builder ceiling dropped to 3.

Eric freed space himself. At 13:00 he wrote, "ok there should be space on the disk now." `NOW.md` recorded 5.2 GB free, and the orchestrator went straight back to five builders (`991e9ce`, 13:01). Nobody yet knew what had filled the disk.

## "my ram is dying"

At 13:32 Eric sent the day's most urgent message:

> "kidna urgent but my ram is dying atm and you are taking up 19 gb of ram"

Three minutes later the orchestrator had an answer and had acted on it. Free memory went from 32% to 56%. The culprit wasn't the orchestrator itself but "the headless Chrome windows the builders open to render frames. Each one's GPU process was holding 3–6 GB, about 14 GB in all." One was an orphan: a measuring script from s14 whose builder had already moved on, still holding 5.5 GB. It was killed. The s17 builder and its 6 GB render were paused, with its work kept in its worktree.

The new rules went into the state commit (`65c9e9e`):
- at most 3 builders
- one Chrome per builder at a time, closed when finished
- measurements at lower resolution
- a check for orphaned Chrome processes before every batch

The commit message also gives the reason in one line: "Fewer builders is slower but the machine is the director's to use too." The same report admitted a slip, mentioned in chapter 3. A stray message briefly woke the finished s12 builder, and it was stopped at once with no change.

## The second disk-full, and the cause

At 13:38 the disk filled again, and this time the orchestrator traced it:

> "The builders' headless Chrome renders used so much RAM that macOS wrote **13.8 GB of swap** to the disk. That's what filled it both times."

The two problems were one problem. Chrome's GPU memory pushed the system into swap, and the swap file grew until the disk ran out. Only about 170 MB was free. Everything stopped, and all builders were paused in their worktrees. The rule became stricter still, and it's now in `NOW.md` as **hard machine rules**:
- at most **2** builders
- one headless Chrome per builder, foreground only
- evidence renders at 960 px wide or less
- before every batch: `df -h /`, `sysctl vm.swapusage`, and `top -o mem` for orphaned `Google Chrome Helper` processes

The pressure changed how work was done, not just how much ran at once. The face-sheet painter built its on-head composite "in Node and ffmpeg, with no headless Chrome" (`done/asset-face-sheet.md`, on the unmerged branch `task/asset-face-sheet`). The orchestrator noted that it "uses no Chrome, so it stays light on RAM." `contract-timing` counted its 681 wrong frames from the timing arithmetic rather than rendered strips, and wrote down why: "no renders; disk" ([`done/contract-timing.md`](../../done/contract-timing.md)).

## The other limit

Besides RAM and disk, the session had a usage limit. Around noon it ran out mid-batch, and the work stopped until it reset (`6fd1271`). After that, `NOW.md` told the orchestrator to check usage before every batch. At 14:43 Eric's update on the deadline began: "Updates for you, and also our session limit is almost reached. sadly."

## Rendering the film on a full machine

The two-builder ceiling shaped the end of the day. When the director decided at 14:17 to aim for a complete reel that night, the orchestrator named the constraint: "The real limit now is your machine: two builders at once is what keeps RAM and swap safe." The last five shots were rebuilt for the motion-sensor lights between 14:26 and 14:45, under that ceiling.

The full render itself needed care:
- **A leaner encode.** At 14:45 the orchestrator reported switching to one "partway through because the original one would have nearly filled the disk", and set the render to delete its temporary frames afterwards.
- **The squeeze again.** When that render died at s06 ([chapter 10](10-rough-first-then-final.md)), it checked the machine before trying again: "Swap is still at 16 GB and only 677 MB of disk is free, which is the same squeeze that filled the disk twice before."
- **A light check first.** Instead of re-running the whole film to find the next crash, it rendered one frame from each of the 18 shots in a single small Chrome at 320 px (`evidence/v1-render/one-per-shot.jpg`).
- **Chunks.** The restarted render logs its progress in chunks, each with the free disk space next to it (`out/v1_render.log`: "== chunk 0:36 free 1729 MB").

The plan for the final film is written around the same limit. The 4K master is scheduled to render "overnight Sat→Sun, with nothing else running" ([doc 11](../11-roadmap.md)). This chapter was written by a docs-only subagent under the same rule: no Chrome and no renders while the film renders.
