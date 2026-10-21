# v11 beat sheet (2026-10-20): the blob's size tells the story, approved by the director ("agreed alright now lets get v11 out")

Director, after v10: "I want to make the blob start smaller and get a lot bigger. It should be taller than the [gator]. It should be massive as we're going to the library … Every moment of procrastination, the blob should get bigger. I know the shadow is supposed to be smart and whatnot, but look, again, it's a matter of legibility."

## The problem, in numbers
- **It starts as a creature, not a drop.** v10's blob is born at r 0.012: 2.4 cm across, 30% of his height.
- **It grows on only three of five procrastination moments** (s03 alt-tab, s06 the laptop again, s07 the Reels). The fridge (s04) and game night (s05) don't feed it, so "procrastinating feeds it" is never stated cleanly.
- **It peaks shorter than he is.** At 2.5× (r 0.030) it is 6 cm tall against his ~9.6 cm. The menace lives in the shadow alone, and on a phone you read the body, not the wall.

## The fix: a drop that every act of avoidance feeds, until it towers over him
**One gulp per act of procrastination.** The rules are unchanged:
- It grows only by gulps and shrinks only by solves.
- It is blank while huge (v9's acting map).
- The shadow still looms by the light rule. The body now says the same thing.

| Shot | Moment | Gulp beat | r after | × v10's birth | Height vs. him |
|---|---|---|---|---|---|
| s02 | birth | | **0.005** | 0.4× | a drop (about 1 cm) |
| s03 | alt-tab to the game | `gulp1` (as now) | 0.010 | 0.8× | |
| s04 | the fridge | **`gulpFridge`** (new) | 0.015 | 1.25× | |
| s05 | game night | **`gulpGame`** (new) | 0.022 | 1.8× | |
| s06 | the laptop again | `gulp2` (as now) | 0.030 | 2.5× | v10's peak, reached by 0:47 |
| s07 | Reel 1, 2, 3 | **`gulpReel1`–`gulpReel3`** (new, on the flicks) | 0.036 → 0.042 → 0.048 | 3× → 4× | about his height |
| s07 | the gulp after the clock glance | `gulp3` (as now) | **0.054** | **4.5×** | **taller than him** (10.8 cm) |
| s08–s15 | 3 a.m., the choice, the door, the walk, the library | | 0.054 | 4.5× | towering |
| s16 | the relapse | `gulp4` (as now) | 0.060 | 5× | the biggest it ever is |
| s16 | solves 1–5 | (as now) | 0.018 → 0.012 → 0.0085 → 0.0065 → 0.005 | 1.5× → 0.4× | the first solve is the biggest drop |
| s17 on | | | 0.005 → (as now) | | unchanged |

**"Taller than him" must read in a single frame.** In at least s08 or s09a, s09b, s09c and s10b, a frame shows both of them whole, and the blob's top is clearly above his head. Where the set cuts it off (a ceiling, a doorway), that is the point: let it be cut off, and let it squash to get through the door in s09b.

## What doesn't change
- Shot lengths, beat times and the edit: the runtime stays 3:48.
- s17 onward (it is already 0.4× there), the ending, the credits and the sting.
- The acting map, the eye states and the light rule.

## Builders (disjoint files)
| Builder | Shots | Notes |
|---|---|---|
| **v11-home** | s02, s03, s04, s05, s06 | new beats `gulpFridge` (s04) and `gulpGame` (s05) |
| **v11-night** | s07, s08, s09a, s09b (and `bedroom()` in s07.ts) | new beats `gulpReel1`–`3` on the Reel flicks |
| **v11-walk** | s09c, s10, s10b, s11, s13, s15 | the walk and the library at 4.5× |
| **v11-relapse** | s16 | 4.5× → 5× → five solves to 0.4× |

Each builder re-stages and re-frames its own shots so the new size reads. Cameras may move. Timing may not.
- **Audio (orchestrator, after merge):** each new gulp beat gets the swallow (`inkDrip`) and the score's falling two-note gulp.

## Render
Nearly everything from s02 to s16 re-renders: v10 0–9 and 168–228 are reused, and 9–168 is rendered in chunks of 6 s or less, one page per Chrome.
