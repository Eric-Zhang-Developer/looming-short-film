# Brief · spec-blob-meter

**Type:** builder (docs only) · **Wave:** 4 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/07-process-log.md` (the last two entries), `docs/02-story.md`, `docs/03-art-direction.md`, `docs/05-sound.md`, `docs/shots/README.md`, `docs/shots/QUESTIONS.md`, every `docs/shots/s01.md`–`s18.md`, `docs/contracts.md` §blob, `src/blob.js` (to see what it supports today), and watch the Act 1 preview's frames: `out/frames/000000.jpg`–`001055.jpg` (sample every 48th)

## Director decision
Quoted in the process log. In short: Act 1 is too implicit. The blob's own size becomes the readable meter of dread, the shadow stays on top as how it feels, and everything stays wordless and tasteful.

## Owns
`docs/02-story.md`, `docs/03-art-direction.md` (blob only), `docs/05-sound.md` (motif only), `docs/shots/README.md`, `docs/shots/QUESTIONS.md`, `docs/shots/s01.md`–`s18.md`, `done/spec-blob-meter.md`. Don't touch `src/` or any other doc.

## What to write
1. **A size table in the README:** the blob's radius at every shot's start and end, and at each change. Birth = today's 0.012 m (1×). It grows in steps on **avoidance beats** and peaks at about the gator's head height (around 3×) by Marston. At the s15 turn the overhead light shows its real size (the peak, far smaller than its shadow). It shrinks one step per solved problem in s16, is hamster-sized at dawn (s17) and pocket-sized in s18 (under 1×).
2. **Avoidance beats:** pick the clearest moments where he glances toward the exam (calendar, page, laptop) and looks away to something easier (phone, game night, curtains, scrolling). Give **at least three clear gulps in Act 1 and 2a** so the rule is learned. Each gulp is on a beat: a quick squash, a swell to the next size and a settle, with the eyes on him. Smaller extra steps later are fine.
3. **The birth (s02):** make it explicit. A tight insert on the calendar: the red Friday circle with the exam glyph, the ink beading on the circle, dripping off, opening its eyes, a first look to the glyph and then to him. Retime inside the shot only; don't move beat times without listing it.
4. **Shadows stay in frame:** shadow size = blob size × scale. For every shot whose blob grows, re-solve the light's position (phone, lamp or sensor) so the shadow keeps the spec's on-screen size or the size the story wants. Recompute with the README formula and state the new numbers. Any shadow that grows larger on screen because of this must be a deliberate choice.
5. **Rules:** no text, no thought bubbles, no face on the exam; growth snaps on beats (no slow morphing); the blob is never evil; it must still fit in his pocket by s18.
6. **Sound (doc 05):** each gulp plays the Exam motif's first notes, one semitone lower each time (or a better scheme), on the music box.
7. **QUESTIONS.md:** add anything genuinely open, each with options and a recommendation.

## Done note must include
- The size table, the list of gulp beats (shot, local time, size before and after) and the shrink beats.
- Per shot, what changes and whether built code needs rework.
- The code-change list: a `blob.js` size or scale parameter, if it isn't supported; score cues for the gulps; any timeline beats added.

Docs only: no renders, no headless Chrome.
