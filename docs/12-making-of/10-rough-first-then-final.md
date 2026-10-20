# 10 · Rough first, then final

## The question

At 14:06 on October 15, three minutes after agreeing to the dread meter, Eric asked how the film should be made from here:

> "Do you think, for the film, that we should do a rough 3-minute pass, and then I'll take a look at it? Like the first rough draft, and then I'll give a bunch of design decisions. What do you think is the best way to author this?"

The orchestrator said yes and admitted what it had been doing wrong. It had treated the animatic gate "as a destination, polishing shots one at a time," when the day's biggest decisions had all come from the director watching something real ([chapter 9](09-the-dread-meter.md)). The new way to work: build the story reel first, all 18 shots to a rough bar with temp sound, and put the art in after the story is locked. The brief for that bar went out at 14:18 (`1c6dbf4`).

At 14:07 Eric added a second request. He shared the competition's submission form and asked for Markdown answers that Claude would "keep updating … as we go." That became [`docs/10-submission.md`](../10-submission.md) (`1f63b15`). Updating it after every merge or decision is now a standing duty in `NOW.md`. Drafting it surfaced a constraint: the form caps each file at **10 MB**, about 440 kbit/s for a three-minute film.

## The deadline was tonight

The spec had been written at 8:30 on the assumption of "6+ weeks" ([chapter 2](02-spec-before-code.md)). Nobody had checked. At 14:10 Eric wasn't sure whether the evening's submission was the entry or just a sign-up. The public Gator Create page gave one date, "Registration closes October 15th, 2026", and named nothing after it.

Eric asked Claude to look inside ProposalSpace. Claude opened the site in a browser but couldn't type his password for him, so he signed in himself. Claude committed to read only, and to show him anything before it was entered or saved. At 14:17 it reported what the account said: **"Submission Deadline: Thursday, October 15, 2026 at 11:59 PM EDT."** It told him to assume that night's upload was what would be judged.

What existed at that moment, by the orchestrator's count:
- a 44-second Act 1 preview
- 14 of 18 shots blocked on placeholder art
- the style tile and the gator frozen
- a public repo with the decision log and the UF research

The motion-sensor turn (s14–s18) and the dread meter weren't built yet. The orchestrator recommended a full 3:00 story reel that night, with a fallback.

Eric's answer to the caution:

> "Don't worry about it. If you look at the pace at which the codebase is going, you said this would take 6 weeks. We've only been working on it for a few hours."

He decided to phone the organisers, and the orchestrator drafted a short script for the call.

## "Really, really satisfying"

Before the call was resolved, at 14:23, Eric reframed the whole schedule:

> "Not going to lie, I feel like having a shitty rough draft, fully fleshed out, and then doing a final compared to the final polished version will be really, really satisfying."

The orchestrator gave three reasons to adopt it, and the first became the roadmap's opening argument. "It's the film's own thesis. The first step is small and ugly and still the thing that matters. The rough cut is the production's 'write your name at the top of the page'." ([doc 11](../11-roadmap.md)). The plan only works with one rule: **the rough and the final share one timeline.** Beat times and cut points freeze after the rough draft, except by the director's notes, so the two versions can play side by side frame for frame on competition day. That's why the dread-meter spec was written to move no beat and no cut.

Three more decisions came within three minutes, each logged in [doc 07](../07-process-log.md):
- **The roadmap itself** (`85983a6`, 14:24).
- **YouTube as the main release.** "You don't have to do the under 10 MB. I'm going to upload it on YouTube in full quality. We should do one, like a compressed one, just in case." (`23edb83`)
- **Final fidelity.** "The final version should be as high fidelity as possible." That means a 4K master (`4121d41`).

The paste-ready answers for that night's form were frozen at 14:32 as [`docs/10b-submission-oct15.md`](../10b-submission-oct15.md). Its synopsis describes the upload as "the film's own first step: a complete rough draft on the final timeline, with placeholder art."

## The final is Sunday

At 14:43 Eric came back from the call with the facts, and the state commit records them (`6085dc8`): that night needed only an incomplete draft, and **the final is due Sunday, Oct 18, at 11:59 PM**, with a YouTube link and the GitHub repo allowed. Doc 07 adds the size of the field: "About 70 proposals are in progress and 30–50 submissions are expected." The roadmap was compressed to fit:
- **Friday:** the director's notes (story lock), the face-sheet pick and the rig refit.
- **Saturday:** final art, with sets painted from the UF reference.
- **Saturday night into Sunday:** the 4K render, overnight.

Meanwhile the last five shots landed on the motion-sensor lights: s15 at 14:26, s16 at 14:29, s14 at 14:31, s17 at 14:43 and s18 at 14:45. At 14:45 the state commit read "s18 merged, all 18 reel shots in; full render started" (`0a912fb`). The film existed from first frame to last, about seven and a half hours after its first sentence.

## Standing down, and starting this record

At 14:46 Eric asked the orchestrator to stand down its agents, "with the last task b eing presenting me v1_animatic". It reported no subagents running, the loop stopped, its browser tabs closed and everything pushed. It had left one worktree on purpose: the face sheet awaiting his pick.

Three minutes later Eric asked for something new:

> "I really want the agents and subagents to document their stories in kind of narrativity-ish ways in the markdown. I think that would be really helpful for telling the story afterwards of how this was created, such as the audio."

And a minute after that:

> "Also, I think you should include our story, really, from the first day. … I think that would be very helpful for telling the story to the judges. As well as to myself"

The commit that answered him (`c82ae7c`, 14:57) explains the change: "Done notes were checklists, which prove a task but can't be read aloud." Every done note now ends with a `## Story` section, and a docs-only Chronicler weaves them into this folder after each wave. This chapter, and the nine before it, are the first time that happened.

## The render

The render started at 14:45 didn't finish. At 14:52 it stopped at about frame 864 of 4,320 with an error in s06, the home lamp shot (`out/v1_render.log`). The motion-sensor rewrite of s15 had removed the desk-lamp measurements that s06 was still borrowing ([chapter 7](07-marston-has-no-lamps.md)). Every shot had passed its own checks, and only the whole film rendered end to end exposed it.

The fix landed at 14:57 (`993b169`). It was checked with one frame from each of the 18 shots (`evidence/v1-render/one-per-shot.jpg`) and a timeline check: "ok (18 shots, 41 beats, 180.0s)". The render restarted in chunks of about 30 seconds of film, logging free disk space as it went. At 15:05 it was working on the chunk from 1:06 to 1:36, with about 2.6 GB free.

When this chapter was written, `out/v1_animatic.mp4` didn't exist yet, the `v1-animatic` tag hadn't been made, and nothing in the repo records whether the evening's draft was submitted. Those are the next lines of this story, and they belong to whoever writes the next edition.
