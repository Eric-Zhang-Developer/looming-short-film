# v9 beat sheet (2026-10-20): from the director's v8 notes, every item approved in conversation

Director, after watching v8: it "ends abruptly"; he wants a quote, then credits. The blob needs more emotion, "thought through from first principles", in No-Face's spirit and not as a copy (docs/10-submission.md, Influences). The 1:14 phone says "Tomorrow" at 3 a.m. And "a less charitable reading of this story is that this is me … logging in at 3 am and then cramming".

## What changes
1. **The ending** grows from an abrupt fade into a closing sequence: 3:30 → **3:47 (227 s)**.
2. **The blob acts.** Its eyelids, gaze and wobble carry what it feels; it gets new lid shapes in `src/blob.ts` and an acting key per shot.
3. **The grade is 85, not 94** (s17c). The cramming problem was never the clock: a 3 a.m. start that ends in a 94 says that procrastinating works. An 85 is what a 3 a.m. start honestly earns. He lets out a breath instead of grinning. The real win is the tag, where he starts the moment the date appears. 3 a.m. stays the rock bottom, and the night stays one night.
4. **"Today 9:00 AM"** on every screen after midnight.

Nothing else moves. s00–s17c keep v8's timing to the frame, and so does s18 up to its fade.

## 1 · The ending (s18's fade, then five new shots)
Paper world: cream cardstock, navy hand lettering, the lamp's warm key, the paper boil. **No red** (red marks only the exam). The music is the theme on felt piano (score.ts's `piano` voice), and it comes in under the title.

| Shot | Start | Length | What |
|---|---|---|---|
| **s18** | 190 | 20 → **21** | Unchanged until the fade, which now runs **2 s** (19–21), slow on the "1." |
| **s19** title | 211 | 2.5 | Black → cream card. ***Looming***, hand-lettered in navy. The dot of the *i* is the drop: tiny and black, and it **quivers** once (0.8) and settles. The piano states the theme's first two notes (the leaps) |
| **s20** Seneca | 213.5 | 3.5 | A fresh card: *"We suffer more often in imagination than in reality."* and under it *Seneca*. It holds and is read in silence apart from the piano's last chord ringing out |
| **s21** card A | 217 | 3 | *A film by Eric Zhang* / *eric-zhang.dev · @ericz.exe* / *Made for the AI² Gator Create Competition 2026 · University of Florida* |
| **s22** card B | 220 | 4 | *Every frame drawn in code (three.js) · score and sound synthesized in code · surfaces painted with Codex image generation · code written with Claude* / *github.com/Eric-Zhang-Developer/looming-short-film* / smaller: *Counter-Strike 2 audio © Valve · Minecraft audio © Mojang · Reels audio © its creators* |
| **s23** sting | 224 | 3 | Below |
| end | **227** | | 3:47 |

Each card cuts in on a hard cut with no transition and one card-tap from foley. The text is set in the film's hand font, not a system font, and nothing is invented: these are the director's exact strings.

**s23 · the sting (3 s).** His empty desk under the lamp at night (s18's desk and setup, his chair empty). The blob, hamster-sized (about s17's size), sits alone beside his phone, which lies face up and dark.
- **0.3:** The phone buzzes, lights by itself and a Reel autoplays: `DepVdpeJdCN`'s build, the callback to s16. The blob's eyes slide to it.
- **0.8:** The phone's low light throws the blob's shadow **springing up the wall**, huge (the light rule, one last time).
- **1.9:** The blob looks up at its own shadow. A beat: `sad`.
- **2.3:** It flips the phone face down with a squash. The Reel cuts dead, and the shadow drops back to a puddle.
- **2.5–3.0:** It looks at the camera, a slow blink. Cut to black.

The gag is that the dread has learned the lesson too. It obeys the film's rules: the blob doesn't grow, because nothing gulped. Only the shadow looms, and only while the phone's light is up.

## 2 · The blob acts
**The principle (No-Face's lesson, not his look):** while it is huge it is **blank**, a weather system with fixed open eyes, no blink and no wobble. Once he faces it and it shrinks, it becomes **shy and expressive**. How much it feels depends on how small it is.

**The vocabulary:** eyelids only (upper-lid height and tilt, a lower lid), gaze (`look`), the body's wobble and lean (`squash`), and its music-box voice in the score. **No mouth, no brows, no mask, no gifts.**

New eye states in `src/blob.ts`, beside `open`, `closed`, `worried`, `tired`, `gasp` and `side`:

| State | Lids | Reads as |
|---|---|---|
| `plead` | The upper lids tilt down toward the outer corners (inner corners high), slightly bigger eyes, gaze up | "please don't" (after each gulp, looking at him) |
| `blank` | Full open discs, no catchlight motion. The caller also sets `wobble: 0` | a force, not a creature |
| `sad` | Heavy upper lids, outer droop (deeper than `tired`) | "here we go again" |
| `shy` | A lower lid rises a third, gaze down and away | embarrassed |
| `sleepy` | Upper lids level, two-thirds down | dozing, content |

A **blink** is two frames of `closed` on 2s, a call in the shot and not a state. The `EYE_LIDS` compile gate stays: a shot that never shows a lidded eye must keep its v8 frames bit-identical, and `tools/hashes.ts` proves it.

**The acting map** (local times; the builder tunes them by eye):

| Shot | Size | The blob |
|---|---|---|
| s02 | newborn | It forms and opens its eyes. **Two slow, curious blinks**, and it looks around the calendar, then at him |
| s03 | after gulp1 | At the gulp (5.5) it squashes, then `plead` up at him as he alt-tabs |
| s04–s05 | growing | `worried` → side glances at the TV. Fewer blinks as it grows |
| s06 | gulp2 | `plead` once after the gulp, briefly; then it settles big |
| s07 | gulp3 | After the gulp, `blank`: **no blink, no wobble** from here |
| s08–s09c | huge | `blank` throughout (3 a.m., the choice). It is weather |
| s10–s10b | huge, walking | `blank`. At the threshold of the library light (s10) it is **confused**: one lid lower than the other (`side` and `look` flicking), wobble back on for the first time since s07 |
| s11–s15 | shrinking | `worried` and `side`. The expressiveness comes back as it shrinks |
| s16 | relapse, gulp4 | At the phone (6.0): `sad`, "here we go again". After the gulp, `plead` at the wall shadow. At `problemOneSolved` ("that was it?"): **`shy`**, embarrassed at how small the problem was, with a little squash. Through the montage: `open`, watching |
| s17 | small | `sleepy` → `closed`, content, dozing (as v8) |
| s17b | small | Calm `open`. One blink as the exam starts |
| s17c | small | It startles at the slide (as v8). At the 85: `side` down at it, then `closed`, a long exhale squash (relief, not pride) |
| s18 | tiny | **A slow blink** at him (three frames down, held, up) just before `blobAbsorbed` (5.5): "goodbye for now". The new drop's quiver is unchanged |
| s23 | hamster | As in the sting |

The music-box voice (score.ts) mirrors the lids at the four gulps (a falling two-note "please") and at the shy beat (one high note, quickly muted). Mix it low.

## 3 · s17c · 85
- The painted 94 on `graded_test` (art px [214, 58]) is covered with a patch of the page's own paper and replaced by a **hand-lettered red 85, circled** (red is right: it's the exam).
- **Two more red marks** on his lines, a minus and a short slash, so the lost points show.
- **The close-up:** `surprised_smile` → a small relieved smile and a breath out (the shoulders drop), **not** the `pride` grin. Use an existing face; no new head art.
- The fingertip tap at 5.25 stays: it taps the 85.
- **s18 needs nothing:** "Final" isn't a score.

## 4 · Today
The exam row and the detail screen say "Tomorrow 9:00 AM" whatever the hour. **Root fix in `src/props/canvas.ts`:** the label comes from the screen's `clock`, so any clock after midnight and before 9:00 reads "Today 9:00 AM". s09a (3:00) and s07 (1:45, if its list shows the row) change; s00, s03 and s06 stay "Tomorrow". COUNTDOWN is unchanged.

## Builders
| Builder | Owns |
|---|---|
| **v9-blob** | `src/blob.ts`, the acting in s02–s17c, s17c's 85, canvas.ts's Today |
| **v9-ending** | `src/timeline.ts`, `tools/check_timeline.ts`, `src/audio/*`, s18, the new s19–s23 |

The sting uses the eye states that exist today. After merging, I swap in the new ones (`sad`) and re-render s23 only.

## Render
The blob's shader change is gated, so shots without new lids keep their hashes. But nearly every shot gets new acting, so v9 is close to a full re-render: chunks of 6 s or less, one page per Chrome, the watchdog running and the memory gate checked. It assembles onto v8 wherever a span is proven unchanged.
