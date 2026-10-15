# 9 · The dread meter

## "do you have any video for me to review"

For most of October 15 the director saw *Looming* as stills: contact sheets, style tiles, gator sheets and one-frame strips. The orchestrator had been merging shots for two and a half hours, each one checked against its spec down to shadow widths in millimetres. At 13:40 Eric asked the obvious question: "do you have any video for me to review or take a look at?"

There wasn't one. The orchestrator started one at once: Act 1, 0:00 to 0:44, shots s01 to s06, with temp sound. It arrived at 13:53 as a 3.5 MB 720p file, `out/preview_act1_720p.mp4` (local, not in git). The message said what to judge and what not to: "The art is all placeholder, so judge timing, framing and the shadow story." Its loudness measured −16.3 LUFS, with peaks at −1.7 dBFS.

## What the director saw

Nine minutes later, at 14:02, Eric's note came back. It's the first time anyone had watched the film as a film:

> "Okay, now, a few things: I think the blob should get bigger, but it's still the main... I don't know. I want you to hear thoughts on this because I think the blob should be a very easy visualization for this. I know the shadow is really elegant, but I think there's a lot of stuff going on in the first act that you can't really tell from subtext. I think we need to make things a little bit more explicit. While still remaining tasteful"

The orchestrator agreed: "You're right, and I can see it in the preview." It named three things a viewer who didn't know the story would miss in Act 1:
1. **That the blob is the exam.** "It's born from a millimetre-sized drop on a small calendar in a wide shot. Nothing on screen links it to the circled Friday." The s02 builder had already measured it: the birth is about 20 pixels at full frame.
2. **That it grows because he avoids it.** "The blob itself never changes. Only its shadow does, and shadow size depends on where the light sits. So it reads as a lighting effect, not as dread building."
3. **Cause and effect.** "Nothing ties 'he looked away' to 'it got worse'."

The second point is the uncomfortable one. The film's central idea, a real shadow computed by real light, was working exactly as specified. And because it was physically correct, it read as lighting rather than as feeling. An audience sees a shadow change size and thinks the light moved.

## Size for the problem, shadow for the feeling

The orchestrator's proposal kept the shadow and added a second, simpler signal under it, **the blob's own size**:
- **An explicit birth.** A tight insert: ink beading on the red circle around Friday, next to the exam glyph. It drips off, opens its eyes, looks at the glyph, then at him.
- **One step bigger for every avoidance.** He glances at the calendar or the page, looks away to the phone, the game or the curtains, and the blob *gulps* and swells, on a beat, with the Exam motif a little lower each time. "After the second time the audience knows the rule and starts predicting it."
- **The shadow stays on top.** "The blob's size is how big the problem really is; the shadow is how big it feels."
- **One step smaller for every solved problem,** which s16 already showed.

It came with guardrails: no text, no thought bubbles, no face on the exam paper, growth only as quick squashes on musical beats, "It stays cute, never evil." It also came with the counterargument against itself. The line "the scary thing is always smaller than its shadow" had been elegant partly because the blob stayed tiny, and letting it grow weakens the literal claim. The orchestrator judged that the gap between blob and shadow would still carry the theme, and that readability mattered more.

Eric, at 14:03: "agree I like those changes". Doc 07 has the entry "The blob's size becomes the dread meter".

## The meter, in numbers

`spec-blob-meter` (`a10a29b`, merged 14:33) turned the idea into a table every shot can read ([`done/spec-blob-meter.md`](../../done/spec-blob-meter.md), `docs/shots/README.md` §1):
- **Birth:** a radius of 1.2 cm.
- **Five gulps:** in s03, s04, s06, s07 and s11, at 0:18.5, 0:26.5, 0:40, 0:53 and 1:17. The blob grows to 1.25×, 1.5×, 1.75×, 2× and finally **2.5×**, the peak at Marston, where its eyes are level with his at the desk.
- **Shrinking:** one step per solved problem in s16, down to 0.42×, small enough for his pocket.
- **Shadows keep their size.** Every shadow keeps its spec size, measured in birth units, by moving the light or the desk as the blob grows.
- **Rules:** growth comes only from gulps, with no slow morphing. "It's never evil (no mouth, no teeth, no lunge)."

[Doc 05](../05-sound.md) gave it a sound. Each gulp plays the first two notes of the Exam motif, one semitone lower than the last, "so the ear hears the same creature getting heavier." Each solved problem answers with the same two notes falling, one semitone higher each time. [Doc 02](../02-story.md) now has a section of its own under the visual rule, "The meter": "Every time he looks away, it grows. Every problem he solves, it shrinks."

None of this is in tonight's reel. The spec was written so it "never moves a beat time or a cut", which keeps the rough draft and the final film aligned frame for frame for the planned side-by-side ([chapter 10](10-rough-first-then-final.md)). The code changes for each shot are listed in the done note. They land after the director's notes on the full reel.

## What watching changed

Three minutes after agreeing to the meter, Eric asked a bigger question: "Do you think, for the film, that we should do a rough 3-minute pass, and then I'll take a look at it?" The orchestrator's answer started from the day's evidence:

> "Your three biggest calls came from looking at real footage or real places, not from specs: no lamps at Marston, the blob as a dread meter, and the gator's appeal. Each one forced rework on shots I'd already measured to the millimetre."

That's the turn in how the film gets made. The next chapter is what happened when the director's question met the real deadline.
