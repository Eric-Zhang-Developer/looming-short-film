# Done · rig-v4

## What shipped
- **A neck.** The Student now has a cream throat drawn in paper, running from under the jaw into the hood, and his head sits 10 figure px higher, so the side silhouette matches the frozen sheet.
- **Gator roommates.** Both roommates are now built on the Student's own side rig. Tall is lanky, in a blue hoodie, with a yellower green. Round is stout, in a kraft hoodie, with a darker green. The heron and bear are gone.
- **An acting kit.** `src/characters/acting.js` has eight expression presets, code-drawn paper brows, seeded blinks, breathing whose rate follows the feeling, and head tilt, slump and tail. Every change gets anticipation and a minimum hold. A shot gets this only if it calls `act()`.

## Where it lives
Branch `task/rig-v4`:
- `14de224`: the neck, plus the plumbing in `buildRig` (`paper` parts and the `hoodie` tint) and the hidden `brow` part (`src/characters/gator.js`)
- `49434f1`: the roommates (`src/characters/roommates.js`)
- `65cd8d4`: `src/characters/acting.js`, and brow tuning in `gator.js`
- `f53b881`: `docs/contracts.md` §characters, new subsection "Acting (task `rig-v4`)", appended; the breath/blink strip
- `882337e`: shot frames and checks

Evidence is in `evidence/rig-v4/`: `sheet.html`/`sheet.js` (the harness page, cells by integer t), `neck.jpg`, `roommates.jpg`, `expressions.jpg`, `breath_blink_strip.jpg`, `breath.txt`, `shots.jpg`, `checks.txt`.

API: `act(rig, t, [[t0, 'dread'], [t1, 'resolve']], { breath, depth, slump, tilt, tail, blink, seed })` → `{ name, eyes, mouth }`. Call it after `blend()` and `follow()`, in place of `idle()`.

## How it was checked
- [x] **`neck.jpg`.** The columns are v3 rig | rig-v4 rig | the frozen `turn_side`. The top row is the full figure; the bottom row is a neck close-up. I also blended the figure and the rig 50/50 in scratch and checked that the head top and eye now line up. That blend was deleted with the rest of my scratch; it isn't kept as evidence.
- [x] **`roommates.jpg`.**
  - Row 1, left: tall, round and the Student standing. Row 1, right: the same three seated in s05's mashing poses.
  - Rows 2–3: s05 in the film at 35, 37, 38.5 and 39.5. The new roommates are on the couch, and the tall one walks through the shadow.
- [x] **`expressions.jpg`.**
  - Top row: neutral, numb, guilt, flinch, dread, resolve, relief and pride on the side head, then pride's first beat (eyes wide, mouth "o").
  - Bottom row: the same eight on the whole seated figure in 220 px cells, as the phone-size read.
  - The `gator_hero` close-up was **not done**: the rig doesn't load `gator_hero` (it isn't in `PIECES`).
- [x] **`breath_blink_strip.jpg`.** 6 s at 12 fps, one drawing per cell, one second per row.
  - Left gator goes dread → resolve at 3.0. The one-drawing anticipation (eyes shut) is at 2.917.
  - Right gator goes numb → relief at 3.5. Its anticipation is at 3.417, and a seeded blink falls at 1.0.
  - `breath.txt` logs both body y-scales per drawing. Dread breathes about every 1.2 s, relief about every 5 s. A 1–2% breath is only a pixel or two in the strip, so the numbers are the real evidence for breathing.
- [x] **s03, s05, s11, s15 and s18 build:** `shots.jpg` (t = 23, 38.5, 83, 112, 185).
- [x] **Determinism:** PASS at all five times, plus two `act()` frames on the evidence page (`checks.txt`).
- [x] **`check_timeline`:** `ok (21 shots, 58 beats, 195.0s)`.
- [x] **`node src/characters/acting.js`:** the self-check asserts the hold, the single anticipation drawing, the face landing on t0, pride's two beats, the short-hold error, blink spacing (3–5 s) and blink length (one drawing), and the opts override. Output: `acting: ok`.
- [x] **Done note with `## Story`.**

## Gaps
- **No shot uses `act()` yet.** That was the brief's design (opt-in). The director will only see more emotion once the shot owners add the cues.
  - `act()`'s slump leans the body up to 7° per unit, which moves the hand. Shots that pin the hand to a prop (s06, s15 lamp, s16 pen) should pass `slump: 0`.
- **The neck isn't opt-in.** The brief asked for it on the rig, so every side-Student shot changes. Its throat is a little paler and smoother than the painted cream (`neck.jpg`, bottom middle).
  - The proxy Freshman doesn't get the throat (`sideParts` `throat:` defaults to off).
- **Phone-size read, my honest call from `expressions.jpg`, bottom row:**
  - flinch, pride, relief and the slumped presets (numb, guilt, dread) read clearly.
  - **resolve and neutral are hard to tell apart** at 220 px. They differ only by the brow and the tight-line mouth, and the face sheet's `line` mouth is a hair-thin stroke.
  - numb and guilt share a body. Only their eyes (half-lid vs side-glance) separate them.
  - A bolder `line` mouth would need new face art. That is a painter task.
- **Choices where the spec was silent:**
  - I read "2–3-frame anticipation" and "12 frames" as film frames at 24 fps. Anticipation is one drawing on 2s (2 frames) and the minimum hold is 0.5 s. Both are constants in `acting.js` (`ANTIC`, `MIN_HOLD`).
  - Blinks use the face sheet's `closed` take (the content arc), the only closed eye there is.
  - Brows show at neutral too, flat. They are hidden only when `act()` isn't called.
- **Front and back rigs have no brows.** `act()` still gives them face swaps, blinks and breath. s10's front view would need a brow pair.
- **s05, which I don't own:**
  - The tall roommate's seated legs stick forward at 80° above the seat strip, as the heron's did.
  - His walk keeps s05's ±38° leg swing on shorter boots. Both feet leave the floor at contact, and I haven't measured by how much.
  - `HERON_STAND_Y` keeps its old name because s05 imports it. It now aliases `TALL_STAND_Y`.
  - `docs/shots/s05.md` still describes `roommates_sheet` and gives the old head-top heights (round 0.08). Seated, the gator roommates come out about 0.11.
- **`roommates_sheet`** stays frozen but is no longer loaded.
- **`shots.jpg` at t = 185 (s18) shows the calendar, not the gator.** It proves the shot builds, but it doesn't show the neck in s18.
- **The orchestrator's watchdog killed Chrome once during my first s05 render** (exit 144). I re-ran it and it passed. During my renders `pgrep` also showed a second headless Chrome that wasn't mine (`--remote-debugging-port=9333`). I left it alone.
- **`poses.js` is unchanged.** Nothing in it needed to change.

## Story
I started on the neck by laying the rig over the frozen side figure, 50/50, in a throwaway ffmpeg blend. It showed two things at once. The head sat about ten figure px low, and where the sheet has a cream throat sweeping from the jaw into the hood, the rig had green dome above and grey background below. Cutting a box from the figure would have dragged the hood and the dome along with it, so I drew the throat as cream paper instead.

The first trace came out a thin column. I had read the shape off the sheet's coordinates, but the rig's parts are each fitted at their own scale. Two widenings later it read as a neck. It then rendered grey, because the jaw in front of it was casting a shadow onto it. Sliding it to a hair behind the jaw fixed that (`neck.jpg`).

The roommates took a colour lesson. Navy multiplied into the painted cream came out charcoal, so the tall one's hoodie is navy pushed toward the phone cyan (`roommates.jpg`).

The acting kit's own self-check caught my first bug: no blinks at all in ten seconds. I was comparing the raw blink time against the drawing time, which is snapped earlier, so a blink was always "in the future." The next run failed again, and that time the bug was in my test, not the kit.

Then I judged the presets as the brief asked, at phone size. At that size the first brows vanished on the green head, and the full-figure row read as eight nearly identical sitters. Thicker, near-ink brows and stronger slumps fixed most of that. resolve against neutral still doesn't read, and I've said so above rather than call it done (`expressions.jpg`).

## State
built · 2026-10-17
