# Done · v7-fridge

Written by the orchestrator from the builder's hand-back: the builder stopped while waiting for swap and handed back before writing this note, the preview and `shadows.txt`. Everything below is from its report and its commits, plus the orchestrator's own look at `sheet.jpg`.

## What shipped
s04 is the fridge loop: he opens the fridge, stares, shuts it, walks off and comes back, three times; the third open holds to the cut. The fridge light is keyed to the door, so the blob's shadow springs onto the cabinets on each open and is gone on each shut, and it is bigger each time (the blob scoots nearer the light in the dark). Each open and each shut is one identical sound built from existing foley.

## Where it lives
`src/shots/s04.js`, s04's lines in `src/audio/cues.js` (`533095b`); `docs/shots/s04.md` (`d73a2f6`); `evidence/v7-fridge/`.

## How it was checked
- [x] `evidence/v7-fridge/sheet.jpg`: every 0.25 s over 26–33. The orchestrator looked at it: three opens, dark gaps with him turned away, the shadow larger on each open.
- [x] `evidence/v7-fridge/shadows.txt`: 11.2 → 12.8 → 14.9 cm (4.14 / 4.76 / 5.39 units), growing; copied from the builder's run of `measure.mjs`, not re-run.
- [ ] `evidence/v7-fridge/preview.mp4`: **not made.** The assembled v7 master covers it.
- [x] `node tools/determinism.mjs --t=26.5,28.25,31.5` → PASS (`determinism.txt`)
- [x] `node tools/check_timeline.mjs` → `ok (22 shots, 77 beats, 204.0s)`; `npx tsc --noEmit -p .` clean
- [x] `node tools/mix.mjs` → −16.0 LUFS, −5.2 dBTP; `node src/audio/selftest.js` all ok

## Gaps
- Nobody has listened to the door sounds; `paperSlide` 0.4 and `cardTap` 0.8 were set from stem peaks only.
- The units run 4.14 / 4.76 / 5.39 against the spec's 4.0 / 4.5 / 5.2; the marks and light weren't changed.
- The blob is 1.5× (`METER.gulp1`) as the code already had it, not the brief's 1.25×. Recorded in the spec.
- The shot opens on two dark drawings so the first open shows the light coming on (the brief suggested 0.0).
- The builder started one batch under the 1 GB swap floor (875 MB free).

## Story
The brief asked for the oldest stalling move there is: open the fridge, look, close it, come back, look again. The builder replaced the jar-sorting with exactly that, and tied the fridge light to the door's angle so the two can't drift: the light is on whenever the door is off its seal. That made the light rule do the comedy's timing for free, since every open throws the shadow back up the cabinets, a little bigger each time, because the blob creeps toward the light while the kitchen is dark. One wrinkle came from the staging: on the first walk-off his body hid the blob, so the blob's first scoot waits until he has walked back past the stool. The work stopped short of its paperwork. The machine's swap stayed under the floor the brief sets for starting a render, the builder waited, and it was asked to hand back before the preview or this note existed. The sheet it rendered is the proof that the loop reads.

## State
built (partial evidence) · 2026-10-19
