# Brief · v7-bed (s07, s08: the doom scroll, head-on)

**Type:** builder · **Version:** v7 · **Model:** given at dispatch · **Time box:** about 2 hours; committed working beats polished.
**Read first:** `AGENTS.md`, `docs/02-story.md` (Act 2, s07 and s08; the rule; Story rules), `docs/03-art-direction.md`, `docs/shots/s07.md`, `docs/shots/s08.md`, `src/shots/s07.js`, `src/shots/s08.js`, `src/shots/s09a.js` (it imports s07's exports), `src/audio/cues.js` (`REELS`, and s07/s08's cue lines), `src/characters/gator.js` and `src/characters/poses.js` (the `front` rig, as `src/shots/s10.js` uses it), `src/props/canvas.js`.
**The director's reference image:** `/private/tmp/claude-501/-Users-ericzhang-code-media-looming/62d82d89-7498-46f5-a5a8-444d136b2ede/images/6.webp`, made with an outside image generator. It's for composition only: never copy it into the repo or use it as art.

## The director, verbatim
- On v6's bed wide: "I would want it to be maybe that the blob is behind ... I'm looking forward at the gator as it's lying in bed with the screen facing behind. I'm not seeing the screen, but I'm looking towards the gator ... because then we can do some humor."
- On the reference image: "Maybe the dot is big in the foreground, while our procrastination gator is straight on, with the phone in his lap, and he's just scrolling."
- "Let's do fully head-on because we already have the kit ready." "The gator, fully from the front view, is fine. Honestly, it doesn't look like a frog." "The main joke is the Instagram Reels." No blob looking at the camera.

## What's already built (don't change it)
The sound. `REELS` in `src/audio/cues.js` plays four Reels clips out of his phone, cut hard at s07 local 0.5, 3.25, 7.75 and 10.0. s07's `FLICKS` already come from that table. The reminder's chime is at 6.25, the swipe at 7.25 and `gulp3` at 7.5. The clips are in the main checkout's gitignored `assets/raw/reels/` (see Machine and git).

## The new setup: H, head-on
A new camera, H, built as **its own staging for this angle**. It's a cheat set (a paper diorama staged for one lens), so it doesn't have to share coordinates with the side-on room:
- **Foreground right:** the blob, big and dark. It sits on the blanket near the camera, lit only from behind by the phone, so it reads as a silhouette with a thin cool rim. Its eyes face him, away from us.
- **Middle:** him, head-on, built from the `front` rig. He's **lying propped on the pillow**, not sitting up, so it's the same pose as the side-on `LIE`, and s09a's sit-up is still the decision. The blanket comes up to his chest. The phone lies flat on his chest or lap, screen up, both hands on it, and lights his face from below. It must read as a phone (a dark slab with a glowing edge), not a flashlight: the reference's hot spot pointing at the lens is the mistake to avoid.
- **Behind him:** the headboard and pillow, the nightstand (lamp off), and a wall carrying **the calendar with its red circle and the wall clock** (~1:45 in s07), at sizes that read at 1080p.
- **The joke is the deadpan.** He doesn't react to anything. On each flick (`FLICKS`), the phone light on his face **changes hue**: one colour per reel, four in all. That makes the picture cut with the sound. Avoid red, which is reserved for the exam (doc 03).
- **Face:** the front head has one painted expression. Draw numb half-lids and the blinks in code over its eyes (the front rig's `facePair` and `acting.js`). Numb and half-lidded, slack.

## s07 (48–60), new cut
| s07 local | Setup | What happens |
|---|---|---|
| 0–6.25 | H | Reels 1 and 2. Flicks at 0.5 and 3.25 (thumb and hue). On `clockGlance` (6.0), his eyes flick to the blob in the foreground, then back down |
| 6.25–7.5 | Phone insert (unchanged) | The 7-hours reminder; he swipes it at 7.25 |
| 7.5–8.5 | W (v6's wide, `CAM`/`LOOK`) | `gulp3`: the ceiling shadow jumps. This cut is how s07 shows the rule |
| 8.5–12 | H | Reels 3 and 4 (flicks at 7.75, which is inside W, and 10.0). The silhouette is bigger now: the gulp, seen from the front |

The blob's size follows the meter as now (it gulps at 7.5). In H its shadow falls toward the camera, out of frame. That's physically right, so don't fake a wall shadow there; the W cut carries the rule.

## s08 (60–70)
Replace C3 (7–10, the wide: "him small in bed, frozen") with H at 3 a.m. The phone is still on, cold, with no hue changes. **The clock behind him reads 3:00.** He wears `dread` with the sweat, and holds still. The music is out and only the tick plays. The blob's blink at 8.5 can't read from behind; move it or drop it, and say which. C1, C2 and CC (the clock, the calendar, his close-up) stay.

## s09a (70–76): no change
s09a imports s07's `CAM`, `LIE`, `bedroom()` and the rest. It must render identically. Hash three s09a times (70.5, 72.5, 74.0) before your first edit and again at the end, and they must match. 74.5 is a known order-dependent failure, so leave it out.

## Owns
`src/shots/s07.js`, `src/shots/s08.js`, s07's and s08's cue lines in `src/audio/cues.js` (only if the new cut needs a sound moved, e.g. a cut whoosh; **not** `REELS`), `docs/shots/s07.md`, `docs/shots/s08.md`, `evidence/v7-bed/`, `done/v7-bed.md`.
**Not yours:** `REELS`, `src/shots/s09a.js`, `src/timeline.js`, s02–s06 (v7-laptop and v7-fridge), s13 (v7-s13).

## Acceptance
- [ ] `evidence/v7-bed/h_first.jpg`: H at s07 2.0, full 1920 wide, rendered as soon as H stands up. Check that his face reads (lids, underlight) before you build on it
- [ ] `evidence/v7-bed/s07_sheet.jpg` (every 0.5 s, 48–60) and `s08_sheet.jpg` (60–70)
- [ ] `evidence/v7-bed/hues.jpg`: H just after each of the four flicks
- [ ] `evidence/v7-bed/preview.mp4`: 46–72 at `--w 960` with `out/audio/mix.wav` from `node tools/mix.mjs --range=46:72` (or the full mix), small, for the director to watch with sound
- [ ] s09a hashes unchanged; `node tools/determinism.mjs` at three s07 times and two s08 times; `node tools/check_timeline.mjs`; `npx tsc --noEmit -p .` clean
- [ ] `done/v7-bed.md` ending with `## Story`

## Machine and git
You're in a fresh git worktree. Before rendering, link or copy what git doesn't carry from the main checkout at `/Users/ericzhang/code/media/looming`: `ln -s /Users/ericzhang/code/media/looming/node_modules node_modules`; `cp /Users/ericzhang/code/media/looming/assets/cut/*.png assets/cut/`; `mkdir -p assets/raw/reels && cp /Users/ericzhang/code/media/looming/assets/raw/reels/*.mp3 assets/raw/reels/`. Never commit those.
One headless Chrome at a time, foreground, `--w ≤ 960` except the one full-width `h_first.jpg`, closed after use. Swap is near full and one other builder runs beside you: check `sysctl vm.swapusage` before each render batch, and if free swap is under 1 GB, wait and retry rather than pile on. Sheets and strips only; delete frames after. Commit on your worktree's branch with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge. Report your branch name and last commit at the end.
