# 1 · The idea

## Before the film

The transcripts given to this chronicler for October 9 are about a different project, aimed at a different UF AI Days event. *Looming* isn't in them, and nothing about a film is. The honest start is later.

On the morning of October 14, Eric asked Claude to turn UF's Gator Create page into a Markdown note so he'd have the whole brief in one place: the rules, the four ways a project must use AI, the judging criteria and the FAQ. Claude's reply opened with a warning: "Registration closes tomorrow, October 15th, 2026." A copy of that page sits in this repo as `Gator Create Competition - Transcription.md`, committed with the spec (`309bb41`).

## 7:11 a.m., October 15

The film started as a sentence typed into a session at 7:11 in the morning (times are EDT):

> "I'm going to use AI to literally generate everything in code. I'm going to be driving you, Claude Opus 5.5, to make a story…"

Eric didn't have a story yet. What he had was a set of constraints, given one message at a time. He wanted it to be about UF and in the spirit of a Pixar short. He also wanted the hero not to be a person: "I wanted the main character not specifically to be a person." And it would be wordless: "I really do like a no-dialogue short film. I think it's high taste." Claude recommended the Visual Arts category, sub-area Narrative & Experimental Animation, which the film is entered in today.

The first pitches went wide. A bat from the Lake Alice bat house lost on campus at night. A UF love story told across decades. The 34th Street Wall as a character. A move-in day. Claude then proposed making every character a gator. That took the uncanny human out of the problem and turned Gainesville into a world. Eric said he was leaning toward an exam story, and at 7:31 Claude came back with four exam ideas. The first was marked as its pick:

> **A. *Looming*.** A gator student has a final on Friday. On Sunday a small ink blob crawls off the calendar: the Exam, almost cute. Every time the gator avoids studying, it grows.

Five minutes later Eric chose it: "I really, really like Theme A because procrastination is universal. Every Gator has experienced this." He added the idea that would become the film's spine: "the inflection point for me … is taking the first step". He also asked for "subversions" of the idea. And, almost in passing: "I definitely like looming."

## The monster becomes a shadow

At 7:37 Claude answered with a ranked list of twists. The first rewrote the film:

> **The monster is a shadow.** It's a small ink blob, and what looms is its *shadow*. Phone glow held close to his face throws the shadow huge across the walls. A desk lamp aimed straight at it shrinks the shadow back to its real size.

The same reply turned Eric's "first step" into the climax: nobody fights the monster for him, and the turning point is as small as uncapping a pen and writing his name on problem #1. Eric's verdict at 7:50: "I like this. I think it's very tasteful."

That's where the line now at the top of `docs/02-story.md` comes from: **the scary thing is always smaller than its shadow.**

## The cold read

At 7:51 the orchestrator sent the treatment to a subagent with no context, only the competition brief, Eric's original brief to Claude and the treatment. It came back in about a minute with a score of Creativity 6, Innovation 4, Results 5, Strategies 4, Impacts 5 ([doc 07, "Outside cold read"](../07-process-log.md)). "Warm but familiar." It found five problems:

- **The physics was wrong.** A desk lamp aimed *straight at* the blob makes its shadow bigger, not smaller. The fix is in the film now: the phone sits low and close, so the shadow stretches up the wall, and the lamp sits overhead, so the shadow drops to a small pool. It's real optics, and it's what lets the code compute the metaphor instead of drawing it.
- **The custodian took the hero's moment** by switching on the lamp for him. Now the hero does it himself.
- **The "it was easy" beat was missing.** Problem #1 now takes three seconds.
- **The exam-hall ending was redundant.** It was cut.
- **The irony of an AI-made film about doing the hard thing yourself.** The answer was to make the shadow a real light calculation and to keep a public director's log. That log became [doc 07](../07-process-log.md).

## Three minutes, and the look

Eric wanted five minutes for the quiet. He felt "5 minutes would give a nice amount of MA like quietness", and named the Sixth Station scene from *Spirited Away*. He also saw the cost: "But 3 minutes, honestly, is probably the smart decision." Claude's argument for 3:00 was that quiet is cheap and acting is expensive, so the film should "cut beats, not breathing room." The mom FaceTime, the bus and the girl across the table went. A home lamp beat came in. He clicks a lamp on, sees the shadow shrink, flinches, and clicks it off, so the audience learns the rule both ways before Marston.

The look came last. A subagent surveyed Eric's earlier code-built videos and recommended building on his 2D watercolor style. It warned against three.js 3D because "characters rigged in code come out looking like toys". Eric had collected eight reference videos in `reference-videos/` (gitignored), all of them made with code. At 8:16 the orchestrator sent out eight reviewers, one per video, each with the same scoring sheet. The finding, logged in [doc 07](../07-process-log.md): **none of the eight used a real cast shadow, and none held a shot longer than about 6 seconds.** Those two gaps became *Looming*'s differentiators: real shadows and stillness.

Eric picked the torn-paper look of one of those videos ("I do like a papery cutout one, like 2.5D"). Claude worked out a way around its own warning about 3D. Every cutout stays a flat paper plane, but the planes sit in a real three.js scene lit by real lights. Nothing gets modeled, and the shadows come from the renderer. The film had a medium that was itself a shadow theater.

It was 8:27. The spec came next.
