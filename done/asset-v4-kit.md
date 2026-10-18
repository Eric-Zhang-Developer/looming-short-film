# Done · asset-v4-kit

## What shipped
Three variants of the six-head close-up sheet (`closeup_heads`) and two of the wall-clock kit (`clock_kit`), all painted by Codex and screened. Best head sheet: **v1_2**. Best clock: **v1_2**. Nothing is frozen and nothing was copied into `assets/frozen/`; the director picks.

## Where it lives
- Prompts and specs: `assets/prompts/closeup_heads.v1.md`, `assets/prompts/clock_kit.v1.md`, two new rows in `assets/specs.json` (601bd99).
- Thumbs and sidecars with a screening reason each: `assets/raw/thumbs/closeup_heads_v1_{1,2,3}.{jpg,json}`, `clock_kit_v1_{1,2}.{jpg,json}`, and the two `*_contact.jpg` (87805df). Full PNGs are gitignored in `assets/raw/` of this worktree.
- Evidence, `evidence/asset-v4-kit/` (fcb9676):
  - `contact.jpg` (heads variants over clock variants), `heads_vs_hero.jpg` (best variant, each head beside the hero's head at the same scale), `heads_vs_hero_v1_{1,3}.jpg`, `phone_all_rows_v1_1_2_3.jpg` (rows = v1_1, v1_2, v1_3 at about 150 px per head on film navy), `clock_vs_calendar.jpg`
  - `islands.txt`, `sizes.txt` and `sizes_v1_{1,2,3}.json`, `gen_run_heads.txt`, `gen_run_clock.txt`
  - **Boxes for the best variants:** `closeup_heads.boxes.json` (from `closeup_heads_v1_2.png`, keys `closeup_heads_{numb,dread,resolve,relief,surprised_smile,pride}`) and `clock_kit.boxes.json` (from `clock_kit_v1_2.png`, keys `clock_kit_{face_home,face_exam,hour,minute,pin,tab,minute_spare}`). Boxes for the other variants sit beside them as `<asset>_v1_<n>.boxes.json`.
  - Tools I wrote (no Chrome, ffmpeg and Node only): `measure.mjs`, `sizes.mjs`, `compose.mjs`, `clock_radii.mjs`.

## How it was checked
- [x] **Generations.** Heads: 3 calls, 3 images (`codex_images_generated: 1` in each sidecar), 3 of 6 used. Clock: 2 calls, 2 images, 2 of 4 used. One Codex call at a time (`gen_run_heads.txt`, `gen_run_clock.txt`, both `exit 0`). Refs: heads = `gator_hero.png` then `style_tile.png`; clock = `style_tile.png`, `props_kit.png` (calendar), `exam_room_kit.png` (its clock).
- [x] **`contact.jpg`**, **`heads_vs_hero.jpg`**: made with ffmpeg, viewed by me.
- [x] **`islands.txt`**: `cut.mjs --auto --pad=0` gives **6 islands on every heads variant and 7 on both clock variants**. The relief head's breath puff is inside its island (v1_2: touching the snout; v1_3: floating a few px away but merged by cut's 4 px grid).
- [~] **Head-size match within 5%: partly.** Hero head width, measured on green pixels, is 741 px (`evidence/asset-v4-kit/measure.mjs`). The heads are painted smaller because six had to fit; the sheet scale is s = head width / 741 (`sizes.txt`).

  | variant | scale s (six heads) | spread of s | snout thickness / width vs hero | eye width / width vs hero | eye-bump rise vs hero |
  |---|---|---|---|---|---|
  | v1_1 | 0.464-0.480 | 3.4% | +4 to +10% | +9 to +12% | x2.3-2.6 |
  | **v1_2** | 0.571-0.601 | **5.1%** | +4 to +9% | +3 to +8% | x2.2-2.5 |
  | v1_3 | 0.437-0.472 | 7.5% | +2 to +3% (relief +12%) | +12 to +15% | x2.6-2.8 |

  Best variant v1_2, per head: numb s=0.601, dread 0.590, resolve 0.584, relief 0.571, surprised_smile 0.584, pride 0.583. Scaling each head by hero_W / W (that is 1/s) lands every head on the hero's width exactly, so the **width** match is fixed by per-head scale, not by the painter. The **shape** is not within 5%: relative to the hero the eye bump rises about 2.2-2.5 times as much, the snout is 4-9% thicker, and the eye is 3-8% wider. See `heads_vs_hero.jpg`: the same gator, but a rounder, taller bump and a bulbier snout tip.
- [x] **Ranking, heads** (judged on: reads its emotion at phone size, and is it the same gator):
  1. **v1_2.** All six moods read in `phone_all_rows_v1_1_2_3.jpg` (middle row). Closest eye size, attached breath puff, softest brows, torn rim like the hero. Green is brighter (sample rgb 110,160,93 vs hero 111,141,90, one pixel each).
  2. **v1_3.** Strongest brows and the closest snout and green hue, but eyes 12-15% too big, the relief head 7% smaller than its five siblings, and the puff floats.
  3. **v1_1.** Tightest sheet (3.4%) but a pinkish rim on every piece from the magenta key, the brightest green, thick square brows.
- [x] **Ranking, clock:**
  1. **v1_2.** Faces 497x494 and 496x493 px (0.2% apart), kraft rim (home) and navy rim (exam), 12 ticks with 12/3/6/9 longer, no numerals, a torn-paper rim like the calendar (`clock_vs_calendar.jpg`), hands with a round pivot end.
  2. **v1_1.** Faces 485x480 and 479x480 (1.2% apart), no visible torn rim, thinner hands.
- [x] **Done note ends with `## Story`.**

## Gaps
- **Not same-gator-exact.** The eye bump and the snout tip drift from the hero in all three variants (table above). I did not re-roll: two more variants of the same prompt would not have fixed a drift all three share, and the sheet cap is 6. A v2 prompt would need to describe the hero's bump as small and set back from the eyes, and the snout as slim to the tip. Not tried.
- **Resolution.** Heads are about 0.57-0.60 of the hero's pixel scale (v1_2), so a close-up at hero size upscales them about 1.7x. They will be softer than the hero. Not tested lit in a shot.
- **Green is off.** Heads are more saturated than the hero in all three variants (one sample pixel each, not a mean). A single colour correction at cut time would fix it; I did not grade anything.
- **The head is a stub, not a swap-ready piece.** Each head ends in a straight cut at the neck, meant to sit under the hoodie collar. `gator_hero` is a single flat image with the head already under the hood, so a swap needs the hero cut into head and body first. Not done, not in my owns.
- **Clock hands are about 1.4x too long for the dial.** The minute hand is about 270 px from pivot to tip against a 246 px face radius (`clock_radii.mjs`: face outer radius 246, rim 242-204, long tick 186-133). Scale the minute hand by about 0.69 and the hour hand by about 0.63 at rig time. The pivot is the round end, and I did not rotate anything to test setting 9:00, 1:45 or 3:00.
- **Brief asked for the exam face "a slightly different frame colour".** v1_2's exam face is navy against the home face's kraft. That matches `exam_room_kit`'s clock, but is more than "slightly".
- Two extra clock pieces beyond the brief's list: `tab` (a hanging tab) and `minute_spare`. I asked for them in the prompt to give the cutter a spare; they cost nothing, ignore them if unwanted.
- The `relief` head in v1_2 shows an exhale puff; the brief said "a soft exhale". Whether a puff or a parted mouth is the right read is the director's call.
- `eye_w` is `null` in `sizes.txt` where there is no cream disc (closed eye) or where my flood-fill seed could not isolate one. Those rows have no eye comparison.

## Story
I began by reading what the heads had to match. The hero looked like a single flat PNG; flattening it over white showed a muted olive green (rgb 111,141,90) and a head that sits half under a hood. That told me what to ask Codex for: whole heads with a cut-off neck, no hoodie, and the brows as new dark-green strips, because the hero has no brows at all.

The heads came back first try and all three read: sweaty dread, a closed-arch relief with a puff of breath, a toothy pride grin. So I assumed the hard part was done. It was not. The first measurement said 0.69 for snout thickness against the hero's 0.35, which was nonsense: Codex had returned an opaque PNG on a magenta key, so my script saw a full-height column everywhere. After keying the magenta out, the snout matched to a few percent, but the eye bump did not, and I only noticed that when I put the heads beside the hero in `heads_vs_hero.jpg`. The bump is 2 to 3 times as tall in every variant.

I ranked on two things, the way the brief says. v1_3 had the closest snout; v1_2 had the closest eyes and the relief puff stuck to the nose. I picked v1_2 because eyes carry the emotion, and I wrote down that the drift is shared by all three rather than hide it.

The clock was routine: both variants have twelve ticks and no numbers. The one surprise was that the hands are far too long for the face, which I only saw once I measured the radii.
