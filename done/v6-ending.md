# Done · v6-ending

## What shipped
s18's tag (local 14.5–20.0) is rewritten. He looks straight at the new drop from 14.5 and doesn't look away. It quivers, never grows, and its shadow is a small dot under it. He uncaps on 16.5 as before, then half-stands and holds the nib out beside the drop. The drop opens its eyes, blinks once (17.25), and hops in a small arc onto the nib (17.42 → 17.75, stretched in the air, squash on landing), then sinks into the nib by 18.0. As it lands he gives a wide smile (the smile take at 1.9 × 1.7) and holds it to the end. He sits and writes "1." on his sheet in the drop's ink: near-black with a pale highlight, not the pen's navy (18.42–18.83). Then the existing fade, 19–20.

## Where it lives
- `src/shots/s18.js`, `src/audio/cues.js` (two lines). Commit `96e15da` on `task/v6-ending`. This note is in the next commit.
- Evidence is in `evidence/v6-ending/`.

## How it was checked
- [x] `evidence/v6-ending/strip.jpg`: every 4th frame from 185.0 to 194.833, plus the last frame 194.958 (61 frames, full 1080p frames scaled to 320 px).
- [x] `evidence/v6-ending/beats.jpg`: the look 190.3, the hop 192.58, the landing 192.75, the smile 193.3, the stroke 194.2 (full frames at 640 px).
- [x] Close crops (1080p crops): `beats_drop_crop.jpg` (the look, eyes open at the nib 192.17, the blink 192.25, mid-hop, landing, on the nib), `dot_crop.jpg` (the shadow dot at 189.6 and 191.0), `stroke_crop.jpg` (the "1." coming out of the nib at 193.5–194.2). `before.jpg` is the old tag, for comparison.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 70 beats, 195.0s)`
- [x] `node tools/determinism.mjs --t=189.5,192.0,193.5` → all PASS (`checks.txt`).
- [x] `npx tsc --noEmit -p .` → clean.
- [x] s18 before 12.0 is unchanged. Determinism hashes at 176 and 182 are the same with my change stashed and applied (`checks.txt`).
- Cue lines added (`src/audio/cues.js`, after the tag's `penUncap`):
  - `{ beat: 'tagPenUncap', offset: 1.25, sound: 'inkDrip', gain: 0.3, seed: 32 }`: the plip on the landing.
  - `{ beat: 'tagPenUncap', offset: 1.917, sound: 'penStroke', dur: 0.42, gain: 0.45, seed: 6 }`: the "1.".
  - **Not listened to:** I didn't run the mix.

## Gaps
- **He stands to make the offer (half up, out of the chair).** The brief says "holds the nib out near the drop". The "Final" cell is about 3 cm beyond his seated reach, so a seated version would mean a long hop across the lamp. I picked the standing reach. It rhymes with his standing up for the X at the start of the shot.
- **The smile is on the wide, not a painted close-up.** It's the rig's `smile` mouth scaled 1.9 × 1.7, held from 17.75 to 20.0 (1.25 s before the fade starts). It reads in `beats.jpg` at 640 px, and as a clear grin in the strip's 320 px tiles. It's a bigger version of the same drawing, not a new expression: the brows and eyes stay `relief`/`open`.
- **The dot shadow is a decal** (as before), a soft oval just under the drop. In the crops it reads as a dot. At 400 px it is only a couple of pixels.
- **The gloss on the "1." doesn't show at film size.** The highlight is drawn, but at 400 px the mark reads as plain black. It is clearly black against the pen's navy elsewhere.
- The nib moves along the stroke by a small fixed offset (3 mm left, 4 mm up → 0). His arm doesn't write. The hand is still while the pen slides.
- The cap is set down on the desk in one drawing at 16.83 (a pop, on 2s), so it doesn't float by the drop.
- While he stands, his body hides the lamp shade in W. The lamp's pool on the desk is still there.
- The ink's anchor comes from one dry run of `update(T_MARK)` at build. If anyone retimes the mark keys, the anchor follows on its own.

## Story
The old tag had the drop just sitting there while he uncapped, so the first question was simply where the nib could meet it. I worked it out from the desk's numbers in s02.js, and it didn't fit: the "Final" cell is about 3 cm past anything his seated arm can reach. So he half-stands, the way he did for the X at the start of the shot. The first render of that got the hop's distance wrong. The nib was right on top of the drop, there was nothing to hop, and his free arm stuck straight up past the calendar. Moving the nib a centimetre off and dropping the far arm fixed both.

Two bugs taught me things. The ink "1." didn't appear at all after I moved it, so I logged the nib's position on the sheet: it was at u = 1.02, just past the paper's right edge. The old mark was drawn at the spot the hand was aimed at, not where the nib ended up, so it only showed once he lifted the pen. Now the stroke is anchored wherever the nib really touches. The second bug was a whole-frame darkening at 190 that I first blamed on the curl. It was a `scale.set` that one of my sed edits had folded into a comment, leaving a one-metre shadow plane over the room.

The shadow dot was hiding inside the drop at first, because the blob's origin is its centre, not its foot. Once I tucked it under, it read: a little oval under a drop that isn't growing.

## State
built · 2026-10-18
